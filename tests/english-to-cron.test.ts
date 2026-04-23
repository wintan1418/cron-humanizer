import { describe, expect, it } from "vitest";
import { englishToCron } from "../lib/english-to-cron";

// The 20 phrasings that must work perfectly (see CRON_TOOL_BRIEF §3.1 / §16).
const HIGH_CONFIDENCE_CASES: Array<[string, string]> = [
  ["every minute", "* * * * *"],
  ["every 5 minutes", "*/5 * * * *"],
  ["every 15 minutes", "*/15 * * * *"],
  ["every 30 minutes", "*/30 * * * *"],
  ["every hour", "0 * * * *"],
  ["every hour on the hour", "0 * * * *"],
  ["every 2 hours", "0 */2 * * *"],
  ["every day at midnight", "0 0 * * *"],
  ["every day at noon", "0 12 * * *"],
  ["every day at 9am", "0 9 * * *"],
  ["every day at 5pm", "0 17 * * *"],
  ["weekdays at 9am", "0 9 * * 1-5"],
  ["every weekday at 9am", "0 9 * * 1-5"],
  ["weekends at noon", "0 12 * * 0,6"],
  ["mondays at 9am", "0 9 * * 1"],
  ["every monday at 9am", "0 9 * * 1"],
  ["fridays at 5pm", "0 17 * * 5"],
  ["every 15 minutes during business hours", "*/15 9-17 * * 1-5"],
  [
    "every 15 minutes between 9am and 5pm on weekdays",
    "*/15 9-17 * * 1-5",
  ],
  ["on the 1st of every month at midnight", "0 0 1 * *"],
  ["first of every month at midnight", "0 0 1 * *"],
  ["on the 15th at noon", "0 12 15 * *"],
  ["15th of every month at noon", "0 12 15 * *"],
  ["every january 1st", "0 0 1 1 *"],
  ["january 1st at midnight", "0 0 1 1 *"],
  ["every sunday at midnight", "0 0 * * 0"],
];

describe("englishToCron — 20 phrasings (high confidence)", () => {
  for (const [input, expected] of HIGH_CONFIDENCE_CASES) {
    it(`"${input}" → ${expected}`, () => {
      const r = englishToCron(input);
      expect(r.cron).toBe(expected);
      expect(r.confidence).toBe("high");
    });
  }
});

describe("englishToCron — case & whitespace tolerance", () => {
  it("is case-insensitive", () => {
    expect(englishToCron("EVERY DAY AT 9AM").cron).toBe("0 9 * * *");
    expect(englishToCron("Every Monday At 9am").cron).toBe("0 9 * * 1");
    expect(englishToCron("WEEKDAYS AT 9AM").cron).toBe("0 9 * * 1-5");
  });

  it("handles extra whitespace and trailing punctuation", () => {
    expect(englishToCron("  every   5   minutes  ").cron).toBe("*/5 * * * *");
    expect(englishToCron("every day at 9am.").cron).toBe("0 9 * * *");
  });

  it("accepts 9am / 9 AM / 9:00 AM variations", () => {
    const expected = "0 9 * * *";
    expect(englishToCron("every day at 9am").cron).toBe(expected);
    expect(englishToCron("every day at 9 AM").cron).toBe(expected);
    expect(englishToCron("every day at 9:00 AM").cron).toBe(expected);
    expect(englishToCron("every day at 9:00am").cron).toBe(expected);
  });

  it("accepts 5pm / 5 PM / 17:00 variations", () => {
    const expected = "0 17 * * *";
    expect(englishToCron("every day at 5pm").cron).toBe(expected);
    expect(englishToCron("every day at 5 PM").cron).toBe(expected);
    expect(englishToCron("every day at 5:00 PM").cron).toBe(expected);
    expect(englishToCron("every day at 17:00").cron).toBe(expected);
  });
});

describe("englishToCron — unknown inputs", () => {
  it("returns null cron for 'fortnightly'", () => {
    const r = englishToCron("fortnightly");
    expect(r.cron).toBeNull();
    expect(r.confidence).toBe("low");
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.suggestions.some((s) => /2 weeks/.test(s))).toBe(true);
  });

  it("returns null cron for 'quarterly'", () => {
    const r = englishToCron("quarterly");
    expect(r.cron).toBeNull();
    expect(r.confidence).toBe("low");
    expect(r.suggestions.some((s) => /3 months/.test(s))).toBe(true);
  });

  it("returns null cron for 'last friday of the month'", () => {
    const r = englishToCron("last friday of the month");
    expect(r.cron).toBeNull();
    expect(r.confidence).toBe("low");
    expect(r.suggestions.length).toBeGreaterThan(0);
  });

  it("returns null cron for gibberish and marks unknown tokens", () => {
    const r = englishToCron("asdf qwer zxcv");
    expect(r.cron).toBeNull();
    expect(r.confidence).toBe("low");
    expect(r.tokens).toBeDefined();
    const unknowns = r.tokens!.filter((t) => !t.known).map((t) => t.text);
    expect(unknowns.length).toBeGreaterThan(0);
  });

  it("marks 'fortnightly' itself as an unknown token", () => {
    const r = englishToCron("fortnightly");
    expect(r.tokens).toBeDefined();
    expect(r.tokens!.some((t) => /fortnightly/i.test(t.text) && !t.known)).toBe(true);
  });
});

describe("englishToCron — empty input", () => {
  it("returns a safe empty result for empty string", () => {
    const r = englishToCron("");
    expect(r.cron).toBeNull();
    expect(r.confidence).toBe("low");
  });

  it("returns a safe empty result for whitespace-only", () => {
    const r = englishToCron("    ");
    expect(r.cron).toBeNull();
  });
});
