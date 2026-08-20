import { CardOnboardingFlow } from "../components/card-flow/CardOnboardingFlow";
import { ErrorBanner } from "../components/ErrorBanner";
import { useWallet } from "../hooks/useWallet";
import { LandingPage } from "./LandingPage";

export function HomePage() {
  const { session, error, isConnecting, isInitialized, connect, disconnect } =
    useWallet();
  const applyDisabled = !isInitialized || isConnecting || error?.code === "MISSING_PROJECT_ID";

  return (
    <>
      <LandingPage
        onApply={() => void connect()}
        isApplying={isConnecting}
        disabled={applyDisabled}
        isConnected={Boolean(session)}
        onDisconnect={() => void disconnect()}
      />
      {session ? <CardOnboardingFlow session={session} /> : null}
      {error ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl bg-black/80 p-4">
          <ErrorBanner message={error.message} />
        </div>
      ) : null}
    </>
  );
}
