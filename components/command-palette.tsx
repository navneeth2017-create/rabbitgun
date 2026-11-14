"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { proofs, tasks } from "@/lib/demo";
import { entities } from "@/lib/portfolio";
import { themes, type ThemeId } from "@/components/theme-switcher";

type Item = {
  id: string;
  group: string;
  label: string;
  hint: string;
  icon: IconName;
  href?: string;
  run?: () => void;
};

const pages: { label: string; hint: string; href: string; icon: IconName }[] = [
  { label: "Brief", hint: "the morning read", href: "/", icon: "brief" },
  { label: "PackCheck", hint: "proofs and findings", href: "/packcheck", icon: "packcheck" },
  { label: "Specs", hint: "the locked truth the gate checks against", href: "/specs", icon: "file" },
  { label: "Inbox", hint: "threads that move money", href: "/inbox", icon: "inbox" },
  { label: "Runbook", hint: "obligations and owners", href: "/runbook", icon: "runbook" },
  { label: "Vault", hint: "every document", href: "/vault", icon: "vault" },
  { label: "Approvals", hint: "who approved what, and when", href: "/approvals", icon: "check" },
  { label: "Pulse", hint: "revenue by entity", href: "/pulse", icon: "pulse" },
  { label: "Money", hint: "flow and leaks", href: "/money", icon: "money" },
  { label: "Freight", hint: "every box, every mile", href: "/freight", icon: "truck" },
  { label: "Brain", hint: "search everything", href: "/brain", icon: "brain" },
];

function setTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem("rabbitgun.theme", id);
  } catch {
    /* ignore */
  }
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("rabbitgun:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("rabbitgun:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  const needle = q.trim().toLowerCase();
  const match = (...parts: string[]) =>
    !needle || parts.some((p) => p.toLowerCase().includes(needle));

  const items: Item[] = [];

  if (match("search everything", "brain", "vault")) {
    items.push({
      id: "search",
      group: "Search",
      label: needle ? `Search everything for “${q.trim()}”` : "Search the whole business",
      hint: "vault · threads · specs · decisions",
      icon: "search",
      href: needle ? `/brain?q=${encodeURIComponent(q.trim())}` : "/brain",
    });
  }

  for (const p of pages) {
    if (match(p.label, p.hint)) {
      items.push({
        id: `page-${p.href}`,
        group: "Go to",
        label: p.label,
        hint: p.hint,
        icon: p.icon,
        href: p.href,
      });
    }
  }

  for (const proof of proofs) {
    if (match(proof.product, proof.sku, proof.vendor, "proof", "packaging")) {
      items.push({
        id: `proof-${proof.id}`,
        group: "Proofs",
        label: proof.product,
        hint: `${proof.sku} · ${proof.verdict} · ${proof.findings.length} findings`,
        icon: "packcheck",
        href: `/packcheck/${proof.id}`,
      });
    }
  }

  for (const task of tasks) {
    if (match(task.title, task.source, task.owner)) {
      items.push({
        id: `task-${task.id}`,
        group: "Work",
        label: task.title,
        hint: `${task.source} · ${task.owner} · ${task.due}`,
        icon: "runbook",
        href: "/runbook",
      });
    }
  }

  for (const entity of entities) {
    if (match(entity.name, entity.kind, entity.domain)) {
      items.push({
        id: `entity-${entity.id}`,
        group: "Entities",
        label: entity.name,
        hint: `${entity.kind} · $${entity.revenue.toLocaleString()} MTD`,
        icon: "pulse",
        href: `/pulse?e=${entity.id}`,
      });
    }
  }

  for (const t of themes) {
    if (match(t.name, "theme", "skin", "colour", "color")) {
      items.push({
        id: `theme-${t.id}`,
        group: "Skin",
        label: `Switch to ${t.name}`,
        hint: t.note,
        icon: "palette",
        run: () => setTheme(t.id),
      });
    }
  }

  const run = (item: Item) => {
    setOpen(false);
    if (item.run) item.run();
    else if (item.href) router.push(item.href);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (items[active]) run(items[active]);
        else if (needle) {
          setOpen(false);
          router.push(`/brain?q=${encodeURIComponent(q.trim())}`);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!open) return;
    document.getElementById(`palette-item-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[12vh] sm:pt-[15vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[3px]"
      />

      <div className="rise relative w-full max-w-xl overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
        <label className="flex items-center gap-2.5 border-b border-line px-3.5 py-3">
          <span className="text-ember">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a room, an entity, an SKU, or a skin…"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-soft focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-soft">
            esc
          </kbd>
        </label>

        <div className="scroll-thin max-h-[52vh] overflow-y-auto p-1.5">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-[12px] text-soft">
              No match. Press Enter to search the Brain instead.
            </p>
          )}

          {items.map((item, i) => {
            const heading = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <div key={item.id}>
                {heading && (
                  <p className="px-2.5 pb-1 pt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
                    {heading}
                  </p>
                )}
                <button
                  type="button"
                  id={`palette-item-${i}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => run(item)}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    i === active ? "bg-panel-2" : "hover:bg-panel-2/50",
                  ].join(" ")}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                      i === active
                        ? "border-ember/40 bg-ember/10 text-ember"
                        : "border-line text-soft"
                    }`}
                  >
                    <Icon name={item.icon} className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-ink">{item.label}</span>
                    <span className="block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                      {item.hint}
                    </span>
                  </span>
                  {i === active && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
                      ↵
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span className="ml-auto">⌘K anywhere</span>
        </div>
      </div>
    </div>
  );
}
