---
name: testing-prompt2ship
description: Test Prompt2Ship locally through the main UI flows and README-visible pages. Use when validating Prompt2Ship frontend, leaderboard/profile, scan demo, or README screenshot changes.
---

# Prompt2Ship Testing Skill

## Devin Secrets Needed

- None required for local mock-data UI testing.
- Optional for real Supabase/OAuth integration testing:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Any server-side Supabase service keys the repo later documents for backend/API tests.

Do not print secret values. On Linux remotes, repo-scoped secrets may be available in `/run/repo_secrets/Prompt2Ship/.env.secrets`; load them only when a test requires real integration credentials.

## Local setup

1. Use the existing clone at `/home/ubuntu/repos/Prompt2Ship`.
2. Start the local app:
   ```bash
   npm run dev --prefix /home/ubuntu/repos/Prompt2Ship
   ```
3. Open `http://localhost:3000` in Chrome.
4. If Supabase public env vars are absent, the app should intentionally fall back to mock data. This is suitable for frontend-only UI verification.

## Useful validation commands

Run from the repo root when validating code changes:

```bash
npm run lint
npm run typecheck
npm run build
```

## Primary UI flow to test

Record the browser when testing UI changes. Keep the flow short and verify exact values so broken mock-data rendering is obvious.

1. Landing page `/`
   - Expected: hero `How much of your code did you actually write?`
   - Expected CTAs: `Connect GitHub`, `View leaderboard`
   - Expected stat cards: `Public only`, `2026`, `20 commits`
2. Leaderboard `/leaderboard`
   - Click `View leaderboard` from landing.
   - Expected heading: `AI-assisted shipping rankings`
   - Expected top row: `#1`, `devin-operator`, score `94`, `73% AI ratio`, `5 from last scan`
3. Profile `/u/devin-operator`
   - Click the `devin-operator` row.
   - Expected values: score `94`, `73%`, `248`, `12 pts`, `11/18`
   - Expected breakdown values: `181`, `11`, `18`
4. Scan demo `/scan`
   - Click header `Connect GitHub`.
   - Expected copy: `Preview the GitHub scan flow`, `OAuth-to-score loop`
   - Click `Run UI demo`.
   - Expected stages, in order: `[auth]`, `[repos]`, `[commits]`, `[signals]`, `[score]`, `[complete]`
   - Expected completion: `Score card state is ready.` and `View sample profile`
5. Sample profile return
   - Click `View sample profile`.
   - Expected route: `/u/devin-operator`
   - Expected score remains `94`.

## README asset checks

For README or branding changes, verify asset files exist and are referenced by relative paths:

```bash
python3 - <<'PY'
from pathlib import Path
import imghdr
repo = Path('/home/ubuntu/repos/Prompt2Ship')
assets = [
    repo/'docs/images/prompt2ship-logo.png',
    repo/'docs/images/landing.jpg',
    repo/'docs/images/leaderboard.jpg',
    repo/'docs/images/profile.jpg',
    repo/'docs/images/scan.jpg',
]
readme = (repo/'README.md').read_text()
for path in assets:
    rel = path.relative_to(repo).as_posix()
    print(rel, path.exists(), imghdr.what(path) if path.exists() else None, rel in readme)
PY
```

## Notes

- Browser console may show a non-blocking Next.js dev warning about `scroll-behavior: smooth`; treat it as noteworthy but not a runtime failure unless it becomes an error or breaks navigation.
- The production GitHub OAuth path should not be marked tested unless Supabase env vars are present and the OAuth flow is exercised against a real configured project.
