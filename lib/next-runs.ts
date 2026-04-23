// Wraps cron-parser to compute the next N occurrences of a cron expression
// in a given timezone. Keep this boundary thin — everything else in the app
// should treat runs as plain Date objects.

import parser from "cron-parser";

export interface NextRunsOptions {
  count?: number; // default 10
  timezone?: string; // IANA zone, default = browser local
  from?: Date; // default = now
}

export function nextRuns(expr: string, opts: NextRunsOptions = {}): Date[] {
  const { count = 10, timezone, from = new Date() } = opts;

  const it = parser.parseExpression(expr, {
    currentDate: from,
    tz: timezone,
  });

  const runs: Date[] = [];
  for (let i = 0; i < count; i++) {
    runs.push(it.next().toDate());
  }
  return runs;
}
