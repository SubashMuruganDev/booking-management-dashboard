import { PHASE1_WEEKS } from './curriculum-phase1';
import { PHASE2_WEEKS } from './curriculum-phase2';
import { PHASE3_WEEKS, PHASE4_WEEKS, PHASE5_WEEKS, PHASE6_WEEKS } from './curriculum-phases3to6';
import { PHASE7_WEEKS, PHASE8_WEEKS, PHASE9_WEEKS, PHASE10_WEEKS } from './curriculum-phases7to10';
import { PHASE11_WEEKS, PHASE12_WEEKS, PHASE13_WEEKS, EXTENDED_WEEKS } from './curriculum-phases11to13';
import type { Week, Phase, CurriculumMeta } from './types';

export const ALL_WEEKS: Week[] = [
  ...PHASE1_WEEKS,
  ...PHASE2_WEEKS,
  ...PHASE3_WEEKS,
  ...PHASE4_WEEKS,
  ...PHASE5_WEEKS,
  ...PHASE6_WEEKS,
  ...PHASE7_WEEKS,
  ...PHASE8_WEEKS,
  ...PHASE9_WEEKS,
  ...PHASE10_WEEKS,
  ...PHASE11_WEEKS,
  ...PHASE12_WEEKS,
  ...PHASE13_WEEKS,
  ...EXTENDED_WEEKS,
];

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Engineering Foundations',
    description: 'Git, testing, REST APIs, PostgreSQL depth, resiliency patterns, modular architecture, observability, and CI/CD.',
    weeks: [1, 2, 3, 4, 5, 6],
    skills: ['git', 'testing', 'rest-api', 'postgresql', 'caching', 'messaging', 'resiliency', 'observability', 'docker', 'ci-cd'],
  },
  {
    id: 2,
    name: 'Production Python Backend',
    description: 'Modern Python, Pydantic, FastAPI, SQLAlchemy, async, testing, packaging, and deployment.',
    weeks: [7, 8],
    skills: ['python', 'fastapi', 'pydantic', 'sqlalchemy', 'async', 'pytest'],
  },
  {
    id: 3,
    name: 'Full-Stack Product Engineering',
    description: 'React 19, TypeScript, state management, forms, authentication, streaming UI, testing, and accessibility.',
    weeks: [9, 10],
    skills: ['react', 'typescript', 'tanstack-query', 'playwright', 'accessibility'],
  },
  {
    id: 4,
    name: 'Azure Engineering',
    description: 'Entra ID, managed identities, Key Vault, networking, Container Apps, PostgreSQL, Service Bus, IaC with Bicep.',
    weeks: [11, 12],
    skills: ['azure', 'entra-id', 'key-vault', 'container-apps', 'bicep', 'github-actions'],
  },
  {
    id: 5,
    name: 'Applied AI & ML Foundations',
    description: 'Embeddings, evaluation metrics, Azure AI services, responsible AI, and Python data tooling.',
    weeks: [13],
    skills: ['embeddings', 'ml-evaluation', 'azure-ai', 'pandas', 'responsible-ai'],
  },
  {
    id: 6,
    name: 'LLM Application Engineering',
    description: 'Prompt engineering, structured outputs, tool calling, streaming, retries, cost optimization.',
    weeks: [14, 25, 26, 27, 28],
    skills: ['prompt-engineering', 'tool-calling', 'llm-engineering', 'cost-optimization'],
  },
  {
    id: 7,
    name: 'Production RAG',
    description: 'Document ingestion, chunking, vector databases, hybrid search, reranking, evaluation, multi-tenant RAG.',
    weeks: [15, 16, 29, 30, 31, 32],
    skills: ['rag', 'vector-databases', 'pgvector', 'azure-ai-search', 'ragas'],
  },
  {
    id: 8,
    name: 'Agents & Durable AI Workflows',
    description: 'Agent architecture, tool design, LangGraph, checkpointing, human approval, audit trails.',
    weeks: [17, 33, 34, 35, 36],
    skills: ['agents', 'langgraph', 'workflow-orchestration', 'human-in-the-loop'],
  },
  {
    id: 9,
    name: 'AI Evaluation, Observability & Safety',
    description: 'Evaluation pipelines, content safety, LLM observability, red teaming, tenant isolation.',
    weeks: [18, 41, 42, 43, 44],
    skills: ['ai-evaluation', 'content-safety', 'red-teaming', 'observability'],
  },
  {
    id: 10,
    name: 'LLMOps & Production Operations',
    description: 'Prompt versioning, canary releases, SLOs, incident response, cost governance.',
    weeks: [19, 45, 46, 47, 48],
    skills: ['llmops', 'slos', 'incident-response', 'cost-governance'],
  },
  {
    id: 11,
    name: 'Data Engineering for AI',
    description: 'Ingestion pipelines, data contracts, quality checks, lineage, orchestration.',
    weeks: [20],
    skills: ['data-engineering', 'data-contracts', 'data-quality', 'airflow'],
  },
  {
    id: 12,
    name: 'Forward Deployed Engineering',
    description: 'Customer discovery, requirements, architecture proposals, legacy integration, demos, handover.',
    weeks: [21, 22],
    skills: ['fde', 'customer-discovery', 'stakeholder-communication', 'rapid-prototyping'],
  },
  {
    id: 13,
    name: 'Interviews & Career Positioning',
    description: 'DSA, system design, behavioural interviews, CV, salary research, portfolio walkthrough.',
    weeks: [23, 24, 49, 50, 51, 52],
    skills: ['algorithms', 'system-design', 'behavioural-interviews', 'career'],
  },
];

export const CURRICULUM_META: CurriculumMeta = {
  version: 1,
  totalWeeks: ALL_WEEKS.length,
  totalDays: ALL_WEEKS.reduce((sum, w) => sum + w.sessions.length, 0),
  generatedAt: '2026-09-08',
};

export function getWeekById(id: string): Week | undefined {
  return ALL_WEEKS.find(w => w.id === id);
}

export function getWeekByNumber(n: number): Week | undefined {
  return ALL_WEEKS.find(w => w.weekNumber === n);
}

export function getSessionById(sessionId: string): { week: Week; session: Week['sessions'][0] } | undefined {
  for (const week of ALL_WEEKS) {
    const session = week.sessions.find(s => s.id === sessionId);
    if (session) return { week, session };
  }
  return undefined;
}

export function getPhaseWeeks(phaseId: number): Week[] {
  return ALL_WEEKS.filter(w => w.phase === phaseId);
}

export function getTodaySession(startDate: string): { week: Week; session: Week['sessions'][0] } | undefined {
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return undefined;

  const weekIndex = Math.floor(daysDiff / 7);
  const dayIndex = daysDiff % 7;

  if (weekIndex >= ALL_WEEKS.length) return undefined;
  const week = ALL_WEEKS[weekIndex];
  const session = week.sessions[dayIndex];
  if (!session) return undefined;
  return { week, session };
}

// Curriculum quality validation
export function validateCurriculum(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sessionIds = new Set<string>();

  for (const week of ALL_WEEKS) {
    if (week.sessions.length === 0) errors.push(`Week ${week.weekNumber} has no sessions`);

    let hasInterview = false;
    let hasReview = false;

    for (const session of week.sessions) {
      if (sessionIds.has(session.id)) errors.push(`Duplicate session ID: ${session.id}`);
      sessionIds.add(session.id);

      if (!session.practicalTask) errors.push(`Session ${session.id} has no practical task`);
      if (!session.completionCriteria || session.completionCriteria.length === 0)
        errors.push(`Session ${session.id} has no completion criteria`);
      if (!session.objective) errors.push(`Session ${session.id} has no objective`);

      if (session.category === 'interview') hasInterview = true;
      if (session.category === 'review') hasReview = true;
      if (session.interviewQuestion) hasInterview = true;
    }

    if (!hasInterview) warnings.push(`Week ${week.weekNumber} has no interview activity`);
    if (!hasReview) warnings.push(`Week ${week.weekNumber} has no review activity`);
  }

  return { errors, warnings };
}
