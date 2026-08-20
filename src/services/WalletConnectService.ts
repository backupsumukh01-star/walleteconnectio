import { createAppKit } from "@reown/appkit";
import { mainnet } from "@reown/appkit/networks";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import UniversalProvider from "@walletconnect/universal-provider";
import { OPTIONAL_EVM_CHAIN_IDS } from "../config/chains";
import { getWalletConnectProjectId } from "../config/env";
import {
  evmChainIdForStandard,
  getAppMetadata,
  getEthereumProviderInitConfig,
  getTronOptionalNamespaces,
} from "../config/walletConnect";
import type { SessionSnapshot, TokenStandard, WalletConnectProvider } from "../types/wallet";
import { mapWalletError, missingProjectIdError } from "../utils/errors";
import { providerService } from "./ProviderService";
import { sessionService } from "./SessionService";

type SessionListener = (snapshot: SessionSnapshot | null) => void;
type ErrorListener = (message: string | null) => void;
type AppKitModal = ReturnType<typeof createAppKit>;

export class WalletConnectService {
  private evmInitPromise: Promise<WalletConnectProvider> | null = null;
  private universalInitPromise: Promise<UniversalProvider> | null = null;
  private modal: AppKitModal | null = null;
  private evmListenersAttached = false;
  private universalListenersAttached = false;
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

  async connect(standard: TokenStandard): Promise<SessionSnapshot> {
    if (!getWalletConnectProjectId()) {
      throw missingProjectIdError();
    }

    try {
      const snapshot =
        standard === "TRC20" ? await this.connectTron() : await this.connectEvm(standard);

      this.emitError(null);
      this.emitSession(snapshot);
      return snapshot;
    } catch (error) {
      const mapped = mapWalletError(error);
      this.emitError(mapped.message);
      throw mapped;
    }
  }

  async disconnect(): Promise<void> {
    await this.disconnectProviders();
    sessionService.clear();
    this.emitSession(null);
  }

  async restoreSession(): Promise<SessionSnapshot | null> {
    if (!getWalletConnectProjectId()) {
      throw missingProjectIdError();
    }

    const evm = await this.getEvmProvider(OPTIONAL_EVM_CHAIN_IDS);
    if (evm.session) {
      return this.captureEvm(evm);
    }

    const universal = await this.getUniversalProvider();
    if (universal.session?.namespaces.tron) {
      return this.captureUniversal(universal);
    }

    sessionService.clear();
    this.emitSession(null);
    return null;
  }

  private async connectEvm(standard: Exclude<TokenStandard, "TRC20">): Promise<SessionSnapshot> {
    await this.disconnectProviders();
    const chainId = evmChainIdForStandard(standard);
    this.evmInitPromise = null;
    providerService.setEvmProvider(null);
    this.evmListenersAttached = false;

    const provider = await this.getEvmProvider([chainId] as [number, ...number[]]);
    await provider.connect();

    const snapshot = this.captureEvm(provider);
    if (!snapshot) {
      throw new Error("Invalid session after connect.");
    }

    return snapshot;
  }

  private async connectTron(): Promise<SessionSnapshot> {
    await this.disconnectProviders();
    const provider = await this.getUniversalProvider();
    const modal = this.getOrCreateModal(provider);

    await modal.open();
    try {
      await provider.connect({
        optionalNamespaces: getTronOptionalNamespaces(),
      });
    } finally {
      await modal.close();
    }

    const snapshot = this.captureUniversal(provider);
    if (!snapshot) {
      throw new Error("Invalid session after connect.");
    }

    return snapshot;
  }

  private async getEvmProvider(chainIds: [number, ...number[]]): Promise<WalletConnectProvider> {
    const existing = providerService.getEvmProvider();
    if (existing && this.evmInitPromise) {
      this.attachEvmListeners(existing);
      return existing;
    }

    this.evmInitPromise = EthereumProvider.init(getEthereumProviderInitConfig(chainIds));
    const provider = await this.evmInitPromise;
    providerService.setEvmProvider(provider);
    this.attachEvmListeners(provider);
    return provider;
  }

  private async getUniversalProvider(): Promise<UniversalProvider> {
    const existing = providerService.getUniversalProvider();
    if (existing) {
      this.attachUniversalListeners(existing);
      return existing;
    }

    if (!this.universalInitPromise) {
      this.universalInitPromise = UniversalProvider.init({
        projectId: getWalletConnectProjectId(),
        metadata: getAppMetadata(),
      });
    }

    const provider = await this.universalInitPromise;
    providerService.setUniversalProvider(provider);
    this.attachUniversalListeners(provider);
    return provider;
  }

  private getOrCreateModal(provider: UniversalProvider): AppKitModal {
    if (this.modal) {
      return this.modal;
    }

    this.modal = createAppKit({
      projectId: getWalletConnectProjectId(),
      metadata: getAppMetadata(),
      networks: [mainnet],
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

  private attachEvmListeners(provider: WalletConnectProvider): void {
    if (this.evmListenersAttached) {
      return;
    }

    provider.on("accountsChanged", () => {
      if (!provider.session) {
        sessionService.clear();
        this.emitSession(null);
        return;
      }

      this.captureEvm(provider);
    });

    provider.on("chainChanged", () => {
      this.captureEvm(provider);
    });

    provider.on("disconnect", () => {
      sessionService.clear();
      this.emitSession(null);
    });

    this.evmListenersAttached = true;
  }

  private attachUniversalListeners(provider: UniversalProvider): void {
    if (this.universalListenersAttached) {
      return;
    }

    provider.on("session_delete", () => {
      sessionService.clear();
      this.emitSession(null);
    });

    this.universalListenersAttached = true;
  }

  private captureEvm(provider: WalletConnectProvider): SessionSnapshot | null {
    if (!provider.session) {
      sessionService.clear();
      return null;
    }

    const snapshot = sessionService.buildSnapshot({
      session: provider.session,
      accounts: provider.accounts,
      chainId: provider.chainId,
      providerType: "walletconnect-ethereum",
    });

    return this.persistIfValid(snapshot, provider.session);
  }

  private captureUniversal(provider: UniversalProvider): SessionSnapshot | null {
    if (!provider.session) {
      sessionService.clear();
      return null;
    }

    const snapshot = sessionService.buildSnapshot({
      session: provider.session,
      providerType: "walletconnect-universal",
    });

    return this.persistIfValid(snapshot, provider.session);
  }

  private persistIfValid(
    snapshot: SessionSnapshot | null,
    session: NonNullable<WalletConnectProvider["session"]>,
  ): SessionSnapshot | null {
    if (!snapshot || !sessionService.isValidAgainstSession(snapshot, session)) {
      sessionService.clear();
      return null;
    }

    sessionService.persist(snapshot);
    this.emitSession(snapshot);
    return snapshot;
  }

  private async disconnectProviders(): Promise<void> {
    const evm = providerService.getEvmProvider();
    const universal = providerService.getUniversalProvider();

    try {
      if (evm) {
        await evm.disconnect();
      }
    } catch {
      // Wallet may already be disconnected.
    }

    try {
      if (universal?.session) {
        await universal.disconnect();
      }
    } catch {
      // Wallet may already be disconnected.
    }

    this.evmInitPromise = null;
    this.universalInitPromise = null;
    this.evmListenersAttached = false;
    this.universalListenersAttached = false;
    providerService.setEvmProvider(null);
    providerService.setUniversalProvider(null);
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
