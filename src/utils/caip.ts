import type { WalletConnectNamespaceKey } from "../types/namespace";

const CAIP2_PATTERN = /^([a-z0-9]+):([a-zA-Z0-9]+)$/;

export function toEip155Caip(chainId: number): `eip155:${number}` {
  return `eip155:${chainId}`;
}

export function parseCaip2(value: string): {
  namespace: string;
  reference: string;
} | null {
  const match = CAIP2_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const namespace = match[1];
  const reference = match[2];
  if (!namespace || !reference) {
    return null;
  }

  return { namespace, reference };
}

export function parseEip155Account(account: string): {
  chainId: number;
  address: string;
} | null {
  const parts = account.split(":");
  if (parts.length !== 3 || parts[0] !== "eip155") {
    return null;
  }

  const chainId = Number(parts[1]);
  const address = parts[2];
  if (!Number.isInteger(chainId) || !address) {
    return null;
  }

  return { chainId, address };
}

export function isNamespaceKey(value: string): value is WalletConnectNamespaceKey {
  return (
    value === "eip155" ||
    value === "solana" ||
    value === "cosmos" ||
    value === "polkadot" ||
    value === "bip122" ||
    value === "near" ||
    value === "tezos" ||
    value === "kadena"
  );
}

export function normalizeChainId(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
    return Number.parseInt(trimmed, 16);
  }

  return Number.parseInt(trimmed, 10);
}
