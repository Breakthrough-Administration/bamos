# Implementation Plan: Live Data Migration, Drive Ingestion & Integrations Hardening

## 1. Executive Overview & User Alignment
The goal of this initiative is to transition the Breakthrough Allied Health & NDIS Operations OS from initial development prototypes to an operational production system:
1. **Purge All Mock Data**: Remove all hardcoded dummy participants, case notes, BSP documents, and billing records from default store initializations so the app starts cleanly with live Firestore collections.
2. **Google Drive Participant Ingestion Engine**: Implement an automated folder ingestion pipeline that connects to the user's Google Drive, reads individual participant folders, extracts structured clinical information (NDIS numbers, funding budgets, support goals, emergency contacts, medical diagnoses) from PDFs and clinical documents using Gemini 2.5 Flash, and creates validated records in Firestore.
3. **17hats API Key Server-Side Sync**: Integrate 17hats via secure server-side API key authentication (`/api/integrations/17hats/sync`) to synchronize contacts, client intake leads, appointments, and workflow projects.
4. **Xero Accounting Integration**: Finalize OAuth token exchange and automatic invoice reconciliation for NDIS claims.
5. **Google Workspace Hardening**: Unify Google Drive Picker, Drive File reading, Google Calendar scheduling, and Gmail communication under authorized client tokens.

---

## 2. Architecture & Visual Layout Contract
Following SaaS & Clinical Dashboard standards:
- **Workspace Navigation**: Persistent 260px sidebar with high-contrast active states (`bg-teal-500/10 text-teal-400 border-l-2 border-teal-400`) and top header with live synchronization indicators and active user credential status.
- **Data Density**: High-density participant data grid ($36\text{px}$–$44\text{px}$ row height) with sticky header, column sorting, search filters, and `font-variant-numeric: tabular-nums` across all funding balances, NDIS numbers, dates, and claim totals.
- **Single-Elevation Depth**: Flat slate surfaces (`bg-slate-900 border border-slate-800/80`) with zero nested card borders.
- **Drive Ingestion Drawer**: A dedicated modal/drawer displaying:
  1. Google Drive Folder Selector (via Google Picker / Drive API).
  2. Batch processing status list with live progress indicators.
  3. Extracted metadata preview with editable confirmation before Firestore commit.
  4. Instant audit log generation for compliance tracking.

---

## 3. Google Drive Participant Folder Ingestion Pipeline

### A. Folder Detection & Traversal
- Utilize authorized Google Drive access (`https://www.googleapis.com/auth/drive.readonly` and `drive.file`) to traverse the user-selected parent folder or individual participant folders.
- Detect folder names (e.g. `[Participant Name] - NDIS [Number]` or `Surname, Firstname`) and enumerate all clinical documents inside:
  - NDIS Plan PDFs / Service Agreements
  - Behaviour Support Plans (BSP) & Functional Behaviour Assessments (FBA)
  - Medical summaries, diagnostic letters, and emergency profiles

### B. Gemini-Powered Clinical Extraction (`/api/drive/parse-participant`)
- Send document text or binary PDFs securely to Gemini 2.5 Flash with structured JSON schema:
  - Participant full legal name, preferred name, date of birth, gender
  - NDIS participant number (9 digits)
  - Funding allocation by category (Core, Capacity Building, Capital)
  - Primary & secondary disability diagnoses
  - Emergency contact details, support coordinator name and email
  - High-risk flags (restrictive practices, epilepsy, aspiration risks)
  - Key active goals and plan review dates
- Validate extracted data against the `Client` TypeScript interface.

### C. Live Firestore Persistence
- Commit validated participant records to the Firestore `clients` collection under the user's workspace.
- Store source Google Drive file references and direct web-view links in the participant's `documents` sub-collection for 1-click access.

---

## 4. Mock Data Purge & Database Initialization
1. **Store Initialization Update (`stores/slices/clientsSlice.ts` & `syncSlice.ts`)**:
   - Set `clients: []`, `caseNotes: []`, `incidents: []`, `claims: []`, and `bspPlans: []` as defaults instead of loading `INITIAL_CLIENTS`.
   - Update `useManagementStore` hydration to listen directly to the live Firestore `clients` collection via `onSnapshot` / real-time listener when signed in.
2. **Purge Action Trigger**:
   - Provide an explicit "Purge All Mock Data" action in the Settings / System tab that wipes any residual test artifacts from Firestore and local caches.
3. **Empty State Experience**:
   - Design empty states for Clients, Case Notes, and Billing with direct call-to-action buttons: `"Import from Google Drive"`, `"Sync with 17hats"`, and `"Add New Participant"`.

---

## 5. External Integrations Architecture

### A. 17hats Integration (`/api/integrations/17hats/sync`)
- Secure API Key configuration stored in environment variables (`SEVENTEEN_HATS_API_KEY`) and accessible via secure server-side API proxy.
- Bidirectional or ingest sync:
  - Fetch Contacts $\rightarrow$ Map to Breakthrough Participants / Leads
  - Fetch Projects $\rightarrow$ Map to NDIS Service Episodes
  - Fetch Invoices $\rightarrow$ Map to Billing / Claim status
- Sync status badge in the Hub Header with last synced timestamp and count.

### B. Xero Accounting Integration (`/api/auth/xero/*`)
- Ensure token exchange, automatic token refresh, and tenant selection work smoothly.
- Map generated NDIS claims to Xero Sales Invoices with correct NDIS line item codes and GST-free classifications.

### C. Google Workspace Integration
- Google Drive: Seamless participant file and folder importing.
- Google Calendar: Session sync for allied health practitioners.
- Google Gmail: Direct progress note and plan distribution to Support Coordinators.

---

## 6. Implementation Steps & Sequencing

1. **Step 1: Mock Data Decoupling**
   - Update `clientsSlice.ts`, `syncSlice.ts`, and `index.ts` to initialize with empty arrays and live Firestore synchronization.
   - Remove auto-populating demo data on login.
2. **Step 2: Google Drive Ingestion API & Modal**
   - Create `/api/drive/ingest-folder/route.ts` using Google Drive API and Gemini 2.5 Flash for PDF/doc parsing.
   - Build `GoogleDriveIngestModal.tsx` in `components/features/` allowing folder selection, real-time scanning progress, extracted data preview, and one-click commit to Firestore.
3. **Step 3: 17hats Server Route & Integration Panel**
   - Build `/api/integrations/17hats/sync/route.ts` with API key support, contact normalization, and error handling.
   - Add 17hats connection card in `GoogleWorkspaceHub.tsx` / `PracticeToolsModule.tsx` with API key input, test connection button, and instant sync.
4. **Step 4: Xero & Google Workspace Verification**
   - Verify Xero invoice push and token refresh.
   - Confirm Google Picker and Drive direct links work across client profile tabs.
5. **Step 5: Compilation, Lint & Live Testing**
   - Run `compile_applet` and `lint_applet`.
   - Run end-to-end API tests to verify clean imports, 0 errors, and complete state persistence.

---

## 7. Verification & Acceptance Criteria
- [ ] No dummy/mock participants visible on initial load; store populates exclusively from Firestore.
- [ ] User can pick a Google Drive folder containing participant files; Gemini extracts accurate client details into the UI.
- [ ] Extracted participant is committed to Firestore with all NDIS goals, budgets, and drive document links.
- [ ] 17hats API key authentication succeeds and ingests contacts into client leads/participants.
- [ ] Xero and Google Workspace integrations authenticate and perform operations without runtime errors.
- [ ] Build succeeds with 0 lint warnings and `HTTP 200` on all endpoints.
