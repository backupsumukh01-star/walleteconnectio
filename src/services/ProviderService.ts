import { BrowserProvider } from "ethers";
import type UniversalProvider from "@walletconnect/universal-provider";

export class ProviderService {
  private universalProvider: UniversalProvider | null = null;

  setUniversalProvider(provider: UniversalProvider | null): void {
    this.universalProvider = provider;
  }

  getUniversalProvider(): UniversalProvider | null {
    return this.universalProvider;
  }

  isConnected(): boolean {
    return Boolean(this.universalProvider?.session);
  }

  getEthersBrowserProvider(): BrowserProvider {
    if (!this.universalProvider) {
      throw new Error("WalletConnect provider is not initialized.");
    }

    return new BrowserProvider(this.universalProvider);
  }
}

export const providerService = new ProviderService();
