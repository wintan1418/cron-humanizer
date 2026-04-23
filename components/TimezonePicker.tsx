"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatOffset, listTimezones } from "@/lib/timezones";

interface TimezonePickerProps {
  value: string;
  onChange: (zone: string) => void;
}

const label = (zone: string) => `${zone} · ${formatOffset(zone)}`;

export function TimezonePicker({ value, onChange }: TimezonePickerProps) {
  const zones = useMemo(() => listTimezones(), []);
  const fieldId = useId();
  const listId = useId();

  // Desktop combobox state
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.toLowerCase().includes(q));
  }, [zones, query]);

  useEffect(() => {
    if (!open) return;
    const selected = filtered.indexOf(value);
    setActiveIndex(selected >= 0 ? selected : 0);
  }, [open, filtered, value]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const root = triggerRef.current?.parentElement;
      if (root && !root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const commit = (zone: string) => {
    onChange(zone);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  };

  const openAndFocus = () => {
    setOpen(true);
    setQuery("");
    queueMicrotask(() => inputRef.current?.focus());
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAndFocus();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[activeIndex];
      if (pick) commit(pick);
    }
  };

  return (
    <div className="inline-block">
      <label htmlFor={fieldId} className="eyebrow mb-1 block">
        Timezone
      </label>

      {/* Mobile: native <select> */}
      <div className="relative md:hidden">
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent py-1.5 pr-6 font-[family-name:var(--font-jetbrains)] text-[13px] leading-tight text-[var(--ink)] border-b border-[var(--rule)] outline-none"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {label(z)}
            </option>
          ))}
        </select>
        <Chevron className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
      </div>

      {/* Desktop: custom combobox */}
      <div className="relative hidden md:block">
        <button
          ref={triggerRef}
          type="button"
          id={open ? undefined : fieldId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => (open ? setOpen(false) : openAndFocus())}
          onKeyDown={onKey}
          className="flex items-center gap-2 border-b border-[var(--rule)] bg-transparent py-1.5 pr-1 font-[family-name:var(--font-jetbrains)] text-[13px] leading-tight text-[var(--ink)] outline-none"
        >
          <span>{label(value)}</span>
          <Chevron className="text-[var(--ink-soft)]" />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 w-[min(20rem,80vw)] border border-[var(--rule)] bg-[var(--paper)]">
            <input
              ref={inputRef}
              id={fieldId}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              placeholder="Filter zones"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              className="block w-full border-b border-[var(--rule)] bg-transparent px-3 py-2 font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--ink)] outline-none"
            />
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Timezones"
              className="max-h-[280px] overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-2 font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--ink-soft)]">
                  No matches
                </li>
              )}
              {filtered.map((zone, i) => (
                <li
                  key={zone}
                  role="option"
                  aria-selected={zone === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(zone);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`cursor-pointer px-3 py-1.5 font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--ink)] ${i === activeIndex ? "bg-[var(--accent-soft)]" : ""}`}
                >
                  {label(zone)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 4 L5 7 L8 4" />
    </svg>
  );
}
