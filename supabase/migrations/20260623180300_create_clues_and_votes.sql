-- ============================================================
-- Clues and votes
-- Each round flow: every player gives a word (clue),
-- then they discuss and vote for the suspect (vote).
-- ============================================================

create table public.clues (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.rounds(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  word        text not null,
  turn_order  integer not null,                          -- in which turn it was said
  created_at  timestamptz not null default now(),
  unique (round_id, player_id)                            -- one word per player per round
);

comment on table public.clues is 'Word each player gives on their turn.';

create index clues_round_id_idx on public.clues (round_id);

create table public.votes (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.rounds(id) on delete cascade,
  voter_id    uuid not null references public.players(id) on delete cascade,
  target_id   uuid not null references public.players(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (round_id, voter_id)                             -- one vote per player per round
);

comment on table public.votes is 'A player vote (voter) pointing at another (target) as the impostor.';

create index votes_round_id_idx on public.votes (round_id);

alter table public.clues enable row level security;
alter table public.votes enable row level security;
