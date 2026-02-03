"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import {
  GameState,
  ReactionRaceData,
  Address,
  GameAction
} from "../../types";
import { formatTime, formatReactionTime } from "../../lib/utils";
import { Zap, Clock, Trophy } from "lucide-react";

interface ReactionRaceGameProps {
  gameState: GameState;
  myAddress: Address;
  scores: Record<string, number>;
  onAction: (action: GameAction) => void;
}

export function ReactionRaceGame({
  gameState,
  myAddress,
  scores,
  onAction,
}: ReactionRaceGameProps) {
  const data = gameState.data as ReactionRaceData;
  const [canTap, setCanTap] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [localTapTime, setLocalTapTime] = useState<number | null>(null);

  // Reset tap state on new round
  useEffect(() => {
    if (data.waiting) {
      setTapped(false);
      setLocalTapTime(null);
      setCanTap(false);
    } else if (data.targetTime && !tapped) {
      setCanTap(true);
    }
  }, [data.waiting, data.targetTime, tapped]);

  const handleTap = useCallback(() => {
    if (!canTap || tapped) return;

    const timestamp = Date.now();
    setTapped(true);
    setCanTap(false);

    if (data.targetTime) {
      setLocalTapTime(timestamp - data.targetTime);
    }

    onAction({
      type: "REACTION_TAP",
      timestamp,
    });
  }, [canTap, tapped, data.targetTime, onAction]);

  // Handle keyboard/touch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap]);

  const myScore = scores[myAddress] ?? 0;
  const opponentAddress = Object.keys(scores).find((a) => a !== myAddress);
  const opponentScore = opponentAddress ? scores[opponentAddress] ?? 0 : 0;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-white font-medium">Reaction Race</span>
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
          <div className="text-lg text-zinc-600">
            Round {data.currentRound + 1}/{gameState.maxRounds}
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400">Opponent</p>
            <p className="text-2xl font-bold text-white">{opponentScore}</p>
          </div>
        </div>
      </Card>

      {/* Tap Area */}
      <motion.div
        className={`relative h-64 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-colors ${data.waiting
            ? "bg-zinc-800"
            : canTap
              ? "bg-green-600 hover:bg-green-500"
              : tapped
                ? "bg-indigo-600"
                : "bg-zinc-800"
          }`}
        onClick={handleTap}
        whileTap={canTap ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          {data.waiting ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl mb-4"
              >
                ⏳
              </motion.div>
              <p className="text-xl text-zinc-400">Wait for it...</p>
              <p className="text-sm text-zinc-500 mt-2">
                Tap when the screen turns green
              </p>
            </motion.div>
          ) : canTap ? (
            <motion.div
              key="tap"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <p className="text-3xl font-bold text-white">TAP NOW!</p>
            </motion.div>
          ) : tapped ? (
            <motion.div
              key="tapped"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">✓</div>
              {localTapTime !== null && (
                <p className="text-2xl font-bold text-white">
                  {formatReactionTime(localTapTime)}
                </p>
              )}
              <p className="text-sm text-indigo-200 mt-2">
                Waiting for opponent...
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Instructions */}
      <p className="text-center text-zinc-500 text-sm mt-4">
        Press <kbd className="bg-zinc-800 px-2 py-1 rounded">Space</kbd> or tap
        the area
      </p>

      {/* Recent Times */}
      {data.playerATimes.length > 0 && (
        <Card variant="glass" className="mt-6 p-4">
          <p className="text-sm text-zinc-400 mb-2">Your recent times</p>
          <div className="flex gap-2 flex-wrap">
            {data.playerATimes.slice(-5).map((time, i) => (
              <span
                key={i}
                className="bg-zinc-800 px-3 py-1 rounded-full text-sm text-white"
              >
                {formatReactionTime(time)}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
