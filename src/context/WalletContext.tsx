import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { walletConnectService } from "../services/WalletConnectService";
import type {
  ConnectionStatus,
  SessionSnapshot,
  WalletAppError,
} from "../types/wallet";
import { mapWalletError } from "../utils/errors";

interface WalletContextValue {
  readonly status: ConnectionStatus;
  readonly session: SessionSnapshot | null;
  readonly error: WalletAppError | null;
  readonly isInitialized: boolean;
  readonly isConnecting: boolean;
  readonly connect: () => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly clearError: () => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

interface WalletProviderProps {
  readonly children: ReactNode;
}

function isWalletAppError(value: unknown): value is WalletAppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as WalletAppError).message === "string"
  );
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [error, setError] = useState<WalletAppError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribeSession = walletConnectService.onSessionChange((next) => {
      setSession(next);
      setStatus(next ? "connected" : "disconnected");
    });

    const unsubscribeError = walletConnectService.onError((message) => {
      if (!message) {
        setError(null);
        return;
      }

      setError({
        code: "UNKNOWN",
        message,
      });
    });

    let cancelled = false;

    const restore = async (): Promise<void> => {
      setStatus("restoring");
      try {
        const restored = await walletConnectService.restoreSession();
        if (cancelled) {
          return;
        }

        setSession(restored);
        setStatus(restored ? "connected" : "disconnected");
        setError(null);
      } catch (restoreError) {
        if (cancelled) {
          return;
        }

        const mapped = isWalletAppError(restoreError)
          ? restoreError
          : mapWalletError(restoreError);
        setError(mapped);
        setStatus(mapped.code === "MISSING_PROJECT_ID" ? "error" : "disconnected");
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    };

    void restore();

    return () => {
      cancelled = true;
      unsubscribeSession();
      unsubscribeError();
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setStatus("connecting");
    setError(null);

    try {
      const next = await walletConnectService.connect();
      setSession(next);
      setStatus("connected");
    } catch (connectError) {
      const mapped = isWalletAppError(connectError)
        ? connectError
        : mapWalletError(connectError);
      setError(mapped);
      setStatus("disconnected");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);
    await walletConnectService.disconnect();
    setSession(null);
    setStatus("disconnected");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      session,
      error,
      isInitialized,
      isConnecting,
      connect,
      disconnect,
      clearError,
    }),
    [
      status,
      session,
      error,
      isInitialized,
      isConnecting,
      connect,
      disconnect,
      clearError,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
