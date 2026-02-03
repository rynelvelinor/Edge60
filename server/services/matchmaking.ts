import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  Match,
  MatchStatus,
  MatchPlayer,
  OnlinePlayer,
  PlayerStatus,
  GameType,
  GameState,
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../types";
import { YellowService } from "./yellow";

interface QueueEntry {
  player: OnlinePlayer;
  stake: bigint;
  gameType: GameType;
  joinedAt: number;
}

export class MatchmakingService {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private yellowService: YellowService;
  private queue: Map<string, QueueEntry> = new Map();
  private matches: Map<string, Match> = new Map();

  // Matchmaking configuration
  private readonly MATCH_TIMEOUT = 60000; // 60 seconds
  private readonly STAKE_TOLERANCE = 0.1; // 10% stake variance allowed

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    yellowService: YellowService
  ) {
    this.io = io;
    this.yellowService = yellowService;

    // Run matchmaking loop
    this.startMatchmakingLoop();
  }

  /**
   * Add player to matchmaking queue
   */
  async findMatch(
    player: OnlinePlayer,
    stake: bigint,
    gameType: GameType
  ): Promise<Match | null> {
    // Check if player has sufficient balance
    const balance = await this.yellowService.getBalance(player.address);
    if (balance < stake) {
      throw new Error("Insufficient balance");
    }

    // Check if player is already in queue
    if (this.queue.has(player.socketId)) {
      throw new Error("Already searching for match");
    }

    // Add to queue
    const entry: QueueEntry = {
      player,
      stake,
      gameType,
      joinedAt: Date.now(),
    };
    this.queue.set(player.socketId, entry);

    // Try immediate match
    const match = await this.tryMatch(entry);
    if (match) {
      return match;
    }

    // Match will be found asynchronously via matchmaking loop
    return null;
  }

  /**
   * Remove player from matchmaking queue
   */
  cancelSearch(player: OnlinePlayer): void {
    this.queue.delete(player.socketId);
    player.status = PlayerStatus.ONLINE;
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Get match by ID
   */
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  /**
   * Try to find a match for a player
   */
  private async tryMatch(entry: QueueEntry): Promise<Match | null> {
    for (const [socketId, otherEntry] of this.queue) {
      // Don't match with self
      if (socketId === entry.player.socketId) continue;

      // Check game type match
      if (otherEntry.gameType !== entry.gameType) continue;

      // Check stake compatibility (within tolerance)
      const stakeDiff = this.calculateStakeDifference(
        entry.stake,
        otherEntry.stake
      );
      if (stakeDiff > this.STAKE_TOLERANCE) continue;

      // Found a match!
      const match = await this.createMatch(entry, otherEntry);
      return match;
    }

    return null;
  }

  /**
   * Create a match between two players
   */
  private async createMatch(
    entryA: QueueEntry,
    entryB: QueueEntry
  ): Promise<Match> {
    // Remove both from queue
    this.queue.delete(entryA.player.socketId);
    this.queue.delete(entryB.player.socketId);

    // Use lower stake
    const stake = entryA.stake < entryB.stake ? entryA.stake : entryB.stake;

    // Create match
    const matchId = uuidv4();
    const match: Match = {
      matchId,
      playerA: this.createMatchPlayer(entryA.player),
      playerB: this.createMatchPlayer(entryB.player),
      stake,
      status: MatchStatus.WAITING,
      gameType: entryA.gameType,
      gameState: this.createInitialGameState(entryA.gameType),
      createdAt: Date.now(),
    };

    // Store match
    this.matches.set(matchId, match);

    // Update player statuses
    entryA.player.status = PlayerStatus.IN_MATCH;
    entryB.player.status = PlayerStatus.IN_MATCH;

    // Lock stakes in Yellow escrow
    await this.yellowService.createEscrow(
      matchId,
      entryA.player.address,
      entryB.player.address,
      stake
    );

    // Notify both players
    this.io.to(entryA.player.socketId).emit("matchFound", { match });
    this.io.to(entryB.player.socketId).emit("matchFound", { match });

    console.log(
      `Match created: ${matchId} - ${entryA.player.address} vs ${entryB.player.address}`
    );

    return match;
  }

  /**
   * Create MatchPlayer from OnlinePlayer
   */
  private createMatchPlayer(player: OnlinePlayer): MatchPlayer {
    return {
      address: player.address,
      ensName: player.ensName,
      socketId: player.socketId,
      score: 0,
      ready: false,
      connected: true,
      lastPing: Date.now(),
    };
  }

  /**
   * Create initial game state based on game type
   */
  private createInitialGameState(gameType: GameType): GameState {
    const baseState = {
      type: gameType,
      round: 0,
      timeRemaining: 0,
    };

    switch (gameType) {
      case GameType.REACTION_RACE:
        return {
          ...baseState,
          maxRounds: 5,
          data: {
            playerATimes: [],
            playerBTimes: [],
            currentRound: 0,
            waiting: true,
          },
        };

      case GameType.MEMORY_MATCH:
        return {
          ...baseState,
          maxRounds: 1,
          data: {
            cards: this.generateMemoryCards(),
            playerAMatches: 0,
            playerBMatches: 0,
            currentTurn: "0x0" as `0x${string}`,
            flippedCards: [],
          },
        };

      case GameType.QUICK_MATH:
        return {
          ...baseState,
          maxRounds: 10,
          data: {
            problems: this.generateMathProblems(10),
            currentProblemIndex: 0,
            playerACorrect: 0,
            playerBCorrect: 0,
          },
        };

      case GameType.PATTERN_TAP:
        return {
          ...baseState,
          maxRounds: 1,
          data: {
            pattern: [],
            playerAProgress: [],
            playerBProgress: [],
            currentPatternLength: 3,
            showingPattern: false,
          },
        };

      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }

  /**
   * Generate memory card pairs
   */
  private generateMemoryCards() {
    const symbols = ["🎮", "⚡", "💎", "🚀", "🎯", "🎪", "🎨", "🎭"];
    const cards: { id: number; value: string; matched: boolean }[] = [];

    // Create pairs
    symbols.forEach((symbol, i) => {
      cards.push({ id: i * 2, value: symbol, matched: false });
      cards.push({ id: i * 2 + 1, value: symbol, matched: false });
    });

    // Shuffle
    return cards.sort(() => Math.random() - 0.5);
  }

  /**
   * Generate math problems
   */
  private generateMathProblems(count: number) {
    const problems: { question: string; answer: number }[] = [];
    const operators = ["+", "-", "*"];

    for (let i = 0; i < count; i++) {
      const op = operators[Math.floor(Math.random() * operators.length)];
      let a: number, b: number, answer: number;

      switch (op) {
        case "+":
          a = Math.floor(Math.random() * 50) + 1;
          b = Math.floor(Math.random() * 50) + 1;
          answer = a + b;
          break;
        case "-":
          a = Math.floor(Math.random() * 50) + 20;
          b = Math.floor(Math.random() * 20) + 1;
          answer = a - b;
          break;
        case "*":
          a = Math.floor(Math.random() * 12) + 1;
          b = Math.floor(Math.random() * 12) + 1;
          answer = a * b;
          break;
        default:
          a = 1;
          b = 1;
          answer = 2;
      }

      problems.push({ question: `${a} ${op} ${b}`, answer });
    }

    return problems;
  }

  /**
   * Calculate stake difference percentage
   */
  private calculateStakeDifference(stakeA: bigint, stakeB: bigint): number {
    const max = stakeA > stakeB ? stakeA : stakeB;
    const min = stakeA < stakeB ? stakeA : stakeB;
    return Number(max - min) / Number(max);
  }

  /**
   * Matchmaking loop - runs periodically to match waiting players
   */
  private startMatchmakingLoop(): void {
    setInterval(() => {
      this.processQueue();
    }, 1000); // Run every second
  }

  /**
   * Process the matchmaking queue
   */
  private processQueue(): void {
    const now = Date.now();
    const entries = Array.from(this.queue.values());

    // Remove timed out entries
    for (const entry of entries) {
      if (now - entry.joinedAt > this.MATCH_TIMEOUT) {
        this.queue.delete(entry.player.socketId);
        entry.player.status = PlayerStatus.ONLINE;
        this.io.to(entry.player.socketId).emit("matchCancelled", {
          reason: "Match search timed out",
        });
      }
    }

    // Try to match remaining players
    const remainingEntries = Array.from(this.queue.values());
    for (const entry of remainingEntries) {
      if (!this.queue.has(entry.player.socketId)) continue;
      this.tryMatch(entry);
    }
  }

  /**
   * Remove match from tracking
   */
  removeMatch(matchId: string): void {
    this.matches.delete(matchId);
  }
}
