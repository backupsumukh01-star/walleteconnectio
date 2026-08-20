export function shortenAddress(address: string): string {
  if (address.length < 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}
