-- ============================================================
-- Rondas y reparto de roles
-- Una partida = varias rondas dentro de una sala.
-- ============================================================

create table public.rounds (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms(id) on delete cascade,
  number         integer not null,                       -- 1, 2, 3...
  footballer_id  uuid references public.footballers(id) on delete set null,
  category       text,                                    -- categoría usada en esta ronda
  phase          text not null default 'reparto'
                   check (phase in ('reparto', 'pistas', 'debate', 'votacion', 'resultado')),
  started_at     timestamptz not null default now(),
  ended_at       timestamptz,
  unique (room_id, number)                                -- no se repite el nº de ronda en una sala
);

comment on table public.rounds is 'Rondas de una partida. phase es la máquina de estados del juego.';

create index rounds_room_id_idx on public.rounds (room_id);

-- ------------------------------------------------------------
-- Reparto de roles por ronda.
-- AQUÍ VIVE EL SECRETO: quién es impostor y la pista. Es la tabla
-- más sensible. Por eso RLS bloqueado es clave: el FE jamás la lee
-- directo; el backend solo manda a cada jugador SU propio rol.
-- ------------------------------------------------------------
create table public.assignments (
  id         uuid primary key default gen_random_uuid(),
  round_id   uuid not null references public.rounds(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  role       text not null check (role in ('crew', 'impostor')),
  hint       text,                                         -- pista vaga para el impostor
  unique (round_id, player_id)                             -- un rol por jugador por ronda
);

comment on table public.assignments is 'Rol de cada jugador por ronda. Datos sensibles: nunca exponer al cliente.';

create index assignments_round_id_idx on public.assignments (round_id);

alter table public.rounds enable row level security;
alter table public.assignments enable row level security;
