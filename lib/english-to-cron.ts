// Deterministic English → cron parser for the Chron tool.
// Start narrow: ship 20 phrasings that work perfectly, not 200 that work 70%.
// See CRON_TOOL_BRIEF §3.1 (Mode B) and §16 (start narrow).

export interface ParseResult {
  cron: string | null;
  confidence: "high" | "medium" | "low";
  suggestions: string[];
  tokens?: { text: string; known: boolean }[];
}

// Vocabulary known to the parser. Everything else is flagged as unknown so
// the UI can underline it with --marker.
const KNOWN_WORDS = new Set([
  "every", "each", "on", "at", "the", "of", "and", "to", "between",
  "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks",
  "month", "months", "year", "years",
  "midnight", "noon",
  "am", "pm", "a", "p", "m",
  "weekday", "weekdays", "weekend", "weekends",
  "business",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "mondays", "tuesdays", "wednesdays", "thursdays", "fridays", "saturdays", "sundays",
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
  "first", "second", "third", "fourth", "fifth",
  "during", "only", "on-the-hour",
]);

const DOW_MAP: Record<string, number> = {
  sunday: 0, sundays: 0,
  monday: 1, mondays: 1,
  tuesday: 2, tuesdays: 2,
  wednesday: 3, wednesdays: 3,
  thursday: 4, thursdays: 4,
  friday: 5, fridays: 5,
  saturday: 6, saturdays: 6,
};

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
};

// --- normalization helpers ------------------------------------------------

function normalize(input: string): string {
  let s = input.trim().toLowerCase();
  // collapse whitespace
  s = s.replace(/\s+/g, " ");
  // remove trailing punctuation
  s = s.replace(/[.!?]+$/g, "");
  // strip leading filler
  s = s.replace(/^(run|fire|trigger|schedule)\s+/, "");
  return s;
}

// "9am", "9 am", "9:00 AM", "9:00am", "09:00" → { hour, minute }
function parseTimeToken(raw: string): { hour: number; minute: number } | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (s === "midnight") return { hour: 0, minute: 0 };
  if (s === "noon") return { hour: 12, minute: 0 };

  // HH:MM am/pm or HH am/pm or HH:MM (24h)
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm|a\.m\.|p\.m\.)?$/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const suffix = m[3]?.replace(/\./g, "");
  if (minute < 0 || minute > 59) return null;
  if (suffix === "am" || suffix === "pm") {
    if (hour < 1 || hour > 12) return null;
    if (suffix === "am") hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
  } else {
    if (hour < 0 || hour > 23) return null;
  }
  return { hour, minute };
}

// Scan the string for the first time-like token, return { time, rest }.
function extractTime(s: string): { hour: number; minute: number; rest: string } | null {
  // match "at <time>", or bare "midnight"/"noon", or bare "HH[:MM][am|pm]"
  const re = /\bat\s+(midnight|noon|\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)\b|\b(midnight|noon)\b|\b(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\b/;
  const m = s.match(re);
  if (!m) return null;
  const token = m[1] ?? m[2] ?? m[3];
  const parsed = parseTimeToken(token);
  if (!parsed) return null;
  const rest = (s.slice(0, m.index!) + s.slice(m.index! + m[0].length)).replace(/\s+/g, " ").trim();
  return { ...parsed, rest };
}

// token-level classifier, used to mark unknown words for the UI.
function classifyTokens(input: string): { text: string; known: boolean }[] {
  const tokens: { text: string; known: boolean }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const raw = m[0];
    const bare = raw.toLowerCase().replace(/[.,!?]/g, "");
    let known = false;
    // numeric / time-like / cron-like tokens are "known"
    if (/^\d/.test(bare)) known = true;
    else if (/^\d{1,2}(:\d{2})?(am|pm|a\.m\.|p\.m\.)?$/i.test(bare)) known = true;
    else if (/^\d+(st|nd|rd|th)$/i.test(bare)) known = true;
    else if (KNOWN_WORDS.has(bare)) known = true;
    else if (DOW_MAP[bare] !== undefined) known = true;
    else if (MONTH_MAP[bare] !== undefined) known = true;
    else if (ORDINAL_WORDS[bare] !== undefined) known = true;
    tokens.push({ text: raw, known });
  }
  return tokens;
}

// --- suggestion helpers ---------------------------------------------------

function suggestionsForUnknown(input: string, unknowns: string[]): string[] {
  const out: string[] = [];
  const lower = input.toLowerCase();
  if (/fortnight|bi[- ]?week/i.test(lower)) {
    out.push("Try 'every 2 weeks' — not supported yet");
  }
  if (/quarter|quarterly/i.test(lower)) {
    out.push("Try 'every 3 months' — not supported yet");
  }
  if (/last\s+(day|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(lower)) {
    out.push("Try a specific day (e.g. '28th of every month') — 'last day' is not supported yet");
  }
  if (/dawn|sunrise|sunset|dusk/i.test(lower)) {
    out.push("Try an explicit time like 'every day at 6am' — astronomical times are not supported");
  }
  if (out.length === 0) {
    // generic suggestions rooted in the 20-phrasing catalogue
    if (unknowns.length > 0) {
      out.push(`I don't know "${unknowns[0]}" yet`);
    }
    out.push("Try 'every day at 9am'");
    out.push("Try 'weekdays at 9am'");
    out.push("Try 'every 15 minutes'");
  }
  return out;
}

// --- main parser ---------------------------------------------------------

export function englishToCron(input: string): ParseResult {
  if (!input || !input.trim()) {
    return { cron: null, confidence: "low", suggestions: [] };
  }

  const raw = input;
  const s = normalize(input);
  const tokens = classifyTokens(raw);
  const unknowns = tokens.filter((t) => !t.known).map((t) => t.text);

  // ---- 1. "every minute" ------------------------------------------------
  if (/^every\s+minute$/.test(s)) {
    return { cron: "* * * * *", confidence: "high", suggestions: [] };
  }

  // ---- 2. "every N minutes" --------------------------------------------
  {
    const m = s.match(/^every\s+(\d+)\s+minutes?$/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 59) {
        return { cron: `*/${n} * * * *`, confidence: "high", suggestions: [] };
      }
    }
  }

  // ---- 3. "every hour" / "every hour on the hour" -----------------------
  if (/^every\s+hour(\s+on\s+the\s+hour)?$/.test(s)) {
    return { cron: "0 * * * *", confidence: "high", suggestions: [] };
  }

  // ---- 4. "every N hours" -----------------------------------------------
  {
    const m = s.match(/^every\s+(\d+)\s+hours?$/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 23) {
        return { cron: `0 */${n} * * *`, confidence: "high", suggestions: [] };
      }
    }
  }

  // ---- 5. "every 15 minutes during business hours" ----------------------
  // also "every 15 minutes between 9am and 5pm on weekdays"
  {
    const m = s.match(/^every\s+(\d+)\s+minutes?\s+during\s+business\s+hours$/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 59) {
        return { cron: `*/${n} 9-17 * * 1-5`, confidence: "high", suggestions: [] };
      }
    }
  }
  {
    const m = s.match(
      /^every\s+(\d+)\s+minutes?\s+between\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)\s+on\s+weekdays$/,
    );
    if (m) {
      const n = Number(m[1]);
      const t1 = parseTimeToken(m[2]);
      const t2 = parseTimeToken(m[3]);
      if (n >= 1 && n <= 59 && t1 && t2) {
        return {
          cron: `*/${n} ${t1.hour}-${t2.hour} * * 1-5`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 6. "weekdays at <time>" / "every weekday at <time>" --------------
  {
    const m = s.match(/^(?:every\s+)?weekdays?\s+at\s+(.+)$/);
    if (m) {
      const t = parseTimeToken(m[1]);
      if (t) {
        return {
          cron: `${t.minute} ${t.hour} * * 1-5`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 7. "weekends at <time>" ------------------------------------------
  {
    const m = s.match(/^(?:every\s+)?weekends?\s+at\s+(.+)$/);
    if (m) {
      const t = parseTimeToken(m[1]);
      if (t) {
        return {
          cron: `${t.minute} ${t.hour} * * 0,6`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 8. "<dow>s at <time>" / "every <dow> at <time>" ------------------
  {
    const m = s.match(
      /^(?:every\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s?\s+at\s+(.+)$/,
    );
    if (m) {
      const dow = DOW_MAP[m[1]];
      const t = parseTimeToken(m[2]);
      if (t && dow !== undefined) {
        return {
          cron: `${t.minute} ${t.hour} * * ${dow}`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 9. "every day at <time>" -----------------------------------------
  {
    const m = s.match(/^every\s+day\s+at\s+(.+)$/);
    if (m) {
      const t = parseTimeToken(m[1]);
      if (t) {
        return {
          cron: `${t.minute} ${t.hour} * * *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 10. "on the Nth of every month at <time>" / "first of every month at <time>"
  //     also "Nth of every month at <time>" without "on the"
  {
    const m = s.match(
      /^(?:on\s+the\s+)?(\d+)(?:st|nd|rd|th)?\s+of\s+every\s+month\s+at\s+(.+)$/,
    );
    if (m) {
      const dom = Number(m[1]);
      const t = parseTimeToken(m[2]);
      if (t && dom >= 1 && dom <= 31) {
        return {
          cron: `${t.minute} ${t.hour} ${dom} * *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }
  // "first of every month at midnight" — ordinal word form
  {
    const m = s.match(
      /^(?:on\s+the\s+)?(first|second|third|fourth|fifth)\s+of\s+every\s+month\s+at\s+(.+)$/,
    );
    if (m) {
      const dom = ORDINAL_WORDS[m[1]];
      const t = parseTimeToken(m[2]);
      if (t && dom) {
        return {
          cron: `${t.minute} ${t.hour} ${dom} * *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 11. "on the Nth at <time>" (implicit every month) ----------------
  {
    const m = s.match(/^on\s+the\s+(\d+)(?:st|nd|rd|th)?\s+at\s+(.+)$/);
    if (m) {
      const dom = Number(m[1]);
      const t = parseTimeToken(m[2]);
      if (t && dom >= 1 && dom <= 31) {
        return {
          cron: `${t.minute} ${t.hour} ${dom} * *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- 12. "every <month> <Nth>" / "<month> <Nth> at <time>" ------------
  {
    // "every january 1st" → 0 0 1 1 *
    const m = s.match(
      /^every\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?$/,
    );
    if (m) {
      const month = MONTH_MAP[m[1]];
      const dom = Number(m[2]);
      if (month && dom >= 1 && dom <= 31) {
        return {
          cron: `0 0 ${dom} ${month} *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }
  {
    // "january 1st at midnight" → 0 0 1 1 *
    const m = s.match(
      /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?\s+at\s+(.+)$/,
    );
    if (m) {
      const month = MONTH_MAP[m[1]];
      const dom = Number(m[2]);
      const t = parseTimeToken(m[3]);
      if (month && t && dom >= 1 && dom <= 31) {
        return {
          cron: `${t.minute} ${t.hour} ${dom} ${month} *`,
          confidence: "high",
          suggestions: [],
        };
      }
    }
  }

  // ---- fall-through: no parse ------------------------------------------
  return {
    cron: null,
    confidence: "low",
    suggestions: suggestionsForUnknown(raw, unknowns),
    tokens,
  };
}
