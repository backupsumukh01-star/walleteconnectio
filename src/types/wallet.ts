import type { EthereumProvider } from "@walletconnect/ethereum-provider";
import type { ApprovedNamespaces } from "./namespace";

export type TokenStandard = "ERC20" | "BEP20" | "TRC20";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "restoring"
  | "error";

export type WalletErrorCode =
  | "USER_REJECTED"
  | "WALLET_NOT_INSTALLED"
  | "SESSION_EXPIRED"
  | "INVALID_SESSION"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR"
  | "MISSING_PROJECT_ID"
  | "UNKNOWN";

export interface WalletAppError {
  readonly code: WalletErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

/**
 * Serializable session snapshot stored in localStorage.
 * The live EIP-1193 provider cannot be JSON-serialized; ProviderService
 * restores it from WalletConnect's own storage after refresh.
 */
export interface SessionSnapshot {
  readonly walletAddress: string;
  readonly walletName: string;
  readonly walletIcon: string | null;
  readonly chainId: number;
  readonly tokenStandards: readonly TokenStandard[];
  readonly connectedAccounts: readonly string[];
  readonly caipAccounts: readonly string[];
  readonly namespaces: ApprovedNamespaces;
  readonly approvedChains: readonly string[];
  readonly approvedMethods: readonly string[];
  readonly approvedEvents: readonly string[];
  readonly sessionTopic: string;
  readonly pairingTopic: string;
  readonly connectionStatus: Extract<ConnectionStatus, "connected">;
  readonly timestamp: number;
  readonly providerType: "walletconnect-ethereum" | "walletconnect-universal";
}

export type WalletConnectProvider = Awaited<
  ReturnType<typeof EthereumProvider.init>
>;

export interface WalletState {
  readonly status: ConnectionStatus;
  readonly session: SessionSnapshot | null;
  readonly error: WalletAppError | null;
  readonly isInitialized: boolean;
}
