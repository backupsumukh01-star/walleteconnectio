import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { OPTIONAL_EVM_CHAIN_IDS } from "./chains";
import { getWalletConnectProjectId } from "./env";

type EthereumProviderInitOptions = Parameters<typeof EthereumProvider.init>[0];

/**
 * Default EIP-1193 methods requested as optional session permissions.
 * Matches @walletconnect/ethereum-provider OPTIONAL_METHODS so Phase 2
 * (signatures, txs, wallet_switchEthereumChain) can reuse this session.
 */
export const OPTIONAL_EVM_METHODS = [
  "eth_accounts",
  "eth_requestAccounts",
  "eth_sendRawTransaction",
  "eth_sign",
  "eth_signTransaction",
  "eth_signTypedData",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
  "personal_sign",
  "wallet_switchEthereumChain",
  "wallet_addEthereumChain",
  "wallet_getPermissions",
  "wallet_requestPermissions",
  "wallet_registerOnboarding",
  "wallet_watchAsset",
  "wallet_scanQRCode",
  "wallet_sendCalls",
  "wallet_getCapabilities",
  "wallet_getCallsStatus",
  "wallet_showCallsStatus",
] as const;

export const OPTIONAL_EVM_EVENTS = [
  "chainChanged",
  "accountsChanged",
  "message",
  "disconnect",
  "connect",
] as const;

export function getAppMetadata(): {
  name: string;
  description: string;
  url: string;
  icons: string[];
} {
  const url =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

  return {
    name: "WalletConnect Phase 1",
    description: "Production WalletConnect v2 integration",
    url,
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };
}

export function getEthereumProviderInitConfig(): EthereumProviderInitOptions {
  const projectId = getWalletConnectProjectId();

  return {
    projectId,
    showQrModal: true as const,
    optionalChains: OPTIONAL_EVM_CHAIN_IDS,
    optionalMethods: [...OPTIONAL_EVM_METHODS],
    optionalEvents: [...OPTIONAL_EVM_EVENTS],
    metadata: getAppMetadata(),
    qrModalOptions: {
      themeMode: "dark" as const,
      enableExplorer: true,
    },
  };
}
