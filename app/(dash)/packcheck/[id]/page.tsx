import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalBar, CopyButton } from "@/components/actions";
import { Icon } from "@/components/icons";
import { ProofSheet } from "@/components/proof-sheet";
import { SeverityChip, Verdict } from "@/components/ui";
import { counts, emailDraft, proofById } from "@/lib/demo";
import { authEnabled } from "@/lib/session";
import { getProof } from "@/lib/proofs";
import { decideProofAction } from "../actions";

export const dynamic = "force-dynamic";

const dateTimeFmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const ms = (d: number | null) =>
  d === null ? "—" : d < 1000 ? `${d} ms` : `${(d / 1000).toFixed(2)} s`;

export default async function ProofPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checked?: string; decided?: string }>;
}) {
  const { id } = await params;
  if (!authEnabled()) return <PreviewProof id={id} />;

  const sp = await searchParams;
  const proof = await getProof(id);
  if (!proof) notFound();

  const blockers = proof.findings.filter((f) => f.severity === "blocker").length;
  const warnings = proof.findings.filter((f) => f.severity === "warning").length;
  const notes = proof.findings.filter((f) => f.severity === "note").length;
  const verdict = proof.run?.verdict ?? null;

  return (
    <>
      <Link
        href="/packcheck"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-soft hover:text-ember"
      >
        <Icon name="chevron" className="h-3 w-3 rotate-180" />
        PackCheck
      </Link>

      {sp.checked && (
        <p className="mb-4 rounded-lg border border-ok/35 bg-ok/10 px-3.5 py-2.5 text-[12px] text-ink">
          Check complete — the verdict and findings below are on the record.
        </p>
      )}
      {sp.decided && (
        <p className="mb-4 rounded-lg border border-ember/35 bg-ember/10 px-3.5 py-2.5 text-[12px] text-ink">
          Decision recorded — {sp.decided === "approved" ? "approved" : "held"} with your name, the
          time and the proof hash.
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {verdict && <Verdict verdict={verdict} />}
            <span className="chip">{proof.sku.code}</span>
            <span className="chip">proof v{proof.version}</span>
            {proof.spec && <span className="chip">spec v{proof.spec.version} locked</span>}
          </div>
          <h1 className="font-display text-[28px] leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {proof.sku.name}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
            {proof.filename} · sha256 {proof.sha256.slice(0, 12)}… · received{" "}
            {dateTimeFmt(proof.received_at)}
            {proof.created_by_name ? ` · entered by ${proof.created_by_name}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
                Findings · {proof.findings.length}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                severity first, then check order
              </p>
            </div>
            {proof.findings.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted">
                Nothing to flag. The proof matches the locked spec on every check.
              </p>
            ) : (
              <div className="divide-y divide-line/60">
                {proof.findings.map((f, i) => (
                  <article key={`${f.code}-${i}`} className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-panel-2 font-mono text-[9px] text-ember">
                        {i + 1}
                      </span>
                      <SeverityChip severity={f.severity} />
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                        {f.code}
                        {f.sheet ? ` · ${f.sheet}` : ""}
                      </span>
                      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                        {Math.round(f.confidence)}% confidence
                      </span>
                    </div>
                    <h3 className="mt-2 text-[14px] font-medium text-ink">{f.title}</h3>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-md border border-line/70 bg-bg-soft/50 px-2.5 py-2">
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-soft">
                          spec says
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-ok">{f.expected}</p>
                      </div>
                      <div className="rounded-md border border-line/70 bg-bg-soft/50 px-2.5 py-2">
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-soft">
                          proof has
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-alert">{f.actual}</p>
                      </div>
                    </div>

                    <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-muted">{f.detail}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card p-4">
            <p className="kicker">How this was checked</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              Deterministic comparison against the locked spec: approved copy (all words present, in
              order), every required line, approved claims, GTIN digits, trim size, dieline, and spot
              colors. No model, no network — the same inputs always produce the same report.
            </p>
            <div className="mt-3 grid gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-soft sm:grid-cols-3">
              <p>engine {proof.run?.engine ?? "—"}</p>
              <p>run {proof.run ? dateTimeFmt(proof.run.created_at) : "—"}</p>
              <p>took {ms(proof.run?.duration_ms ?? null)}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Verdict</p>
                <p
                  className={`mt-1 font-display text-[26px] leading-none ${
                    verdict === "HOLD" ? "text-alert" : verdict === "PASS WITH NOTES" ? "text-warn" : "text-ok"
                  }`}
                >
                  {verdict === "HOLD"
                    ? "Do not print."
                    : verdict === "PASS WITH NOTES"
                      ? "Printable with notes."
                      : "Clean — printable."}
                </p>
              </div>
              <Icon
                name={verdict === "HOLD" ? "alert" : verdict === "PASS" ? "check" : "file"}
                className={`h-5 w-5 ${verdict === "HOLD" ? "text-alert" : verdict === "PASS" ? "text-ok" : "text-warn"}`}
              />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              {blockers} {blockers === 1 ? "blocker" : "blockers"}, {warnings}{" "}
              {warnings === 1 ? "warning" : "warnings"}, {notes} {notes === 1 ? "note" : "notes"}. A
              blocker is something that survives to the run — wrong barcode, missing required text,
              wrong color build.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Blockers", blockers, "text-alert"],
                ["Warnings", warnings, "text-warn"],
                ["Notes", notes, "text-info"],
              ].map(([label, value, cls]) => (
                <div key={String(label)} className="rounded-lg border border-line/70 bg-bg-soft/40 px-2 py-1.5 text-center">
                  <p className={`tabular font-mono text-[15px] ${cls}`}>{value}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-soft">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card border-ember/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Decision</p>
            {proof.approval && (
              <div className="mt-2 rounded-lg border border-line/70 bg-bg-soft/40 px-2.5 py-2">
                <p className={`text-[12.5px] ${proof.approval.decision === "approved" ? "text-ok" : "text-alert"}`}>
                  {proof.approval.decision === "approved" ? "Approved" : "Held"} by{" "}
                  {proof.approval.by_name} · {dateTimeFmt(proof.approval.at)}
                </p>
                {proof.approval.note && (
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{proof.approval.note}</p>
                )}
              </div>
            )}
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Recording a decision writes your name, the time, the proof hash and the spec version.
              It does not email the printer — that is a separate step, not wired yet.
            </p>
            <form action={decideProofAction} className="mt-3 grid gap-2">
              <input type="hidden" name="proofId" value={proof.id} />
              <textarea
                name="note"
                rows={2}
                placeholder="Optional note for the record"
                className="w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[12px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  name="decision"
                  value="approved"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ember px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-on-accent)] transition hover:brightness-110"
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                  Approve proof
                </button>
                <button
                  name="decision"
                  value="held"
                  className="rounded-lg border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-alert/40 hover:text-alert"
                >
                  Hold
                </button>
              </div>
            </form>
          </section>

          <section className="card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Spec</p>
            <div className="mt-2 space-y-1.5">
              {[
                ["Master", `${proof.sku.code}${proof.spec ? ` · v${proof.spec.version}` : ""}`],
                ["Locked by", proof.spec?.locked_by_name ?? "—"],
                ["Locked on", proof.spec?.locked_at ? dateTimeFmt(proof.spec.locked_at) : "—"],
                ["GTIN", proof.sku.gtin ?? "—"],
                ["Vendor", proof.vendor],
                ["Contact", proof.contact ?? "—"],
                ["Direction", "Inbound (gate 2)"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted">{k}</span>
                  <span className="text-right font-mono text-[10px] text-ink">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 break-all border-t border-line pt-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-soft">
              sha256 {proof.sha256}
            </p>
            {proof.spec && (
              <Link
                href={`/specs/${proof.sku.id}?v=${proof.spec.version}`}
                className="mt-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember"
              >
                Open the locked spec <Icon name="arrow" className="h-3 w-3" />
              </Link>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

/* ---- preview mode (no database): the original demo proof ------------------ */
function PreviewProof({ id }: { id: string }) {
  const proof = proofById(id);
  if (!proof) notFound();

  const c = counts(proof);
  const numbers = new Map(proof.findings.map((f, i) => [f.id, i + 1]));

  return (
    <>
      <Link
        href="/packcheck"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-soft hover:text-ember"
      >
        <Icon name="chevron" className="h-3 w-3 rotate-180" />
        PackCheck
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Verdict verdict={proof.verdict} />
            <span className="chip">{proof.sku}</span>
            <span className="chip">proof {proof.proofVersion}</span>
            <span className="chip">spec {proof.specVersion} locked</span>
          </div>
          <h1 className="font-display text-[28px] leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {proof.product}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
            {proof.file} · {proof.bytes} · {proof.pages} pages · received {proof.received}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:border-line-strong hover:text-ink">
            <Icon name="download" className="h-3 w-3" /> Annotated PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
                Evidence · every flag is pinned to the page
              </p>
              <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em]">
                <span className="flex items-center gap-1.5 text-alert">
                  <span className="h-2 w-2 rounded-sm bg-alert/70" /> blocker
                </span>
                <span className="flex items-center gap-1.5 text-warn">
                  <span className="h-2 w-2 rounded-sm bg-warn/70" /> warning
                </span>
                <span className="flex items-center gap-1.5 text-info">
                  <span className="h-2 w-2 rounded-sm bg-info/70" /> note
                </span>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ProofSheet proof={proof} side="front" numberFor={(fid) => numbers.get(fid) ?? 0} />
              <ProofSheet proof={proof} side="back" numberFor={(fid) => numbers.get(fid) ?? 0} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
                Findings · {proof.findings.length}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                severity first, then page order
              </p>
            </div>
            <div className="divide-y divide-line/60">
              {proof.findings.map((f, i) => (
                <article key={f.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-panel-2 font-mono text-[9px] text-ember">
                      {i + 1}
                    </span>
                    <SeverityChip severity={f.severity} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                      {f.code} · {f.sheet}
                    </span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                      {f.confidence}% confidence
                    </span>
                  </div>
                  <h3 className="mt-2 text-[14px] font-medium text-ink">{f.title}</h3>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-line/70 bg-bg-soft/50 px-2.5 py-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-soft">
                        spec says
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-ok">{f.expected}</p>
                    </div>
                    <div className="rounded-md border border-line/70 bg-bg-soft/50 px-2.5 py-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-soft">
                        proof has
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-alert">{f.actual}</p>
                    </div>
                  </div>

                  <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-muted">{f.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Verdict</p>
                <p className="mt-1 font-display text-[26px] leading-none text-alert">
                  {proof.verdict === "HOLD" ? "Do not print." : "Printable with notes."}
                </p>
              </div>
              <Icon name="alert" className="h-5 w-5 text-alert" />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              {c.b} {c.b === 1 ? "blocker" : "blockers"}, {c.w} {c.w === 1 ? "warning" : "warnings"},{" "}
              {c.n} {c.n === 1 ? "note" : "notes"}. The blockers are the kind that survive to a
              5,000-unit run — they don&apos;t wash out in production.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Blockers", c.b, "text-alert"],
                ["Warnings", c.w, "text-warn"],
                ["Notes", c.n, "text-info"],
              ].map(([label, value, cls]) => (
                <div key={String(label)} className="rounded-lg border border-line/70 bg-bg-soft/40 px-2 py-1.5 text-center">
                  <p className={`tabular font-mono text-[15px] ${cls}`}>{value}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-soft">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <ApprovalBar sku={proof.sku} specVersion={proof.specVersion} />

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
                Reply to printer
              </p>
              <CopyButton text={`To: ${emailDraft.to}\nSubject: ${emailDraft.subject}\n\n${emailDraft.body}`} />
            </div>
            <div className="mt-2 rounded-lg border border-line/70 bg-bg-soft/40 p-2.5">
              <p className="font-mono text-[9px] text-soft">to {emailDraft.to}</p>
              <p className="mt-0.5 font-mono text-[10px] text-ink">{emailDraft.subject}</p>
              <div className="mt-2 max-h-[280px] overflow-y-auto pr-1 scroll-thin">
                <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-muted">
                  {emailDraft.body}
                </pre>
              </div>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-soft">
              <Icon name="lock" className="mt-0.5 h-3 w-3 shrink-0" />
              Draft only. Nothing sends until a human clicks — wired in slice 2.
            </p>
          </section>

          <section className="card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Spec</p>
            <div className="mt-2 space-y-1.5">
              {[
                ["Master", `${proof.sku} · v${proof.specVersion.replace("v", "")}`],
                ["Locked by", `${proof.specLockedBy} · ${proof.specLockedOn}`],
                ["Vendor", proof.vendor],
                ["Contact", proof.contact],
                ["Direction", "Inbound (gate 2)"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">{k}</span>
                  <span className="font-mono text-[10px] text-ink">{v}</span>
                </div>
              ))}
            </div>
            <Link
              href="/vault"
              className="mt-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember"
            >
              Open in Vault <Icon name="arrow" className="h-3 w-3" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
