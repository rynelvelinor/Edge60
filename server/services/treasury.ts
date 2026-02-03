import { ethers } from "ethers";
import { Address, Match, PlayerStats, LeaderboardEntry } from "../../types";

/**
 * Treasury Service
 *
 * Handles:
 * - Match outcome recording
 * - Player statistics
 * - Leaderboard management
 * - Arc treasury contract interaction
 */
export class TreasuryService {
  // In-memory storage (use database in production)
  private matchHistory: Map<string, MatchRecord> = new Map();
  private playerStats: Map<Address, PlayerStats> = new Map();
  private leaderboard: LeaderboardEntry[] = [];

  // Contract interaction (placeholder for Arc integration)
  private provider?: ethers.Provider;
  private treasuryContract?: ethers.Contract;

  constructor() {
    this.initializeContract();
    console.log("Treasury Service initialized");
  }

  private async initializeContract(): Promise<void> {
    // In production, connect to Arc network
    const rpcUrl = process.env.ARC_RPC_URL;
    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      // Initialize contract with ABI and address
    }
  }

  // ============ Match Recording ============

  /**
   * Record a completed match
   */
  async recordMatch(
    match: Match,
    winner: Address,
    payout: bigint,
    rake: bigint
  ): Promise<void> {
    const record: MatchRecord = {
      matchId: match.matchId,
      playerA: match.playerA.address,
      playerB: match.playerB.address,
      stake: match.stake,
      winner,
      payout,
      rake,
      gameType: match.gameType,
      playerAScore: match.playerA.score,
      playerBScore: match.playerB.score,
      duration:
        (match.completedAt || Date.now()) -
        (match.startedAt || match.createdAt),
      timestamp: Date.now(),
    };

    this.matchHistory.set(match.matchId, record);

    // Update player stats
    await this.updatePlayerStats(
      match.playerA.address,
      winner === match.playerA.address,
      match.stake,
      payout
    );
    await this.updatePlayerStats(
      match.playerB.address,
      winner === match.playerB.address,
      match.stake,
      payout
    );

    // Update leaderboard
    this.updateLeaderboard();

    // In production, record on Arc treasury contract
    if (this.treasuryContract) {
      try {
        // await this.treasuryContract.recordWin(winner, payout);
      } catch (error) {
        console.error("Failed to record on-chain:", error);
      }
    }

    console.log(`Match recorded: ${match.matchId}, winner: ${winner}`);
  }

  /**
   * Update player statistics
   */
  private async updatePlayerStats(
    address: Address,
    won: boolean,
    stake: bigint,
    payout: bigint
  ): Promise<void> {
    const stats = this.playerStats.get(address) || {
      totalWins: 0,
      totalLosses: 0,
      totalVolume: BigInt(0),
      totalWinnings: BigInt(0),
      winRate: 0,
      skillScore: 1000, // Starting ELO-like score
    };

    if (won) {
      stats.totalWins++;
      stats.totalWinnings += payout - stake;
    } else {
      stats.totalLosses++;
      stats.totalWinnings -= stake;
    }

    stats.totalVolume += stake;

    const totalGames = stats.totalWins + stats.totalLosses;
    stats.winRate = totalGames > 0 ? (stats.totalWins / totalGames) * 100 : 0;

    // Update skill score (simplified ELO)
    const kFactor = 32;
    const expectedScore = 0.5; // Assume equal opponents for now
    const actualScore = won ? 1 : 0;
    stats.skillScore += Math.round(kFactor * (actualScore - expectedScore));

    this.playerStats.set(address, stats);
  }

  /**
   * Update leaderboard
   */
  private updateLeaderboard(): void {
    const entries: LeaderboardEntry[] = [];

    for (const [address, stats] of this.playerStats) {
      if (stats.totalWins + stats.totalLosses < 3) continue; // Minimum games

      entries.push({
        rank: 0,
        address,
        winRate: stats.winRate,
        totalVolume: stats.totalVolume,
        skillScore: stats.skillScore,
        totalWins: stats.totalWins,
      });
    }

    // Sort by skill score
    entries.sort((a, b) => b.skillScore - a.skillScore);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    this.leaderboard = entries.slice(0, 100); // Top 100
  }

  // ============ Query Functions ============

  /**
   * Get player statistics
   */
  async getPlayerStats(address: Address): Promise<PlayerStats | null> {
    return this.playerStats.get(address) || null;
  }

  /**
   * Get match history for a player
   */
  async getMatchHistory(address: Address, limit = 20): Promise<MatchRecord[]> {
    const matches: MatchRecord[] = [];

    for (const record of this.matchHistory.values()) {
      if (record.playerA === address || record.playerB === address) {
        matches.push(record);
      }
    }

    // Sort by timestamp descending
    matches.sort((a, b) => b.timestamp - a.timestamp);

    return matches.slice(0, limit);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    return this.leaderboard.slice(0, limit);
  }

  /**
   * Get match by ID
   */
  async getMatch(matchId: string): Promise<MatchRecord | null> {
    return this.matchHistory.get(matchId) || null;
  }

  // ============ Treasury Operations ============

  /**
   * Get total rake collected
   */
  async getTotalRake(): Promise<bigint> {
    let total = BigInt(0);
    for (const record of this.matchHistory.values()) {
      total += record.rake;
    }
    return total;
  }

  /**
   * Get total volume
   */
  async getTotalVolume(): Promise<bigint> {
    let total = BigInt(0);
    for (const record of this.matchHistory.values()) {
      total += record.stake * BigInt(2);
    }
    return total;
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const totalMatches = this.matchHistory.size;
    const uniquePlayers = this.playerStats.size;
    const totalVolume = await this.getTotalVolume();
    const totalRake = await this.getTotalRake();

    return {
      totalMatches,
      uniquePlayers,
      totalVolume,
      totalRake,
    };
  }
}

// ============ Types ============

interface MatchRecord {
  matchId: string;
  playerA: Address;
  playerB: Address;
  stake: bigint;
  winner: Address;
  payout: bigint;
  rake: bigint;
  gameType: string;
  playerAScore: number;
  playerBScore: number;
  duration: number;
  timestamp: number;
}

interface PlatformStats {
  totalMatches: number;
  uniquePlayers: number;
  totalVolume: bigint;
  totalRake: bigint;
}
