import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead } from "@/components/ui";
import { decisions, docs, proofs, threads } from "@/lib/demo";
import { entities } from "@/lib/portfolio";

type Hit = { group: string; title: string; meta: string; snippet: string; href: string };

const stop = new Set([
  "what", "did", "does", "we", "with", "about", "the", "for", "and", "is", "are", "was", "were",
  "this", "that", "how", "why", "when", "who", "our", "you", "from", "have", "has", "had", "can",
  "will", "should", "would", "into", "over", "under", "there", "their", "its", "it's",
]);

const synonyms: Record<string, string[]> = {
  printer: ["print", "packaging", "proof", "sunrise", "dieline", "vendor"],
  packaging: ["printer", "proof", "dieline", "spec", "pouch"],
  print: ["printer", "packaging", "proof"],
  proof: ["printer", "packaging", "dieline", "spec"],
  refund: ["refunds", "return", "returns", "chargeback"],
  shipping: ["freight", "carrier", "shipment", "delivery", "ship"],
  ship: ["freight", "carrier", "shipment", "delivery"],
  money: ["revenue", "cash", "margin", "leak", "net"],
  revenue: ["money", "sales", "net", "margin"],
  down: ["decline", "drop", "refund", "worst"],
  expires: ["expiring", "expiry", "renewal", "lapse"],
  expired: ["expiring", "expiry", "renewal", "lapse"],
  spec: ["packaging", "proof", "dieline", "copy", "version"],
  vendor: ["printer", "supplier", "sunrise", "pacific"],
  insurance: ["coi", "certificate", "liability"],
};

function search(q: string): Hit[] {
  const needle = q.toLowerCase().trim();
  if (!needle) return [];

  const words = needle
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));

  const terms = Array.from(new Set(words.flatMap((w) => [w, ...(synonyms[w] ?? [])])));
  if (terms.length === 0) terms.push(needle);

  const has = (...parts: (string | undefined)[]) => {
    const hay = parts.filter(Boolean).join(" ").toLowerCase();
    return terms.some((t) => hay.includes(t));
  };

  const hits: Hit[] = [];

  for (const d of decisions) {
    if (has(d.text, ...d.tags))
      hits.push({
        group: "Decision",
        title: d.text.slice(0, 90) + (d.text.length > 90 ? "…" : ""),
        meta: `${d.who} · ${d.when} · ${d.tags.join(", ")}`,
        snippet: "Recorded decision · cited in the brief",
        href: "/brain",
      });
  }

  for (const doc of docs) {
    if (has(doc.title, doc.linked, doc.kind))
      hits.push({
        group: "Vault",
        title: doc.title,
        meta: `${doc.kind} · ${doc.linked} · ${doc.version}`,
        snippet: doc.expires ? `Expires ${doc.expires}` : `Uploaded ${doc.uploaded}`,
        href: "/vault",
      });
  }

  for (const t of threads) {
    if (has(t.subject, t.summary, t.from, t.org))
      hits.push({
        group: "Thread",
        title: t.subject,
        meta: `${t.from} · ${t.org} · ${t.age}`,
        snippet: t.summary.slice(0, 120) + "…",
        href: "/inbox",
      });
  }

  for (const p of proofs) {
    if (has(p.product, p.sku, p.vendor))
      hits.push({
        group: "PackCheck",
        title: p.product,
        meta: `${p.sku} · proof ${p.proofVersion} · ${p.verdict}`,
        snippet: `${p.findings.length} findings · ${p.vendor}`,
        href: `/packcheck/${p.id}`,
      });
  }

  for (const e of entities) {
    if (has(e.name, e.domain, e.kind))
      hits.push({
        group: "Entity",
        title: e.name,
        meta: `${e.kind} · ${e.domain}`,
        snippet: `$${e.revenue.toLocaleString()} MTD · ${e.orders.toLocaleString()} orders`,
        href: `/pulse?e=${e.id}`,
      });
  }

  return hits;
}

const suggestions = [
  "What did we agree with Sunrise about the 250 g run?",
  "Why is Born Again down this month?",
  "What expires in the next 90 days?",
  "Which spec version was live when we approved the June reprint?",
  "Which printer has the worst error rate?",
  "What is holding the 24 Nov run?",
];

export default async function BrainPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const hits = search(query);
  const groups = Array.from(new Set(hits.map((h) => h.group)));

  return (
    <>
      <PageHeader
        kicker="Brain · everything Rabbitgun knows"
        title={
          <>
            Ask the business <span className="italic text-ember">a question.</span>
          </>
        }
        sub="Every answer cites the artifact, the date, and the person. No uncited answers — if it can't point at the source, it says so."
      />

      <form action="/brain" className="card p-2">
        <label className="flex items-center gap-2.5 px-2">
          <span className="text-ember">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Try: what did we agree with the printer about the 250 g run?"
            className="w-full bg-transparent py-2.5 text-[13px] text-ink placeholder:text-soft focus:outline-none"
          />
          <button className="rounded-md bg-ember px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-on-accent)]">
            Search
          </button>
        </label>
      </form>

      {!query && (
        <>
          <section className="mt-4">
            <SectionHead title="Start with" />
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Link
                  key={s}
                  href={`/brain?q=${encodeURIComponent(s)}`}
                  className="rounded-full border border-line bg-panel/50 px-3 py-1.5 text-[11.5px] text-muted transition-colors hover:border-ember/35 hover:text-ink"
                >
                  {s}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_340px]">
            <section className="card overflow-hidden">
              <div className="border-b border-line px-4 py-3">
                <SectionHead title="Recent decisions" />
              </div>
              <div className="divide-y divide-line/60">
                {decisions.map((d) => (
                  <div key={d.id} className="px-4 py-3.5">
                    <p className="text-[12.5px] leading-relaxed text-muted">{d.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                      <span className="text-ink">{d.who}</span>
                      <span className="h-2.5 w-px bg-line" />
                      <span>{d.when}</span>
                      <span className="h-2.5 w-px bg-line" />
                      {d.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="card p-4">
                <SectionHead title="What it knows" />
                <div className="space-y-2">
                  {[
                    ["Documents", "148"],
                    ["Decisions", "96"],
                    ["Threads", "1,204"],
                    ["Specs + proofs", "41"],
                    ["Entities", "7"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[11.5px] text-muted">{k}</span>
                      <span className="tabular font-mono text-[11px] text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ember/15 text-ember">
                    <Icon name="brain" className="h-3.5 w-3.5" />
                  </span>
                  <SectionHead title="Through Jarvis" />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  The same index answers out loud. Jarvis calls{" "}
                  <span className="font-mono text-[10px] text-ink">/api/jarvis/brief</span> for
                  numbers and this search for context.
                </p>
                <p className="mt-2 rounded-lg border border-line/70 bg-bg-soft/40 px-2.5 py-2 font-mono text-[10.5px] text-muted">
                  “Jarvis, did the new boxes pass?”
                </p>
              </section>
            </aside>
          </div>
        </>
      )}

      {query && (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-soft">
              {hits.length} {hits.length === 1 ? "source" : "sources"} for
            </span>
            <span className="font-mono text-[11px] text-ink">“{query}”</span>
            <Link
              href="/brain"
              className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-soft hover:text-ember"
            >
              Clear
            </Link>
          </div>

          {hits.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[13px] text-ink">Nothing in the index matches that.</p>
              <p className="mx-auto mt-1.5 max-w-md text-[11.5px] leading-relaxed text-muted">
                It won&apos;t guess. Either the artifact isn&apos;t in the Vault yet, or the question
                needs different words — try an entity, a vendor, or an SKU.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.slice(0, 3).map((s) => (
                  <Link
                    key={s}
                    href={`/brain?q=${encodeURIComponent(s)}`}
                    className="rounded-full border border-line bg-panel/50 px-3 py-1.5 text-[11px] text-muted hover:border-ember/35 hover:text-ink"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <section key={g} className="card overflow-hidden">
                  <div className="border-b border-line px-4 py-2.5">
                    <SectionHead title={`${g} · ${hits.filter((h) => h.group === g).length}`} />
                  </div>
                  <div className="divide-y divide-line/60">
                    {hits
                      .filter((h) => h.group === g)
                      .map((h, i) => (
                        <Link
                          key={`${h.group}-${i}`}
                          href={h.href}
                          className="group block px-4 py-3 transition-colors hover:bg-panel-2/40"
                        >
                          <p className="text-[12.5px] text-ink group-hover:text-ember">{h.title}</p>
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                            {h.meta}
                          </p>
                          <p className="mt-1 text-[11px] text-muted">{h.snippet}</p>
                        </Link>
                      ))}
                  </div>
                </section>
              ))}
              <p className="px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                Every hit links to the original artifact. Nothing is summarized without a source.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
