import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Web3Provider } from "../components/providers/Web3Provider";
import { Header } from "../components/layout/Header";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Edge60 - Real-Time USDC Skill Gaming",
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
    title: "Edge60 - Real-Time USDC Skill Gaming",
    description:
      "Compete in skill-based games with instant USDC payouts. Powered by Yellow Network state channels.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edge60",
    description: "Real-Time USDC Skill Gaming via State Channels",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-white min-h-screen`}
      >
        <Web3Provider>
          <Header />
          <main className="pt-16">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
