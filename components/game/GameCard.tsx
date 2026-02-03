"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { GameType, GAME_CONFIGS } from "../../types";
import { getGameEmoji, getGameColor, formatUSDC } from "../../lib/utils";

interface GameCardProps {
  gameType: GameType;
  onSelect: (gameType: GameType) => void;
  disabled?: boolean;
}

export function GameCard({ gameType, onSelect, disabled }: GameCardProps) {
  const config = GAME_CONFIGS[gameType];
  const emoji = getGameEmoji(gameType);
  const colorClass = getGameColor(gameType);

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card
        hover={!disabled}
        className={`relative overflow-hidden cursor-pointer ${disabled ? "opacity-50" : ""
          }`}
        onClick={() => !disabled && onSelect(gameType)}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10`}
        />

        <CardContent className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">{emoji}</span>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
              {config.duration}s
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{config.name}</h3>
          <p className="text-sm text-zinc-400 mb-4">{config.description}</p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              Stake: {formatUSDC(config.minStake)} - {formatUSDC(config.maxStake)}
            </span>
            <span className="text-zinc-500">{config.rounds} rounds</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className={`mt-4 w-full bg-gradient-to-r ${colorClass}`}
            disabled={disabled}
          >
            Play Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface GameSelectorProps {
  onSelect: (gameType: GameType) => void;
  disabled?: boolean;
}

export function GameSelector({ onSelect, disabled }: GameSelectorProps) {
  const gameTypes = Object.keys(GAME_CONFIGS) as GameType[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {gameTypes.map((type) => (
        <GameCard
          key={type}
          gameType={type}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
