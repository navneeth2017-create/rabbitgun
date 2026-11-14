import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, Stat } from "@/components/ui";

type Entry = {
  at: string;
  who: string;
  action: "approved" | "held" | "downloaded" | "superseded" | "restricted";
  object: string;
  context: string;
  hash: string;
  note?: string;
};

const entries: Entry[] = [
  {
    at: "Today · 09:12",
    who: "Tom",
    action: "held",
    object: "BAK-MD-250 · proof v2",
    context: "spec v3 · Sunrise Packaging",
    hash: "9f2c41d8…a41",
    note: "3 blockers — UPC, net weight, warning block",
  },
  {
    at: "Today · 08:40",
    who: "Nav",
    action: "approved",
    object: "HGE-16-CIT · dieline v6",
    context: "spec v4 · output profile fix accepted",
    hash: "4b7e0a92…c19",
  },
  {
    at: "Yesterday · 16:02",
    who: "Dante",
    action: "approved",
    object: "Sunrise COI 2025–26",
    context: "supply agreement · expires 2 Dec 2026",
    hash: "d81f3c47…9b2",
  },
  {
    at: "Yesterday · 11:31",
    who: "Tom",
    action: "downloaded",
    object: "Maeng Da spec v2",
    context: "reference for the v3 diff",
    hash: "31ac6e08…7f4",
    note: "Why downloaded is recorded too",
  },
  {
    at: "11 Nov · 15:20",
    who: "Nav",
    action: "approved",
    object: "WGC-PD-500 · proof v1",
    context: "spec v2 · pass with notes",
    hash: "77e0b512…0aa",
  },
  {
    at: "10 Nov · 09:04",
    who: "Dante",
    action: "superseded",
    object: "HGE-16-CIT · dieline v5 → v6",
    context: "spec v4 · old version stays retrievable",
    hash: "c0934ab7…e55",
  },
  {
    at: "8 Nov · 18:47",
    who: "Nav",
    action: "restricted",
    object: "QuickBooks export · Oct",
    context: "owner only · 2 downloads",
    hash: "0f5d9c31…b83",
    note: "Access change logged",
  },
];

const tone: Record<Entry["action"], { cls: string; icon: "check" | "alert" | "download" | "lock" | "clock" }> = {
  approved: { cls: "border-ok/35 bg-ok/10 text-ok", icon: "check" },
  held: { cls: "border-alert/35 bg-alert/10 text-alert", icon: "alert" },
  downloaded: { cls: "border-line bg-panel text-soft", icon: "download" },
  superseded: { cls: "border-warn/35 bg-warn/10 text-warn", icon: "clock" },
  restricted: { cls: "border-info/35 bg-info/10 text-info", icon: "lock" },
};

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        kicker="Approvals · append-only record"
        title={
          <>
            Nothing happened <span className="italic text-ember">without a name on it.</span>
          </>
        }
        sub="Every approval, hold, download and access change — with the person, the minute, the file hash and the spec version that was live. This is the page you open when something goes wrong."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
            <Icon name="download" className="h-3 w-3" /> Export log
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Approved · 7 days" value="9" delta="2 proofs · 7 documents" />
        <Stat label="Held · 7 days" value="3" delta="all before a print run" good={false} />
        <Stat label="Hashed artifacts" value="41" delta="sha256 on write" />
        <Stat label="Undo window" value="24h" delta="reason required" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="card self-start overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <SectionHead title="The record" />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
              newest first · cannot be edited
            </span>
          </div>
          <div className="divide-y divide-line/60">
            {entries.map((e, i) => {
              const t = tone[e.action];
              return (
                <div key={`${e.at}-${i}`} className="flex flex-wrap items-start gap-3 px-4 py-3.5">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${t.cls}`}
                  >
                    <Icon name={t.icon} className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] text-ink">{e.object}</span>
                      <span
                        className={`rounded-full border px-2 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.12em] ${t.cls}`}
                      >
                        {e.action}
                      </span>
                      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                        {e.at}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-muted">{e.context}</p>
                    {e.note && (
                      <p className="mt-1 text-[11px] leading-relaxed text-soft">“{e.note}”</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                      <span className="text-ink">{e.who}</span>
                      <span className="h-2.5 w-px bg-line" />
                      <span>sha256 {e.hash}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="How a receipt is written" />
            <div className="space-y-2">
              {[
                ["Who", "signed-in user, never a service account"],
                ["When", "server time, not the browser clock"],
                ["What", "artifact + sha256 of the exact bytes"],
                ["Against", "spec version that was live"],
                ["Why", "required on holds and undos"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink">
                    {k}
                  </span>
                  <span className="max-w-[190px] text-right text-[10.5px] leading-relaxed text-muted">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="What can be undone" />
            <p className="text-[11.5px] leading-relaxed text-muted">
              An approval can be reversed inside 24 hours with a reason — the reversal is recorded
              next to it, never instead of it. Downloads and access changes cannot be undone, only
              superseded by a later entry.
            </p>
          </section>

          <section className="card border-ember/25 p-4">
            <p className="kicker">The rule</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
              Propose → Approve → Record.
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              The AI can draft, flag and prepare. A person signs. The record keeps both.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
