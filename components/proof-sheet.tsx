import type { Finding, Proof, Sheet } from "@/lib/demo";

const labelCopy: Record<
  string,
  {
    brand: string;
    sub: string;
    variant: string;
    weight: string;
    upc: string;
    claim?: string;
    backTitle: string;
  }
> = {
  "bak-md-250": {
    brand: "Born Again",
    sub: "Botanicals",
    variant: "Maeng Da",
    weight: "NET WT 8.4 oz (238 g)",
    upc: "8 101234 567890",
    claim: "Clinically proven",
    backTitle: "Supplement facts",
  },
  "hge-16-cit": {
    brand: "Hella Good",
    sub: "Energy",
    variant: "Citrus",
    weight: "16 FL OZ (473 mL)",
    upc: "8 101234 567810",
    backTitle: "Nutrition facts",
  },
};

function Anno({ f, n }: { f: Finding; n: number }) {
  const cls =
    f.severity === "blocker" ? "anno-blocker" : f.severity === "warning" ? "anno-warning" : "anno-note";
  return (
    <div
      className={`anno ${cls} transition-all duration-200 hover:brightness-125`}
      style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
      title={`${n}. ${f.title}`}
    >
      <span className="pin">{n}</span>
    </div>
  );
}

export function ProofSheet({
  proof,
  side,
  numberFor,
}: {
  proof: Proof;
  side: Sheet;
  numberFor: (id: string) => number;
}) {
  const copy = labelCopy[proof.id] ?? labelCopy["bak-md-250"];
  const findings = proof.findings.filter((f) => f.sheet === side);

  return (
    <figure className="min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-line bg-[#e7ded0] text-[#1c1712] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
        {/* registration marks */}
        <span className="absolute left-2 top-2 h-2 w-2 border-l border-t border-[#1c1712]/25" />
        <span className="absolute right-2 top-2 h-2 w-2 border-r border-t border-[#1c1712]/25" />
        <span className="absolute bottom-2 left-2 h-2 w-2 border-b border-l border-[#1c1712]/25" />
        <span className="absolute bottom-2 right-2 h-2 w-2 border-b border-r border-[#1c1712]/25" />
        <span className="pointer-events-none absolute inset-[4%] rounded-[2px] border border-dashed border-[#1c1712]/20" />

        <div className="absolute inset-0 flex flex-col p-[9%]">
          {side === "front" ? (
            <>
              <div className="text-center">
                <p className="font-display text-[clamp(14px,2.4vw,26px)] uppercase leading-none tracking-[0.06em]">
                  {copy.brand}
                </p>
                <p className="mt-1 font-mono text-[6px] uppercase tracking-[0.42em] text-[#1c1712]/60">
                  {copy.sub}
                </p>
              </div>

              <div className="mt-[16%] text-center">
                <p className="font-display text-[clamp(18px,3.4vw,38px)] uppercase leading-[0.95]">
                  {copy.variant}
                </p>
                {copy.claim && (
                  <p className="mx-auto mt-2 inline-block border border-[#1c1712]/40 px-2 py-[3px] font-mono text-[6.5px] uppercase tracking-[0.18em]">
                    {copy.claim}
                  </p>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2.5 h-[3px] w-14 bg-[#c0562f]" />
                    <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-[#1c1712]/75">
                      {copy.weight}
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="barcode h-9 w-24 shrink-0" />
                      <p className="font-mono text-[6px] leading-tight text-[#1c1712]/80">
                        {copy.upc}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex gap-[3px]">
                      <span className="h-4 w-4 bg-[#c0562f]" />
                      <span className="h-4 w-4 bg-[#2f4a3a]" />
                      <span className="h-4 w-4 bg-[#d9c9a8]" />
                    </div>
                    <p className="mt-1 font-mono text-[5.5px] uppercase tracking-[0.1em] text-[#1c1712]/60">
                      485 U
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-mono text-[7px] uppercase tracking-[0.24em] text-[#1c1712]/60">
                {copy.backTitle}
              </p>
              <div className="mt-2 border-t-4 border-[#1c1712] pt-1.5">
                {[
                  ["Serving size", "1 tsp (2.5 g)"],
                  ["Servings", "100"],
                  ["Calories", "0"],
                  ["Total fat", "0 g"],
                  ["Sodium", "0 mg"],
                  ["Total carbohydrate", "1 g"],
                ].map(([a, b]) => (
                  <div
                    key={a}
                    className="flex justify-between border-b border-[#1c1712]/25 py-[3px] text-[6.5px]"
                  >
                    <span>{a}</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 font-mono text-[6px] leading-relaxed text-[#1c1712]/70">
                Suggested use: take one level teaspoon as needed. Do not exceed two servings in 24
                hours.
              </p>

              <div className="absolute right-[8%] top-[42%] grid h-[13%] w-[26%] place-items-center rounded-sm border border-[#1c1712]/15 bg-[#1c1712]/[0.04]">
                <svg viewBox="0 0 40 40" className="h-8 w-8 text-[#1c1712]/30" aria-hidden="true">
                  <path
                    d="M31 9C19 10 11 17 10 30c12 1 20-6 21-21Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path d="M12 29 27 14" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>

              <div className="mt-2 min-h-[64px] flex-1 rounded-sm border border-dashed border-[#c0562f]/50" />

              <div className="mt-auto border-t border-[#1c1712]/25 pt-1.5">
                <p className="font-mono text-[5.5px] leading-relaxed text-[#1c1712]/70">
                  Distributed by Born Again LLC · 1200 Industrial Way · Austin, TX
                </p>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[5.5px] text-[#1c1712]/70">
                  <span>LOT MD-2611-A</span>
                  <span>BEST BY 03 / 2028</span>
                </div>
              </div>
            </>
          )}
        </div>

        {findings.map((f) => (
          <Anno key={f.id} f={f} n={numberFor(f.id)} />
        ))}
      </div>

      <figcaption className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
        <span>{side} panel · page {side === "front" ? 1 : 2}</span>
        <span>{findings.length} flags</span>
      </figcaption>
    </figure>
  );
}
