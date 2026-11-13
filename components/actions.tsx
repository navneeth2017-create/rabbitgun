"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export function CopyButton({ text, label = "Copy draft" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
      className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      <Icon name={done ? "check" : "file"} className="h-3 w-3" />
      {done ? "Copied" : label}
    </button>
  );
}

export function ApprovalBar({
  sku,
  specVersion,
  hash = "9f2c41d8…a41",
}: {
  sku: string;
  specVersion: string;
  hash?: string;
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "held">("pending");
  const [at, setAt] = useState("");

  const stamp = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="card border-ember/25 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">Decision</p>

      {status === "pending" && (
        <>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            Approving records your name, the time, the file hash and the spec version. It does not
            email the printer — that is a separate click, and it is not wired yet.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus("approved");
                setAt(stamp());
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ember px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#241207] transition-colors hover:bg-[#f0964f]"
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Approve proof
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("held");
                setAt(stamp());
              }}
              className="rounded-lg border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-alert/40 hover:text-alert"
            >
              Hold
            </button>
          </div>
        </>
      )}

      {status === "approved" && (
        <>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] text-ok">
            <Icon name="check" className="h-4 w-4" /> Approved by Nav · {at}
          </p>
          <div className="mt-2 space-y-1 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
            <p>{sku} · spec {specVersion}</p>
            <p>sha256 {hash}</p>
          </div>
          <button
            type="button"
            onClick={() => setStatus("pending")}
            className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-soft underline-offset-2 hover:text-ember hover:underline"
          >
            Undo
          </button>
        </>
      )}

      {status === "held" && (
        <>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] text-alert">
            <Icon name="alert" className="h-4 w-4" /> Held by Nav · {at}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Proof is blocked. The printer reply goes out only after the corrections land in a new
            proof.
          </p>
          <button
            type="button"
            onClick={() => setStatus("pending")}
            className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-soft underline-offset-2 hover:text-ember hover:underline"
          >
            Undo
          </button>
        </>
      )}
    </div>
  );
}
