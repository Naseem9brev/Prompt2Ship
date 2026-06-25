begin;

create extension if not exists pgcrypto;

create type public.github_connection_status as enum (
  'active',
  'expired',
  'revoked',
  'error'
);

create type public.scan_run_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'canceled'
);

create type public.scan_run_type as enum (
  'full',
  'delta'
);

create type public.profile_refresh_state as enum (
  'never_scanned',
  'fresh',
  'refresh_due',
  'running',
  'error'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.profile_slug_from_handle(handle text, fallback_id uuid)
returns text
language sql
immutable
as $$
  select left(
    coalesce(
      nullif(
        trim(both '-' from lower(regexp_replace(coalesce(handle, ''), '[^a-zA-Z0-9]+', '-', 'g'))),
        ''
      ),
      'user'
    ),
    30
  ) || '-' || left(replace(fallback_id::text, '-', ''), 8);
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  public_slug text,
  github_username text,
  github_user_id bigint,
  onboarding_completed_at timestamptz,
  is_public boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 120
  ),
  constraint profiles_public_slug_format check (
    public_slug is null or public_slug ~ '^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$'
  ),
  constraint profiles_github_username_format check (
    github_username is null
    or github_username ~ '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$'
  )
);

create unique index profiles_public_slug_unique_idx
  on public.profiles (lower(public_slug))
  where public_slug is not null;

create unique index profiles_github_user_id_unique_idx
  on public.profiles (github_user_id)
  where github_user_id is not null;

create index profiles_github_username_idx
  on public.profiles (lower(github_username))
  where github_username is not null;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.github_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  github_user_id bigint not null,
  github_username text not null,
  github_display_name text,
  avatar_url text,
  profile_url text,
  primary_email text,
  scopes text[] not null default '{}'::text[],
  status public.github_connection_status not null default 'active',
  token_secret_ref text,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  refreshed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint github_connections_username_format check (
    github_username ~ '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$'
  ),
  constraint github_connections_revoked_at_status check (
    status <> 'revoked' or revoked_at is not null
  )
);

create unique index github_connections_user_github_user_unique_idx
  on public.github_connections (user_id, github_user_id);

create unique index github_connections_active_user_unique_idx
  on public.github_connections (user_id)
  where status = 'active';

create index github_connections_github_username_idx
  on public.github_connections (lower(github_username));

create trigger set_github_connections_updated_at
before update on public.github_connections
for each row execute function public.set_updated_at();

create table public.scan_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  github_connection_id uuid references public.github_connections (id) on delete set null,
  scan_type public.scan_run_type not null default 'full',
  status public.scan_run_status not null default 'queued',
  trigger_reason text not null default 'manual',
  github_username_snapshot text,
  progress_phase text not null default 'queued',
  progress_current integer not null default 0,
  progress_total integer,
  progress_percent numeric(5,2) not null default 0,
  status_message text,
  error_code text,
  error_message text,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scan_runs_progress_nonnegative check (
    progress_current >= 0
    and (progress_total is null or progress_total >= 0)
    and progress_percent between 0 and 100
  ),
  constraint scan_runs_progress_current_lte_total check (
    progress_total is null or progress_current <= progress_total
  ),
  constraint scan_runs_finished_after_started check (
    finished_at is null or started_at is null or finished_at >= started_at
  )
);

create index scan_runs_user_created_at_idx
  on public.scan_runs (user_id, created_at desc);

create index scan_runs_connection_created_at_idx
  on public.scan_runs (github_connection_id, created_at desc)
  where github_connection_id is not null;

create index scan_runs_status_idx
  on public.scan_runs (status, created_at);

create trigger set_scan_runs_updated_at
before update on public.scan_runs
for each row execute function public.set_updated_at();

create table public.repository_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  scan_run_id uuid not null references public.scan_runs (id) on delete cascade,
  github_repository_id bigint not null,
  repository_owner text not null,
  repository_name text not null,
  repository_full_name text not null,
  repository_url text not null,
  default_branch text,
  primary_language text,
  is_fork boolean not null default false,
  is_archived boolean not null default false,
  is_private boolean not null default false,
  stars_count integer not null default 0,
  forks_count integer not null default 0,
  commits_2026_count integer not null default 0,
  ai_likely_commits_2026_count integer not null default 0,
  ai_likely_commit_ratio numeric(5,4) not null default 0,
  generated_file_hits integer not null default 0,
  ai_tool_mentions integer not null default 0,
  lines_added integer not null default 0,
  lines_deleted integer not null default 0,
  files_touched integer not null default 0,
  first_commit_at timestamptz,
  last_commit_at timestamptz,
  last_commit_sha text,
  metrics jsonb not null default '{}'::jsonb,
  is_latest boolean not null default true,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repository_metrics_owner_format check (
    repository_owner ~ '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$'
  ),
  constraint repository_metrics_name_nonempty check (char_length(repository_name) > 0),
  constraint repository_metrics_public_only check (is_private is false),
  constraint repository_metrics_nonnegative_counts check (
    stars_count >= 0
    and forks_count >= 0
    and commits_2026_count >= 0
    and ai_likely_commits_2026_count >= 0
    and generated_file_hits >= 0
    and ai_tool_mentions >= 0
    and lines_added >= 0
    and lines_deleted >= 0
    and files_touched >= 0
  ),
  constraint repository_metrics_ai_counts_lte_total check (
    ai_likely_commits_2026_count <= commits_2026_count
  ),
  constraint repository_metrics_ratio_range check (
    ai_likely_commit_ratio between 0 and 1
  )
);

create unique index repository_metrics_scan_repo_unique_idx
  on public.repository_metrics (scan_run_id, github_repository_id);

create unique index repository_metrics_latest_user_repo_unique_idx
  on public.repository_metrics (user_id, github_repository_id)
  where is_latest;

create index repository_metrics_user_observed_at_idx
  on public.repository_metrics (user_id, observed_at desc);

create index repository_metrics_full_name_idx
  on public.repository_metrics (lower(repository_full_name));

create trigger set_repository_metrics_updated_at
before update on public.repository_metrics
for each row execute function public.set_updated_at();

create table public.score_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  scan_run_id uuid not null references public.scan_runs (id) on delete cascade,
  score numeric(6,2) not null,
  score_grade text,
  score_percentile numeric(5,2),
  scoring_version text not null,
  repositories_scored integer not null default 0,
  commits_scored_2026 integer not null default 0,
  ai_likely_commits_2026 integer not null default 0,
  confidence numeric(5,2) not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint score_snapshots_score_range check (score between 0 and 100),
  constraint score_snapshots_percentile_range check (
    score_percentile is null or score_percentile between 0 and 100
  ),
  constraint score_snapshots_confidence_range check (confidence between 0 and 100),
  constraint score_snapshots_nonnegative_counts check (
    repositories_scored >= 0
    and commits_scored_2026 >= 0
    and ai_likely_commits_2026 >= 0
  ),
  constraint score_snapshots_ai_counts_lte_total check (
    ai_likely_commits_2026 <= commits_scored_2026
  )
);

create unique index score_snapshots_scan_run_unique_idx
  on public.score_snapshots (scan_run_id);

create index score_snapshots_user_calculated_at_idx
  on public.score_snapshots (user_id, calculated_at desc);

create index score_snapshots_score_idx
  on public.score_snapshots (score desc, calculated_at desc);

create table public.profile_read_models (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  score_snapshot_id uuid references public.score_snapshots (id) on delete set null,
  public_slug text not null,
  display_name text not null,
  avatar_url text,
  github_username text not null,
  headline text,
  score numeric(6,2) not null default 0,
  score_grade text,
  score_percentile numeric(5,2),
  repositories_scored integer not null default 0,
  commits_scored_2026 integer not null default 0,
  ai_likely_commits_2026 integer not null default 0,
  top_repositories jsonb not null default '[]'::jsonb,
  score_breakdown jsonb not null default '{}'::jsonb,
  last_scanned_at timestamptz,
  is_public boolean not null default true,
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_read_models_slug_format check (
    public_slug ~ '^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$'
  ),
  constraint profile_read_models_score_range check (score between 0 and 100),
  constraint profile_read_models_percentile_range check (
    score_percentile is null or score_percentile between 0 and 100
  ),
  constraint profile_read_models_nonnegative_counts check (
    repositories_scored >= 0
    and commits_scored_2026 >= 0
    and ai_likely_commits_2026 >= 0
  )
);

create unique index profile_read_models_slug_unique_idx
  on public.profile_read_models (lower(public_slug));

create unique index profile_read_models_github_username_unique_idx
  on public.profile_read_models (lower(github_username));

create index profile_read_models_public_slug_idx
  on public.profile_read_models (lower(public_slug))
  where is_public;

create trigger set_profile_read_models_updated_at
before update on public.profile_read_models
for each row execute function public.set_updated_at();

create table public.leaderboard_entries (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  score_snapshot_id uuid references public.score_snapshots (id) on delete set null,
  rank integer,
  public_slug text not null,
  display_name text not null,
  avatar_url text,
  github_username text not null,
  score numeric(6,2) not null,
  score_grade text,
  score_percentile numeric(5,2),
  repositories_scored integer not null default 0,
  commits_scored_2026 integer not null default 0,
  ai_likely_commits_2026 integer not null default 0,
  last_scanned_at timestamptz,
  is_active boolean not null default true,
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_entries_rank_positive check (rank is null or rank > 0),
  constraint leaderboard_entries_score_range check (score between 0 and 100),
  constraint leaderboard_entries_percentile_range check (
    score_percentile is null or score_percentile between 0 and 100
  ),
  constraint leaderboard_entries_nonnegative_counts check (
    repositories_scored >= 0
    and commits_scored_2026 >= 0
    and ai_likely_commits_2026 >= 0
  )
);

create unique index leaderboard_entries_active_rank_unique_idx
  on public.leaderboard_entries (rank)
  where is_active and rank is not null;

create index leaderboard_entries_active_score_idx
  on public.leaderboard_entries (score desc, refreshed_at desc)
  where is_active;

create index leaderboard_entries_slug_idx
  on public.leaderboard_entries (lower(public_slug))
  where is_active;

create trigger set_leaderboard_entries_updated_at
before update on public.leaderboard_entries
for each row execute function public.set_updated_at();

create table public.profile_refresh_status (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  refresh_state public.profile_refresh_state not null default 'never_scanned',
  last_full_scan_run_id uuid references public.scan_runs (id) on delete set null,
  last_delta_scan_run_id uuid references public.scan_runs (id) on delete set null,
  running_scan_run_id uuid references public.scan_runs (id) on delete set null,
  last_successful_scan_at timestamptz,
  last_full_scan_at timestamptz,
  last_delta_scan_at timestamptz,
  next_delta_refresh_at timestamptz,
  delta_refresh_interval interval not null default interval '3 days',
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_refresh_status_positive_interval check (
    delta_refresh_interval > interval '0 seconds'
  ),
  constraint profile_refresh_status_next_after_delta check (
    next_delta_refresh_at is null
    or last_delta_scan_at is null
    or next_delta_refresh_at >= last_delta_scan_at
  )
);

create index profile_refresh_status_next_delta_idx
  on public.profile_refresh_status (next_delta_refresh_at)
  where next_delta_refresh_at is not null;

create index profile_refresh_status_state_idx
  on public.profile_refresh_status (refresh_state, updated_at desc);

create trigger set_profile_refresh_status_updated_at
before update on public.profile_refresh_status
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    github_username,
    github_user_id,
    public_slug,
    metadata
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      nullif(new.raw_user_meta_data ->> 'preferred_username', '')
    ),
    case
      when coalesce(new.raw_user_meta_data ->> 'provider_id', '') ~ '^[0-9]+$'
        then (new.raw_user_meta_data ->> 'provider_id')::bigint
      else null
    end,
    public.profile_slug_from_handle(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'user_name', ''),
        nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
        split_part(new.email, '@', 1),
        new.id::text
      ),
      new.id
    ),
    jsonb_build_object('auth_provider', new.app_metadata ->> 'provider')
  )
  on conflict (id) do update
    set email = excluded.email,
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        github_username = coalesce(excluded.github_username, public.profiles.github_username),
        github_user_id = coalesce(excluded.github_user_id, public.profiles.github_user_id),
        updated_at = now();

  insert into public.profile_refresh_status (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.github_connections enable row level security;
alter table public.scan_runs enable row level security;
alter table public.repository_metrics enable row level security;
alter table public.score_snapshots enable row level security;
alter table public.profile_read_models enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.profile_refresh_status enable row level security;

create policy "Profiles are readable by their owner"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles are insertable by their owner"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Profiles are updateable by their owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "GitHub connections are readable by their owner"
  on public.github_connections for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Scan runs are readable by their owner"
  on public.scan_runs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Repository metrics are readable by their owner"
  on public.repository_metrics for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Score snapshots are readable by their owner"
  on public.score_snapshots for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Refresh status is readable by its owner"
  on public.profile_refresh_status for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Public profile read models are readable"
  on public.profile_read_models for select
  to anon, authenticated
  using (is_public);

create policy "Owners can read their private profile read model"
  on public.profile_read_models for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Active leaderboard entries are readable"
  on public.leaderboard_entries for select
  to anon, authenticated
  using (is_active);

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on public.profiles to authenticated;

grant select on public.github_connections to authenticated;
grant select on public.scan_runs to authenticated;
grant select on public.repository_metrics to authenticated;
grant select on public.score_snapshots to authenticated;
grant select on public.profile_refresh_status to authenticated;

grant select on public.profile_read_models to anon, authenticated;
grant select on public.leaderboard_entries to anon, authenticated;

grant all on public.profiles to service_role;
grant all on public.github_connections to service_role;
grant all on public.scan_runs to service_role;
grant all on public.repository_metrics to service_role;
grant all on public.score_snapshots to service_role;
grant all on public.profile_read_models to service_role;
grant all on public.leaderboard_entries to service_role;
grant all on public.profile_refresh_status to service_role;

commit;
