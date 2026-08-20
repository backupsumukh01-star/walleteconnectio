import { BrowserProvider } from "ethers";
import type UniversalProvider from "@walletconnect/universal-provider";
import type { WalletConnectProvider } from "../types/wallet";

/**
 * Holds the live WalletConnect provider (EVM EthereumProvider or Tron UniversalProvider).
 */
export class ProviderService {
  private evmProvider: WalletConnectProvider | null = null;
  private universalProvider: UniversalProvider | null = null;

  setEvmProvider(provider: WalletConnectProvider | null): void {
    this.evmProvider = provider;
  }

  setUniversalProvider(provider: UniversalProvider | null): void {
    this.universalProvider = provider;
  }

  getEvmProvider(): WalletConnectProvider | null {
    return this.evmProvider;
  }

  getUniversalProvider(): UniversalProvider | null {
    return this.universalProvider;
  }

  getEvmOrThrow(): WalletConnectProvider {
    if (!this.evmProvider) {
      throw new Error("WalletConnect EVM provider is not initialized.");
    }

    return this.evmProvider;
  }

  isConnected(): boolean {
    return Boolean(this.evmProvider?.session || this.universalProvider?.session);
  }

  getEthersBrowserProvider(): BrowserProvider {
    return new BrowserProvider(this.getEvmOrThrow());
  }
}

export const providerService = new ProviderService();
