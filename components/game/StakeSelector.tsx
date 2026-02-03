"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { GameType, GAME_CONFIGS } from "../../types";
import { formatUSDC, parseUSDC, getGameColor, cn } from "../../lib/utils";
import { ArrowLeft } from "lucide-react";

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
  const gameColor = getGameColor(gameType);
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

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: gameColor }}
          />
          <CardTitle>{config.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Balance */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-sm text-slate-500 mb-1">Available Balance</div>
          <div className="text-2xl font-bold text-slate-900 font-heading">{formatUSDC(balance)}</div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-sm font-medium text-slate-700 mb-3">Quick Select</div>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((amount) => {
              const amountBigInt = parseUSDC(amount);
              const isAvailable = amountBigInt <= balance;
              const isSelected = selectedPreset === amount;

              return (
                <button
                  key={amount}
                  onClick={() => isAvailable && handlePresetClick(amount)}
                  disabled={!isAvailable}
                  className={cn(
                    "h-12 rounded-xl text-sm font-semibold transition-all duration-200",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : isAvailable
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-300 cursor-not-allowed"
                  )}
                >
                  ${amount}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom */}
        <Input
          label="Custom Amount"
          type="number"
          placeholder="0.00"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          hint={`Min ${formatUSDC(config.minStake)} · Max ${formatUSDC(config.maxStake)}`}
        />

        {/* Selected */}
        {stakeAmount > BigInt(0) && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Your Stake</span>
              <span className="text-xl font-bold text-slate-900 font-heading">{formatUSDC(stakeAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Potential Win</span>
              <span className="text-sm font-semibold text-green-600">
                {formatUSDC(stakeAmount * BigInt(2) * BigInt(97) / BigInt(100))}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {stakeAmount > BigInt(0) && !isValidStake && (
          <p className="text-sm text-red-500">
            {stakeAmount > balance
              ? "Insufficient balance"
              : stakeAmount < config.minStake
                ? `Minimum stake is ${formatUSDC(config.minStake)}`
                : `Maximum stake is ${formatUSDC(config.maxStake)}`}
          </p>
        )}

        {/* Actions */}
        <Button
          onClick={() => isValidStake && onConfirm(stakeAmount)}
          disabled={!isValidStake || isLoading}
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Find Match
        </Button>
      </CardContent>
    </Card>
  );
}
