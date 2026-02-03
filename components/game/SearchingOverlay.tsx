"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { GameType, GAME_CONFIGS } from "../../types";
import { formatUSDC, getGameEmoji } from "../../lib/utils";
import { Search, X } from "lucide-react";

interface SearchingOverlayProps {
  gameType: GameType;
  stake: bigint;
  onCancel: () => void;
}

export function SearchingOverlay({
  gameType,
  stake,
  onCancel,
}: SearchingOverlayProps) {
  const config = GAME_CONFIGS[gameType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-zinc-900 rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-zinc-800"
      >
        {/* Animated search icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-indigo-600/20 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
            className="absolute inset-2 bg-indigo-600/30 rounded-full"
          />
          <div className="absolute inset-4 bg-indigo-600 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Search className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Finding Opponent...
        </h2>
        <p className="text-zinc-400 mb-6">
          Looking for a worthy challenger
        </p>

        {/* Game info */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">{getGameEmoji(gameType)}</span>
            <span className="text-lg font-medium text-white">
              {config.name}
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {formatUSDC(stake)}
          </div>
          <p className="text-sm text-zinc-500">stake</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-indigo-500 rounded-full"
            />
          ))}
        </div>

        {/* Cancel button */}
        <Button variant="ghost" onClick={onCancel} className="group">
          <X className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
          Cancel Search
        </Button>
      </motion.div>
    </motion.div>
  );
}
