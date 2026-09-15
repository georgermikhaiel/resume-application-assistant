import { createClaim, type ClaimLedgerEntry } from "./claim-ledger.js";
import type { JobPosting, LaneRecommendation, ResumeDraft, ResumeLane, ResumeSection, ResumeSectionEntry, VerifiedFact } from "./models.js";
import { extractMentionedTechnologies, normalizeTechnology, technologySet } from "./technology.js";

export function detectUnsupportedTechnologies(posting: JobPosting, facts: VerifiedFact[]): string[] {
  const verifiedTechnologies = technologySet(facts.flatMap((fact) => fact.technologies));
  return extractMentionedTechnologies(posting.description).filter((technology) => !verifiedTechnologies.has(normalizeTechnology(technology)));
}

function factScore(fact: VerifiedFact, lane: ResumeLane, postingText: string): number {
  const evidenceTerms = [...fact.technologies, ...fact.text.split(/[^A-Za-z0-9+#.-]+/)].filter(Boolean);
  const matches = evidenceTerms.filter((term) => postingText.includes(term.toLowerCase())).length;
  return (fact.relevance[lane] ?? 0) * 10 + matches;
}

function selectFacts(facts: VerifiedFact[], lane: ResumeLane, posting: JobPosting): VerifiedFact[] {
  const postingText = `${posting.role} ${posting.description}`.toLowerCase();
  const eligible = facts.filter((fact) => fact.eligibleForResume && fact.allowedLanes.includes(lane));
  const sorted = (section: VerifiedFact[], limit: number) => section.sort((a, b) => factScore(b, lane, postingText) - factScore(a, lane, postingText)).slice(0, limit);
  const headers = facts.filter((fact) => fact.section === "Header" && fact.eligibleForResume);
  const education = facts.filter((fact) => fact.section === "Education" && fact.eligibleForResume).slice(0, 1);
  const skills = sorted(eligible.filter((fact) => fact.section === "Technical Skills"), 3);
  const experiences = sorted(eligible.filter((fact) => fact.section === "Experience"), lane === "qa" ? 6 : 5);
  const projects = sorted(eligible.filter((fact) => fact.section === "Projects"), lane === "data-ml" ? 5 : 4);
  return [...headers, ...education, ...skills, ...experiences, ...projects];
}

function claimForFact(fact: VerifiedFact, index: number): ClaimLedgerEntry {
  return createClaim({ id: `claim-${index + 1}-${fact.id}`, claimText: fact.text, factIds: [fact.id], technologies: fact.technologies, metric: fact.metrics[0], ownership: fact.ownership, date: fact.source.locator, confidence: "high", approved: false });
}

function sectionEntries(section: ResumeSection["heading"], facts: VerifiedFact[], claims: ClaimLedgerEntry[]): ResumeSection {
  const factsById = new Map(facts.map((fact) => [fact.id, fact]));
  const entries: ResumeSectionEntry[] = claims.filter((claim) => factsById.get(claim.factIds[0])?.section === section).map((claim) => {
    const fact = factsById.get(claim.factIds[0]);
    return { claimId: claim.id, title: fact?.title, text: claim.claimText };
  });
  return { heading: section, entries };
}

export function generateDraft(posting: JobPosting, recommendation: LaneRecommendation, facts: VerifiedFact[], now = new Date()): ResumeDraft {
  const selectedFacts = selectFacts(facts, recommendation.lane, posting);
  const claims = selectedFacts.map((fact, index) => claimForFact(fact, index));
  const honestGaps = detectUnsupportedTechnologies(posting, facts).map((technology) => `Posting requests ${technology}; no verified fact supports adding it.`);
  const sections = (["Header", "Education", "Technical Skills", "Experience", "Projects"] as const).map((heading) => sectionEntries(heading, selectedFacts, claims)).filter((section) => section.entries.length > 0);
  return { id: `draft-${posting.id}-${now.getTime()}`, postingId: posting.id, title: `${posting.company} - ${posting.role}`, baseLane: recommendation.lane, fitSummary: recommendation.explanation, honestGaps, claims, sections, generatedAt: now.toISOString() };
}

export function approveAllClaims(draft: ResumeDraft): ResumeDraft { return { ...draft, claims: draft.claims.map((claim) => ({ ...claim, approved: true })) }; }
