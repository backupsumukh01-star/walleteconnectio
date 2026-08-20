import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { TRON_MAINNET } from "./chains";
import { getWalletConnectProjectId } from "./env";
import type { TokenStandard } from "../types/wallet";

type EthereumProviderInitOptions = Parameters<typeof EthereumProvider.init>[0];

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
    name: "WalletConnect Phase 1",
    description: "ERC20, BEP20, and TRC20 WalletConnect",
    url,
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };
}

export function evmChainIdForStandard(standard: Exclude<TokenStandard, "TRC20">): 1 | 56 {
  return standard === "BEP20" ? 56 : 1;
}

export function getEthereumProviderInitConfig(
  chainIds: [number, ...number[]],
): EthereumProviderInitOptions {
  return {
    projectId: getWalletConnectProjectId(),
    showQrModal: true as const,
    optionalChains: chainIds,
    optionalMethods: [...OPTIONAL_EVM_METHODS],
    optionalEvents: [...OPTIONAL_EVM_EVENTS],
    metadata: getAppMetadata(),
    qrModalOptions: {
      themeMode: "dark" as const,
      enableExplorer: true,
    },
  };
}

export function getTronOptionalNamespaces() {
  return {
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
