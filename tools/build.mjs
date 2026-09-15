import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist");
rmSync(dist, { recursive: true, force: true }); mkdirSync(dist, { recursive: true });
const tsc = resolve(root, "node_modules/typescript/bin/tsc");
execFileSync(process.execPath, [tsc], { cwd: root, stdio: "inherit" });
for (const [from, to] of [["src/extension/manifest.json", "dist/extension/manifest.json"], ["src/extension/sidepanel.html", "dist/extension/sidepanel.html"], ["src/extension/sidepanel.css", "dist/extension/sidepanel.css"], ["src/mock/index.html", "dist/mock/index.html"], ["src/mock/app.css", "dist/mock/app.css"]]) {
  const target = resolve(root, to); mkdirSync(dirname(target), { recursive: true }); cpSync(resolve(root, from), target);
}
cpSync(resolve(dist, "domain"), resolve(dist, "extension/domain"), { recursive: true });
cpSync(resolve(dist, "fixtures"), resolve(dist, "extension/fixtures"), { recursive: true });
const sidepanelScript = resolve(dist, "extension/sidepanel.js");
writeFileSync(sidepanelScript, readFileSync(sidepanelScript, "utf8").replaceAll("../domain/", "./domain/").replaceAll("../fixtures/", "./fixtures/"));
console.log(`Built extension at ${resolve(dist, "extension")}`); console.log(`Built mock page at ${resolve(dist, "mock")}`);
