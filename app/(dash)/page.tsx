import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, Sparkline, Stat, Tone } from "@/components/ui";
import { brief, decisions, revenueSeries, tasks } from "@/lib/demo";
import { entities, portfolio } from "@/lib/portfolio";

export default function BriefPage() {
  return (
    <>
      <PageHeader
        kicker="Friday 13 November · brief drafted 06:58"
        title={
          <>
            Good morning, <span className="italic text-ember">Nav.</span>
          </>
        }
        sub={brief.headline}
        actions={
          <>
            <button className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
              Re-run brief
            </button>
            <Link
              href="/brain"
              className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:bg-ember/15"
            >
              Ask Jarvis
            </Link>
          </>
        }
      />

      <section className="card mb-4 p-4">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="min-w-[150px]">
            <p className="kicker">Portfolio</p>
            <p className="tabular mt-1 font-display text-[27px] leading-none text-ink">
              ${portfolio.revenue.toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
              MTD revenue · 7 entities
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {[
              ["Kept", `$${portfolio.net.toLocaleString()}`, "text-ink"],
              ["Orders", portfolio.orders.toLocaleString(), "text-ink"],
              ["To ship", String(portfolio.shipToday), "text-ink"],
              ["Exceptions", String(portfolio.exceptions), "text-alert"],
            ].map(([label, value, cls]) => (
              <div key={label}>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-soft">{label}</p>
                <p className={`tabular mt-0.5 font-mono text-[15px] ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
          <Link
            href="/pulse"
            className="group flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember"
          >
            All entities
            <Icon name="arrow" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {entities.map((en, i) => (
            <div
              key={en.id}
              title={`${en.name} — $${en.revenue.toLocaleString()}`}
              className="h-full transition-opacity hover:opacity-70"
              style={{
                width: `${(en.revenue / portfolio.revenue) * 100}%`,
                background: i % 3 === 0 ? "var(--color-ember)" : i % 3 === 1 ? "var(--color-sage)" : "var(--color-info)",
                opacity: 0.75,
              }}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <SectionHead title="The brief" />
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
                14 sources · 06:58
              </span>
            </div>
            <p className="max-w-3xl text-[14px] leading-[1.75] text-muted">{brief.paragraph}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Pulse · 7 sites", "PackCheck · 2 proofs", "Inbox · 6 threads", "Vault · 2 expiries"].map(
                (s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ),
              )}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {brief.metrics.map((m) => (
              <Stat key={m.label} {...m} />
            ))}
          </div>

          <section>
            <SectionHead
              title="Three things"
              right={
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
                  ranked by cost of waiting
                </span>
              }
            />
            <div className="grid gap-3">
              {brief.things.map((t) => (
                <Link
                  key={t.n}
                  href={t.href}
                  className="group card flex items-start gap-4 p-4 transition-colors hover:border-line-strong"
                >
                  <span className="tabular pt-0.5 font-mono text-[11px] text-soft">{t.n}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">
                      <Tone tone={t.tone}>{t.title}</Tone>
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{t.body}</p>
                  </div>
                  <span className="mt-1 flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft group-hover:text-ember">
                    {t.cta}
                    <Icon name="arrow" className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionHead title="Sites & storefronts · last 20 days" />
              <span className="font-mono text-[10px] text-ok">+12.4% vs prior 20</span>
            </div>
            <Sparkline data={revenueSeries} className="h-20 w-full" />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {entities.map((en) => (
                <Link
                  key={en.id}
                  href={`/pulse?e=${en.id}`}
                  className="flex items-center justify-between rounded-lg border border-line/70 bg-bg-soft/40 px-3 py-2 transition-colors hover:border-line-strong"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-ink">{en.domain}</p>
                    <p className="truncate text-[10px] text-soft">{en.publicNote}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="tabular font-mono text-[12px] text-ink">
                      ${en.revenue.toLocaleString()}
                    </p>
                    <p
                      className={`tabular font-mono text-[10px] ${
                        en.delta >= 0 ? "text-ok" : "text-alert"
                      }`}
                    >
                      {en.delta >= 0 ? "+" : ""}
                      {en.delta}%
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/pulse"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-soft transition-colors hover:border-line-strong hover:text-ember"
              >
                All {entities.length} sites · Pulse
                <Icon name="arrow" className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="Waiting on you" />
            <div className="space-y-2">
              {brief.queue.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex items-center justify-between rounded-lg border border-line/70 bg-bg-soft/40 px-3 py-2.5 transition-colors hover:border-line-strong"
                >
                  <span className="text-[12px] text-muted">{q.label}</span>
                  <span className="tabular font-mono text-[13px] text-ink">{q.value}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead
              title="Next up"
              right={<Link href="/runbook" className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember">Runbook</Link>}
            />
            <div className="space-y-3">
              {tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="border-b border-line/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip">{t.source}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                      {t.due}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-ink">{t.title}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                    {t.owner}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ember/15 text-ember">
                <Icon name="brain" className="h-3.5 w-3.5" />
              </span>
              <SectionHead title="Jarvis" />
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> linked
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-soft">
              Ask out loud from the kitchen. It reads this dashboard through the feed.
            </p>
            <div className="mt-3 space-y-2">
              <p className="rounded-lg border border-line/70 bg-bg-soft/50 px-2.5 py-2 font-mono text-[10.5px] text-muted">
                “Is the new packaging good to print?”
              </p>
              <p className="rounded-lg border border-ember/25 bg-ember/[0.07] px-2.5 py-2 text-[11px] leading-relaxed text-ink">
                No. Three blockers on proof v2 — the UPC points at a different SKU. Kerri needs an
                answer by Monday.
              </p>
            </div>
          </section>

          <section className="card p-4">
            <SectionHead
              title="Recent decisions"
              right={<Link href="/brain" className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember">Brain</Link>}
            />
            <div className="space-y-3">
              {decisions.slice(0, 3).map((d) => (
                <div key={d.id}>
                  <p className="text-[11.5px] leading-snug text-muted">{d.text}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                    {d.who} · {d.when}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
