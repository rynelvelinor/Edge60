"use client";

import { GameState, GameType, Address, GameAction } from "../../types";
import { ReactionRaceGame } from "./ReactionRaceGame";
import { MemoryMatchGame } from "./MemoryMatchGame";
import { QuickMathGame } from "./QuickMathGame";
import { PatternTapGame } from "./PatternTapGame";

interface ActiveGameProps {
  gameState: GameState;
  myAddress: Address;
  scores: Record<string, number>;
  onAction: (action: GameAction) => void;
}

export function ActiveGame({
  gameState,
  myAddress,
  scores,
  onAction,
}: ActiveGameProps) {
  switch (gameState.type) {
    case GameType.REACTION_RACE:
      return (
        <ReactionRaceGame
          gameState={gameState}
          myAddress={myAddress}
          scores={scores}
          onAction={onAction}
        />
      );

    case GameType.MEMORY_MATCH:
      return (
        <MemoryMatchGame
          gameState={gameState}
          myAddress={myAddress}
          scores={scores}
          onAction={onAction}
        />
      );

    case GameType.QUICK_MATH:
      return (
        <QuickMathGame
          gameState={gameState}
          myAddress={myAddress}
          scores={scores}
          onAction={onAction}
        />
      );

    case GameType.PATTERN_TAP:
      return (
        <PatternTapGame
          gameState={gameState}
          myAddress={myAddress}
          scores={scores}
          onAction={onAction}
        />
      );

    default:
      return (
        <div className="text-center text-zinc-400">
          Unknown game type: {gameState.type}
        </div>
      );
  }
}
