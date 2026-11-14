import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, Stat } from "@/components/ui";
import { threads } from "@/lib/demo";

const kindTone: Record<string, string> = {
  Vendor: "text-info",
  Customer: "text-ember",
  Legal: "text-warn",
  Opportunity: "text-ok",
};

const stateTone: Record<string, string> = {
  "Needs reply": "border-alert/35 bg-alert/10 text-alert",
  "Draft ready": "border-ember/35 bg-ember/10 text-ember",
  Waiting: "border-line bg-panel text-soft",
  Filed: "border-ok/30 bg-ok/10 text-ok",
};

export default function InboxPage() {
  return (
    <>
      <PageHeader
        kicker="Inbox · 6 open threads"
        title={
          <>
            The threads that <span className="italic text-ember">actually move money.</span>
          </>
        }
        sub="Not every email — the ones tied to a vendor, a customer issue, a legal clock, or an open order. Summarized with the ask pulled out, drafts grounded in policy."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
            <Icon name="inbox" className="h-3 w-3" /> Connect inbox
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Needing you" value="4" delta="2 drafts ready" good={false} />
        <Stat label="Median reply" value="4h 10m" delta="target 4h" good={false} />
        <Stat label="Auto-filed this week" value="38" delta="no human touch" />
        <Stat label="SLA breaches" value="1" delta="customer · 2 days" good={false} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {threads.map((t) => (
            <article key={t.id} className="card p-4 transition-colors hover:border-line-strong">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-[9px] uppercase tracking-[0.12em] ${kindTone[t.kind]}`}>
                  {t.kind}
                </span>
                <span className="h-2.5 w-px bg-line" />
                <span className="text-[12px] text-ink">{t.from}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                  {t.org}
                </span>
                <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                  {t.age}
                </span>
                <span
                  className={`rounded-full border px-2 py-[1px] font-mono text-[9px] uppercase tracking-[0.1em] ${stateTone[t.state]}`}
                >
                  {t.state}
                </span>
              </div>

              <h3 className="mt-2 text-[13.5px] font-medium text-ink">{t.subject}</h3>
              <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-muted">{t.summary}</p>

              <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-lg border border-line/60 bg-bg-soft/40 px-3 py-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-soft">the ask</span>
                <span className="text-[11.5px] text-ink">{t.ask}</span>
                <span className="ml-auto flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ember">
                  Open thread <Icon name="arrow" className="h-3 w-3" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="How it triages" />
            <div className="space-y-2.5">
              {[
                ["Customer issue", "Policy-grounded draft, replacement or refund path, SLA clock."],
                ["Vendor", "Extracts commitments, dates, and quantities. Feeds PackCheck."],
                ["Legal", "Never drafts. Flags the deadline and the missing documents."],
                ["Opportunity", "Pulls the last order and stock, drafts a quote."],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink">{k}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="Policy it answers from" />
            <div className="space-y-2">
              {[
                ["Refund window", "30 days", true],
                ["Mis-ship", "replace + label", true],
                ["Opened product", "case by case", true],
                ["Chargeback response", "48h", true],
                ["Shipping promise", "3–5 days", false],
              ].map(([k, v, ok]) => (
                <div key={String(k)} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">{k}</span>
                  <span
                    className={`font-mono text-[10px] ${ok ? "text-ink" : "text-warn"}`}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-soft">
              The last one is stale — the site promises 3–5 days but carrier data says 5–7. Fix the
              promise before the next ad push.
            </p>
          </section>

          <section className="card border-alert/25 p-4">
            <div className="flex items-center gap-2">
              <span className="text-alert">
                <Icon name="clock" className="h-4 w-4" />
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-alert">
                SLA
              </p>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              Dana Whitfield has written three times in 5 hours. The policy covers an opened product
              on a mis-ship — the draft says so. Send it.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
