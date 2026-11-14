import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { SpecEditor } from "@/components/spec-editor";
import { authEnabled } from "@/lib/session";
import { getSku, type SpecPayload, type SpecVersion } from "@/lib/specs";

export const dynamic = "force-dynamic";

/** Frozen sample specs for preview mode (no database connected). */
const demoPayloads: Record<string, { sku: { id: string; code: string; name: string; entity: string; gtin: string | null }; versions: SpecVersion[] }> = {
  "demo-bak": {
    sku: { id: "demo-bak", code: "BAK-MD-250", name: "Maeng Da 250 g pouch", entity: "Born Again Kratom", gtin: "8101234567803" },
    versions: [
      {
        id: "demo-bak-v3",
        sku_id: "demo-bak",
        version: 3,
        approved_copy: {
          blocks: [
            { panel: "front", text: "BORN AGAIN KRATOM — Maeng Da · Whole Leaf Powder · 250 g" },
            { panel: "back", text: "Whole leaf only. No extracts. No 7-OH. Lab-tested, batch-traceable." },
          ],
          claims: [{ claim: "No extracts. No 7-OH.", source: "COA BAK-2026-114 + formulation record" }],
          dims: { trimW: "3.5", trimH: "6.25", bleed: "0.125", safe: "0.125", dieline: "SR-POUCH-250 v5" },
          requiredText: [
            "WARNING: Keep out of reach of minors. Not for use under 21.",
            "Net Wt. 250 g (8.8 oz)",
          ],
          spotColors: ["PMS 485 U", "PMS Black 6 U"],
        },
        locked_by_name: "Tom",
        locked_at: "2026-10-02T00:00:00Z",
        created_at: "2026-10-02T00:00:00Z",
        supersedes: "demo-bak-v2",
      },
    ],
  },
  "demo-hg": {
    sku: { id: "demo-hg", code: "HG-GUM-125", name: "125 mg gummy 3-pack", entity: "Hella Good Energy", gtin: null },
    versions: [
      {
        id: "demo-hg-v7",
        sku_id: "demo-hg",
        version: 7,
        approved_copy: {
          blocks: [{ panel: "front", text: "HELLA GOOD — Caffeine Gummies · 125 mg RCF · 3 flavors" }],
          claims: [{ claim: "125 mg natural caffeine from Raw Coffee Fiber", source: "RCF assay sheet RCF-26-09" }],
          dims: { trimW: "4.0", trimH: "5.0", bleed: "0.125", safe: "0.125", dieline: "HG-CARD-3PK v2" },
          requiredText: ["Net Wt. 1.2 oz (34 g)"],
          spotColors: ["PMS 172 U"],
        },
        locked_by_name: "Tom",
        locked_at: "2026-10-28T00:00:00Z",
        created_at: "2026-10-28T00:00:00Z",
        supersedes: null,
      },
    ],
  },
  "demo-wgc": {
    sku: { id: "demo-wgc", code: "WGC-FOCUS-60", name: "Focus 60 ct bottle", entity: "WGC Paddy", gtin: null },
    versions: [
      {
        id: "demo-wgc-v1",
        sku_id: "demo-wgc",
        version: 1,
        approved_copy: {
          blocks: [{ panel: "front", text: "WGC PADDY — Focus without a prescription · 60 capsules" }],
          claims: [{ claim: "Focus without a prescription", source: "pending — attach Vault doc" }],
          dims: { trimW: "2.4", trimH: "4.6", bleed: "0.125", safe: "0.125", dieline: "WGC-BTL-60 v1" },
          requiredText: ["Supplement Facts panel required"],
          spotColors: ["PMS 355 U"],
        },
        locked_by_name: null,
        locked_at: null,
        created_at: "2026-11-10T00:00:00Z",
        supersedes: null,
      },
    ],
  },
};

const dateFmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;

export default async function SpecPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string; saved?: string; locked?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const authOn = authEnabled();

  const data = authOn ? await getSku(id) : null;
  const sku = data?.sku ?? demoPayloads[id]?.sku;
  const versions: SpecVersion[] = data?.versions ?? demoPayloads[id]?.versions ?? [];
  if (!sku) notFound();

  const latest = versions[0];
  const viewed = versions.find((v) => v.version === Number(sp.v)) ?? latest;
  if (!viewed) notFound();
  const isLatest = viewed.version === latest.version;
  const flash = sp.saved ? ("saved" as const) : sp.locked ? ("locked" as const) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="pb-6">
        <Link href="/specs" className="mb-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-soft transition-colors hover:text-ember">
          <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" /> all specs
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">{sku.entity}</p>
            <h1 className="font-display text-[28px] font-medium tracking-tight text-ink">
              <span className="font-mono text-[22px]">{sku.code}</span>
              <span className="mx-2 text-soft">·</span>
              {sku.name}
            </h1>
            {sku.gtin && (
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-soft">
                GTIN {sku.gtin}
              </p>
            )}
          </div>
          <span
            className={[
              "rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
              viewed.locked_at ? "border-ember/40 text-ember" : "border-line text-soft",
            ].join(" ")}
          >
            v{viewed.version} · {viewed.locked_at ? `locked by ${viewed.locked_by_name}` : "draft"}
          </span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_250px]">
        <div className="min-w-0">
          <SpecEditor
            skuId={sku.id}
            specId={viewed.id}
            version={viewed.version}
            locked={Boolean(viewed.locked_at)}
            isLatest={isLatest}
            payload={viewed.approved_copy}
            authOn={authOn}
            flash={flash}
          />
        </div>

        {/* ---- version history ---- */}
        <aside className="card h-fit p-4">
          <p className="kicker">Version history</p>
          <ol className="mt-2.5 grid gap-1">
            {versions.map((v) => {
              const active = v.version === viewed.version;
              return (
                <li key={v.id}>
                  <Link
                    href={authOn ? `/specs/${sku.id}?v=${v.version}` : `/specs/${sku.id}`}
                    className={[
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors",
                      active ? "bg-panel-2 text-ink" : "text-muted hover:bg-panel/60 hover:text-ink",
                    ].join(" ")}
                  >
                    <span className={v.locked_at ? "text-ember" : "text-soft"}>
                      <Icon name={v.locked_at ? "lock" : "file"} className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-[11.5px]">v{v.version}</span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                      {v.locked_at ? "locked" : "draft"} · {dateFmt(v.created_at) ?? "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-snug text-muted">
            {isLatest
              ? "You're looking at the newest version."
              : "Older version — read-only reference. Saving from here opens a new draft that supersedes the latest."}
          </p>
        </aside>
      </div>
    </div>
  );
}
