# Phase 1 deployment configuration

Prompt2Ship Phase 1 deploys as three managed surfaces:

- Frontend: Vercel-hosted Next.js app from `frontend/`.
- Backend: Render-hosted FastAPI web service from `backend/`.
- Data/Auth: Supabase hosted project with GitHub OAuth enabled.

No live provider credentials are required in the repository. Configure secrets in
Vercel, Render, and Supabase dashboards.

## Environments

| Environment | Frontend | Backend | Supabase |
| --- | --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:8000` | local Supabase or hosted dev project |
| Staging | `https://prompt2ship-staging.vercel.app` | `https://prompt2ship-api-staging.onrender.com` | staging Supabase project |
| Production | `https://prompt2ship.vercel.app` or custom domain | `https://prompt2ship-api.onrender.com` | production Supabase project |

Use separate Supabase projects for staging and production so Auth redirect URLs,
service-role keys, database policies, and scan data cannot bleed across
environments.

## Vercel frontend

Create a Vercel project for the `frontend/` directory.

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root Directory | `frontend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

The committed `frontend/vercel.json` mirrors these settings for repeatable
Vercel project setup.

### Vercel environment variables

| Variable | Local | Staging | Production | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `local` | `staging` | `production` | Public environment label. |
| `NEXT_PUBLIC_SUPABASE_URL` | dev Supabase URL | staging Supabase URL | production Supabase URL | Safe public URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon key | staging anon key | production anon key | Safe public anon key. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | staging Render URL | production Render URL | No trailing slash. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | staging Vercel URL | production Vercel URL | Used for canonical/share URLs. |
| `NEXT_PUBLIC_AUTH_CALLBACK_URL` | `http://localhost:3000/auth/callback` | `https://prompt2ship-staging.vercel.app/auth/callback` | `https://prompt2ship.vercel.app/auth/callback` | Must be listed in Supabase redirect URLs. |

## Render FastAPI backend

The root `render.yaml` defines:

- `prompt2ship-api`: FastAPI web service rooted at `backend/`.
- `prompt2ship-refresh-delta`: daily UTC cron job that posts to the backend
  refresh endpoint with a shared secret and `SCAN_DELTA_DAYS=3`.

Import the Blueprint from the repository root. Keep production deployments on
the production branch and create a separate Render service or Blueprint instance
for staging.

### Render web service environment variables

| Variable | Required | Value |
| --- | --- | --- |
| `ENVIRONMENT` | yes | `staging` or `production`. |
| `SUPABASE_URL` | yes | Environment-specific Supabase project URL. |
| `SUPABASE_ANON_KEY` | yes | Environment-specific anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Secret; backend only. Never expose to Vercel. |
| `SUPABASE_JWT_SECRET` | yes | Secret; used for Supabase JWT verification when auth middleware lands. |
| `FRONTEND_ORIGIN` | yes | Primary frontend origin with scheme, no trailing slash. |
| `CORS_ORIGINS` | yes | Comma-separated exact frontend origins; never use `*` with credentials. |
| `GITHUB_SCAN_YEAR` | yes | `2026` for Phase 1 scoring. |
| `SCAN_DELTA_DAYS` | yes | `3` for the delta refresh window. |
| `REFRESH_CRON_SECRET` | yes | Random secret generated/stored in Render and shared with the cron service. |
| `LOG_LEVEL` | yes | `INFO` unless debugging a specific incident. |

### Render cron refresh

The cron job runs daily at `03:17 UTC`:

```yaml
schedule: "17 3 * * *"
startCommand: python scripts/render_refresh_delta.py
```

The script sends:

- `POST $REFRESH_CRON_URL?days=$SCAN_DELTA_DAYS`
- JSON body: `{"delta_days": 3}`
- `Authorization: Bearer $REFRESH_CRON_SECRET`
- `X-Refresh-Cron-Secret: $REFRESH_CRON_SECRET`

Set `REFRESH_CRON_URL` to the deployed backend refresh endpoint for each
environment:

| Environment | `REFRESH_CRON_URL` |
| --- | --- |
| Staging | `https://prompt2ship-api-staging.onrender.com/api/internal/refresh-delta` |
| Production | `https://prompt2ship-api.onrender.com/api/internal/refresh-delta` |

Keep the backend endpoint idempotent. A failed cron run should be safe to retry
without double-counting commits.

## Supabase configuration

Create separate Supabase projects for staging and production. Store only public
values in Vercel and store service-role/JWT secrets only in Render.

### Supabase environment variable mapping

| Supabase value | Vercel | Render |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` |
| Anon public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |
| Service role key | not set | `SUPABASE_SERVICE_ROLE_KEY` |
| JWT secret | not set | `SUPABASE_JWT_SECRET` |

### GitHub OAuth callback URL matrix

In GitHub OAuth Apps, the callback URL points to Supabase Auth, not directly to
the frontend. Supabase then redirects users to the frontend callback URL.

| Environment | GitHub OAuth App callback URL | Supabase Site URL | Supabase Additional Redirect URLs |
| --- | --- | --- | --- |
| Local with Supabase CLI | `http://127.0.0.1:54321/auth/v1/callback` | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Local with hosted dev Supabase | `https://<dev-project-ref>.supabase.co/auth/v1/callback` | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Staging | `https://<staging-project-ref>.supabase.co/auth/v1/callback` | `https://prompt2ship-staging.vercel.app` | `https://prompt2ship-staging.vercel.app/auth/callback` |
| Production | `https://<prod-project-ref>.supabase.co/auth/v1/callback` | `https://prompt2ship.vercel.app` | `https://prompt2ship.vercel.app/auth/callback`, custom-domain callback if enabled |

Use one GitHub OAuth App per Supabase project/environment because GitHub OAuth
Apps have a single authorization callback URL.

## CORS and security

- `CORS_ORIGINS` must contain exact HTTPS origins for staging/production.
- Do not use wildcard CORS with authenticated requests or cookies.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, and
  `REFRESH_CRON_SECRET` out of Vercel and out of client bundles.
- Rotate `REFRESH_CRON_SECRET` if cron logs or provider settings are shared
  outside the deployment team.
- Configure Render health checks to `/healthz`.
- Keep preview deployments pointed at staging Supabase only, never production
  service-role keys.
- Treat Vercel preview URLs as untrusted until Supabase redirect URLs and CORS
  origins are explicitly approved for that preview.

## Deployment risk checklist

Before enabling production traffic:

- [ ] Vercel production deploy has the correct Supabase production public env
      values and production Render API URL.
- [ ] Render production web service has no staging Supabase keys.
- [ ] Supabase production has GitHub OAuth enabled and production callback URLs
      configured.
- [ ] `CORS_ORIGINS` lists only approved production and staging origins.
- [ ] `REFRESH_CRON_SECRET` is present on both the Render web service and cron
      job and is not exposed in Vercel.
- [ ] Render cron dry run succeeds against staging before production cron is
      enabled.
- [ ] Backend refresh endpoint is idempotent for repeated 3-day windows.
- [ ] `/healthz` passes on the Render service after deploy.
- [ ] Vercel pages can reach `/api/health` on the Render backend.
- [ ] Supabase RLS policies are applied before public leaderboard/profile data
      is exposed.
