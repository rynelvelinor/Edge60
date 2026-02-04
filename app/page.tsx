"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../components/ui/Button";

const GAME_CARDS = [
  {
    id: "reaction",
    name: "Reaction Race",
    description: "Test your reflexes. Fastest tap wins the round.",
    color: "#c17a4a",
    bgColor: "#f5ebe5",
    duration: "30s",
    rounds: 5,
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Find matching pairs before your opponent.",
    color: "#8a6b9a",
    bgColor: "#f0ebf2",
    duration: "60s",
    rounds: 1,
  },
  {
    id: "math",
    name: "Quick Math",
    description: "Solve arithmetic problems at lightning speed.",
    color: "#4a8a9a",
    bgColor: "#e8f0f2",
    duration: "45s",
    rounds: 10,
  },
  {
    id: "pattern",
    name: "Pattern Tap",
    description: "Remember and repeat the sequence.",
    color: "#5a8a6b",
    bgColor: "#e8f0eb",
    duration: "45s",
    rounds: 5,
  },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#f7f3eb]">
      {/* Hero - Felt Table Surface */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden bg-[#1e3a2f]">
        {/* Subtle felt texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111510] border-2 border-[#2a3525] text-sm font-medium mb-6 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#5a8a6b] shadow-[0_0_6px_rgba(90,138,107,0.6)] animate-pulse" />
            <span
              className="font-mono text-[#7aff9a]"
              style={{ textShadow: "0 0 8px rgba(122, 255, 154, 0.4)" }}
            >
              Powered by State Channels
            </span>
          </div>

          <h1 className="text-[#f7f3eb] mb-6 text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Skill-Based Gaming
            <br />
            <span className="text-[#c9a959]">for USDC</span>
          </h1>

          <p className="text-xl text-[#b8c4b0] max-w-2xl mx-auto mb-10 leading-relaxed">
            Compete head-to-head in deterministic games. No RNG, no luck—pure
            skill decides the winner. Instant payouts via state channels.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
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

      {/* Stats Bar - Scoreboard style */}
      <section className="py-8 px-4 bg-[#4a3023] border-y-4 border-[#2a1a13] shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "$2.4M+", label: "Total Volume" },
              { value: "12,000+", label: "Active Players" },
              { value: "<60s", label: "Avg Match Time" },
              { value: "89,000+", label: "Matches Played" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                {/* LCD-style display for value */}
                <div className="inline-block px-4 py-2 rounded-md bg-[#111510] border-2 border-[#2a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] mb-2">
                  <span
                    className="text-xl md:text-2xl font-bold font-mono text-[#7aff9a]"
                    style={{ textShadow: "0 0 8px rgba(122, 255, 154, 0.5)" }}
                  >
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm text-[#c9bda8]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-[#f7f3eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-caption text-[#c9a959] mb-3 block tracking-widest">
              GAME MODES
            </span>
            <h2 className="text-h1 text-[#2d2a26] mb-4">
              Four Ways to Compete
            </h2>
            <p className="text-lg text-[#6b5e4f] max-w-xl mx-auto">
              Each game tests different skills. Master them all or specialize in
              one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {GAME_CARDS.map((game) => (
              <div
                key={game.id}
                className="group relative rounded-xl p-6 bg-[#fffef8] border-2 border-[#c9bda8] shadow-[3px_3px_12px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_16px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                {/* Top color accent - like a card edge */}
                <div
                  className="absolute top-0 left-4 right-4 h-1 rounded-b-full"
                  style={{ backgroundColor: game.color }}
                />

                <div className="flex items-start justify-between mb-4 pt-2">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center border-2 shadow-[2px_2px_6px_rgba(0,0,0,0.1)]"
                    style={{
                      backgroundColor: game.bgColor,
                      borderColor: game.color + "40",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: game.color }}
                    />
                  </div>

                  {/* Duration/Rounds */}
                  <div className="flex items-center gap-3 text-sm text-[#6b5e4f]">
                    <span>{game.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-[#c9bda8]" />
                    <span>
                      {game.rounds} {game.rounds === 1 ? "round" : "rounds"}
                    </span>
                  </div>
                </div>

                <h3 className="text-h3 text-[#2d2a26] mb-2">{game.name}</h3>
                <p className="text-[#6b5e4f] mb-5">{game.description}</p>

                <Link href="/play">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="group-hover:bg-[#f0ebe0]"
                  >
                    Play Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-[#1e3a2f] relative">
        {/* Felt texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-caption text-[#c9a959] mb-3 block tracking-widest">
              HOW IT WORKS
            </span>
            <h2 className="text-h1 text-[#f7f3eb] mb-4">Start in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                desc: "Link your wallet and deposit USDC to your gaming balance.",
              },
              {
                step: "02",
                title: "Match",
                desc: "Choose your game mode, set your stake, and find an opponent.",
              },
              {
                step: "03",
                title: "Compete",
                desc: "Play head-to-head. Winner takes the pot minus a small fee.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#3a5a4a]" />
                )}

                {/* Chip/Token style number */}
                <div className="w-16 h-16 rounded-full bg-[#c9a959] border-4 border-[#8a7025] flex items-center justify-center mb-4 shadow-[0_4px_0_#8a7025,_3px_3px_8px_rgba(0,0,0,0.3)]">
                  <span className="text-xl font-bold text-[#2d2a26] font-heading">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-h3 text-[#f7f3eb] mb-2">{item.title}</h3>
                <p className="text-[#b8c4b0]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#f7f3eb]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-caption text-[#c9a959] mb-3 block tracking-widest">
                TECHNOLOGY
              </span>
              <h2 className="text-h1 text-[#2d2a26] mb-6">
                Web3 Infrastructure,
                <br />
                Web2 Experience
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "State Channels",
                    desc: "Instant transactions without blockchain delays. Only deposits and withdrawals touch the chain.",
                  },
                  {
                    title: "Cross-Chain",
                    desc: "Deposit USDC from any supported chain. Play anywhere, withdraw anywhere.",
                  },
                  {
                    title: "ENS Identity",
                    desc: "Your gaming reputation tied to your ENS. Verifiable stats, portable identity.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#c9a959] mt-2 flex-shrink-0 shadow-[1px_1px_2px_rgba(0,0,0,0.2)]" />
                    <div>
                      <h4 className="font-semibold text-[#2d2a26] mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-[#6b5e4f]">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card - Like a game panel */}
            <div className="relative">
              <div className="rounded-xl bg-[#4a3023] p-8 border-4 border-[#2a1a13] shadow-[4px_4px_16px_rgba(0,0,0,0.3)]">
                {/* Wood texture */}
                <div
                  className="absolute inset-0 rounded-xl opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />

                <div className="relative">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-[#c9bda8] text-sm mb-1">
                        Your Balance
                      </div>
                      {/* LCD Display */}
                      <div className="inline-block px-4 py-2 rounded-md bg-[#111510] border-2 border-[#2a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                        <span
                          className="text-2xl font-bold font-mono text-[#7aff9a]"
                          style={{
                            textShadow: "0 0 8px rgba(122, 255, 154, 0.5)",
                          }}
                        >
                          $1,234.56
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[rgba(90,138,107,0.2)] flex items-center justify-center border border-[#5a8a6b]">
                      <div className="w-3 h-3 rounded-full bg-[#5a8a6b] shadow-[0_0_8px_rgba(90,138,107,0.6)]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Wins", value: "156", color: "#5a8a6b" },
                      { label: "Win Rate", value: "63.6%", color: "#c9a959" },
                      { label: "Earnings", value: "+$1,250", color: "#c17a4a" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: stat.color,
                              boxShadow: `0 0 6px ${stat.color}60`,
                            }}
                          />
                          <span className="text-[#c9bda8]">{stat.label}</span>
                        </div>
                        <span className="font-semibold text-[#f7f3eb]">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#c9a959] relative">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-h1 text-[#2d2a26] mb-4">Ready to compete?</h2>
          <p className="text-lg text-[#4a3a2a] mb-10">
            Connect your wallet and start playing in seconds. No sign-up
            required.
          </p>
          {isConnected ? (
            <Link href="/play">
              <Button variant="dark" size="lg">
                Find a Match
              </Button>
            </Link>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button variant="dark" size="lg" onClick={openConnectModal}>
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#4a3023] border-t-4 border-[#2a1a13]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c9a959] border-2 border-[#8a7025] flex items-center justify-center shadow-[0_2px_0_#8a7025]">
              <span className="text-[#2d2a26] font-bold text-xs">E60</span>
            </div>
            <span className="font-semibold text-[#f7f3eb] font-heading">
              Edge60
            </span>
          </div>
          <div className="flex gap-8 text-sm text-[#c9bda8]">
            <a href="#" className="hover:text-[#f7f3eb] transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-[#f7f3eb] transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-[#f7f3eb] transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-[#f7f3eb] transition-colors">
              Discord
            </a>
          </div>
          <p className="text-sm text-[#9a8a7a]">Built for ETHGlobal</p>
        </div>
      </footer>
    </div>
  );
}
