import { EntityTabs } from "@/components/entity-tabs";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, SeverityChip, Stat } from "@/components/ui";
import { carrierMix, entityById, freightExceptions, inbound, portfolio } from "@/lib/portfolio";

export default async function FreightPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  const selected = entityById(e);
  const scope = selected ?? portfolio;
  const costPerOrder = scope.shipping / Math.max(scope.orders, 1);
  const exceptions = (
    selected
      ? freightExceptions.filter((x) => x.entity.startsWith(selected.name.split(" ")[0]))
      : freightExceptions
  ).sort(
    (a, b) =>
      ({ blocker: 0, warning: 1, note: 2 })[a.severity] -
      ({ blocker: 0, warning: 1, note: 2 })[b.severity],
  );
  const onTime = carrierMix.reduce((a, c) => a + c.share * c.onTime, 0) / 100;

  return (
    <>
      <PageHeader
        kicker={selected ? `Freight · ${selected.name}` : "Freight · all entities · today"}
        title={
          <>
            Every box, <span className="italic text-ember">every mile.</span>
          </>
        }
        sub="What ships today, what's stuck, what it costs, and what's coming in. Carrier invoices are reconciled against actual weight."
        actions={
          <span className="chip">
            <Icon name="truck" className="h-3 w-3" /> 187 labels printed
          </span>
        }
      />

      <EntityTabs base="/freight" current={e} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="To ship today" value={String(scope.shipToday)} delta={`${exceptions.length} exceptions`} />
        <Stat label="Cost / order" value={`$${costPerOrder.toFixed(2)}`} delta="$5.10 benchmark" good={costPerOrder <= 5.6} />
        <Stat label="On-time" value={`${onTime.toFixed(1)}%`} delta="last 30 days" />
        <Stat label="Freight spend" value={`$${scope.shipping.toLocaleString()}`} delta="MTD · outbound" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <SectionHead title="Exceptions" />
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                ranked by cost of waiting
              </span>
            </div>
            <div className="divide-y divide-line/60">
              {exceptions.map((x) => (
                <div key={x.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityChip severity={x.severity} />
                      <span className="font-mono text-[11px] text-ink">{x.order}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                        {x.entity}
                      </span>
                      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                        {x.age}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">{x.issue}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ember">
                    {x.action}
                    <Icon name="arrow" className="h-3 w-3" />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <SectionHead title="Inbound" />
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                3 open POs
              </span>
            </div>
            <div className="divide-y divide-line/60">
              {inbound.map((i) => (
                <div key={i.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      i.status === "late" ? "bg-alert" : "bg-ok"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-ink">{i.po}</span>
                      <span className="text-[12px] text-muted">{i.what}</span>
                      <span className="ml-auto font-mono text-[10px] text-ink">{i.eta}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-soft">
                      {i.vendor} · {i.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-alert/25 bg-alert/[0.06] px-4 py-2.5">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-alert/90">
                <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                PO-2291 is the packaging for the held Maeng Da run. If the proof and the pouches both
                slip, the 24 Nov in-hands date is gone.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <SectionHead title="Carrier mix" />
            <div className="space-y-3">
              {carrierMix.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink">{c.name}</span>
                    <span className="tabular font-mono text-[10px] text-soft">
                      {c.share}% · ${c.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-info/70"
                      style={{ width: `${c.share}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                    {c.onTime}% on time
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="Rate check" />
            <p className="text-[13px] leading-relaxed text-ink">
              You are paying <span className="text-ember">$0.68 more per box</span> than the
              negotiated rate card.
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              214 orders were billed at DIM weight above actual. Most are 250 g pouches in the old
              shipper. Switching to the 10×8×6 box removes the reclass on 82% of them.
            </p>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-line/70 bg-bg-soft/40 px-3 py-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-soft">Annualised</span>
              <span className="tabular font-mono text-[13px] text-alert">$14,160</span>
            </div>
          </section>

          <section className="card p-4">
            <SectionHead title="Today" />
            <div className="space-y-2">
              {[
                ["Labels printed", "187"],
                ["Awaiting pickup", "142"],
                ["In transit", "1,204"],
                ["Delivered this week", "3,918"],
                ["Returned", "14"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">{k}</span>
                  <span className="tabular font-mono text-[11px] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
