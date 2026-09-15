import type { JobPosting, LaneRecommendation, ResumeLane, VerifiedFact } from "./models.js";

const LANE_TERMS: Record<ResumeLane, string[]> = {
  software: ["software", "developer", "development", "backend", "frontend", "full-stack", "api", "typescript", "javascript", "web"],
  "data-ml": ["machine learning", "data science", "data scientist", "model", "python", "pandas", "scikit-learn", "xgboost", "statistics", "analytics"],
  qa: ["qa", "quality assurance", "test automation", "testing", "regression", "functional testing", "defect", "jira", "validation", "automation"],
  general: ["technical", "intern", "co-op", "collaboration", "requirements", "documentation"]
};

function normalized(value: string): string { return value.toLowerCase().replace(/[^a-z0-9+#.-]+/g, " "); }

export function recommendLane(posting: JobPosting, facts: VerifiedFact[]): LaneRecommendation {
  const text = normalized(`${posting.role} ${posting.description}`);
  const scored = (Object.keys(LANE_TERMS) as ResumeLane[]).map((lane) => {
    const matchedTerms = LANE_TERMS[lane].filter((term) => text.includes(term));
    const evidenceFactIds = facts.filter((fact) => fact.eligibleForResume && fact.allowedLanes.includes(lane))
      .sort((a, b) => (b.relevance[lane] ?? 0) - (a.relevance[lane] ?? 0)).slice(0, 3).map((fact) => fact.id);
    return { lane, score: matchedTerms.length, matchedTerms, evidenceFactIds };
  });
  scored.sort((a, b) => b.score - a.score || b.evidenceFactIds.length - a.evidenceFactIds.length);
  const winner = scored[0];
  const confidence = winner.score >= 4 ? "high" : winner.score >= 2 ? "medium" : "low";
  const laneName: Record<ResumeLane, string> = { software: "Software Development and Software Engineering", "data-ml": "Data Science and Machine Learning", qa: "QA and Test Automation", general: "General Technical" };
  const matched = winner.matchedTerms.length > 0 ? winner.matchedTerms.join(", ") : "no specialized keyword cluster";
  const evidence = winner.evidenceFactIds.length > 0 ? winner.evidenceFactIds.join(", ") : "the verified general fact bank";
  return {
    lane: winner.lane,
    score: winner.score,
    confidence,
    matchedTerms: winner.matchedTerms,
    evidenceFactIds: winner.evidenceFactIds,
    explanation: `${laneName[winner.lane]} is recommended because the posting matches ${matched}. The lane has verified supporting evidence from ${evidence}. Unsupported requirements remain honest gaps and are not added as résumé claims.`
  };
}
