create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak_days integer not null default 0,
  completed_tasks jsonb not null default '[]'::jsonb,
  leads jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  saved_vocabulary jsonb not null default '[]'::jsonb,
  social_drafts jsonb not null default '[]'::jsonb,
  ielts_minutes integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "Users can read their own progress"
on public.user_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
on public.user_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.user_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own progress"
on public.user_progress for delete
to authenticated
using ((select auth.uid()) = user_id);
