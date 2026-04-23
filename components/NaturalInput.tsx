"use client";

import { useId } from "react";
import type { ParseResult } from "@/lib/english-to-cron";

interface NaturalInputProps {
  value: string;
  onValueChange: (v: string) => void;
  result: ParseResult;
  onApply: (cron: string) => void;
}

// English → cron editor. Controlled textarea with hairline baseline; swaps to
// --marker when the parse confidence drops. Below the input:
//   - the translated cron + Apply button (text + hairline border — no big CTAs)
//   - suggestion chips when cron is null
//   - a small mono annotation for unknown tokens
// Accessibility: aria-describedby links to the suggestions region, and the
// translated-cron line uses role="status" so SRs announce it on update.
export function NaturalInput({
  value,
  onValueChange,
  result,
  onApply,
}: NaturalInputProps) {
  const describedById = useId();
  const statusId = useId();

  const hasSuggestions = result.suggestions.length > 0;
  const unknownTokens = (result.tokens ?? []).filter((t) => !t.known);

  const baselineClass =
    result.cron !== null
      ? "border-[var(--accent)]"
      : value.trim().length === 0
        ? "border-[var(--rule)]"
        : "border-[var(--marker)]";

  return (
    <div className="flex flex-col gap-4">
      <label className="flex min-w-0 flex-col">
        <span className="eyebrow mb-2">DESCRIBE THE SCHEDULE</span>
        <textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          rows={2}
          spellCheck={false}
          autoComplete="off"
          placeholder="every weekday at 9am"
          aria-describedby={`${statusId} ${describedById}`}
          className={[
            "w-full min-w-0 resize-none border-0 bg-transparent p-0",
            "font-[family-name:var(--font-newsreader)]",
            "text-[clamp(1.125rem,3vw,1.5rem)] leading-[1.35] tracking-tight",
            "text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none",
            "border-b pb-2 transition-colors duration-150",
            baselineClass,
          ].join(" ")}
        />
      </label>

      <div
        id={statusId}
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-2 min-h-[1.75rem]"
      >
        {result.cron !== null ? (
          <>
            <span className="eyebrow">CRON</span>
            <code className="font-[family-name:var(--font-jetbrains)] text-base text-[var(--ink)]">
              {result.cron}
            </code>
            <button
              type="button"
              onClick={() => onApply(result.cron!)}
              className={[
                "ml-auto px-3 py-1",
                "font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.12em]",
                "border border-[var(--rule)] hover:border-[var(--ink)]",
                "text-[var(--ink)] bg-transparent",
                "transition-colors duration-150",
              ].join(" ")}
            >
              Apply
            </button>
          </>
        ) : value.trim().length > 0 ? (
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--marker)]">
            Couldn&apos;t parse that yet.
          </span>
        ) : null}
      </div>

      {unknownTokens.length > 0 && (
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--marker)]">
          Unknown:{" "}
          {unknownTokens.map((t, i) => (
            <span key={i}>
              <span className="underline decoration-[var(--marker)] decoration-dotted underline-offset-2">
                {t.text}
              </span>
              {i < unknownTokens.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}

      {hasSuggestions && (
        <div id={describedById} className="flex flex-col gap-2">
          <span className="eyebrow">TRY</span>
          <ul className="flex flex-wrap gap-2">
            {result.suggestions.map((s, i) => {
              const isHint = /not supported|don't know|don’t know/i.test(s);
              return (
                <li key={i}>
                  {isHint ? (
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1",
                        "border border-dashed border-[var(--marker)]",
                        "font-[family-name:var(--font-jetbrains)] text-xs",
                        "text-[var(--ink-soft)]",
                      ].join(" ")}
                    >
                      {s}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onValueChange(stripTryPrefix(s))}
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1",
                        "border border-[var(--rule)] hover:border-[var(--ink)]",
                        "font-[family-name:var(--font-jetbrains)] text-xs",
                        "text-[var(--ink)] bg-transparent",
                        "transition-colors duration-150",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// "Try 'every day at 9am'" → "every day at 9am"
function stripTryPrefix(s: string): string {
  const m = s.match(/^Try\s+['"]([^'"]+)['"]/i);
  return m ? m[1] : s;
}
