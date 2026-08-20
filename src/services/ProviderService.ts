import { BrowserProvider } from "ethers";
import type { WalletConnectProvider } from "../types/wallet";

/**
 * Holds the live WalletConnect EIP-1193 provider.
 *
 * The provider instance is not JSON-serializable. After a refresh it is
 * rehydrated by WalletConnectService via EthereumProvider.init(), which
 * reads the official WalletConnect client storage, then re-attached here.
 *
 * Phase 2 can add: getSigner(), getContract(), request() helpers, SIWE.
 */
export class ProviderService {
  private provider: WalletConnectProvider | null = null;

  setProvider(provider: WalletConnectProvider | null): void {
    this.provider = provider;
  }

  getProvider(): WalletConnectProvider | null {
    return this.provider;
  }

  requireProvider(): WalletConnectProvider {
    if (!this.provider) {
      throw new Error("WalletConnect provider is not initialized.");
    }

    return this.provider;
  }

  isConnected(): boolean {
    return Boolean(this.provider?.session);
  }

  /**
   * ethers v6 wrapper for Phase 2 contract / signature / tx work.
   * Phase 1 does not send transactions or signatures.
   */
  getEthersBrowserProvider(): BrowserProvider {
    return new BrowserProvider(this.requireProvider());
  }
}

export const providerService = new ProviderService();
