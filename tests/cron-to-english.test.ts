import { describe, expect, it } from "vitest";
import { CronParseError, humanize, parse } from "../lib/cron-to-english";
import { fixtures, invalidFixtures } from "./fixtures";

describe("humanize", () => {
  for (const { cron, english, note } of fixtures) {
    const label = note ? `${cron}  (${note})` : cron;
    it(label, () => {
      expect(humanize(cron)).toBe(english);
    });
  }
});

describe("parse (invalid inputs)", () => {
  for (const { cron, matches } of invalidFixtures) {
    it(`rejects ${JSON.stringify(cron)}`, () => {
      expect(() => parse(cron)).toThrow(CronParseError);
      try {
        parse(cron);
      } catch (err) {
        expect((err as Error).message).toMatch(matches);
      }
    });
  }
});
