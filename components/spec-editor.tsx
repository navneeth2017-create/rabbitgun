"use client";

import { useState } from "react";
import { saveSpecAction, lockSpecAction } from "@/app/(dash)/specs/actions";
import type { Claim, CopyBlock, SpecPayload } from "@/lib/specs";

const PANELS = ["front", "back", "left", "right", "top", "bottom"] as const;

export function SpecEditor({
  skuId,
  specId,
  version,
  locked,
  isLatest,
  payload,
  authOn,
  flash,
}: {
  skuId: string;
  specId: string | null;
  version: number;
  locked: boolean;
  isLatest: boolean;
  payload: SpecPayload;
  authOn: boolean;
  flash?: "saved" | "locked" | null;
}) {
  const [blocks, setBlocks] = useState<CopyBlock[]>(
    payload.blocks.length ? payload.blocks : [{ panel: "front", text: "" }],
  );
  const [claims, setClaims] = useState<Claim[]>(
    payload.claims.length ? payload.claims : [{ claim: "", source: "" }],
  );
  const [dims, setDims] = useState(payload.dims);
  const [requiredText, setRequiredText] = useState(payload.requiredText.join("\n"));
  const [spotColors, setSpotColors] = useState(payload.spotColors.join(", "));

  const setBlock = (i: number, patch: Partial<CopyBlock>) =>
    setBlocks((b) => b.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setClaim = (i: number, patch: Partial<Claim>) =>
    setClaims((c) => c.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const current: SpecPayload = {
    blocks,
    claims,
    dims,
    requiredText: requiredText.split("\n"),
    spotColors: spotColors.split(",").map((s) => s.trim()),
  };
  const disabled = !authOn;

  const field =
    "mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none disabled:opacity-60";

  return (
    <div>
      {!authOn && (
        <p className="mb-4 rounded-lg border border-line bg-panel/60 px-3.5 py-2.5 text-[12px] text-muted">
          Preview — specs live in Postgres. Set <span className="font-mono text-[10.5px]">DATABASE_URL</span> and this editor goes live: every save is a new version, every lock is a receipt.
        </p>
      )}
      {flash === "saved" && (
        <p className="mb-4 rounded-lg border border-ok/35 bg-ok/10 px-3.5 py-2.5 text-[12px] text-ink">
          Saved as a new version — the old one is untouched, history intact.
        </p>
      )}
      {flash === "locked" && (
        <p className="mb-4 rounded-lg border border-ok/35 bg-ok/10 px-3.5 py-2.5 text-[12px] text-ink">
          Version locked. The audit log has your name and the timestamp; the checker now verifies against this exact truth.
        </p>
      )}

      <form action={saveSpecAction} className="grid gap-4">
        <input type="hidden" name="skuId" value={skuId} />
        <input type="hidden" name="payload" value={JSON.stringify(current)} />

        {/* ---- dims ---- */}
        <section className="card p-4">
          <p className="kicker">Dimensions &amp; dieline</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["trimW", "Trim W (in)"],
                ["trimH", "Trim H (in)"],
                ["bleed", "Bleed (in)"],
                ["safe", "Safe (in)"],
                ["dieline", "Dieline"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">{label}</span>
                <input
                  className={field}
                  disabled={disabled}
                  value={(dims[key] as string) ?? ""}
                  onChange={(e) => setDims((d) => ({ ...d, [key]: e.target.value }))}
                  placeholder={key === "dieline" ? "SR-POUCH-250 v5" : "—"}
                />
              </label>
            ))}
          </div>
        </section>

        {/* ---- copy blocks ---- */}
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <p className="kicker">Copy blocks — exact strings per panel</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setBlocks((b) => [...b, { panel: "front", text: "" }])}
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft transition-colors hover:text-ember disabled:opacity-50"
            >
              + add block
            </button>
          </div>
          <div className="mt-2 grid gap-2.5">
            {blocks.map((b, i) => (
              <div key={i} className="grid grid-cols-[110px_1fr_auto] items-start gap-2">
                <select
                  className="mt-1.5 rounded-lg border border-line bg-bg-soft/60 px-2 py-2 text-[12px] text-ink focus:border-line-strong focus:outline-none disabled:opacity-60"
                  disabled={disabled}
                  value={b.panel}
                  onChange={(e) => setBlock(i, { panel: e.target.value })}
                >
                  {PANELS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <textarea
                  className={`${field} min-h-[64px]`}
                  disabled={disabled}
                  value={b.text}
                  onChange={(e) => setBlock(i, { text: e.target.value })}
                  placeholder="Exact copy as it must appear…"
                />
                <button
                  type="button"
                  disabled={disabled || blocks.length === 1}
                  onClick={() => setBlocks((bl) => bl.filter((_, j) => j !== i))}
                  className="mt-2 font-mono text-[10px] text-soft transition-colors hover:text-alert disabled:opacity-30"
                  aria-label="remove block"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---- claims ---- */}
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <p className="kicker">Claims &amp; substantiation — every claim needs a source</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setClaims((c) => [...c, { claim: "", source: "" }])}
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft transition-colors hover:text-ember disabled:opacity-50"
            >
              + add claim
            </button>
          </div>
          <div className="mt-2 grid gap-2.5">
            {claims.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                <input
                  className={field}
                  disabled={disabled}
                  value={c.claim}
                  onChange={(e) => setClaim(i, { claim: e.target.value })}
                  placeholder="Claim as printed…"
                />
                <input
                  className={field}
                  disabled={disabled}
                  value={c.source}
                  onChange={(e) => setClaim(i, { source: e.target.value })}
                  placeholder="Substantiation (doc / study / CFR)"
                />
                <button
                  type="button"
                  disabled={disabled || claims.length === 1}
                  onClick={() => setClaims((cl) => cl.filter((_, j) => j !== i))}
                  className="mt-2 font-mono text-[10px] text-soft transition-colors hover:text-alert disabled:opacity-30"
                  aria-label="remove claim"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---- required text + spots ---- */}
        <section className="card grid gap-4 p-4 sm:grid-cols-2">
          <label className="block">
            <span className="kicker">Required text — one line per block</span>
            <textarea
              className={`${field} min-h-[110px] font-mono text-[12px]`}
              disabled={disabled}
              value={requiredText}
              onChange={(e) => setRequiredText(e.target.value)}
              placeholder={"WARNING: …\nNet Wt. 250 g (8.8 oz)"}
            />
          </label>
          <label className="block">
            <span className="kicker">Spot colors — comma separated</span>
            <input
              className={`${field} font-mono text-[12px]`}
              disabled={disabled}
              value={spotColors}
              onChange={(e) => setSpotColors(e.target.value)}
              placeholder="PMS 485 U, PMS Black U"
            />
          </label>
        </section>

        {/* ---- actions ---- */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-ember px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110 disabled:opacity-50"
          >
            Save as v{version + 1}
          </button>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
            saving never overwrites — it supersedes
          </span>
        </div>
      </form>

      {isLatest && !locked && specId && (
        <form action={lockSpecAction} className="mt-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-ember/30 bg-ember/5 px-3.5 py-3">
          <input type="hidden" name="specId" value={specId} />
          <span className="text-[12.5px] text-ink">
            Lock this version so the gate verifies against it.
          </span>
          <LockButton skuId={skuId} disabled={disabled} />
        </form>
      )}
    </div>
  );
}

function LockButton({ skuId, disabled }: { skuId: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      name="skuId"
      value={skuId}
      disabled={disabled}
      className="ml-auto rounded-lg border border-ember/50 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ember transition hover:bg-ember/10 disabled:opacity-50"
    >
      Lock version
    </button>
  );
}
