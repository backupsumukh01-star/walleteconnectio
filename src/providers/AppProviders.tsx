import type { ReactNode } from "react";
import { WalletProvider } from "../context/WalletContext";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <WalletProvider>{children}</WalletProvider>;
}
