import Link from "next/link";
import { Icon } from "@/components/icons";
import { authEnabled } from "@/lib/session";
import { listSpecs, type SpecListItem } from "@/lib/specs";
import { entities } from "@/lib/portfolio";
import { createSpecAction } from "./actions";

export const dynamic = "force-dynamic";

/** Shown when no database is connected — the shape of the real thing, frozen. */
const previewRows: SpecListItem[] = [
  { id: "demo-bak", entity_id: "bornagain", entity: "Born Again Kratom", code: "BAK-MD-250", name: "Maeng Da 250 g pouch", gtin: "8101234567803", spec_id: null, version: 3, locked: true, versions: 3, created_at: null },
  { id: "demo-hg", entity_id: "hellagood", entity: "Hella Good Energy", code: "HG-GUM-125", name: "125 mg gummy 3-pack", gtin: null, spec_id: null, version: 7, locked: true, versions: 7, created_at: null },
  { id: "demo-wgc", entity_id: "wgc", entity: "WGC Paddy", code: "WGC-FOCUS-60", name: "Focus 60 ct bottle", gtin: null, spec_id: null, version: 1, locked: false, versions: 1, created_at: null },
];

export default async function SpecsPage() {
  const authOn = authEnabled();
  const rows = authOn ? await listSpecs() : previewRows;
  const lockedCount = rows.filter((r) => r.locked).length;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-end justify-between gap-3 pb-6">
        <div>
          <p className="kicker">PackCheck · the locked truth</p>
          <h1 className="font-display text-[30px] font-medium tracking-tight text-ink">Specs</h1>
          <p className="mt-1 max-w-xl text-[13.5px] text-muted">
            The gate can only check against a spec. Build it here: exact copy, dieline,
            claims with sources. Save = new version, lock = receipt in the audit log.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
          <span>{rows.length} skus</span>
          <span>{lockedCount} locked</span>
          <span className="rounded-full border border-line px-2.5 py-1 text-[8.5px] text-soft">
            {authOn ? "live · postgres" : "sample data"}
          </span>
        </div>
      </header>

      {/* ---- new spec (only when a DB exists) ---- */}
      {authOn && (
        <details className="card mb-4 px-4 py-3">
          <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.14em] text-ember">
            + New spec
          </summary>
          <form action={createSpecAction} className="mt-3 grid gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Entity</span>
              <select name="entityId" required className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-2 py-2 text-[12.5px] text-ink focus:border-line-strong focus:outline-none">
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Code</span>
              <input name="code" required placeholder="BAK-MD-250" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 font-mono text-[12.5px] uppercase text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Product name</span>
              <input name="name" required placeholder="Maeng Da 250 g pouch" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">GTIN / UPC (optional)</span>
              <input name="gtin" inputMode="numeric" placeholder="8101234567803" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 font-mono text-[12.5px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
            </label>
            <button type="submit" className="self-end rounded-lg bg-ember px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110 sm:col-span-2 sm:w-fit sm:justify-self-end">
              Create
            </button>
          </form>
        </details>
      )}

      {/* ---- list ---- */}
      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted">
            No specs yet. Create the first one — it takes five minutes and the gate uses it forever.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/specs/${r.id}`} className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-panel/60">
                  <span className={r.locked ? "text-ember" : "text-soft"}>
                    <Icon name={r.locked ? "lock" : "file"} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-ink">
                      <span className="font-mono text-[12px]">{r.code}</span>
                      <span className="mx-2 text-soft">·</span>
                      {r.name}
                    </span>
                    <span className="block text-[11.5px] text-muted">
                      {r.entity}
                      {r.gtin ? <> · GTIN <span className="font-mono text-[11px]">{r.gtin}</span></> : null}
                    </span>
                  </span>
                  {r.version !== null ? (
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em]",
                        r.locked ? "border-ember/40 text-ember" : "border-line text-soft",
                      ].join(" ")}
                    >
                      v{r.version} · {r.locked ? "locked" : "draft"}
                    </span>
                  ) : (
                    <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
                      no spec yet
                    </span>
                  )}
                  <span className="text-soft transition-colors group-hover:text-ember">
                    <Icon name="chevron" className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
        a spec version is never edited — saving supersedes it, locking signs it
      </p>
    </div>
  );
}
