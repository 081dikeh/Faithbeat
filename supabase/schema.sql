-- Faithbeat database schema
-- Reconstructed from the query patterns already used across the app
-- (app/api/save-hymn, app/discover, app/dashboard, app/my-hymns, app/hymn/[id]).
-- Run this in the Supabase SQL editor on a fresh project, or via `supabase db push`.

create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles: one row per authenticated user
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- hymns: the core generated/saved content
-- ============================================================
create table if not exists hymns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,           -- user's free-text prompt (new: drives generation)
  lyrics text not null,
  theme text,
  language text not null default 'english',
  church_event text default 'general',
  is_public boolean not null default false,
  plays_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hymns_user_id_idx on hymns(user_id);
create index if not exists hymns_is_public_idx on hymns(is_public);
create index if not exists hymns_created_at_idx on hymns(created_at desc);

alter table hymns enable row level security;

create policy "Public hymns are viewable by everyone"
  on hymns for select using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own hymns"
  on hymns for insert with check (auth.uid() = user_id);

create policy "Users can update their own hymns"
  on hymns for update using (auth.uid() = user_id);

create policy "Users can delete their own hymns"
  on hymns for delete using (auth.uid() = user_id);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hymns_set_updated_at on hymns;
create trigger hymns_set_updated_at
  before update on hymns
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- satb_arrangements: generated choral arrangements for a hymn
-- ============================================================
create table if not exists satb_arrangements (
  id uuid primary key default uuid_generate_v4(),
  hymn_id uuid not null references hymns(id) on delete cascade,
  language text,
  theme text,
  status text not null default 'pending', -- pending | processing | ready | failed
  key_signature text,
  tempo_bpm integer,
  time_signature text,
  voices jsonb not null default '[]',
  abc_notation text,
  music_xml text,
  midi_url text,
  pdf_url text,
  audio_preview_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists satb_hymn_id_idx on satb_arrangements(hymn_id);

alter table satb_arrangements enable row level security;

create policy "Arrangements follow parent hymn visibility"
  on satb_arrangements for select using (
    exists (
      select 1 from hymns
      where hymns.id = satb_arrangements.hymn_id
        and (hymns.is_public = true or hymns.user_id = auth.uid())
    )
  );

create policy "Users can manage arrangements on their own hymns"
  on satb_arrangements for all using (
    exists (
      select 1 from hymns
      where hymns.id = satb_arrangements.hymn_id
        and hymns.user_id = auth.uid()
    )
  );

drop trigger if exists satb_set_updated_at on satb_arrangements;
create trigger satb_set_updated_at
  before update on satb_arrangements
  for each row execute procedure public.set_updated_at();
