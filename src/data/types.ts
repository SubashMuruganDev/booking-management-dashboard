export type SessionCategory =
  | 'backend' | 'frontend' | 'python' | 'azure' | 'ai' | 'rag'
  | 'agents' | 'data' | 'security' | 'fde' | 'certification' | 'interview' | 'review';

export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';

export interface DailySession {
  id: string;
  day: number; // 1-7
  title: string;
  category: SessionCategory;
  phase: number;
  objective: string;
  prerequisites: string[];
  breakdown: { minutes: number; activity: string; detail?: string }[];
  concepts: string[];
  practicalTask: string;
  expectedOutput: string;
  completionCriteria: string[];
  resources: { title: string; url?: string; type?: string }[];
  stretchTask?: string;
  healthosConnection?: string;
  interviewQuestion?: string;
}

export interface Week {
  id: string;
  weekNumber: number;
  phase: number;
  phaseName: string;
  title: string;
  weeklyOutcome: string;
  sessions: DailySession[];
  portfolioMilestone?: string;
  certificationMilestone?: string;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  weeks: number[];
  skills: string[];
}

export interface CurriculumMeta {
  version: number;
  totalWeeks: number;
  totalDays: number;
  generatedAt: string;
}
