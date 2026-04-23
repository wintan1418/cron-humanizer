"use client";

import type { Format } from "@/lib/formatters";

interface FormatTabsProps {
  formats: Format[];
  active: string;
  onChange: (id: string) => void;
}

export function FormatTabs({ formats, active, onChange }: FormatTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Output formats"
      className="-mx-[var(--gutter-page)] overflow-x-auto px-[var(--gutter-page)]"
    >
      <div className="flex min-w-max gap-6 border-b border-[var(--rule)]">
        {formats.map((f) => {
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${f.id}`}
              id={`tab-${f.id}`}
              onClick={() => onChange(f.id)}
              className={[
                "eyebrow -mb-px border-b-2 px-1 py-3 transition-colors",
                isActive
                  ? "border-[var(--accent)] text-[var(--ink)]"
                  : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {f.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
