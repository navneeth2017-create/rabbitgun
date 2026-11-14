import { Icon } from "@/components/icons";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { myNotes, type Note } from "@/lib/private";
import { addNoteAction } from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });

export default async function PrivatePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  const authOn = authEnabled();
  const user = authOn ? await getCurrentUser() : null;
  const notes: Note[] = authOn && user ? await myNotes(user) : [
    { id: "d1", user_id: "demo", title: "Printer contacts", body: "Sunrise — Kerri direct line, answers before 9am. Backup press: Lakeside.", tags: ["printers"], created_at: "2026-11-12T15:00:00Z" },
    { id: "d2", user_id: "demo", title: "Warning block wording I reuse", body: "The 6 pt warning block language that passed legal twice — saved so I stop rewriting it.", tags: ["copy"], created_at: "2026-11-09T15:00:00Z" },
  ];

  const who = user ? user.name : "you";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-3 pb-6">
        <div>
          <p className="kicker">Private room · {who}</p>
          <h1 className="font-display text-[30px] font-medium tracking-tight text-ink">Private</h1>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
          <Icon name="lock" className="h-3.5 w-3.5" /> {authOn ? "yours only" : "sample data"}
        </span>
      </header>

      <p className="card mb-5 flex items-start gap-3 px-4 py-3.5 text-[12.5px] leading-relaxed text-muted">
        <span className="mt-0.5 text-ember"><Icon name="lock" className="h-4 w-4" /></span>
        <span>
          This room is <span className="text-ink">yours alone</span> — Dante can&apos;t see any of it, and
          it never leaves the dashboard. One exception, stated up front:{" "}
          <span className="text-ink">Nav, as the owner, can see everything saved here</span> and what
          you talk about with the AI. That&apos;s the house rule, and the AI will tell you the same.
        </span>
      </p>

      {sp.saved && (
        <p className="mb-4 rounded-lg border border-ok/35 bg-ok/10 px-3.5 py-2.5 text-[12px] text-ink">
          Saved. Only you (and Nav) can read it.
        </p>
      )}
      {!authOn && (
        <p className="mb-4 rounded-lg border border-line bg-panel/60 px-3.5 py-2.5 text-[12px] text-muted">
          Preview — connect Postgres and this becomes your real private vault.
        </p>
      )}

      {/* ---- composer ---- */}
      <form action={addNoteAction} className="card mb-5 grid gap-3 p-4">
        <label className="block">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Title (optional)</span>
          <input name="title" placeholder="What is this about" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
        </label>
        <label className="block">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Note</span>
          <textarea name="body" required rows={4} placeholder="Anything you want kept between you and the dashboard…" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[13px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
        </label>
        <div className="flex items-end gap-3">
          <label className="block flex-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Tags (comma separated)</span>
            <input name="tags" placeholder="printers, copy" className="mt-1.5 w-full rounded-lg border border-line bg-bg-soft/60 px-3 py-2 text-[12.5px] text-ink placeholder:text-soft focus:border-line-strong focus:outline-none" />
          </label>
          <button type="submit" disabled={!authOn} className="rounded-lg bg-ember px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-on-accent)] transition hover:brightness-110 disabled:opacity-50">
            Save private
          </button>
        </div>
      </form>

      {/* ---- notes ---- */}
      <div className="grid gap-2.5">
        {notes.length === 0 ? (
          <p className="card px-4 py-8 text-center text-[13px] text-muted">Nothing saved yet.</p>
        ) : (
          notes.map((n) => (
            <article key={n.id} className="card px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13.5px] text-ink">{n.title || <span className="text-soft">untitled</span>}</h3>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
                  {dateFmt(n.created_at)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-muted">{n.body}</p>
              {n.tags.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-soft">
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
