"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { LeaderboardEntry, Address } from "../../types";
import { formatUSDC, formatPercentage, shortenAddress } from "../../lib/utils";
import { Trophy, Medal, Award, TrendingUp, Crown } from "lucide-react";

// Mock data - in production, fetch from API
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x1234567890123456789012345678901234567890" as Address,
    ensName: "vitalik.eth",
    winRate: 78.5,
    totalVolume: BigInt(125000_000_000),
    skillScore: 2450,
    totalWins: 342,
  },
  {
    rank: 2,
    address: "0x2345678901234567890123456789012345678901" as Address,
    ensName: "flashmaster.eth",
    winRate: 72.3,
    totalVolume: BigInt(98000_000_000),
    skillScore: 2380,
    totalWins: 287,
  },
  {
    rank: 3,
    address: "0x3456789012345678901234567890123456789012" as Address,
    winRate: 69.8,
    totalVolume: BigInt(87500_000_000),
    skillScore: 2290,
    totalWins: 256,
  },
  {
    rank: 4,
    address: "0x4567890123456789012345678901234567890123" as Address,
    ensName: "speedking.eth",
    winRate: 67.2,
    totalVolume: BigInt(76000_000_000),
    skillScore: 2150,
    totalWins: 234,
  },
  {
    rank: 5,
    address: "0x5678901234567890123456789012345678901234" as Address,
    winRate: 65.5,
    totalVolume: BigInt(65000_000_000),
    skillScore: 2080,
    totalWins: 198,
  },
];

// Extend mock data
for (let i = 6; i <= 50; i++) {
  MOCK_LEADERBOARD.push({
    rank: i,
    address: `0x${i.toString().padStart(40, "0")}` as Address,
    winRate: 65 - i * 0.5,
    totalVolume: BigInt(Math.floor((70000 - i * 1000) * 1_000_000)),
    skillScore: 2000 - i * 15,
    totalWins: Math.floor(200 - i * 3),
  });
}

type SortKey = "rank" | "winRate" | "totalVolume" | "skillScore";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("rank");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setLeaderboard(MOCK_LEADERBOARD);
      setIsLoading(false);
    }, 500);
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case "winRate":
        return b.winRate - a.winRate;
      case "totalVolume":
        return Number(b.totalVolume - a.totalVolume);
      case "skillScore":
        return b.skillScore - a.skillScore;
      default:
        return a.rank - b.rank;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-zinc-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-zinc-500 text-sm">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-zinc-400/10 to-zinc-300/10 border-zinc-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30";
      default:
        return "bg-zinc-900/50 border-zinc-800";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </motion.div>
          <p className="text-zinc-400">Top FlashStake competitors</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card variant="glass" className="text-center py-4">
            <p className="text-2xl font-bold text-white">{leaderboard.length}</p>
            <p className="text-xs text-zinc-400">Total Players</p>
          </Card>
          <Card variant="glass" className="text-center py-4">
            <p className="text-2xl font-bold text-white">
              {formatUSDC(
                leaderboard.reduce((sum, p) => sum + p.totalVolume, BigInt(0))
              )}
            </p>
            <p className="text-xs text-zinc-400">Total Volume</p>
          </Card>
          <Card variant="glass" className="text-center py-4">
            <p className="text-2xl font-bold text-white">
              {leaderboard.reduce((sum, p) => sum + p.totalWins, 0).toLocaleString()}
            </p>
            <p className="text-xs text-zinc-400">Total Matches</p>
          </Card>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "rank", label: "Rank" },
            { key: "skillScore", label: "Skill Score" },
            { key: "winRate", label: "Win Rate" },
            { key: "totalVolume", label: "Volume" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as SortKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${sortBy === option.key
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-zinc-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedLeaderboard.map((entry, index) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  className={`border ${getRankBg(entry.rank)} hover:border-zinc-600 transition-colors`}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-10 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Player */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar
                          address={entry.address}
                          name={entry.ensName}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">
                            {entry.ensName || shortenAddress(entry.address)}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {entry.totalWins} wins
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">Skill</p>
                          <p className="text-white font-medium">
                            {entry.skillScore}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">Win Rate</p>
                          <p className="text-green-400 font-medium">
                            {formatPercentage(entry.winRate)}
                          </p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-zinc-400">Volume</p>
                          <p className="text-white font-medium">
                            {formatUSDC(entry.totalVolume)}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Stats */}
                      <div className="sm:hidden text-right">
                        <p className="text-white font-medium">{entry.skillScore}</p>
                        <p className="text-xs text-green-400">
                          {formatPercentage(entry.winRate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
