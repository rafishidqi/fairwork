-- ==============================================================================
-- FairWork Database Schema & Security Policies (Versi 1.1 - Supabase)
-- Target: PostgreSQL / Supabase
-- Team: Manuk Hiber | STACK 2026 (Case 1: Smarter Campus and Learning)
-- ==============================================================================

-- 1. Create Enums & Extensions
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (mirrors auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  email text not null,
  avatar_url text,
  role text default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to auto-create profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    nama = excluded.nama,
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  mata_kuliah text not null,
  tenggat timestamptz not null,
  deskripsi text default '',
  leader_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Project Members Table
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- 5. Milestones Table
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  judul text not null,
  deskripsi text default '',
  tenggat timestamptz not null,
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'todo' check (status in ('todo', 'submitted', 'verified', 'revision_requested')),
  bobot int not null default 1 check (bobot >= 1 and bobot <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Submissions Table (Immutable historical versions)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete restrict,
  versi int not null default 1,
  deskripsi text not null,
  file_paths jsonb not null default '[]'::jsonb,
  flag_unreviewed_text boolean default false,
  flag_reason text,
  created_at timestamptz not null default now()
);

-- 7. Reviews Table (Peer Reviews)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  keputusan text not null check (keputusan in ('verify', 'revision')),
  komentar text not null check (length(trim(komentar)) > 0),
  created_at timestamptz not null default now()
);

-- 8. Activity Log Table
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tipe text not null check (tipe in ('upload', 'review', 'revision_requested', 'reminder', 'project_created', 'milestone_created')),
  aktor_id uuid references public.profiles(id) on delete set null,
  detail text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- Business Rules Enforced via Database Triggers & Constraints
-- ==============================================================================

-- Anti-Free-Riding Rule: An assignee cannot review their own submission!
create or replace function public.validate_reviewer_not_assignee()
returns trigger
language plpgsql
security definer
as $$
declare
  sub_member_id uuid;
begin
  select member_id into sub_member_id from public.submissions where id = new.submission_id;
  if sub_member_id = new.reviewer_id then
    raise exception 'Conflict of Interest: You cannot peer-review your own submission!';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_reviewer on public.reviews;
create trigger trg_validate_reviewer
  before insert on public.reviews
  for each row execute procedure public.validate_reviewer_not_assignee();

-- Automated Submission Flow Trigger
create or replace function public.handle_new_submission()
returns trigger
language plpgsql
security definer
as $$
declare
  m_project_id uuid;
  m_judul text;
  m_actor_name text;
  next_version int;
begin
  -- Calculate incremental version
  select coalesce(max(versi), 0) + 1 into next_version
  from public.submissions
  where milestone_id = new.milestone_id;
  new.versi := next_version;

  -- Update milestone status to 'submitted'
  update public.milestones
  set status = 'submitted', updated_at = now()
  where id = new.milestone_id
  returning project_id, judul into m_project_id, m_judul;

  -- Log Activity
  select nama into m_actor_name from public.profiles where id = new.member_id;
  insert into public.activity (project_id, tipe, aktor_id, detail, metadata)
  values (
    m_project_id,
    'upload',
    new.member_id,
    coalesce(m_actor_name, 'Member') || ' submitted proof of work (v' || new.versi || ') for: ' || m_judul,
    jsonb_build_object('milestone_id', new.milestone_id, 'submission_id', new.id, 'version', new.versi)
  );

  return new;
end;
$$;

drop trigger if exists trg_new_submission on public.submissions;
create trigger trg_new_submission
  before insert on public.submissions
  for each row execute procedure public.handle_new_submission();

-- Automated Review Flow Trigger
create or replace function public.handle_new_review()
returns trigger
language plpgsql
security definer
as $$
declare
  m_id uuid;
  m_project_id uuid;
  m_judul text;
  r_name text;
  new_status text;
  act_type text;
begin
  -- Get milestone details
  select s.milestone_id, m.project_id, m.judul
  into m_id, m_project_id, m_judul
  from public.submissions s
  join public.milestones m on m.id = s.milestone_id
  where s.id = new.submission_id;

  if new.keputusan = 'verify' then
    new_status := 'verified';
    act_type := 'review';
  else
    new_status := 'revision_requested';
    act_type := 'revision_requested';
  end if;

  -- Update milestone status
  update public.milestones
  set status = new_status, updated_at = now()
  where id = m_id;

  -- Log Activity
  select nama into r_name from public.profiles where id = new.reviewer_id;
  insert into public.activity (project_id, tipe, aktor_id, detail, metadata)
  values (
    m_project_id,
    act_type,
    new.reviewer_id,
    coalesce(r_name, 'Reviewer') || case when new.keputusan = 'verify' then ' verified ' else ' requested revision for: ' end || m_judul,
    jsonb_build_object('milestone_id', m_id, 'submission_id', new.submission_id, 'decision', new.keputusan)
  );

  return new;
end;
$$;

drop trigger if exists trg_new_review on public.reviews;
create trigger trg_new_review
  after insert on public.reviews
  for each row execute procedure public.handle_new_review();

-- Auto-add creator as Leader in project_members
create or replace function public.handle_new_project()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.leader_id, 'leader')
  on conflict do nothing;

  insert into public.activity (project_id, tipe, aktor_id, detail)
  values (new.id, 'project_created', new.leader_id, 'Project created: ' || new.judul);

  return new;
end;
$$;

drop trigger if exists trg_new_project on public.projects;
create trigger trg_new_project
  after insert on public.projects
  for each row execute procedure public.handle_new_project();

-- ==============================================================================
-- Contribution Summary SQL Function (FR-6 Formula)
-- Formula: (Total weight of Verified milestones assigned to member / Total weight of all Verified milestones in project) * 100
-- ==============================================================================

create or replace function public.get_project_contribution_summary(p_id uuid)
returns table (
  user_id uuid,
  nama text,
  email text,
  avatar_url text,
  role text,
  assigned_count bigint,
  verified_count bigint,
  reviews_given_count bigint,
  verified_weight bigint,
  total_project_verified_weight bigint,
  contribution_pct numeric
)
language plpgsql
security definer
as $$
declare
  v_total_verified_weight bigint;
begin
  -- Total verified weight across the entire project
  select coalesce(sum(bobot), 0) into v_total_verified_weight
  from public.milestones
  where project_id = p_id and status = 'verified';

  return query
  select
    p.id as user_id,
    p.nama,
    p.email,
    p.avatar_url,
    pm.role,
    -- Assigned milestones
    count(distinct m.id) filter (where m.assignee_id = p.id) as assigned_count,
    -- Verified milestones assigned to this member
    count(distinct m.id) filter (where m.assignee_id = p.id and m.status = 'verified') as verified_count,
    -- Number of reviews given by this member
    count(distinct r.id) filter (where r.reviewer_id = p.id) as reviews_given_count,
    -- Weight sum of verified milestones for this member
    coalesce(sum(m.bobot) filter (where m.assignee_id = p.id and m.status = 'verified'), 0)::bigint as verified_weight,
    -- Project total verified weight
    v_total_verified_weight as total_project_verified_weight,
    -- Contribution percentage
    case
      when v_total_verified_weight > 0 then
        round((coalesce(sum(m.bobot) filter (where m.assignee_id = p.id and m.status = 'verified'), 0)::numeric / v_total_verified_weight::numeric) * 100, 1)
      else
        0::numeric
    end as contribution_pct
  from public.project_members pm
  join public.profiles p on p.id = pm.user_id
  left join public.milestones m on m.project_id = pm.project_id and m.assignee_id = p.id
  left join public.reviews r on r.reviewer_id = p.id and exists (
    select 1 from public.submissions sub
    join public.milestones ms on ms.id = sub.milestone_id
    where sub.id = r.submission_id and ms.project_id = p_id
  )
  where pm.project_id = p_id
  group by p.id, p.nama, p.email, p.avatar_url, pm.role;
end;
$$;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.activity enable row level security;

-- Helper security function: is user a member of project?
create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and user_id = auth.uid()
  );
$$;

-- PROFILES
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- PROJECTS
create policy "Members can view projects they belong to"
  on public.projects for select
  to authenticated
  using (public.is_project_member(id) or leader_id = auth.uid());

create policy "Authenticated users can create projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = leader_id);

create policy "Leader can update project details"
  on public.projects for update
  to authenticated
  using (auth.uid() = leader_id);

-- PROJECT MEMBERS
create policy "Members can view project membership"
  on public.project_members for select
  to authenticated
  using (public.is_project_member(project_id));

create policy "Leader can manage project members"
  on public.project_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects
      where id = project_id and leader_id = auth.uid()
    )
  );

-- MILESTONES
create policy "Members can view project milestones"
  on public.milestones for select
  to authenticated
  using (public.is_project_member(project_id));

create policy "Members can create milestones in project"
  on public.milestones for insert
  to authenticated
  with check (public.is_project_member(project_id));

create policy "Members can update milestone details"
  on public.milestones for update
  to authenticated
  using (public.is_project_member(project_id));

create policy "Leader can delete milestones"
  on public.milestones for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where id = project_id and leader_id = auth.uid()
    )
  );

-- SUBMISSIONS (Immutable history)
create policy "Members can view milestone submissions"
  on public.submissions for select
  to authenticated
  using (
    exists (
      select 1 from public.milestones m
      where m.id = milestone_id and public.is_project_member(m.project_id)
    )
  );

create policy "Assignee can upload submissions"
  on public.submissions for insert
  to authenticated
  with check (
    auth.uid() = member_id
    and exists (
      select 1 from public.milestones m
      where m.id = milestone_id
        and m.assignee_id = auth.uid()
        and public.is_project_member(m.project_id)
    )
  );

-- Note: No UPDATE or DELETE policy on submissions! (Immutable audit trail)

-- REVIEWS
create policy "Members can view peer reviews"
  on public.reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.submissions s
      join public.milestones m on m.id = s.milestone_id
      where s.id = submission_id and public.is_project_member(m.project_id)
    )
  );

create policy "Teammates (non-assignee) can submit reviews"
  on public.reviews for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.submissions s
      join public.milestones m on m.id = s.milestone_id
      where s.id = submission_id
        and s.member_id <> auth.uid()
        and public.is_project_member(m.project_id)
    )
  );

-- Note: No UPDATE or DELETE policy on reviews! (Immutable peer review trail)

-- ACTIVITY
create policy "Members can view project activity stream"
  on public.activity for select
  to authenticated
  using (public.is_project_member(project_id));

create policy "Members can insert activity entries"
  on public.activity for insert
  to authenticated
  with check (public.is_project_member(project_id));

-- ==============================================================================
-- Storage Bucket & Policies for 'proof-of-work'
-- ==============================================================================

-- Create bucket if not exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proof-of-work',
  'proof-of-work',
  false,
  10485760, -- 10 MB in bytes
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Storage RLS
create policy "Project members can download proof files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'proof-of-work');

create policy "Project members can upload proof files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'proof-of-work'
    and (storage.foldername(name))[1] is not null
  );

-- Enable Realtime for milestones and activity
alter publication supabase_realtime add table public.milestones;
alter publication supabase_realtime add table public.activity;
