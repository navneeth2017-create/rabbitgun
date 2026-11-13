import Link from "next/link";
import type { Severity } from "@/lib/demo";
import { Icon } from "@/components/icons";

export function PageHeader({
  kicker,
  title,
  sub,
  actions,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker mb-2">{kicker}</p>
        <h1 className="font-display text-[30px] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[36px]">
          {title}
        </h1>
        {sub && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const sevStyles: Record<Severity, { label: string; cls: string; dot: string }> = {
  blocker: {
    label: "Blocker",
    cls: "border-alert/40 bg-alert/10 text-alert",
    dot: "bg-alert",
  },
  warning: {
    label: "Warning",
    cls: "border-warn/40 bg-warn/10 text-warn",
    dot: "bg-warn",
  },
  note: {
    label: "Note",
    cls: "border-info/40 bg-info/10 text-info",
    dot: "bg-info",
  },
};

export function SeverityChip({ severity }: { severity: Severity }) {
  const s = sevStyles[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Verdict({ verdict }: { verdict: "HOLD" | "PASS WITH NOTES" | "PASS" }) {
  const map = {
    HOLD: "border-alert/40 bg-alert/10 text-alert",
    "PASS WITH NOTES": "border-warn/40 bg-warn/10 text-warn",
    PASS: "border-ok/40 bg-ok/10 text-ok",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${map[verdict]}`}
    >
      {verdict}
    </span>
  );
}

export function Stat({
  label,
  value,
  delta,
  good = true,
}: {
  label: string;
  value: string;
  delta?: string;
  good?: boolean;
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">{label}</p>
      <p className="tabular mt-1.5 font-display text-[24px] leading-none text-ink">{value}</p>
      {delta && (
        <p className={`mt-1.5 font-mono text-[10px] ${good ? "text-ok" : "text-warn"}`}>{delta}</p>
      )}
    </div>
  );
}

export function Sparkline({
  data,
  className = "h-16 w-full",
  stroke = "var(--color-ember)",
}: {
  data: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 200;
  const h = 56;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark)" />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SectionHead({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-soft">{title}</h2>
      {right}
    </div>
  );
}

export function LinkRow({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-ink"
    >
      {children}
      <Icon
        name="arrow"
        className="h-3.5 w-3.5 text-soft transition-transform group-hover:translate-x-0.5 group-hover:text-ember"
      />
    </Link>
  );
}

export function Tone({
  tone,
  children,
}: {
  tone: "alert" | "warn" | "info";
  children: React.ReactNode;
}) {
  const map = {
    alert: "text-alert",
    warn: "text-warn",
    info: "text-info",
  } as const;
  return <span className={map[tone]}>{children}</span>;
}
