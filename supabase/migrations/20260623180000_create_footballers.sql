-- ============================================================
-- Footballers catalog
-- The "pool" the secret player is drawn from each round.
-- Reference table (static data); it depends on nothing, so we
-- create it first.
-- ============================================================

create table public.footballers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  league      text not null,                         -- LaLiga, Premier, Serie A, Legends...
  difficulty  smallint not null default 1 check (difficulty between 1 and 3),
  created_at  timestamptz not null default now()
);

comment on table public.footballers is 'Footballers catalog for the secret player.';

-- Avoid duplicating the same name within the same league.
create unique index footballers_name_league_idx
  on public.footballers (lower(name), league);

-- Security: enable RLS and add NO policies.
-- Result: nobody using the public (anon) key can read/write.
-- Only the backend with the service_role key (which bypasses RLS) gets in.
-- Every catalog read goes through NestJS, never directly from the FE.
alter table public.footballers enable row level security;
