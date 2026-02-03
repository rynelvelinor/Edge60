import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { Address, ENSProfile } from "../types";

// Public client for ENS resolution (always on mainnet)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Resolve ENS name to address
 */
export async function resolveENSName(name: string): Promise<Address | null> {
  try {
    const address = await publicClient.getEnsAddress({
      name: normalize(name),
    });
    return address as Address | null;
  } catch (error) {
    console.error("ENS resolution error:", error);
    return null;
  }
}

/**
 * Resolve address to ENS name
 */
export async function resolveENSAddress(
  address: Address
): Promise<string | null> {
  try {
    const name = await publicClient.getEnsName({ address });
    return name;
  } catch (error) {
    console.error("ENS reverse lookup error:", error);
    return null;
  }
}

/**
 * Get ENS avatar
 */
export async function getENSAvatar(
  nameOrAddress: string
): Promise<string | null> {
  try {
    // If it's an address, first resolve to name
    let name = nameOrAddress;
    if (nameOrAddress.startsWith("0x")) {
      const resolved = await resolveENSAddress(nameOrAddress as Address);
      if (!resolved) return null;
      name = resolved;
    }

    const avatar = await publicClient.getEnsAvatar({
      name: normalize(name),
    });
    return avatar;
  } catch (error) {
    console.error("ENS avatar error:", error);
    return null;
  }
}

/**
 * Get ENS text record
 */
export async function getENSTextRecord(
  name: string,
  key: string
): Promise<string | null> {
  try {
    const record = await publicClient.getEnsText({
      name: normalize(name),
      key,
    });
    return record;
  } catch (error) {
    console.error("ENS text record error:", error);
    return null;
  }
}

/**
 * Get full Edge60 profile from ENS
 */
export async function getEdge60Profile(
  addressOrName: string
): Promise<ENSProfile | null> {
  try {
    let address: Address;
    let name: string | null = null;

    if (addressOrName.startsWith("0x")) {
      address = addressOrName as Address;
      name = await resolveENSAddress(address);
    } else {
      const resolved = await resolveENSName(addressOrName);
      if (!resolved) return null;
      address = resolved;
      name = addressOrName;
    }

    const profile: ENSProfile = {
      address,
      name: name || undefined,
      records: {},
    };

    if (name) {
      // Fetch Edge60-specific records
      const [avatar, winRate, totalVolume, skillScore] = await Promise.all([
        getENSAvatar(name),
        getENSTextRecord(name, "edge60.winRate"),
        getENSTextRecord(name, "edge60.totalVolume"),
        getENSTextRecord(name, "edge60.skillScore"),
      ]);

      profile.avatar = avatar || undefined;
      profile.records = {
        "edge60.winRate": winRate || undefined,
        "edge60.totalVolume": totalVolume || undefined,
        "edge60.skillScore": skillScore || undefined,
      };
    }

    return profile;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

/**
 * Format address with ENS name for display
 */
export function formatAddressOrENS(
  address: Address,
  ensName?: string | null
): string {
  if (ensName) {
    return ensName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Shorten address
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
