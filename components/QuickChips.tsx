"use client";

interface QuickChipsProps {
  currentExpr: string;
  onPick: (cron: string) => void;
}

interface Chip {
  label: string;
  cron: string;
}

// Normalize whitespace so '*  *  * * *' matches '* * * * *'.
const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

const CHIPS: Chip[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Weekdays 9am", cron: "0 9 * * 1-5" },
  { label: "Mondays noon", cron: "0 12 * * 1" },
  { label: "First of month", cron: "0 0 1 * *" },
  { label: "Every 15 min 9–5", cron: "*/15 9-17 * * 1-5" },
];

export function QuickChips({ currentExpr, onPick }: QuickChipsProps) {
  const current = normalize(currentExpr);

  return (
    <div
      role="group"
      aria-label="Quick presets"
      className="flex flex-wrap gap-2"
    >
      {CHIPS.map((chip) => {
        const isActive = normalize(chip.cron) === current;
        return (
          <button
            key={chip.cron}
            type="button"
            aria-pressed={isActive}
            onClick={() => onPick(chip.cron)}
            className={[
              "rounded-full border px-3 py-1.5",
              "font-[family-name:var(--font-jetbrains)] text-[12px] tracking-[0.08em]",
              "transition-colors duration-150",
              isActive
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                : "border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
