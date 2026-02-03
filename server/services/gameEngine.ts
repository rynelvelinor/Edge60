import { Server } from "socket.io";
import {
  Match,
  MatchStatus,
  MatchPlayer,
  Address,
  GameType,
  GameState,
  GameAction,
  ReactionRaceData,
  MemoryMatchData,
  QuickMathData,
  PatternTapData,
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_CONFIGS,
} from "../../types";
import { YellowService } from "./yellow";
import { TreasuryService } from "./treasury";

export class GameEngine {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private yellowService: YellowService;
  private treasuryService: TreasuryService;

  private activeMatches: Map<string, Match> = new Map();
  private playerToMatch: Map<Address, string> = new Map();
  private matchTimers: Map<string, NodeJS.Timeout> = new Map();

  // Disconnect handling
  private readonly DISCONNECT_TIMEOUT = 10000; // 10 seconds
  private disconnectTimers: Map<Address, NodeJS.Timeout> = new Map();

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    yellowService: YellowService,
    treasuryService: TreasuryService
  ) {
    this.io = io;
    this.yellowService = yellowService;
    this.treasuryService = treasuryService;
  }

  /**
   * Start a match
   */
  startMatch(match: Match): void {
    this.activeMatches.set(match.matchId, match);
    this.playerToMatch.set(match.playerA.address, match.matchId);
    this.playerToMatch.set(match.playerB.address, match.matchId);

    console.log(`Starting match: ${match.matchId}`);
  }

  /**
   * Handle player ready signal
   */
  playerReady(address: Address): void {
    const matchId = this.playerToMatch.get(address);
    if (!matchId) return;

    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Mark player as ready
    if (match.playerA.address === address) {
      match.playerA.ready = true;
    } else if (match.playerB.address === address) {
      match.playerB.ready = true;
    }

    // Notify opponent
    this.io.to(match.playerA.socketId).emit("playerReady", { address });
    this.io.to(match.playerB.socketId).emit("playerReady", { address });

    // Check if both ready
    if (match.playerA.ready && match.playerB.ready) {
      this.beginGame(match);
    }
  }

  /**
   * Begin the actual game
   */
  private beginGame(match: Match): void {
    match.status = MatchStatus.ACTIVE;
    match.startedAt = Date.now();

    const config = GAME_CONFIGS[match.gameType];
    match.gameState.timeRemaining = config.duration;

    // Emit game start
    this.io.to(match.playerA.socketId).emit("gameStart", { match });
    this.io.to(match.playerB.socketId).emit("gameStart", { match });

    // Start game timer
    this.startGameTimer(match);

    // Initialize game-specific logic
    switch (match.gameType) {
      case GameType.REACTION_RACE:
        this.startReactionRace(match);
        break;
      case GameType.MEMORY_MATCH:
        this.startMemoryMatch(match);
        break;
      case GameType.QUICK_MATH:
        this.startQuickMath(match);
        break;
      case GameType.PATTERN_TAP:
        this.startPatternTap(match);
        break;
    }
  }

  /**
   * Handle game action from player
   */
  handleAction(address: Address, action: GameAction): void {
    const matchId = this.playerToMatch.get(address);
    if (!matchId) return;

    const match = this.activeMatches.get(matchId);
    if (!match || match.status !== MatchStatus.ACTIVE) return;

    switch (action.type) {
      case "REACTION_TAP":
        this.handleReactionTap(match, address, action.timestamp);
        break;
      case "MEMORY_FLIP":
        this.handleMemoryFlip(match, address, action.cardId);
        break;
      case "MATH_ANSWER":
        this.handleMathAnswer(
          match,
          address,
          action.answer,
          action.problemIndex
        );
        break;
      case "PATTERN_TAP":
        this.handlePatternTap(match, address, action.sequence);
        break;
    }
  }

  /**
   * Handle player disconnect
   */
  handleDisconnect(address: Address): void {
    const matchId = this.playerToMatch.get(address);
    if (!matchId) return;

    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Mark player as disconnected
    const player =
      match.playerA.address === address ? match.playerA : match.playerB;
    const opponent =
      match.playerA.address === address ? match.playerB : match.playerA;
    player.connected = false;

    // Notify opponent
    this.io.to(opponent.socketId).emit("opponentDisconnected", {
      timeout: this.DISCONNECT_TIMEOUT,
    });

    // Start disconnect timer
    const timer = setTimeout(() => {
      this.handleDisconnectTimeout(match, address);
    }, this.DISCONNECT_TIMEOUT);

    this.disconnectTimers.set(address, timer);
  }

  /**
   * Handle disconnect timeout - opponent wins
   */
  private handleDisconnectTimeout(
    match: Match,
    disconnectedAddress: Address
  ): void {
    const winner =
      match.playerA.address === disconnectedAddress
        ? match.playerB.address
        : match.playerA.address;

    this.endGame(match, winner);
  }

  /**
   * Handle player reconnect
   */
  handleReconnect(address: Address, newSocketId: string): void {
    const timer = this.disconnectTimers.get(address);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(address);
    }

    const matchId = this.playerToMatch.get(address);
    if (!matchId) return;

    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Update socket ID
    if (match.playerA.address === address) {
      match.playerA.socketId = newSocketId;
      match.playerA.connected = true;
    } else {
      match.playerB.socketId = newSocketId;
      match.playerB.connected = true;
    }

    // Notify opponent
    const opponent =
      match.playerA.address === address ? match.playerB : match.playerA;
    this.io.to(opponent.socketId).emit("opponentReconnected");

    // Send current game state to reconnected player
    this.io.to(newSocketId).emit("gameStateUpdate", {
      gameState: match.gameState,
      scores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
    });
  }

  /**
   * Get active match count
   */
  getActiveMatchCount(): number {
    return this.activeMatches.size;
  }

  // ============ Game Timer ============

  private startGameTimer(match: Match): void {
    const timer = setInterval(() => {
      match.gameState.timeRemaining--;

      // Broadcast time update
      this.broadcastGameState(match);

      // Check if time expired
      if (match.gameState.timeRemaining <= 0) {
        this.timeExpired(match);
      }
    }, 1000);

    this.matchTimers.set(match.matchId, timer);
  }

  private stopGameTimer(match: Match): void {
    const timer = this.matchTimers.get(match.matchId);
    if (timer) {
      clearInterval(timer);
      this.matchTimers.delete(match.matchId);
    }
  }

  private timeExpired(match: Match): void {
    this.stopGameTimer(match);

    // Determine winner based on scores
    let winner: Address;
    if (match.playerA.score > match.playerB.score) {
      winner = match.playerA.address;
    } else if (match.playerB.score > match.playerA.score) {
      winner = match.playerB.address;
    } else {
      // Tie - refund both (or implement tiebreaker)
      this.endGameTie(match);
      return;
    }

    this.endGame(match, winner);
  }

  // ============ Reaction Race ============

  private startReactionRace(match: Match): void {
    const data = match.gameState.data as ReactionRaceData;
    this.scheduleReactionRound(match);
  }

  private scheduleReactionRound(match: Match): void {
    const data = match.gameState.data as ReactionRaceData;

    if (data.currentRound >= match.gameState.maxRounds) {
      this.timeExpired(match);
      return;
    }

    data.waiting = true;
    this.broadcastGameState(match);

    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;

    setTimeout(() => {
      data.waiting = false;
      data.targetTime = Date.now();
      this.broadcastGameState(match);
    }, delay);
  }

  private handleReactionTap(
    match: Match,
    address: Address,
    timestamp: number
  ): void {
    const data = match.gameState.data as ReactionRaceData;

    if (data.waiting || !data.targetTime) {
      // Early tap - penalty
      return;
    }

    const reactionTime = timestamp - data.targetTime;
    const isPlayerA = match.playerA.address === address;

    if (isPlayerA) {
      data.playerATimes.push(reactionTime);
    } else {
      data.playerBTimes.push(reactionTime);
    }

    // Check if both players have responded
    if (
      data.playerATimes.length > data.currentRound &&
      data.playerBTimes.length > data.currentRound
    ) {
      const roundIndex = data.currentRound;
      const aTime = data.playerATimes[roundIndex];
      const bTime = data.playerBTimes[roundIndex];

      // Award point to faster player
      if (aTime < bTime) {
        match.playerA.score++;
      } else if (bTime < aTime) {
        match.playerB.score++;
      }

      data.currentRound++;

      this.io.to(match.playerA.socketId).emit("roundResult", {
        round: data.currentRound,
        winner: aTime < bTime ? match.playerA.address : match.playerB.address,
        scores: {
          [match.playerA.address]: match.playerA.score,
          [match.playerB.address]: match.playerB.score,
        },
      });
      this.io.to(match.playerB.socketId).emit("roundResult", {
        round: data.currentRound,
        winner: aTime < bTime ? match.playerA.address : match.playerB.address,
        scores: {
          [match.playerA.address]: match.playerA.score,
          [match.playerB.address]: match.playerB.score,
        },
      });

      // Start next round
      setTimeout(() => this.scheduleReactionRound(match), 1500);
    }
  }

  // ============ Memory Match ============

  private startMemoryMatch(match: Match): void {
    const data = match.gameState.data as MemoryMatchData;
    // Random starting player
    data.currentTurn =
      Math.random() > 0.5 ? match.playerA.address : match.playerB.address;
    this.broadcastGameState(match);
  }

  private handleMemoryFlip(
    match: Match,
    address: Address,
    cardId: number
  ): void {
    const data = match.gameState.data as MemoryMatchData;

    if (data.currentTurn !== address) return;

    const card = data.cards.find((c) => c.id === cardId);
    if (!card || card.matched) return;

    data.flippedCards.push(cardId);
    this.broadcastGameState(match);

    if (data.flippedCards.length === 2) {
      const [id1, id2] = data.flippedCards;
      const card1 = data.cards.find((c) => c.id === id1)!;
      const card2 = data.cards.find((c) => c.id === id2)!;

      if (card1.value === card2.value) {
        // Match found
        card1.matched = true;
        card1.matchedBy = address;
        card2.matched = true;
        card2.matchedBy = address;

        if (address === match.playerA.address) {
          data.playerAMatches++;
          match.playerA.score++;
        } else {
          data.playerBMatches++;
          match.playerB.score++;
        }
      } else {
        // No match - switch turns
        data.currentTurn =
          address === match.playerA.address
            ? match.playerB.address
            : match.playerA.address;
      }

      // Clear flipped cards after delay
      setTimeout(() => {
        data.flippedCards = [];
        this.broadcastGameState(match);

        // Check if game over
        if (data.cards.every((c) => c.matched)) {
          this.timeExpired(match);
        }
      }, 1000);
    }
  }

  // ============ Quick Math ============

  private startQuickMath(match: Match): void {
    this.broadcastGameState(match);
  }

  private handleMathAnswer(
    match: Match,
    address: Address,
    answer: number,
    problemIndex: number
  ): void {
    const data = match.gameState.data as QuickMathData;

    if (problemIndex !== data.currentProblemIndex) return;

    const problem = data.problems[problemIndex];
    if (problem.answeredBy) return; // Already answered

    problem.answeredBy = address;
    problem.answeredCorrectly = answer === problem.answer;

    if (problem.answeredCorrectly) {
      if (address === match.playerA.address) {
        data.playerACorrect++;
        match.playerA.score++;
      } else {
        data.playerBCorrect++;
        match.playerB.score++;
      }
    }

    // Move to next problem
    data.currentProblemIndex++;

    this.broadcastGameState(match);

    // Check if all problems answered
    if (data.currentProblemIndex >= data.problems.length) {
      this.timeExpired(match);
    }
  }

  // ============ Pattern Tap ============

  private startPatternTap(match: Match): void {
    const data = match.gameState.data as PatternTapData;
    this.showNextPattern(match);
  }

  private showNextPattern(match: Match): void {
    const data = match.gameState.data as PatternTapData;

    // Add to pattern
    data.pattern.push(Math.floor(Math.random() * 4));
    data.showingPattern = true;
    data.playerAProgress = [];
    data.playerBProgress = [];

    this.broadcastGameState(match);

    // After showing, allow input
    setTimeout(() => {
      data.showingPattern = false;
      this.broadcastGameState(match);
    }, data.pattern.length * 500 + 500);
  }

  private handlePatternTap(
    match: Match,
    address: Address,
    sequence: number[]
  ): void {
    const data = match.gameState.data as PatternTapData;

    if (data.showingPattern) return;

    const isPlayerA = address === match.playerA.address;

    if (isPlayerA) {
      data.playerAProgress = sequence;
    } else {
      data.playerBProgress = sequence;
    }

    // Check if sequence is correct so far
    const expectedSoFar = data.pattern.slice(0, sequence.length);
    const isCorrect = sequence.every((val, idx) => val === expectedSoFar[idx]);

    if (!isCorrect) {
      // Wrong - player loses this round
      return;
    }

    // Check if completed pattern
    if (sequence.length === data.pattern.length) {
      if (isPlayerA) {
        match.playerA.score++;
      } else {
        match.playerB.score++;
      }

      // Both completed - increase difficulty
      if (
        data.playerAProgress.length === data.pattern.length &&
        data.playerBProgress.length === data.pattern.length
      ) {
        data.currentPatternLength++;
        setTimeout(() => this.showNextPattern(match), 1000);
      }
    }

    this.broadcastGameState(match);
  }

  // ============ Game End ============

  private async endGame(match: Match, winner: Address): Promise<void> {
    this.stopGameTimer(match);
    match.status = MatchStatus.COMPLETED;
    match.winner = winner;
    match.completedAt = Date.now();

    // Calculate payout
    const totalPot = match.stake * BigInt(2);
    const rake = (totalPot * BigInt(300)) / BigInt(10000); // 3%
    const payout = totalPot - rake;

    // Release escrow to winner via Yellow
    await this.yellowService.releaseEscrow(match.matchId, winner);

    // Record on treasury
    await this.treasuryService.recordMatch(match, winner, payout, rake);

    // Notify players
    this.io.to(match.playerA.socketId).emit("gameEnd", {
      winner,
      finalScores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
      payout: payout.toString(),
    });
    this.io.to(match.playerB.socketId).emit("gameEnd", {
      winner,
      finalScores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
      payout: payout.toString(),
    });

    // Cleanup
    this.cleanup(match);
  }

  private async endGameTie(match: Match): Promise<void> {
    this.stopGameTimer(match);
    match.status = MatchStatus.COMPLETED;
    match.completedAt = Date.now();

    // Refund both players
    await this.yellowService.refundEscrow(match.matchId);

    // Notify players (no winner)
    this.io.to(match.playerA.socketId).emit("gameEnd", {
      winner: "0x0000000000000000000000000000000000000000" as Address,
      finalScores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
      payout: match.stake.toString(),
    });
    this.io.to(match.playerB.socketId).emit("gameEnd", {
      winner: "0x0000000000000000000000000000000000000000" as Address,
      finalScores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
      payout: match.stake.toString(),
    });

    this.cleanup(match);
  }

  private cleanup(match: Match): void {
    this.activeMatches.delete(match.matchId);
    this.playerToMatch.delete(match.playerA.address);
    this.playerToMatch.delete(match.playerB.address);

    const timerA = this.disconnectTimers.get(match.playerA.address);
    const timerB = this.disconnectTimers.get(match.playerB.address);
    if (timerA) clearTimeout(timerA);
    if (timerB) clearTimeout(timerB);
    this.disconnectTimers.delete(match.playerA.address);
    this.disconnectTimers.delete(match.playerB.address);
  }

  // ============ Utility ============

  private broadcastGameState(match: Match): void {
    this.io.to(match.playerA.socketId).emit("gameStateUpdate", {
      gameState: match.gameState,
      scores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
    });
    this.io.to(match.playerB.socketId).emit("gameStateUpdate", {
      gameState: match.gameState,
      scores: {
        [match.playerA.address]: match.playerA.score,
        [match.playerB.address]: match.playerB.score,
      },
    });
  }
}
