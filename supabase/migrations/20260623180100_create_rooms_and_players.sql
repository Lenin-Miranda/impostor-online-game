-- ============================================================
-- Salas y jugadores
--
-- Ojo a la dependencia circular:
--   players.room_id        -> rooms.id   (un jugador pertenece a una sala)
--   rooms.host_player_id   -> players.id (el anfitrión es un jugador)
--
-- No se puede crear ambas FKs a la vez. Solución: creamos rooms sin
-- la FK del anfitrión, luego players, y al final añadimos la FK con ALTER.
-- ============================================================

create table public.rooms (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,                 -- código para invitar (p.ej. 7K2P9)
  status          text not null default 'lobby'
                    check (status in ('lobby', 'in_game', 'finished')),
  host_player_id  uuid,                                  -- FK añadida más abajo
  settings        jsonb not null default '{
    "impostores": 1,
    "categoria": "Estrellas",
    "tiempo": 5,
    "pistas": true,
    "maxJugadores": 10
  }'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.rooms is 'Salas: agrupan jugadores y partidas. settings refleja la config del lobby del FE.';

create table public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  nickname    text not null,
  is_host     boolean not null default false,
  connected   boolean not null default true,
  score       integer not null default 0,
  joined_at   timestamptz not null default now()
);

comment on table public.players is 'Jugadores conectados a una sala.';

-- Buscar jugadores por sala es la consulta más común.
create index players_room_id_idx on public.players (room_id);

-- Ahora que players existe, añadimos la FK del anfitrión.
-- on delete set null: si se borra ese jugador, la sala no se rompe,
-- solo se queda sin anfitrión (el backend reasignará otro).
alter table public.rooms
  add constraint rooms_host_player_id_fkey
  foreign key (host_player_id) references public.players(id) on delete set null;

-- ------------------------------------------------------------
-- Trigger: mantener updated_at al día en cada UPDATE de rooms.
-- Esta función la reutilizaremos en otras tablas si hace falta.
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

-- RLS bloqueado: todo el acceso pasa por el backend (service_role).
alter table public.rooms enable row level security;
alter table public.players enable row level security;
