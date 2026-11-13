import Link from "next/link";
import { EntityTabs } from "@/components/entity-tabs";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, Sparkline, Stat } from "@/components/ui";
import { entities, entityById, portfolio } from "@/lib/portfolio";
import { revenueSeries } from "@/lib/demo";

const usd = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n).toLocaleString()}`;

export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  const selected = entityById(e);
  const rows = selected ? [selected] : entities;
  const total = selected
    ? { revenue: selected.revenue, net: selected.net, orders: selected.orders, refunds: selected.refunds }
    : { revenue: portfolio.revenue, net: portfolio.net, orders: portfolio.orders, refunds: portfolio.refunds };

  const maxRev = Math.max(...entities.map((x) => x.revenue));
  const refundRate = ((total.refunds / total.revenue) * 100).toFixed(2);
  const margin = ((total.net / total.revenue) * 100).toFixed(1);

  return (
    <>
      <PageHeader
        kicker={selected ? `Pulse · ${selected.name}` : "Pulse · portfolio · November MTD"}
        title={
          <>
            Every store, <span className="italic text-ember">one number.</span>
          </>
        }
        sub="Revenue, orders, margin and refunds across every entity. Filter to one and the numbers follow."
        actions={
          <span className="chip">
            <Icon name="pulse" className="h-3 w-3" /> live · 4 min ago
          </span>
        }
      />

      <EntityTabs base="/pulse" current={e} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net revenue" value={`$${total.revenue.toLocaleString()}`} delta="+11.2% vs Oct" />
        <Stat label="After all costs" value={`$${total.net.toLocaleString()}`} delta={`${margin}% margin`} />
        <Stat label="Orders" value={total.orders.toLocaleString()} delta={`AOV ${usd(total.revenue / total.orders)}`} />
        <Stat
          label="Refund rate"
          value={`${refundRate}%`}
          delta="1.2% baseline"
          good={Number(refundRate) <= 1.2}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="card self-start overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <SectionHead title="By entity" />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
              share of revenue
            </span>
          </div>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  {["Entity", "Revenue", "Δ", "Orders", "AOV", "Margin", "Net"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-soft"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((en) => {
                  const m = ((en.net / en.revenue) * 100).toFixed(0);
                  return (
                    <tr
                      key={en.id}
                      className="group border-b border-line/50 transition-colors last:border-0 hover:bg-panel-2/40"
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/pulse?e=${en.id}`} className="block">
                          <span className="flex items-center gap-2 text-[13px] text-ink">
                            {en.name}
                            <span className="chip">{en.kind}</span>
                          </span>
                          <span className="mt-1 flex items-center gap-2">
                            <span className="h-1 w-24 overflow-hidden rounded-full bg-line">
                              <span
                                className="block h-full rounded-full bg-ember/70"
                                style={{ width: `${(en.revenue / maxRev) * 100}%` }}
                              />
                            </span>
                            <span className="font-mono text-[9px] text-soft">{en.domain}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="tabular px-4 py-2.5 font-mono text-[12px] text-ink">
                        ${en.revenue.toLocaleString()}
                      </td>
                      <td
                        className={`tabular px-4 py-2.5 font-mono text-[11px] ${
                          en.delta >= 0 ? "text-ok" : "text-alert"
                        }`}
                      >
                        {en.delta >= 0 ? "+" : ""}
                        {en.delta}%
                      </td>
                      <td className="tabular px-4 py-2.5 font-mono text-[11px] text-muted">
                        {en.orders.toLocaleString()}
                      </td>
                      <td className="tabular px-4 py-2.5 font-mono text-[11px] text-muted">
                        ${en.aov.toFixed(0)}
                      </td>
                      <td className="tabular px-4 py-2.5 font-mono text-[11px] text-muted">{m}%</td>
                      <td
                        className={`tabular px-4 py-2.5 font-mono text-[12px] ${
                          en.net > 0 ? "text-ink" : "text-alert"
                        }`}
                      >
                        ${en.net.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="Shape of the month" />
            <Sparkline data={revenueSeries} className="h-24 w-full" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line/70 bg-bg-soft/40 px-3 py-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">Best</p>
                <p className="mt-1 text-[12px] text-ink">Hella Good</p>
                <p className="font-mono text-[10px] text-ok">+18.2%</p>
              </div>
              <div className="rounded-lg border border-line/70 bg-bg-soft/40 px-3 py-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">Worst</p>
                <p className="mt-1 text-[12px] text-ink">Born Again</p>
                <p className="font-mono text-[10px] text-alert">−9.1%</p>
              </div>
            </div>
          </section>

          <section className="card border-alert/25 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-alert">
                <Icon name="alert" className="h-4 w-4" />
              </span>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-alert">
                Anomaly
              </h2>
            </div>
            <p className="text-[13px] leading-relaxed text-ink">
              Born Again is down 9.1%, and it isn&apos;t traffic.
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              Sessions are flat week over week. Refunds are 3.4× baseline and 71% of them are the
              250 g pouch. Checkout success also dropped 0.7 pts on Tuesday.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <Link
                href="/money?e=bornagain"
                className="group flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ember"
              >
                Trace it
                <Icon name="arrow" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="font-mono text-[9px] text-soft">4 sources</span>
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="Data sources" />
            <div className="space-y-2">
              {[
                ["Shopify", "6 stores", true],
                ["Stripe", "payouts + disputes", true],
                ["Amazon", "1 marketplace", true],
                ["GA4", "4 properties", true],
                ["QuickBooks", "not connected", false],
              ].map(([name, note, ok]) => (
                <div key={String(name)} className="flex items-center justify-between">
                  <span className="text-[11.5px] text-muted">{name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-ok" : "bg-soft"}`}
                    />
                    {note}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
