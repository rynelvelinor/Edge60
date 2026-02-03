"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { GameType, GAME_CONFIGS } from "../../types";
import { formatUSDC, getGameColor } from "../../lib/utils";

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
  const gameColor = getGameColor(gameType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-indigo-600"
          />
        </div>

        <h2 className="text-h2 text-slate-900 mb-2">Finding Opponent</h2>
        <p className="text-slate-500 mb-6">
          Looking for a worthy challenger...
        </p>

        {/* Game info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: gameColor }}
            />
            <span className="font-medium text-slate-900">{config.name}</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-heading">
            {formatUSDC(stake)}
          </div>
        </div>

        <Button variant="ghost" onClick={onCancel}>
          Cancel Search
        </Button>
      </motion.div>
    </motion.div>
  );
}
