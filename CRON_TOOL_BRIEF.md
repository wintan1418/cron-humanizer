# Project Brief: Cron Humanizer & Builder

> A free, beautiful, developer-focused cron expression tool. Paste a cron → get plain English. Describe a schedule → get cron. Mobile-first. Zero backend. No ads.

---

## 1. The Why

### The problem
Developers hit cron expressions constantly — in crontab, in `schedule.rb` with `whenever`, in GitHub Actions, in Vercel/Netlify jobs, in Kubernetes CronJobs. And every single time, even experienced devs pause and think: *"wait, does `0 */2 * * *` mean every 2 hours or at minute 0 of every 2nd hour?"*

The dominant tool is **crontab.guru**. It works, but:

- It's frozen in 2015 — ugly grey UI, tiny text, no dark mode.
- Mobile is borderline unusable (fixed widths, tiny tap targets).
- It only goes one way: cron → English. No **natural language → cron** builder.
- No copy-ready snippets for Rails (`whenever`), GitHub Actions YAML, Kubernetes manifests, or Linux crontab.
- No shareable preview of the next N runs with timezones.
- No offline / PWA support.

### Our angle
One-page tool. Gorgeous. Fast. Works bidirectionally. Copies output in the format you actually need. Memorable enough that devs star the repo and buy us a coffee.

### Success definition
- Ranks on page 1 of Google for "cron expression explained", "cron humanizer", "cron to english", within 3 months.
- 500 GitHub stars within 6 months.
- Measurable coffee tips (even 5–10 in the first month is validation).
- Developers share screenshots on X / Bluesky / Hacker News.

---

## 2. Non-Goals (what we are NOT building)

- ❌ No user accounts. Ever.
- ❌ No backend, no database, no tracking beyond privacy-respecting Plausible/Umami.
- ❌ No subscription. No "Pro" tier. No feature gating.
- ❌ No team features, sharing collections, saved workspaces.
- ❌ No AI/LLM for parsing (initially) — use deterministic parsers; it's cheaper, faster, and doesn't hallucinate.
- ❌ No quartz cron, no 6-field seconds cron in v1 (stick to classic 5-field).

Resist scope creep. This is a utility, not a platform.

---

## 3. Core Features (v1)

### 3.1 Bidirectional conversion

**Mode A — Cron → English (the crontab.guru replacement)**
- Input: a 5-field cron expression.
- Live output: plain-English description that updates as you type.
- Highlight each field with a color; hover/tap a field to see what it controls.
- Show the next 10 run times in the user's local timezone.
- Timezone picker (default: browser local, but allow UTC and any IANA zone).

**Mode B — English → Cron (the new thing)**
- Input: a natural-language textarea ("every weekday at 9am", "first monday of every month at noon", "every 15 minutes during business hours").
- Output: the cron expression + confidence indicator.
- Use a deterministic grammar (e.g., a small PEG parser) for common phrasings. Fall back to pattern-matching heuristics. If confidence is low, show a "did you mean?" list.
- No network calls. This runs entirely in the browser.

### 3.2 Copy-as formatter
A row of copy buttons beneath the result that copies the expression wrapped in the syntax for the chosen target:

- **Raw crontab line**: `*/5 * * * 1-5 /path/to/command`
- **Rails / whenever gem**:
  ```ruby
  every '*/5 * * * 1-5' do
    rake "my_task"
  end
  ```
- **GitHub Actions**:
  ```yaml
  on:
    schedule:
      - cron: '*/5 * * * 1-5'
  ```
- **Kubernetes CronJob**:
  ```yaml
  spec:
    schedule: "*/5 * * * 1-5"
  ```
- **Vercel Cron** (`vercel.json`):
  ```json
  { "crons": [{ "path": "/api/cron", "schedule": "*/5 * * * 1-5" }] }
  ```
- **node-cron**:
  ```js
  cron.schedule('*/5 * * * 1-5', () => { /* ... */ });
  ```
- **Python APScheduler / celery beat**:
  ```python
  CronTrigger.from_crontab('*/5 * * * 1-5')
  ```

Each button shows a quick "Copied!" micro-animation.

### 3.3 Examples / recipe drawer
A scrollable list of common patterns, each one clickable to load it into the editor:

- Every minute
- Every 5 minutes
- Every hour on the hour
- Every day at midnight UTC
- Every weekday at 9am
- First day of the month at 3am
- Every Sunday at noon
- Every 15 minutes during business hours (9–17, Mon–Fri)
- Last day of the month (edge case — document the limitation)
- First Monday of the month (requires wrapping script; explain why)

### 3.4 URL sharing
The current expression and timezone are reflected in the URL hash:
`cronhuman.app/#e=*/5+*+*+*+1-5&tz=Africa/Lagos`

Visiting that URL pre-loads the state. No backend needed. Every shared link doubles as marketing.

### 3.5 Validation & error states
- Invalid expressions get a red underline + a human-readable error ("Minute field must be 0–59; you entered 60").
- Edge cases: `@reboot`, `@daily`, `@hourly`, `@weekly`, `@monthly`, `@yearly` — support these aliases and explain them.

### 3.6 PWA / offline
Installable. Service worker caches everything. Works on a plane.

---

## 4. Stretch Features (v1.1+)

- **Diff mode**: paste two cron expressions, see how they differ visually and in run frequency.
- **Timezone shift visualizer**: "this job in New York runs at these times in Lagos."
- **Keyboard-only mode**: full keyboard shortcuts, like a mini IDE.
- **CLI companion**: a tiny npm package `npx cronhuman "*/5 * * * 1-5"` that outputs the same result in terminal.
- **VS Code extension**: hover over a cron string in any file, see the explanation inline.
- **History**: last 20 expressions entered, stored in localStorage only.

---

## 5. Tech Stack

Pure frontend. No server. Deploy static.

**Recommended:**
- **Framework**: Vanilla JS + Vite, OR Astro for zero-JS-by-default static generation, OR React + Vite if the team prefers component ergonomics. (Astro is probably ideal — static, fast, SEO-friendly, allows islands of interactivity.)
- **Styling**: Tailwind v4, with a custom design-system layer of CSS variables for the theme.
- **Cron parsing**: [`cron-parser`](https://www.npmjs.com/package/cron-parser) for expression → next runs. [`cronstrue`](https://www.npmjs.com/package/cronstrue) for expression → human, or write our own for better copy (see §7).
- **Natural language → cron**: write a custom small parser. Start with pattern matching; graduate to a tiny PEG grammar if needed. Reference: [`friendly-cron`](https://github.com/) projects for prior art.
- **Timezones**: native `Intl.DateTimeFormat` — no Moment.js, no date-fns-tz bloat.
- **Analytics**: Plausible or Umami (self-hosted or free tier). Cookieless. No GA.
- **Hosting**: Vercel or Netlify or Cloudflare Pages. Free tier covers this indefinitely.
- **Domain**: short and memorable — see §10.

**Why not Rails/Hotwire here:** This is a utility that benefits from CDN-edge-cached static files, instant load, and works offline. A backend is pure overhead. (Save Rails for Project #3 — the uptime checker — where per-URL pages and programmatic SEO genuinely need a server.)

---

## 6. Design Direction

**Commit to a single strong aesthetic.** Don't default to "clean SaaS with purple gradient." Some options worth exploring — pick one, don't blend:

### Option A — Terminal / Monospace Brutalist
- All-monospace typeface (JetBrains Mono, Berkeley Mono, Commit Mono, or IBM Plex Mono).
- Single-color on black (phosphor green, amber, or off-white).
- Visible grid lines, ASCII-style dividers.
- Cursor blinks in inputs. Text types out on load.
- This is the *most on-brand* choice for a developer tool. Recommended.

### Option B — Editorial / Magazine
- Large serif display font (Editorial New, GT Sectra, PP Editorial Old) for the cron expression itself, rendered huge.
- Elegant sans (Söhne, Inter Tight as a fallback) for body.
- Cream background, ink-black text, a single bold accent.
- Feels like reading The New Yorker. Stands out because no dev tool looks like this.

### Option C — Swiss / Grid
- Helvetica Now or Neue Haas Grotesk.
- Strict 12-column grid visible as faint guides.
- Red/black/white only. Swiss poster energy.
- Timeless. Slightly cold but unmistakably designed.

**Non-negotiables regardless of direction:**
- Dark mode default, light mode toggle.
- Mobile-first. The cron editor must work one-handed on a phone.
- Each cron field visibly color-coded (same colors in the input, explanation, and timeline).
- The "next runs" timeline should feel like a living object — not a table.
- Microcopy has personality. Error messages are friendly, not robotic.
- Zero loading spinners. Everything is instant.

**Avoid at all costs:**
- Generic Inter + purple gradient + glassmorphism.
- "Get started for free" hero patterns (this isn't a SaaS).
- Stock illustrations or AI-generated hero imagery.
- Cookie banners (we don't set cookies).

---

## 7. Content & Copy

### The explanation format
Crontab.guru says things like "At every 5th minute past every hour." Stiff. Ours should read like a person explaining:

- `*/5 * * * *` → "Every 5 minutes, around the clock."
- `0 9 * * 1-5` → "Weekdays at 9:00 AM."
- `*/15 9-17 * * 1-5` → "Every 15 minutes during business hours (9 AM–5 PM), weekdays only."
- `0 0 1 * *` → "At midnight on the 1st of every month."

Write a small style guide:
- Use "weekdays" not "Monday through Friday."
- Use 12-hour time with AM/PM unless user prefers 24h.
- Round to natural language: "on the hour" instead of "at minute 0."

### Error messages
- Bad: "Invalid syntax at position 4."
- Good: "The day-of-week field only accepts 0–7 (0 and 7 both mean Sunday). You entered 9."

### Empty state
When the page loads with no expression, the editor already contains a pleasant default (`*/5 * * * 1-5`) so users see a working example immediately.

---

## 8. Monetization Strategy

Single Buy Me a Coffee button. That's it.

**Placement:**
- Footer: always visible, small, polite.
- After a successful "Copy" action: brief, one-time toast near the copied button — *"saved you 5 minutes? [buy me a coffee ☕]"*. Dismissible and remembered in localStorage.
- GitHub README: star button, coffee button, nothing else.

**Don't:**
- Pop up anything on page load.
- Gate any feature.
- Ask for email.
- Run ads.
- Inject referral links.

The goal is not revenue. It's signal that the tool matters to real people.

---

## 9. SEO & Distribution Plan

### On-page SEO
- `<title>`: "Cron Humanizer — explain any cron expression in plain English"
- Meta description that earns the click.
- Open Graph image generated dynamically per shared URL, showing the expression + its English translation. (Static fallback for the homepage.)
- JSON-LD structured data marking this as a SoftwareApplication.
- Semantic HTML. Real `<h1>`, real landmarks.

### Programmatic SEO (if using Astro)
Pre-generate static pages for the top ~200 most-searched cron expressions:
- `/explain/every-5-minutes`
- `/explain/every-weekday-at-9am`
- `/explain/first-monday-of-month`

Each page has the expression, the explanation, the next runs, and a canonical link back to the editor. This is a gold mine for long-tail search.

### Launch distribution
1. **Soft launch**: ship to a private URL, get 3–5 dev friends to try it for a week, fix rough edges.
2. **Product Hunt**: Tuesday launch. Prepare gallery assets. Line up 10 people to upvote in the first hour.
3. **Hacker News**: "Show HN: Cron Humanizer — a mobile-friendly, bidirectional crontab.guru." Post at ~9am ET on a weekday.
4. **Reddit**: r/programming, r/devops, r/webdev, r/selfhosted. Lead with a screenshot, not the link.
5. **X / Bluesky**: record a 15-second screen capture of typing natural language and getting cron out. That's the hook.
6. **Dev.to / Hashnode**: write the build-in-public post — "I rebuilt crontab.guru because its mobile experience ruined my flight."
7. **GitHub**: make the repo public, with the README itself being a conversion surface (link to live tool, coffee button, star call-to-action).

---

## 10. Naming & Domain

Brainstorm — pick what feels right, or use as jumping-off points:

- **cronhuman.app** — clear, descriptive.
- **cron.fyi** — short, memorable, developer energy.
- **saycron.com** — puts the bidirectional angle in the name.
- **cronzen.app** — calm vibe, good for the aesthetic direction.
- **readcron.com** — mirrors "readme".
- **plainсron.dev** — functional.
- **crondecoder.com** — SEO-friendly for literal searchers.
- **crontab.dev** — if available, a direct shot across crontab.guru's bow.

Check availability on Namecheap and Porkbun. `.app` domains require HTTPS by default (good). Keep it under 12 characters.

---

## 11. Project Structure

```
cron-humanizer/
├── README.md                 # Public-facing, links to live tool, coffee, repo
├── PROJECT_BRIEF.md          # This file
├── LICENSE                   # MIT
├── package.json
├── vite.config.ts            # or astro.config.mjs
├── public/
│   ├── favicon.svg
│   ├── og-default.png
│   └── manifest.webmanifest  # PWA
├── src/
│   ├── main.ts               # entry
│   ├── styles/
│   │   ├── tokens.css        # CSS variables (colors, fonts, spacing)
│   │   └── global.css
│   ├── components/
│   │   ├── CronEditor.ts     # the main input with field highlighting
│   │   ├── Explanation.ts    # plain-English output
│   │   ├── NextRuns.ts       # timeline of upcoming executions
│   │   ├── CopyAs.ts         # format picker + copy buttons
│   │   ├── Examples.ts       # recipes drawer
│   │   ├── NaturalInput.ts   # English → cron mode
│   │   └── TimezonePicker.ts
│   ├── lib/
│   │   ├── cron-to-english.ts  # custom humanizer (or wrap cronstrue)
│   │   ├── english-to-cron.ts  # the natural language parser
│   │   ├── next-runs.ts        # wraps cron-parser
│   │   ├── formatters/         # per-target snippet generators
│   │   │   ├── rails.ts
│   │   │   ├── github-actions.ts
│   │   │   ├── kubernetes.ts
│   │   │   ├── vercel.ts
│   │   │   ├── node-cron.ts
│   │   │   └── python.ts
│   │   ├── url-state.ts        # hash encode/decode
│   │   └── validator.ts
│   └── pages/
│       ├── index.astro         # the app
│       └── explain/
│           └── [slug].astro    # programmatic SEO pages
├── tests/
│   ├── cron-to-english.test.ts
│   ├── english-to-cron.test.ts
│   └── fixtures.ts             # dozens of canonical examples
└── .github/
    └── workflows/
        ├── ci.yml              # test + typecheck on PRs
        └── deploy.yml          # ship to hosting on main
```

---

## 12. Build Plan — Day by Day

**Day 1 — Core engine (no UI beyond raw)**
- Set up project (Astro or Vite).
- Wire up `cron-parser` for next-run calculation.
- Write `cron-to-english.ts` with 30 test fixtures covering every field combination.
- Build a barebones page: input → explanation + next 5 runs. Ugly is fine.

**Day 2 — UI pass**
- Commit to the chosen aesthetic from §6.
- Design tokens in `tokens.css`.
- Style the editor, explanation, and next-runs timeline.
- Add field color-coding (same color token used in input, in the explanation, in the timeline).
- Dark/light toggle.
- Mobile layout — test on a real phone.

**Day 3 — Natural language + copy-as**
- Write `english-to-cron.ts`. Start with 20 phrasings that must work; expand from there.
- Add "Mode B" toggle in the UI.
- Build the copy-as bar with all 7 target formats.
- Micro-animation for copy success.

**Day 4 — Polish, SEO, ship**
- URL state syncing.
- Examples drawer populated.
- `robots.txt`, `sitemap.xml`, OG image, meta tags.
- Write the README with screenshots, star + coffee buttons.
- PWA manifest + service worker.
- Deploy to production URL.
- Private soft-launch to a few dev friends.

---

## 13. Testing Strategy

**Fixtures file (`tests/fixtures.ts`):**
A single array of `{ cron, english, nextRun }` tuples, at least 50 entries, covering:
- All five fields at various values.
- All aliases (`@daily`, etc.).
- Ranges, lists, steps.
- Edge cases (`0 0 29 2 *`, `0 0 31 * *`, leap years).
- Invalid expressions that should error with specific messages.

Both parsers (cron→english and english→cron) run against this fixture set. Any new case gets a test before the code.

**Manual QA checklist for v1:**
- Works on iOS Safari (the hardest target).
- Works with keyboard only, no mouse.
- Lighthouse performance ≥ 95.
- Lighthouse accessibility = 100.
- `prefers-reduced-motion` respected.
- First paint under 1 second on 3G.

---

## 14. The README (public-facing)

Keep it short and conversion-focused:

```markdown
# Cron Humanizer

Read, write, and understand cron expressions without losing your mind.

**[→ Try it live](https://cronhuman.app)**

- Type cron → get plain English.
- Type English → get cron.
- Copy as Rails / GitHub Actions / Kubernetes / Vercel / node-cron / Python.
- Mobile-friendly. Dark mode. Works offline.
- No ads. No tracking. No account.

![Screenshot](./docs/screenshot.png)

## If it saved you time

⭐ Star the repo.
☕ [Buy me a coffee](https://buymeacoffee.com/yourhandle).
🐛 [Report a bug](../../issues/new).

## Running locally

\```bash
npm install
npm run dev
\```

## License

MIT
```

---

## 15. Open Questions (decide before starting)

1. Astro vs Vite+React vs vanilla — pick one before Day 1.
2. Aesthetic direction — Option A, B, or C from §6?
3. Domain name — register before launch.
4. Analytics provider — Plausible (hosted €9/mo) or Umami (self-host, free)?
5. Write the humanizer from scratch, or start with `cronstrue` and rewrite copy?

---

## 16. Risks & Honest Counterpoints

- **Crontab.guru has massive SEO moat.** We can't outrank it on the top keyword day one. The play is to win the *mobile* keyword, the *"explain cron"* long tail, and the *"english to cron"* keyword where it has no competition.
- **Cronstrue already exists** and does cron→english well. Our differentiation has to be the bidirectional angle, the copy-as formatters, and the design. If we just re-skin cronstrue, we're a wrapper.
- **Natural language → cron is hard to get right.** Start narrow. Ship 20 phrasings that work perfectly rather than 200 that work 70% of the time. Document what doesn't work yet.
- **"No backend" limits growth features.** That's a feature, not a bug, for v1. If this tool ever justifies a backend, it'll be for something concrete (scheduled webhook testing?) not for its own sake.

---

## 17. The One Thing to Remember

Developers install, star, and share tools that feel like they were made by one specific person with taste — not by a committee building a platform. Every design decision should reinforce that feeling. If you're deciding between "safe" and "memorable", pick memorable.

Ship it in 4 days. Iterate based on what people actually use.
