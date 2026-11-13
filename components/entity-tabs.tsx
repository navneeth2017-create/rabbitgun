import Link from "next/link";
import { entities } from "@/lib/portfolio";

const short: Record<string, string> = {
  addy: "Addy DSD",
  hellagood: "Hella Good",
  bornagain: "Born Again",
  monarch: "Monarch",
  rawcoffee: "Raw Coffee",
  wgc: "WGC Paddy",
  wowcow: "WowCow",
};

export function EntityTabs({ base, current }: { base: string; current?: string }) {
  return (
    <div className="scroll-thin -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
      <Link
        href={base}
        className={[
          "whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
          !current
            ? "border-ember/45 bg-ember/12 text-ember"
            : "border-line bg-panel/50 text-soft hover:border-line-strong hover:text-ink",
        ].join(" ")}
      >
        All · 7
      </Link>
      {entities.map((e) => {
        const active = current === e.id;
        return (
          <Link
            key={e.id}
            href={`${base}?e=${e.id}`}
            className={[
              "whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
              active
                ? "border-ember/45 bg-ember/12 text-ember"
                : "border-line bg-panel/50 text-soft hover:border-line-strong hover:text-ink",
            ].join(" ")}
          >
            {short[e.id] ?? e.name}
          </Link>
        );
      })}
    </div>
  );
}
