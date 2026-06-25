-- ============================================================
-- Per-footballer hint
-- Each footballer gets its own vague hint. The impostor receives
-- this hint (instead of just the league) so it can bluff without
-- knowing exactly who the secret player is.
-- ============================================================

alter table public.footballers add column hint text;

-- Vague hints (Spanish, game-facing content): orient without giving it away.
update public.footballers set hint = 'Delantero zurdo, baja estatura, leyenda sudamericana'      where name = 'Lionel Messi';
update public.footballers set hint = 'Delantero potente, gran salto, europeo histórico'          where name = 'Cristiano Ronaldo';
update public.footballers set hint = 'Mediapunta brasileño, pura magia y regate'                 where name = 'Ronaldinho';
update public.footballers set hint = 'Mediapunta elegante, europeo, leyenda de los 2000'         where name = 'Zinedine Zidane';
update public.footballers set hint = 'Extremo izquierdo brasileño, veloz y regateador'           where name = 'Vinícius Júnior';
update public.footballers set hint = 'Extremo muy joven, promesa española'                       where name = 'Lamine Yamal';
update public.footballers set hint = 'Delantero francés, trabajador y goleador'                  where name = 'Antoine Griezmann';
update public.footballers set hint = 'Killer de área, centroeuropeo, veterano'                   where name = 'Robert Lewandowski';
update public.footballers set hint = 'Delantero altísimo, nórdico, goleador en serie'            where name = 'Erling Haaland';
update public.footballers set hint = 'Extremo derecho africano, zurdo y letal'                   where name = 'Mohamed Salah';
update public.footballers set hint = 'Extremo inglés joven, banda derecha'                       where name = 'Bukayo Saka';
update public.footballers set hint = 'Mediapunta inglés joven, frío en el área'                  where name = 'Cole Palmer';
update public.footballers set hint = 'Delantero argentino, potente y goleador'                   where name = 'Lautaro Martínez';
update public.footballers set hint = 'Extremo portugués, rápido y desequilibrante'               where name = 'Rafael Leão';
update public.footballers set hint = 'Delantero centro inglés, goleador puro'                    where name = 'Harry Kane';
update public.footballers set hint = 'Mediapunta alemán joven, creativo'                         where name = 'Florian Wirtz';
update public.footballers set hint = 'Extremo francés, ambidiestro y veloz'                      where name = 'Ousmane Dembélé';
