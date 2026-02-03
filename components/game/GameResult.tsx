"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Button } from "../ui/Button";
import { formatUSDC, cn } from "../../lib/utils";

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
  useEffect(() => {
    if (won) {
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#4f46e5", "#818cf8", "#22c55e"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#4f46e5", "#818cf8", "#22c55e"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [won]);

  const title = isTie ? "It's a Draw" : won ? "You Won!" : "You Lost";
  const subtitle = isTie
    ? "Stakes have been returned"
    : won
      ? "Congratulations on your victory"
      : "Better luck next time";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={cn(
          "py-8 px-6 text-center",
          isTie ? "bg-slate-100" : won ? "bg-green-50" : "bg-red-50"
        )}>
          <h2 className={cn(
            "text-3xl font-bold font-heading mb-2",
            isTie ? "text-slate-900" : won ? "text-green-600" : "text-red-500"
          )}>
            {title}
          </h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Score */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 font-heading">{myScore}</div>
              <div className="text-sm text-slate-500 mt-1">You</div>
            </div>
            <div className="text-2xl font-bold text-slate-300">–</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 font-heading">{opponentScore}</div>
              <div className="text-sm text-slate-500 mt-1">Opponent</div>
            </div>
          </div>

          {/* Payout */}
          <div className={cn(
            "p-4 rounded-xl text-center mb-6",
            isTie ? "bg-slate-50" : won ? "bg-green-50" : "bg-red-50"
          )}>
            <div className="text-sm text-slate-500 mb-1">
              {isTie ? "Returned" : won ? "Winnings" : "Lost"}
            </div>
            <div className={cn(
              "text-2xl font-bold font-heading",
              isTie ? "text-slate-900" : won ? "text-green-600" : "text-red-500"
            )}>
              {won || isTie ? "+" : "-"}{formatUSDC(payout)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onExit} className="flex-1">
              Exit
            </Button>
            <Button onClick={onPlayAgain} className="flex-1">
              Play Again
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
