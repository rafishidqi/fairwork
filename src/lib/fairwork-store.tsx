'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Profile,
  Project,
  ProjectMember,
  Milestone,
  Submission,
  Review,
  Activity,
  ContributionSummary,
  MilestoneStatus,
  ReviewDecision,
  StoredFile,
} from '@/types/database';
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';
import { evaluateTextFlag } from './fairwork-heuristic';

// 4 Fictive Demo Users for STACK 2026 Final Day Scenario
export const DEMO_USERS: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    nama: 'Rian Ardianto (Leader)',
    email: 'leader@demo.fairwork.edu',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian',
    role: 'student',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    nama: 'Alicia Amanda (Member A)',
    email: 'alicia@demo.fairwork.edu',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alicia',
    role: 'student',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    nama: 'Brian Pratama (Member B)',
    email: 'brian@demo.fairwork.edu',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian',
    role: 'student',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    nama: 'Cindy Maharani (Member C)',
    email: 'cindy@demo.fairwork.edu',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cindy',
    role: 'student',
    created_at: '2026-11-20T10:00:00Z',
  },
];

const INITIAL_PROJECT: Project = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  judul: 'Software Engineering Final Report',
  mata_kuliah: 'CS302 - Software Engineering',
  tenggat: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  deskripsi: 'Collaborative development of a reliable peer-accountability platform for campus teamwork.',
  leader_id: DEMO_USERS[0].id,
  created_at: '2026-11-21T08:00:00Z',
};

const INITIAL_MEMBERS: ProjectMember[] = [
  { project_id: INITIAL_PROJECT.id, user_id: DEMO_USERS[0].id, role: 'leader', joined_at: '2026-11-21T08:00:00Z', profile: DEMO_USERS[0] },
  { project_id: INITIAL_PROJECT.id, user_id: DEMO_USERS[1].id, role: 'member', joined_at: '2026-11-21T08:00:00Z', profile: DEMO_USERS[1] },
  { project_id: INITIAL_PROJECT.id, user_id: DEMO_USERS[2].id, role: 'member', joined_at: '2026-11-21T08:00:00Z', profile: DEMO_USERS[2] },
  { project_id: INITIAL_PROJECT.id, user_id: DEMO_USERS[3].id, role: 'member', joined_at: '2026-11-21T08:00:00Z', profile: DEMO_USERS[3] },
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb',
    project_id: INITIAL_PROJECT.id,
    judul: 'System Architecture & Database Schema',
    deskripsi: 'Design PostgreSQL schema with RLS policies, ERD diagrams, and atomic trigger updates.',
    tenggat: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee_id: DEMO_USERS[1].id,
    status: 'verified',
    bobot: 2,
    created_at: '2026-11-21T09:00:00Z',
    assignee: DEMO_USERS[1],
  },
  {
    id: 'bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb',
    project_id: INITIAL_PROJECT.id,
    judul: 'Milestone Board UI & State Management',
    deskripsi: 'Implement responsive Kanban columns (To Do, Submitted, Verified) with live state synchronization.',
    tenggat: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee_id: DEMO_USERS[2].id,
    status: 'submitted',
    bobot: 2,
    created_at: '2026-11-21T09:30:00Z',
    assignee: DEMO_USERS[2],
  },
  {
    id: 'bbbbbbbb-3333-bbbb-bbbb-bbbbbbbbbbbb',
    project_id: INITIAL_PROJECT.id,
    judul: 'Supabase Authentication & RLS Security Rules',
    deskripsi: 'Set up Supabase Auth, secure sessions, and unit test suites for non-member isolation.',
    tenggat: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignee_id: DEMO_USERS[0].id,
    status: 'verified',
    bobot: 1,
    created_at: '2026-11-21T10:00:00Z',
    assignee: DEMO_USERS[0],
  },
  {
    id: 'bbbbbbbb-4444-bbbb-bbbb-bbbbbbbbbbbb',
    project_id: INITIAL_PROJECT.id,
    judul: 'Automated Contribution Summary Engine',
    deskripsi: 'Create SQL view formulas and PDF export utilities for transparent contribution summaries.',
    tenggat: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignee_id: DEMO_USERS[3].id,
    status: 'revision_requested',
    bobot: 1,
    created_at: '2026-11-21T10:30:00Z',
    assignee: DEMO_USERS[3],
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'cccccccc-1111-cccc-cccc-cccccccccccc',
    milestone_id: 'bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb',
    member_id: DEMO_USERS[1].id,
    versi: 1,
    deskripsi: 'Completed the PostgreSQL database schema with 7 core tables, row level security policies, and triggers for auto-updating milestone status and activity feed. Attached ERD and SQL script.',
    file_paths: [
      { name: 'fairwork_erd_v1.png', path: 'proof-of-work/erd_v1.png', size: 184520, type: 'image/png' },
      { name: 'schema_migrations.sql', path: 'proof-of-work/schema.sql', size: 14200, type: 'text/plain' },
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    member: DEMO_USERS[1],
  },
  {
    id: 'cccccccc-3333-cccc-cccc-cccccccccccc',
    milestone_id: 'bbbbbbbb-3333-bbbb-bbbb-bbbbbbbbbbbb',
    member_id: DEMO_USERS[0].id,
    versi: 1,
    deskripsi: 'Configured Supabase Auth with server-side cookie middleware and automated profile synchronization upon registration.',
    file_paths: [
      { name: 'auth_implementation_report.pdf', path: 'proof-of-work/auth_report.pdf', size: 348920, type: 'application/pdf' },
    ],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    member: DEMO_USERS[0],
  },
  {
    id: 'cccccccc-2222-cccc-cccc-cccccccccccc',
    milestone_id: 'bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb',
    member_id: DEMO_USERS[2].id,
    versi: 1,
    deskripsi: 'Implemented full responsive Kanban board with To Do, Submitted, and Verified columns. Ready for peer review.',
    file_paths: [
      { name: 'board_preview_mobile.png', path: 'proof-of-work/board_mobile.png', size: 420100, type: 'image/png' },
    ],
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    member: DEMO_USERS[2],
  },
  {
    id: 'cccccccc-4444-cccc-cccc-cccccccccccc',
    milestone_id: 'bbbbbbbb-4444-bbbb-bbbb-bbbbbbbbbbbb',
    member_id: DEMO_USERS[3].id,
    versi: 1,
    deskripsi: 'Drafted initial SQL view for calculating individual percentage. Needs additional testing for edge cases where total verified weight is 0.',
    file_paths: [
      { name: 'draft_calculation.txt', path: 'proof-of-work/draft.txt', size: 2400, type: 'text/plain' },
    ],
    flag_unreviewed_text: true,
    flag_reason: 'Unedited draft detected: Please provide unit test results or sample execution output.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    member: DEMO_USERS[3],
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'dddddddd-1111-dddd-dddd-dddddddddddd',
    submission_id: 'cccccccc-1111-cccc-cccc-cccccccccccc',
    reviewer_id: DEMO_USERS[2].id,
    keputusan: 'verify',
    komentar: 'Great work Alicia! The RLS policies cover all project boundaries properly and the trigger for anti-free-riding looks rock solid.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: DEMO_USERS[2],
  },
  {
    id: 'dddddddd-3333-dddd-dddd-dddddddddddd',
    submission_id: 'cccccccc-3333-cccc-cccc-cccccccccccc',
    reviewer_id: DEMO_USERS[3].id,
    keputusan: 'verify',
    komentar: 'Tested authentication flow across desktop and mobile. Session persistence and security checks pass flawlessly.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: DEMO_USERS[3],
  },
  {
    id: 'dddddddd-4444-dddd-dddd-dddddddddddd',
    submission_id: 'cccccccc-4444-cccc-cccc-cccccccccccc',
    reviewer_id: DEMO_USERS[1].id,
    keputusan: 'revision',
    komentar: 'Please add handling for projects where no milestones are verified yet so division by zero is avoided, and attach the test suite output.',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    reviewer: DEMO_USERS[1],
  },
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '1',
    project_id: INITIAL_PROJECT.id,
    tipe: 'project_created',
    aktor_id: DEMO_USERS[0].id,
    detail: 'Project created: Software Engineering Final Report',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[0],
  },
  {
    id: '2',
    project_id: INITIAL_PROJECT.id,
    tipe: 'upload',
    aktor_id: DEMO_USERS[0].id,
    detail: 'Rian Ardianto (Leader) submitted proof of work (v1) for: Supabase Authentication & RLS Security Rules',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[0],
  },
  {
    id: '3',
    project_id: INITIAL_PROJECT.id,
    tipe: 'review',
    aktor_id: DEMO_USERS[3].id,
    detail: 'Cindy Maharani (Member C) verified: Supabase Authentication & RLS Security Rules',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[3],
  },
  {
    id: '4',
    project_id: INITIAL_PROJECT.id,
    tipe: 'upload',
    aktor_id: DEMO_USERS[1].id,
    detail: 'Alicia Amanda (Member A) submitted proof of work (v1) for: System Architecture & Database Schema',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[1],
  },
  {
    id: '5',
    project_id: INITIAL_PROJECT.id,
    tipe: 'review',
    aktor_id: DEMO_USERS[2].id,
    detail: 'Brian Pratama (Member B) verified: System Architecture & Database Schema',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[2],
  },
  {
    id: '6',
    project_id: INITIAL_PROJECT.id,
    tipe: 'revision_requested',
    aktor_id: DEMO_USERS[1].id,
    detail: 'Alicia Amanda (Member A) requested revision for: Automated Contribution Summary Engine',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[1],
  },
  {
    id: '7',
    project_id: INITIAL_PROJECT.id,
    tipe: 'upload',
    aktor_id: DEMO_USERS[2].id,
    detail: 'Brian Pratama (Member B) submitted proof of work (v1) for: Milestone Board UI & State Management',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    aktor: DEMO_USERS[2],
  },
];

interface FairWorkContextType {
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
  projects: Project[];
  currentProject: Project;
  setCurrentProject: (proj: Project) => void;
  members: ProjectMember[];
  milestones: Milestone[];
  submissions: Submission[];
  reviews: Review[];
  activities: Activity[];
  createProject: (data: { judul: string; mata_kuliah: string; tenggat: string; deskripsi?: string; member_emails?: string[] }) => Promise<Project>;
  createMilestone: (data: { judul: string; deskripsi?: string; tenggat: string; assignee_id: string; bobot: number }) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  uploadSubmission: (milestoneId: string, deskripsi: string, files: StoredFile[]) => Promise<void>;
  submitReview: (submissionId: string, keputusan: ReviewDecision, komentar: string) => Promise<{ success: boolean; error?: string }>;
  getContributionSummary: () => ContributionSummary[];
  resetToDemo: () => void;
  isLiveSupabase: boolean;
  mode: 'demo' | 'live';
  authLoading: boolean;
  isAuthenticated: boolean;
  selectMode: (mode: 'demo' | 'live') => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nama: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const FairWorkContext = createContext<FairWorkContextType | undefined>(undefined);

export function FairWorkProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile>(DEMO_USERS[0]);
  const [projects, setProjects] = useState<Project[]>([INITIAL_PROJECT]);
  const [currentProject, setCurrentProject] = useState<Project>(INITIAL_PROJECT);
  const [members, setMembers] = useState<ProjectMember[]>(INITIAL_MEMBERS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    const supabase = getSupabaseClient();
    const savedMode = localStorage.getItem('fw_mode') as 'demo' | 'live' | null;
    const initialMode = savedMode === 'live' && isSupabaseConfigured ? 'live' : 'demo';
    setMode(initialMode);

    if (initialMode === 'live' && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) initializeLiveUser(supabase, session.user);
        else setAuthLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) initializeLiveUser(supabase, session.user);
        else {
          setIsAuthenticated(false);
          setIsLiveSupabase(false);
          setAuthLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // Fallback to local storage persistence for smooth demo
      const savedProjects = localStorage.getItem('fw_projects');
      const savedMilestones = localStorage.getItem('fw_milestones');
      const savedSubmissions = localStorage.getItem('fw_submissions');
      const savedReviews = localStorage.getItem('fw_reviews');
      const savedActivities = localStorage.getItem('fw_activities');
      const savedUser = localStorage.getItem('fw_current_user');

      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
      if (savedReviews) setReviews(JSON.parse(savedReviews));
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      setAuthLoading(false);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!isLiveSupabase) {
      localStorage.setItem('fw_projects', JSON.stringify(projects));
      localStorage.setItem('fw_milestones', JSON.stringify(milestones));
      localStorage.setItem('fw_submissions', JSON.stringify(submissions));
      localStorage.setItem('fw_reviews', JSON.stringify(reviews));
      localStorage.setItem('fw_activities', JSON.stringify(activities));
      localStorage.setItem('fw_current_user', JSON.stringify(currentUser));
    }
  }, [projects, milestones, submissions, reviews, activities, currentUser, isLiveSupabase]);

  async function syncFromSupabase(supabase: any) {
    try {
      const { data: projs } = await supabase.from('projects').select('*');
      setProjects(projs || []);
      if (projs && projs.length > 0) setCurrentProject(projs[0]);
      const { data: mls } = await supabase.from('milestones').select('*, assignee:profiles(*)');
      setMilestones(mls || []);

      const { data: subs } = await supabase.from('submissions').select('*, member:profiles(*)');
      setSubmissions(subs || []);

      const { data: revs } = await supabase.from('reviews').select('*, reviewer:profiles(*)');
      setReviews(revs || []);

      const { data: acts } = await supabase.from('activity').select('*, aktor:profiles(*)').order('created_at', { ascending: false });
      setActivities(acts || []);
      if (projs && projs.length > 0) {
        const { data: projectMembers } = await supabase
          .from('project_members')
          .select('*, profile:profiles(*)')
          .eq('project_id', projs[0].id);
        setMembers(projectMembers || []);
      } else setMembers([]);
    } catch (err) {
      console.warn('Supabase sync warning, falling back to local store:', err);
    }
  }

  async function initializeLiveUser(supabase: any, authUser: any) {
    setAuthLoading(true);
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (error || !profile) {
      console.warn('Unable to load FairWork profile:', error?.message);
      setIsAuthenticated(false);
      setIsLiveSupabase(false);
    } else {
      setCurrentUser(profile);
      setIsAuthenticated(true);
      setIsLiveSupabase(true);
      await syncFromSupabase(supabase);
    }
    setAuthLoading(false);
  }

  const selectMode = (nextMode: 'demo' | 'live') => {
    if (nextMode === 'live' && !isSupabaseConfigured) {
      throw new Error('Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    localStorage.setItem('fw_mode', nextMode);
    setMode(nextMode);
    if (nextMode === 'demo') {
      setIsLiveSupabase(false);
      setIsAuthenticated(false);
      resetToDemo();
    } else {
      const supabase = getSupabaseClient();
      setAuthLoading(true);
      supabase?.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) initializeLiveUser(supabase, session.user);
        else setAuthLoading(false);
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await initializeLiveUser(supabase, user);
  };

  const signUp = async (nama: string, email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nama } } });
    if (error) throw error;
    if (data.session?.user) await initializeLiveUser(supabase, data.session.user);
    return data.session ? null : 'Akun dibuat. Periksa email untuk mengonfirmasi akun, lalu masuk.';
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setIsAuthenticated(false);
    setIsLiveSupabase(false);
    setAuthLoading(false);
  };

  const resetToDemo = () => {
    localStorage.clear();
    setProjects([INITIAL_PROJECT]);
    setCurrentProject(INITIAL_PROJECT);
    setMembers(INITIAL_MEMBERS);
    setMilestones(INITIAL_MILESTONES);
    setSubmissions(INITIAL_SUBMISSIONS);
    setReviews(INITIAL_REVIEWS);
    setActivities(INITIAL_ACTIVITIES);
    setCurrentUser(DEMO_USERS[0]);
  };

  // FR-2: Create Project
  const createProject = async (data: { judul: string; mata_kuliah: string; tenggat: string; deskripsi?: string; member_emails?: string[] }): Promise<Project> => {
    if (isLiveSupabase) {
      const supabase = getSupabaseClient();
      const { data: project, error } = await supabase!.from('projects').insert({
        judul: data.judul,
        mata_kuliah: data.mata_kuliah,
        tenggat: data.tenggat,
        deskripsi: data.deskripsi || '',
        leader_id: currentUser.id,
      }).select().single();
      if (error) throw error;
      const emails = Array.from(new Set([currentUser.email, ...(data.member_emails || [])]));
      const { data: profiles, error: profilesError } = await supabase!.from('profiles').select('id, email').in('email', emails);
      if (profilesError) throw profilesError;
      const rows = (profiles || []).map((profile: any) => ({ project_id: project.id, user_id: profile.id, role: profile.id === currentUser.id ? 'leader' : 'member' }));
      if (rows.length) {
        const { error: membersError } = await supabase!.from('project_members').insert(rows);
        if (membersError) throw membersError;
      }
      await syncFromSupabase(supabase);
      return project;
    }
    const newProject: Project = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now(),
      judul: data.judul,
      mata_kuliah: data.mata_kuliah,
      tenggat: data.tenggat,
      deskripsi: data.deskripsi || '',
      leader_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    const newMembers: ProjectMember[] = [
      { project_id: newProject.id, user_id: currentUser.id, role: 'leader', joined_at: new Date().toISOString(), profile: currentUser },
      ...DEMO_USERS.filter((u) => u.id !== currentUser.id).slice(0, 3).map((u) => ({
        project_id: newProject.id,
        user_id: u.id,
        role: 'member' as const,
        joined_at: new Date().toISOString(),
        profile: u,
      })),
    ];

    const newActivity: Activity = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now(),
      project_id: newProject.id,
      tipe: 'project_created',
      aktor_id: currentUser.id,
      detail: `${currentUser.nama} created project: ${newProject.judul}`,
      created_at: new Date().toISOString(),
      aktor: currentUser,
    };

    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);
    setMembers(newMembers);
    setActivities((prev) => [newActivity, ...prev]);

    return newProject;
  };

  // FR-3: Create Milestone
  const createMilestone = async (data: { judul: string; deskripsi?: string; tenggat: string; assignee_id: string; bobot: number }) => {
    if (isLiveSupabase) {
      const supabase = getSupabaseClient();
      const { error } = await supabase!.from('milestones').insert({ ...data, project_id: currentProject.id, status: 'todo' });
      if (error) throw error;
      await syncFromSupabase(supabase);
      return;
    }
    const assigneeProfile = DEMO_USERS.find((u) => u.id === data.assignee_id) || currentUser;
    const newMilestone: Milestone = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'm-' + Date.now(),
      project_id: currentProject.id,
      judul: data.judul,
      deskripsi: data.deskripsi || '',
      tenggat: data.tenggat,
      assignee_id: data.assignee_id,
      status: 'todo',
      bobot: data.bobot || 1,
      created_at: new Date().toISOString(),
      assignee: assigneeProfile,
    };

    const newActivity: Activity = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now(),
      project_id: currentProject.id,
      tipe: 'milestone_created',
      aktor_id: currentUser.id,
      detail: `${currentUser.nama} added milestone: "${newMilestone.judul}" (assigned to ${assigneeProfile.nama})`,
      created_at: new Date().toISOString(),
      aktor: currentUser,
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setActivities((prev) => [newActivity, ...prev]);
  };

  const updateMilestone = async (id: string, data: Partial<Milestone>) => {
    if (isLiveSupabase) {
      const { error } = await getSupabaseClient()!.from('milestones').update(data).eq('id', id);
      if (error) throw error;
      await syncFromSupabase(getSupabaseClient());
      return;
    }
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updated_at: new Date().toISOString() } : m))
    );
  };

  const deleteMilestone = async (id: string) => {
    if (isLiveSupabase) {
      const { error } = await getSupabaseClient()!.from('milestones').delete().eq('id', id);
      if (error) throw error;
      await syncFromSupabase(getSupabaseClient());
      return;
    }
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // FR-4 & FR-8: Upload Submission
  const uploadSubmission = async (milestoneId: string, deskripsi: string, files: StoredFile[]) => {
    const targetMilestone = milestones.find((m) => m.id === milestoneId);
    if (!targetMilestone) return;

    // Check version
    const existing = submissions.filter((s) => s.milestone_id === milestoneId);
    const newVersion = existing.length + 1;

    // FR-8: Check copy-paste / unedited text heuristic
    const { flag, reason } = evaluateTextFlag(deskripsi, existing);

    if (isLiveSupabase) {
      const supabase = getSupabaseClient();
      const { error } = await supabase!.from('submissions').insert({ milestone_id: milestoneId, member_id: currentUser.id, versi: newVersion, deskripsi, file_paths: files, flag_unreviewed_text: flag, flag_reason: reason });
      if (error) throw error;
      await syncFromSupabase(supabase);
      return;
    }

    const newSub: Submission = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'sub-' + Date.now(),
      milestone_id: milestoneId,
      member_id: currentUser.id,
      versi: newVersion,
      deskripsi,
      file_paths: files,
      flag_unreviewed_text: flag,
      flag_reason: reason,
      created_at: new Date().toISOString(),
      member: currentUser,
    };

    // Update milestone status to 'submitted'
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, status: 'submitted', updated_at: new Date().toISOString() }
          : m
      )
    );

    const newActivity: Activity = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now(),
      project_id: targetMilestone.project_id,
      tipe: 'upload',
      aktor_id: currentUser.id,
      detail: `${currentUser.nama} submitted proof of work (v${newVersion}) for: "${targetMilestone.judul}"`,
      metadata: { milestone_id: milestoneId, version: newVersion },
      created_at: new Date().toISOString(),
      aktor: currentUser,
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setActivities((prev) => [newActivity, ...prev]);
  };

  // FR-5: Submit Peer Review (Enforcing Anti-Self-Review Rule)
  const submitReview = async (
    submissionId: string,
    keputusan: ReviewDecision,
    komentar: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetSub = submissions.find((s) => s.id === submissionId);
    if (!targetSub) {
      return { success: false, error: 'Submission not found' };
    }

    // STRICT BUSINESS RULE: Assignee CANNOT review their own submission!
    if (targetSub.member_id === currentUser.id) {
      return {
        success: false,
        error: 'Conflict of Interest: You cannot peer-review your own submission!',
      };
    }

    if (!komentar || komentar.trim().length === 0) {
      return { success: false, error: 'A review comment is mandatory.' };
    }

    const targetMilestone = milestones.find((m) => m.id === targetSub.milestone_id);
    if (!targetMilestone) {
      return { success: false, error: 'Associated milestone not found.' };
    }

    const newReview: Review = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'rev-' + Date.now(),
      submission_id: submissionId,
      reviewer_id: currentUser.id,
      keputusan,
      komentar: komentar.trim(),
      created_at: new Date().toISOString(),
      reviewer: currentUser,
    };

    const newStatus: MilestoneStatus = keputusan === 'verify' ? 'verified' : 'revision_requested';

    if (isLiveSupabase) {
      const supabase = getSupabaseClient();
      const { error } = await supabase!.from('reviews').insert({ submission_id: submissionId, reviewer_id: currentUser.id, keputusan, komentar: komentar.trim() });
      if (error) return { success: false, error: error.message };
      await syncFromSupabase(supabase);
      return { success: true };
    }

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === targetMilestone.id
          ? { ...m, status: newStatus, updated_at: new Date().toISOString() }
          : m
      )
    );

    const newActivity: Activity = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now(),
      project_id: targetMilestone.project_id,
      tipe: keputusan === 'verify' ? 'review' : 'revision_requested',
      aktor_id: currentUser.id,
      detail: `${currentUser.nama} ${keputusan === 'verify' ? 'verified' : 'requested revision for'}: "${targetMilestone.judul}"`,
      metadata: { milestone_id: targetMilestone.id, submission_id: submissionId, decision: keputusan },
      created_at: new Date().toISOString(),
      aktor: currentUser,
    };

    setReviews((prev) => [newReview, ...prev]);
    setActivities((prev) => [newActivity, ...prev]);

    return { success: true };
  };

  // FR-6: Contribution Summary Formula
  // Contribution (%) = (Sum of weights of Verified milestones assigned to member / Total weight of all Verified milestones in project) * 100
  const getContributionSummary = (): ContributionSummary[] => {
    const projectMilestones = milestones.filter((m) => m.project_id === currentProject.id);
    const verifiedMilestones = projectMilestones.filter((m) => m.status === 'verified');
    const totalVerifiedWeight = verifiedMilestones.reduce((acc, curr) => acc + (curr.bobot || 1), 0);

    return members.map((mem) => {
      const user = mem.profile || DEMO_USERS.find((u) => u.id === mem.user_id) || {
        id: mem.user_id,
        nama: 'Team Member',
        email: 'member@fairwork.edu',
        avatar_url: null,
        role: mem.role,
        created_at: '',
      };

      const userMilestones = projectMilestones.filter((m) => m.assignee_id === mem.user_id);
      const userVerifiedMilestones = userMilestones.filter((m) => m.status === 'verified');
      const userVerifiedWeight = userVerifiedMilestones.reduce((acc, curr) => acc + (curr.bobot || 1), 0);

      // Reviews given by this user for this project
      const reviewsCount = reviews.filter((r) => {
        if (r.reviewer_id !== mem.user_id) return false;
        const sub = submissions.find((s) => s.id === r.submission_id);
        if (!sub) return false;
        const ml = projectMilestones.find((m) => m.id === sub.milestone_id);
        return Boolean(ml);
      }).length;

      const contributionPct =
        totalVerifiedWeight > 0
          ? Number(((userVerifiedWeight / totalVerifiedWeight) * 100).toFixed(1))
          : 0;

      return {
        user_id: mem.user_id,
        nama: user.nama,
        email: user.email,
        avatar_url: user.avatar_url,
        role: mem.role,
        assigned_count: userMilestones.length,
        verified_count: userVerifiedMilestones.length,
        reviews_given_count: reviewsCount,
        verified_weight: userVerifiedWeight,
        total_project_verified_weight: totalVerifiedWeight,
        contribution_pct: contributionPct,
      };
    });
  };

  return (
    <FairWorkContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        projects,
        currentProject,
        setCurrentProject,
        members,
        milestones,
        submissions,
        reviews,
        activities,
        createProject,
        createMilestone,
        updateMilestone,
        deleteMilestone,
        uploadSubmission,
        submitReview,
        getContributionSummary,
        resetToDemo,
        isLiveSupabase,
        mode,
        authLoading,
        isAuthenticated,
        selectMode,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </FairWorkContext.Provider>
  );
}

export function useFairWork() {
  const context = useContext(FairWorkContext);
  if (!context) {
    throw new Error('useFairWork must be used within a FairWorkProvider');
  }
  return context;
}
