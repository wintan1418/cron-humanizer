"use client";

import { useRef } from "react";

interface ExpressionInputProps {
  fields: string[]; // length 5: [minute, hour, dom, month, dow]
  onFieldsChange: (next: string[]) => void;
  invalidFieldIndex?: number;
}

const LABELS = ["MINUTE", "HOUR", "DAY", "MONTH", "WEEKDAY"] as const;

export function ExpressionInput({
  fields,
  onFieldsChange,
  invalidFieldIndex,
}: ExpressionInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const update = (i: number, value: string) => {
    // field-aware paste: if the pasted value contains spaces, spread across all fields
    if (/\s/.test(value.trim())) {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 2 && parts.length <= 5) {
        const next = [...fields];
        for (let j = 0; j < parts.length; j++) next[i + j] ??= "*";
        for (let j = 0; j < parts.length && i + j < 5; j++) next[i + j] = parts[j];
        onFieldsChange(next);
        return;
      }
    }
    const next = [...fields];
    next[i] = value;
    onFieldsChange(next);
  };

  return (
    <div
      role="group"
      aria-label="Cron expression, five fields"
      className="grid grid-cols-5 gap-2 sm:gap-6"
    >
      {fields.map((value, i) => {
        const isDefault = value === "*";
        const isInvalid = invalidFieldIndex === i;
        return (
          <label key={i} className="flex min-w-0 flex-col">
            <span className="eyebrow mb-2">{LABELS[i]}</span>
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={value}
              onChange={(e) => update(i, e.target.value)}
              spellCheck={false}
              autoComplete="off"
              inputMode="text"
              aria-invalid={isInvalid}
              className={[
                "w-full min-w-0 border-0 bg-transparent p-0 font-[family-name:var(--font-jetbrains)]",
                "text-[clamp(1.75rem,7vw,4.5rem)] font-medium leading-none tracking-tight",
                "text-[var(--ink)] outline-none",
                "border-b transition-colors duration-150",
                isInvalid
                  ? "border-[var(--marker)]"
                  : isDefault
                    ? "border-[var(--rule)]"
                    : "border-[var(--accent)]",
              ].join(" ")}
            />
          </label>
        );
      })}
    </div>
  );
}
