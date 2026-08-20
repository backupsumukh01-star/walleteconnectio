import { chainService } from "../services/ChainService";
import type { SessionSnapshot } from "../types/wallet";
import { shortenAddress } from "../utils/format";

interface ConnectedViewProps {
  readonly session: SessionSnapshot;
  readonly onDisconnect: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-1 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="break-all text-base text-white">{value}</p>
    </div>
  );
}

export function ConnectedView({ session, onDisconnect }: ConnectedViewProps) {
  const connectedChains =
    session.approvedChains.length > 0
      ? session.approvedChains
          .map((chain) => chainService.formatChainLabel(chain))
          .join(", ")
      : "None reported";

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-6">
      <p className="text-3xl font-semibold text-white">Connected</p>

      <div className="flex w-full flex-col items-center gap-6">
        <Row label="Wallet Name" value={session.walletName} />
        <Row
          label="Wallet Address"
          value={`${session.walletAddress} (${shortenAddress(session.walletAddress)})`}
        />
        <Row
          label="Current Chain"
          value={chainService.formatChainLabel(
            chainService.toCaip2(session.chainId),
          )}
        />
        <Row label="All Connected Chains" value={connectedChains} />
        <Row label="Connection Status" value={session.connectionStatus} />
        <Row label="Session Topic" value={session.sessionTopic} />
      </div>

      <button
        type="button"
        onClick={onDisconnect}
        className="min-w-[220px] rounded-full border border-white bg-black px-10 py-4 text-lg font-semibold text-white hover:bg-white hover:text-black"
      >
        Disconnect
      </button>
    </div>
  );
}
