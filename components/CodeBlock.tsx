"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  filename: string;
  id?: string;
  labelledBy?: string;
}

export function CodeBlock({ code, filename, id, labelledBy }: CodeBlockProps) {
  const [flashing, setFlashing] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setFlashing(true);
      setTimeout(() => setFlashing(false), 400);
    } catch {
      // swallow — browsers without clipboard permission just don't flash
    }
  };

  return (
    <div
      id={id}
      role={labelledBy ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      className={[
        "rounded-lg border border-[var(--rule)] bg-[var(--paper-soft)] transition-colors",
        flashing ? "bg-[var(--accent-soft)]" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-[var(--rule)] px-4 py-2">
        <span className="eyebrow">{filename}</span>
        <button
          onClick={copy}
          className="eyebrow rounded border border-[var(--rule)] bg-[var(--paper)] px-2 py-1 text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
        >
          {flashing ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-[family-name:var(--font-jetbrains)] text-[13px] leading-[22px] text-[var(--ink)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
