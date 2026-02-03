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
  REACTION_RACE: "#fff7ed",
  MEMORY_MATCH: "#faf5ff",
  QUICK_MATH: "#ecfeff",
  PATTERN_TAP: "#f0fdf4",
};

export function GameCard({ gameType, onSelect, disabled }: GameCardProps) {
  const config = GAME_CONFIGS[gameType];
  const color = getGameColor(gameType);
  const bgColor = GAME_BG_COLORS[gameType] || "#f8fafc";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5"
      )}
      onClick={() => !disabled && onSelect(gameType)}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />

      <CardContent className="pt-7">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <div
              className="w-6 h-6 rounded-lg"
              style={{ backgroundColor: color }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{config.duration}s</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{config.rounds} {config.rounds === 1 ? 'round' : 'rounds'}</span>
          </div>
        </div>

        <h3 className="text-h3 text-slate-900 mb-2">{config.name}</h3>
        <p className="text-slate-600 text-sm mb-5">{config.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {formatUSDC(config.minStake)} – {formatUSDC(config.maxStake)}
          </span>
          <Button size="sm" variant="secondary" disabled={disabled}>
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
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
