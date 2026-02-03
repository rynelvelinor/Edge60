"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { resolveENSAddress, getENSAvatar, getEdge60Profile } from "../lib/ens";
import { Address, ENSProfile } from "../types";

/**
 * Hook to resolve ENS name for connected wallet
 */
export function useENSName() {
  const { address } = useAccount();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      return;
    }

    setIsLoading(true);
    resolveENSAddress(address as Address)
      .then(setEnsName)
      .finally(() => setIsLoading(false));
  }, [address]);

  return { ensName, isLoading };
}

/**
 * Hook to get ENS avatar
 */
export function useENSAvatar(addressOrName?: string) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!addressOrName) {
      setAvatar(null);
      return;
    }

    setIsLoading(true);
    getENSAvatar(addressOrName)
      .then(setAvatar)
      .finally(() => setIsLoading(false));
  }, [addressOrName]);

  return { avatar, isLoading };
}

/**
 * Hook to get full Edge60 profile from ENS
 */
export function useEdge60Profile(addressOrName?: string) {
  const [profile, setProfile] = useState<ENSProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressOrName) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getEdge60Profile(addressOrName)
      .then((p) => {
        setProfile(p);
        if (!p) setError("Profile not found");
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [addressOrName]);

  return { profile, isLoading, error };
}

/**
 * Hook for opponent ENS resolution
 */
export function useOpponentENS(opponentAddress?: Address) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!opponentAddress) {
      setEnsName(null);
      setAvatar(null);
      return;
    }

    resolveENSAddress(opponentAddress).then(setEnsName);
    getENSAvatar(opponentAddress).then(setAvatar);
  }, [opponentAddress]);

  return { ensName, avatar };
}
