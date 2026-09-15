export const RESUME_LANES = ["software", "data-ml", "qa", "general"] as const;

export type ResumeLane = (typeof RESUME_LANES)[number];
export type FactCategory = "contact" | "education" | "skill" | "experience" | "project" | "guardrail";
export type ResumeSectionName = "Header" | "Education" | "Technical Skills" | "Experience" | "Projects";
export type OwnershipLevel = "solo" | "shared" | "supervised" | "team";

export interface SourceRef {
  document: string;
  locator: string;
}

export interface VerifiedFact {
  id: string;
  category: FactCategory;
  section: ResumeSectionName;
  title?: string;
  text: string;
  source: SourceRef;
  technologies: string[];
  metrics: string[];
  ownership: OwnershipLevel;
  allowedLanes: ResumeLane[];
  relevance: Partial<Record<ResumeLane, number>>;
  eligibleForResume: boolean;
  notes?: string;
}

export interface JobPosting {
  id: string;
  company: string;
  role: string;
  location: string;
  term: string;
  deadline: string;
  posted: string;
  url: string;
  description: string;
  source: "mock-local";
}

export interface LaneRecommendation {
  lane: ResumeLane;
  score: number;
  confidence: "high" | "medium" | "low";
  matchedTerms: string[];
  evidenceFactIds: string[];
  explanation: string;
}

export interface ResumeSectionEntry {
  claimId: string;
  title?: string;
  text: string;
}

export interface ResumeSection {
  heading: ResumeSectionName;
  entries: ResumeSectionEntry[];
}

import type { ClaimLedgerEntry } from "./claim-ledger.js";

export interface ResumeDraft {
  id: string;
  postingId: string;
  title: string;
  baseLane: ResumeLane;
  fitSummary: string;
  honestGaps: string[];
  claims: ClaimLedgerEntry[];
  sections: ResumeSection[];
  generatedAt: string;
}
