"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGameStore } from "../../store/gameStore";
import { formatUSDC, cn } from "../../lib/utils";

export function Header() {
  const { balance, isAuthenticated } = useGameStore();
  const pathname = usePathname();

  const navItems = [
    { href: "/play", label: "Play" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#4a3023] border-b-4 border-[#2a1a13] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
      {/* Subtle wood grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Brass badge style */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#c9a959] border-2 border-[#8a7025] flex items-center justify-center shadow-[0_2px_0_#8a7025,_2px_2px_4px_rgba(0,0,0,0.3)] group-hover:shadow-[0_2px_0_#8a7025,_3px_3px_6px_rgba(0,0,0,0.35)] transition-shadow">
              <span className="text-[#2d2a26] font-bold text-sm">E60</span>
            </div>
            <span className="text-lg font-semibold text-[#f7f3eb] font-heading tracking-wide">
              Edge60
            </span>
          </Link>

          {/* Navigation - Brass plate tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  pathname === item.href
                    ? "bg-[#c9a959] text-[#2d2a26] shadow-[0_2px_0_#8a7025,_2px_2px_4px_rgba(0,0,0,0.2)]"
                    : "text-[#d4c9b8] hover:text-[#f7f3eb] hover:bg-[rgba(255,255,255,0.08)]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Balance - LCD Display style */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111510] border-2 border-[#2a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                <div className="w-2 h-2 rounded-full bg-[#5a8a6b] shadow-[0_0_6px_rgba(90,138,107,0.6)]" />
                <span
                  className="font-mono text-sm font-medium text-[#7aff9a] tracking-wider"
                  style={{ textShadow: "0 0 8px rgba(122, 255, 154, 0.4)" }}
                >
                  {formatUSDC(balance)}
                </span>
              </div>
            )}

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
                            className="h-10 px-5 rounded-lg text-sm font-semibold bg-[#c9a959] text-[#2d2a26] border-2 border-[#8a7025] shadow-[0_3px_0_#8a7025,_2px_2px_6px_rgba(0,0,0,0.25)] hover:bg-[#d4b66a] hover:shadow-[0_3px_0_#8a7025,_3px_3px_8px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#8a7025] transition-all duration-150"
                          >
                            Connect
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="h-10 px-5 rounded-lg text-sm font-semibold bg-[#f5e8e8] text-[#a34a4a] border-2 border-[#d4a0a0] hover:bg-[#f8ecec] transition-colors"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm bg-[#3a2a1f] text-[#d4c9b8] border border-[#2a1a13] hover:bg-[#4a3a2a] transition-colors"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain"}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </button>

                          <button
                            onClick={openAccountModal}
                            className="h-10 px-4 rounded-lg text-sm font-semibold bg-[#f7f3eb] text-[#4a3023] border-2 border-[#c9bda8] shadow-[2px_2px_6px_rgba(0,0,0,0.15)] hover:bg-[#fffef8] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.2)] transition-all"
                          >
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
