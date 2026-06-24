---
name: testing-prompt2ship-ui
description: Test the Prompt2Ship/PromptedAndShipped Next.js frontend locally. Use when validating landing, leaderboard, profile, scan-progress, or frontend-only UI changes.
---

# Prompt2Ship UI Testing

## Devin Secrets Needed

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only if validating real Supabase Auth/OAuth or live leaderboard data.
- No secrets are needed for local mock-data UI testing; the frontend falls back to mock leaderboard/profile data when Supabase public env vars are absent.

## Local setup

From the repo root:

```bash
npm install
npm run dev --workspace frontend -- --hostname 0.0.0.0
```

The app should be reachable at `http://localhost:3000`.

## Validation commands

Run these from the repo root before browser testing:

```bash
npm run lint
npm run typecheck
npm run build
```

## Runtime UI flow

A focused frontend smoke test should cover:

1. Open `/` and verify the landing headline, the mock top developer, and the public/2026/20-commit stat cards.
2. Click `View leaderboard` and verify `/leaderboard` shows deterministic mock rows, especially `devin-operator` with score `94` and `73% AI ratio`.
3. Click the `devin-operator` row and verify `/u/devin-operator` shows score `94`, AI ratio `73%`, volume `248`, repo bonus `12 pts`, and signal breakdown `181`, `11`, `18`.
4. Click header `Connect GitHub` to reach `/scan`; this link intentionally opens the scan UI demo route.
5. Click `Run UI demo` and verify all six stream stages appear: `[auth]`, `[repos]`, `[commits]`, `[signals]`, `[score]`, `[complete]`, followed by `Score card state is ready.` and `View sample profile`.

## Notes

- The real OAuth button can remain inactive in local mock testing when Supabase env vars are not configured; its title should indicate Supabase env vars are needed.
- Browser console might show framework/dev-mode warnings. Treat errors that break navigation or rendering as blockers; non-blocking Next.js dev warnings may be noted in the report.
