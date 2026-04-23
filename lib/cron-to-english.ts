// Deterministic cron → plain-English humanizer for the Chron tool.
// Style rules (see CRON_TOOL_BRIEF §7): weekdays not "Mon–Fri", 12-hour AM/PM,
// "on the hour" not "at minute 0", friendly errors.

export class CronParseError extends Error {
  constructor(
    public readonly field: string,
    public readonly reason: string,
    public readonly input: string,
  ) {
    super(`${field}: ${reason} (got "${input}")`);
    this.name = "CronParseError";
  }
}

type FieldAst =
  | { kind: "any" }
  | { kind: "value"; n: number }
  | { kind: "range"; from: number; to: number }
  | { kind: "list"; values: number[] }
  | { kind: "step"; step: number; from?: number; to?: number };

interface ParsedCron {
  minute: FieldAst;
  hour: FieldAst;
  dom: FieldAst;
  month: FieldAst;
  dow: FieldAst;
}

const ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

const FIELD_SPECS = [
  { name: "minute", label: "Minute", min: 0, max: 59 },
  { name: "hour", label: "Hour", min: 0, max: 23 },
  { name: "dom", label: "Day-of-month", min: 1, max: 31 },
  { name: "month", label: "Month", min: 1, max: 12 },
  { name: "dow", label: "Day-of-week", min: 0, max: 7 },
] as const;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const DOW_PLURAL = [
  "Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays",
];

// ---------- parser ----------

function parseField(raw: string, spec: (typeof FIELD_SPECS)[number]): FieldAst {
  const { name, label, min, max } = spec;

  if (raw === "*") return { kind: "any" };

  // step form: */N or N-M/S or */*
  if (raw.includes("/")) {
    const [baseRaw, stepRaw] = raw.split("/");
    const step = Number(stepRaw);
    if (!Number.isInteger(step) || step <= 0) {
      throw new CronParseError(label, `step must be a positive integer`, raw);
    }
    if (baseRaw === "*") return { kind: "step", step };
    if (baseRaw.includes("-")) {
      const [fromRaw, toRaw] = baseRaw.split("-");
      const from = parseNumber(fromRaw, label, min, max, raw);
      const to = parseNumber(toRaw, label, min, max, raw);
      return { kind: "step", step, from, to };
    }
    const from = parseNumber(baseRaw, label, min, max, raw);
    return { kind: "step", step, from, to: max };
  }

  // list: a,b,c
  if (raw.includes(",")) {
    const values = raw.split(",").map((v) => parseNumber(v, label, min, max, raw));
    return { kind: "list", values };
  }

  // range: a-b
  if (raw.includes("-")) {
    const [fromRaw, toRaw] = raw.split("-");
    const from = parseNumber(fromRaw, label, min, max, raw);
    const to = parseNumber(toRaw, label, min, max, raw);
    return { kind: "range", from, to };
  }

  return { kind: "value", n: parseNumber(raw, label, min, max, raw) };

  // inner helper shadowed below — hoisted for closure over label/min/max
  function parseNumber(s: string, label: string, min: number, max: number, full: string): number {
    const n = Number(s);
    if (!Number.isInteger(n)) {
      throw new CronParseError(label, `expected an integer`, full);
    }
    if (n < min || n > max) {
      throw new CronParseError(
        label,
        name === "dow"
          ? `field only accepts 0–7 (0 and 7 both mean Sunday). You entered ${n}`
          : `field must be ${min}–${max}. You entered ${n}`,
        full,
      );
    }
    return n;
  }
}

export function parse(expr: string): ParsedCron {
  const trimmed = expr.trim();
  if (!trimmed) throw new CronParseError("expression", "empty", expr);

  const resolved = ALIASES[trimmed.toLowerCase()] ?? trimmed;
  const parts = resolved.split(/\s+/);
  if (parts.length !== 5) {
    throw new CronParseError(
      "expression",
      `expected 5 fields, got ${parts.length}`,
      expr,
    );
  }

  return {
    minute: parseField(parts[0], FIELD_SPECS[0]),
    hour: parseField(parts[1], FIELD_SPECS[1]),
    dom: parseField(parts[2], FIELD_SPECS[2]),
    month: parseField(parts[3], FIELD_SPECS[3]),
    dow: parseField(parts[4], FIELD_SPECS[4]),
  };
}

// ---------- formatters ----------

function formatHour12(h: number): string {
  if (h === 0) return "midnight";
  if (h === 12) return "noon";
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

function formatTime12(hour: number, minute: number): string {
  if (minute === 0) return formatHour12(hour);
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour === 0 ? 12 : hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

function formatHourRange12(from: number, to: number): string {
  const rangeSuffix = (h: number) => (h === 0 ? "midnight" : h === 12 ? "noon" : h < 12 ? "AM" : "PM");
  const display = (h: number) => (h === 0 || h === 12 ? (h === 0 ? "12" : "12") : (h % 12 === 0 ? "12" : `${h % 12}`));
  return `${display(from)} ${rangeSuffix(from)}–${display(to)} ${rangeSuffix(to)}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// day-of-week set helpers — canonicalize 7 → 0
function dowSet(ast: FieldAst): Set<number> | "any" {
  if (ast.kind === "any") return "any";
  const out = new Set<number>();
  const add = (n: number) => out.add(n === 7 ? 0 : n);
  if (ast.kind === "value") add(ast.n);
  else if (ast.kind === "range") for (let i = ast.from; i <= ast.to; i++) add(i);
  else if (ast.kind === "list") ast.values.forEach(add);
  else if (ast.kind === "step") {
    const from = ast.from ?? 0;
    const to = ast.to ?? 7;
    for (let i = from; i <= to; i += ast.step) add(i);
  }
  return out;
}

function describeDow(ast: FieldAst): string | null {
  const s = dowSet(ast);
  if (s === "any") return null;
  const sorted = [...s].sort((a, b) => a - b);
  const key = sorted.join(",");
  if (key === "1,2,3,4,5") return "weekdays";
  if (key === "0,6") return "weekends";
  if (sorted.length === 1) return DOW_PLURAL[sorted[0]];
  if (sorted.length === 2) return `${DOW_PLURAL[sorted[0]]} and ${DOW_PLURAL[sorted[1]]}`;
  if (sorted.length >= 3 && isContiguous(sorted)) {
    return `${DOW_NAMES[sorted[0]]} through ${DOW_NAMES[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DOW_PLURAL[d]).join(", ");
}

function isContiguous(sorted: number[]): boolean {
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

function describeMinuteOnly(ast: FieldAst): string {
  if (ast.kind === "any") return "Every minute";
  if (ast.kind === "step") return `Every ${ast.step} minutes`;
  if (ast.kind === "value") {
    if (ast.n === 0) return "On the hour";
    return `At ${ast.n} minute${ast.n === 1 ? "" : "s"} past the hour`;
  }
  if (ast.kind === "list") {
    const vals = ast.values.slice().sort((a, b) => a - b);
    const joined = vals.length === 2
      ? `${vals[0]} and ${vals[1]}`
      : `${vals.slice(0, -1).join(", ")}, and ${vals[vals.length - 1]}`;
    return `At ${joined} minutes past the hour`;
  }
  if (ast.kind === "range") {
    return `Every minute from ${ast.from} to ${ast.to} past the hour`;
  }
  return "Every minute";
}

function describeHourOnly(ast: FieldAst): { phrase: string; range?: [number, number] } {
  if (ast.kind === "any") return { phrase: "around the clock" };
  if (ast.kind === "range") {
    // business hours detection
    if (ast.from === 9 && ast.to === 17) {
      return { phrase: "during business hours (9 AM–5 PM)", range: [9, 17] };
    }
    return { phrase: `between ${formatHourRange12(ast.from, ast.to)}`, range: [ast.from, ast.to] };
  }
  if (ast.kind === "value") return { phrase: `at ${formatHour12(ast.n)}` };
  if (ast.kind === "list") {
    const vals = ast.values.slice().sort((a, b) => a - b).map(formatHour12);
    return { phrase: `at ${vals.join(", ")}` };
  }
  if (ast.kind === "step") {
    return { phrase: `every ${ast.step} hours` };
  }
  return { phrase: "around the clock" };
}

function isAny(ast: FieldAst): boolean {
  return ast.kind === "any";
}

function describeDayOfMonth(ast: FieldAst): string | null {
  if (ast.kind === "any") return null;
  if (ast.kind === "value") return `on the ${ordinal(ast.n)} of every month`;
  if (ast.kind === "list") {
    const ords = ast.values.map(ordinal);
    return `on the ${ords.slice(0, -1).join(", ")} and ${ords[ords.length - 1]} of every month`;
  }
  if (ast.kind === "range") return `from the ${ordinal(ast.from)} to the ${ordinal(ast.to)} of every month`;
  if (ast.kind === "step") return `every ${ast.step} days`;
  return null;
}

function describeMonth(ast: FieldAst): string | null {
  if (ast.kind === "any") return null;
  if (ast.kind === "value") return `in ${MONTH_NAMES[ast.n - 1]}`;
  if (ast.kind === "range") return `from ${MONTH_NAMES[ast.from - 1]} to ${MONTH_NAMES[ast.to - 1]}`;
  if (ast.kind === "list") {
    const names = ast.values.map((v) => MONTH_NAMES[v - 1]);
    return `in ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  }
  if (ast.kind === "step") return `every ${ast.step} months`;
  return null;
}

// ---------- high-level describe ----------

export function humanize(expr: string): string {
  const trimmed = expr.trim();

  // alias fast-path for canonical copy
  const alias = trimmed.toLowerCase();
  const aliasPhrases: Record<string, string> = {
    "@yearly": "At midnight on January 1st.",
    "@annually": "At midnight on January 1st.",
    "@monthly": "At midnight on the 1st of every month.",
    "@weekly": "Every Sunday at midnight.",
    "@daily": "Every day at midnight.",
    "@midnight": "Every day at midnight.",
    "@hourly": "Every hour, on the hour.",
  };
  if (aliasPhrases[alias]) return aliasPhrases[alias];

  const ast = parse(trimmed);

  // --- special showpieces / exact-match phrasings ---

  // `* * * * *` → Every minute.
  if (isAny(ast.minute) && isAny(ast.hour) && isAny(ast.dom) && isAny(ast.month) && isAny(ast.dow)) {
    return "Every minute.";
  }

  // `0 * * * *` → Every hour, on the hour.
  if (
    ast.minute.kind === "value" && ast.minute.n === 0 &&
    isAny(ast.hour) && isAny(ast.dom) && isAny(ast.month) && isAny(ast.dow)
  ) {
    return "Every hour, on the hour.";
  }

  // `*/N * * * *` → Every N minutes, around the clock.
  if (
    ast.minute.kind === "step" && ast.minute.from === undefined &&
    isAny(ast.hour) && isAny(ast.dom) && isAny(ast.month) && isAny(ast.dow)
  ) {
    return `Every ${ast.minute.step} minutes, around the clock.`;
  }

  const dowPhrase = describeDow(ast.dow);

  // `MIN HOUR * * *` → Every day at <time>.  (single value minute + hour)
  if (
    ast.minute.kind === "value" && ast.hour.kind === "value" &&
    isAny(ast.dom) && isAny(ast.month) && !dowPhrase
  ) {
    return `Every day at ${formatTime12(ast.hour.n, ast.minute.n)}.`;
  }

  // `MIN HOUR * * DOW` → <dowPhrase> at <time>.
  if (
    ast.minute.kind === "value" && ast.hour.kind === "value" &&
    isAny(ast.dom) && isAny(ast.month) && dowPhrase
  ) {
    const who = capitalize(dowPhrase);
    return `${who} at ${formatTime12(ast.hour.n, ast.minute.n)}.`;
  }

  // `0 0 N * *` → At midnight on the Nth of every month.
  if (
    ast.minute.kind === "value" && ast.minute.n === 0 &&
    ast.hour.kind === "value" && ast.hour.n === 0 &&
    ast.dom.kind === "value" && isAny(ast.month) && !dowPhrase
  ) {
    return `At midnight on the ${ordinal(ast.dom.n)} of every month.`;
  }

  // `0 0 1 1 *` → At midnight on January 1st.
  if (
    ast.minute.kind === "value" && ast.minute.n === 0 &&
    ast.hour.kind === "value" && ast.hour.n === 0 &&
    ast.dom.kind === "value" &&
    ast.month.kind === "value" && !dowPhrase
  ) {
    return `At midnight on ${MONTH_NAMES[ast.month.n - 1]} ${ordinal(ast.dom.n)}.`;
  }

  // `*/N H1-H2 * * DOW` → Every N minutes during <hour phrase>, <dow> only.
  if (
    ast.minute.kind === "step" && ast.minute.from === undefined &&
    ast.hour.kind === "range" &&
    isAny(ast.dom) && isAny(ast.month)
  ) {
    const hour = describeHourOnly(ast.hour);
    if (dowPhrase) {
      return `Every ${ast.minute.step} minutes ${hour.phrase}, ${dowPhrase} only.`;
    }
    return `Every ${ast.minute.step} minutes ${hour.phrase}.`;
  }

  // `0 H1-H2 * * DOW` → Every hour during <hour phrase>, <dow> only.
  if (
    ast.minute.kind === "value" && ast.minute.n === 0 &&
    ast.hour.kind === "range" &&
    isAny(ast.dom) && isAny(ast.month)
  ) {
    const hour = describeHourOnly(ast.hour);
    if (dowPhrase) {
      return `Every hour ${hour.phrase}, ${dowPhrase} only.`;
    }
    return `Every hour ${hour.phrase}.`;
  }

  // --- general fallback, sentence-assembled ---

  const parts: string[] = [];
  parts.push(describeMinuteOnly(ast.minute));
  const hour = describeHourOnly(ast.hour);
  if (hour.phrase !== "around the clock" || ast.minute.kind === "any") {
    parts.push(hour.phrase);
  }

  const dom = describeDayOfMonth(ast.dom);
  if (dom) parts.push(dom);

  const month = describeMonth(ast.month);
  if (month) parts.push(month);

  if (dowPhrase) parts.push(`on ${dowPhrase}`);

  return capitalize(parts.join(", ")) + ".";
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
