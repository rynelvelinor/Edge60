import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "../components/providers/Web3Provider";
import { Header } from "../components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlashStake - Real-Time USDC Skill Gaming",
  description:
    "Compete in skill-based games with instant USDC payouts. Powered by Yellow Network state channels and Arc cross-chain liquidity.",
  keywords: [
    "web3 gaming",
    "USDC",
    "skill gaming",
    "state channels",
    "Yellow Network",
    "Arc",
    "ENS",
    "crypto gaming",
  ],
  openGraph: {
    title: "FlashStake - Real-Time USDC Skill Gaming",
    description:
      "Compete in skill-based games with instant USDC payouts. Powered by Yellow Network state channels.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashStake",
    description: "Real-Time USDC Skill Gaming via State Channels",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black min-h-screen`}
      >
        <Web3Provider>
          <Header />
          <main className="pt-16">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
