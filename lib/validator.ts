// Validates a cron expression and surfaces a friendly error message.
// Leans on the humanizer's parser — that parser throws CronParseError with
// the user-facing string already baked in, so this module just routes.

import { CronParseError, parse } from "./cron-to-english";

export interface ValidationResult {
  ok: boolean;
  error?: { field: string; message: string };
}

export function validate(expr: string): ValidationResult {
  try {
    parse(expr);
    return { ok: true };
  } catch (err) {
    if (err instanceof CronParseError) {
      return {
        ok: false,
        error: { field: err.field, message: `${err.field} ${err.reason}` },
      };
    }
    return {
      ok: false,
      error: { field: "expression", message: "unknown parse error" },
    };
  }
}
