-- Faithbeat schema (Neon Postgres + Neon Auth)
-- Mirrors the live database. Safe to run on a fresh Neon project:
-- Neon Auth creates neon_auth."user" itself, so run this after auth is enabled.
-- Authorization is enforced in the API routes (no RLS), always filtering on
-- the session user id.

create extension if not exists "uuid-ossp";

create table if not exists hymns (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references neon_auth."user"(id) on delete cascade,
  title         text not null,
  description   text,
  lyrics        text not null,
  theme         text,
  language      text not null default 'english',
  church_event  text default 'general',
  is_public     boolean not null default false,
  plays_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists satb_arrangements (
  id                 uuid primary key default uuid_generate_v4(),
  hymn_id            uuid not null references hymns(id) on delete cascade,
  language           text,
  theme              text,
  status             text not null default 'pending', -- pending | processing | ready | failed
  key_signature      text,
  tempo_bpm          integer,
  time_signature     text,
  voices             jsonb not null default '[]',
  abc_notation       text,
  music_xml          text,
  midi_url           text,
  pdf_url            text,
  audio_preview_url  text,
  error_message      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists hymns_user_id_idx    on hymns(user_id);
create index if not exists hymns_public_idx     on hymns(is_public, plays_count desc);
create index if not exists hymns_created_at_idx on hymns(created_at desc);
create index if not exists satb_hymn_id_idx     on satb_arrangements(hymn_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hymns_set_updated_at on hymns;
create trigger hymns_set_updated_at before update on hymns
  for each row execute function set_updated_at();

drop trigger if exists satb_set_updated_at on satb_arrangements;
create trigger satb_set_updated_at before update on satb_arrangements
  for each row execute function set_updated_at();