import Link from "next/link";
import { EntityTabs } from "@/components/entity-tabs";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, SeverityChip, Stat } from "@/components/ui";
import { cash, entities, entityById, leakTotal, leaks, portfolio } from "@/lib/portfolio";

const seg = [
  { key: "cogs", label: "Cost of goods", color: "#4a3d32" },
  { key: "fees", label: "Platform + card fees", color: "#6f5c48" },
  { key: "shipping", label: "Shipping + freight", color: "#8aa8c8" },
  { key: "ads", label: "Ad spend", color: "#e0a83c" },
  { key: "refunds", label: "Refunds + chargebacks", color: "#e2563f" },
  { key: "net", label: "Kept", color: "#8fae9c" },
] as const;

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  const selected = entityById(e);
  const scope = selected ?? portfolio;
  const revenue = scope.revenue;
  const visibleLeaks = selected ? leaks.filter((l) => l.entity === selected.name) : leaks;

  return (
    <>
      <PageHeader
        kicker={selected ? `Money · ${selected.name}` : "Money · November MTD"}
        title={
          <>
            Where every dollar <span className="italic text-ember">actually goes.</span>
          </>
        }
        sub="One revenue number, then the costs that quietly eat it. Anything flagged below is money leaving without an invoice to match."
        actions={
          <Link
            href="/brain"
            className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink"
          >
            Ask why
          </Link>
        }
      />

      <EntityTabs base="/money" current={e} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net revenue" value={`$${revenue.toLocaleString()}`} delta="after refunds" />
        <Stat
          label="Gross profit"
          value={`$${(revenue - scope.cogs).toLocaleString()}`}
          delta={`${(((revenue - scope.cogs) / revenue) * 100).toFixed(1)}% gross margin`}
        />
        <Stat
          label="Kept"
          value={`$${scope.net.toLocaleString()}`}
          delta={`${((scope.net / revenue) * 100).toFixed(1)}% net`}
        />
        <Stat
          label="Leaking / month"
          value={`$${leakTotal.toLocaleString()}`}
          delta={`${leaks.length} open findings`}
          good={false}
        />
      </div>

      <section className="card mt-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionHead title="The flow" />
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
            every dollar of ${revenue.toLocaleString()}
          </span>
        </div>

        <div className="mt-2 flex h-6 w-full overflow-hidden rounded-md border border-line/60">
          {seg.map((s) => {
            const value = scope[s.key as keyof typeof scope] as number;
            const pct = (value / revenue) * 100;
            return (
              <div
                key={s.key}
                title={`${s.label} — $${value.toLocaleString()} (${pct.toFixed(1)}%)`}
                style={{ width: `${pct}%`, background: s.color }}
                className="h-full transition-[width] duration-500 hover:brightness-125"
              />
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {seg.map((s) => {
            const value = scope[s.key as keyof typeof scope] as number;
            const pct = (value / revenue) * 100;
            return (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-lg border border-line/60 bg-bg-soft/40 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-[11.5px] text-muted">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  {s.label}
                </span>
                <span className="tabular font-mono text-[11px] text-ink">
                  ${value.toLocaleString()}
                  <span className="ml-1.5 text-[9px] text-soft">{pct.toFixed(1)}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="card self-start overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <SectionHead title="Where it leaks" />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
              ${leakTotal.toLocaleString()} / month
            </span>
          </div>
          <div className="divide-y divide-line/60">
            {visibleLeaks.length === 0 && (
              <p className="px-4 py-8 text-center text-[12px] text-soft">
                Nothing flagged for this entity this month.
              </p>
            )}
            {visibleLeaks.map((l) => (
              <div key={l.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityChip severity={l.severity} />
                  <span className="text-[13px] font-medium text-ink">{l.title}</span>
                  <span className="ml-auto tabular font-mono text-[12px] text-alert">
                    −${l.monthly.toLocaleString()}/mo
                  </span>
                </div>
                <p className="mt-1.5 max-w-3xl text-[11.5px] leading-relaxed text-muted">{l.detail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                  <span>{l.entity}</span>
                  <span className="h-2.5 w-px bg-line" />
                  <span>owner {l.owner}</span>
                  <span className="h-2.5 w-px bg-line" />
                  <span className="text-ember">{l.action}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="Cash position" />
            <p className="tabular font-display text-[30px] leading-none text-ink">
              ${cash.onHand.toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
              across 7 entities
            </p>
            <div className="mt-3 space-y-2">
              {[
                ["In transit from processors", `$${cash.inTransit.toLocaleString()}`],
                ["Bills next 14 days", `−$${cash.bills14.toLocaleString()}`],
                ["After bills", `$${(cash.onHand + cash.inTransit - cash.bills14).toLocaleString()}`],
                ["Runway", `${cash.runwayDays} days`],
              ].map(([k, v], i) => (
                <div
                  key={String(k)}
                  className={`flex items-center justify-between ${i === 3 ? "border-t border-line/60 pt-2" : ""}`}
                >
                  <span className="text-[11px] text-muted">{k}</span>
                  <span className="tabular font-mono text-[11px] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="By entity · kept" />
            <div className="space-y-2.5">
              {entities.map((en) => (
                <div key={en.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">{en.name}</span>
                    <span className="tabular font-mono text-[10px] text-ink">
                      ${en.net.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(en.net / Math.max(...entities.map((x) => x.net))) * 100}%`,
                        background: en.net > 20000 ? "var(--color-sage)" : "var(--color-ember)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-soft">
              <Icon name="spark" className="mt-0.5 h-3 w-3 shrink-0 text-ember" />
              Addy carries the most absolute profit; Hella Good carries the best margin per order.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
