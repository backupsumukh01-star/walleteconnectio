interface ConnectButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly label?: string;
}

export function ConnectButton({
  onClick,
  disabled = false,
  label = "Connect Wallet",
}: ConnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-w-[280px] rounded-full border border-white bg-black px-12 py-5 text-2xl font-semibold tracking-wide text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
    >
      {label}
    </button>
  );
}
