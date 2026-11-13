type IconName =
  | "brief"
  | "packcheck"
  | "vault"
  | "inbox"
  | "pulse"
  | "brain"
  | "runbook"
  | "search"
  | "alert"
  | "check"
  | "clock"
  | "file"
  | "arrow"
  | "chevron"
  | "printer"
  | "spark"
  | "plus"
  | "download"
  | "lock"
  | "external"
  | "money"
  | "truck"
  | "dot";

const paths: Record<IconName, React.ReactNode> = {
  brief: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </>
  ),
  packcheck: (
    <>
      <path d="M3.5 7.5v-2a2 2 0 0 1 2-2h2M16.5 3.5h2a2 2 0 0 1 2 2v2M20.5 16.5v2a2 2 0 0 1-2 2h-2M7.5 20.5h-2a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </>
  ),
  vault: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 8.8V7M12 17v-1.8" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 12.5h4l1.8 2.6h5.4l1.8-2.6h4" />
      <path d="M5.2 4.5h13.6l1.7 7v5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-5z" />
    </>
  ),
  pulse: <path d="M3 12.5h4l2.2-6 4.2 11.5 2.1-5.5H21" />,
  brain: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21M5.6 5.6l2.3 2.3M16.1 16.1l2.3 2.3M18.4 5.6l-2.3 2.3M7.9 16.1l-2.3 2.3" />
    </>
  ),
  runbook: (
    <>
      <path d="M9.5 6.5H21M9.5 12H21M9.5 17.5H21" />
      <path d="M3.5 6.2l1.1 1.1 2-2.1M3.5 11.8l1.1 1.1 2-2.1M3.5 17.3l1.1 1.1 2-2.1" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M15.6 15.6 20 20" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.2 21 19.5H3z" />
      <path d="M12 9.6v4.1M12 16.6v.1" />
    </>
  ),
  check: <path d="M4.5 12.6l4.6 4.6L19.5 6.8" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
  file: (
    <>
      <path d="M6 3.5h7.5L19 9v11.5H6z" />
      <path d="M13.3 3.7V9H19" />
    </>
  ),
  arrow: <path d="M4.5 12h14M12.8 6l6 6-6 6" />,
  chevron: <path d="M9 5.5l6.5 6.5L9 18.5" />,
  printer: (
    <>
      <path d="M7 8V3.8h10V8" />
      <path d="M7 17.5H4.8a1.8 1.8 0 0 1-1.8-1.8v-5.2a1.8 1.8 0 0 1 1.8-1.8h14.4a1.8 1.8 0 0 1 1.8 1.8v5.2a1.8 1.8 0 0 1-1.8 1.8H17" />
      <path d="M7 13.5h10v6.7H7z" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path d="M18.5 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14" />,
  lock: (
    <>
      <rect x="4.8" y="10" width="14.4" height="10.5" rx="2" />
      <path d="M8.4 10V7.6a3.6 3.6 0 0 1 7.2 0V10" />
    </>
  ),
  external: (
    <>
      <path d="M13.5 4.5H20v6.5" />
      <path d="M20 4.5 11 13.5" />
      <path d="M17.5 14.5v3.8a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.6" />
    </>
  ),
  money: (
    <>
      <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.2 9.4v5.2M17.8 9.4v5.2" />
    </>
  ),
  truck: (
    <>
      <path d="M2.8 6.5h10.4v9.8H2.8z" />
      <path d="M13.2 9.6h4.1l3 3.2v3.5h-7.1z" />
      <circle cx="7" cy="18.2" r="1.8" />
      <circle cx="16.8" cy="18.2" r="1.8" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />,
};

export function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 1.6,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect x="1" y="1" width="26" height="26" rx="7" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M14 5.5v5M14 17.5v5M5.5 14h5M17.5 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="14" r="3.4" fill="currentColor" />
    </svg>
  );
}
