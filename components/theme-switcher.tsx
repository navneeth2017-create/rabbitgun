"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

export const themes = [
  {
    id: "ember",
    name: "Ember",
    note: "Monarch default",
    bg: "#14110e",
    accent: "#e8873b",
  },
  {
    id: "dusk",
    name: "Dusk",
    note: "Cool graphite + blue",
    bg: "#0d1117",
    accent: "#7aa2f7",
  },
  {
    id: "moss",
    name: "Moss",
    note: "Deep green + moss",
    bg: "#0c120e",
    accent: "#a8c66c",
  },
  {
    id: "paper",
    name: "Paper",
    note: "Light, warm, print-like",
    bg: "#f4eee2",
    accent: "#b4531f",
  },
  {
    id: "mono",
    name: "Mono",
    note: "Editorial black + white",
    bg: "#0a0a0a",
    accent: "#f5f5f2",
  },
  {
    id: "lite",
    name: "Lite",
    note: "Calm light · less noise",
    bg: "#f6f5f1",
    accent: "#5e7f9b",
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("ember");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as ThemeId | undefined;
    if (current && themes.some((t) => t.id === current)) setTheme(current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const apply = (id: ThemeId) => {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("rabbitgun.theme", id);
    } catch {
      /* private mode — the theme just won't persist */
    }
    setTheme(id);
    setOpen(false);
  };

  const active = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Theme: ${active.name}`}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-panel/60 px-2 py-1.5 text-soft transition-colors hover:border-line-strong hover:text-ink"
      >
        <Icon name="palette" className="h-3.5 w-3.5" />
        <span
          className="h-2 w-2 rounded-full border border-black/20 bg-ember"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Theme"
          className="rise absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-line bg-panel shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
        >
          <p className="border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-soft">
            Skin
          </p>
          <div className="p-1">
            {themes.map((t) => {
              const isActive = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => apply(t.id)}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                    isActive ? "bg-panel-2" : "hover:bg-panel-2/60",
                  ].join(" ")}
                >
                  <span
                    className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md border border-line"
                    style={{ background: t.bg }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: t.accent }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-ink">{t.name}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                      {t.note}
                    </span>
                  </span>
                  {isActive && (
                    <span className="text-ember">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
