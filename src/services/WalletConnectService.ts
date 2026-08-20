import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { getEthereumProviderInitConfig } from "../config/walletConnect";
import { getWalletConnectProjectId } from "../config/env";
import type { SessionSnapshot, WalletConnectProvider } from "../types/wallet";
import { mapWalletError, missingProjectIdError } from "../utils/errors";
import { providerService } from "./ProviderService";
import { sessionService } from "./SessionService";

type SessionListener = (snapshot: SessionSnapshot | null) => void;
type ErrorListener = (message: string | null) => void;

/**
 * Official WalletConnect v2 Ethereum Provider integration.
 * @see https://docs.reown.com/advanced/providers/ethereum
 *
 * Opens the WalletConnect modal (QR on desktop, deep link on mobile),
 * requests optional eip155 namespaces for major EVM chains, and restores
 * sessions after refresh from WalletConnect client storage.
 */
export class WalletConnectService {
  private initPromise: Promise<WalletConnectProvider> | null = null;
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

  async initialize(): Promise<WalletConnectProvider> {
    if (!getWalletConnectProjectId()) {
      throw missingProjectIdError();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.createProvider();

    try {
      return await this.initPromise;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  async connect(): Promise<SessionSnapshot> {
    const provider = await this.initialize();

    try {
      await provider.connect();
    } catch (error) {
      const mapped = mapWalletError(error);
      this.emitError(mapped.message);
      throw mapped;
    }

    const snapshot = this.captureSession(provider);
    if (!snapshot) {
      const invalid = mapWalletError(new Error("Invalid session after connect."));
      this.emitError(invalid.message);
      throw invalid;
    }

    this.emitError(null);
    this.emitSession(snapshot);
    return snapshot;
  }

  async disconnect(): Promise<void> {
    const provider = providerService.getProvider();

    try {
      if (provider) {
        await provider.disconnect();
      }
    } catch (error) {
      const mapped = mapWalletError(error);
      this.emitError(mapped.message);
    } finally {
      sessionService.clear();
      this.emitSession(null);
    }
  }

  async restoreSession(): Promise<SessionSnapshot | null> {
    const provider = await this.initialize();
    const snapshot = this.captureSession(provider);

    if (!snapshot) {
      sessionService.clear();
      this.emitSession(null);
      return null;
    }

    this.emitError(null);
    this.emitSession(snapshot);
    return snapshot;
  }

  getCachedSession(): SessionSnapshot | null {
    return sessionService.restoreLocal();
  }

  private async createProvider(): Promise<WalletConnectProvider> {
    const existing = providerService.getProvider();
    if (existing) {
      this.attachListeners(existing);
      return existing;
    }

    const provider = await EthereumProvider.init(getEthereumProviderInitConfig());
    providerService.setProvider(provider);
    this.attachListeners(provider);
    return provider;
  }

  private attachListeners(provider: WalletConnectProvider): void {
    if (this.listenersAttached) {
      return;
    }

    provider.on("connect", () => {
      this.captureSession(provider);
    });

    provider.on("accountsChanged", () => {
      if (!provider.session) {
        sessionService.clear();
        this.emitSession(null);
        return;
      }

      this.captureSession(provider);
    });

    provider.on("chainChanged", () => {
      this.captureSession(provider);
    });

    provider.on("disconnect", () => {
      sessionService.clear();
      this.emitSession(null);
    });

    this.listenersAttached = true;
  }

  private captureSession(provider: WalletConnectProvider): SessionSnapshot | null {
    const snapshot = sessionService.buildSnapshot(provider);
    if (!snapshot || !sessionService.isValidAgainstProvider(snapshot, provider)) {
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
