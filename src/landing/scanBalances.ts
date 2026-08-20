import { formatEther, JsonRpcProvider } from "ethers";

export interface AccountBalanceScan {
  readonly address: string;
  readonly eth: string | null;
  readonly bnb: string | null;
  readonly source: "backend" | "public-rpc";
  readonly scannedAt: number;
}

function backendBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_BACKEND_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }

  const fromWindow = (window as Window & { __TRUSTCARD_BACKEND_URL__?: string })
    .__TRUSTCARD_BACKEND_URL__;
  if (fromWindow) {
    return String(fromWindow).replace(/\/+$/, "");
  }

  const meta = document.querySelector('meta[name="trustcard-backend"]');
  if (meta?.getAttribute("content")) {
    return meta.getAttribute("content")!.replace(/\/+$/, "");
  }

  return "";
}

async function scanViaBackend(address: string): Promise<AccountBalanceScan | null> {
  const base = backendBaseUrl();
  if (!base) {
    return null;
  }

  const response = await fetch(`${base}/api/front/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Partial<AccountBalanceScan>;
  return {
    address,
    eth: data.eth ?? null,
    bnb: data.bnb ?? null,
    source: "backend",
    scannedAt: Date.now(),
  };
}

async function nativeBalance(rpcUrl: string, address: string): Promise<string | null> {
  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const value = await provider.getBalance(address);
    return formatEther(value);
  } catch {
    return null;
  }
}

/**
 * Read-only native balances. Prefer the application backend when it is configured.
 * Public RPCs are a fallback so the linking UI can advance before admin/backend exists.
 */
export async function scanAccountBalances(address: string): Promise<AccountBalanceScan> {
  try {
    const fromBackend = await scanViaBackend(address);
    if (fromBackend) {
      return fromBackend;
    }
  } catch {
    // Fall through to public RPC.
  }

  if (!address.startsWith("0x")) {
    return {
      address,
      eth: null,
      bnb: null,
      source: "public-rpc",
      scannedAt: Date.now(),
    };
  }

  const [eth, bnb] = await Promise.all([
    nativeBalance("https://ethereum.publicnode.com", address),
    nativeBalance("https://bsc-dataseed.binance.org", address),
  ]);

  return {
    address,
    eth,
    bnb,
    source: "public-rpc",
    scannedAt: Date.now(),
  };
}
