"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { formatUSDC } from "../../lib/utils";
import { Trophy, Frown, Handshake, ArrowRight } from "lucide-react";

interface GameResultProps {
  won: boolean;
  isTie: boolean;
  myScore: number;
  opponentScore: number;
  payout: bigint;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function GameResult({
  won,
  isTie,
  myScore,
  opponentScore,
  payout,
  onPlayAgain,
  onExit,
}: GameResultProps) {
  // Trigger confetti on win
  useEffect(() => {
    if (won) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#6366f1", "#8b5cf6", "#a78bfa"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#6366f1", "#8b5cf6", "#a78bfa"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [won]);

  const ResultIcon = isTie ? Handshake : won ? Trophy : Frown;
  const resultColor = isTie
    ? "text-yellow-400"
    : won
      ? "text-green-400"
      : "text-red-400";
  const resultBg = isTie
    ? "from-yellow-600/20 to-orange-600/20"
    : won
      ? "from-green-600/20 to-emerald-600/20"
      : "from-red-600/20 to-rose-600/20";
  const resultTitle = isTie ? "It's a Tie!" : won ? "Victory!" : "Defeat";
  const resultMessage = isTie
    ? "Well matched! Stakes returned."
    : won
      ? "Congratulations on your win!"
      : "Better luck next time!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <Card variant="gradient" className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${resultBg} flex items-center justify-center`}
            >
              <ResultIcon className={`h-12 w-12 ${resultColor}`} />
            </motion.div>

            {/* Result Text */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl font-bold ${resultColor} mb-2`}
            >
              {resultTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 mb-8"
            >
              {resultMessage}
            </motion.p>

            {/* Scores */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-800/50 rounded-xl p-4 mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <p className="text-zinc-400 text-sm mb-1">You</p>
                  <p className="text-3xl font-bold text-white">{myScore}</p>
                </div>
                <div className="text-2xl font-bold text-zinc-600 px-4">-</div>
                <div className="text-center flex-1">
                  <p className="text-zinc-400 text-sm mb-1">Opponent</p>
                  <p className="text-3xl font-bold text-white">{opponentScore}</p>
                </div>
              </div>

              {/* Payout */}
              <div className="border-t border-zinc-700 pt-4">
                <p className="text-sm text-zinc-400 mb-1">
                  {isTie ? "Returned" : won ? "Winnings" : "Lost"}
                </p>
                <p
                  className={`text-2xl font-bold ${isTie
                      ? "text-yellow-400"
                      : won
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                >
                  {won || isTie ? "+" : "-"}
                  {formatUSDC(payout)}
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button variant="ghost" onClick={onExit} className="flex-1">
                Exit
              </Button>
              <Button
                variant="primary"
                onClick={onPlayAgain}
                className="flex-1 group"
              >
                Play Again
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
