"use client";

import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { GameType, GAME_CONFIGS } from "../../types";
import { getGameColor, formatUSDC, cn } from "../../lib/utils";

interface GameCardProps {
  gameType: GameType;
  onSelect: (gameType: GameType) => void;
  disabled?: boolean;
}

const GAME_BG_COLORS: Record<string, string> = {
  REACTION_RACE: "#f5ebe5",
  MEMORY_MATCH: "#f0ebf2",
  QUICK_MATH: "#e8f0f2",
  PATTERN_TAP: "#e8f0eb",
};

const GAME_COLORS: Record<string, string> = {
  REACTION_RACE: "#c17a4a",
  MEMORY_MATCH: "#8a6b9a",
  QUICK_MATH: "#4a8a9a",
  PATTERN_TAP: "#5a8a6b",
};

export function GameCard({ gameType, onSelect, disabled }: GameCardProps) {
  const config = GAME_CONFIGS[gameType];
  const color = GAME_COLORS[gameType] || getGameColor(gameType);
  const bgColor = GAME_BG_COLORS[gameType] || "#f8fafc";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200",
        // Ivory card stock appearance
        "bg-[#fffef8] border-2 border-[#c9bda8]",
        "shadow-[3px_3px_12px_rgba(0,0,0,0.12)]",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-[4px_4px_16px_rgba(0,0,0,0.18)] hover:-translate-y-1",
      )}
      onClick={() => !disabled && onSelect(gameType)}
    >
      {/* Top accent bar - like colored card edge */}
      <div
        className="absolute top-0 left-4 right-4 h-1.5 rounded-b-full"
        style={{ backgroundColor: color }}
      />

      <div className="p-6 pt-7">
        <div className="flex items-start justify-between mb-4">
          {/* Game icon */}
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center border-2 shadow-[2px_2px_6px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: bgColor, borderColor: color + "30" }}
          >
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: color }}
            />
          </div>

          {/* Duration & rounds */}
          <div className="flex items-center gap-2 text-sm text-[#6b5e4f]">
            <span className="font-mono">{config.duration}s</span>
            <span className="w-1 h-1 rounded-full bg-[#c9bda8]" />
            <span>
              {config.rounds} {config.rounds === 1 ? "round" : "rounds"}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-[#2d2a26] mb-2 font-heading">
          {config.name}
        </h3>
        <p className="text-[#6b5e4f] text-sm mb-5">{config.description}</p>

        <div className="flex items-center justify-between">
          {/* Stake range in LCD style */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#111510] border border-[#2a3525]">
            <span
              className="text-xs font-mono text-[#7aff9a]"
              style={{ textShadow: "0 0 4px rgba(122, 255, 154, 0.4)" }}
            >
              {formatUSDC(config.minStake)} – {formatUSDC(config.maxStake)}
            </span>
          </div>

          <Button size="sm" variant="secondary" disabled={disabled}>
            Play
          </Button>
        </div>
      </div>
    </div>
  );
}

interface GameSelectorProps {
  onSelect: (gameType: GameType) => void;
  disabled?: boolean;
}

export function GameSelector({ onSelect, disabled }: GameSelectorProps) {
  const gameTypes = Object.keys(GAME_CONFIGS) as GameType[];

  return (
    <div className="grid sm:grid-cols-2 gap-5">
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
