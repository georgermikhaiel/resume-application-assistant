import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = resolve(root, "src");
const files = [];
function walk(directory) { for (const entry of readdirSync(directory, { withFileTypes: true })) { const full = join(directory, entry.name); if (entry.isDirectory()) walk(full); else if (entry.name.endsWith(".ts")) files.push(full); } }
walk(sourceRoot);
const bannedPatterns = [[/XMLHttpRequest/, "XHR is not allowed"], [/intern\s*insider/i, "Intern Insider integration is not implemented"]];
const errors = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const [pattern, message] of bannedPatterns) if (pattern.test(text)) errors.push(`${file}: ${message}`);
  if (/\bfetch\s*\(/.test(text) && !file.endsWith("src/extension/sheets-client.ts")) errors.push(`${file}: network access is limited to the Google Sheets client`);
}
if (errors.length > 0) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Lint passed for ${files.length} TypeScript source files.`);
