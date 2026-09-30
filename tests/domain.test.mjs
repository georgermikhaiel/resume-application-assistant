import test from "node:test";
import assert from "node:assert/strict";
import { FACT_BANK } from "../dist/fixtures/profile.js";
import { MOCK_POSTINGS } from "../dist/fixtures/jobs.js";
import { createApplication, approveAllClaims, checkTracker, createClaim, detectUnsupportedTechnologies, generateDraft, normalizeTrackerUrl, recommendLane, trackerSheetFromValues, validateClaimLedger, validateResumeDraft } from "../dist/domain/index.js";

test("recommends software development with a visible reason", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "software-development"); assert.ok(posting);
  const recommendation = recommendLane(posting, FACT_BANK);
  assert.equal(recommendation.lane, "software"); assert.match(recommendation.explanation, /recommended because/i); assert.ok(recommendation.matchedTerms.includes("typescript"));
});

test("recommends data and machine learning for the ML fixture", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "data-ml"); assert.ok(posting); assert.equal(recommendLane(posting, FACT_BANK).lane, "data-ml");
});

test("recommends QA for the testing fixture", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "qa-automation"); assert.ok(posting); assert.equal(recommendLane(posting, FACT_BANK).lane, "qa");
});

test("unsupported posting technologies become honest gaps and are not drafted", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "unsupported-technologies"); assert.ok(posting);
  const unsupported = detectUnsupportedTechnologies(posting, FACT_BANK); assert.ok(unsupported.includes("Rust")); assert.ok(unsupported.includes("Kubernetes"));
  const draft = generateDraft(posting, recommendLane(posting, FACT_BANK), FACT_BANK, new Date("2026-09-15T00:00:00.000Z"));
  assert.ok(draft.honestGaps.some((gap) => gap.includes("Rust"))); assert.equal(draft.claims.some((claim) => /Rust|Kubernetes|AWS|Terraform|Docker|PostgreSQL/.test(claim.claimText)), false);
});

test("a claim that names an unsupported technology is blocked by the canonical ledger validator", () => {
  const source = FACT_BANK.find((fact) => fact.id === "project.kemicard-workflow"); assert.ok(source);
  const fabricated = createClaim({ id: "fabricated-rust-claim", claimText: "Built a production Rust service.", factIds: [source.id], technologies: ["Rust"], ownership: "solo", approved: true });
  const validation = validateClaimLedger([fabricated], FACT_BANK); assert.equal(validation.valid, false); assert.ok(validation.issues.some((issue) => issue.code === "unsupported-technology"));
});

test("unapproved claims block résumé validation", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "software-development"); assert.ok(posting);
  const draft = generateDraft(posting, recommendLane(posting, FACT_BANK), FACT_BANK, new Date("2026-09-15T00:00:00.000Z"));
  const result = validateResumeDraft(draft, FACT_BANK, { pageWidthPx: 816, pageHeightPx: 1056, contentHeightPx: 900, minFontSizePx: 10, columnCount: 1, textLength: 1000, hiddenElementCount: 0 });
  assert.equal(result.valid, false); assert.ok(result.claimLedger.issues.some((issue) => issue.code === "unapproved"));
});

test("approved software draft passes the structural one-page gate", () => {
  const posting = MOCK_POSTINGS.find((item) => item.id === "software-development"); assert.ok(posting);
  const draft = approveAllClaims(generateDraft(posting, recommendLane(posting, FACT_BANK), FACT_BANK, new Date("2026-09-15T00:00:00.000Z")));
  const result = validateResumeDraft(draft, FACT_BANK, { pageWidthPx: 816, pageHeightPx: 1056, contentHeightPx: 1000, minFontSizePx: 10, columnCount: 1, textLength: 1000, hiddenElementCount: 0 });
  assert.equal(result.valid, true); assert.ok(result.checks.find((check) => check.id === "one-page")?.passed);
});

test("tracker URL normalization strips common tracking parameters", () => {
  assert.equal(normalizeTrackerUrl("https://WWW.Example.com/jobs/123/?utm_source=test&ref=feed#apply"), "https://example.com/jobs/123");
});

test("tracker duplicate detection prioritizes normalized links and falls back to company plus role", () => {
  const snapshot = {
    spreadsheetId: "tracker",
    spreadsheetTitle: "Tracker",
    readAt: "2026-09-15T00:00:00.000Z",
    sheets: [
      trackerSheetFromValues("Applications", [["Company", "Role", "Status", "Link"], ["Acme", "Software Intern", "Applied", "https://example.com/jobs/1?utm_source=x"]]),
      trackerSheetFromValues("Job Leads", [["Company", "Role", "Status", "Link"], ["Beta", "QA Intern", "New", ""]]),
    ],
  };
  const linkMatch = checkTracker({ company: "Different Company", role: "Other Role", url: "https://example.com/jobs/1" }, snapshot);
  assert.equal(linkMatch.matches.length, 1); assert.equal(linkMatch.matches[0].reason, "direct-link");
  const roleMatch = checkTracker({ company: "Beta", role: "QA Intern", url: "https://new.example/jobs/2" }, snapshot);
  assert.equal(roleMatch.matches.length, 1); assert.equal(roleMatch.matches[0].reason, "company-role");
});

test("creating a new application", () => {
  const date = new Date("2026-09-15T00:00:00.000Z");
const posting = MOCK_POSTINGS[0];
const application = createApplication(posting, date);

assert.equal(application.id, `application-${posting.id}-${date.getTime()}`);
assert.equal(application.posting, posting);
assert.equal(application.status, "saved");
assert.equal(application.createdAt, date.toISOString());
assert.equal(application.appliedAt, undefined);
})
