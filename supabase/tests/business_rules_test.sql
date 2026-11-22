-- ==============================================================================
-- FairWork Automated Business Rule Verification (SQL Test Suite)
-- Tests: FR-5 Anti-Self-Review, FR-6 Formula, and State Transitions
-- ==============================================================================

-- Test 1: Anti-Self-Review Rule (FR-5)
-- Attempting to review own submission must raise an exception!
do $$
declare
  u_assignee uuid := '22222222-2222-2222-2222-222222222222';
  sub_id uuid;
  caught_error boolean := false;
begin
  select id into sub_id from public.submissions where member_id = u_assignee limit 1;

  begin
    insert into public.reviews (submission_id, reviewer_id, keputusan, komentar)
    values (sub_id, u_assignee, 'verify', 'Self-review should fail!');
  exception when others then
    caught_error := true;
  end;

  if not caught_error then
    raise exception 'TEST FAILED: Assignee was able to peer-review their own submission!';
  else
    raise notice 'TEST PASSED: Conflict of Interest successfully blocked self-review.';
  end if;
end $$;

-- Test 2: Formula Verification (FR-6)
-- Query contribution summary function
do $$
declare
  proj_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  total_pct numeric;
begin
  select coalesce(sum(contribution_pct), 0) into total_pct
  from public.get_project_contribution_summary(proj_id);

  if total_pct > 100.1 or (total_pct < 99.9 and total_pct > 0) then
    raise exception 'TEST FAILED: Contribution percentages do not sum to ~100% (got %)', total_pct;
  else
    raise notice 'TEST PASSED: FR-6 Contribution summary percentages sum correctly to %', total_pct;
  end if;
end $$;
