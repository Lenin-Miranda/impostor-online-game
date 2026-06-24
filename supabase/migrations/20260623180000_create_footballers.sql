-- ============================================================
-- Catálogo de futbolistas
-- Es el "pool" del que sale el jugador secreto de cada ronda.
-- Tabla de referencia (datos estáticos), no depende de nadie,
-- por eso la creamos primero.
-- ============================================================

create table public.footballers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  league      text not null,                         -- LaLiga, Premier, Serie A, Leyendas...
  difficulty  smallint not null default 1 check (difficulty between 1 and 3),
  created_at  timestamptz not null default now()
);

comment on table public.footballers is 'Catálogo de futbolistas para el jugador secreto.';

-- Evita duplicar el mismo nombre dentro de la misma liga.
create unique index footballers_name_league_idx
  on public.footballers (lower(name), league);

-- Seguridad: activamos RLS y NO añadimos políticas.
-- Resultado: nadie con la clave pública (anon) puede leer/escribir.
-- Solo el backend con la service_role key (que se salta RLS) accede.
-- Toda lectura del catálogo pasará por NestJS, nunca directo desde el FE.
alter table public.footballers enable row level security;
