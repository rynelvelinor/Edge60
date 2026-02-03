"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Match, GAME_CONFIGS } from "../../types";
import { formatUSDC, getGameColor, cn } from "../../lib/utils";
import { formatAddressOrENS } from "../../lib/ens";
import { useOpponentENS } from "../../hooks/useENS";
import { Check } from "lucide-react";

interface MatchFoundProps {
  match: Match;
  myAddress: string;
  isReady: boolean;
  opponentReady: boolean;
  onReady: () => void;
}

export function MatchFound({
  match,
  myAddress,
  isReady,
  opponentReady,
  onReady,
}: MatchFoundProps) {
  const [countdown, setCountdown] = useState(10);
  const config = GAME_CONFIGS[match.gameType];
  const gameColor = getGameColor(match.gameType);

  const isPlayerA = match.playerA.address === myAddress;
  const opponent = isPlayerA ? match.playerB : match.playerA;
  const { ensName, avatar } = useOpponentENS(opponent.address);

  useEffect(() => {
    if (isReady) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onReady();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReady, onReady]);

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-8 text-center">
        {/* Game indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: gameColor }}
          />
          <span className="text-sm font-medium text-slate-600">{config.name}</span>
        </div>

        <h2 className="text-h1 text-slate-900 mb-8">Match Found!</h2>

        {/* Players */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* You */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <Avatar address={myAddress} size="xl" />
              {isReady && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </div>
            <div className="font-medium text-slate-900">You</div>
            <div className="text-sm text-slate-500">
              {formatAddressOrENS(myAddress as `0x${string}`)}
            </div>
          </div>

          <div className="text-2xl font-bold text-slate-300">vs</div>

          {/* Opponent */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <Avatar src={avatar} address={opponent.address} name={ensName || undefined} size="xl" />
              {opponentReady && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </div>
            <div className="font-medium text-slate-900">
              {ensName || "Opponent"}
            </div>
            <div className="text-sm text-slate-500">
              {formatAddressOrENS(opponent.address, ensName)}
            </div>
          </div>
        </div>

        {/* Stakes */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Total Pot</span>
            <span className="text-lg font-bold text-slate-900 font-heading">
              {formatUSDC(match.stake * BigInt(2))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Your Stake</span>
            <span className="text-sm font-medium text-slate-700">{formatUSDC(match.stake)}</span>
          </div>
        </div>

        {/* Ready button */}
        {!isReady ? (
          <div>
            <Button size="lg" onClick={onReady} className="w-full">
              Ready
            </Button>
            <p className="text-sm text-slate-500 mt-3">
              Auto-ready in {countdown}s
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Check className="h-5 w-5" />
              <span className="font-semibold">You're ready!</span>
            </div>
            {!opponentReady && (
              <p className="text-sm text-slate-500">
                Waiting for opponent...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
