interface NoteCalloutProps {
  children: React.ReactNode;
}

// Direction B borrow — dashed amber border, small mono NOTE label.
// Reserved for editorial asides like 'GitHub Actions schedules run in UTC'.
export function NoteCallout({ children }: NoteCalloutProps) {
  return (
    <div
      role="note"
      className="flex gap-3 border border-dashed border-[var(--marker)] p-4 text-sm"
    >
      <span className="eyebrow shrink-0 text-[var(--marker)]">NOTE</span>
      <div className="text-[var(--ink-soft)]">{children}</div>
    </div>
  );
}
