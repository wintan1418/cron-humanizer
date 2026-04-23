# Cron Humanizer

Read, write, and understand cron expressions without losing your mind.

- Paste cron → get plain English.
- Type English → get cron.
- Copy as Linux crontab / Rails `whenever` / GitHub Actions / Kubernetes /
  Vercel / node-cron / Python.
- Mobile-friendly. Dark mode. Works offline (PWA).
- No ads. No tracking. No account.

> Status: pre-release. The design spec is locked; the engine and UI are being
> built. See [`CRON_TOOL_BRIEF.md`](./CRON_TOOL_BRIEF.md) for the full product
> brief and [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) for the visual system.

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind v4. Pure client-side — no
backend, no database, no tracking.

## Contributing

This is a personal project; issues and PRs are welcome but small-scope. See
[`CLAUDE.md`](./CLAUDE.md) for the non-negotiables and build order.

## License

MIT — see [`LICENSE`](./LICENSE).
