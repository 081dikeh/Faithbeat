-- 001: make arrangements belong to a hymn, add indexes and updated_at triggers.
-- Run the sections in order, one at a time, in the Neon SQL editor.

-- STEP 1 (read-only): how many arrangements have no hymn? These came from the
-- current /compose page, which never sends a hymn id. They have no owner and
-- can't be reached from any page.
select count(*) as orphan_arrangements from satb_arrangements where hymn_id is null;

-- STEP 2: delete the orphans. Only run if you don't need them (they are test
-- saves from /compose). Skip it and STEP 3 will fail while orphans exist.
delete from satb_arrangements where hymn_id is null;

-- STEP 3: from now on every arrangement must belong to a hymn.
alter table satb_arrangements alter column hymn_id set not null;

-- STEP 4: indexes (no-ops if they already exist).
create index if not exists hymns_user_id_idx    on hymns(user_id);
create index if not exists hymns_public_idx     on hymns(is_public, plays_count desc);
create index if not exists hymns_created_at_idx on hymns(created_at desc);
create index if not exists satb_hymn_id_idx     on satb_arrangements(hymn_id);

-- STEP 5: keep updated_at fresh (the PATCH route doesn't set it).
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