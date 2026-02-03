"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { useENSName, useENSAvatar } from "../../hooks/useENS";
import { useGameStore } from "../../store/gameStore";
import { Address, PlayerStats, GameType } from "../../types";
import {
  formatUSDC,
  formatPercentage,
  shortenAddress,
  getGameEmoji,
  getRelativeTime,
  calculateWinRate,
} from "../../lib/utils";
import {
  User,
  Wallet,
  Trophy,
  TrendingUp,
  Clock,
  History,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

// Mock match history
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

  // Mock stats for demo
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card variant="gradient" className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <User className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              View Your Profile
            </h2>
            <p className="text-zinc-400 mb-6">
              Connect your wallet to view your gaming stats and history.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button size="lg" onClick={openConnectModal}>
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" className="mb-8">
            <CardContent className="py-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <Avatar
                  src={avatar}
                  address={address}
                  name={ensName || undefined}
                  size="xl"
                />

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {ensName || "Anonymous Player"}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400">
                    <span className="font-mono text-sm">
                      {shortenAddress(address as Address)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Balance */}
                <div className="text-center sm:text-right">
                  <p className="text-sm text-zinc-400 mb-1">Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {formatUSDC(balance)}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Wallet className="h-4 w-4 mr-1" />
                    Deposit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Trophy}
            label="Total Wins"
            value={mockStats.totalWins.toString()}
            color="text-yellow-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Win Rate"
            value={formatPercentage(
              calculateWinRate(mockStats.totalWins, mockStats.totalLosses)
            )}
            color="text-green-400"
          />
          <StatCard
            icon={Wallet}
            label="Total Volume"
            value={formatUSDC(mockStats.totalVolume)}
            color="text-blue-400"
          />
          <StatCard
            icon={Clock}
            label="Skill Score"
            value={mockStats.skillScore.toString()}
            color="text-purple-400"
          />
        </motion.div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Win/Loss */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Win Rate</span>
                      <span className="text-white">
                        {mockStats.totalWins}W - {mockStats.totalLosses}L
                      </span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{
                          width: `${calculateWinRate(
                            mockStats.totalWins,
                            mockStats.totalLosses
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-500/10 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">
                        +{formatUSDC(mockStats.totalWinnings)}
                      </p>
                      <p className="text-xs text-zinc-400">Net Profit</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-xl">
                      <p className="text-2xl font-bold text-white">
                        {mockStats.totalWins + mockStats.totalLosses}
                      </p>
                      <p className="text-xs text-zinc-400">Total Games</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ENS Records */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>On-Chain Identity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: "flashstake.winRate", value: formatPercentage(mockStats.winRate) },
                    { key: "flashstake.totalVolume", value: formatUSDC(mockStats.totalVolume) },
                    { key: "flashstake.skillScore", value: mockStats.skillScore.toString() },
                  ].map((record) => (
                    <div
                      key={record.key}
                      className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl"
                    >
                      <span className="text-sm text-zinc-400 font-mono">
                        {record.key}
                      </span>
                      <span className="text-white font-medium">
                        {record.value}
                      </span>
                    </div>
                  ))}
                </div>
                {ensName && (
                  <Button variant="ghost" className="w-full mt-4">
                    Update ENS Records
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Match History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_HISTORY.map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${match.won
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                      }`}
                  >
                    {/* Game Type */}
                    <span className="text-2xl">
                      {getGameEmoji(match.gameType)}
                    </span>

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${match.won ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {match.won ? "Victory" : "Defeat"}
                        </span>
                        <span className="text-zinc-500">vs</span>
                        <span className="text-white truncate">
                          {match.opponentENS ||
                            shortenAddress(match.opponent)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {getRelativeTime(match.timestamp)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {match.myScore} - {match.opponentScore}
                      </p>
                      <p
                        className={`text-sm ${match.won ? "text-green-400" : "text-red-400"
                          }`}
                      >
                        {match.won ? "+" : "-"}
                        {formatUSDC(match.stake)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" className="w-full mt-4">
                View All History
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-zinc-800 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
