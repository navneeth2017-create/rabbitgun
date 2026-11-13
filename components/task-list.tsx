"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import type { Task } from "@/lib/demo";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
          Queue · {done.size} of {tasks.length} cleared
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-soft">
          cleared items keep a record
        </span>
      </div>
      <div className="divide-y divide-line/60">
        {tasks.map((t) => {
          const isDone = done.has(t.id);
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-panel-2/30 ${
                isDone ? "opacity-55" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={isDone}
                aria-label={`${isDone ? "Reopen" : "Complete"} ${t.title}`}
                className={[
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
                  isDone
                    ? "border-ok/60 bg-ok/15 text-ok"
                    : "border-line-strong text-transparent hover:border-ok hover:text-ok",
                ].join(" ")}
              >
                <Icon name="check" className="h-2.5 w-2.5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{t.source}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                    {t.due}
                  </span>
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                    {t.owner}
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-[13px] text-ink ${
                    isDone ? "line-through decoration-soft/50" : ""
                  }`}
                >
                  {t.title}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{t.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
