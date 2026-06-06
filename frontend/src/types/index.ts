// ─── Core Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'recruiter' | 'candidate';
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  extracted_skills: string[];
  keywords: string[];
  ats_score: number;
  quality_score: number;
  uploaded_at: string;
  candidate_name?: string;
  candidate_email?: string;
}

export interface Job {
  id: number;
  recruiter_id: number;
  title: string;
  description: string;
  required_skills: string[];
  created_at: string;
}

export interface SkillAnalysis {
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
  skill_match_percentage: number;
}

export interface RankedCandidate {
  id: number;
  user_id: number;
  candidate_name: string;
  candidate_email: string;
  filename: string;
  skills: string[];
  ats_score: number;
  quality_score: number;
  match_score: number;
  tfidf_score: number;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
  skill_match_percentage: number;
  rank: number;
  uploaded_at: string;
}

export interface DetailedAnalysis {
  resume_id: number;
  job_id: number;
  candidate_name: string;
  job_title: string;
  match_score: number;
  tfidf_score: number;
  ats_score: number;
  quality_score: number;
  skill_analysis: SkillAnalysis;
  extracted_skills: string[];
  keywords: string[];
  insights: string[];
}

export interface RankingResult {
  job: Job;
  ranked_candidates: RankedCandidate[];
  total: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'recruiter' | 'candidate';
}

// ─── API Response Types ───────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}
