"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/icons";

const people = [
  { user: "nav", initial: "N", name: "Nav", role: "owner" },
  { user: "dante", initial: "D", name: "Dante", role: "member" },
  { user: "tom", initial: "T", name: "Tom", role: "member" },
];

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<string>(people[0].user);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !body?.ok) {
      setError(body?.error ?? "Sign-in failed.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="text-ember">
            <Mark className="h-7 w-7" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
              Rabbitgun
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
              private · login only
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="card p-5">
          <p className="kicker">Who&apos;s signing in</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {people.map((p) => {
              const active = p.user === user;
              return (
                <button
                  key={p.user}
                  type="button"
                  onClick={() => setUser(p.user)}
                  className={[
                    "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 transition-colors",
                    active
                      ? "border-ember/50 bg-ember/10 text-ink"
                      : "border-line text-muted hover:border-line-strong",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px]",
                      active ? "border-ember/50 bg-ember/15 text-ember" : "border-line bg-panel-2 text-muted",
                    ].join(" ")}
                  >
                    {p.initial}
                  </span>
                  <span className="text-[11px]">{p.name}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="kicker">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-lg border border-alert/35 bg-alert/10 px-3 py-2 text-[11.5px] text-alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-ember px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Checking…" : "Open the dashboard"}
          </button>

          <p className="mt-3 text-center font-mono text-[8.5px] uppercase tracking-[0.12em] text-soft">
            three humans · no signup · every login recorded
          </p>
        </form>
      </div>
    </main>
  );
}
