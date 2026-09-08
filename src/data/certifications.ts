// Verified against training data through August 2025
// learn.microsoft.com was unreachable during generation; verify at https://learn.microsoft.com/en-us/credentials/browse/

export interface Certification {
  code: string;
  name: string;
  status: 'ACTIVE' | 'RETIRED' | 'DOES_NOT_EXIST';
  description: string;
  notes?: string;
  url?: string;
  recommended?: boolean;
  curriculum_weeks?: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    code: 'AI-900',
    name: 'Microsoft Azure AI Fundamentals',
    status: 'ACTIVE',
    description: 'Foundational AI concepts, Azure AI services (Vision, Language, Bot Service), responsible AI principles.',
    notes: 'Good orientation but not a differentiator at senior level. Recommended as a first cert.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
    recommended: true,
    curriculum_weeks: 'Weeks 1-2 (foundation), Week 13 (deep prep)',
  },
  {
    code: 'AI-901',
    name: 'Does Not Exist',
    status: 'DOES_NOT_EXIST',
    description: 'AI-901 is not a valid Microsoft exam code.',
    notes: 'Likely confused with AI-900. No such exam exists in the Microsoft credentials portfolio.',
  },
  {
    code: 'AI-102',
    name: 'Designing and Implementing a Microsoft Azure AI Solution',
    status: 'ACTIVE',
    description: 'Professional AI cert covering Azure OpenAI, AI Search, Document Intelligence, Vision, Language, Speech, Bot Service, and responsible AI.',
    notes: 'The primary professional AI certification. High value for AI Engineer roles.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/',
    recommended: true,
    curriculum_weeks: 'Weeks 11-19 (Azure + AI phases), exam prep Weeks 36-40',
  },
  {
    code: 'AI-103',
    name: 'Does Not Exist',
    status: 'DOES_NOT_EXIST',
    description: 'AI-103 is not a valid Microsoft exam code.',
    notes: 'AI-100 (precursor to AI-102) was retired June 2021. No AI-103 exam was ever published.',
  },
  {
    code: 'AI-200',
    name: 'Does Not Exist',
    status: 'DOES_NOT_EXIST',
    description: 'AI-200 is not a valid Microsoft exam code.',
    notes: 'No AI-200 exam exists in the Microsoft credentials portfolio.',
  },
  {
    code: 'AZ-204',
    name: 'Developing Solutions for Microsoft Azure',
    status: 'ACTIVE',
    description: 'Compute (VMs, Functions, Containers), storage, auth (Entra ID), API Management, monitoring, caching.',
    notes: 'Essential for backend/cloud engineers. Strongly recommended before AI-102.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/',
    recommended: true,
    curriculum_weeks: 'Phase 4 (Weeks 11-12), exam prep Weeks 20-24',
  },
  {
    code: 'AZ-900',
    name: 'Microsoft Azure Fundamentals',
    status: 'ACTIVE',
    description: 'Cloud concepts, Azure services overview, pricing, SLAs, governance.',
    notes: 'Entry-level cert. Useful context but optional if you are already using Azure.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    curriculum_weeks: 'Phase 4 (Weeks 11-12)',
  },
  {
    code: 'AZ-305',
    name: 'Designing Microsoft Azure Infrastructure Solutions',
    status: 'ACTIVE',
    description: 'Identity, governance, data storage, business continuity, infrastructure, application architecture.',
    notes: 'Senior architect-level cert. Target after 1+ year of Azure experience.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/',
    recommended: true,
    curriculum_weeks: 'Weeks 48+ (extended phase)',
  },
  {
    code: 'DP-100',
    name: 'Designing and Implementing a Data Science Solution on Azure',
    status: 'ACTIVE',
    description: 'Azure Machine Learning, MLOps, model training, deployment, responsible AI.',
    notes: 'Optional. Most valuable if targeting an ML Engineer role alongside AI Engineer.',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-scientist/',
    curriculum_weeks: 'Phase 5 (Week 13), extended phases',
  },
];

export const RECOMMENDED_PATH = [
  { code: 'AI-900', timing: 'Weeks 1-13' },
  { code: 'AZ-204', timing: 'Weeks 20-24' },
  { code: 'AI-102', timing: 'Weeks 36-40' },
  { code: 'AZ-305', timing: 'Week 48+' },
];
