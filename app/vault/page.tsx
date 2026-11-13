import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader, SectionHead, Stat } from "@/components/ui";
import { docs } from "@/lib/demo";

const kinds = ["All", "Spec", "Contract", "Certificate", "COI", "Lab result", "Dieline", "Tax", "Insurance"];

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const rows = k && k !== "All" ? docs.filter((d) => d.kind === k) : docs;

  return (
    <>
      <PageHeader
        kicker="Vault · 148 documents · 7 entities"
        title={
          <>
            If losing it would hurt, <span className="italic text-ember">it lives here.</span>
          </>
        }
        sub="Every approved spec, contract, certificate and lab result — versioned, hashed, searchable, and backed up nightly. Nothing is ever overwritten."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:bg-ember/15">
            <Icon name="plus" className="h-3 w-3" /> Add document
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Documents" value="148" delta="12 versions superseded" />
        <Stat label="Expiring in 90 days" value="2" delta="1 needs action now" good={false} />
        <Stat label="Restricted" value="2" delta="owner only" />
        <Stat label="Backup" value="B2 · nightly" delta="last run 04:12 · verified" />
      </div>

      <section className="card mt-4 border-warn/25 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-warn">
            <Icon name="clock" className="h-4 w-4" />
          </span>
          <p className="text-[12.5px] text-ink">
            Certificate of insurance for Sunrise Packaging expires <strong>2 Dec 2026</strong>.
          </p>
          <p className="text-[11.5px] text-muted">
            The supply agreement requires 30 days&apos; notice of lapse. Request the renewal now or
            the 18 Nov fill slot is exposed.
          </p>
          <Link
            href="/runbook"
            className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-ember"
          >
            Open task
          </Link>
        </div>
      </section>

      <div className="scroll-thin mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {kinds.map((kind) => {
          const active = (k ?? "All") === kind;
          return (
            <Link
              key={kind}
              href={kind === "All" ? "/vault" : `/vault?k=${encodeURIComponent(kind)}`}
              className={[
                "whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-ember/45 bg-ember/12 text-ember"
                  : "border-line bg-panel/50 text-soft hover:border-line-strong hover:text-ink",
              ].join(" ")}
            >
              {kind}
            </Link>
          );
        })}
      </div>

      <section className="card mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <SectionHead title={`${k && k !== "All" ? k : "All documents"} · ${rows.length} of 148`} />
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
            newest first
          </span>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line/70">
                {["Document", "Kind", "Linked to", "Version", "Uploaded", "Expires", "State"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-soft"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  className="group border-b border-line/50 transition-colors last:border-0 hover:bg-panel-2/40"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-soft group-hover:text-ember">
                        <Icon name={d.restricted ? "lock" : "file"} className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12.5px] text-ink">{d.title}</span>
                      {d.restricted && <span className="chip">restricted</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="chip">{d.kind}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-muted">{d.linked}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-muted">{d.version}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-muted">{d.uploaded}</td>
                  <td
                    className={`px-4 py-2.5 font-mono text-[10px] ${
                      d.status === "expiring" ? "text-warn" : "text-muted"
                    }`}
                  >
                    {d.expires ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] ${
                        d.status === "current"
                          ? "text-ok"
                          : d.status === "expiring"
                            ? "text-warn"
                            : "text-soft"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          d.status === "current"
                            ? "bg-ok"
                            : d.status === "expiring"
                              ? "bg-warn"
                              : "bg-soft"
                        }`}
                      />
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Immutable versions", "A new upload supersedes. The old one stays retrievable forever, with who and why."],
          ["Every download logged", "Who, when, which version. Matters in a vendor dispute and in diligence."],
          ["Auto-filed from email", "Forward a document to vault@rabbitgun.com and it lands tagged, dated, and hashed."],
        ].map(([t, d]) => (
          <div key={t} className="card-flat px-4 py-3">
            <p className="text-[12px] text-ink">{t}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
    </>
  );
}
