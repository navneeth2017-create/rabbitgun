import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, Stat, Verdict } from "@/components/ui";
import { counts as demoCounts, proofs as demoProofs } from "@/lib/demo";
import { authEnabled } from "@/lib/session";
import { lockedSpecFor, lockedSpecOptions, listProofs } from "@/lib/proofs";
import { createProofAction } from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const ms = (d: number | null) =>
  d === null ? "—" : d < 1000 ? `${d} ms` : `${(d / 1000).toFixed(2)} s`;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function PackCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; error?: string }>;
}) {
  if (!authEnabled()) return <PreviewPackCheck />;

  const sp = await searchParams;
  const [proofs, specs] = await Promise.all([listProofs(), lockedSpecOptions()]);
  const selected = typeof sp.sku === "string" && sp.sku ? await lockedSpecFor(sp.sku) : null;
  const error = typeof sp.error === "string" ? sp.error : "";

  const open = proofs.filter((p) => !p.decision);
  const blockersOpen = open.reduce((a, p) => a + p.blockers, 0);
  const now = new Date();
  const thisMonth = proofs.filter((p) => {
    if (!p.checked_at) return false;
    const d = new Date(p.checked_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const durations = proofs
    .map((p) => p.duration_ms)
    .filter((d): d is number => typeof d === "number")
    .sort((a, b) => a - b);
  const median = durations.length ? durations[Math.floor(durations.length / 2)] : null;

  const panels = selected
    ? Array.from(new Set(selected.payload.blocks.map((b) => b.panel).filter(Boolean)))
    : [];
  const panelList = panels.length ? panels : ["front", "back"];

  return (
    <>
      <PageHeader
        kicker="PackCheck · prepress QA"
        title={
          <>
            Nothing goes to print <span className="italic text-ember">unchecked.</span>
          </>
        }
        sub="The proof is compared against the locked spec: every approved word of copy, required lines, barcode, trim, dieline, spot colors, claims. Extra copy is fine — missing or reordered approved copy is a finding."
        actions={
          <Link
            href="#run-check"
            className="flex items-center gap-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:bg-ember/15"
          >
            <Icon name="plus" className="h-3 w-3" /> New proof
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting decision" value={String(open.length)} delta={open.length ? "needs a human" : "all decided"} good={open.length === 0} />
        <Stat label="Blockers open" value={String(blockersOpen)} delta={blockersOpen ? "do not print" : "none"} good={blockersOpen === 0} />
        <Stat label="Checks this month" value={String(thisMonth)} delta={`${proofs.length} on record`} />
        <Stat label="Median review" value={ms(median)} delta="submission → verdict" />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-alert/35 bg-alert/10 px-3.5 py-2.5 text-[12px] text-alert">
          {error}
        </p>
      )}

      {/* ---- run a check ---- */}
      <section id="run-check" className="card mt-4 scroll-mt-24 p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="kicker">Run a check</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Enter what the printer&apos;s proof shows. The checker grades it against the latest locked
              spec — no model, no guessing, every finding reproducible.
            </p>
          </div>
          {selected && (
            <Link
              href="/packcheck#run-check"
              className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft underline-offset-2 hover:text-ember hover:underline"
            >
              change sku
            </Link>
          )}
        </div>

        {specs.length === 0 ? (
          <p className="mt-4 rounded-lg border border-line bg-panel/60 px-3.5 py-2.5 text-[12.5px] text-muted">
            No locked specs yet. The gate can only check against a locked spec —{" "}
            <Link href="/specs" className="text-ember underline-offset-2 hover:underline">
              create and lock one first
            </Link>
            .
          </p>
        ) : !selected ? (
          <form method="get" action="/packcheck" className="mt-4 flex flex-wrap items-end gap-2">
            <label className="min-w-[260px] flex-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
                SKU with a locked spec
              </span>
              <select
                name="sku"
                required
                defaultValue=""
                className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink focus:border-line-strong focus:outline-none"
              >
                <option value="" disabled>
                  Pick a SKU…
                </option>
                {specs.map((s) => (
                  <option key={s.skuId} value={s.skuId}>
                    {s.entity} · {s.code} — {s.name} · spec v{s.version}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg bg-ember px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110"
            >
              Load spec
            </button>
          </form>
        ) : (
          <form action={createProofAction} className="mt-4 grid gap-3">
            <input type="hidden" name="skuId" value={selected.skuId} />
            <p className="rounded-lg border border-line bg-panel/60 px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
              Checking {selected.entity} · {selected.code} against spec v{selected.version}
              {selected.lockedByName ? ` · locked by ${selected.lockedByName}` : ""} ·{" "}
              {selected.payload.blocks.length} copy blocks · {selected.payload.requiredText.length}{" "}
              required lines · {selected.payload.claims.length}{" "}
              {selected.payload.claims.length === 1 ? "claim" : "claims"} ·{" "}
              {selected.payload.spotColors.length} spot colors
            </p>
            <p className="text-[11.5px] leading-relaxed text-muted">
              Enter what the proof actually shows. The spec values appear as hints only — nothing is
              prefilled, because a check that copies the answer proves nothing.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Vendor (printer)" name="vendor" required placeholder="Sunrise Packaging Co." />
              <Field label="Contact" name="contact" placeholder="Kerri" />
              <Field label="Proof version" name="proofVersion" type="number" defaultValue="1" required />
              <Field label="File name (optional)" name="fileName" placeholder={`${selected.code}_proof_v2.pdf`} />
              <Field label="GTIN read off the barcode" name="gtin" placeholder="8101234567803" hint={selected.gtin ?? "none on spec"} />
              <Field label="Trim width (in)" name="trimW" placeholder="3.5" hint={selected.payload.dims.trimW ? `${selected.payload.dims.trimW} in` : "not fixed"} />
              <Field label="Trim height (in)" name="trimH" placeholder="6.25" hint={selected.payload.dims.trimH ? `${selected.payload.dims.trimH} in` : "not fixed"} />
              <Field label="Dieline" name="dieline" placeholder="SR-POUCH-250 v5" hint={selected.payload.dims.dieline ?? "not fixed"} />
              <div className="sm:col-span-2 lg:col-span-4">
                <Field
                  label="Spot colors (comma separated)"
                  name="spotColors"
                  placeholder="PMS 485 U, PMS Black 6 U"
                  hint={selected.payload.spotColors.length ? selected.payload.spotColors.join(", ") : "none on spec"}
                />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {panelList.map((panel) => (
                <label key={panel} className="block">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
                    {panel} panel copy
                  </span>
                  <textarea
                    name={`panel:${panel}`}
                    rows={5}
                    placeholder="Paste exactly what the proof shows on this panel…"
                    className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[12.5px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-ember px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110"
              >
                Run the check
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                findings + verdict are written to the record · nothing sends to the printer
              </p>
            </div>
          </form>
        )}
      </section>

      {/* ---- proofs ---- */}
      <div className="mt-4 space-y-3">
        {proofs.length === 0 ? (
          <p className="card px-4 py-10 text-center text-[13px] text-muted">
            No proofs checked yet. Lock a spec, then run the first check above.
          </p>
        ) : (
          proofs.map((p) => (
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
                      : p.verdict === "PASS"
                        ? "bg-ok"
                        : "bg-line-strong"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-medium text-ink">{p.sku_name}</p>
                  <span className="chip">{p.code}</span>
                  {p.verdict && <Verdict verdict={p.verdict} />}
                  {p.decision === "approved" && (
                    <span className="rounded-full border border-ok/40 bg-ok/10 px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-ok">
                      approved
                    </span>
                  )}
                  {p.decision === "held" && (
                    <span className="rounded-full border border-alert/40 bg-alert/10 px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-alert">
                      held
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
                  {p.vendor} · proof v{p.version}
                  {p.spec_version ? ` · locked spec v${p.spec_version}` : ""} ·{" "}
                  {dateFmt(p.received_at)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px]">
                  <span className={p.blockers > 0 ? "text-alert" : "text-soft"}>{plural(p.blockers, "blocker", "blockers")}</span>
                  <span className={p.warnings > 0 ? "text-warn" : "text-soft"}>{plural(p.warnings, "warning", "warnings")}</span>
                  <span className="text-info">{plural(p.notes, "note", "notes")}</span>
                  {p.decision_by && (
                    <span className="text-soft">
                      decided by {p.decision_by} · {dateFmt(p.decision_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">{p.filename}</p>
                  <p className="font-mono text-[9px] text-soft">check {ms(p.duration_ms)}</p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-line text-soft transition-colors group-hover:border-ember/40 group-hover:text-ember">
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <section className="card mt-4 p-5">
        <p className="kicker mb-3">How a check runs</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Read the proof", "Copy per panel, the barcode digits, trim, dieline, spot colors — the values a human reads off the proof. PDF extraction comes next."],
            ["02", "Compare", "Every approved word, in order, against the latest locked spec version. Every finding says what the spec says and what the proof has."],
            ["03", "Decide", "Verdict is HOLD on any blocker, otherwise pass with notes. A human approves or holds; the receipt is written to the record."],
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

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 1 : undefined}
        className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none"
      />
      {hint && (
        <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.08em] text-soft">
          spec: {hint}
        </span>
      )}
    </label>
  );
}

/* ---- preview mode (no database): the original demo surface --------------- */
function PreviewPackCheck() {
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
          <button className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:border-line-strong hover:text-ink">
            Upload proof
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Waiting on us" value="2" delta="oldest 22h" good={false} />
        <Stat label="Blockers open" value="3" delta="1 reprint risk" good={false} />
        <Stat label="Checks this month" value="18" delta="14 passed clean" />
        <Stat label="Median review" value="74s" delta="upload → report" />
      </div>

      <p className="mt-4 rounded-lg border border-line bg-panel/60 px-3.5 py-2.5 text-[12px] text-muted">
        Preview — the real checker runs against locked specs in Postgres. Set{" "}
        <span className="font-mono text-[10.5px]">DATABASE_URL</span> and this page becomes the gate.
      </p>

      <div className="mt-4 space-y-3">
        {demoProofs.map((p) => {
          const c = demoCounts(p);
          return (
            <Link
              key={p.id}
              href={`/packcheck/${p.id}`}
              className="group card flex flex-wrap items-center gap-4 p-4 transition-colors hover:border-line-strong"
            >
              <span
                className={`h-12 w-1 shrink-0 rounded-full ${
                  p.verdict === "HOLD" ? "bg-alert" : p.verdict === "PASS WITH NOTES" ? "bg-warn" : "bg-ok"
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
                  <span className={c.b > 0 ? "text-alert" : "text-soft"}>{plural(c.b, "blocker", "blockers")}</span>
                  <span className={c.w > 0 ? "text-warn" : "text-soft"}>{plural(c.w, "warning", "warnings")}</span>
                  <span className="text-info">{plural(c.n, "note", "notes")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">{p.file}</p>
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
