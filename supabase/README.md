# Supabase

This directory contains the Prompt2Ship Phase 1 Supabase database and Auth foundation.

## Migration

Apply migrations with the Supabase CLI from the repo root:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

For CI or a freshly linked local clone, verify the pending SQL before pushing:

```bash
supabase db diff --linked
```

## Auth setup

Prompt2Ship expects Supabase Auth to use GitHub as the Phase 1 OAuth provider.

1. In Supabase, go to **Authentication → Providers → GitHub**.
2. Enable GitHub and add the GitHub OAuth client ID/secret.
3. Configure the GitHub OAuth callback URL shown by Supabase in the GitHub OAuth app.
4. Add the frontend production and local redirect URLs in **Authentication → URL Configuration**.

The `on_auth_user_created` trigger creates a private `profiles` row and a `profile_refresh_status` row for every new `auth.users` record. GitHub profile metadata from `raw_user_meta_data` seeds the display name, avatar, username, GitHub user ID, and public slug.

## Data model

The Phase 1 migration creates:

- `profiles` — private user metadata linked 1:1 to `auth.users`.
- `github_connections` — owner-only GitHub account metadata and a `token_secret_ref` pointer for a token stored outside the table.
- `scan_runs` — scan status/progress/error records for full and delta scans.
- `repository_metrics` — per-scan public GitHub repository metrics and AI-likelihood counters.
- `score_snapshots` — immutable score outputs for a scan.
- `profile_read_models` — public profile-page read model derived from private/profile/score data.
- `leaderboard_entries` — public leaderboard read model ordered by score/rank.
- `profile_refresh_status` — 3-day delta refresh cadence, running scan, and last-error tracking.

## RLS contract

RLS is enabled on every Phase 1 table.

| Table | Public anon reads | Authenticated owner reads | Authenticated writes | Service role writes |
| --- | --- | --- | --- | --- |
| `profiles` | No | Own row | Own row only | Yes |
| `github_connections` | No | Own rows | No | Yes |
| `scan_runs` | No | Own rows | No | Yes |
| `repository_metrics` | No | Own rows | No | Yes |
| `score_snapshots` | No | Own rows | No | Yes |
| `profile_refresh_status` | No | Own row | No | Yes |
| `profile_read_models` | Rows where `is_public` | Own row plus public rows | No | Yes |
| `leaderboard_entries` | Rows where `is_active` | Active rows | No | Yes |

Backend workers should use the Supabase service role key for connection upserts, scan progress updates, score snapshots, read-model refreshes, and delta refresh status updates. Browser clients should read public pages through `profile_read_models` and `leaderboard_entries`; private connection and scan data is owner-only.

## Token storage

Do not store GitHub access tokens directly in `github_connections`. Store tokens in Supabase Vault or the backend's secret store and save only the opaque reference in `github_connections.token_secret_ref`.

## Live setup still required

This PR only adds SQL/docs. A live Supabase project still needs:

- GitHub OAuth provider credentials configured in Supabase.
- The migration applied to the target project.
- Backend code to store GitHub token references and maintain scan/read-model rows with the service role key.
