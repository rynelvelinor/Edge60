"use client";

import { useState, useEffect } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { LeaderboardEntry, Address } from "../../types";
import {
  formatUSDC,
  formatPercentage,
  shortenAddress,
  cn,
} from "../../lib/utils";
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

  // Medal colors for top 3
  const getMedalStyle = (rank: number) => {
    if (rank === 1)
      return "bg-[#c9a959] border-[#8a7025] text-[#2d2a26] shadow-[0_2px_0_#8a7025]"; // Gold
    if (rank === 2)
      return "bg-[#a8a8a8] border-[#707070] text-[#2d2a26] shadow-[0_2px_0_#707070]"; // Silver
    if (rank === 3)
      return "bg-[#b87333] border-[#8a5525] text-[#2d2a26] shadow-[0_2px_0_#8a5525]"; // Bronze
    return "bg-[#f7f3eb] border-[#c9bda8] text-[#6b5e4f]"; // Default
  };

  return (
    <div className="min-h-screen bg-[#4a3023] pt-20 pb-12 px-4 relative">
      {/* Wood grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-lg bg-[#fffef8] border-2 border-[#c9bda8] flex items-center justify-center text-[#4a3023] hover:bg-[#f7f3eb] transition-colors shadow-[2px_2px_6px_rgba(0,0,0,0.2)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-h2 text-[#f7f3eb]">Leaderboard</h1>
            <p className="text-[#c9bda8] text-sm mt-0.5">
              Top players ranked by skill score
            </p>
          </div>
        </div>

        {/* Stats Cards - Trophy case style */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Players", value: leaderboard.length.toString() },
            {
              label: "Total Volume",
              value: formatUSDC(
                leaderboard.reduce((sum, p) => sum + p.totalVolume, BigInt(0)),
              ),
            },
            {
              label: "Total Matches",
              value: leaderboard
                .reduce((sum, p) => sum + p.totalWins, 0)
                .toLocaleString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-[#fffef8] border-2 border-[#c9bda8] shadow-[3px_3px_10px_rgba(0,0,0,0.15)]"
            >
              {/* LCD display for value */}
              <div className="inline-block px-3 py-1.5 rounded bg-[#111510] border border-[#2a3525] mb-2">
                <span
                  className="text-lg font-bold font-mono text-[#7aff9a]"
                  style={{ textShadow: "0 0 6px rgba(122, 255, 154, 0.5)" }}
                >
                  {stat.value}
                </span>
              </div>
              <div className="text-sm text-[#6b5e4f]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sort Tabs - Brass plate style */}
        <div className="flex gap-1 mb-6 p-1.5 rounded-lg bg-[#3a2a1f] border-2 border-[#2a1a13] inline-flex shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
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
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-150",
                sortBy === option.key
                  ? "bg-[#c9a959] text-[#2d2a26] shadow-[0_2px_0_#8a7025,_2px_2px_4px_rgba(0,0,0,0.2)]"
                  : "text-[#c9bda8] hover:text-[#f7f3eb] hover:bg-[rgba(255,255,255,0.05)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Table - Scorebook style */}
        <div className="bg-[#fffef8] rounded-xl border-2 border-[#c9bda8] overflow-hidden shadow-[3px_3px_12px_rgba(0,0,0,0.2)]">
          {isLoading ? (
            <div className="p-8 text-center text-[#6b5e4f]">Loading...</div>
          ) : (
            <div className="divide-y divide-[#e8e0d0]">
              {sortedLeaderboard.map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center gap-4 p-4 hover:bg-[#f7f3eb] transition-colors"
                >
                  {/* Rank Medal */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                      getMedalStyle(entry.rank),
                    )}
                  >
                    {entry.rank}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      address={entry.address}
                      name={entry.ensName}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-[#2d2a26] truncate">
                        {entry.ensName || shortenAddress(entry.address)}
                      </div>
                      <div className="text-sm text-[#6b5e4f]">
                        {entry.totalWins} wins
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-8">
                    <div className="text-right w-20">
                      <div className="font-semibold text-[#2d2a26]">
                        {entry.skillScore}
                      </div>
                      <div className="text-xs text-[#9a8a7a]">Score</div>
                    </div>
                    <div className="text-right w-16">
                      <div className="font-semibold text-[#5a8a6b]">
                        {formatPercentage(entry.winRate)}
                      </div>
                      <div className="text-xs text-[#9a8a7a]">Win %</div>
                    </div>
                    <div className="text-right w-28">
                      <div className="font-semibold text-[#2d2a26]">
                        {formatUSDC(entry.totalVolume)}
                      </div>
                      <div className="text-xs text-[#9a8a7a]">Volume</div>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="sm:hidden text-right">
                    <div className="font-semibold text-[#2d2a26]">
                      {entry.skillScore}
                    </div>
                    <div className="text-sm text-[#5a8a6b]">
                      {formatPercentage(entry.winRate)}
                    </div>
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
