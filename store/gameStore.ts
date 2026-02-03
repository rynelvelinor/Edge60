import { create } from "zustand";
import {
  Match,
  MatchStatus,
  GameState,
  GameType,
  Address,
  PlayerStats,
} from "../types";

interface GameStore {
  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  playerId: string | null;

  // Player state
  address: Address | null;
  ensName: string | null;
  balance: bigint;
  pendingBalance: bigint;
  stats: PlayerStats | null;

  // Match state
  currentMatch: Match | null;
  matchStatus: MatchStatus | null;
  isSearching: boolean;
  searchGameType: GameType | null;
  searchStake: bigint | null;

  // Game state
  gameState: GameState | null;
  scores: Record<string, number>;
  isReady: boolean;
  opponentReady: boolean;
  opponentDisconnected: boolean;
  disconnectTimeout: number | null;

  // Results
  lastResult: GameResult | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setAuthenticated: (authenticated: boolean, playerId: string | null) => void;
  setPlayer: (address: Address, ensName?: string | null) => void;
  setBalance: (balance: bigint, pending?: bigint) => void;
  setStats: (stats: PlayerStats) => void;

  startSearch: (gameType: GameType, stake: bigint) => void;
  cancelSearch: () => void;
  setMatch: (match: Match | null) => void;
  setMatchStatus: (status: MatchStatus) => void;

  setGameState: (state: GameState, scores: Record<string, number>) => void;
  setReady: (ready: boolean) => void;
  setOpponentReady: (ready: boolean) => void;
  setOpponentDisconnected: (
    disconnected: boolean,
    timeout?: number | null
  ) => void;

  setResult: (result: GameResult) => void;
  clearResult: () => void;

  reset: () => void;
}

interface GameResult {
  winner: Address;
  myScore: number;
  opponentScore: number;
  payout: bigint;
  won: boolean;
  isTie: boolean;
}

const initialState = {
  isConnected: false,
  isAuthenticated: false,
  playerId: null,
  address: null,
  ensName: null,
  balance: BigInt(0),
  pendingBalance: BigInt(0),
  stats: null,
  currentMatch: null,
  matchStatus: null,
  isSearching: false,
  searchGameType: null,
  searchStake: null,
  gameState: null,
  scores: {},
  isReady: false,
  opponentReady: false,
  opponentDisconnected: false,
  disconnectTimeout: null,
  lastResult: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setConnected: (connected) => set({ isConnected: connected }),

  setAuthenticated: (authenticated, playerId) =>
    set({ isAuthenticated: authenticated, playerId }),

  setPlayer: (address, ensName) => set({ address, ensName: ensName || null }),

  setBalance: (balance, pending) =>
    set({
      balance,
      pendingBalance: pending ?? BigInt(0),
    }),

  setStats: (stats) => set({ stats }),

  startSearch: (gameType, stake) =>
    set({
      isSearching: true,
      searchGameType: gameType,
      searchStake: stake,
    }),

  cancelSearch: () =>
    set({
      isSearching: false,
      searchGameType: null,
      searchStake: null,
    }),

  setMatch: (match) =>
    set({
      currentMatch: match,
      matchStatus: match?.status || null,
      isSearching: false,
      searchGameType: null,
      searchStake: null,
      isReady: false,
      opponentReady: false,
    }),

  setMatchStatus: (status) => set({ matchStatus: status }),

  setGameState: (state, scores) =>
    set({
      gameState: state,
      scores,
    }),

  setReady: (ready) => set({ isReady: ready }),

  setOpponentReady: (ready) => set({ opponentReady: ready }),

  setOpponentDisconnected: (disconnected, timeout) =>
    set({
      opponentDisconnected: disconnected,
      disconnectTimeout: timeout ?? null,
    }),

  setResult: (result) =>
    set({
      lastResult: result,
      currentMatch: null,
      matchStatus: null,
      gameState: null,
      scores: {},
      isReady: false,
      opponentReady: false,
    }),

  clearResult: () => set({ lastResult: null }),

  reset: () => set(initialState),
}));

// Selectors
export const selectIsInGame = (state: GameStore) =>
  state.matchStatus === MatchStatus.ACTIVE;

export const selectIsWaitingForOpponent = (state: GameStore) =>
  state.matchStatus === MatchStatus.WAITING && !state.opponentReady;

export const selectMyScore = (state: GameStore) =>
  state.address ? state.scores[state.address] ?? 0 : 0;

export const selectOpponentScore = (state: GameStore) => {
  if (!state.currentMatch || !state.address) return 0;
  const opponentAddress =
    state.currentMatch.playerA.address === state.address
      ? state.currentMatch.playerB.address
      : state.currentMatch.playerA.address;
  return state.scores[opponentAddress] ?? 0;
};

export const selectOpponent = (state: GameStore) => {
  if (!state.currentMatch || !state.address) return null;
  return state.currentMatch.playerA.address === state.address
    ? state.currentMatch.playerB
    : state.currentMatch.playerA;
};
