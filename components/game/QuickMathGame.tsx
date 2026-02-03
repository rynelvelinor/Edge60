"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  GameState,
  QuickMathData,
  Address,
  GameAction
} from "../../types";
import { formatTime } from "../../lib/utils";
import { Calculator, Clock, Check, X } from "lucide-react";

interface QuickMathGameProps {
  gameState: GameState;
  myAddress: Address;
  scores: Record<string, number>;
  onAction: (action: GameAction) => void;
}

export function QuickMathGame({
  gameState,
  myAddress,
  scores,
  onAction,
}: QuickMathGameProps) {
  const data = gameState.data as QuickMathData;
  const [answer, setAnswer] = useState("");
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);

  const currentProblem = data.problems[data.currentProblemIndex];
  const isAnswered = currentProblem?.answeredBy !== undefined;

  // Reset input on new problem
  useEffect(() => {
    setAnswer("");
    setLastResult(null);
  }, [data.currentProblemIndex]);

  // Show result feedback
  useEffect(() => {
    if (currentProblem?.answeredBy) {
      setLastResult(currentProblem.answeredCorrectly ? "correct" : "wrong");
    }
  }, [currentProblem]);

  const handleSubmit = useCallback(() => {
    if (!answer || isAnswered) return;

    const numAnswer = parseInt(answer, 10);
    if (isNaN(numAnswer)) return;

    onAction({
      type: "MATH_ANSWER",
      answer: numAnswer,
      problemIndex: data.currentProblemIndex,
    });

    setAnswer("");
  }, [answer, isAnswered, data.currentProblemIndex, onAction]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  const myScore = scores[myAddress] ?? 0;
  const opponentAddress = Object.keys(scores).find((a) => a !== myAddress);
  const opponentScore = opponentAddress ? scores[opponentAddress] ?? 0 : 0;

  const progress = ((data.currentProblemIndex + 1) / data.problems.length) * 100;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-400" />
          <span className="text-white font-medium">Quick Math</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="h-4 w-4" />
          {formatTime(gameState.timeRemaining)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Scores */}
      <Card variant="glass" className="mb-6 p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm text-zinc-400">You</p>
            <p className="text-2xl font-bold text-white">{myScore}</p>
          </div>
          <div className="text-lg text-zinc-600">
            {data.currentProblemIndex + 1}/{data.problems.length}
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400">Opponent</p>
            <p className="text-2xl font-bold text-white">{opponentScore}</p>
          </div>
        </div>
      </Card>

      {/* Problem Display */}
      <Card variant="gradient" className="mb-6">
        <CardContent className="py-12 text-center">
          <AnimatePresence mode="wait">
            {currentProblem && (
              <motion.div
                key={data.currentProblemIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-5xl font-bold text-white mb-4">
                  {currentProblem.question} = ?
                </p>

                {/* Result feedback */}
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${lastResult === "correct"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {lastResult === "correct" ? (
                        <>
                          <Check className="h-5 w-5" />
                          Correct! Answer: {currentProblem.answer}
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5" />
                          Wrong! Answer: {currentProblem.answer}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Answer Input */}
      <div className="flex gap-3">
        <Input
          type="number"
          placeholder="Your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isAnswered}
          className="flex-1 text-2xl text-center"
          autoFocus
        />
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!answer || isAnswered}
        >
          Submit
        </Button>
      </div>

      {/* Number Pad (Mobile) */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "-", 0, "⌫"].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (num === "⌫") {
                setAnswer((prev) => prev.slice(0, -1));
              } else {
                setAnswer((prev) => prev + num);
              }
            }}
            disabled={isAnswered}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xl font-medium py-4 rounded-xl disabled:opacity-50"
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
