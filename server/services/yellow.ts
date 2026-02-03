import { ethers } from "ethers";
import { Address, YellowSession, YellowEscrow } from "../../types";

/**
 * Yellow Network Integration Service
 *
 * Handles off-chain state channel operations:
 * - Session management
 * - Balance tracking
 * - Escrow for matches
 * - Settlement preparation
 */
export class YellowService {
  // In-memory state (in production, use Redis or similar)
  private sessions: Map<Address, YellowSession> = new Map();
  private balances: Map<Address, bigint> = new Map();
  private escrows: Map<string, YellowEscrow> = new Map();

  // Nonce tracking for replay protection
  private nonces: Map<Address, number> = new Map();

  constructor() {
    console.log("Yellow Network Service initialized");
  }

  // ============ Session Management ============

  /**
   * Create a new Yellow session for a user
   */
  async createSession(userAddress: Address): Promise<YellowSession> {
    const sessionId = this.generateSessionId(userAddress);

    const session: YellowSession = {
      sessionId,
      userAddress,
      balance: BigInt(0),
      nonce: 0,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      active: true,
    };

    this.sessions.set(userAddress, session);
    this.balances.set(userAddress, BigInt(0));
    this.nonces.set(userAddress, 0);

    console.log(`Yellow session created: ${sessionId} for ${userAddress}`);
    return session;
  }

  /**
   * Get or create session for user
   */
  async getOrCreateSession(userAddress: Address): Promise<YellowSession> {
    const existing = this.sessions.get(userAddress);
    if (existing && existing.active) {
      return existing;
    }
    return this.createSession(userAddress);
  }

  /**
   * Get session for user
   */
  getSession(userAddress: Address): YellowSession | undefined {
    return this.sessions.get(userAddress);
  }

  /**
   * Close a Yellow session (prepares for on-chain settlement)
   */
  async closeSession(userAddress: Address): Promise<{
    finalBalance: bigint;
    nonce: number;
    signature: string;
  }> {
    const session = this.sessions.get(userAddress);
    if (!session) {
      throw new Error("Session not found");
    }

    session.active = false;
    const finalBalance = this.balances.get(userAddress) || BigInt(0);
    const nonce = this.nonces.get(userAddress) || 0;

    // Generate settlement signature (in production, this comes from Yellow Network)
    const signature = await this.generateSettlementSignature(
      session.sessionId,
      finalBalance,
      nonce
    );

    console.log(
      `Yellow session closed: ${session.sessionId}, balance: ${finalBalance}`
    );

    return { finalBalance, nonce, signature };
  }

  // ============ Balance Operations ============

  /**
   * Get current off-chain balance for user
   */
  async getBalance(userAddress: Address): Promise<bigint> {
    return this.balances.get(userAddress) || BigInt(0);
  }

  /**
   * Credit user balance (after on-chain deposit)
   */
  async creditBalance(userAddress: Address, amount: bigint): Promise<bigint> {
    const current = this.balances.get(userAddress) || BigInt(0);
    const newBalance = current + amount;
    this.balances.set(userAddress, newBalance);

    this.updateSessionActivity(userAddress);
    this.incrementNonce(userAddress);

    console.log(
      `Credited ${amount} to ${userAddress}, new balance: ${newBalance}`
    );
    return newBalance;
  }

  /**
   * Debit user balance
   */
  async debitBalance(userAddress: Address, amount: bigint): Promise<bigint> {
    const current = this.balances.get(userAddress) || BigInt(0);

    if (current < amount) {
      throw new Error("Insufficient balance");
    }

    const newBalance = current - amount;
    this.balances.set(userAddress, newBalance);

    this.updateSessionActivity(userAddress);
    this.incrementNonce(userAddress);

    console.log(
      `Debited ${amount} from ${userAddress}, new balance: ${newBalance}`
    );
    return newBalance;
  }

  /**
   * Transfer between users (off-chain)
   */
  async transfer(from: Address, to: Address, amount: bigint): Promise<void> {
    const fromBalance = this.balances.get(from) || BigInt(0);

    if (fromBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const toBalance = this.balances.get(to) || BigInt(0);

    this.balances.set(from, fromBalance - amount);
    this.balances.set(to, toBalance + amount);

    this.updateSessionActivity(from);
    this.updateSessionActivity(to);
    this.incrementNonce(from);
    this.incrementNonce(to);

    console.log(`Transferred ${amount} from ${from} to ${to}`);
  }

  // ============ Escrow Operations ============

  /**
   * Create escrow for a match
   */
  async createEscrow(
    matchId: string,
    playerA: Address,
    playerB: Address,
    stake: bigint
  ): Promise<YellowEscrow> {
    // Verify balances
    const balanceA = this.balances.get(playerA) || BigInt(0);
    const balanceB = this.balances.get(playerB) || BigInt(0);

    if (balanceA < stake || balanceB < stake) {
      throw new Error("Insufficient balance for escrow");
    }

    // Lock stakes
    this.balances.set(playerA, balanceA - stake);
    this.balances.set(playerB, balanceB - stake);

    const escrow: YellowEscrow = {
      escrowId: `escrow-${matchId}`,
      matchId,
      playerA,
      playerB,
      stake,
      totalAmount: stake * BigInt(2),
      released: false,
    };

    this.escrows.set(matchId, escrow);

    this.incrementNonce(playerA);
    this.incrementNonce(playerB);

    console.log(
      `Escrow created for match ${matchId}: ${stake * BigInt(2)} USDC`
    );
    return escrow;
  }

  /**
   * Release escrow to winner
   */
  async releaseEscrow(matchId: string, winner: Address): Promise<void> {
    const escrow = this.escrows.get(matchId);
    if (!escrow) {
      throw new Error("Escrow not found");
    }

    if (escrow.released) {
      throw new Error("Escrow already released");
    }

    if (winner !== escrow.playerA && winner !== escrow.playerB) {
      throw new Error("Invalid winner address");
    }

    // Calculate payout (after rake)
    const rake = (escrow.totalAmount * BigInt(300)) / BigInt(10000); // 3%
    const payout = escrow.totalAmount - rake;

    // Credit winner
    const winnerBalance = this.balances.get(winner) || BigInt(0);
    this.balances.set(winner, winnerBalance + payout);

    escrow.released = true;
    escrow.releasedTo = winner;

    this.incrementNonce(winner);

    console.log(`Escrow released for match ${matchId}: ${payout} to ${winner}`);
  }

  /**
   * Refund escrow (e.g., both players disconnected)
   */
  async refundEscrow(matchId: string): Promise<void> {
    const escrow = this.escrows.get(matchId);
    if (!escrow) {
      throw new Error("Escrow not found");
    }

    if (escrow.released) {
      throw new Error("Escrow already released");
    }

    // Refund both players
    const balanceA = this.balances.get(escrow.playerA) || BigInt(0);
    const balanceB = this.balances.get(escrow.playerB) || BigInt(0);

    this.balances.set(escrow.playerA, balanceA + escrow.stake);
    this.balances.set(escrow.playerB, balanceB + escrow.stake);

    escrow.released = true;

    this.incrementNonce(escrow.playerA);
    this.incrementNonce(escrow.playerB);

    console.log(`Escrow refunded for match ${matchId}`);
  }

  /**
   * Get escrow details
   */
  getEscrow(matchId: string): YellowEscrow | undefined {
    return this.escrows.get(matchId);
  }

  // ============ Internal Helpers ============

  private generateSessionId(userAddress: Address): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `yellow-${userAddress.slice(2, 10)}-${timestamp}-${random}`;
  }

  private updateSessionActivity(userAddress: Address): void {
    const session = this.sessions.get(userAddress);
    if (session) {
      session.lastActivityAt = Date.now();
    }
  }

  private incrementNonce(userAddress: Address): void {
    const current = this.nonces.get(userAddress) || 0;
    this.nonces.set(userAddress, current + 1);
  }

  private async generateSettlementSignature(
    sessionId: string,
    finalBalance: bigint,
    nonce: number
  ): Promise<string> {
    // In production, this signature comes from Yellow Network
    // For demo, we generate a placeholder
    const message = ethers.solidityPackedKeccak256(
      ["string", "uint256", "uint256"],
      [sessionId, finalBalance, nonce]
    );

    // This would be signed by Yellow Network's key
    // For demo purposes, return a placeholder
    return `0x${"00".repeat(65)}`;
  }

  // ============ State Sync (for production) ============

  /**
   * Sync local state with Yellow Network
   * Called periodically to ensure consistency
   */
  async syncWithYellowNetwork(): Promise<void> {
    // In production, this would:
    // 1. Connect to Yellow Network nodes
    // 2. Verify state channel balances
    // 3. Reconcile any discrepancies
    console.log("Syncing with Yellow Network...");
  }

  /**
   * Get signed state for on-chain settlement
   */
  async getSignedState(userAddress: Address): Promise<{
    balance: bigint;
    nonce: number;
    signature: string;
  }> {
    const balance = this.balances.get(userAddress) || BigInt(0);
    const nonce = this.nonces.get(userAddress) || 0;

    const signature = await this.generateSettlementSignature(
      this.sessions.get(userAddress)?.sessionId || "",
      balance,
      nonce
    );

    return { balance, nonce, signature };
  }
}
