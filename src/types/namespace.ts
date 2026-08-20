/**
 * WalletConnect CAIP-2 namespace identifiers.
 * Phase 1 proposes `eip155` only. Additional keys are reserved for Phase 2+.
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
 */
export type WalletConnectNamespaceKey =
  | "eip155"
  | "solana"
  | "cosmos"
  | "polkadot"
  | "bip122"
  | "near"
  | "tezos"
  | "kadena";

export interface CaipChainReference {
  readonly namespace: WalletConnectNamespaceKey;
  readonly reference: string;
}

export interface EvmChainDefinition {
  readonly chainId: number;
  readonly name: string;
  readonly namespace: "eip155";
  readonly caip2: `eip155:${number}`;
}

export interface NamespaceConfig {
  readonly methods: readonly string[];
  readonly events: readonly string[];
  readonly chains: readonly string[];
}

export type NamespaceMap = Partial<
  Record<WalletConnectNamespaceKey, NamespaceConfig>
>;

export interface ApprovedNamespaceSnapshot {
  readonly accounts: readonly string[];
  readonly chains: readonly string[];
  readonly methods: readonly string[];
  readonly events: readonly string[];
}

export type ApprovedNamespaces = Partial<
  Record<WalletConnectNamespaceKey, ApprovedNamespaceSnapshot>
>;
