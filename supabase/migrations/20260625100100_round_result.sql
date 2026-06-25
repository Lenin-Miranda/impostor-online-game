-- ============================================================
-- Store the computed round result
-- We persist the result payload so a player who reconnects during
-- the 'result' phase can be re-shown the outcome without recomputing
-- (and without double-counting scores).
-- ============================================================

alter table public.rounds add column result jsonb;
