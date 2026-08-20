import type { SessionTypes } from "@walletconnect/types";
import type {
  ApprovedNamespaceSnapshot,
  ApprovedNamespaces,
} from "../types/namespace";
import type { SessionSnapshot, WalletConnectProvider } from "../types/wallet";
import { isNamespaceKey, parseEip155Account } from "../utils/caip";
import { uniqueStrings } from "../utils/format";
import { chainService } from "./ChainService";
import { storageService } from "./StorageService";

export class SessionService {
  buildSnapshot(provider: WalletConnectProvider): SessionSnapshot | null {
    const session = provider.session;
    if (!session) {
      return null;
    }

    const namespaces = this.mapApprovedNamespaces(session.namespaces);
    const eip155 = namespaces.eip155;
    const namespaceAccounts = eip155?.accounts ?? [];
    const addresses = chainService.extractAddresses(namespaceAccounts);
    const providerAccounts = provider.accounts ?? [];
    const connectedAccounts = uniqueStrings([...addresses, ...providerAccounts]);
    const walletAddress = connectedAccounts[0];

    if (!walletAddress || !session.topic) {
      return null;
    }

    const approvedChains = uniqueStrings([
      ...(eip155?.chains ?? []),
      ...chainService.extractApprovedChainsFromAccounts(namespaceAccounts),
    ]);

    const chainId = this.resolveChainId(provider, namespaceAccounts);

    return {
      walletAddress,
      walletName: session.peer.metadata.name || "Unknown wallet",
      walletIcon: session.peer.metadata.icons[0] ?? null,
      chainId,
      connectedAccounts,
      namespaces,
      approvedChains,
      approvedMethods: [...(eip155?.methods ?? [])],
      approvedEvents: [...(eip155?.events ?? [])],
      sessionTopic: session.topic,
      pairingTopic: session.pairingTopic ?? "",
      connectionStatus: "connected",
      timestamp: Date.now(),
      providerType: "walletconnect-ethereum",
    };
  }

  persist(snapshot: SessionSnapshot): void {
    storageService.writeSessionSnapshot(snapshot);
  }

  restoreLocal(): SessionSnapshot | null {
    return storageService.readSessionSnapshot();
  }

  clear(): void {
    storageService.clearSessionSnapshot();
  }

  isValidAgainstProvider(
    snapshot: SessionSnapshot,
    provider: WalletConnectProvider,
  ): boolean {
    const session = provider.session;
    if (!session) {
      return false;
    }

    if (session.topic !== snapshot.sessionTopic) {
      return false;
    }

    if (snapshot.connectedAccounts.length === 0) {
      return false;
    }

    return true;
  }

  private mapApprovedNamespaces(
    namespaces: SessionTypes.Namespaces,
  ): ApprovedNamespaces {
    const mapped: ApprovedNamespaces = {};

    for (const [key, value] of Object.entries(namespaces)) {
      if (!isNamespaceKey(key)) {
        continue;
      }

      mapped[key] = this.toApprovedNamespace(value);
    }

    return mapped;
  }

  private toApprovedNamespace(
    value: SessionTypes.Namespace,
  ): ApprovedNamespaceSnapshot {
    return {
      accounts: value.accounts,
      chains: value.chains ?? chainService.extractApprovedChainsFromAccounts(value.accounts),
      methods: value.methods,
      events: value.events,
    };
  }

  private resolveChainId(
    provider: WalletConnectProvider,
    namespaceAccounts: readonly string[],
  ): number {
    const fromProvider = Number(provider.chainId);
    if (Number.isInteger(fromProvider) && fromProvider > 0) {
      return fromProvider;
    }

    const parsed = namespaceAccounts
      .map((account) => parseEip155Account(account))
      .find((item) => item !== null);

    return parsed?.chainId ?? 1;
  }
}

export const sessionService = new SessionService();
