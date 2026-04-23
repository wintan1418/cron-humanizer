export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-[var(--gutter-page)] py-10">
      <header className="flex items-baseline justify-between border-b border-[var(--rule)] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-newsreader)] text-2xl tracking-tight">
            Chron
          </span>
          <span className="eyebrow hidden sm:inline">
            cron, in plain english
          </span>
        </div>
        <nav className="eyebrow flex gap-5">
          <a href="#reference" className="hover:text-[var(--ink)]">
            Reference
          </a>
          <a href="#formats" className="hover:text-[var(--ink)]">
            Formats
          </a>
          <a
            href="https://github.com/wintan1418/cron-humanizer"
            className="hover:text-[var(--ink)]"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        </nav>
      </header>

      <section className="py-[var(--gutter-section)]">
        <p className="eyebrow mb-6">§1 · Expression</p>
        <p className="font-[family-name:var(--font-jetbrains)] text-[clamp(2.25rem,7.5vw,4.5rem)] tracking-tight">
          */15 9-17 * * 1-5
        </p>
        <p
          className="mt-10 font-[family-name:var(--font-newsreader)] text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.12] tracking-tight"
          aria-live="polite"
        >
          Every{" "}
          <em className="italic text-[var(--accent)]">15 minutes</em>, between{" "}
          <em className="italic text-[var(--accent)]">9 am and 5 pm</em>, on{" "}
          <em className="italic text-[var(--accent)]">weekdays</em>.
        </p>
      </section>

      <section className="border-t border-[var(--rule)] py-[var(--gutter-section)]">
        <p className="eyebrow mb-6">§2 · Next runs · Formats</p>
        <p className="text-[var(--ink-soft)]">
          Components land next: ExpressionInput, NextRuns, FormatTabs.
        </p>
      </section>

      <footer className="eyebrow mt-auto border-t border-[var(--rule)] py-6 text-[var(--ink-soft)]">
        MIT · no account · no tracking · draft · apr 2026
      </footer>
    </main>
  );
}
