"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { GameType, GAME_CONFIGS } from "../../types";
import { formatUSDC, parseUSDC } from "../../lib/utils";
import { DollarSign } from "lucide-react";

interface StakeSelectorProps {
  gameType: GameType;
  balance: bigint;
  onConfirm: (stake: bigint) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

export function StakeSelector({
  gameType,
  balance,
  onConfirm,
  onBack,
  isLoading,
}: StakeSelectorProps) {
  const config = GAME_CONFIGS[gameType];
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const getStakeAmount = (): bigint => {
    if (selectedPreset !== null) {
      return parseUSDC(selectedPreset);
    }
    if (customAmount) {
      return parseUSDC(parseFloat(customAmount) || 0);
    }
    return BigInt(0);
  };

  const stakeAmount = getStakeAmount();
  const isValidStake =
    stakeAmount >= config.minStake &&
    stakeAmount <= config.maxStake &&
    stakeAmount <= balance;

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
  };

  const handleConfirm = () => {
    if (isValidStake) {
      onConfirm(stakeAmount);
    }
  };

  return (
    <Card variant="gradient" className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{config.name}</span>
        </CardTitle>
        <p className="text-zinc-400 text-sm">Choose your stake amount</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-white">{formatUSDC(balance)}</p>
        </div>

        {/* Preset Amounts */}
        <div>
          <p className="text-sm text-zinc-400 mb-3">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((amount) => {
              const amountBigInt = parseUSDC(amount);
              const isAvailable = amountBigInt <= balance;

              return (
                <motion.button
                  key={amount}
                  whileHover={{ scale: isAvailable ? 1.02 : 1 }}
                  whileTap={{ scale: isAvailable ? 0.98 : 1 }}
                  onClick={() => isAvailable && handlePresetClick(amount)}
                  disabled={!isAvailable}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${selectedPreset === amount
                      ? "bg-indigo-600 text-white"
                      : isAvailable
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                    }`}
                >
                  ${amount}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Input
            label="Custom Amount"
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <p className="text-xs text-zinc-500 mt-2">
            Min: {formatUSDC(config.minStake)} | Max:{" "}
            {formatUSDC(config.maxStake)}
          </p>
        </div>

        {/* Selected Amount Display */}
        {stakeAmount > BigInt(0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4"
          >
            <p className="text-sm text-indigo-400 mb-1">Your Stake</p>
            <p className="text-2xl font-bold text-white">
              {formatUSDC(stakeAmount)}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Potential win: {formatUSDC(stakeAmount * BigInt(2) * BigInt(97) / BigInt(100))}
            </p>
          </motion.div>
        )}

        {/* Error Messages */}
        {stakeAmount > BigInt(0) && !isValidStake && (
          <p className="text-red-400 text-sm">
            {stakeAmount > balance
              ? "Insufficient balance"
              : stakeAmount < config.minStake
                ? `Minimum stake is ${formatUSDC(config.minStake)}`
                : `Maximum stake is ${formatUSDC(config.maxStake)}`}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!isValidStake || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Find Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
