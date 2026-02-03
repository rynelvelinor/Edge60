// ============ Core Types ============

export type Address = `0x${string}`;

export enum MatchStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  SETTLED = "SETTLED",
  CANCELLED = "CANCELLED",
}

export enum GameType {
  REACTION_RACE = "REACTION_RACE",
  MEMORY_MATCH = "MEMORY_MATCH",
  QUICK_MATH = "QUICK_MATH",
  PATTERN_TAP = "PATTERN_TAP",
}

// ============ Player Types ============

export interface Player {
  address: Address;
  ensName?: string;
  sessionId?: string;
  balance: bigint;
  stats: PlayerStats;
}

export interface PlayerStats {
  totalWins: number;
  totalLosses: number;
  totalVolume: bigint;
  totalWinnings: bigint;
  winRate: number;
  skillScore: number;
}

export interface OnlinePlayer {
  address: Address;
  ensName?: string;
  socketId: string;
  sessionId?: string;
  status: PlayerStatus;
  joinedAt: number;
}

export enum PlayerStatus {
  ONLINE = "ONLINE",
  SEARCHING = "SEARCHING",
  IN_MATCH = "IN_MATCH",
  DISCONNECTED = "DISCONNECTED",
}

// ============ Match Types ============

export interface Match {
  matchId: string;
  playerA: MatchPlayer;
  playerB: MatchPlayer;
  stake: bigint;
  status: MatchStatus;
  gameType: GameType;
  gameState: GameState;
  winner?: Address;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface MatchPlayer {
  address: Address;
  ensName?: string;
  socketId: string;
  score: number;
  ready: boolean;
  connected: boolean;
  lastPing: number;
}

// ============ Game State Types ============

export interface GameState {
  type: GameType;
  round: number;
  maxRounds: number;
  timeRemaining: number;
  data: GameData;
}

export type GameData =
  | ReactionRaceData
  | MemoryMatchData
  | QuickMathData
  | PatternTapData;

export interface ReactionRaceData {
  targetTime?: number;
  playerATimes: number[];
  playerBTimes: number[];
  currentRound: number;
  waiting: boolean;
}

export interface MemoryMatchData {
  cards: MemoryCard[];
  playerAMatches: number;
  playerBMatches: number;
  currentTurn: Address;
  flippedCards: number[];
}

export interface MemoryCard {
  id: number;
  value: string;
  matched: boolean;
  matchedBy?: Address;
}

export interface QuickMathData {
  problems: MathProblem[];
  currentProblemIndex: number;
  playerACorrect: number;
  playerBCorrect: number;
}

export interface MathProblem {
  question: string;
  answer: number;
  answeredBy?: Address;
  answeredCorrectly?: boolean;
}

export interface PatternTapData {
  pattern: number[];
  playerAProgress: number[];
  playerBProgress: number[];
  currentPatternLength: number;
  showingPattern: boolean;
}

// ============ WebSocket Event Types ============

export interface ServerToClientEvents {
  // Connection events
  connected: (data: { playerId: string }) => void;
  error: (data: { message: string; code: string }) => void;

  // Matchmaking events
  matchFound: (data: { match: Match }) => void;
  matchCancelled: (data: { reason: string }) => void;
  searchingForMatch: (data: { stake: string; gameType: GameType }) => void;

  // Game events
  gameStart: (data: { match: Match }) => void;
  gameStateUpdate: (data: {
    gameState: GameState;
    scores: { [address: string]: number };
  }) => void;
  roundResult: (data: {
    round: number;
    winner?: Address;
    scores: { [address: string]: number };
  }) => void;
  gameEnd: (data: {
    winner: Address;
    finalScores: { [address: string]: number };
    payout: string;
  }) => void;

  // Player events
  opponentDisconnected: (data: { timeout: number }) => void;
  opponentReconnected: () => void;
  playerReady: (data: { address: Address }) => void;

  // Balance events
  balanceUpdate: (data: { balance: string; pending: string }) => void;
}

export interface ClientToServerEvents {
  // Matchmaking
  findMatch: (data: { stake: string; gameType: GameType }) => void;
  cancelSearch: () => void;

  // Game actions
  ready: () => void;
  gameAction: (data: GameAction) => void;

  // Session
  authenticate: (data: {
    address: Address;
    signature: string;
    message: string;
  }) => void;
  disconnect: () => void;
}

export type GameAction =
  | { type: "REACTION_TAP"; timestamp: number }
  | { type: "MEMORY_FLIP"; cardId: number }
  | { type: "MATH_ANSWER"; answer: number; problemIndex: number }
  | { type: "PATTERN_TAP"; sequence: number[] };

// ============ Yellow Network Types ============

export interface YellowSession {
  sessionId: string;
  userAddress: Address;
  balance: bigint;
  nonce: number;
  createdAt: number;
  lastActivityAt: number;
  active: boolean;
}

export interface YellowTransfer {
  from: Address;
  to: Address;
  amount: bigint;
  nonce: number;
  signature: string;
}

export interface YellowEscrow {
  escrowId: string;
  matchId: string;
  playerA: Address;
  playerB: Address;
  stake: bigint;
  totalAmount: bigint;
  released: boolean;
  releasedTo?: Address;
}

// ============ ENS Types ============

export interface ENSProfile {
  address: Address;
  name?: string;
  avatar?: string;
  records: {
    "edge60.winRate"?: string;
    "edge60.totalVolume"?: string;
    "edge60.skillScore"?: string;
  };
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  address: Address;
  ensName?: string;
  winRate: number;
  totalVolume: bigint;
  skillScore: number;
  totalWins: number;
}

// ============ Config Types ============

export interface GameConfig {
  type: GameType;
  name: string;
  description: string;
  duration: number; // seconds
  rounds: number;
  minStake: bigint;
  maxStake: bigint;
}

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  [GameType.REACTION_RACE]: {
    type: GameType.REACTION_RACE,
    name: "Reaction Race",
    description: "Tap when you see the signal. Fastest reaction wins!",
    duration: 30,
    rounds: 5,
    minStake: BigInt(1_000_000), // 1 USDC
    maxStake: BigInt(100_000_000), // 100 USDC
  },
  [GameType.MEMORY_MATCH]: {
    type: GameType.MEMORY_MATCH,
    name: "Memory Match",
    description: "Find matching pairs. Best memory wins!",
    duration: 60,
    rounds: 1,
    minStake: BigInt(1_000_000),
    maxStake: BigInt(100_000_000),
  },
  [GameType.QUICK_MATH]: {
    type: GameType.QUICK_MATH,
    name: "Quick Math",
    description: "Solve math problems fastest. Speed + accuracy wins!",
    duration: 45,
    rounds: 10,
    minStake: BigInt(1_000_000),
    maxStake: BigInt(100_000_000),
  },
  [GameType.PATTERN_TAP]: {
    type: GameType.PATTERN_TAP,
    name: "Pattern Tap",
    description: "Remember and repeat the pattern. Longest streak wins!",
    duration: 60,
    rounds: 1,
    minStake: BigInt(1_000_000),
    maxStake: BigInt(100_000_000),
  },
};

// ============ Contract Addresses ============

export interface ContractAddresses {
  gameTreasury: Address;
  yellowSettlement: Address;
  usdc: Address;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Local hardhat
  31337: {
    gameTreasury: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    yellowSettlement: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    usdc: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  // Base Sepolia (placeholder)
  84532: {
    gameTreasury: "0x0000000000000000000000000000000000000000",
    yellowSettlement: "0x0000000000000000000000000000000000000000",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
  },
};
