import { ConnectButton } from "../components/ConnectButton";
import { ConnectedView } from "../components/ConnectedView";
import { ErrorBanner } from "../components/ErrorBanner";
import { useWallet } from "../hooks/useWallet";

export function HomePage() {
  const { session, error, isConnecting, isInitialized, connect, disconnect } =
    useWallet();
  const connectDisabled =
    !isInitialized || isConnecting || error?.code === "MISSING_PROJECT_ID";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-4">
      <div className="flex flex-col items-center justify-center gap-6">
        {session ? (
          <ConnectedView session={session} onDisconnect={() => void disconnect()} />
        ) : (
          <ConnectButton
            onClick={() => void connect()}
            disabled={connectDisabled}
            label={isConnecting ? "Connecting..." : "Connect Wallet"}
          />
        )}

        {error ? <ErrorBanner message={error.message} /> : null}
      </div>
    </main>
  );
}
