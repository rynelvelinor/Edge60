"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import {
  GameState,
  MemoryMatchData,
  MemoryCard,
  Address,
  GameAction
} from "../../types";
import { formatTime, cn } from "../../lib/utils";
import { Brain, Clock } from "lucide-react";

interface MemoryMatchGameProps {
  gameState: GameState;
  myAddress: Address;
  scores: Record<string, number>;
  onAction: (action: GameAction) => void;
}

export function MemoryMatchGame({
  gameState,
  myAddress,
  scores,
  onAction,
}: MemoryMatchGameProps) {
  const data = gameState.data as MemoryMatchData;
  const [flipping, setFlipping] = useState<number | null>(null);

  const isMyTurn = data.currentTurn === myAddress;
  const canFlip = isMyTurn && data.flippedCards.length < 2;

  const handleCardClick = (cardId: number) => {
    if (!canFlip) return;
    if (data.flippedCards.includes(cardId)) return;
    if (data.cards.find((c) => c.id === cardId)?.matched) return;

    setFlipping(cardId);

    onAction({
      type: "MEMORY_FLIP",
      cardId,
    });

    // Clear flipping state after animation
    setTimeout(() => setFlipping(null), 300);
  };

  const myScore = scores[myAddress] ?? 0;
  const opponentAddress = Object.keys(scores).find((a) => a !== myAddress);
  const opponentScore = opponentAddress ? scores[opponentAddress] ?? 0 : 0;

  const isCardVisible = (card: MemoryCard) =>
    card.matched || data.flippedCards.includes(card.id);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <span className="text-white font-medium">Memory Match</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="h-4 w-4" />
          {formatTime(gameState.timeRemaining)}
        </div>
      </div>

      {/* Turn Indicator */}
      <Card
        variant="glass"
        className={cn(
          "mb-6 p-4 text-center transition-colors",
          isMyTurn
            ? "border-purple-500 bg-purple-500/10"
            : "border-zinc-700"
        )}
      >
        <p className="text-lg font-medium text-white">
          {isMyTurn ? "Your Turn!" : "Opponent's Turn"}
        </p>
      </Card>

      {/* Scores */}
      <Card variant="glass" className="mb-6 p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm text-zinc-400">You</p>
            <p className="text-2xl font-bold text-white">{myScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400">Opponent</p>
            <p className="text-2xl font-bold text-white">{opponentScore}</p>
          </div>
        </div>
      </Card>

      {/* Card Grid */}
      <div className="grid grid-cols-4 gap-3">
        {data.cards.map((card) => {
          const isVisible = isCardVisible(card);
          const isMatched = card.matched;
          const isFlipping = flipping === card.id;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={!canFlip || isMatched || data.flippedCards.includes(card.id)}
              className={cn(
                "aspect-square rounded-xl text-3xl flex items-center justify-center transition-all",
                "focus:outline-none focus:ring-2 focus:ring-purple-500",
                isMatched
                  ? card.matchedBy === myAddress
                    ? "bg-purple-600/30 border-2 border-purple-500"
                    : "bg-red-600/30 border-2 border-red-500"
                  : isVisible
                    ? "bg-zinc-700"
                    : "bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
              )}
              whileHover={canFlip && !isMatched ? { scale: 1.05 } : {}}
              whileTap={canFlip && !isMatched ? { scale: 0.95 } : {}}
              animate={{
                rotateY: isFlipping ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {isVisible ? (
                  <motion.span
                    key="front"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {card.value}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-zinc-600"
                  >
                    ?
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-6 text-center text-zinc-500 text-sm">
        {data.cards.filter((c) => c.matched).length / 2} of{" "}
        {data.cards.length / 2} pairs found
      </div>
    </div>
  );
}
