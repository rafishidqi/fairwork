export type UserRole = 'leader' | 'member';
export type MilestoneStatus = 'todo' | 'submitted' | 'verified' | 'revision_requested';
export type ReviewDecision = 'verify' | 'revision';
export type ActivityType = 'upload' | 'review' | 'revision_requested' | 'reminder' | 'project_created' | 'milestone_created';

export interface Profile {
  id: string;
  nama: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  judul: string;
  mata_kuliah: string;
  tenggat: string;
  deskripsi?: string;
  leader_id: string;
  created_at: string;
  updated_at?: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

export interface StoredFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  judul: string;
  deskripsi?: string;
  tenggat: string;
  assignee_id: string;
  status: MilestoneStatus;
  bobot: number; // default 1, can be 1-3
  created_at: string;
  updated_at?: string;
  assignee?: Profile;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  milestone_id: string;
  member_id: string;
  versi: number;
  deskripsi: string;
  file_paths: StoredFile[];
  flag_unreviewed_text?: boolean;
  flag_reason?: string | null;
  created_at: string;
  member?: Profile;
  reviews?: Review[];
}

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  keputusan: ReviewDecision;
  komentar: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Activity {
  id: string;
  project_id: string;
  tipe: ActivityType;
  aktor_id?: string | null;
  detail: string;
  metadata?: Record<string, any>;
  created_at: string;
  aktor?: Profile;
}

export interface ContributionSummary {
  user_id: string;
  nama: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  assigned_count: number;
  verified_count: number;
  reviews_given_count: number;
  verified_weight: number;
  total_project_verified_weight: number;
  contribution_pct: number;
}
