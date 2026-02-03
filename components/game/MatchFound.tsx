"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Match, GameType, GAME_CONFIGS } from "../../types";
import { formatUSDC, getGameEmoji } from "../../lib/utils";
import { formatAddressOrENS } from "../../lib/ens";
import { useOpponentENS } from "../../hooks/useENS";
import { CheckCircle, Clock } from "lucide-react";

interface MatchFoundProps {
  match: Match;
  myAddress: string;
  isReady: boolean;
  opponentReady: boolean;
  onReady: () => void;
}

export function MatchFound({
  match,
  myAddress,
  isReady,
  opponentReady,
  onReady,
}: MatchFoundProps) {
  const [countdown, setCountdown] = useState(10);
  const config = GAME_CONFIGS[match.gameType];

  const isPlayerA = match.playerA.address === myAddress;
  const opponent = isPlayerA ? match.playerB : match.playerA;
  const { ensName, avatar } = useOpponentENS(opponent.address);

  // Auto-ready countdown
  useEffect(() => {
    if (isReady) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onReady();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReady, onReady]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto"
    >
      <Card variant="gradient">
        <CardContent className="text-center">
          {/* Match Header */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-6"
          >
            <span className="text-5xl mb-4 block">{getGameEmoji(match.gameType)}</span>
            <h2 className="text-2xl font-bold text-white mb-2">Match Found!</h2>
            <p className="text-zinc-400">{config.name}</p>
          </motion.div>

          {/* VS Display */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* You */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar
                  address={myAddress}
                  size="xl"
                />
                <AnimatePresence>
                  {isReady && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-2 text-white font-medium">You</p>
              <span className="text-xs text-zinc-500">
                {formatAddressOrENS(myAddress as `0x${string}`)}
              </span>
            </div>

            {/* VS */}
            <div className="text-4xl font-bold text-zinc-600">VS</div>

            {/* Opponent */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar
                  src={avatar}
                  address={opponent.address}
                  name={ensName || undefined}
                  size="xl"
                />
                <AnimatePresence>
                  {opponentReady && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-2 text-white font-medium">
                {ensName || "Opponent"}
              </p>
              <span className="text-xs text-zinc-500">
                {formatAddressOrENS(opponent.address, ensName)}
              </span>
            </div>
          </div>

          {/* Stake Info */}
          <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Pot</span>
              <span className="text-xl font-bold text-white">
                {formatUSDC(match.stake * BigInt(2))}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-zinc-400">Your Stake</span>
              <span className="text-white">{formatUSDC(match.stake)}</span>
            </div>
          </div>

          {/* Ready Button */}
          {!isReady ? (
            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={onReady}
                className="w-full"
              >
                Ready to Play
              </Button>
              <p className="mt-3 text-zinc-500 text-sm flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Auto-ready in {countdown}s
              </p>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-flex items-center gap-2 text-green-400"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Ready!</span>
              </motion.div>
              {!opponentReady && (
                <p className="mt-2 text-zinc-500 text-sm">
                  Waiting for opponent...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
