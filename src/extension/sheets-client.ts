import { trackerSheetFromValues, type TrackerSheetName, type TrackerSnapshot } from "../domain/index.js";

export const TRACKER_SPREADSHEET_ID = "1jlIFfV2zKcTcyWRNKQzFTIoViuh4YDnSMx_BEnFW-ck";

interface SpreadsheetMetadataResponse {
  spreadsheetId: string;
  properties?: { title?: string };
  sheets?: Array<{ properties?: { title?: string; gridProperties?: { rowCount?: number; columnCount?: number } } }>;
}

interface ValuesResponse { values?: unknown[][]; }

function columnName(columnCount: number): string {
  let current = Math.max(1, columnCount);
  let output = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    current = Math.floor((current - 1) / 26);
  }
  return output;
}

async function googleJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.text();
  let parsed: unknown;
  try { parsed = body ? JSON.parse(body) : {}; } catch { parsed = {}; }
  if (!response.ok) {
    const message = typeof parsed === "object" && parsed !== null && "error" in parsed
      ? JSON.stringify((parsed as { error: unknown }).error)
      : `${response.status} ${response.statusText}`;
    throw new Error(`Google Sheets request failed: ${message}`);
  }
  return parsed as T;
}

async function getAccessToken(interactive: boolean): Promise<string> {
  const result = await chrome.identity.getAuthToken({ interactive });
  if (typeof result === "string") return result;
  if (result && typeof result.token === "string") return result.token;
  throw new Error("Chrome did not return a Google access token.");
}

async function readSheet(token: string, spreadsheetId: string, name: TrackerSheetName, rowCount: number, columnCount: number) {
  const range = `'${name.replace(/'/g, "''")}'!A1:${columnName(columnCount)}${Math.min(rowCount, 5000)}`;
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`);
  url.searchParams.set("majorDimension", "ROWS");
  const result = await googleJson<ValuesResponse>(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  return trackerSheetFromValues(name, result.values ?? []);
}

export async function loadTrackerSnapshot(spreadsheetId = TRACKER_SPREADSHEET_ID, interactive = false): Promise<TrackerSnapshot> {
  const token = await getAccessToken(interactive);
  const metadataUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`);
  metadataUrl.searchParams.set("includeGridData", "false");
  const metadata = await googleJson<SpreadsheetMetadataResponse>(metadataUrl.toString(), { headers: { Authorization: `Bearer ${token}` } });
  const desired = (metadata.sheets ?? []).filter((sheet): sheet is { properties: { title: TrackerSheetName; gridProperties?: { rowCount?: number; columnCount?: number } } } => {
    const title = sheet.properties?.title;
    return title === "Applications" || title === "Job Leads";
  });
  if (desired.length !== 2) throw new Error("The tracker must contain visible Applications and Job Leads tabs.");
  const sheets = await Promise.all(desired.map((sheet) => readSheet(token, spreadsheetId, sheet.properties.title, sheet.properties.gridProperties?.rowCount ?? 1000, sheet.properties.gridProperties?.columnCount ?? 20)));
  return { spreadsheetId: metadata.spreadsheetId ?? spreadsheetId, spreadsheetTitle: metadata.properties?.title ?? "Google Sheet", sheets, readAt: new Date().toISOString() };
}

export function sheetsOAuthConfigured(): boolean {
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id ?? "";
  return Boolean(clientId && !clientId.startsWith("REPLACE_WITH_"));
}

export async function clearSheetsToken(): Promise<void> {
  const result = await chrome.identity.getAuthToken({ interactive: false });
  const token = typeof result === "string" ? result : result?.token;
  if (token) await chrome.identity.removeCachedAuthToken({ token });
}
