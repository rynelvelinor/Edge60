"use client";

import { useState, useEffect } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { LeaderboardEntry, Address } from "../../types";
import { formatUSDC, formatPercentage, shortenAddress, cn } from "../../lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Mock data
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

for (let i = 6; i <= 20; i++) {
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
    setTimeout(() => {
      setLeaderboard(MOCK_LEADERBOARD);
      setIsLoading(false);
    }, 300);
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

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-700 border-amber-200";
    if (rank === 2) return "bg-slate-100 text-slate-600 border-slate-200";
    if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-slate-50 text-slate-500 border-slate-100";
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-h2 text-slate-900">Leaderboard</h1>
            <p className="text-slate-600 text-sm mt-0.5">
              Top players ranked by skill score
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 font-heading">{leaderboard.length}</div>
            <div className="text-sm text-slate-500 mt-1">Total Players</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 font-heading">
              {formatUSDC(leaderboard.reduce((sum, p) => sum + p.totalVolume, BigInt(0)))}
            </div>
            <div className="text-sm text-slate-500 mt-1">Total Volume</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 font-heading">
              {leaderboard.reduce((sum, p) => sum + p.totalWins, 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 mt-1">Total Matches</div>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2 mb-6 p-1.5 rounded-xl bg-white border border-slate-200 inline-flex">
          {[
            { key: "rank", label: "Rank" },
            { key: "skillScore", label: "Score" },
            { key: "winRate", label: "Win Rate" },
            { key: "totalVolume", label: "Volume" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as SortKey)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                sortBy === option.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedLeaderboard.map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold border",
                    getRankStyle(entry.rank)
                  )}>
                    {entry.rank}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar address={entry.address} name={entry.ensName} size="md" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {entry.ensName || shortenAddress(entry.address)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {entry.totalWins} wins
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-8">
                    <div className="text-right w-20">
                      <div className="font-semibold text-slate-900">{entry.skillScore}</div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                    <div className="text-right w-16">
                      <div className="font-semibold text-green-600">{formatPercentage(entry.winRate)}</div>
                      <div className="text-xs text-slate-500">Win %</div>
                    </div>
                    <div className="text-right w-28">
                      <div className="font-semibold text-slate-900">{formatUSDC(entry.totalVolume)}</div>
                      <div className="text-xs text-slate-500">Volume</div>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="sm:hidden text-right">
                    <div className="font-semibold text-slate-900">{entry.skillScore}</div>
                    <div className="text-sm text-green-600">{formatPercentage(entry.winRate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
