import { describe, expect, it } from "vitest";
import { validate } from "../lib/validator";
import { fixtures, invalidFixtures } from "./fixtures";

describe("validate — accepts all fixtures", () => {
  for (const { cron } of fixtures) {
    it(cron, () => {
      expect(validate(cron).ok).toBe(true);
    });
  }
});

describe("validate — rejects with friendly errors", () => {
  for (const { cron, matches } of invalidFixtures) {
    it(`rejects ${JSON.stringify(cron)}`, () => {
      const result = validate(cron);
      expect(result.ok).toBe(false);
      expect(result.error?.message).toMatch(matches);
    });
  }
});
