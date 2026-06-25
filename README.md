# Prompt2Ship

Prompt2Ship is a Phase 1 MVP for scoring and sharing a developer's public GitHub shipping activity. The app combines a Next.js/Tailwind frontend, mock-data UI fallbacks, Supabase client placeholders for GitHub OAuth, and a FastAPI backend scaffold for future scan APIs.

## Monorepo layout

- `frontend/` — Next.js App Router UI intended for Vercel.
- `backend/` — FastAPI service intended for Render.
- `supabase/` — Supabase migrations and database/Auth configuration.
- `docs/` — Product and design notes.

## UI routes

```tsx
/                 // landing hero + Connect GitHub CTA + leaderboard preview
/leaderboard      // ranked public leaderboard shell
/u/[username]     // shareable score/profile card
/scan             // scan-progress console demo, SSE-ready UI shape
/api-status       // backend connection placeholder
```

The UI uses mock leaderboard/profile data when Supabase env vars are not configured.

## Local setup

### Frontend

```bash
npm install
cp frontend/.env.example frontend/.env.local
npm run dev --workspace frontend
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
