import { approveAllClaims, checkTracker, generateDraft, recommendLane, validateResumeDraft, type JobPosting, type LaneRecommendation, type PreviewMetrics, type ResumeDraft, type ResumeSection, type TrackerSnapshot } from "../domain/index.js";
import { FACT_BANK } from "../fixtures/profile.js";
import { loadTrackerSnapshot, sheetsOAuthConfigured, TRACKER_SPREADSHEET_ID } from "./sheets-client.js";

interface ScannedPosting { company: string; role: string; location: string; term: string; deadline: string; posted: string; url: string; description: string; }
let posting: JobPosting | undefined;
let recommendation: LaneRecommendation | undefined;
let draft: ResumeDraft | undefined;
let trackerSnapshot: TrackerSnapshot | undefined;

const $ = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing side panel element #${id}`);
  return element as T;
};

const status = $("status");
const scanButton = $("scan-page") as HTMLButtonElement;
const generateButton = $("generate-draft") as HTMLButtonElement;
const approveButton = $("approve-claims") as HTMLButtonElement;
const validateButton = $("validate-resume") as HTMLButtonElement;
const connectSheetsButton = $("connect-sheets") as HTMLButtonElement;
const checkTrackerButton = $("check-tracker") as HTMLButtonElement;
const postingCard = $("posting-card");
const ledgerCard = $("ledger-card");
const validationCard = $("validation-card");
const previewCard = $("preview-card");

const oauthConfigured = sheetsOAuthConfigured();
$("oauth-config-status").textContent = oauthConfigured
  ? "Chrome OAuth is configured in the extension manifest. Connect to request read-only Sheets access."
  : "Replace the placeholder oauth2.client_id in manifest.json with a Chrome Extension OAuth client ID, then rebuild and reload the extension.";
connectSheetsButton.disabled = !oauthConfigured;

function setStatus(message: string, kind: "normal" | "success" | "error" = "normal"): void {
  status.textContent = message;
  status.className = `status${kind === "normal" ? "" : ` ${kind}`}`;
}

async function audit(event: string, details: Record<string, unknown>): Promise<void> {
  const existing = await chrome.storage.local.get(["auditLog"]);
  const log = Array.isArray(existing.auditLog) ? existing.auditLog : [];
  log.push({ event, details, timestamp: new Date().toISOString() });
  await chrome.storage.local.set({ auditLog: log.slice(-100) });
}

function renderTrackerCheck(): void {
  const results = $("tracker-results"); results.textContent = "";
  if (!posting || !trackerSnapshot) return;
  const result = checkTracker(posting, trackerSnapshot);
  const trackerStatus = $("tracker-status");
  if (result.matches.length === 0) {
    trackerStatus.textContent = "No matching Application or Job Lead was found.";
    trackerStatus.className = "tracker-status success";
  } else {
    trackerStatus.textContent = `${result.matches.length} existing tracker match${result.matches.length === 1 ? "" : "es"} found. Review before proceeding.`;
    trackerStatus.className = "tracker-status error";
    for (const match of result.matches) {
      const row = document.createElement("div"); row.className = "tracker-match";
      const title = document.createElement("strong"); title.textContent = `${match.sheet} · row ${match.row.rowNumber}`;
      const detail = document.createElement("span"); detail.textContent = `${match.reason === "direct-link" ? "Normalized link match" : "Normalized company + role match"} · ${match.row.values.Company ?? ""} · ${match.row.values.Role ?? ""} · Status: ${match.row.values.Status ?? "not recorded"}`;
      row.append(title, detail); results.append(row);
    }
  }
}

function readMockPosting(): ScannedPosting | null {
  const page = document.querySelector<HTMLElement>("#application-page[data-job-company]");
  const description = document.querySelector<HTMLElement>("#job-description");
  if (!page || !description) return null;
  const value = (name: string): string => page.dataset[name] ?? "";
  return { company: value("jobCompany"), role: value("jobRole"), location: value("jobLocation"), term: value("jobTerm"), deadline: value("jobDeadline"), posted: value("jobPosted"), url: value("jobUrl") || location.href, description: description.textContent?.trim() ?? "" };
}

async function scanPage(): Promise<void> {
  setStatus("Scanning the active mock page...");
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) throw new Error("No active tab was found.");
  const result = await chrome.scripting.executeScript({ target: { tabId }, func: readMockPosting });
  const scanned = result[0]?.result;
  if (!scanned) throw new Error("This is not the supported local mock application page.");
  posting = { ...scanned, id: `scanned-${scanned.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, source: "mock-local" };
  recommendation = recommendLane(posting, FACT_BANK);
  renderPosting(posting, recommendation);
  generateButton.disabled = false;
  checkTrackerButton.disabled = !trackerSnapshot;
  setStatus("Page scanned. Review the detected posting and lane explanation, then generate a draft.", "success");
  await audit("scan-page", { postingId: posting.id, company: posting.company, role: posting.role, lane: recommendation.lane });
}

function renderPosting(currentPosting: JobPosting, lane: LaneRecommendation): void {
  postingCard.classList.remove("hidden");
  const details = $("posting-details");
  details.innerHTML = "";
  for (const [label, value] of [["Company", currentPosting.company], ["Role", currentPosting.role], ["Location", currentPosting.location], ["Term", currentPosting.term], ["Deadline", currentPosting.deadline], ["Posted", currentPosting.posted]]) {
    const dt = document.createElement("dt"); dt.textContent = label;
    const dd = document.createElement("dd"); dd.textContent = value;
    details.append(dt, dd);
  }
  $("lane-explanation").textContent = `Recommended lane: ${lane.lane} (${lane.confidence} confidence). ${lane.explanation}`;
}

function renderGaps(currentDraft: ResumeDraft): void {
  const gaps = $("gaps"); gaps.textContent = "";
  if (currentDraft.honestGaps.length === 0) return;
  const heading = document.createElement("strong"); heading.textContent = "Honest gaps:"; gaps.append(heading);
  for (const gap of currentDraft.honestGaps) { const line = document.createElement("div"); line.textContent = `• ${gap}`; gaps.append(line); }
}

function renderLedger(currentDraft: ResumeDraft): void {
  ledgerCard.classList.remove("hidden");
  const container = $("claim-ledger"); container.textContent = "";
  for (const claim of currentDraft.claims) {
    const row = document.createElement("div"); row.className = `ledger-row${claim.approved ? " approved" : ""}`;
    const claimText = document.createElement("div"); claimText.className = "ledger-claim"; claimText.textContent = claim.claimText;
    const metadata = document.createElement("div"); metadata.className = "ledger-meta";
    metadata.textContent = `Fact IDs: ${claim.factIds.join(", ")} · Technology: ${claim.technologies.join(", ") || "none"} · Ownership: ${claim.ownership} · ${claim.approved ? "Approved" : "Needs approval"}`;
    row.append(claimText, metadata); container.append(row);
  }
}

function renderPreview(currentDraft: ResumeDraft): void {
  previewCard.classList.remove("hidden");
  const preview = $("resume-preview"); preview.textContent = "";
  for (const section of currentDraft.sections) {
    if (section.heading === "Header") { renderHeader(section, preview); continue; }
    const sectionElement = document.createElement("section"); sectionElement.className = "resume-section";
    const heading = document.createElement("h4"); heading.textContent = section.heading; sectionElement.append(heading);
    if (section.heading === "Experience" || section.heading === "Projects") renderGroupedEntries(section, sectionElement);
    else for (const entry of section.entries) renderSingleEntry(entry, section, sectionElement);
    preview.append(sectionElement);
  }
}

function renderGroupedEntries(section: ResumeSection, sectionElement: HTMLElement): void {
  const groups = new Map<string, ResumeSection["entries"]>();
  for (const entry of section.entries) {
    const key = entry.title ?? entry.claimId;
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  for (const entries of groups.values()) {
    const groupElement = document.createElement("div"); groupElement.className = "resume-entry-group";
    const title = entries[0]?.title;
    if (title) { const titleElement = document.createElement("div"); titleElement.className = "resume-entry-title"; titleElement.textContent = title; groupElement.append(titleElement); }
    for (const entry of entries) {
      const bullet = document.createElement("div"); bullet.className = "resume-entry bullet";
      const text = document.createElement("p"); text.className = "resume-entry-text"; text.textContent = entry.text;
      bullet.append(text); groupElement.append(bullet);
    }
    sectionElement.append(groupElement);
  }
}

function renderSingleEntry(entry: ResumeSection["entries"][number], section: ResumeSection, sectionElement: HTMLElement): void {
  const entryElement = document.createElement("div"); entryElement.className = "resume-entry";
  if (entry.title) { const title = document.createElement("div"); title.className = "resume-entry-title"; title.textContent = entry.title; entryElement.append(title); }
  if (!(section.heading === "Education" && entry.title)) {
    const text = document.createElement("p"); text.className = "resume-entry-text"; text.textContent = entry.text; entryElement.append(text);
  }
  sectionElement.append(entryElement);
}

function renderHeader(section: ResumeSection, preview: HTMLElement): void {
  const header = document.createElement("header"); header.className = "resume-header";
  const nameEntry = section.entries.find((entry) => entry.claimId.includes("contact.name"));
  const name = document.createElement("h3"); name.textContent = nameEntry?.text ?? "George Mikhaiel"; header.append(name);
  const contact = document.createElement("p"); contact.textContent = section.entries.filter((entry) => !entry.claimId.includes("contact.name")).map((entry) => entry.text).join(" | "); header.append(contact);
  preview.append(header);
}

function measurePreview(): PreviewMetrics {
  const page = $("resume-preview");
  const elements = Array.from(page.querySelectorAll<HTMLElement>("*"));
  const fontSizes = elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)).filter(Number.isFinite);
  const hiddenElementCount = elements.filter((element) => getComputedStyle(element).display === "none" || getComputedStyle(element).visibility === "hidden").length;
  const columnCount = getComputedStyle(page).columnCount;
  return { pageWidthPx: page.clientWidth, pageHeightPx: page.clientHeight, contentHeightPx: page.scrollHeight, minFontSizePx: fontSizes.length > 0 ? Math.min(...fontSizes) : 0, columnCount: columnCount === "auto" ? 1 : Number(columnCount), textLength: page.textContent?.trim().length ?? 0, hiddenElementCount };
}

function renderValidation(result: ReturnType<typeof validateResumeDraft>): void {
  validationCard.classList.remove("hidden");
  const container = $("validation-results"); container.textContent = "";
  for (const check of result.checks) {
    const row = document.createElement("div"); row.className = `check ${check.passed ? "check-pass" : "check-fail"}`;
    const marker = document.createElement("span"); marker.textContent = check.passed ? "✓" : "!";
    const text = document.createElement("span"); text.textContent = `${check.label}: ${check.details}`;
    row.append(marker, text); container.append(row);
  }
  setStatus(result.valid ? "Résumé validation passed. This remains a local Phase 1 artifact." : "Résumé validation is blocked. Review the failed checks above.", result.valid ? "success" : "error");
}

scanButton.addEventListener("click", () => { void scanPage().catch((error: unknown) => setStatus(error instanceof Error ? error.message : "Scan failed.", "error")); });
generateButton.addEventListener("click", async () => {
  if (!posting || !recommendation) return;
  draft = generateDraft(posting, recommendation, FACT_BANK);
  renderGaps(draft); renderLedger(draft); renderPreview(draft);
  approveButton.disabled = false; validateButton.disabled = false;
  setStatus("Draft generated. Review the claim ledger before approving it.");
  await audit("generate-draft", { postingId: posting.id, claimCount: draft.claims.length, gapCount: draft.honestGaps.length });
});
approveButton.addEventListener("click", async () => {
  if (!draft) return;
  draft = approveAllClaims(draft); renderLedger(draft);
  setStatus("All displayed claims are marked approved. Validate the preview next.", "success");
  await audit("approve-claims", { draftId: draft.id, claimCount: draft.claims.length });
});
validateButton.addEventListener("click", async () => {
  if (!draft) return;
  const result = validateResumeDraft(draft, FACT_BANK, measurePreview());
  renderValidation(result);
  await audit("validate-resume", { draftId: draft.id, valid: result.valid, checks: result.checks });
});

connectSheetsButton.addEventListener("click", async () => {
  connectSheetsButton.disabled = true;
  checkTrackerButton.disabled = true;
  $("tracker-status").textContent = "Connecting to Google and reading the two tracker tabs...";
  $("tracker-status").className = "tracker-status";
  try {
    trackerSnapshot = await loadTrackerSnapshot(TRACKER_SPREADSHEET_ID, true);
    $("tracker-status").textContent = `Read-only connection ready: ${trackerSnapshot.spreadsheetTitle}. ${trackerSnapshot.sheets.map((sheet) => `${sheet.name} (${sheet.rows.length} populated rows)`).join(" · ")}`;
    $("tracker-status").className = "tracker-status success";
    checkTrackerButton.disabled = !posting;
    if (posting) renderTrackerCheck();
    setStatus("Google Sheets tracker read successfully. No tracker changes were made.", "success");
    await audit("read-tracker", { spreadsheetId: trackerSnapshot.spreadsheetId, sheets: trackerSnapshot.sheets.map((sheet) => ({ name: sheet.name, rowCount: sheet.rows.length })) });
  } catch (error: unknown) {
    $("tracker-status").textContent = error instanceof Error ? error.message : "Google Sheets connection failed.";
    $("tracker-status").className = "tracker-status error";
    setStatus("Google Sheets connection failed. Review the tracker message.", "error");
  } finally {
    connectSheetsButton.disabled = false;
  }
});

checkTrackerButton.addEventListener("click", async () => {
  if (!posting || !trackerSnapshot) return;
  renderTrackerCheck();
  const result = checkTracker(posting, trackerSnapshot);
  await audit("check-tracker", { postingId: posting.id, matchCount: result.matches.length, reasons: result.matches.map((match) => match.reason) });
});
