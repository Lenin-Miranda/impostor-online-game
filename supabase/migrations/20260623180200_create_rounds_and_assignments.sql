-- ============================================================
-- Rounds and role assignments
-- A game = several rounds within a room.
-- ============================================================

create table public.rounds (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms(id) on delete cascade,
  number         integer not null,                       -- 1, 2, 3...
  footballer_id  uuid references public.footballers(id) on delete set null,
  category       text,                                    -- category used in this round
  phase          text not null default 'reveal'
                   check (phase in ('reveal', 'clues', 'discussion', 'voting', 'result')),
  started_at     timestamptz not null default now(),
  ended_at       timestamptz,
  unique (room_id, number)                                -- round number is not repeated in a room
);

comment on table public.rounds is 'Game rounds. phase is the game state machine.';

create index rounds_room_id_idx on public.rounds (room_id);

-- ------------------------------------------------------------
-- Role assignment per round.
-- THE SECRET LIVES HERE: who is the impostor and the hint. It is the
-- most sensitive table. That is why locked-down RLS matters: the FE never
-- reads it directly; the backend only sends each player THEIR own role.
-- ------------------------------------------------------------
create table public.assignments (
  id         uuid primary key default gen_random_uuid(),
  round_id   uuid not null references public.rounds(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  role       text not null check (role in ('crew', 'impostor')),
  hint       text,                                         -- vague hint for the impostor
  unique (round_id, player_id)                             -- one role per player per round
);

comment on table public.assignments is 'Each player role per round. Sensitive data: never expose to the client.';

create index assignments_round_id_idx on public.assignments (round_id);

alter table public.rounds enable row level security;
alter table public.assignments enable row level security;
