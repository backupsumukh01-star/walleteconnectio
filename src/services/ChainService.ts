import { REQUESTED_EVM_CHAINS } from "../config/chains";
import type { EvmChainDefinition } from "../types/namespace";
import { parseCaip2, parseEip155Account, toEip155Caip } from "../utils/caip";
import { uniqueStrings } from "../utils/format";

export class ChainService {
  listRequestedEvmChains(): readonly EvmChainDefinition[] {
    return REQUESTED_EVM_CHAINS;
  }

  getEvmChain(chainId: number): EvmChainDefinition | undefined {
    return REQUESTED_EVM_CHAINS.find((chain) => chain.chainId === chainId);
  }

  getDisplayName(chainId: number): string {
    return this.getEvmChain(chainId)?.name ?? `Chain ${chainId}`;
  }

  toCaip2(chainId: number): `eip155:${number}` {
    return toEip155Caip(chainId);
  }

  extractApprovedChainsFromAccounts(accounts: readonly string[]): string[] {
    const chains = accounts
      .map((account) => parseEip155Account(account))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null)
      .map((parsed) => toEip155Caip(parsed.chainId));

    return uniqueStrings(chains);
  }

  extractAddresses(accounts: readonly string[]): string[] {
    const addresses = accounts
      .map((account) => parseEip155Account(account))
      .filter((parsed): parsed is NonNullable<typeof parsed> => parsed !== null)
      .map((parsed) => parsed.address);

    return uniqueStrings(addresses);
  }

  formatChainLabel(caip2: string): string {
    const parsed = parseCaip2(caip2);
    if (!parsed || parsed.namespace !== "eip155") {
      return caip2;
    }

    const chainId = Number(parsed.reference);
    if (!Number.isInteger(chainId)) {
      return caip2;
    }

    return `${this.getDisplayName(chainId)} (${caip2})`;
  }
}

export const chainService = new ChainService();
