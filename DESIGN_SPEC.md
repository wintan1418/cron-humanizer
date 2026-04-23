# Chron — Design Spec

> A complete, implementation-ready design guide for the Chron cron humanizer.
> Paired with `CRON_TOOL_BRIEF.md` (what to build) — this doc is *how it looks and feels.*
>
> **Decision (2026-04-23): Direction A — Editorial is the chosen path**, with
> the **wine + gold palette** in §1.2 and three elements borrowed from
> Direction B: (1) numbered section labels (§1, §2…), (2) the NOTE callout
> (dashed amber border), and (3) the timeline bar above the next-runs table.
> Everything else (type stack, spacing, component recipes) follows A.
> Direction B below is kept for reference — do not build it.
>
> **Palette history:** started ember `#C2410C` → softened to terracotta
> `#B85C38` → landed on **wine `#6E2433` + antique gold `#EDDBA2`** after
> initial render looked too orange. Wine is the single primary accent;
> gold is its soft companion (chip fill, code flash) plus the warmer
> `#A9862B` gold is used as a secondary flourish (brand wordmark, timeline
> ticks) so the page reads as a deliberate wine-and-gold two-voice, not
> a monochrome accent.

---

## 0. Ground rules (apply to both directions)

- **No editor/IDE/terminal tropes.** No window chrome, no traffic lights, no
  fake prompt cursor. This tool is for developers but it shouldn't *cosplay*
  as a dev tool.
- **Mobile-first.** Every component must hold together at 375 px wide. If an
  idea only works on desktop, cut it.
- **One-page app.** All content stacks on one URL; no modals for primary flow.
- **Type > ornament.** Typography, whitespace, and rules do the work. No
  gradients, no drop shadows, no illustrations, no emoji, no icons beyond a
  handful of 1-px line glyphs (copy, share, chevron).
- **AA contrast minimum** in both themes. Test with dev tools.
- **Motion is small.** 120–180 ms ease-out for UI state; next-runs list does
  not animate entries in/out. Respect `prefers-reduced-motion`.
- **Numeric content uses monospace** always. Human prose uses the direction's
  prose face. The *cron expression itself* uses monospace at display size.
- **The human translation is a first-class element** — same scale or larger
  than the cron, not a subtitle.

---

## 1. Direction A — Editorial

### 1.1 Feel

A well-set technical book. Stripe-docs calm. Airy, typographic, warm. The page
reads top-down like an article; the cron is the headline, the humanized
sentence is the lede, and everything else is body.

### 1.2 Color tokens (wine + gold, 2026-04-23)

Two-voice palette: **wine** `#6E2433` is the primary accent (field
baselines, active tab underlines, chip borders, humanized-sentence italic
emphasis). **Gold** wears two weights: a pale antique gold `#EDDBA2`
(`--accent-soft`) for washes, and a rich warm gold `#A9862B` (`--gold`)
for brand-level flourishes (the wordmark, the timeline ticks) that should
catch the eye without fighting wine for primary attention. `--marker`
amber stays reserved for NOTE callouts only.

```css
/* light */
--paper:        #F6F2EA;  /* warm off-white page background */
--paper-soft:   #EDE7DC;  /* code-block fill, subtle panels */
--ink:          #1E1B18;  /* primary text, strong rules */
--ink-soft:     #5A544E;  /* secondary text, eyebrows */
--rule:         #D4CABA;  /* hairline rules, borders */
--accent:       #6E2433;  /* wine — primary accent */
--accent-soft:  #EDDBA2;  /* antique gold wash — chip fill, code flash */
--gold:         #A9862B;  /* rich gold — wordmark, timeline ticks */
--marker:       #B45309;  /* amber — NOTE callouts only */
```

Dark mode (paired, not optional):

```css
--paper:        #14120F;
--paper-soft:   #1E1B17;
--ink:          #EDE7DB;
--ink-soft:     #9A9288;
--rule:         #2C2924;
--accent:       #D48F99;  /* lighter wine for dark bg */
--accent-soft:  #3C1F26;  /* deep wine wash */
--gold:         #D6B163;  /* brighter gold for dark */
--marker:       #FDBA74;
```

Use `color-mix()` or CSS `@media (prefers-color-scheme)` — do both themes on
day one, don't bolt dark on later.

### 1.3 Type system

| Role | Font | Size / line | Weight | Tracking |
|---|---|---|---|---|
| Display prose (humanized sentence) | **Newsreader** | 52 / 58 desktop, 28 / 34 mobile | 400, italic for accents | −0.015 em |
| Section titles | **Newsreader** | 26 / 32 | 500 | −0.01 em |
| Body | **Inter** | 14 / 22 | 400 | 0 |
| Eyebrows / micro labels | **JetBrains Mono** | 11, UPPERCASE | 400 | 0.12 em |
| The cron itself | **JetBrains Mono** | 72 / 72 desktop, 36 / 40 mobile | 500 | −0.01 em |
| Code blocks & tabular numbers | **JetBrains Mono** | 13 / 22 | 400 | 0 |

Load from Google Fonts: `Inter`, `Newsreader` (optical sizing on), `JetBrains Mono`.

### 1.4 Spacing & grid

- **Page gutter:** 56 px desktop, 22 px mobile.
- **Section rhythm:** 72 px top / 48 px bottom of each block on desktop; 36 px
  / 24 px on mobile.
- **Hairlines only:** 1 px rules at `--rule`. Section separators use `--ink`
  (strong) at 1 px.
- **No rounded corners** above 8 px. Code blocks 8 px radius; chips/pills 999 px
  (full round). Inputs have no visible border — they sit on a hairline baseline.

### 1.5 Component recipes

**Expression input (hero).**
Five side-by-side columns, each is an editable field.
- Each field: eyebrow label above (`MINUTE`, `HOUR`, `DAY`, `MONTH`, `WEEKDAY`),
  the value in 72 px mono, a 1 px baseline underneath.
- Baseline is `--accent` on fields whose value isn't `*`; `--rule` when it is.
  This gives an at-a-glance sense of which fields are constrained.
- Tap/click a field to edit in-place. Field keeps its baseline color logic.

**Humanized sentence.**
- Newsreader 52 px.
- Nouns that map to fields are wrapped in `<em>` styled italic + `--accent`
  color. Clicking an emphasized noun focuses the corresponding input field.
- Sentence lives *below* the expression, separated by generous whitespace
  (56 px desktop, 32 px mobile).

**Quick chips row.**
- Pill-shaped (999 px), 1 px border at `--rule`, mono 12 px.
- Active/selected state: border `--accent`, background `--accent-soft`.
- Hover on desktop: border becomes `--ink`.

**Next-runs list.**
- Table with 4 columns desktop (`Relative day`, `Absolute date`, `Time`, `Δ`),
  2 columns mobile (`Time`, `Δ`).
- Header row: eyebrow micro label.
- Row separator: hairline `--rule`. First row is separated from header by a
  1 px `--ink` line.
- Time column is right-aligned mono; everything else is serif/sans baseline.

**Format tabs.**
- Underline-style tabs. Active tab has a 2 px `--accent` underline.
- On mobile: horizontal scroll, snap-stop per tab. Tabs become pill-shaped
  (999 px) filled `--ink` when active.

**Code block.**
- `--paper-soft` fill, 1 px `--rule` border, 8 px radius.
- 20/22 px padding. YAML keys/selectors in `--accent`, comments in `--ink-soft`.
- Copy button top-right: mono 11 px, 1 px `--rule` border, `--paper` fill.

**Field reference (collapsible).**
- Simple 3-column table: name · range · example. Hairline separators.

### 1.6 What Direction A avoids

- Big colored buttons. Primary actions are text + underline or hairline-bordered.
- Icons as decoration. Copy icon is fine; dashboards of pictograms are not.
- Cards with shadows. Nothing floats. Everything sits on rules.

---

## 2. Direction B — Schematic

### 2.1 Feel

A technical reference drawing, circa mid-century Swiss. The page is a framed
sheet with numbered sections (§1, §2, §3). Everything feels *drawn*, with a
faint grid bleeding through. Annotations live in the margins.

### 2.2 Color tokens

```css
--paper:         #F2F1EC;  /* pale cool paper */
--paper-deep:    #E6E4DB;  /* panel fill */
--graphite:      #1B1D1F;  /* primary ink */
--graphite-soft: #5A5D61;  /* secondary */
--rule:          #C4C1B4;  /* hairlines, grid */
--rule-strong:   #1B1D1F;  /* frame borders */
--accent:        #0F766E;  /* muted teal — active fields, code keywords */
--accent-soft:   #CFE4E1;  /* teal wash — active field fill */
--marker:        #B45309;  /* annotation amber — notes, callouts */
```

Dark mode (optional but recommended):

```css
--paper:         #141512;
--paper-deep:    #1C1D19;
--graphite:      #EDECE3;
--graphite-soft: #8D8F89;
--rule:          #2F312B;
--rule-strong:   #EDECE3;
--accent:        #5EEAD4;
--accent-soft:   #123B37;
--marker:        #FDBA74;
```

### 2.3 Type system

| Role | Font | Size / line | Weight | Tracking |
|---|---|---|---|---|
| Prose (humanized sentence) | **IBM Plex Sans** | 34 / 41 desktop, 19 / 25 mobile | 400 | −0.01 em |
| Section titles | **IBM Plex Sans** | 22 / 28 | 500 | −0.01 em |
| Body | **IBM Plex Sans** | 13 / 20 | 400 | 0 |
| Micro labels (`§1`, `F1`, `MIN`) | **IBM Plex Mono** | 10, UPPERCASE | 400 | 0.14 em |
| The cron field values | **IBM Plex Mono** | 40 / 40 desktop, 16 / 18 mobile | 500 | 0 |
| Code & tabular | **IBM Plex Mono** | 13 / 22 | 400 | 0 |

### 2.4 Spacing, grid, frame

- The **page itself** gets a 32 × 32 px faint grid (`--rule` at 20 % alpha),
  fixed — it does not scroll with content. This is the defining visual motif.
- Around the whole document is a 1 px `--rule-strong` frame with 20 px margin.
- The frame is subdivided by 1 px `--rule-strong` lines into title strip,
  expression block, presets strip, runs + formats grid, and a footer strip.
- Every internal panel uses 1 px `--rule-strong` borders — **no radii anywhere**.
  The only exception is the faint grid itself, which is dotted/continuous.

### 2.5 Component recipes

**Title strip.**
- 3-column bar at top of the frame: sheet id left, product name center,
  revision + timezone right. Each column separated by a vertical rule.
- Eyebrow micro labels over every cell; mono values beneath.

**Field schematic (the 5 cron fields).**
- Each field is a bordered rectangle. Top-left corner has a floating `F1`…`F5`
  label that breaks the top border (like a schematic part number).
- Active fields (value ≠ `*`) are filled `--accent-soft`.
- Below the row is a row of `↳` annotations in mono `--marker` explaining each
  field ("every 15", "9 am – 5 pm", "any", "any", "Mon–Fri").

**Humanized sentence.**
- Lives in a bordered panel below the field row.
- A vertical `HUMAN` label (rotated 180°, small-caps mono) on the left edge of
  the panel — like a tab on a filing card.
- Editable spans are **underlined with 2 px `--accent`**, 4 px underline-offset.
  Tapping an underline edits the clause.

**Presets strip.**
- Full-width band inside the frame. Bordered rectangles (not pills), 1 px
  `--rule-strong`. Mono text. Sits between expression and runs.

**Timeline + runs.**
- Above the runs table: a 1 px horizontal timeline with tick marks at each run
  position and one filled square at "now". Labels below (`now`, `+1 h`,
  `+6 h`, `tomorrow`, `+3 d`).
- Runs table has 4 columns: `#` (mono, soft), `When` (mono), `Time`
  (mono, right-aligned), `Δ` (mono, soft, right-aligned).
- Separated from the formats column by a vertical 1 px `--rule`.

**Format picker.**
- A 3 × 2 grid of bordered cells. Each cell: number (`01`…`06`) in mono micro,
  format name large (`LINUX`, `GHA`, `RAILS`, `K8S`, `VERCEL`, `NODE`),
  subtitle small.
- Active cell is filled `--accent-soft`. No other state changes — it's a map,
  not a button.

**Code output panel.**
- Bordered, no radius. Filename + `⌘C` in a micro header bar.
- Line numbers in mono soft. Keywords in `--accent`. Comments in soft graphite.

**Annotations.**
- Any editorial note ("GitHub Actions runs in UTC…") appears as a **dashed
  `--marker` border** box with a `NOTE` label in amber mono. This is the
  "printed in red" callout device of the schematic.

**Footer strip.**
- 4-column mono strip with shortcuts, share behavior, source link, draft date.
- Like an architectural title block.

### 2.6 What Direction B avoids

- Color beyond the three named hues. No "success green" toast, no blue links.
  Links are `--graphite` with 1 px underline.
- Any typography that isn't Plex. Commit fully.
- Playful or hand-drawn elements. The line quality is mechanical.

---

## 3. Shared: interactions

### Expression input
- Accepts 5-field or 6-field (seconds). Validates on blur + on every keystroke
  after 150 ms debounce.
- Invalid state: the offending field's baseline (A) or border (B) turns
  `--marker`. Inline message below the row, mono, `--marker`.
- Paste is field-aware — pasting `"0 9 * * 1-5"` fills all five fields.

### Natural language
- Parses a controlled vocabulary. Unknown tokens are underlined in `--marker`
  with a tooltip: "I don't know 'fortnightly' yet — try 'every 2 weeks'."
- Suggestions dropdown on mobile is a bottom sheet, not a floating menu.

### Copy
- 150 ms highlight of the copied text region.
- Toast: lower-center, mono, 3 s dismiss. A: `--ink` pill on `--paper`.
  B: bordered strip, no radius.

### Timezone select
- Native `<select>` on mobile for trust + a11y. Custom combobox on desktop.
- Shows current offset beside the zone name: `Europe/Madrid · UTC+2`.

### URL sync
- Replace-state, not push. Copy-link action puts the full shareable URL on
  clipboard and flashes a hairline under the address area.

### Keyboard map
- `⌘K` / `Ctrl K` — focus expression input.
- `⌘C` — copy current format.
- `1`–`6` — switch between format tabs.

---

## 4. Layout breakpoints

```
≤ 640 px  — single column, full-bleed sections
641–960   — single column, larger gutters, chips wrap freely
961+      — two-column grid for runs + formats, hero remains full width
```

Hero cron **always** scales with viewport using `clamp()` so it's the largest
element on any screen:

```css
font-size: clamp(2.25rem, 7.5vw, 4.5rem);
```

The humanized sentence uses a slightly smaller clamp and always stays readable.

---

## 5. A11y checklist

- [ ] Every interactive element reachable with Tab, in DOM order.
- [ ] Focus ring: 2 px solid `--accent`, 2 px offset. Never removed.
- [ ] `aria-live="polite"` on the humanized-sentence node.
- [ ] Expression input has an `aria-describedby` pointing at the sentence.
- [ ] Format tabs are a proper `role="tablist"` with `tab` + `tabpanel`.
- [ ] Next-runs is a semantic `<table>` with header row.
- [ ] Timezone label explicitly associated with the control.
- [ ] All color information has a non-color secondary signal (underline,
      border, text).

---

## 6. Motion

| Element | Enter | Exit | Easing |
|---|---|---|---|
| Chip selection | 120 ms border/bg | — | `cubic-bezier(.2,.8,.2,1)` |
| Format tab change | 160 ms underline slide | — | same |
| Toast | 140 ms fade + 4 px rise | 200 ms fade | same |
| Invalid field flash | 180 ms border color | — | linear |
| Copy flash | 150 ms bg tint pulse | 250 ms | same |

No page-level crossfades. No parallax. No "hero animations." If
`prefers-reduced-motion: reduce`, durations go to 0 ms.

---

## 7. Implementation notes for the agent

- **Build both themes from the start.** Don't ship light-only.
- **Use CSS variables for every token listed above.** No hard-coded hex.
- **One JSX component per concept** (`ExpressionInput`, `HumanSentence`,
  `NextRuns`, `FormatTabs`, `CodeBlock`, `Annotation`, `Timeline`). Each file
  under 200 lines.
- **No shadows. No gradients. No icons beyond the small set (copy, chevron,
  share, external).** Draw them as 1 px SVG line glyphs at 16 px.
- **Write the humanizer wrapper first** — everything in the UI hangs off its
  output. Cover the acceptance-checklist cases in `CRON_TOOL_BRIEF.md §13`
  with tests before styling.
- **Screenshot the final build at 375 px, 768 px, 1280 px, and 1920 px.**
  If any of the four looks cramped or hollow, the spacing scale is off.

---

## 8. Which direction to pick

- **Direction A** if the brand personality is "calm, literary, senior
  engineer's daily tool." Wins on desktop, very strong on mobile.
- **Direction B** if the brand personality is "precise, technical,
  reference-grade." Stronger visual memory; more distinctive on social share.

You can also mix: Direction A's typography with Direction B's numbered-section
framing is a valid hybrid. If you mix, keep the frame + grid of B and swap in
A's type stack and ember accent.

---

## 9. Assets to produce

- Favicon: a single cron glyph — `*/5` set in the chosen mono at 32 px,
  cropped tight. Black on paper for light, paper on ink for dark.
- OG image: 1200 × 630, direction-appropriate. Headline = the humanized
  sentence of the shared expression, in the direction's display face.
- `apple-touch-icon`: 180 px, padded.

---

## 10. Out of scope for v1

- Motion-heavy hero.
- Animated timeline.
- Mascot / illustration.
- Blog / marketing pages.
- Any onboarding.

Ship the tool. The tool is the marketing.
