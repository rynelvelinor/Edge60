"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { useENSName, useENSAvatar } from "../../hooks/useENS";
import { useGameStore } from "../../store/gameStore";
import { Address, PlayerStats, GameType } from "../../types";
import {
  formatUSDC,
  formatPercentage,
  shortenAddress,
  getGameName,
  getRelativeTime,
  calculateWinRate,
  cn,
} from "../../lib/utils";
import { Copy, Check, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

const GAME_COLORS: Record<string, string> = {
  REACTION_RACE: "#c17a4a",
  MEMORY_MATCH: "#8a6b9a",
  QUICK_MATH: "#4a8a9a",
  PATTERN_TAP: "#5a8a6b",
};

const MOCK_HISTORY = [
  {
    id: "1",
    gameType: GameType.REACTION_RACE,
    opponent: "0x1234567890123456789012345678901234567890" as Address,
    opponentENS: "speedster.eth",
    stake: BigInt(10_000_000),
    won: true,
    myScore: 4,
    opponentScore: 1,
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "2",
    gameType: GameType.QUICK_MATH,
    opponent: "0x2345678901234567890123456789012345678901" as Address,
    stake: BigInt(25_000_000),
    won: false,
    myScore: 6,
    opponentScore: 8,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "3",
    gameType: GameType.MEMORY_MATCH,
    opponent: "0x3456789012345678901234567890123456789012" as Address,
    opponentENS: "memoryking.eth",
    stake: BigInt(5_000_000),
    won: true,
    myScore: 5,
    opponentScore: 3,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
  },
];

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { ensName } = useENSName();
  const { avatar } = useENSAvatar(ensName || address);
  const { balance, stats } = useGameStore();
  const [copied, setCopied] = useState(false);

  const mockStats: PlayerStats = stats || {
    totalWins: 156,
    totalLosses: 89,
    totalVolume: BigInt(45000_000_000),
    totalWinnings: BigInt(12500_000_000),
    winRate: 63.6,
    skillScore: 1850,
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1e3a2f] flex items-center justify-center px-4 relative">
        {/* Felt texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#c9a959] border-4 border-[#8a7025] flex items-center justify-center mx-auto mb-6 shadow-[0_4px_0_#8a7025,_3px_3px_10px_rgba(0,0,0,0.3)]">
            <span className="text-2xl font-bold text-[#2d2a26]">?</span>
          </div>
          <h1 className="text-h2 text-[#f7f3eb] mb-3">Your Profile</h1>
          <p className="text-[#b8c4b0] mb-8">
            Connect your wallet to view your stats.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button size="lg" onClick={openConnectModal} className="w-full">
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    );
  }

  const winRate = calculateWinRate(mockStats.totalWins, mockStats.totalLosses);

  return (
    <div className="min-h-screen bg-[#1e3a2f] pt-20 pb-12 px-4 relative">
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#c9bda8] hover:text-[#f7f3eb] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Profile Card - Leather wallet style */}
        <div className="bg-[#5c3a25] rounded-xl border-4 border-[#3c2415] p-6 mb-6 shadow-[4px_4px_16px_rgba(0,0,0,0.3)] relative overflow-hidden">
          {/* Leather texture */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Stitching effect - top */}
          <div className="absolute top-3 left-6 right-6 h-px border-t-2 border-dashed border-[#7c5a45] opacity-50" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with frame */}
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-[#fffef8] border-4 border-[#c9a959] p-1 shadow-[3px_3px_10px_rgba(0,0,0,0.3)]">
                <Avatar
                  src={avatar}
                  address={address}
                  name={ensName || undefined}
                  size="xl"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-[#f7f3eb] mb-1 font-heading">
                {ensName || "Anonymous"}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm text-[#c9bda8] font-mono">
                  {shortenAddress(address as Address)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-md text-[#c9bda8] hover:text-[#f7f3eb] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[#5a8a6b]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <a
                  href={`https://etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-[#c9bda8] hover:text-[#f7f3eb] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Balance - LCD Display */}
            <div className="text-center sm:text-right">
              <div className="text-sm text-[#c9bda8] mb-2">Balance</div>
              <div className="inline-block px-4 py-2 rounded-md bg-[#111510] border-2 border-[#2a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                <span
                  className="text-xl font-bold font-mono text-[#7aff9a]"
                  style={{ textShadow: "0 0 8px rgba(122, 255, 154, 0.5)" }}
                >
                  {formatUSDC(balance)}
                </span>
              </div>
              <div className="mt-3">
                <Button variant="secondary" size="sm">
                  Deposit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Wins",
              value: mockStats.totalWins.toString(),
              color: "text-[#f7f3eb]",
            },
            {
              label: "Win Rate",
              value: formatPercentage(winRate),
              color: "text-[#5a8a6b]",
            },
            {
              label: "Volume",
              value: formatUSDC(mockStats.totalVolume),
              color: "text-[#f7f3eb]",
            },
            {
              label: "Skill Score",
              value: mockStats.skillScore.toString(),
              color: "text-[#c9a959]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#fffef8] rounded-xl border-2 border-[#c9bda8] p-5 shadow-[3px_3px_10px_rgba(0,0,0,0.15)]"
            >
              <div
                className={cn("text-2xl font-bold font-heading", stat.color)}
              >
                {stat.value}
              </div>
              <div className="text-sm text-[#6b5e4f] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Performance Card */}
        <div className="bg-[#fffef8] rounded-xl border-2 border-[#c9bda8] p-6 mb-6 shadow-[3px_3px_10px_rgba(0,0,0,0.15)]">
          <h2 className="text-h3 text-[#2d2a26] mb-5">Performance</h2>

          {/* Win Rate Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#6b5e4f]">Win Rate</span>
              <span className="font-medium text-[#2d2a26]">
                {mockStats.totalWins}W - {mockStats.totalLosses}L
              </span>
            </div>
            <div className="h-4 bg-[#e8e0d0] rounded-full overflow-hidden border border-[#c9bda8]">
              <div
                className="h-full bg-[#5a8a6b] rounded-full transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>

          {/* Profit/Games */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#e8f0eb] border-2 border-[#5a8a6b40]">
              <div className="text-xl font-bold text-[#5a8a6b] font-heading">
                +{formatUSDC(mockStats.totalWinnings)}
              </div>
              <div className="text-sm text-[#6b5e4f] mt-1">Net Profit</div>
            </div>
            <div className="p-4 rounded-lg bg-[#f7f3eb] border-2 border-[#c9bda8]">
              <div className="text-xl font-bold text-[#2d2a26] font-heading">
                {mockStats.totalWins + mockStats.totalLosses}
              </div>
              <div className="text-sm text-[#6b5e4f] mt-1">Games Played</div>
            </div>
          </div>
        </div>

        {/* Recent Matches - Journal style */}
        <div className="bg-[#fffef8] rounded-xl border-2 border-[#c9bda8] overflow-hidden shadow-[3px_3px_10px_rgba(0,0,0,0.15)]">
          <div className="px-6 py-5 border-b-2 border-[#e8e0d0]">
            <h2 className="text-h3 text-[#2d2a26]">Recent Matches</h2>
          </div>

          <div className="divide-y divide-[#e8e0d0]">
            {MOCK_HISTORY.map((match) => (
              <div key={match.id} className="flex items-center gap-4 p-5">
                {/* Game indicator - colored bar */}
                <div
                  className="w-1.5 h-12 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: GAME_COLORS[match.gameType] || "#6b5e4f",
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        match.won ? "text-[#5a8a6b]" : "text-[#a34a4a]",
                      )}
                    >
                      {match.won ? "Won" : "Lost"}
                    </span>
                    <span className="text-[#9a8a7a]">·</span>
                    <span className="text-sm text-[#6b5e4f]">
                      {getGameName(match.gameType)}
                    </span>
                    <span className="text-[#9a8a7a]">vs</span>
                    <span className="text-sm text-[#6b5e4f]">
                      {match.opponentENS || shortenAddress(match.opponent)}
                    </span>
                  </div>
                  <div className="text-xs text-[#9a8a7a] mt-1">
                    {getRelativeTime(match.timestamp)}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="font-semibold text-[#2d2a26]">
                    {match.myScore} - {match.opponentScore}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      match.won ? "text-[#5a8a6b]" : "text-[#a34a4a]",
                    )}
                  >
                    {match.won ? "+" : "-"}
                    {formatUSDC(match.stake)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t-2 border-[#e8e0d0] bg-[#f7f3eb]">
            <button className="text-sm text-[#c9a959] font-medium hover:text-[#a88734] transition-colors">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
