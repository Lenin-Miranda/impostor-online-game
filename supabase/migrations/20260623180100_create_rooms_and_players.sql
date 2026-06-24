-- ============================================================
-- Rooms and players
--
-- Watch out for the circular dependency:
--   players.room_id        -> rooms.id   (a player belongs to a room)
--   rooms.host_player_id   -> players.id (the host is a player)
--
-- Both FKs cannot be created at once. Solution: create rooms without
-- the host FK, then players, and finally add the FK with ALTER.
-- ============================================================

create table public.rooms (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,                 -- code to invite (e.g. 7K2P9)
  status          text not null default 'lobby'
                    check (status in ('lobby', 'in_game', 'finished')),
  host_player_id  uuid,                                  -- FK added below
  settings        jsonb not null default '{
    "impostors": 1,
    "category": "Stars",
    "time": 5,
    "hints": true,
    "maxPlayers": 10
  }'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.rooms is 'Rooms: group players and games. settings mirrors the FE lobby config.';

create table public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  nickname    text not null,
  is_host     boolean not null default false,
  connected   boolean not null default true,
  score       integer not null default 0,
  joined_at   timestamptz not null default now()
);

comment on table public.players is 'Players connected to a room.';

-- Looking up players by room is the most common query.
create index players_room_id_idx on public.players (room_id);

-- Now that players exists, add the host FK.
-- on delete set null: if that player is removed, the room is not broken,
-- it is just left without a host (the backend will reassign another).
alter table public.rooms
  add constraint rooms_host_player_id_fkey
  foreign key (host_player_id) references public.players(id) on delete set null;

-- ------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE of rooms.
-- We will reuse this function on other tables if needed.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- RLS locked down: all access goes through the backend (service_role).
alter table public.rooms enable row level security;
alter table public.players enable row level security;
