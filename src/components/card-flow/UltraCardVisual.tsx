interface UltraCardVisualProps {
  readonly holderName?: string;
}

export function UltraCardVisual({ holderName = "YOUR NAME" }: UltraCardVisualProps) {
  return (
    <div className="relative mx-auto h-[188px] w-[300px]">
      <div className="absolute top-3 right-4 h-[168px] w-[270px] rotate-[8deg] rounded-2xl bg-[#1d4ed8]" />
      <div className="absolute top-5 right-0 h-[168px] w-[270px] rotate-[14deg] rounded-2xl bg-[#111827]" />
      <div className="relative z-10 flex h-[188px] w-[300px] flex-col justify-between rounded-2xl bg-[#0b0b0f] p-5 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold">
              T
            </span>
            <span className="text-sm font-bold tracking-[0.18em] text-[#3b82f6]">TRUST</span>
          </div>
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/90">
            ULTRA
          </span>
        </div>

        <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700" />

        <p className="font-mono text-[15px] tracking-[0.14em]">4837 9021 7744 2918</p>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] tracking-widest text-white/50">CARDHOLDER</p>
            <p className="text-[11px] font-medium uppercase tracking-wide">{holderName}</p>
          </div>
          <div>
            <p className="text-[8px] tracking-widest text-white/50">EXPIRES</p>
            <p className="text-[11px] font-medium">12 / 29</p>
          </div>
          <div className="relative h-7 w-11">
            <span className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-[#eb001b]" />
            <span className="absolute right-0 top-0.5 h-6 w-6 rounded-full bg-[#f79e1b]/90" />
          </div>
        </div>
      </div>
    </div>
  );
}
