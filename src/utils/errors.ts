import type { WalletAppError, WalletErrorCode } from "../types/wallet";

interface ErrorLike {
  readonly code?: unknown;
  readonly message?: unknown;
}

function asErrorLike(error: unknown): ErrorLike {
  if (typeof error === "object" && error !== null) {
    return error as ErrorLike;
  }

  return { message: String(error) };
}

function readMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const like = asErrorLike(error);
  if (typeof like.message === "string" && like.message.length > 0) {
    return like.message;
  }

  return "An unexpected wallet error occurred.";
}

function readCode(error: unknown): number | string | undefined {
  const like = asErrorLike(error);
  if (typeof like.code === "number" || typeof like.code === "string") {
    return like.code;
  }

  return undefined;
}

export function mapWalletError(error: unknown): WalletAppError {
  const message = readMessage(error);
  const code = readCode(error);
  const lower = message.toLowerCase();

  const resolvedCode = resolveErrorCode(code, lower);
  return {
    code: resolvedCode,
    message: userFacingMessage(resolvedCode, message),
    cause: error,
  };
}

function resolveErrorCode(
  code: number | string | undefined,
  lowerMessage: string,
): WalletErrorCode {
  if (code === 4001 || code === 5000 || code === "USER_REJECTED") {
    return "USER_REJECTED";
  }

  if (
    /user rejected|rejected the request|denied|cancelled|canceled|user closed/i.test(
      lowerMessage,
    )
  ) {
    return "USER_REJECTED";
  }

  if (
    /wallet not found|wallet not installed|no provider|provider not found/i.test(
      lowerMessage,
    )
  ) {
    return "WALLET_NOT_INSTALLED";
  }

  if (
    /session expired|proposal expired|expired session|no matching key|session topic doesn/i.test(
      lowerMessage,
    )
  ) {
    return "SESSION_EXPIRED";
  }

  if (
    /invalid session|session is disconnected|missing or invalid|session not found/i.test(
      lowerMessage,
    )
  ) {
    return "INVALID_SESSION";
  }

  if (
    /failed to fetch|network error|net::err|timeout|offline/i.test(lowerMessage)
  ) {
    return "NETWORK_ERROR";
  }

  if (/project id|projectId/i.test(lowerMessage)) {
    return "MISSING_PROJECT_ID";
  }

  if (/provider/i.test(lowerMessage)) {
    return "PROVIDER_ERROR";
  }

  return "UNKNOWN";
}

function userFacingMessage(code: WalletErrorCode, original: string): string {
  switch (code) {
    case "USER_REJECTED":
      return "Connection request was rejected in the wallet.";
    case "WALLET_NOT_INSTALLED":
      return "No compatible wallet was found. Scan the QR code or install a WalletConnect wallet.";
    case "SESSION_EXPIRED":
      return "The WalletConnect session expired. Please connect again.";
    case "INVALID_SESSION":
      return "The stored WalletConnect session is invalid. Please connect again.";
    case "NETWORK_ERROR":
      return "A network error interrupted WalletConnect. Check your connection and retry.";
    case "PROVIDER_ERROR":
      return "The WalletConnect provider reported an error. Please try again.";
    case "MISSING_PROJECT_ID":
      return "Missing VITE_PROJECT_ID. Add your WalletConnect Cloud project ID to .env.";
    case "UNKNOWN":
      return original;
  }
}

export function missingProjectIdError(): WalletAppError {
  return {
    code: "MISSING_PROJECT_ID",
    message: userFacingMessage("MISSING_PROJECT_ID", ""),
  };
}
