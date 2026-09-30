import { JobPosting, ApplicationRecord, ApplicationStatus } from "./models.js";

export const TRACKER_SHEET_NAMES = ["Applications", "Job Leads"] as const;
export type TrackerSheetName = (typeof TRACKER_SHEET_NAMES)[number];

export interface TrackerRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface TrackerSheetSnapshot {
  name: TrackerSheetName;
  headers: string[];
  rows: TrackerRow[];
}

export interface TrackerSnapshot {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: TrackerSheetSnapshot[];
  readAt: string;
}

export type TrackerMatchReason = "direct-link" | "company-role";

export interface TrackerMatch {
  sheet: TrackerSheetName;
  row: TrackerRow;
  reason: TrackerMatchReason;
}

export interface TrackerCheckResult {
  matches: TrackerMatch[];
  directLinkMatches: TrackerMatch[];
  companyRoleMatches: TrackerMatch[];
  normalizedLink: string;
  normalizedCompanyRole: string;
}

const TRACKING_PARAMETER_NAMES = new Set([
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "ref",
  "referrer",
  "source",
]);

function isTrackingParameter(name: string): boolean {
  const normalized = name.toLowerCase();
  return TRACKING_PARAMETER_NAMES.has(normalized) || normalized.startsWith("utm_");
}

export function normalizeTrackerUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    url.hash = "";
    const parameterNames: string[] = [];
    url.searchParams.forEach((_value, key) => parameterNames.push(key));
    for (const key of parameterNames) {
      if (isTrackingParameter(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    url.hostname = url.hostname.toLowerCase();
    if (url.hostname.startsWith("www.")) url.hostname = url.hostname.slice(4);
    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) url.port = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return trimmed.toLowerCase().replace(/\s+/g, "");
  }
}

export function normalizeTrackerText(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function normalizeCompanyRole(company: string, role: string): string {
  return `${normalizeTrackerText(company)}|${normalizeTrackerText(role)}`;
}

export function trackerSheetFromValues(name: TrackerSheetName, values: unknown[][]): TrackerSheetSnapshot {
  const headers = (values[0] ?? []).map((value) => String(value ?? "").trim());
  const rows = values.slice(1).map((row, index) => {
    const mapped: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      if (header) mapped[header] = String(row[columnIndex] ?? "").trim();
    });
    return { rowNumber: index + 2, values: mapped };
  }).filter((row) => Object.values(row.values).some(Boolean));
  return { name, headers, rows };
}

export function checkTracker(posting: { company: string; role: string; url: string }, snapshot: TrackerSnapshot): TrackerCheckResult {
  const normalizedLink = normalizeTrackerUrl(posting.url);
  const normalizedCompanyRole = normalizeCompanyRole(posting.company, posting.role);
  const directLinkMatches: TrackerMatch[] = [];
  const companyRoleMatches: TrackerMatch[] = [];
  for (const sheet of snapshot.sheets) {
    for (const row of sheet.rows) {
      const rowLink = normalizeTrackerUrl(row.values.Link ?? "");
      const rowCompanyRole = normalizeCompanyRole(row.values.Company ?? "", row.values.Role ?? "");
      if (normalizedLink && rowLink && normalizedLink === rowLink) {
        directLinkMatches.push({ sheet: sheet.name, row, reason: "direct-link" });
      } else if (normalizedCompanyRole !== "|" && normalizedCompanyRole === rowCompanyRole) {
        companyRoleMatches.push({ sheet: sheet.name, row, reason: "company-role" });
      }
    }
  }
  const matches = [...directLinkMatches, ...companyRoleMatches.filter((candidate) => !directLinkMatches.some((match) => match.sheet === candidate.sheet && match.row.rowNumber === candidate.row.rowNumber))];
  return { matches, directLinkMatches, companyRoleMatches, normalizedLink, normalizedCompanyRole };
}

export function createApplication(
  posting: JobPosting, 
  now: Date = new Date()
): ApplicationRecord  {
  return {id: `application-${posting.id}-${now.getTime()}`, posting, status: "saved", createdAt: now.toISOString()}
}

export function transitionApplicationStatus(
  application: ApplicationRecord,
  nextStatus: ApplicationStatus,
  posting: ApplicationRecord['posting'],
  now: Date = new Date(),
): ApplicationRecord {
  

  
  return {id: `application-${posting.id}-${now.getTime()}`, posting, status: "saved", createdAt: now.toISOString()}
}
