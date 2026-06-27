-- ============================================================
-- Expanded footballers catalog
-- More stable, recognizable names for the secret-player pool.
-- Hints stay vague and game-facing so the impostor can bluff.
-- ============================================================

insert into public.footballers (name, league, difficulty, hint) values
  -- Global legends
  ('Diego Maradona',          'Legends', 1, 'Zurdo sudamericano, baja estatura, mito del diez'),
  ('Pelé',                    'Legends', 1, 'Atacante brasileño, símbolo histórico del gol'),
  ('Ronaldo Nazário',         'Legends', 1, 'Delantero brasileño, potencia y definición de élite'),
  ('Johan Cruyff',            'Legends', 2, 'Atacante europeo, cerebro de una escuela famosa'),
  ('Franz Beckenbauer',       'Legends', 2, 'Defensor europeo, elegante y líder desde atrás'),
  ('Gerd Müller',             'Legends', 2, 'Delantero alemán, instinto puro dentro del área'),
  ('Michel Platini',          'Legends', 2, 'Mediapunta europeo, golpeo fino y mucha clase'),
  ('Marco van Basten',        'Legends', 2, 'Delantero neerlandés, remate técnico y elegante'),
  ('Ruud Gullit',             'Legends', 2, 'Mediocampista neerlandés, físico y melena inolvidable'),
  ('George Weah',             'Legends', 2, 'Delantero africano, velocidad y poder histórico'),

  -- Brazil legends
  ('Rivaldo',                 'Legends', 2, 'Zurdo brasileño, técnica y disparo lejano'),
  ('Kaká',                    'Legends', 2, 'Mediapunta brasileño, zancada larga y clase'),
  ('Roberto Carlos',          'Legends', 2, 'Lateral brasileño, zurda potentísima'),
  ('Cafú',                    'Legends', 2, 'Lateral brasileño, recorrido infinito por banda'),
  ('Romário',                 'Legends', 2, 'Delantero brasileño, área pequeña y definición fría'),
  ('Sócrates',                'Legends', 3, 'Mediocampista brasileño, elegante y cerebral'),

  -- Spain legends
  ('Andrés Iniesta',          'Legends', 1, 'Mediocampista español, pausa y control bajo presión'),
  ('Xavi Hernández',          'Legends', 1, 'Mediocampista español, pase corto y ritmo de juego'),
  ('Iker Casillas',           'Legends', 1, 'Arquero español, reflejos y noches grandes'),
  ('Carles Puyol',            'Legends', 2, 'Defensor español, liderazgo y entrega total'),
  ('Raúl González',           'Legends', 2, 'Delantero español, zurdo y oportunista'),
  ('David Villa',             'Legends', 2, 'Delantero español, movilidad y golpeo cruzado'),
  ('Fernando Torres',         'Legends', 2, 'Delantero español, velocidad y definición'),
  ('Sergio Ramos',            'Legends', 1, 'Defensor español, carácter y peligro aéreo'),
  ('Sergio Busquets',         'Legends', 2, 'Pivote español, lectura táctica y calma'),

  -- Italy legends
  ('Paolo Maldini',           'Legends', 1, 'Defensor italiano, elegancia y timing perfecto'),
  ('Gianluigi Buffon',        'Legends', 1, 'Arquero italiano, longevidad y presencia enorme'),
  ('Andrea Pirlo',            'Legends', 2, 'Mediocampista italiano, pase largo y serenidad'),
  ('Francesco Totti',         'Legends', 2, 'Mediapunta italiano, fantasía y fidelidad a una ciudad'),
  ('Alessandro Del Piero',    'Legends', 2, 'Delantero italiano, técnica y disparo colocado'),
  ('Fabio Cannavaro',         'Legends', 2, 'Defensor italiano, anticipación y fuerza aérea'),

  -- France and Premier-era legends
  ('Thierry Henry',           'Legends', 1, 'Delantero francés, zancada amplia y definición fina'),
  ('Patrick Vieira',          'Legends', 2, 'Mediocampista francés, físico y mando en la mitad'),
  ('Eric Cantona',            'Legends', 2, 'Atacante francés, personalidad y toque distinto'),
  ('Didier Drogba',           'Legends', 2, 'Delantero africano, potencia y partidos grandes'),
  ('Samuel Eto''o',           'Legends', 2, 'Delantero africano, velocidad y olfato goleador'),
  ('Yaya Touré',              'Legends', 2, 'Mediocampista africano, fuerza y llegada'),
  ('Jay-Jay Okocha',          'Legends', 3, 'Mediapunta africano, regate y diversión pura'),
  ('David Beckham',           'Legends', 1, 'Mediocampista inglés, centros precisos y balón parado'),
  ('Wayne Rooney',            'Legends', 1, 'Delantero inglés, potencia y sacrificio'),
  ('Steven Gerrard',          'Legends', 2, 'Mediocampista inglés, llegada y disparo lejano'),
  ('Frank Lampard',           'Legends', 2, 'Mediocampista inglés, gol desde segunda línea'),
  ('Paul Scholes',            'Legends', 2, 'Mediocampista inglés, pase limpio y disparo seco'),
  ('Peter Schmeichel',        'Legends', 2, 'Arquero nórdico, enorme bajo palos'),

  -- Netherlands and Germany legends
  ('Dennis Bergkamp',         'Legends', 2, 'Atacante neerlandés, control exquisito y frialdad'),
  ('Clarence Seedorf',        'Legends', 2, 'Mediocampista neerlandés, potencia y experiencia europea'),
  ('Arjen Robben',            'Legends', 1, 'Extremo neerlandés, zurda y diagonal repetida'),
  ('Wesley Sneijder',         'Legends', 2, 'Mediapunta neerlandés, pase vertical y golpeo'),
  ('Philipp Lahm',            'Legends', 2, 'Lateral alemán, inteligencia y precisión'),
  ('Bastian Schweinsteiger',  'Legends', 2, 'Mediocampista alemán, equilibrio y carácter'),
  ('Miroslav Klose',          'Legends', 2, 'Delantero alemán, remate aéreo y torneos grandes'),
  ('Oliver Kahn',             'Legends', 2, 'Arquero alemán, intensidad y liderazgo')
on conflict (lower(name), league) do update
set
  difficulty = excluded.difficulty,
  hint = excluded.hint;
