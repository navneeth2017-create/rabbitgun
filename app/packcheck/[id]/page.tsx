import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalBar, CopyButton } from "@/components/actions";
import { Icon } from "@/components/icons";
import { ProofSheet } from "@/components/proof-sheet";
import { SeverityChip, Verdict } from "@/components/ui";
import { counts, emailDraft, proofById } from "@/lib/demo";

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
              {c.b} blockers, {c.w} warnings, {c.n} notes. The blockers are the kind that survive to
              a 5,000-unit run — they don&apos;t wash out in production.
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
