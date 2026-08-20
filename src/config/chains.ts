import type { EvmChainDefinition } from "../types/namespace";
import type { TokenStandard } from "../types/wallet";

export const ETHEREUM_CHAIN: EvmChainDefinition = {
  chainId: 1,
  name: "Ethereum Mainnet",
  namespace: "eip155",
  caip2: "eip155:1",
  tokenStandard: "ERC20",
};

export const BNB_CHAIN: EvmChainDefinition = {
  chainId: 56,
  name: "BNB Smart Chain",
  namespace: "eip155",
  caip2: "eip155:56",
  tokenStandard: "BEP20",
};

/** Official WalletConnect Tron Mainnet CAIP-2. */
export const TRON_MAINNET = {
  namespace: "tron" as const,
  chainIdHex: "0x2b6653dc",
  chainId: Number.parseInt("0x2b6653dc", 16),
  name: "Tron Mainnet",
  caip2: "tron:0x2b6653dc" as const,
  tokenStandard: "TRC20" as const,
  rpcUrl: "https://api.trongrid.io",
};

export const REQUESTED_EVM_CHAINS: readonly EvmChainDefinition[] = [
  ETHEREUM_CHAIN,
  BNB_CHAIN,
];

export const OPTIONAL_EVM_CHAIN_IDS = [ETHEREUM_CHAIN.chainId, BNB_CHAIN.chainId] as [
  number,
  ...number[],
];

export const CONNECTION_OPTIONS: readonly {
  standard: TokenStandard;
  label: string;
}[] = [
  { standard: "ERC20", label: "ERC20" },
  { standard: "BEP20", label: "BEP20" },
  { standard: "TRC20", label: "TRC20" },
];
