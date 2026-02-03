"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/Card";
import {
  GameState,
  PatternTapData,
  Address,
  GameAction
} from "../../types";
import { formatTime, cn } from "../../lib/utils";
import { Target, Clock, Eye, Hand } from "lucide-react";

interface PatternTapGameProps {
  gameState: GameState;
  myAddress: Address;
  scores: Record<string, number>;
  onAction: (action: GameAction) => void;
}

const COLORS = [
  "bg-red-500 hover:bg-red-400",
  "bg-blue-500 hover:bg-blue-400",
  "bg-green-500 hover:bg-green-400",
  "bg-yellow-500 hover:bg-yellow-400",
];

const FLASH_COLORS = [
  "bg-red-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-yellow-300",
];

export function PatternTapGame({
  gameState,
  myAddress,
  scores,
  onAction,
}: PatternTapGameProps) {
  const data = gameState.data as PatternTapData;
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);

  const isShowingPattern = data.showingPattern;
  const canInput = !isShowingPattern && data.pattern.length > 0;

  // Play pattern animation
  useEffect(() => {
    if (!isShowingPattern || data.pattern.length === 0) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < data.pattern.length) {
        setFlashingIndex(data.pattern[i]);
        setTimeout(() => setFlashingIndex(null), 400);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isShowingPattern, data.pattern]);

  // Reset user sequence when pattern changes
  useEffect(() => {
    setUserSequence([]);
  }, [data.pattern.length]);

  const handleButtonClick = useCallback(
    (index: number) => {
      if (!canInput) return;

      const newSequence = [...userSequence, index];
      setUserSequence(newSequence);

      // Flash the button
      setFlashingIndex(index);
      setTimeout(() => setFlashingIndex(null), 200);

      // Check if wrong
      if (data.pattern[newSequence.length - 1] !== index) {
        // Wrong - send and reset
        onAction({
          type: "PATTERN_TAP",
          sequence: newSequence,
        });
        setUserSequence([]);
        return;
      }

      // Check if complete
      if (newSequence.length === data.pattern.length) {
        onAction({
          type: "PATTERN_TAP",
          sequence: newSequence,
        });
        setUserSequence([]);
      }
    },
    [canInput, userSequence, data.pattern, onAction]
  );

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        q: 0,
        w: 1,
        e: 2,
        r: 3,
      };

      if (keyMap[e.key.toLowerCase()] !== undefined) {
        handleButtonClick(keyMap[e.key.toLowerCase()]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleButtonClick]);

  const myScore = scores[myAddress] ?? 0;
  const opponentAddress = Object.keys(scores).find((a) => a !== myAddress);
  const opponentScore = opponentAddress ? scores[opponentAddress] ?? 0 : 0;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-400" />
          <span className="text-white font-medium">Pattern Tap</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="h-4 w-4" />
          {formatTime(gameState.timeRemaining)}
        </div>
      </div>

      {/* Scores */}
      <Card variant="glass" className="mb-6 p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm text-zinc-400">You</p>
            <p className="text-2xl font-bold text-white">{myScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400">Pattern Length</p>
            <p className="text-2xl font-bold text-green-400">
              {data.pattern.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400">Opponent</p>
            <p className="text-2xl font-bold text-white">{opponentScore}</p>
          </div>
        </div>
      </Card>

      {/* State Indicator */}
      <Card
        variant="glass"
        className={cn(
          "mb-6 p-4 text-center transition-colors",
          isShowingPattern
            ? "border-yellow-500 bg-yellow-500/10"
            : "border-green-500 bg-green-500/10"
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {isShowingPattern ? (
            <>
              <Eye className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-medium text-white">
                Watch the pattern...
              </span>
            </>
          ) : (
            <>
              <Hand className="h-5 w-5 text-green-400" />
              <span className="text-lg font-medium text-white">
                Your turn! Repeat the pattern
              </span>
            </>
          )}
        </div>
      </Card>

      {/* Pattern Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={!canInput}
            className={cn(
              "aspect-square rounded-2xl transition-all",
              "focus:outline-none focus:ring-4 focus:ring-white/30",
              flashingIndex === index ? FLASH_COLORS[index] : COLORS[index],
              !canInput && "opacity-70 cursor-not-allowed"
            )}
            whileHover={canInput ? { scale: 1.02 } : {}}
            whileTap={canInput ? { scale: 0.95 } : {}}
            animate={{
              scale: flashingIndex === index ? 1.1 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      {canInput && data.pattern.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-zinc-400 text-center mb-2">Progress</p>
          <div className="flex justify-center gap-2">
            {data.pattern.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  i < userSequence.length
                    ? userSequence[i] === data.pattern[i]
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-zinc-700"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <p className="text-center text-zinc-500 text-sm mt-6">
        Use keys <kbd className="bg-zinc-800 px-2 py-1 rounded">1-4</kbd> or{" "}
        <kbd className="bg-zinc-800 px-2 py-1 rounded">Q W E R</kbd>
      </p>
    </div>
  );
}
