-- ============================================================
-- Pistas y votos
-- El flujo de cada ronda: cada jugador da una palabra (clue),
-- luego se debate y se vota al sospechoso (vote).
-- ============================================================

create table public.clues (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.rounds(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  word        text not null,
  turn_order  integer not null,                          -- en qué turno se dijo
  created_at  timestamptz not null default now(),
  unique (round_id, player_id)                            -- una palabra por jugador por ronda
);

comment on table public.clues is 'Palabra que da cada jugador en su turno.';

create index clues_round_id_idx on public.clues (round_id);

create table public.votes (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.rounds(id) on delete cascade,
  voter_id    uuid not null references public.players(id) on delete cascade,
  target_id   uuid not null references public.players(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (round_id, voter_id)                             -- un voto por jugador por ronda
);

comment on table public.votes is 'Voto de un jugador (voter) señalando a otro (target) como impostor.';

create index votes_round_id_idx on public.votes (round_id);

alter table public.clues enable row level security;
alter table public.votes enable row level security;
