-- ============================================================
-- Atomic vote registration
-- Fixes the race in "did everyone vote?": concurrent votes used to
-- read the count before each other committed, so the result could
-- fail to trigger. This function locks the round row, so votes for a
-- given round are serialized and the returned count is always exact.
-- ============================================================

create or replace function public.register_vote(
  p_round_id uuid,
  p_voter_id uuid,
  p_target_id uuid
) returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  -- Serialize votes for this round (released when the tx commits).
  perform 1 from public.rounds where id = p_round_id for update;

  insert into public.votes (round_id, voter_id, target_id)
  values (p_round_id, p_voter_id, p_target_id)
  on conflict (round_id, voter_id) do update set target_id = excluded.target_id;

  select count(*) into v_count from public.votes where round_id = p_round_id;
  return v_count;
end;
$$;

grant execute on function public.register_vote(uuid, uuid, uuid) to service_role;
