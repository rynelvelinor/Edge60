"use client";

import { useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { socketService } from "../lib/socket";
import { useGameStore } from "../store/gameStore";
import { GameType, GameAction, Address, MatchStatus } from "../types";

export function useGame() {
  const { address, isConnected: walletConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const store = useGameStore();

  // Connect and authenticate on wallet connection
  useEffect(() => {
    if (walletConnected && address) {
      const socket = socketService.connect();
      store.setPlayer(address as Address);

      socket.on("connect", () => {
        store.setConnected(true);
        authenticateWithServer();
      });

      socket.on("disconnect", () => {
        store.setConnected(false);
        store.setAuthenticated(false, null);
      });

      return () => {
        socketService.disconnect();
        store.reset();
      };
    }
  }, [walletConnected, address]);

  // Authenticate with the game server
  const authenticateWithServer = useCallback(async () => {
    if (!address) return;

    try {
      const message = `Edge60 Authentication\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      socketService.authenticate(address as Address, signature, message);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }, [address, signMessageAsync]);

  // Set up socket event listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Authentication response
    socket.on("connected", ({ playerId }) => {
      store.setAuthenticated(true, playerId);
    });

    // Balance updates
    socket.on("balanceUpdate", ({ balance, pending }) => {
      store.setBalance(BigInt(balance), BigInt(pending));
    });

    // Match events
    socket.on("searchingForMatch", ({ stake, gameType }) => {
      store.startSearch(gameType, BigInt(stake));
    });

    socket.on("matchFound", ({ match }) => {
      store.setMatch(match);
    });

    socket.on("matchCancelled", ({ reason }) => {
      store.cancelSearch();
      console.log("Match cancelled:", reason);
    });

    // Game events
    socket.on("playerReady", ({ address: readyAddress }) => {
      if (readyAddress === store.address) {
        store.setReady(true);
      } else {
        store.setOpponentReady(true);
      }
    });

    socket.on("gameStart", ({ match }) => {
      store.setMatch(match);
      store.setMatchStatus(MatchStatus.ACTIVE);
    });

    socket.on("gameStateUpdate", ({ gameState, scores }) => {
      store.setGameState(gameState, scores);
    });

    socket.on("roundResult", ({ round, winner, scores }) => {
      store.setGameState(store.gameState!, scores);
    });

    socket.on("gameEnd", ({ winner, finalScores, payout }) => {
      const myAddress = store.address!;
      const myScore = finalScores[myAddress] ?? 0;
      const opponentAddress = Object.keys(finalScores).find(
        (a) => a !== myAddress
      )!;
      const opponentScore = finalScores[opponentAddress] ?? 0;
      const isTie = winner === "0x0000000000000000000000000000000000000000";

      store.setResult({
        winner: winner as Address,
        myScore,
        opponentScore,
        payout: BigInt(payout),
        won: winner === myAddress,
        isTie,
      });
    });

    // Disconnect handling
    socket.on("opponentDisconnected", ({ timeout }) => {
      store.setOpponentDisconnected(true, timeout);
    });

    socket.on("opponentReconnected", () => {
      store.setOpponentDisconnected(false, null);
    });

    // Errors
    socket.on("error", ({ message, code }) => {
      console.error(`Game error [${code}]:`, message);
    });

    return () => {
      socket.off("connected");
      socket.off("balanceUpdate");
      socket.off("searchingForMatch");
      socket.off("matchFound");
      socket.off("matchCancelled");
      socket.off("playerReady");
      socket.off("gameStart");
      socket.off("gameStateUpdate");
      socket.off("roundResult");
      socket.off("gameEnd");
      socket.off("opponentDisconnected");
      socket.off("opponentReconnected");
      socket.off("error");
    };
  }, []);

  // Game actions
  const findMatch = useCallback((gameType: GameType, stake: bigint) => {
    socketService.findMatch(stake.toString(), gameType);
  }, []);

  const cancelSearch = useCallback(() => {
    socketService.cancelSearch();
    store.cancelSearch();
  }, []);

  const setReady = useCallback(() => {
    socketService.ready();
  }, []);

  const sendAction = useCallback((action: GameAction) => {
    socketService.sendGameAction(action);
  }, []);

  return {
    // State
    ...store,
    walletConnected,

    // Actions
    findMatch,
    cancelSearch,
    setReady,
    sendAction,
    clearResult: store.clearResult,
  };
}
