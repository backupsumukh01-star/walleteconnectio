import { createAppKit } from "@reown/appkit";
import { bsc, mainnet } from "@reown/appkit/networks";
import UniversalProvider from "@walletconnect/universal-provider";
import { getWalletConnectProjectId } from "../config/env";
import { getAppMetadata, getMultiNetworkNamespaces } from "../config/walletConnect";
import type { SessionSnapshot } from "../types/wallet";
import { mapWalletError, missingProjectIdError } from "../utils/errors";
import { providerService } from "./ProviderService";
import { sessionService } from "./SessionService";

type SessionListener = (snapshot: SessionSnapshot | null) => void;
type ErrorListener = (message: string | null) => void;
type AppKitModal = ReturnType<typeof createAppKit>;

/**
 * One WalletConnect session for ERC20 (Ethereum), BEP20 (BSC), and TRC20 (Tron).
 */
export class WalletConnectService {
  private initPromise: Promise<UniversalProvider> | null = null;
  private modal: AppKitModal | null = null;
  private listenersAttached = false;
  private readonly sessionListeners = new Set<SessionListener>();
  private readonly errorListeners = new Set<ErrorListener>();

  onSessionChange(listener: SessionListener): () => void {
    this.sessionListeners.add(listener);
    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  async connect(): Promise<SessionSnapshot> {
    if (!getWalletConnectProjectId()) {
      throw missingProjectIdError();
    }

    const provider = await this.getProvider();
    const modal = this.getOrCreateModal(provider);

    try {
      await modal.open();
      await provider.connect({
        optionalNamespaces: getMultiNetworkNamespaces(),
      });
    } catch (error) {
      const mapped = mapWalletError(error);
      this.emitError(mapped.message);
      throw mapped;
    } finally {
      await modal.close();
    }

    const snapshot = this.capture(provider);
    if (!snapshot) {
      const invalid = mapWalletError(new Error("Invalid session after connect."));
      this.emitError(invalid.message);
      throw invalid;
    }

    this.emitError(null);
    return snapshot;
  }

  async disconnect(): Promise<void> {
    const provider = providerService.getUniversalProvider();

    try {
      if (provider?.session) {
        await provider.disconnect();
      }
    } catch {
      // Already disconnected.
    }

    sessionService.clear();
    this.emitSession(null);
  }

  async restoreSession(): Promise<SessionSnapshot | null> {
    if (!getWalletConnectProjectId()) {
      throw missingProjectIdError();
    }

    const provider = await this.getProvider();
    if (!provider.session) {
      sessionService.clear();
      this.emitSession(null);
      return null;
    }

    return this.capture(provider);
  }

  private async getProvider(): Promise<UniversalProvider> {
    const existing = providerService.getUniversalProvider();
    if (existing) {
      this.attachListeners(existing);
      return existing;
    }

    if (!this.initPromise) {
      this.initPromise = UniversalProvider.init({
        projectId: getWalletConnectProjectId(),
        metadata: getAppMetadata(),
      });
    }

    const provider = await this.initPromise;
    providerService.setUniversalProvider(provider);
    this.attachListeners(provider);
    return provider;
  }

  private getOrCreateModal(provider: UniversalProvider): AppKitModal {
    if (this.modal) {
      return this.modal;
    }

    this.modal = createAppKit({
      projectId: getWalletConnectProjectId(),
      metadata: getAppMetadata(),
      networks: [mainnet, bsc],
      universalProvider: provider,
      manualWCControl: true,
      themeMode: "dark",
      features: {
        analytics: false,
        email: false,
        socials: [],
      },
    });

    return this.modal;
  }

  private attachListeners(provider: UniversalProvider): void {
    if (this.listenersAttached) {
      return;
    }

    provider.on("session_delete", () => {
      sessionService.clear();
      this.emitSession(null);
    });

    provider.on("session_update", () => {
      this.capture(provider);
    });

    this.listenersAttached = true;
  }

  private capture(provider: UniversalProvider): SessionSnapshot | null {
    if (!provider.session) {
      sessionService.clear();
      return null;
    }

    const snapshot = sessionService.buildSnapshot({
      session: provider.session,
      providerType: "walletconnect-universal",
    });

    if (!snapshot || !sessionService.isValidAgainstSession(snapshot, provider.session)) {
      sessionService.clear();
      return null;
    }

    sessionService.persist(snapshot);
    this.emitSession(snapshot);
    return snapshot;
  }

  private emitSession(snapshot: SessionSnapshot | null): void {
    for (const listener of this.sessionListeners) {
      listener(snapshot);
    }
  }

  private emitError(message: string | null): void {
    for (const listener of this.errorListeners) {
      listener(message);
    }
  }
}

export const walletConnectService = new WalletConnectService();
