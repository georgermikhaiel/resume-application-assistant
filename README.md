# Career Application Assistant

Phase 2 is a local Chrome Manifest V3 prototype for reviewing a mock internship posting, producing a source-backed résumé preview, and checking a user-owned Google Sheets tracker without writing to it.

It does not connect to Google Drive, an LLM API, Intern Insider, or real employer websites. It does not fill or submit applications. Google Sheets access is read-only in this phase.

## Requirements

- Node.js 20 or newer
- Chrome 114 or newer for the Side Panel API
- npm (pnpm is optional; the commands below work on a fresh Mac installation)

## Install and verify

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` builds first and then runs the unit tests. The current test suite covers lane recommendations, unsupported technologies, unapproved claims, one-page validation, URL normalization, and tracker duplicate matching.

## Run the local mock application page

```bash
npm run build
python3 -m http.server 4173 --directory dist
```

Open <http://127.0.0.1:4173/mock/> in Chrome. The mock page contains four selectable postings:

- Software development
- Data and machine learning
- QA and test automation
- A posting that requests unsupported technologies

## Load the unpacked extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select:

   ```text
   /Users/george/Desktop/Personal projects/resume-application-assistant/dist/extension
   ```

5. Keep the extension loaded while `dist` is served.
6. Open <http://127.0.0.1:4173/mock/>.
7. Click the extension toolbar action to open the side panel.
8. Run the résumé flow in order: **Scan page**, **Generate draft**, review the ledger, **Approve claims**, then **Validate résumé**.

The résumé preview is a Phase 1 review artifact inside the Phase 2 extension. It is not a production résumé generator and is not uploaded anywhere.

## Optional Google Sheets tracker check

The tracker integration is read-only and targets the spreadsheet configured in `src/extension/sheets-client.ts`. It reads only the visible `Applications` and `Job Leads` tabs after discovering their metadata and bounded ranges.

To connect it:

1. In Google Cloud, enable the Google Sheets API for a project.
2. Configure an OAuth consent screen and add the Google account used for testing as a test user if required.
3. Load the unpacked extension once from `dist/extension` and copy its extension ID from `chrome://extensions`.
4. Create an OAuth client with application type **Chrome Extension** and enter that extension ID as the Item ID.
5. Replace the placeholder `oauth2.client_id` in `src/extension/manifest.json` with the generated client ID, run `npm run build`, and reload the unpacked extension.
6. Click **Connect & read tracker** in the side panel. Chrome will request the manifest’s read-only Sheets scope.
7. After the read succeeds, scan a mock posting and click **Check tracker for posting**.

The tracker check reports either no match or the matching tab, row number, and reason:

- normalized direct link match first, with common tracking parameters removed;
- normalized company + role match as the fallback.

No row is created or edited. A future write phase must show an exact cell-change preview and receive explicit approval before making any spreadsheet change.

## Phase 1 safety boundaries

- All résumé claims come from `src/fixtures/profile.ts` and must reference fact IDs.
- The canonical claim ledger model and validation live in `src/domain/claim-ledger.ts`.
- Unsupported posting technologies are shown as honest gaps and cannot appear as résumé claims without verified fact support.
- Unapproved or source-less claims fail résumé validation.
- GPA, work authorization, legal information, demographics, and other unapproved sensitive details are not in the mock résumé.
- The research visualization, Kemicard, and Bot or Not ownership boundaries are represented in the fact bank notes.

## Incomplete or intentionally blocked

- Google Sheets writes, row creation, and application logging are not implemented yet.
- Google Drive résumé upload and file selection are not implemented.
- LLM-assisted tailoring is not implemented; draft generation remains deterministic and source-backed.
- Real employer websites and application submission remain out of scope.
