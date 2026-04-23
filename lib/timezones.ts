// IANA timezone utilities. Pure functions, no side effects, SSR-safe.

const FALLBACK_ZONES: string[] = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Jerusalem",
  "Asia/Kolkata",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Melbourne",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Paris",
  "Pacific/Auckland",
  "Pacific/Honolulu",
];

type SupportedValuesOf = (key: "timeZone") => string[];

/** All IANA zones available via Intl.supportedValuesOf, or a curated fallback. */
export function listTimezones(): string[] {
  const intlAny = Intl as unknown as { supportedValuesOf?: SupportedValuesOf };
  if (typeof intlAny.supportedValuesOf === "function") {
    try {
      const zones = intlAny.supportedValuesOf("timeZone");
      if (Array.isArray(zones) && zones.length > 0) {
        return zones.includes("UTC") ? zones : ["UTC", ...zones];
      }
    } catch {
      // fall through to fallback
    }
  }
  return [...FALLBACK_ZONES];
}

/**
 * Format a zone's current offset as "UTC", "UTC+2", "UTC-5", "UTC+5:30".
 * Uses Intl shortOffset; parses and strips trailing ":00".
 */
export function formatOffset(zone: string, at: Date = new Date()): string {
  let raw: string;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
  } catch {
    return "UTC";
  }

  // Intl yields values like "GMT", "GMT+2", "GMT-05:30", "UTC", "UTC+2".
  const normalized = raw.replace(/^GMT/, "UTC");
  if (normalized === "UTC" || normalized === "GMT") return "UTC";

  const m = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(normalized);
  if (!m) return normalized;
  const sign = m[1];
  const hours = String(parseInt(m[2], 10));
  const minutes = m[3] ? parseInt(m[3], 10) : 0;
  if (minutes === 0) return `UTC${sign}${hours}`;
  return `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

/** Resolved browser zone, UTC fallback. */
export function defaultTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}
