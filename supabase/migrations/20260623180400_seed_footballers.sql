-- ============================================================
-- Semilla del catálogo de futbolistas
-- Datos de referencia (no de usuario), así que va bien dentro de
-- una migración: se recrean siempre igual al reconstruir la BD.
-- difficulty: 1 = muy conocido, 3 = más difícil de adivinar.
-- ============================================================

insert into public.footballers (name, league, difficulty) values
  -- Leyendas
  ('Lionel Messi',        'Leyendas',   1),
  ('Cristiano Ronaldo',   'Leyendas',   1),
  ('Ronaldinho',          'Leyendas',   2),
  ('Zinedine Zidane',     'Leyendas',   2),
  -- LaLiga
  ('Vinícius Júnior',     'LaLiga',     1),
  ('Lamine Yamal',        'LaLiga',     1),
  ('Antoine Griezmann',   'LaLiga',     2),
  ('Robert Lewandowski',  'LaLiga',     1),
  -- Premier League
  ('Erling Haaland',      'Premier',    1),
  ('Mohamed Salah',       'Premier',    1),
  ('Bukayo Saka',         'Premier',    2),
  ('Cole Palmer',         'Premier',    2),
  -- Serie A
  ('Lautaro Martínez',    'Serie A',    2),
  ('Rafael Leão',         'Serie A',    2),
  -- Bundesliga
  ('Harry Kane',          'Bundesliga', 1),
  ('Florian Wirtz',       'Bundesliga', 2),
  -- Ligue 1
  ('Ousmane Dembélé',     'Ligue 1',    2);
