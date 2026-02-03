"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";

const GAME_CARDS = [
  {
    id: "reaction",
    name: "Reaction Race",
    description: "Test your reflexes. Fastest tap wins the round.",
    color: "#f97316",
    bgColor: "#fff7ed",
    duration: "30s",
    rounds: 5,
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Find matching pairs before your opponent.",
    color: "#a855f7",
    bgColor: "#faf5ff",
    duration: "60s",
    rounds: 1,
  },
  {
    id: "math",
    name: "Quick Math",
    description: "Solve arithmetic problems at lightning speed.",
    color: "#06b6d4",
    bgColor: "#ecfeff",
    duration: "45s",
    rounds: 10,
  },
  {
    id: "pattern",
    name: "Pattern Tap",
    description: "Remember and repeat the sequence.",
    color: "#22c55e",
    bgColor: "#f0fdf4",
    duration: "45s",
    rounds: 5,
  },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Powered by State Channels
          </div>

          <h1 className="text-display text-slate-900 mb-6">
            Skill-Based Gaming
            <br />
            <span className="text-indigo-600">for USDC</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Compete head-to-head in deterministic games. No RNG, no luck—pure skill decides the winner. Instant payouts via state channels.
          </p>

          <div className="flex items-center justify-center gap-4">
            {isConnected ? (
              <Link href="/play">
                <Button size="lg">Start Playing</Button>
              </Link>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button size="lg" onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
            <Link href="/leaderboard">
              <Button variant="secondary" size="lg">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$2.4M+", label: "Total Volume" },
              { value: "12,000+", label: "Active Players" },
              { value: "<60s", label: "Avg Match Time" },
              { value: "89,000+", label: "Matches Played" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white font-heading">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-caption text-indigo-600 mb-3 block">GAME MODES</span>
            <h2 className="text-h1 text-slate-900 mb-4">Four Ways to Compete</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Each game tests different skills. Master them all or specialize in one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {GAME_CARDS.map((game) => (
              <div
                key={game.id}
                className="group relative rounded-2xl p-6 border border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                {/* Color accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: game.color }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: game.bgColor }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg"
                      style={{ backgroundColor: game.color }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{game.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{game.rounds} {game.rounds === 1 ? 'round' : 'rounds'}</span>
                  </div>
                </div>

                <h3 className="text-h3 text-slate-900 mb-2">{game.name}</h3>
                <p className="text-slate-600 mb-5">{game.description}</p>

                <Link href="/play">
                  <Button variant="secondary" size="sm" className="group-hover:bg-slate-200">
                    Play Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-caption text-indigo-600 mb-3 block">HOW IT WORKS</span>
            <h2 className="text-h1 text-slate-900 mb-4">Start in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                desc: "Link your wallet and deposit USDC to your gaming balance."
              },
              {
                step: "02",
                title: "Match",
                desc: "Choose your game mode, set your stake, and find an opponent."
              },
              {
                step: "03",
                title: "Compete",
                desc: "Play head-to-head. Winner takes the pot minus a small fee."
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-slate-200" />
                )}
                <div className="text-5xl font-bold text-slate-200 font-heading mb-4">{item.step}</div>
                <h3 className="text-h3 text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-caption text-indigo-600 mb-3 block">TECHNOLOGY</span>
              <h2 className="text-h1 text-slate-900 mb-6">
                Web3 Infrastructure,
                <br />Web2 Experience
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "State Channels",
                    desc: "Instant transactions without blockchain delays. Only deposits and withdrawals touch the chain."
                  },
                  {
                    title: "Cross-Chain",
                    desc: "Deposit USDC from any supported chain. Play anywhere, withdraw anywhere."
                  },
                  {
                    title: "ENS Identity",
                    desc: "Your gaming reputation tied to your ENS. Verifiable stats, portable identity."
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-slate-900 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Your Balance</div>
                    <div className="text-3xl font-bold text-white font-heading">$1,234.56</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Wins", value: "156", color: "bg-green-500" },
                    { label: "Win Rate", value: "63.6%", color: "bg-indigo-500" },
                    { label: "Earnings", value: "+$1,250", color: "bg-orange-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        <span className="text-slate-400">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h1 text-white mb-4">Ready to compete?</h2>
          <p className="text-lg text-indigo-100 mb-10">
            Connect your wallet and start playing in seconds. No sign-up required.
          </p>
          {isConnected ? (
            <Link href="/play">
              <Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Find a Match
              </Button>
            </Link>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button variant="secondary" size="lg" onClick={openConnectModal} className="bg-white text-indigo-600 hover:bg-indigo-50">
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">FS</span>
            </div>
            <span className="font-semibold text-slate-900">Edge60</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Discord</a>
          </div>
          <p className="text-sm text-slate-500">Built for ETHGlobal</p>
        </div>
      </footer>
    </div>
  );
}
