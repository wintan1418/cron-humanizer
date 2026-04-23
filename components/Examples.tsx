"use client";

interface ExamplesProps {
  onPick: (cron: string) => void;
}

interface Recipe {
  description: string;
  cron: string;
  note?: string;
}

// Recipes follow CRON_TOOL_BRIEF §3.3. Last-day and first-Monday are kept
// honest about their limitations per the brief.
const RECIPES: Recipe[] = [
  { description: "Every minute", cron: "* * * * *" },
  { description: "Every 5 minutes", cron: "*/5 * * * *" },
  { description: "Every hour on the hour", cron: "0 * * * *" },
  { description: "Every day at midnight", cron: "0 0 * * *" },
  { description: "Every weekday at 9 AM", cron: "0 9 * * 1-5" },
  { description: "First day of the month at 3 AM", cron: "0 3 1 * *" },
  { description: "Every Sunday at noon", cron: "0 12 * * 0" },
  {
    description: "Every 15 min during business hours",
    cron: "*/15 9-17 * * 1-5",
  },
  {
    description: "Last day of the month",
    cron: "0 0 L * *",
    note: "L is a non-standard extension (Quartz, some systems). Not supported by Vixie cron or GitHub Actions.",
  },
  {
    description: "First Monday of the month",
    cron: "0 0 1-7 * 1",
    note: "Fires every Mon AND every 1st–7th — wrap your script with a date check to fire only when both conditions align.",
  },
];

export function Examples({ onPick }: ExamplesProps) {
  return (
    <details className="group border-t border-[var(--rule)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-3 [&::-webkit-details-marker]:hidden">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="square"
          aria-hidden="true"
          className="text-[var(--ink-soft)] transition-transform duration-150 group-open:rotate-90"
        >
          <path d="M4 2 L8 6 L4 10" />
        </svg>
        <span className="eyebrow">Examples</span>
      </summary>
      <ul className="flex flex-col border-t border-[var(--rule)]">
        {RECIPES.map((recipe) => (
          <li key={recipe.cron + recipe.description}>
            <button
              type="button"
              onClick={() => onPick(recipe.cron)}
              className="flex w-full items-start justify-between gap-4 border-b border-[var(--rule)] px-1 py-3 text-left transition-colors duration-150 hover:bg-[var(--paper-soft)]"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-[family-name:var(--font-newsreader)] text-[14px] italic leading-snug text-[var(--ink)]">
                  {recipe.description}
                </span>
                {recipe.note ? (
                  <span className="font-[family-name:var(--font-jetbrains)] text-[11px] leading-snug text-[var(--marker)]">
                    {recipe.note}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 self-start whitespace-nowrap pt-0.5 text-right font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--ink)]">
                {recipe.cron}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
