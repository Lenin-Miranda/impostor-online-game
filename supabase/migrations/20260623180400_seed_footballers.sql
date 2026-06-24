-- ============================================================
-- Footballers catalog seed
-- Reference data (not user data), so it fits inside a migration:
-- it is recreated identically when rebuilding the DB.
-- difficulty: 1 = very well known, 3 = harder to guess.
-- ============================================================

insert into public.footballers (name, league, difficulty) values
  -- Legends
  ('Lionel Messi',        'Legends',    1),
  ('Cristiano Ronaldo',   'Legends',    1),
  ('Ronaldinho',          'Legends',    2),
  ('Zinedine Zidane',     'Legends',    2),
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
