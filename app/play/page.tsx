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

type FlowState =
  | "select-game"
  | "select-stake"
  | "searching"
  | "match-found"
  | "playing";

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
      <div className="min-h-screen bg-[#1e3a2f] flex items-center justify-center px-4 relative">
        {/* Felt texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-xl bg-[#c9a959] border-4 border-[#8a7025] flex items-center justify-center mx-auto mb-6 shadow-[0_4px_0_#8a7025,_3px_3px_10px_rgba(0,0,0,0.3)]">
            <span className="text-2xl font-bold text-[#2d2a26]">E60</span>
          </div>
          <h1 className="text-h2 text-[#f7f3eb] mb-3">Connect to Play</h1>
          <p className="text-[#b8c4b0] mb-8">
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
      <div className="min-h-screen bg-[#1e3a2f] flex items-center justify-center relative">
        {/* Felt texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative text-center">
          <div className="w-12 h-12 border-4 border-[#c9a959] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#b8c4b0]">Connecting to game server...</p>
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
    <div className="min-h-screen bg-[#1e3a2f] pt-20 pb-12 px-4 relative">
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-lg bg-[#fffef8] border-2 border-[#c9bda8] flex items-center justify-center text-[#4a3023] hover:bg-[#f7f3eb] transition-colors shadow-[2px_2px_6px_rgba(0,0,0,0.15)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-h2 text-[#f7f3eb]">Select Game</h1>
              <p className="text-[#b8c4b0] text-sm mt-0.5">
                Choose a game mode and set your stake
              </p>
            </div>
          </div>

          {/* Balance LCD */}
          <div className="px-4 py-3 rounded-lg bg-[#111510] border-2 border-[#2a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
            <div className="text-xs text-[#5a8a6b] mb-0.5">Balance</div>
            <div
              className="text-lg font-bold font-mono text-[#7aff9a]"
              style={{ textShadow: "0 0 8px rgba(122, 255, 154, 0.5)" }}
            >
              {formatUSDC(balance)}
            </div>
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
                <div className="mt-6 p-5 rounded-xl bg-[#fffef8] border-2 border-[#c17a4a] shadow-[3px_3px_10px_rgba(0,0,0,0.15)]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#f5ebe5] border-2 border-[#c17a4a40] flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 rounded bg-[#c17a4a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2d2a26] mb-1">
                        No Balance
                      </h3>
                      <p className="text-[#6b5e4f] text-sm mb-3">
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
