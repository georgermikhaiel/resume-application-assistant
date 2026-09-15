import type { VerifiedFact } from "./models.js";
import { extractMentionedTechnologies, normalizeTechnology, technologySet } from "./technology.js";

export type ClaimConfidence = "high" | "medium" | "low";

export interface ClaimLedgerEntry {
  id: string;
  claimText: string;
  factIds: string[];
  technologies: string[];
  metric?: string;
  ownership: string;
  date?: string;
  confidence: ClaimConfidence;
  approved: boolean;
}

export interface ClaimLedgerIssue {
  claimId: string;
  code: "missing-source" | "missing-fact" | "unapproved" | "unsupported-technology" | "empty-claim";
  message: string;
}

export interface ClaimLedgerValidation {
  valid: boolean;
  issues: ClaimLedgerIssue[];
}

export interface NewClaim {
  id: string;
  claimText: string;
  factIds: string[];
  technologies?: string[];
  metric?: string;
  ownership: string;
  date?: string;
  confidence?: ClaimConfidence;
  approved?: boolean;
}

export function createClaim(input: NewClaim): ClaimLedgerEntry {
  return {
    id: input.id,
    claimText: input.claimText,
    factIds: [...input.factIds],
    technologies: [...(input.technologies ?? [])],
    metric: input.metric,
    ownership: input.ownership,
    date: input.date,
    confidence: input.confidence ?? "high",
    approved: input.approved ?? false
  };
}

export function validateClaimLedger(claims: ClaimLedgerEntry[], facts: VerifiedFact[]): ClaimLedgerValidation {
  const factsById = new Map(facts.map((fact) => [fact.id, fact]));
  const issues: ClaimLedgerIssue[] = [];

  for (const claim of claims) {
    if (!claim.claimText.trim()) issues.push({ claimId: claim.id, code: "empty-claim", message: "The claim text is empty." });
    if (claim.factIds.length === 0) issues.push({ claimId: claim.id, code: "missing-source", message: "Every claim must reference at least one fact ID." });

    const sourceFacts = claim.factIds.map((factId) => factsById.get(factId));
    const missingFacts = claim.factIds.filter((factId, index) => !sourceFacts[index]);
    if (missingFacts.length > 0) issues.push({ claimId: claim.id, code: "missing-fact", message: `Unknown fact ID(s): ${missingFacts.join(", ")}.` });

    const supportedTechnologies = technologySet(sourceFacts.filter((fact): fact is VerifiedFact => Boolean(fact)).flatMap((fact) => fact.technologies));
    const unsupportedClaimTechnologies = [
      ...claim.technologies.filter((technology) => !supportedTechnologies.has(normalizeTechnology(technology))),
      ...extractMentionedTechnologies(claim.claimText).filter((technology) => !supportedTechnologies.has(normalizeTechnology(technology)))
    ];
    const uniqueUnsupported = [...new Set(unsupportedClaimTechnologies)];
    if (uniqueUnsupported.length > 0) {
      issues.push({ claimId: claim.id, code: "unsupported-technology", message: `Unsupported technology in claim: ${uniqueUnsupported.join(", ")}.` });
    }
    if (!claim.approved) issues.push({ claimId: claim.id, code: "unapproved", message: "The claim has not been approved." });
  }

  return { valid: issues.length === 0, issues };
}
