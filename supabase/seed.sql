-- ==============================================================================
-- FairWork Demo Seed Data (STACK 2026 - Final Day Demo Scenario)
-- Scenario: "Software Engineering Final Report" with 4 fictive students
-- ==============================================================================

-- Demo User UUIDs
do $$
declare
  u_leader uuid := '11111111-1111-1111-1111-111111111111';
  u_alicia uuid := '22222222-2222-2222-2222-222222222222';
  u_brian uuid  := '33333333-3333-3333-3333-333333333333';
  u_cindy uuid  := '44444444-4444-4444-4444-444444444444';
  
  proj_id uuid  := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  
  m1_id uuid    := 'bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb';
  m2_id uuid    := 'bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb';
  m3_id uuid    := 'bbbbbbbb-3333-bbbb-bbbb-bbbbbbbbbbbb';
  m4_id uuid    := 'bbbbbbbb-4444-bbbb-bbbb-bbbbbbbbbbbb';

  sub1_id uuid  := 'cccccccc-1111-cccc-cccc-cccccccccccc';
  sub2_id uuid  := 'cccccccc-2222-cccc-cccc-cccccccccccc';
  sub3_id uuid  := 'cccccccc-3333-cccc-cccc-cccccccccccc';
  sub4_id uuid  := 'cccccccc-4444-cccc-cccc-cccccccccccc';
begin

  -- 1. Create Profiles
  insert into public.profiles (id, nama, email, avatar_url, role)
  values 
    (u_leader, 'Rian Ardianto (Leader)', 'leader@demo.fairwork.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian', 'student'),
    (u_alicia, 'Alicia Amanda (Member A)', 'alicia@demo.fairwork.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alicia', 'student'),
    (u_brian,  'Brian Pratama (Member B)', 'brian@demo.fairwork.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian', 'student'),
    (u_cindy,  'Cindy Maharani (Member C)', 'cindy@demo.fairwork.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cindy', 'student')
  on conflict (id) do update set nama = excluded.nama;

  -- 2. Create Project
  insert into public.projects (id, judul, mata_kuliah, tenggat, deskripsi, leader_id)
  values (
    proj_id,
    'Software Engineering Final Report',
    'IF3250 - Software Engineering',
    now() + interval '14 days',
    'Comprehensive team project developing a scalable cloud-native collaborative learning platform.',
    u_leader
  )
  on conflict (id) do nothing;

  -- 3. Add Project Members
  insert into public.project_members (project_id, user_id, role)
  values 
    (proj_id, u_leader, 'leader'),
    (proj_id, u_alicia, 'member'),
    (proj_id, u_brian, 'member'),
    (proj_id, u_cindy, 'member')
  on conflict do nothing;

  -- 4. Create Milestones
  -- Milestone 1 (Alicia): Verified (weight 2)
  insert into public.milestones (id, project_id, judul, deskripsi, tenggat, assignee_id, status, bobot)
  values (
    m1_id,
    proj_id,
    'System Architecture & Database Schema',
    'Design PostgreSQL relational schema with RLS policies, ERD diagram, and performance indexes.',
    now() - interval '2 days',
    u_alicia,
    'verified',
    2
  ) on conflict (id) do nothing;

  -- Milestone 2 (Brian): Submitted (waiting for review) (weight 2)
  insert into public.milestones (id, project_id, judul, deskripsi, tenggat, assignee_id, status, bobot)
  values (
    m2_id,
    proj_id,
    'Milestone Board UI & State Management',
    'Implement responsive Kanban columns (To Do, Submitted, Verified) with real-time optimistic updates.',
    now() + interval '2 days',
    u_brian,
    'submitted',
    2
  ) on conflict (id) do nothing;

  -- Milestone 3 (Leader): Verified (weight 1)
  insert into public.milestones (id, project_id, judul, deskripsi, tenggat, assignee_id, status, bobot)
  values (
    m3_id,
    proj_id,
    'Supabase Authentication & Role-Based Access Control',
    'Integrate Supabase Auth with Google OAuth & Email sign-in, session middleware, and security test suites.',
    now() - interval '4 days',
    u_leader,
    'verified',
    1
  ) on conflict (id) do nothing;

  -- Milestone 4 (Cindy): Revision Requested (weight 1)
  insert into public.milestones (id, project_id, judul, deskripsi, tenggat, assignee_id, status, bobot)
  values (
    m4_id,
    proj_id,
    'Automated Contribution Summary Engine',
    'Create SQL aggregation formulas and PDF export utilities for transparent contribution summaries.',
    now() + interval '5 days',
    u_cindy,
    'revision_requested',
    1
  ) on conflict (id) do nothing;

  -- 5. Submissions
  -- Submission for M1 (Alicia v1)
  insert into public.submissions (id, milestone_id, member_id, versi, deskripsi, file_paths, created_at)
  values (
    sub1_id,
    m1_id,
    u_alicia,
    1,
    'Finished PostgreSQL schema with 7 core tables, triggers for atomic status updates, and full RLS policies. Attached complete ERD diagram and migration scripts.',
    '[{"name": "fairwork_erd_v1.png", "size": 184520, "path": "proof-of-work/erd_v1.png"}, {"name": "schema_migrations.sql", "size": 14200, "path": "proof-of-work/schema.sql"}]'::jsonb,
    now() - interval '3 days'
  ) on conflict (id) do nothing;

  -- Review for M1 (Brian verified Alicia)
  insert into public.reviews (id, submission_id, reviewer_id, keputusan, komentar, created_at)
  values (
    gen_random_uuid(),
    sub1_id,
    u_brian,
    'verify',
    'Great job Alicia! The RLS policies cover all project boundaries properly and the trigger for anti-free-riding looks rock solid.',
    now() - interval '2 days'
  ) on conflict do nothing;

  -- Submission for M3 (Leader v1)
  insert into public.submissions (id, milestone_id, member_id, versi, deskripsi, file_paths, created_at)
  values (
    sub3_id,
    m3_id,
    u_leader,
    1,
    'Configured Supabase Auth with server-side cookie middleware and automated profile synchronization upon registration.',
    '[{"name": "auth_implementation_report.pdf", "size": 348920, "path": "proof-of-work/auth_report.pdf"}]'::jsonb,
    now() - interval '5 days'
  ) on conflict (id) do nothing;

  -- Review for M3 (Cindy verified Leader)
  insert into public.reviews (id, submission_id, reviewer_id, keputusan, komentar, created_at)
  values (
    gen_random_uuid(),
    sub3_id,
    u_cindy,
    'verify',
    'Tested authentication flow across desktop and mobile. Session persistence and security checks pass flawlessly.',
    now() - interval '4 days'
  ) on conflict do nothing;

  -- Submission for M2 (Brian v1 - Submitted)
  insert into public.submissions (id, milestone_id, member_id, versi, deskripsi, file_paths, created_at)
  values (
    sub2_id,
    m2_id,
    u_brian,
    1,
    'Completed Milestone Board with drag & drop visual feedback, real-time presence, and responsive layout for mobile browsers.',
    '[{"name": "board_preview_mobile.png", "size": 420100, "path": "proof-of-work/board_mobile.png"}]'::jsonb,
    now() - interval '6 hours'
  ) on conflict (id) do nothing;

  -- Submission for M4 (Cindy v1 - Revision Requested)
  insert into public.submissions (id, milestone_id, member_id, versi, deskripsi, file_paths, flag_unreviewed_text, flag_reason, created_at)
  values (
    sub4_id,
    m4_id,
    u_cindy,
    1,
    'Drafted initial SQL view for calculating individual percentage. Needs additional testing for edge cases where total verified weight is 0.',
    '[{"name": "draft_calculation.txt", "size": 2400, "path": "proof-of-work/draft.txt"}]'::jsonb,
    true,
    'Unedited draft detected: Please provide unit test results or sample execution output.',
    now() - interval '1 day'
  ) on conflict (id) do nothing;

  -- Review for M4 (Alicia requested revision)
  insert into public.reviews (id, submission_id, reviewer_id, keputusan, komentar, created_at)
  values (
    gen_random_uuid(),
    sub4_id,
    u_alicia,
    'revision',
    'Please add handling for projects where no milestones are verified yet so division by zero is avoided, and attach the test suite output.',
    now() - interval '18 hours'
  ) on conflict do nothing;

end $$;
