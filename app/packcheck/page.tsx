import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, Stat, Verdict } from "@/components/ui";
import { counts, proofs } from "@/lib/demo";

export default function PackCheckPage() {
  return (
    <>
      <PageHeader
        kicker="PackCheck · prepress QA"
        title={
          <>
            Nothing goes to print <span className="italic text-ember">unchecked.</span>
          </>
        }
        sub="Two gates: our artwork before it leaves, and the printer's proof before we approve the run. Two gates is the whole point — printers fix things."
        actions={
          <>
            <button className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
              Upload proof
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:bg-ember/15">
              <Icon name="plus" className="h-3 w-3" /> New SKU
            </button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Waiting on us" value="2" delta="oldest 22h" good={false} />
        <Stat label="Blockers open" value="3" delta="1 reprint risk" good={false} />
        <Stat label="Checks this month" value="18" delta="14 passed clean" />
        <Stat label="Median review" value="74s" delta="upload → report" />
      </div>

      <div className="mt-4 space-y-3">
        {proofs.map((p) => {
          const c = counts(p);
          return (
            <Link
              key={p.id}
              href={`/packcheck/${p.id}`}
              className="group card flex flex-wrap items-center gap-4 p-4 transition-colors hover:border-line-strong"
            >
              <span
                className={`h-12 w-1 shrink-0 rounded-full ${
                  p.verdict === "HOLD"
                    ? "bg-alert"
                    : p.verdict === "PASS WITH NOTES"
                      ? "bg-warn"
                      : "bg-ok"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-medium text-ink">{p.product}</p>
                  <span className="chip">{p.sku}</span>
                  <Verdict verdict={p.verdict} />
                </div>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
                  {p.vendor} · {p.contact} · proof {p.proofVersion} · locked spec {p.specVersion} ·{" "}
                  {p.received}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px]">
                  <span className={c.b > 0 ? "text-alert" : "text-soft"}>{c.b} blockers</span>
                  <span className={c.w > 0 ? "text-warn" : "text-soft"}>{c.w} warnings</span>
                  <span className="text-info">{c.n} notes</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                    {p.file}
                  </p>
                  <p className="font-mono text-[9px] text-soft">
                    {p.bytes} · {p.pages} pages
                  </p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-line text-soft transition-colors group-hover:border-ember/40 group-hover:text-ember">
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="card mt-4 p-5">
        <p className="kicker mb-3">How a check runs</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Ingest", "Proof PDF or AI file. Text layer first, OCR only where it has to. Barcodes decoded, never eyeballed."],
            ["02", "Compare", "Against the locked spec and the last approved version. Every finding carries the crop it came from."],
            ["03", "Decide", "Verdict, annotated PDF, printer email drafted. A human approves and the receipt is written."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="font-mono text-[10px] text-ember">{n}</p>
              <p className="mt-1 text-[13px] text-ink">{t}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
