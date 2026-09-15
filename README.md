# Career Application Assistant

Phase 1 is a local-only Chrome Manifest V3 prototype for reviewing a mock internship posting and producing a résumé preview from George Mikhaiel's verified fact bank.

It does not connect to Google Sheets, Google Drive, an LLM API, Intern Insider, or real employer websites. It does not fill or submit applications.

The extension requests page access only for the local mock server on `127.0.0.1:4173` and `localhost:4173`.

## Requirements

- Node.js 20 or newer
- Chrome 114 or newer for the Side Panel API
- The repository's package manager: `pnpm`

## Install and verify

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Run the local mock application page

Build the project, then serve the generated mock page:

```bash
pnpm build
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
4. Select this directory:

   ```text
   /Users/george/Desktop/Personal projects/resume-application-assistant/dist/extension
   ```

5. Keep the extension loaded while `dist` is served.
6. Open the mock posting page at <http://127.0.0.1:4173/mock/>.
7. Click the extension's toolbar action to open the side panel.
8. Use the side panel in this order:

   - **Scan page**
   - **Generate draft**
   - Review the claim ledger and click **Approve claims**
   - Click **Validate résumé**

The résumé preview is a Phase 1 review artifact. It is not a production résumé generator and is not uploaded anywhere.

## Phase 1 safety boundaries

- All résumé claims come from `src/fixtures/profile.ts` and must reference fact IDs.
- The canonical claim ledger model and validation live in `src/domain/claim-ledger.ts`.
- Unsupported posting technologies are shown as honest gaps and cannot appear as résumé claims without verified fact support.
- Unapproved or source-less claims fail résumé validation.
- GPA, work authorization, legal information, demographics, and other unapproved sensitive details are not in the mock résumé.
- The research visualization, Kemicard, and Bot or Not ownership boundaries are represented in the fact bank notes.
