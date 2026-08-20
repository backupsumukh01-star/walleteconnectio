import { BNB_CHAIN, ETHEREUM_CHAIN, REQUESTED_EVM_CHAINS, TRON_MAINNET } from "../config/chains";
import type { EvmChainDefinition } from "../types/namespace";
import type { TokenStandard } from "../types/wallet";
import { parseCaip2, parseCaipAccount, toEip155Caip } from "../utils/caip";
import { uniqueStrings } from "../utils/format";

export class ChainService {
  listRequestedEvmChains(): readonly EvmChainDefinition[] {
    return REQUESTED_EVM_CHAINS;
  }

  getEvmChain(chainId: number): EvmChainDefinition | undefined {
    return REQUESTED_EVM_CHAINS.find((chain) => chain.chainId === chainId);
  }

  getDisplayName(chainId: number): string {
    if (chainId === TRON_MAINNET.chainId) {
      return `${TRON_MAINNET.name} (${TRON_MAINNET.tokenStandard})`;
    }

    const evm = this.getEvmChain(chainId);
    if (evm) {
      return `${evm.name} (${evm.tokenStandard})`;
    }

    return `Chain ${chainId}`;
  }

  toCaip2(chainId: number): string {
    if (chainId === TRON_MAINNET.chainId) {
      return TRON_MAINNET.caip2;
    }

    return toEip155Caip(chainId);
  }

  extractApprovedChainsFromAccounts(accounts: readonly string[]): string[] {
    const chains = accounts
      .map((account) => parseCaipAccount(account))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null)
      .map((parsed) => `${parsed.namespace}:${parsed.chainReference}`);

    return uniqueStrings(chains);
  }

  extractAddresses(accounts: readonly string[]): string[] {
    const addresses = accounts
      .map((account) => parseCaipAccount(account))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null)
      .map((parsed) => parsed.address);

    return uniqueStrings(addresses);
  }

  formatChainLabel(caip2: string): string {
    const parsed = parseCaip2(caip2);
    if (!parsed) {
      return caip2;
    }

    if (parsed.namespace === "tron") {
      return `${TRON_MAINNET.name} TRC20 (${caip2})`;
    }

    if (parsed.namespace === "eip155") {
      const chainId = Number(parsed.reference);
      if (Number.isInteger(chainId)) {
        return `${this.getDisplayName(chainId)} (${caip2})`;
      }
    }

    return caip2;
  }

  detectTokenStandards(args: {
    namespaces: {
      eip155?: { accounts?: readonly string[]; chains?: readonly string[] };
      tron?: unknown;
    };
    chainId: number;
  }): TokenStandard[] {
    const standards: TokenStandard[] = [];
    const eipChains = [
      ...(args.namespaces.eip155?.chains ?? []),
      ...this.extractApprovedChainsFromAccounts(args.namespaces.eip155?.accounts ?? []),
    ];

    if (
      args.chainId === ETHEREUM_CHAIN.chainId ||
      eipChains.includes(ETHEREUM_CHAIN.caip2)
    ) {
      standards.push("ERC20");
    }

    if (args.chainId === BNB_CHAIN.chainId || eipChains.includes(BNB_CHAIN.caip2)) {
      if (!standards.includes("BEP20")) {
        standards.push("BEP20");
      }
    }

    if (args.namespaces.tron) {
      standards.push("TRC20");
    }

    if (standards.length === 0) {
      return ["ERC20"];
    }

    return standards;
  }
}

export const chainService = new ChainService();
