"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { formatUSDC } from "../../lib/utils";
import { Zap, Wallet, Trophy, User } from "lucide-react";

export function Header() {
  const { balance, isAuthenticated } = useGameStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              FlashStake
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/play">Play</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Balance Display */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2"
              >
                <Wallet className="h-4 w-4 text-indigo-400" />
                <span className="text-white font-medium">
                  {formatUSDC(balance)}
                </span>
              </motion.div>
            )}

            {/* Connect Button */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="bg-red-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-red-700 transition-all"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl transition-colors hidden sm:flex items-center gap-2"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                            {chain.name}
                          </button>

                          <button
                            onClick={openAccountModal}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-zinc-400 hover:text-white transition-colors font-medium"
    >
      {children}
    </Link>
  );
}
