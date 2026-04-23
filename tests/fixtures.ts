// Canonical cron ⇄ English fixtures. Both parsers run against these.
// When you add a new case, add the test BEFORE the implementation.

export interface Fixture {
  cron: string;
  english: string;
  note?: string;
}

export const fixtures: Fixture[] = [
  // --- aliases ---
  { cron: "@hourly", english: "Every hour, on the hour." },
  { cron: "@daily", english: "Every day at midnight." },
  { cron: "@midnight", english: "Every day at midnight." },
  { cron: "@weekly", english: "Every Sunday at midnight." },
  { cron: "@monthly", english: "At midnight on the 1st of every month." },
  { cron: "@yearly", english: "At midnight on January 1st." },
  { cron: "@annually", english: "At midnight on January 1st." },

  // --- degenerate / every-minute ---
  { cron: "* * * * *", english: "Every minute." },

  // --- step-minute ---
  { cron: "*/5 * * * *", english: "Every 5 minutes, around the clock." },
  { cron: "*/15 * * * *", english: "Every 15 minutes, around the clock." },
  { cron: "*/30 * * * *", english: "Every 30 minutes, around the clock." },

  // --- on-the-hour ---
  { cron: "0 * * * *", english: "Every hour, on the hour." },

  // --- every day at time ---
  { cron: "0 0 * * *", english: "Every day at midnight." },
  { cron: "0 12 * * *", english: "Every day at noon." },
  { cron: "0 9 * * *", english: "Every day at 9:00 AM." },
  { cron: "30 2 * * *", english: "Every day at 2:30 AM." },
  { cron: "45 17 * * *", english: "Every day at 5:45 PM." },

  // --- weekdays / weekends ---
  { cron: "0 9 * * 1-5", english: "Weekdays at 9:00 AM." },
  { cron: "0 9 * * 0,6", english: "Weekends at 9:00 AM." },

  // --- single day-of-week ---
  { cron: "0 12 * * 1", english: "Mondays at noon." },
  { cron: "0 12 * * 0", english: "Sundays at noon." },
  { cron: "0 12 * * 7", english: "Sundays at noon.", note: "7 canonicalizes to 0" },

  // --- day-of-month ---
  { cron: "0 0 1 * *", english: "At midnight on the 1st of every month." },
  { cron: "0 0 15 * *", english: "At midnight on the 15th of every month." },
  { cron: "0 0 1 1 *", english: "At midnight on January 1st." },

  // --- showpieces ---
  {
    cron: "*/15 9-17 * * 1-5",
    english:
      "Every 15 minutes during business hours (9 AM–5 PM), weekdays only.",
  },
  {
    cron: "0 9-17 * * 1-5",
    english: "Every hour during business hours (9 AM–5 PM), weekdays only.",
  },
];

export interface InvalidFixture {
  cron: string;
  matches: RegExp; // the error message must match this
}

export const invalidFixtures: InvalidFixture[] = [
  { cron: "60 * * * *", matches: /minute.*0–59.*60/i },
  { cron: "* 25 * * *", matches: /hour.*0–23.*25/i },
  { cron: "* * * * 9", matches: /day-of-week.*0.*7.*9/i },
  { cron: "* * * 13 *", matches: /month.*1.*12.*13/i },
  { cron: "", matches: /empty/i },
  { cron: "* * *", matches: /expected 5 fields/i },
];
