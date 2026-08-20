import type { EvmChainDefinition } from "../types/namespace";

/**
 * EVM chains requested as optional WalletConnect namespaces.
 *
 * These are well-known production networks commonly used with the
 * WalletConnect `eip155` namespace. They are proposed as *optional*
 * so wallets that support a subset (including smart-contract wallets
 * on a single chain) can still connect.
 *
 * Do not add experimental or unofficial chain IDs here.
 * Solana / Cosmos / Bitcoin namespaces are reserved in types only.
 */
export const REQUESTED_EVM_CHAINS: readonly EvmChainDefinition[] = [
  { chainId: 1, name: "Ethereum Mainnet", namespace: "eip155", caip2: "eip155:1" },
  { chainId: 56, name: "BNB Smart Chain", namespace: "eip155", caip2: "eip155:56" },
  { chainId: 137, name: "Polygon", namespace: "eip155", caip2: "eip155:137" },
  { chainId: 42161, name: "Arbitrum One", namespace: "eip155", caip2: "eip155:42161" },
  { chainId: 10, name: "Optimism", namespace: "eip155", caip2: "eip155:10" },
  { chainId: 8453, name: "Base", namespace: "eip155", caip2: "eip155:8453" },
  { chainId: 43114, name: "Avalanche C-Chain", namespace: "eip155", caip2: "eip155:43114" },
  { chainId: 250, name: "Fantom Opera", namespace: "eip155", caip2: "eip155:250" },
  { chainId: 59144, name: "Linea", namespace: "eip155", caip2: "eip155:59144" },
  { chainId: 324, name: "zkSync Era", namespace: "eip155", caip2: "eip155:324" },
  { chainId: 534352, name: "Scroll", namespace: "eip155", caip2: "eip155:534352" },
  { chainId: 81457, name: "Blast", namespace: "eip155", caip2: "eip155:81457" },
  { chainId: 5000, name: "Mantle", namespace: "eip155", caip2: "eip155:5000" },
  { chainId: 34443, name: "Mode", namespace: "eip155", caip2: "eip155:34443" },
  { chainId: 25, name: "Cronos", namespace: "eip155", caip2: "eip155:25" },
  { chainId: 100, name: "Gnosis", namespace: "eip155", caip2: "eip155:100" },
  { chainId: 42220, name: "Celo", namespace: "eip155", caip2: "eip155:42220" },
  { chainId: 1313161554, name: "Aurora", namespace: "eip155", caip2: "eip155:1313161554" },
  { chainId: 1284, name: "Moonbeam", namespace: "eip155", caip2: "eip155:1284" },
  { chainId: 1285, name: "Moonriver", namespace: "eip155", caip2: "eip155:1285" },
] as const;

export const OPTIONAL_EVM_CHAIN_IDS = REQUESTED_EVM_CHAINS.map(
  (chain) => chain.chainId,
) as [number, ...number[]];
