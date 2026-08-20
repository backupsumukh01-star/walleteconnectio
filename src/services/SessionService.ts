import type { SessionTypes } from "@walletconnect/types";
import type {
  ApprovedNamespaceSnapshot,
  ApprovedNamespaces,
} from "../types/namespace";
import type { SessionSnapshot } from "../types/wallet";
import { isNamespaceKey, parseCaipAccount } from "../utils/caip";
import { uniqueStrings } from "../utils/format";
import { chainService } from "./ChainService";
import { storageService } from "./StorageService";
import { TRON_MAINNET } from "../config/chains";

interface SessionSource {
  readonly session: SessionTypes.Struct;
  readonly accounts?: readonly string[];
  readonly chainId?: number | string;
  readonly providerType: SessionSnapshot["providerType"];
}

export class SessionService {
  buildSnapshot(source: SessionSource): SessionSnapshot | null {
    const { session } = source;
    const namespaces = this.mapApprovedNamespaces(session.namespaces);
    const namespaceAccounts = this.collectAccounts(namespaces);
    const extraAccounts = [...(source.accounts ?? [])];
    const connectedAccounts = uniqueStrings([
      ...chainService.extractAddresses(namespaceAccounts),
      ...extraAccounts,
    ]);
    const walletAddress = connectedAccounts[0];

    if (!walletAddress || !session.topic) {
      return null;
    }

    const approvedChains = uniqueStrings([
      ...this.collectChains(namespaces),
      ...chainService.extractApprovedChainsFromAccounts(namespaceAccounts),
    ]);

    const chainId = this.resolveChainId(source, namespaces, namespaceAccounts);
    const tokenStandards = chainService.detectTokenStandards({
      namespaces,
      chainId,
    });
    const approvedMethods = uniqueStrings([
      ...(namespaces.eip155?.methods ?? []),
      ...(namespaces.tron?.methods ?? []),
    ]);
    const approvedEvents = uniqueStrings([
      ...(namespaces.eip155?.events ?? []),
      ...(namespaces.tron?.events ?? []),
    ]);

    return {
      walletAddress,
      walletName: session.peer.metadata.name || "Unknown wallet",
      walletIcon: session.peer.metadata.icons[0] ?? null,
      chainId,
      tokenStandards,
      connectedAccounts,
      namespaces,
      approvedChains,
      approvedMethods,
      approvedEvents,
      sessionTopic: session.topic,
      pairingTopic: session.pairingTopic ?? "",
      connectionStatus: "connected",
      timestamp: Date.now(),
      providerType: source.providerType,
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

  isValidAgainstSession(
    snapshot: SessionSnapshot,
    session: SessionTypes.Struct | undefined,
  ): boolean {
    if (!session) {
      return false;
    }

    return session.topic === snapshot.sessionTopic && snapshot.connectedAccounts.length > 0;
  }

  private collectAccounts(namespaces: ApprovedNamespaces): string[] {
    return uniqueStrings(
      Object.values(namespaces).flatMap((value) => (value ? [...value.accounts] : [])),
    );
  }

  private collectChains(namespaces: ApprovedNamespaces): string[] {
    return uniqueStrings(
      Object.values(namespaces).flatMap((value) => (value ? [...value.chains] : [])),
    );
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
    source: SessionSource,
    namespaces: ApprovedNamespaces,
    namespaceAccounts: readonly string[],
  ): number {
    if (namespaces.tron) {
      return TRON_MAINNET.chainId;
    }

    if (source.chainId !== undefined) {
      const fromProvider = Number(source.chainId);
      if (Number.isInteger(fromProvider) && fromProvider > 0) {
        return fromProvider;
      }
    }

    const parsed = namespaceAccounts
      .map((account) => parseCaipAccount(account))
      .find((item) => item?.namespace === "eip155");

    if (parsed) {
      const chainId = Number(parsed.chainReference);
      if (Number.isInteger(chainId)) {
        return chainId;
      }
    }

    return 1;
  }
}

export const sessionService = new SessionService();
