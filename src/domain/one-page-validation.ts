import { validateClaimLedger, type ClaimLedgerValidation } from "./claim-ledger.js";
import type { ResumeDraft, VerifiedFact } from "./models.js";

export interface PreviewMetrics { pageWidthPx: number; pageHeightPx: number; contentHeightPx: number; minFontSizePx: number; columnCount: number; textLength: number; hiddenElementCount: number; }
export interface ValidationCheck { id: string; label: string; passed: boolean; details: string; }
export interface ResumeValidation { valid: boolean; claimLedger: ClaimLedgerValidation; checks: ValidationCheck[]; }

export function validateResumeDraft(draft: ResumeDraft, facts: VerifiedFact[], metrics?: PreviewMetrics): ResumeValidation {
  const claimLedger = validateClaimLedger(draft.claims, facts);
  const checks: ValidationCheck[] = [
    { id: "claim-ledger", label: "All claims are sourced and approved", passed: claimLedger.valid, details: claimLedger.valid ? "Every claim has fact IDs and approval." : claimLedger.issues.map((issue) => issue.message).join(" ") },
    { id: "honest-gaps", label: "Unsupported requirements are recorded as honest gaps", passed: draft.honestGaps.every((gap) => gap.includes("no verified fact supports")), details: draft.honestGaps.length > 0 ? draft.honestGaps.join(" ") : "No unsupported technology requirements detected." },
    { id: "one-column", label: "Preview uses one column", passed: metrics?.columnCount === 1, details: metrics ? `${metrics.columnCount} column(s) measured.` : "Preview has not been measured yet." },
    { id: "one-page", label: "Preview fits exactly within one page", passed: Boolean(metrics && metrics.contentHeightPx <= metrics.pageHeightPx && metrics.pageHeightPx > 0), details: metrics ? `${Math.round(metrics.contentHeightPx)}px content in ${Math.round(metrics.pageHeightPx)}px page.` : "Preview has not been measured yet." },
    { id: "readable-font", label: "Preview stays above the minimum readable font size", passed: Boolean(metrics && metrics.minFontSizePx >= 8.5), details: metrics ? `${metrics.minFontSizePx.toFixed(1)}px minimum measured font.` : "Preview has not been measured yet." },
    { id: "selectable-text", label: "Preview contains selectable text", passed: Boolean(metrics && metrics.textLength > 0 && metrics.hiddenElementCount === 0), details: metrics ? `${metrics.textLength} text characters; ${metrics.hiddenElementCount} hidden element(s).` : "Preview has not been measured yet." }
  ];
  return { valid: claimLedger.valid && checks.every((check) => check.passed), claimLedger, checks };
}
