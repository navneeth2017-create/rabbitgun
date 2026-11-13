import { Icon } from "@/components/icons";
import { TaskList } from "@/components/task-list";
import { PageHeader, SectionHead, Stat } from "@/components/ui";
import { tasks } from "@/lib/demo";

const clock = [
  { label: "Sunrise certificate of insurance", days: 19, total: 365, tone: "text-alert", bar: "bg-alert" },
  { label: "24 Nov in-hands date", days: 11, total: 30, tone: "text-warn", bar: "bg-warn" },
  { label: "USPTO office action response", days: 84, total: 90, tone: "text-info", bar: "bg-info" },
  { label: "Spec v3 annual review", days: 147, total: 365, tone: "text-ok", bar: "bg-ok" },
];

export default function RunbookPage() {
  return (
    <>
      <PageHeader
        kicker="Runbook · obligations across 7 entities"
        title={
          <>
            The things that bite <span className="italic text-ember">when forgotten.</span>
          </>
        }
        sub="Renewals, filings, certificates, proof deadlines, contract notice windows. Created from the Vault and from email, then owned by a person."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
            <Icon name="plus" className="h-3 w-3" /> Add task
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Due today" value="2" delta="1 blocks a print run" good={false} />
        <Stat label="Blocking a run" value="1" delta="BAK-MD-250 · 24 Nov" good={false} />
        <Stat label="This week" value="3" delta="2 need a document" />
        <Stat label="Next 90 days" value="3" delta="1 certificate lapses" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="card self-start overflow-hidden">
          <TaskList tasks={tasks} />
        </section>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="The clock" />
            <div className="space-y-3.5">
              {clock.map((c) => (
                <div key={c.label}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-muted">{c.label}</span>
                    <span className={`font-mono text-[10px] ${c.tone}`}>{c.days}d</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${c.bar}`}
                      style={{ width: `${Math.max(4, Math.min(100, 100 - (c.days / 90) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="By owner" />
            <div className="space-y-2">
              {[
                ["Nav", 1, "USPTO response"],
                ["Dante", 2, "COI · reorder"],
                ["Tom", 2, "proof · spec note"],
              ].map(([who, n, what]) => (
                <div key={String(who)} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-line bg-panel-2 font-mono text-[9px] text-muted">
                      {String(who).slice(0, 1)}
                    </span>
                    <span className="text-[11.5px] text-ink">{who}</span>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-mono text-[11px] text-ink">{n}</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-soft">{what}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="Auto-created" />
            <p className="text-[11px] leading-relaxed text-muted">
              When a document with an expiry lands in the Vault, a task appears here. When a thread
              contains a date and a commitment, the same thing happens. Nothing is created from
              guesswork — the source line always says where it came from.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
