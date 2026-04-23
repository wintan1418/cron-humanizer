interface HumanSentenceProps {
  text: string | null;
  error?: string;
}

// Renders the humanized cron sentence. Emphasized nouns are detected heuristically:
// any "Every N minutes|hours", "N:MM AM/PM", "noon|midnight", "weekdays|weekends",
// day/month names, "business hours (…)", and day-ordinals get wrapped in an
// italic terracotta <em>. This mirrors the editorial feel — the sentence reads
// as prose with a handful of accent phrases.
export function HumanSentence({ text, error }: HumanSentenceProps) {
  if (error) {
    return (
      <p
        className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--marker)]"
        role="alert"
      >
        {error}
      </p>
    );
  }
  if (!text) return null;

  return (
    <p
      aria-live="polite"
      className="font-[family-name:var(--font-newsreader)] text-[clamp(1.5rem,3.8vw,3.25rem)] leading-[1.12] tracking-tight text-[var(--ink)]"
    >
      {renderWithEmphasis(text)}
    </p>
  );
}

const EMPHASIS_PATTERNS: RegExp[] = [
  /every \d+ minutes?/gi,
  /every \d+ hours?/gi,
  /every minute/gi,
  /every hour/gi,
  /business hours \([^)]+\)/gi,
  /\d{1,2}:\d{2} (?:AM|PM)/g,
  /\bnoon\b|\bmidnight\b/gi,
  /\bweekdays?\b/gi,
  /\bweekends?\b/gi,
  /\b(?:Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|Saturdays?|Sundays?)\b/g,
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
  /on the \d+(?:st|nd|rd|th)/gi,
];

function renderWithEmphasis(text: string) {
  const matches: Array<{ start: number; end: number }> = [];
  for (const pattern of EMPHASIS_PATTERNS) {
    // fresh regex per-call since some patterns have the g flag and retain state
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      matches.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  matches.sort((a, b) => a.start - b.start);
  const merged: typeof matches = [];
  for (const m of matches) {
    const last = merged[merged.length - 1];
    if (last && m.start < last.end) {
      last.end = Math.max(last.end, m.end);
    } else {
      merged.push({ ...m });
    }
  }

  const parts: Array<{ text: string; em: boolean }> = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), em: false });
    parts.push({ text: text.slice(start, end), em: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), em: false });

  return parts.map((part, i) =>
    part.em ? (
      <em key={i} className="italic text-[var(--accent)]">
        {part.text}
      </em>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}
