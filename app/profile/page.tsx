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
  getGameColor,
  getRelativeTime,
  calculateWinRate,
  cn,
} from "../../lib/utils";
import { Copy, Check, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-600" />
          </div>
          <h1 className="text-h2 text-slate-900 mb-3">Your Profile</h1>
          <p className="text-slate-600 mb-8">
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
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar src={avatar} address={address} name={ensName || undefined} size="xl" />

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-h2 text-slate-900 mb-1">
                {ensName || "Anonymous"}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm text-slate-500 font-mono">
                  {shortenAddress(address as Address)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href={`https://etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-sm text-slate-500 mb-1">Balance</div>
              <div className="text-2xl font-bold text-slate-900 font-heading">{formatUSDC(balance)}</div>
              <Button variant="secondary" size="sm" className="mt-2">
                Deposit
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Wins", value: mockStats.totalWins.toString(), color: "text-slate-900" },
            { label: "Win Rate", value: formatPercentage(winRate), color: "text-green-600" },
            { label: "Volume", value: formatUSDC(mockStats.totalVolume), color: "text-slate-900" },
            { label: "Skill Score", value: mockStats.skillScore.toString(), color: "text-indigo-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={cn("text-2xl font-bold font-heading", stat.color)}>{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Performance Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-h3 text-slate-900 mb-5">Performance</h2>

          {/* Win Rate Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Win Rate</span>
              <span className="font-medium text-slate-900">{mockStats.totalWins}W - {mockStats.totalLosses}L</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>

          {/* Profit/Games */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-xl font-bold text-green-600 font-heading">+{formatUSDC(mockStats.totalWinnings)}</div>
              <div className="text-sm text-slate-600 mt-1">Net Profit</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-bold text-slate-900 font-heading">{mockStats.totalWins + mockStats.totalLosses}</div>
              <div className="text-sm text-slate-600 mt-1">Games Played</div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-h3 text-slate-900">Recent Matches</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_HISTORY.map((match) => (
              <div key={match.id} className="flex items-center gap-4 p-5">
                {/* Game indicator */}
                <div
                  className="w-3 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getGameColor(match.gameType) }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "text-sm font-semibold",
                      match.won ? "text-green-600" : "text-red-500"
                    )}>
                      {match.won ? "Won" : "Lost"}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-sm text-slate-600">
                      {getGameName(match.gameType)}
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-sm text-slate-600">
                      {match.opponentENS || shortenAddress(match.opponent)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {getRelativeTime(match.timestamp)}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {match.myScore} - {match.opponentScore}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    match.won ? "text-green-600" : "text-red-500"
                  )}>
                    {match.won ? "+" : "-"}{formatUSDC(match.stake)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
