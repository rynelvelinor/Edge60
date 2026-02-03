"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  Zap,
  Shield,
  Globe,
  Trophy,
  ArrowRight,
  Wallet,
  Users,
  Clock,
} from "lucide-react";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-8"
            >
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">
                Powered by Yellow Network & Arc
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
              Real-Time USDC
              <br />
              <span className="gradient-text">Skill Gaming</span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Compete in deterministic skill games. Instant off-chain state
              updates. Seamless cross-chain USDC payouts. Web2 speed, Web3
              security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/play">
                  <Button size="lg" className="group">
                    Start Playing
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button size="lg" onClick={openConnectModal} className="group">
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect to Play
                    </Button>
                  )}
                </ConnectButton.Custom>
              )}
              <Link href="/leaderboard">
                <Button variant="secondary" size="lg">
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
          >
            {[
              { label: "Total Volume", value: "$2.4M+", icon: Wallet },
              { label: "Active Players", value: "12,000+", icon: Users },
              { label: "Avg. Match Time", value: "< 60s", icon: Clock },
              { label: "Total Matches", value: "89,000+", icon: Trophy },
            ].map((stat, i) => (
              <Card key={i} variant="glass" className="text-center py-6">
                <stat.icon className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Web3 Infrastructure, Web2 Experience
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Combining the best of decentralized finance with instant user
              experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Yellow Network",
                subtitle: "Off-Chain State Channels",
                description:
                  "Instant balance updates without blockchain transactions. Only deposit and settlement touch the chain.",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Globe,
                title: "Arc Treasury",
                subtitle: "Cross-Chain Liquidity",
                description:
                  "Unified USDC management across Ethereum, Base, Polygon. Deposit from any chain, play anywhere.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "ENS Identity",
                subtitle: "Decentralized Reputation",
                description:
                  "Your gaming identity tied to your ENS name. On-chain stats, verifiable history, portable reputation.",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent>
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-indigo-400 mb-3">
                      {feature.subtitle}
                    </p>
                    <p className="text-zinc-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Skill-Based Games
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Deterministic outcomes, no RNG. Pure skill competition.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: "⚡",
                name: "Reaction Race",
                desc: "Fastest tap wins",
                color: "from-yellow-500 to-orange-500",
              },
              {
                emoji: "🧠",
                name: "Memory Match",
                desc: "Find the pairs",
                color: "from-purple-500 to-pink-500",
              },
              {
                emoji: "🔢",
                name: "Quick Math",
                desc: "Speed arithmetic",
                color: "from-blue-500 to-cyan-500",
              },
              {
                emoji: "🎯",
                name: "Pattern Tap",
                desc: "Remember & repeat",
                color: "from-green-500 to-emerald-500",
              },
            ].map((game, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10`}
                  />
                  <CardContent className="relative text-center py-8">
                    <span className="text-5xl mb-4 block">{game.emoji}</span>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {game.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{game.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Compete?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Connect your wallet, deposit USDC, and start playing in seconds.
            </p>
            {isConnected ? (
              <Link href="/play">
                <Button size="lg" className="group">
                  Find a Match
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button size="lg" onClick={openConnectModal}>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">FlashStake</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Discord
              </a>
            </div>
            <p className="text-sm text-zinc-500">
              Built for ETHGlobal Hackathon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
