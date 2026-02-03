"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGame } from "../../hooks/useGame";
import { GameSelector } from "../../components/game/GameCard";
import { StakeSelector } from "../../components/game/StakeSelector";
import { SearchingOverlay } from "../../components/game/SearchingOverlay";
import { MatchFound } from "../../components/game/MatchFound";
import { ActiveGame } from "../../components/game/ActiveGame";
import { GameResult } from "../../components/game/GameResult";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { GameType, MatchStatus } from "../../types";
import { formatUSDC } from "../../lib/utils";
import { Wallet, ArrowLeft, Plus } from "lucide-react";

type FlowState = "select-game" | "select-stake" | "searching" | "match-found" | "playing";

export default function PlayPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const {
    address,
    balance,
    isAuthenticated,
    isSearching,
    currentMatch,
    matchStatus,
    gameState,
    scores,
    isReady,
    opponentReady,
    lastResult,
    findMatch,
    cancelSearch,
    setReady,
    sendAction,
    clearResult,
  } = useGame();

  const [flowState, setFlowState] = useState<FlowState>("select-game");
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  // Update flow state based on game state
  useEffect(() => {
    if (lastResult) {
      // Show result modal
      return;
    }

    if (matchStatus === MatchStatus.ACTIVE && gameState) {
      setFlowState("playing");
    } else if (currentMatch && matchStatus === MatchStatus.WAITING) {
      setFlowState("match-found");
    } else if (isSearching) {
      setFlowState("searching");
    }
  }, [matchStatus, currentMatch, gameState, isSearching, lastResult]);

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card variant="gradient" className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Wallet className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-zinc-400 mb-6">
              Connect your wallet to start playing skill-based games and earn USDC.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button size="lg" onClick={openConnectModal}>
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting for authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-400">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  // Handle game selection
  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setFlowState("select-stake");
  };

  // Handle stake confirmation
  const handleStakeConfirm = (stake: bigint) => {
    if (selectedGame) {
      findMatch(selectedGame, stake);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (flowState === "select-stake") {
      setFlowState("select-game");
      setSelectedGame(null);
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    clearResult();
    setFlowState("select-game");
    setSelectedGame(null);
  };

  // Handle exit
  const handleExit = () => {
    clearResult();
    router.push("/");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Balance */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Play</h1>
            <p className="text-zinc-400">Choose a game and stake to compete</p>
          </div>
          <Card variant="glass" className="px-6 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-zinc-400">Balance</p>
                <p className="text-xl font-bold text-white">
                  {formatUSDC(balance)}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Deposit
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {flowState === "select-game" && (
            <motion.div
              key="select-game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GameSelector
                onSelect={handleGameSelect}
                disabled={balance === BigInt(0)}
              />

              {balance === BigInt(0) && (
                <Card variant="glass" className="mt-6 p-4">
                  <div className="flex items-center gap-4">
                    <Wallet className="h-8 w-8 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">No Balance</p>
                      <p className="text-sm text-zinc-400">
                        Deposit USDC to start playing
                      </p>
                    </div>
                    <Button variant="primary" size="sm">
                      Deposit USDC
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {flowState === "select-stake" && selectedGame && (
            <motion.div
              key="select-stake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StakeSelector
                gameType={selectedGame}
                balance={balance}
                onConfirm={handleStakeConfirm}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {flowState === "match-found" && currentMatch && address && (
            <motion.div
              key="match-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <MatchFound
                match={currentMatch}
                myAddress={address}
                isReady={isReady}
                opponentReady={opponentReady}
                onReady={setReady}
              />
            </motion.div>
          )}

          {flowState === "playing" && gameState && address && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ActiveGame
                gameState={gameState}
                myAddress={address}
                scores={scores}
                onAction={sendAction}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Searching Overlay */}
        <AnimatePresence>
          {flowState === "searching" && selectedGame && (
            <SearchingOverlay
              gameType={selectedGame}
              stake={BigInt(1_000_000)} // Default, should be actual stake
              onCancel={() => {
                cancelSearch();
                setFlowState("select-game");
                setSelectedGame(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Result Modal */}
        <AnimatePresence>
          {lastResult && (
            <GameResult
              won={lastResult.won}
              isTie={lastResult.isTie}
              myScore={lastResult.myScore}
              opponentScore={lastResult.opponentScore}
              payout={lastResult.payout}
              onPlayAgain={handlePlayAgain}
              onExit={handleExit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
