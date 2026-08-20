import { BNB_CHAIN, ETHEREUM_CHAIN, TRON_MAINNET } from "./chains";
import { getWalletConnectProjectId } from "./env";

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

export const TRON_METHODS = ["tron_signTransaction", "tron_signMessage"] as const;

export function getAppMetadata(): {
  name: string;
  description: string;
  url: string;
  icons: string[];
} {
  const url =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

  return {
    name: "TrustCard",
    description: "TrustCard Ultra wallet connection",
    url,
    icons: [`${url}/assets/svg/logo-trust.svg`],
  };
}

/**
 * One WalletConnect session proposal for all three networks.
 * Namespaces are optional so a wallet can approve the chains it supports.
 */
export function getMultiNetworkNamespaces() {
  const projectId = getWalletConnectProjectId();

  return {
    eip155: {
      chains: [ETHEREUM_CHAIN.caip2, BNB_CHAIN.caip2],
      methods: [...OPTIONAL_EVM_METHODS],
      events: [...OPTIONAL_EVM_EVENTS],
      rpcMap: {
        [ETHEREUM_CHAIN.chainId]: `https://rpc.walletconnect.com/v1?chainId=${ETHEREUM_CHAIN.caip2}&projectId=${projectId}`,
        [BNB_CHAIN.chainId]: `https://rpc.walletconnect.com/v1?chainId=${BNB_CHAIN.caip2}&projectId=${projectId}`,
      },
    },
    tron: {
      chains: [TRON_MAINNET.caip2],
      methods: [...TRON_METHODS],
      events: [] as string[],
      rpcMap: {
        [TRON_MAINNET.chainIdHex]: TRON_MAINNET.rpcUrl,
      },
    },
  };
}
