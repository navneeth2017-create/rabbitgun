"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/command-palette";
import { Icon, Mark } from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { portfolio } from "@/lib/portfolio";

type Item = {
  href: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  count?: number;
};

const primary: Item[] = [
  { href: "/", label: "Brief", icon: "brief" },
  { href: "/packcheck", label: "PackCheck", icon: "packcheck", count: 2 },
  { href: "/inbox", label: "Inbox", icon: "inbox", count: 4 },
  { href: "/runbook", label: "Runbook", icon: "runbook", count: 3 },
];

const numbers: Item[] = [
  { href: "/pulse", label: "Pulse", icon: "pulse" },
  { href: "/money", label: "Money", icon: "money", count: 6 },
  { href: "/freight", label: "Freight", icon: "truck", count: 6 },
];

const system: Item[] = [
  { href: "/vault", label: "Vault", icon: "vault", count: 148 },
  { href: "/approvals", label: "Approvals", icon: "check" },
  { href: "/brain", label: "Brain", icon: "brain" },
];

function NavLink({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors",
        active
          ? "bg-panel-2 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "text-muted hover:bg-panel/70 hover:text-ink",
      ].join(" ")}
    >
      <span className={active ? "text-ember" : "text-soft group-hover:text-muted"}>
        <Icon name={item.icon} className="h-[17px] w-[17px]" />
      </span>
      <span className="flex-1">{item.label}</span>
      {item.count !== undefined && (
        <span
          className={[
            "tabular font-mono text-[10px]",
            active ? "text-ember" : "text-soft",
          ].join(" ")}
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { name: string; role: string } | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="scroll-thin sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-line bg-bg-soft/60 px-3.5 py-4 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-1.5 pb-5">
          <span className="text-ember">
            <Mark className="h-7 w-7" />
          </span>
          <span>
            <span className="block font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink">
              Rabbitgun
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-soft">
              Monarch ops
            </span>
          </span>
        </Link>

        <p className="kicker px-2.5 pb-1.5">Now</p>
        <nav className="flex flex-col gap-0.5">
          {primary.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <p className="kicker px-2.5 pb-1.5 pt-5">Numbers</p>
        <nav className="flex flex-col gap-0.5">
          {numbers.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <p className="kicker px-2.5 pb-1.5 pt-5">System</p>
        <nav className="flex flex-col gap-0.5">
          {system.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <div className="mt-auto shrink-0 space-y-2.5 pt-5">
          <div className="flex items-center justify-between rounded-lg border border-line bg-panel/50 px-2.5 py-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
              Portfolio
            </span>
            <span className="flex items-baseline gap-1.5 font-mono text-[10px] text-ink">
              ${portfolio.revenue.toLocaleString()}
              <span className="text-[9px] text-ok">+11.2%</span>
            </span>
          </div>

          <div className="rounded-lg border border-line bg-panel/50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Home box</span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                online
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-soft">Jarvis</span>
              <span className="font-mono text-[9px] text-muted">linked</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            {[
              { i: "N", name: "Nav" },
              { i: "D", name: "Dante" },
              { i: "T", name: "Tom" },
            ].map((p) => (
              <span
                key={p.i}
                title={p.name}
                className={[
                  "grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px]",
                  user?.name === p.name
                    ? "border-ember/50 bg-ember/15 text-ember"
                    : "border-line bg-panel-2 text-muted",
                ].join(" ")}
              >
                {p.i}
              </span>
            ))}
            <span className="ml-auto font-mono text-[9px] text-soft">v0.1</span>
          </div>

          {user ? (
            <form action="/api/auth/logout" method="post" className="flex items-center justify-between px-1 pt-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                {user.name} · {user.role}
              </span>
              <button
                type="submit"
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-soft transition-colors hover:text-ember"
              >
                sign out
              </button>
            </form>
          ) : (
            <p className="px-1 pt-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-soft">
              preview · auth off
            </p>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-ember lg:hidden">
              <Mark className="h-6 w-6" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                Rabbitgun
              </span>
            </Link>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("rabbitgun:palette"))}
              className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-lg border border-line bg-panel/60 px-2.5 py-1.5 text-left text-[12px] text-soft transition-colors hover:border-line-strong sm:flex"
            >
              <Icon name="search" className="h-3.5 w-3.5" />
              <span className="flex-1 truncate">Search the vault, threads, specs, decisions…</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-soft">⌘K</span>
            </button>

            <div className="ml-auto flex items-center gap-3 sm:ml-0">
              <ThemeSwitcher />
              <span className="hidden rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-warn md:inline">
                sample data
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-soft md:inline">
                Fri 13 Nov
              </span>
              <span className="hidden h-4 w-px bg-line md:block" />
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                synced
              </span>
            </div>
          </div>

          <nav className="scroll-thin flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 lg:hidden">
            {[...primary, ...numbers, ...system].map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "whitespace-nowrap rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
                    active ? "bg-panel-2 text-ember" : "text-soft",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={pathname} className="rise">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
