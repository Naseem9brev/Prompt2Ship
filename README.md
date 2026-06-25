# Prompt2Ship

Prompt2Ship is a Phase 1 MVP for scoring how AI-assisted a developer's 2026 public GitHub commit history appears. Users connect GitHub through Supabase Auth, the backend scans public GitHub data, and the app shows a public leaderboard plus shareable profile pages.

## Monorepo layout

- `frontend/` — Next.js + Tailwind app intended for Vercel.
- `backend/` — FastAPI service intended for Render.
- `supabase/` — Supabase migrations and database/Auth configuration.

## Local setup

### Frontend

```bash
npm install
cp frontend/.env.example frontend/.env.local
npm run frontend:dev
```

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e "backend[dev]"
cp backend/.env.example backend/.env
uvicorn app.main:app --reload --app-dir backend
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run backend:lint
npm run backend:test
```

## Deployment targets

- Frontend: Vercel project rooted at `frontend/`.
- Backend: Render Python web service rooted at `backend/`.
- Database/Auth: Supabase Postgres/Auth with GitHub OAuth provider enabled.

See [`docs/deployment.md`](docs/deployment.md) for the Phase 1 deployment matrix,
required environment variables, OAuth callback URLs, Render cron configuration,
and launch risk checklist.

Further feature PRs will add Supabase schema/RLS, GitHub OAuth flow, scan engine, leaderboard/profile pages, SSE progress, and 3-day delta refresh.
