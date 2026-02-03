import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint | string | number): string {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  const dollars = Number(value) / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Parse USDC input to bigint (6 decimals)
 */
export function parseUSDC(amount: string | number): bigint {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.round(value * 1_000_000));
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Format reaction time
 */
export function formatReactionTime(ms: number): string {
  return `${ms.toFixed(0)}ms`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format large numbers
 */
export function formatNumber(value: number | bigint): string {
  const num = typeof value === "bigint" ? Number(value) : value;

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Calculate win rate
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

/**
 * Delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate avatar color based on address
 */
export function generateAvatarColor(address: string): string {
  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#a855f7", // Purple
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#22c55e", // Green
    "#f59e0b", // Amber
    "#f97316", // Orange
    "#ef4444", // Red
    "#ec4899", // Pink
  ];

  const index = parseInt(address.slice(2, 10), 16) % colors.length;
  return colors[index];
}

/**
 * Get game type display name
 */
export function getGameName(gameType: string): string {
  const names: Record<string, string> = {
    REACTION_RACE: "Reaction",
    MEMORY_MATCH: "Memory",
    QUICK_MATH: "Math",
    PATTERN_TAP: "Pattern",
  };
  return names[gameType] || "Game";
}

/**
 * Get game type color
 */
export function getGameColor(gameType: string): string {
  const colors: Record<string, string> = {
    REACTION_RACE: "#f59e0b",
    MEMORY_MATCH: "#a855f7",
    QUICK_MATH: "#06b6d4",
    PATTERN_TAP: "#22c55e",
  };
  return colors[gameType] || "#6366f1";
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Shorten address
 */
export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
