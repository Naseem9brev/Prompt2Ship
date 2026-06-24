# PromptedAndShipped UI

A frontend build for PromptedAndShipped: a shareable developer leaderboard that asks, “How much of your code did you actually write?”

This PR focuses on the UI layer: landing page, leaderboard, profile score breakdown, GitHub connect CTA, scan-progress console, and design tokens inspired by the PRD/reference image.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style component primitives
- Supabase client wiring for future GitHub OAuth integration

## Local setup

```bash
npm install
cp frontend/.env.example frontend/.env.local
npm run dev --workspace frontend
```

The UI includes mock leaderboard/profile data when Supabase env vars are not configured.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
