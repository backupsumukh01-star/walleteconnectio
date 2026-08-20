import { CONNECTION_OPTIONS } from "../config/chains";
import { ConnectButton } from "../components/ConnectButton";
import { ConnectedView } from "../components/ConnectedView";
import { ErrorBanner } from "../components/ErrorBanner";
import { useWallet } from "../hooks/useWallet";

export function HomePage() {
  const {
    session,
    error,
    isConnecting,
    connectingStandard,
    isInitialized,
    connect,
    disconnect,
  } = useWallet();
  const connectDisabled = !isInitialized || error?.code === "MISSING_PROJECT_ID";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-4">
      <div className="flex flex-col items-center justify-center gap-6">
        {session ? (
          <ConnectedView session={session} onDisconnect={() => void disconnect()} />
        ) : (
          <div className="flex flex-col items-center gap-4">
            {CONNECTION_OPTIONS.map((option) => (
              <ConnectButton
                key={option.standard}
                onClick={() => void connect(option.standard)}
                disabled={connectDisabled || isConnecting}
                label={
                  isConnecting && connectingStandard === option.standard
                    ? "Connecting..."
                    : option.label
                }
              />
            ))}
          </div>
        )}

        {error ? <ErrorBanner message={error.message} /> : null}
      </div>
    </main>
  );
}
