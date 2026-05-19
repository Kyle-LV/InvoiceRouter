# Invoice Router — React Conversion Design

**Date:** 2026-05-19  
**Goal:** Convert the existing Vanilla JS Invoice Router (`SOLVPreProcessingVendorInvoiceWebAppRePo`) into a React + TypeScript application that will eventually replace it on Azure Static Web Apps.

---

## Background

The original app is a single-page application hosted on Azure Static Web Apps. It consists of:
- One `index.html` (~1,400 lines) with all markup and modals inline
- One `app.js` (~1,500+ lines) with ~40 global variables and imperative DOM manipulation
- One `styles.css` for all styling
- An `api/` folder with an Azure Functions backend (`GetRoles`)
- Azure Logic Apps and Azure Web Apps as the data backend
- Azure Static Web Apps built-in authentication (MSAL/Azure AD)

The app has two views navigated by URL hash:
- **Invoice Router** — a two-panel layout (form on left, PDF viewer on right) for routing invoices to costings
- **Invoice Register** — a full-width sortable/filterable table of all invoices

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 | Industry standard, large ecosystem |
| Language | TypeScript | Type safety helps model complex API shapes; industry standard |
| Bundler | Vite | Fast dev server, standard for React+TS projects |
| Routing | React Router v6 | 2-page app, wide documentation, most common in industry |
| State | useState + useContext + useReducer | Sufficient for this app; teaches core React patterns without a library |
| Styling | Plain CSS (per-component `.css` files) | Migrate existing `styles.css` rules into component-level files; no CSS modules, no CSS-in-JS — keeps it simple for learning |
| PDF Viewer | pdfjs-dist (same as original) | Already proven in the app |
| Auth | Azure Static Web Apps built-in auth (MSAL) | Unchanged from original — platform handles it |

---

## Architecture

### Entry Point

`App.tsx` wraps the app in:
1. An `AuthProvider` (reads the current user from the SWA `/.auth/me` endpoint)
2. React Router (`BrowserRouter`)
3. An `InvoiceProvider` (shared invoice state)

### Routing

Two routes replace the original `hashchange` listener:

```
/           → InvoiceRouterPage
/register   → InvoiceRegisterPage
```

### State Layers

| Layer | Tool | What lives here |
|---|---|---|
| Local UI state | `useState` | Modal open/closed, search input values, active tab |
| Shared app state | `useContext` + `useReducer` | Current user, loaded invoices, selected invoice, selected costings |
| Server state | `useEffect` + `fetch` in custom hooks | API calls for invoices, costings, vendors, users |

All API calls are extracted into custom hooks (`useInvoices`, `useCostings`, `useVendors`, `useUsers`) so components stay declarative.

---

## Component Tree

### Shared
- `Modal` — reusable modal shell (all 8 modals share this wrapper)
- `Toast` / `ToastContainer` — notification system
- `LoadingScreen` — full-screen loading overlay

### InvoiceRouterPage
- `AppHeader` — logo, title, "Invoice Register" nav link
- `ProgressSteps` — 1 / 2 / 3 step indicator
- `InvoicePickerButton` — "Choose an invoice" button + inline summary
- `AdditionalOptionsMenu` — dropdown: Hold, Duplicate, Reassign, History
- `VendorCombobox` — vendor filter with confidence indicator
- `CostingList` — scrollable list of costing cards
- `CostingSelectionSummary` — running total + difference display
- `PdfViewer` — right panel with zoom / print / download / select-text toolbar
- Modals: `InvoicePickerModal`, `CostInvoiceModal`, `PoInvoiceModal`, `DuplicateModal`, `HoldModal`, `ReassignModal`, `LogHistoryModal`, `NotesModal`, `RejectModal`

### InvoiceRegisterPage
- `RegisterHeader` — logo, title, nav link, refresh button, invoice count
- `RegisterToolbar` — search input, Status/Reviewer/Entity/Columns filter dropdowns, Export CSV, Clear Filters
- `RegisterTable` — sortable table with column visibility, cell popovers
- `RegisterStatusDropdown`, `RegisterReviewerDropdown`, `RegisterEntityDropdown`, `RegisterColumnsDropdown` — individual filter dropdowns

---

## Data & API

The following Azure endpoints are used (unchanged from original):

| Data | Endpoint |
|---|---|
| Tenant users | Azure Logic App (GET_USERS_URL) |
| Hierarchy check | Azure Logic App (CHECK_HIERARCHY_URL) |
| Vendors | Azure Logic App (GET_VENDORS_URL) |
| Purchase orders / costings | Azure Web App (GET_PO_URL) |
| Invoice register | Azure Web App (GET_INVOICE_REGISTER_URL) |
| Invoices + PDFs | SharePoint (via current user auth) |
| Roles | Azure Functions (`/api/GetRoles`) |

Each endpoint maps to a custom hook that handles loading, error, and data states.

---

## Migration Strategy — Vertical Slices

Build in this order. Each slice produces something runnable:

1. **Scaffold** — `npm create vite`, React Router, two empty page components, Azure SWA auth wired up, confirm login works
2. **Invoice Router shell** — layout (two panels + resizer), `AppHeader`, `ProgressSteps`, `PdfViewer` with toolbar (no real invoice data yet)
3. **Invoice loading** — `useInvoices` hook, `InvoicePickerModal` with search/sort, invoice summary display, `LoadingScreen`
4. **Costing section** — `VendorCombobox` with confidence scoring, `useCostings` hook, `CostingList`, `CostingSelectionSummary`
5. **Processing actions** — `PoInvoiceModal`, `CostInvoiceModal`, submit logic, `Toast` notifications
6. **Additional options** — `AdditionalOptionsMenu`, `HoldModal`, `DuplicateModal`, `ReassignModal`, `LogHistoryModal`, `RejectModal`, `NotesModal`
7. **Invoice Register** — `InvoiceRegisterPage`, `RegisterToolbar`, `RegisterTable` with sorting/filtering/column visibility/export
8. **Polish** — `NoInvoicesScreen`, `NoAccessScreen`, error states, acting-on-behalf banner, cell popovers, panel resize persistence

---

## Key React Concepts Covered Per Slice

| Slice | Main concepts learned |
|---|---|
| Scaffold | Project setup, JSX, component basics, React Router |
| Router shell | Props, conditional rendering, CSS modules/classes |
| Invoice loading | `useState`, `useEffect`, lifting state up, controlled inputs |
| Costing section | Custom hooks, derived state, `useCallback` |
| Processing actions | Context consumption, form submission, side effects |
| Additional options | Complex modals, optimistic UI, async handlers |
| Register | `useMemo` for filtering/sorting, table rendering patterns |
| Polish | Error boundaries, loading states, accessibility |

---

## Out of Scope

- No changes to backend APIs or Azure Functions
- No changes to Azure Static Web Apps deployment configuration
- No new features beyond what exists in the original app
- No CSS framework (keep existing styles)
