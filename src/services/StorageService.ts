import { STORAGE_KEYS } from "../config/storage";
import type { SessionSnapshot } from "../types/wallet";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class StorageService {
  readSessionSnapshot(): SessionSnapshot | null {
    if (!isBrowser()) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.sessionSnapshot);
      if (!raw) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!isSessionSnapshot(parsed)) {
        this.clearSessionSnapshot();
        return null;
      }

      return parsed;
    } catch {
      this.clearSessionSnapshot();
      return null;
    }
  }

  writeSessionSnapshot(snapshot: SessionSnapshot): void {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEYS.sessionSnapshot,
      JSON.stringify(snapshot),
    );
  }

  clearSessionSnapshot(): void {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.sessionSnapshot);
  }
}

export const storageService = new StorageService();

function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.walletAddress === "string" &&
    typeof record.walletName === "string" &&
    (typeof record.walletIcon === "string" || record.walletIcon === null) &&
    typeof record.chainId === "number" &&
    Array.isArray(record.tokenStandards) &&
    Array.isArray(record.connectedAccounts) &&
    Array.isArray(record.caipAccounts) &&
    typeof record.namespaces === "object" &&
    record.namespaces !== null &&
    Array.isArray(record.approvedChains) &&
    Array.isArray(record.approvedMethods) &&
    Array.isArray(record.approvedEvents) &&
    typeof record.sessionTopic === "string" &&
    typeof record.pairingTopic === "string" &&
    record.connectionStatus === "connected" &&
    typeof record.timestamp === "number" &&
    (record.providerType === "walletconnect-ethereum" ||
      record.providerType === "walletconnect-universal")
  );
}
