# CLAUDE.md

Guidance for Claude Code when working in the **cron-humanizer** repo.

## What this project is

A free, one-page, zero-backend developer tool that converts cron expressions
to plain English and back. Mobile-first, PWA-capable, designed to replace
[crontab.guru](https://crontab.guru) with a better mobile UX, a natural-language
builder, and copy-as snippets for Linux / Rails / GitHub Actions / Kubernetes /
Vercel / node-cron / Python.

Codename **Chron**.

Full product scope lives in [`CRON_TOOL_BRIEF.md`](./CRON_TOOL_BRIEF.md).
Full visual system lives in [`DESIGN_SPEC.md`](./DESIGN_SPEC.md).
Visual reference mock: https://claude.ai/design/p/565d8991-967d-459b-ab5a-32272b1d8587?file=Designs.html

Read both before shipping anything beyond a trivial fix.

## Stack

- **Framework:** Next.js 16 (App Router) — `app/` directory, not `src/`
- **Language:** TypeScript, strict
- **Styling:** Tailwind v4 via `@tailwindcss/postcss`, with **CSS custom
  properties as the design-token layer** (see `DESIGN_SPEC.md §1.2 / §2.2`)
- **React:** 19
- **Tests:** not yet wired — use Vitest when added (see §Testing below)

The brief's alternative stacks (Astro, Vite+vanilla) are **not** the chosen
path. Do not suggest migrating away from Next.js unless asked.

## Commands

```bash
npm install           # install dependencies
npm run dev           # local dev server on http://localhost:3000
npm run build         # production build
npm run start         # run the production build
npm run lint          # eslint (next/core-web-vitals)
```

## Repo layout (current + intended)

```
app/                      # Next.js App Router — pages, layouts, globals.css
  components/             # one JSX component per concept, < 200 lines each
    ExpressionInput.tsx
    HumanSentence.tsx
    NextRuns.tsx
    FormatTabs.tsx
    CodeBlock.tsx
    Timeline.tsx
    Annotation.tsx
  lib/
    cron-to-english.ts    # humanizer — write this first
    english-to-cron.ts    # natural-language parser
    next-runs.ts          # wraps cron-parser
    formatters/           # per-target snippets: linux, rails, gha, k8s, vercel, node, python
    url-state.ts          # hash encode/decode
    validator.ts
public/                   # static assets, favicons, og image
tests/
  fixtures.ts             # the canonical list of { cron, english } pairs
  cron-to-english.test.ts
  english-to-cron.test.ts
```

The folders under `app/components/`, `app/lib/`, and `tests/` don't exist yet.
Create them as you add the files.

## Non-negotiables

These are hard rules, pulled from the brief and design spec. Do not relax them.

1. **No backend, no accounts, no database, no tracking cookies.** Everything
   runs in the browser. If a feature seems to need a server, it's out of scope.
2. **No AI/LLM parsing.** Deterministic parsers only. Cheaper, faster, never
   hallucinates.
3. **Mobile-first.** Every component must hold at 375 px. If it only works on
   desktop, cut it.
4. **Both themes day one.** Light and dark. No light-only ship.
5. **CSS variables for every token.** No hard-coded hex values in components.
6. **One JSX component per concept.** Each file under 200 lines.
7. **No shadows, gradients, illustrations, emoji, or decorative icons.** The
   only icons allowed are the small 1-px line glyph set (copy, chevron, share,
   external). Draw them as inline SVG.
8. **Classic 5-field cron in v1.** 6-field seconds cron is post-v1.
9. **Humanized sentence is a first-class element** — same scale or larger
   than the cron expression, never a subtitle.
10. **Motion is small.** 120–180 ms ease-out. `prefers-reduced-motion` cuts
    durations to 0.

## Design direction — locked

**Direction A (Editorial) with softened terracotta palette**, plus three
elements borrowed from Direction B:

1. Numbered section labels (`§1`, `§2`, …) as micro-eyebrows over major blocks.
2. The **NOTE callout** (dashed `--marker` amber border) for editorial asides.
3. The **timeline bar** above the next-runs table (tick marks + `now` square).

Everything else follows Direction A: Newsreader + Inter + JetBrains Mono,
warm paper background, terracotta `--accent` (`#B85C38` light / `#E89468`
dark), hairline rules, no shadows, no gradients. Full token set and component
recipes in `DESIGN_SPEC.md §1`.

## Build order (matches brief §12)

1. **Engine.** Write `lib/cron-to-english.ts` + `lib/next-runs.ts` with
   fixture tests *before* touching UI.
2. **Tokens.** Set up `app/globals.css` with the chosen direction's CSS
   variables, light + dark. Kill the Next.js boilerplate.
3. **UI.** Build `ExpressionInput`, `HumanSentence`, `NextRuns`, `FormatTabs`.
4. **Natural language mode.** `lib/english-to-cron.ts` + `NaturalInput.tsx`.
   Start with 20 phrasings that work perfectly.
5. **Copy-as formatters + URL state + OG image.**
6. **PWA + deploy.**

## Testing

Acceptance is driven by a **fixture file** (`tests/fixtures.ts`) — at least 50
`{ cron, english, nextRun }` tuples covering every field combo, aliases,
ranges/lists/steps, leap-year edges, and invalid inputs. Both parsers run
against the same fixtures. New cases get a failing test before the fix.

Install Vitest when first needed:

```bash
npm install -D vitest
```

Target: Lighthouse performance ≥ 95, accessibility = 100.

## Copy style (for strings you output in UI)

- "Weekdays", not "Monday through Friday".
- 12-hour with AM/PM by default, 24h opt-in.
- "On the hour", not "at minute 0".
- Error messages are friendly and specific: "The day-of-week field only
  accepts 0–7. You entered 9." — never "Syntax error at position 4."

Example humanizer outputs:

| cron | english |
|---|---|
| `*/5 * * * *` | "Every 5 minutes, around the clock." |
| `0 9 * * 1-5` | "Weekdays at 9:00 AM." |
| `*/15 9-17 * * 1-5` | "Every 15 minutes during business hours (9 AM–5 PM), weekdays only." |
| `0 0 1 * *` | "At midnight on the 1st of every month." |

## Git workflow

- `main` is the default branch.
- Commits on this repo **do not include a `Co-Authored-By` trailer**. This is
  the user's personal repo; commits should appear authored solely by them.
- Create small, focused commits. Use a new commit for each logical change,
  never amend merged commits.
- Don't push without the user asking, except the first-commit bootstrap.

## Out of scope for v1 (don't drift into these)

- Quartz / 6-field seconds cron
- User accounts, saved workspaces, team features
- Subscription / Pro tier / feature gating
- Blog, marketing site, onboarding flow
- Animated hero, mascot, illustration
- Any ads, referral links, or cookie banners

## When in doubt

Ask before expanding scope. This is a utility, not a platform — its power
comes from being small, fast, beautiful, and correct.
