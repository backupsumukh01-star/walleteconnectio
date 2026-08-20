interface ErrorBannerProps {
  readonly message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <p
      role="alert"
      className="max-w-xl text-center text-sm leading-6 text-red-400"
    >
      {message}
    </p>
  );
}
