-- ============================================================
-- English hint alongside the Spanish one
-- `hint` stays the Spanish hint (the default authoring language).
-- We add an optional `hint_en`; the backend builds { es, en } and
-- falls back to the Spanish hint when there is no English one.
-- This keeps adding new footballers simple (just `hint`).
-- ============================================================

alter table public.footballers add column hint_en text;

update public.footballers set hint_en = 'Left-footed forward, short, South American legend' where name = 'Lionel Messi';
update public.footballers set hint_en = 'Powerful forward, huge leap, European great' where name = 'Cristiano Ronaldo';
update public.footballers set hint_en = 'Brazilian playmaker, pure flair and dribbling' where name = 'Ronaldinho';
update public.footballers set hint_en = 'Elegant playmaker, European, 2000s legend' where name = 'Zinedine Zidane';
update public.footballers set hint_en = 'Brazilian left winger, fast and tricky' where name = 'Vinícius Júnior';
update public.footballers set hint_en = 'Very young winger, Spanish wonderkid' where name = 'Lamine Yamal';
update public.footballers set hint_en = 'French forward, hard-working scorer' where name = 'Antoine Griezmann';
update public.footballers set hint_en = 'Box poacher, central European, veteran' where name = 'Robert Lewandowski';
update public.footballers set hint_en = 'Towering forward, Nordic, serial scorer' where name = 'Erling Haaland';
update public.footballers set hint_en = 'African right winger, left-footed and lethal' where name = 'Mohamed Salah';
update public.footballers set hint_en = 'Young English winger, right flank' where name = 'Bukayo Saka';
update public.footballers set hint_en = 'Young English playmaker, cool finisher' where name = 'Cole Palmer';
update public.footballers set hint_en = 'Argentine forward, powerful scorer' where name = 'Lautaro Martínez';
update public.footballers set hint_en = 'Portuguese winger, fast and direct' where name = 'Rafael Leão';
update public.footballers set hint_en = 'English centre-forward, pure scorer' where name = 'Harry Kane';
update public.footballers set hint_en = 'Young German playmaker, creative' where name = 'Florian Wirtz';
update public.footballers set hint_en = 'French winger, two-footed and fast' where name = 'Ousmane Dembélé';
