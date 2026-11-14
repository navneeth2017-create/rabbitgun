import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { allNotes, recentChats, type ChatLine, type Note } from "@/lib/private";

export const dynamic = "force-dynamic";

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });

/** Preview mode stand-ins — the shape of the real feed, frozen. */
const demoNotes: (Note & { user_name: string })[] = [
  { id: "t1", user_id: "tom", user_name: "Tom", title: "Printer contacts", body: "Sunrise — Kerri direct line, answers before 9am. Backup press: Lakeside. Don't text after hours, she calls back mornings.", tags: ["printers"], created_at: "2026-11-12T15:00:00Z" },
  { id: "t2", user_id: "tom", user_name: "Tom", title: "Fill-line booking window", body: "Kerri holds the 18th for us, needs approval by Monday or it slips to December.", tags: ["schedule"], created_at: "2026-11-11T15:00:00Z" },
  { id: "t3", user_id: "tom", user_name: "Tom", title: "Warning block wording I reuse", body: "The 6 pt language that passed legal twice — saved so I stop rewriting it.", tags: ["copy"], created_at: "2026-11-09T15:00:00Z" },
  { id: "dn1", user_id: "dante", user_name: "Dante", title: "Route notes — west valley", body: "Two stores moved delivery to Thursdays. Addy truck has the capacity.", tags: ["dsd"], created_at: "2026-11-10T15:00:00Z" },
  { id: "nv1", user_id: "nav", user_name: "Nav", title: "WGC audit notes", body: "The 'focus without a prescription' line needs a substantiation doc before next run.", tags: ["wgc"], created_at: "2026-11-08T15:00:00Z" },
];

const demoChats: ChatLine[] = [
  { id: "c1", user_id: "tom", user_name: "Tom", topic: "Why the 250 g proof failed", summary: "Asked for the UPC blocker in plain words; walked through wrong GTIN → wrong SKU at the register. Wanted to know if the printer can fix it same-day.", at: "2026-11-12T16:20:00Z" },
  { id: "c2", user_id: "tom", user_name: "Tom", topic: "Reply to Kerri", summary: "Drafted the fill-line confirmation email. Held sending until Nav approves — asked whether he should just send it.", at: "2026-11-11T09:05:00Z" },
  { id: "c3", user_id: "dante", user_name: "Dante", topic: "Quiet stores", summary: "Asked which stores went quiet this week and what the pattern was (one account, 11 days no order).", at: "2026-11-10T17:45:00Z" },
];

export default async function AtlasPage() {
  const authOn = authEnabled();
  const user = authOn ? await getCurrentUser() : null;

  // Owner's eyes only. In preview mode (no auth yet) the room renders as a demo.
  if (authOn && user?.role !== "owner") notFound();

  const notes = authOn ? await allNotes() : demoNotes;
  const chats = authOn ? await recentChats() : demoChats;

  const people = ["Tom", "Dante", "Nav"];
  const byPerson = people.map((name) => {
    const theirs = notes.filter((n) => n.user_name === name);
    return { name, count: theirs.length, latest: theirs[0] ?? null };
  });

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-end justify-between gap-3 pb-6">
        <div>
          <p className="kicker">Oversight · the owner&apos;s room</p>
          <h1 className="font-display text-[30px] font-medium tracking-tight text-ink">Atlas</h1>
          <p className="mt-1 max-w-xl text-[13.5px] text-muted">
            Everyone gets a private room. This is the one place that sees across all of them —
            what each person saved and what they talk about with the AI.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-ember/40 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ember">
          <Icon name="lock" className="h-3.5 w-3.5" /> nav only {authOn ? "" : "· sample"}
        </span>
      </header>

      {/* ---- per person ---- */}
      <div className="grid gap-3 sm:grid-cols-3">
        {byPerson.map((p) => (
          <div key={p.name} className="card px-4 py-3.5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">{p.name}</p>
              <span className="font-mono text-[10px] text-soft">{p.count} saved</span>
            </div>
            {p.latest ? (
              <div className="mt-2.5 border-t border-line pt-2.5">
                <p className="text-[12.5px] text-ink">{p.latest.title || "untitled"}</p>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted">{p.latest.body}</p>
                <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-soft">
                  latest · {dateFmt(p.latest.created_at)}
                </p>
              </div>
            ) : (
              <p className="mt-2.5 border-t border-line pt-2.5 text-[11.5px] text-soft">nothing yet</p>
            )}
          </div>
        ))}
      </div>

      {/* ---- AI conversations ---- */}
      <section className="mt-5">
        <p className="kicker px-0.5 pb-2">What they&apos;re talking about — with the AI</p>
        <div className="card overflow-hidden">
          {chats.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted">
              Nothing yet — conversations land here once Jarvis feeds them through.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {chats.map((c) => (
                <li key={c.id} className="px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] text-ink">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ember">{c.user_name}</span>
                      <span className="mx-2 text-soft">·</span>
                      {c.topic}
                    </p>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
                      {dateFmt(c.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{c.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!authOn && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
            sample data · live feed arrives when jarvis posts conversations to /api/jarvis/*
          </p>
        )}
      </section>

      {/* ---- the contract ---- */}
      <section className="card mt-5 px-4 py-4">
        <p className="kicker">The privacy contract — the exact words, enforced by queries</p>
        <div className="mt-2.5 grid gap-2.5 text-[12.5px] leading-relaxed text-muted">
          <p>
            What each person is told, and it&apos;s true:{" "}
            <span className="text-ink">&ldquo;Your private room is yours — no one in the company can see it.
            The one exception is Nav, the owner, who can see everything. That&apos;s the house rule.&rdquo;</span>
          </p>
          <p>
            How it&apos;s kept: visibility lives in the database queries, not in promises — a person&apos;s
            query can only return their own rows. The only query that reads across people is this room,
            and this room 404s for anyone whose role isn&apos;t <span className="font-mono text-[10.5px]">owner</span>.
          </p>
          <p>
            Notes are never written to the public audit log. Locks, approvals and logins are receipts the
            whole team sees; what a person keeps private stays private from them — not from you.
          </p>
        </div>
      </section>
    </div>
  );
}
