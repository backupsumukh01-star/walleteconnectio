interface LandingPageProps {
  readonly onApply: () => void;
  readonly isApplying: boolean;
  readonly disabled: boolean;
  readonly isConnected: boolean;
  readonly onDisconnect: () => void;
}

const FEATURES = [
  {
    title: "Instant approval",
    body: "Connect your wallet and get approved in seconds. No credit checks, no paperwork, no waiting.",
  },
  {
    title: "Crypto cashback",
    body: "Earn up to 5% back in BTC, ETH, or stablecoins on every purchase. Stack sats while you spend.",
  },
  {
    title: "Global acceptance",
    body: "Spend at 80 million+ merchants worldwide — anywhere Visa and Mastercard are accepted.",
  },
  {
    title: "Bank-grade security",
    body: "256-bit encryption, biometric authentication, and real-time fraud monitoring on every transaction.",
  },
  {
    title: "Apple & Google Pay",
    body: "Add to your digital wallet instantly. Tap to pay from your phone, watch, or any contactless device.",
  },
  {
    title: "Premium Ultra design",
    body: "Hold $100K+ in your connected wallet to unlock the Ultra tier — machined steel, laser-etched finish.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect Trust Wallet",
    body: "Scan the QR code with your Trust Wallet app. We verify your eligibility on-chain — no personal data required.",
  },
  {
    n: "02",
    title: "Choose your tier",
    body: "Based on your connected balance, unlock Premium, Exclusive, or Ultra. Higher tiers earn higher cashback and unlock perks.",
  },
  {
    n: "03",
    title: "Tap, swipe, earn",
    body: "Your virtual card is live in minutes. Physical card ships in 3–5 business days. Rewards hit your wallet instantly on every swipe.",
  },
];

const TIERS = [
  {
    name: "Premium",
    rate: "Up to 2% back",
    items: ["No annual fee", "Virtual + physical card", "Apple & Google Pay", "Standard support"],
  },
  {
    name: "Exclusive",
    rate: "Up to 3% back",
    items: [
      "No annual fee",
      "Airport lounge access",
      "2× rewards on dining & travel",
      "Priority support",
    ],
  },
  {
    name: "Ultra",
    rate: "Up to 5% back",
    items: [
      "Machined steel card",
      "Unlimited lounge access",
      "2× rewards everywhere",
      "Concierge 24/7",
    ],
  },
];

const FAQS = [
  {
    q: "Do I need to pass a credit check?",
    a: "No. TrustCard is a prepaid product secured by your connected on-chain balance. No credit check, no impact to your score.",
  },
  {
    q: "Which wallet do I need?",
    a: "TrustCard is built exclusively for Trust Wallet. Download Trust Wallet on iOS or Android, then scan the QR code to link your card.",
  },
  {
    q: "How are rewards paid out?",
    a: "Rewards settle on-chain to your connected wallet address in the asset of your choice — BTC, ETH, USDT, or USDC — within 24 hours of each transaction.",
  },
  {
    q: "Is there an annual fee?",
    a: "No annual fee on any tier. Ultra tier requires a minimum connected balance; Premium and Exclusive have no balance requirement.",
  },
  {
    q: "How is my wallet kept secure?",
    a: "TrustCard never takes custody of your assets and never holds your private keys. All operations are signed by your wallet and verified on-chain.",
  },
];

export function LandingPage({
  onApply,
  isApplying,
  disabled,
  isConnected,
  onDisconnect,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">
              T
            </span>
            <span className="text-lg font-bold tracking-[0.2em] text-[#2563eb]">TRUST</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <a href="#features">Features</a>
            <a href="#rewards">Rewards</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#how" className="hidden text-sm text-neutral-600 md:inline">
              Learn more
            </a>
            {isConnected ? (
              <button
                type="button"
                onClick={onDisconnect}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={onApply}
                disabled={disabled}
                className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isApplying ? "Connecting..." : "Apply now"}
              </button>
            )}
          </div>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-neutral-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Now available worldwide
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Spend crypto <span className="text-[#2563eb]">like cash.</span> Earn every swipe.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-500 md:text-lg">
            The first premium Ultra card that connects directly to your Trust Wallet. Zero annual
            fees. Instant approval. Crypto rewards on every purchase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onApply}
              disabled={disabled || isConnected}
              className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isApplying ? "Connecting..." : "Apply now — It's free →"}
            </button>
            <a
              href="#how"
              className="rounded-full border border-[#2563eb] px-6 py-3 text-sm font-semibold text-[#2563eb]"
            >
              How it works
            </a>
          </div>
        </div>
        <HeroCards />
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 md:grid-cols-3">
        <Stat value="$650M+" label="Assets connected" />
        <Stat value="80K+" label="Active cardholders" />
        <Stat value="24/7" label="Human support" />
      </section>

      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-medium text-[#2563eb]">Features</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-500">
            Built for the modern crypto user. Every feature is designed to make spending, earning,
            and protecting your assets effortless.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-3xl bg-[#f7f9fc] p-6">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-medium text-[#2563eb]">How it works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">From wallet to card in three steps.</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#2563eb]">{step.n}</p>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="rewards" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-medium text-[#2563eb]">Rewards</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">
            Turn everyday purchases into portfolio growth.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-3xl p-6 ${tier.name === "Ultra" ? "bg-[#2563eb] text-white" : "bg-[#f7f9fc]"}`}
              >
                <p className="text-sm opacity-80">{tier.name}</p>
                <h3 className="mt-2 text-2xl font-bold">{tier.rate}</h3>
                <ul className="mt-6 space-y-2 text-sm">
                  {tier.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold md:text-5xl">Built to banking standards.</h2>
          <p className="mt-4 max-w-2xl text-neutral-500">
            TrustCard is issued under strict regulatory oversight. Your funds are protected,
            segregated, and independently audited.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              "FCA Authorised EMI",
              "DNB Licensed EMI",
              "SFC Licensed SVF",
              "FINTRAC MSB",
              "PCI DSS Level 1",
              "SOC 2 Type II",
              "ISO 27001",
              "GDPR Compliant",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-sm font-medium shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl font-bold md:text-5xl">Frequently asked.</h2>
          <p className="mt-3 text-neutral-500">Still have questions? Our support team is online 24/7.</p>
          <div className="mt-10 space-y-4">
            {FAQS.map((item) => (
              <details key={item.q} className="rounded-2xl bg-[#f7f9fc] p-5">
                <summary className="cursor-pointer font-semibold">{item.q}</summary>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-[#2563eb] px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold md:text-5xl">Ready to transform how you spend crypto?</h2>
          <p className="mt-4 text-white/80">Join 500,000+ cardholders who trust TrustCard every day.</p>
          <button
            type="button"
            onClick={onApply}
            disabled={disabled || isConnected}
            className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] disabled:opacity-50"
          >
            {isApplying ? "Connecting..." : "Apply now"}
          </button>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-10 text-sm text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 md:flex-row md:justify-between">
          <p>The future of crypto payments — secure, rewarding, and yours.</p>
          <p>support@trustcard.app</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function HeroCards() {
  return (
    <div className="relative mx-auto h-[280px] w-[340px]">
      <div className="absolute right-0 top-8 h-[190px] w-[300px] rotate-[18deg] rounded-2xl bg-[#2563eb]" />
      <div className="absolute right-6 top-4 h-[190px] w-[300px] rotate-[10deg] rounded-2xl bg-[#111827]" />
      <div className="relative z-10 flex h-[210px] w-[330px] flex-col justify-between rounded-2xl bg-[#0b0b0f] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <span className="text-sm font-bold tracking-[0.18em] text-[#3b82f6]">TRUST</span>
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px]">ULTRA</span>
        </div>
        <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700" />
        <p className="font-mono tracking-[0.12em]">4837 9021 7744 2918</p>
        <div className="flex justify-between text-[11px]">
          <span>A. RAMIREZ</span>
          <span>12 / 29</span>
        </div>
      </div>
    </div>
  );
}
