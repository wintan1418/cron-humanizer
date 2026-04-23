interface NextRunsProps {
  runs: Date[];
  timezone: string;
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function relativeDay(run: Date, now: Date): string {
  const runDay = new Date(run).setHours(0, 0, 0, 0);
  const nowDay = new Date(now).setHours(0, 0, 0, 0);
  const diffDays = Math.round((runDay - nowDay) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(run);
  }
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(run);
}

function humanDelta(run: Date, now: Date): string {
  const s = Math.round((run.getTime() - now.getTime()) / 1000);
  if (s < 60) return `in ${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `in ${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `in ${h}h`;
  const d = Math.round(h / 24);
  return `in ${d}d`;
}

export function NextRuns({ runs, timezone }: NextRunsProps) {
  if (runs.length === 0) return null;
  const now = new Date();

  return (
    <div>
      <Timeline runs={runs} now={now} />
      <table className="mt-6 w-full border-collapse font-[family-name:var(--font-jetbrains)] text-sm">
        <thead>
          <tr className="eyebrow border-b-2 border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <th className="py-2 pl-2 text-left font-medium">Relative</th>
            <th className="hidden py-2 text-left font-medium sm:table-cell">Date</th>
            <th className="py-2 text-right font-medium">Time</th>
            <th className="py-2 pl-4 pr-2 text-right font-medium">Δ</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, i) => (
            <tr
              key={i}
              className="border-b border-[var(--rule)] hover:bg-[var(--paper-soft)]"
            >
              <td className="py-3 pl-2 font-[family-name:var(--font-newsreader)] text-base text-[var(--accent)]">
                {relativeDay(run, now)}
              </td>
              <td className="hidden py-3 text-[var(--ink-soft)] sm:table-cell">
                {DAY_FORMATTER.format(run)}
              </td>
              <td className="py-3 text-right tabular-nums">{TIME_FORMATTER.format(run)}</td>
              <td className="py-3 pl-4 pr-2 text-right tabular-nums text-[var(--ink-soft)]">
                {humanDelta(run, now)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="eyebrow mt-4 text-[var(--ink-soft)]">
        Zone · {timezone}
      </p>
    </div>
  );
}

function Timeline({ runs, now }: { runs: Date[]; now: Date }) {
  if (runs.length === 0) return null;
  const start = now.getTime();
  const end = runs[runs.length - 1].getTime();
  const span = Math.max(end - start, 1);
  const positions = runs.map((r) => ((r.getTime() - start) / span) * 100);

  return (
    <div className="relative h-8 w-full" aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--gold)]" />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--gold)]"
        style={{ left: "0%" }}
      />
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-[var(--gold)]"
          style={{ left: `${pos}%` }}
        />
      ))}
    </div>
  );
}
