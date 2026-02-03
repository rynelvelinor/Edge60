"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGame } from "../../hooks/useGame";
import { GameSelector } from "../../components/game/GameCard";
import { StakeSelector } from "../../components/game/StakeSelector";
import { SearchingOverlay } from "../../components/game/SearchingOverlay";
import { MatchFound } from "../../components/game/MatchFound";
import { ActiveGame } from "../../components/game/ActiveGame";
import { GameResult } from "../../components/game/GameResult";
import { Button } from "../../components/ui/Button";
import { GameType, MatchStatus } from "../../types";
import { formatUSDC } from "../../lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    if (lastResult) return;

    if (matchStatus === MatchStatus.ACTIVE && gameState) {
      setFlowState("playing");
    } else if (currentMatch && matchStatus === MatchStatus.WAITING) {
      setFlowState("match-found");
    } else if (isSearching) {
      setFlowState("searching");
    }
  }, [matchStatus, currentMatch, gameState, isSearching, lastResult]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600" />
          </div>
          <h1 className="text-h2 text-slate-900 mb-3">Connect to Play</h1>
          <p className="text-slate-600 mb-8">
            Connect your wallet to start competing.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button size="lg" onClick={openConnectModal} className="w-full">
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setFlowState("select-stake");
  };

  const handleStakeConfirm = (stake: bigint) => {
    if (selectedGame) {
      findMatch(selectedGame, stake);
    }
  };

  const handleBack = () => {
    if (flowState === "select-stake") {
      setFlowState("select-game");
      setSelectedGame(null);
    }
  };

  const handlePlayAgain = () => {
    clearResult();
    setFlowState("select-game");
    setSelectedGame(null);
  };

  const handleExit = () => {
    clearResult();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-h2 text-slate-900">Select Game</h1>
              <p className="text-slate-600 text-sm mt-0.5">
                Choose a game mode and set your stake
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-0.5">Balance</div>
            <div className="text-lg font-semibold text-slate-900">{formatUSDC(balance)}</div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {flowState === "select-game" && (
            <motion.div
              key="select-game"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <GameSelector
                onSelect={handleGameSelect}
                disabled={balance === BigInt(0)}
              />

              {balance === BigInt(0) && (
                <div className="mt-6 p-5 rounded-2xl bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 rounded bg-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">No Balance</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Deposit USDC to start playing skill-based games.
                      </p>
                      <Button size="sm">Deposit USDC</Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {flowState === "select-stake" && selectedGame && (
            <motion.div
              key="select-stake"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.2 }}
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
              stake={BigInt(1_000_000)}
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
