"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpressionInput } from "@/components/ExpressionInput";
import { HumanSentence } from "@/components/HumanSentence";
import { NextRuns } from "@/components/NextRuns";
import { FormatTabs } from "@/components/FormatTabs";
import { CodeBlock } from "@/components/CodeBlock";
import { NoteCallout } from "@/components/NoteCallout";
import { humanize } from "@/lib/cron-to-english";
import { nextRuns } from "@/lib/next-runs";
import { validate } from "@/lib/validator";
import { FORMATS, getFormat } from "@/lib/formatters";
import {
  pushStateToHash,
  readStateFromHash,
} from "@/lib/url-state";

const DEFAULT_FIELDS = ["*/15", "9-17", "*", "*", "1-5"];

function splitExpr(expr: string): string[] {
  const parts = expr.trim().split(/\s+/);
  while (parts.length < 5) parts.push("*");
  return parts.slice(0, 5);
}

export default function Home() {
  const [fields, setFields] = useState<string[]>(DEFAULT_FIELDS);
  const [timezone, setTimezone] = useState<string>(() =>
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC",
  );
  const [activeFormat, setActiveFormat] = useState<string>("linux");
  const [hydrated, setHydrated] = useState(false);

  // hydrate from URL hash on mount
  useEffect(() => {
    const state = readStateFromHash();
    if (state.expr) setFields(splitExpr(state.expr));
    if (state.timezone) setTimezone(state.timezone);
    setHydrated(true);
  }, []);

  const expr = fields.join(" ");

  // write back to URL once hydrated (avoid overwriting before read)
  useEffect(() => {
    if (!hydrated) return;
    pushStateToHash({ expr, timezone });
  }, [expr, timezone, hydrated]);

  const validation = useMemo(() => validate(expr), [expr]);

  const english = useMemo(
    () => (validation.ok ? humanize(expr) : null),
    [expr, validation.ok],
  );

  const runs = useMemo(() => {
    if (!validation.ok) return [];
    try {
      return nextRuns(expr, { count: 10, timezone });
    } catch {
      return [];
    }
  }, [expr, timezone, validation.ok]);

  const invalidIndex = useMemo(() => {
    if (validation.ok) return undefined;
    const fieldName = validation.error?.field.toLowerCase();
    const map: Record<string, number> = {
      minute: 0,
      hour: 1,
      "day-of-month": 2,
      month: 3,
      "day-of-week": 4,
    };
    return fieldName ? map[fieldName] : undefined;
  }, [validation]);

  // keyboard shortcuts: Cmd/Ctrl-K focus first field; 1-6 switch tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const first = document.querySelector<HTMLInputElement>(
          'input[aria-invalid], input[value]',
        );
        first?.focus();
        first?.select();
        return;
      }
      if (!inInput && /^[1-7]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < FORMATS.length) setActiveFormat(FORMATS[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const format = getFormat(activeFormat)!;
  const snippet = format.render(expr);

  return (
    <main className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-[var(--gutter-page)] py-8 sm:py-10">
      <header className="flex items-baseline justify-between border-b border-[var(--rule)] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-newsreader)] text-2xl tracking-tight">
            Chron
          </span>
          <span className="eyebrow hidden sm:inline">cron, in plain english</span>
        </div>
        <nav className="eyebrow flex gap-5">
          <a href="#reference" className="hover:text-[var(--ink)]">
            Reference
          </a>
          <a href="#formats" className="hover:text-[var(--ink)]">
            Formats
          </a>
          <a
            href="https://github.com/wintan1418/cron-humanizer"
            className="hover:text-[var(--ink)]"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        </nav>
      </header>

      <section className="py-[var(--gutter-section)]">
        <p className="eyebrow mb-6">§1 · Expression</p>
        <ExpressionInput
          fields={fields}
          onFieldsChange={setFields}
          invalidFieldIndex={invalidIndex}
        />
        <div className="mt-8 sm:mt-14">
          <HumanSentence
            text={english}
            error={validation.ok ? undefined : validation.error?.message}
          />
        </div>
      </section>

      <section
        id="reference"
        className="grid gap-[var(--gutter-section)] border-t border-[var(--rule)] py-[var(--gutter-section)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div>
          <p className="eyebrow mb-6">§2 · Next 10 runs</p>
          {validation.ok ? (
            <NextRuns runs={runs} timezone={timezone} />
          ) : (
            <p className="text-[var(--ink-soft)]">
              Fix the expression above to see upcoming runs.
            </p>
          )}
        </div>

        <div id="formats">
          <p className="eyebrow mb-6">§3 · Copy for your stack</p>
          <FormatTabs
            formats={FORMATS}
            active={activeFormat}
            onChange={setActiveFormat}
          />
          <div className="mt-6 space-y-4">
            <CodeBlock
              code={snippet}
              filename={format.filename}
              id={`panel-${format.id}`}
              labelledBy={`tab-${format.id}`}
            />
            {format.note && <NoteCallout>{format.note}</NoteCallout>}
          </div>
        </div>
      </section>

      <footer className="eyebrow mt-auto grid grid-cols-2 gap-3 border-t border-[var(--rule)] py-6 text-[var(--ink-soft)] sm:grid-cols-4">
        <span>MIT · no account</span>
        <span>no tracking</span>
        <span>
          <kbd className="mr-1 border border-[var(--rule)] px-1 py-0.5">⌘K</kbd>
          focus ·{" "}
          <kbd className="ml-1 border border-[var(--rule)] px-1 py-0.5">1–7</kbd>
          tab
        </span>
        <span className="sm:text-right">apr 2026</span>
      </footer>
    </main>
  );
}
