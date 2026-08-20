/**
 * Runtime environment. WalletConnect Cloud / Reown Dashboard project ID
 * is never hardcoded.
 */
export function getWalletConnectProjectId(): string {
  const projectId = import.meta.env.VITE_PROJECT_ID?.trim() ?? "";
  return projectId;
}

export function hasWalletConnectProjectId(): boolean {
  return getWalletConnectProjectId().length > 0;
}
