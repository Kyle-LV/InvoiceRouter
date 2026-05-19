# Invoice Router — Slice 4: Costing Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the costing section — fetch vendors and purchase orders from the Azure backend, display a searchable vendor combobox with confidence scoring, show a filtered/sorted list of costing cards, and track selections with a running total.

**Architecture:** Two new custom hooks (`useVendors`, `useCostings`) manage the API calls. Costing selection state lives in `InvoiceContext` (alongside the existing `selectedInvoice`). `VendorCombobox` reads vendors from context, scores them against the selected invoice's vendor string, and sets `selectedVendorNumber` in context. `CostingList` reads costings from context and renders selectable cards. `CostingSelectionSummary` shows the running total vs the invoice net/gross total. The vendor combobox dropdown, costing search, and costing selection state are all local `useState` unless they need to survive across component boundaries.

**Tech Stack:** React 18, TypeScript, Vite env vars (`import.meta.env`), Context API, `useMemo` for filtering/scoring

---

## File Map

| File | Purpose |
|---|---|
| `.env.local` | Add `VITE_VENDORS_URL` and `VITE_PO_URL` |
| `.env.example` | Document the two new vars |
| `src/types/costing.ts` | `Vendor` and `Costing` interfaces |
| `src/utils/vendorScore.ts` | Pure Jaccard-based confidence scoring function |
| `src/utils/vendorScore.test.ts` | Tests for scoring function |
| `src/hooks/useVendors.ts` | Fetches vendor list from Azure Logic App |
| `src/hooks/useVendors.test.ts` | Tests for useVendors |
| `src/hooks/useCostings.ts` | Fetches purchase orders given vendorNumber + entity + role |
| `src/hooks/useCostings.test.ts` | Tests for useCostings |
| `src/context/InvoiceContext.tsx` | Extended: add `selectedVendorNumber`, `setSelectedVendorNumber`, `selectedCostingIds`, `toggleCosting`, `clearCostingSelections` |
| `src/context/InvoiceContext.test.tsx` | Tests for new costing selection state |
| `src/components/VendorCombobox.tsx` | Searchable dropdown: scored list, confidence badge, clear button |
| `src/components/VendorCombobox.css` | Styles (from original `styles.css`) |
| `src/components/VendorCombobox.test.tsx` | Tests for VendorCombobox |
| `src/components/CostingCard.tsx` | Single costing row: PO number, value, match badge, expandable lines |
| `src/components/CostingCard.css` | Styles (from original `styles.css`) |
| `src/components/CostingCard.test.tsx` | Tests for CostingCard |
| `src/components/CostingList.tsx` | Scrollable list: costing search input, count label, cards |
| `src/components/CostingList.css` | Styles (from original `styles.css`) |
| `src/components/CostingList.test.tsx` | Tests for CostingList |
| `src/components/CostingSelectionSummary.tsx` | Running total, difference vs invoice, selected costing pills |
| `src/components/CostingSelectionSummary.test.tsx` | Tests for summary |
| `src/pages/InvoiceRouterPage.tsx` | Wire in VendorCombobox, CostingList, CostingSelectionSummary |

---

### Task 1: Define Costing types

**Files:**
- Create: `src/types/costing.ts`

- [ ] **Step 1: Create the types**

```typescript
export interface Vendor {
  VendorAccountNumber: string
  VendorOrganizationName: string
}

export interface CostingLine {
  LineNumber: string
  LineAmount: number
  DefaultLedgerDimensionDisplayValue?: string
  _invoiceNumber?: string  // set when line is already used by another invoice
}

export interface Costing {
  id: string
  PurchaseOrderNumber: string
  PurchaseOrderName: string
  vendorName: string
  OrderVendorAccountNumber: string
  CurrencyCode: string
  value: number           // sum of available (non-excluded) lines
  lines: CostingLine[]    // available lines only
  usedLines: CostingLine[] // lines already used by other invoices
  jobNumber: string       // space-separated job numbers extracted from line dimensions
}
```

No test needed — it's just type definitions.

---

### Task 2: Vendor confidence scoring utility (TDD)

**Files:**
- Create: `src/utils/vendorScore.ts`, `src/utils/vendorScore.test.ts`

This is a port of the `matchProbability` function from the original `app.js` (lines 458–507). It uses a Jaccard token similarity score with stopword filtering and a coverage boost.

- [ ] **Step 1: Write failing tests**

Create `src/utils/vendorScore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { scoreVendor } from './vendorScore'

describe('scoreVendor', () => {
  it('returns 1.0 for an exact match', () => {
    expect(scoreVendor('Acme Corp', 'Acme Corp')).toBe(1.0)
  })

  it('returns a high score for a close match', () => {
    expect(scoreVendor('Acme Corporation', 'Acme Corp')).toBeGreaterThan(0.5)
  })

  it('returns 0 when either string is empty', () => {
    expect(scoreVendor('', 'Acme Corp')).toBe(0)
    expect(scoreVendor('Acme Corp', '')).toBe(0)
  })

  it('ignores stopwords like Ltd, GmbH, Co', () => {
    expect(scoreVendor('Acme Ltd', 'Acme GmbH')).toBeGreaterThan(0.5)
  })

  it('returns a low score for unrelated vendors', () => {
    expect(scoreVendor('Zebra Industries', 'Alpha Shipping')).toBeLessThan(0.3)
  })
})
```

- [ ] **Step 2: Implement `scoreVendor`**

Create `src/utils/vendorScore.ts`. Port the `matchProbability` function from `app.js` lines 458–507 as a named export `scoreVendor(invoiceVendor: string, vendorName: string): number`. Return `0` if either string is empty. Return a `number` between `0` and `1`.

- [ ] **Step 3: Run tests — all green**

---

### Task 3: `useVendors` hook (TDD)

**Files:**
- Create: `src/hooks/useVendors.ts`, `src/hooks/useVendors.test.ts`
- Update: `.env.local`, `.env.example`

The vendors endpoint is a GET request — no body needed. Response shape: `{ value: Vendor[] }`.

- [ ] **Step 1: Add env var**

Add to `.env.local`:
```
VITE_VENDORS_URL=<your vendors Logic App URL>
```

Add to `.env.example`:
```
VITE_VENDORS_URL=
```

- [ ] **Step 2: Write failing tests**

Create `src/hooks/useVendors.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useVendors } from './useVendors'

const mockVendors = [
  { VendorAccountNumber: 'V001', VendorOrganizationName: 'Acme Corp' },
  { VendorAccountNumber: 'V002', VendorOrganizationName: 'Beta GmbH' },
]

describe('useVendors', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns loading true initially', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: mockVendors }), { status: 200 })
    )
    const { result } = renderHook(() => useVendors())
    expect(result.current.loading).toBe(true)
  })

  it('returns vendors after fetch resolves', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: mockVendors }), { status: 200 })
    )
    const { result } = renderHook(() => useVendors())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.vendors).toHaveLength(2)
    expect(result.current.vendors[0].VendorAccountNumber).toBe('V001')
  })

  it('returns empty array on fetch error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useVendors())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.vendors).toEqual([])
  })
})
```

- [ ] **Step 3: Implement `useVendors`**

```typescript
interface UseVendorsResult {
  vendors: Vendor[]
  loading: boolean
}

export function useVendors(): UseVendorsResult {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  // fetch on mount, GET request, parse data?.value
}
```

- [ ] **Step 4: Run tests — all green**

---

### Task 4: `useCostings` hook (TDD)

**Files:**
- Create: `src/hooks/useCostings.ts`, `src/hooks/useCostings.test.ts`
- Update: `.env.local`, `.env.example`

The PO endpoint is a POST with body `{ User: null, LegalEntity, Role, VendorID }`. The response parsing is complex — see `fetchPurchaseOrders` in the original `app.js` (lines 2470–2591). Key points:
- Costings are nested: `data.PO.value` is an array, items may be arrays themselves or have a `costins` array
- Lines excluded from selection are in `data.VendorInvoiceLines` (already used by other invoices)
- Each costing's `value` is the sum of its *available* (non-excluded) lines
- `jobNumber` is extracted from `DefaultLedgerDimensionDisplayValue` split by `|`, taking index 10

The hook takes `vendorNumber`, `entity`, `role`, and `userEmail` — if `vendorNumber` is empty, return an empty costings array immediately without fetching.

The hook should use `AbortController` to cancel in-flight requests when `vendorNumber` changes (so switching vendor mid-fetch doesn't cause stale results).

- [ ] **Step 1: Add env var**

Add to `.env.local`:
```
VITE_PO_URL=https://preprocesspurchaseorders-e2gfa8fdf0d5exa3.uksouth-01.azurewebsites.net/api/getPurchaseOrders
VITE_SOLV_CLIENT_HASH=<your client hash>
```

Add to `.env.example`:
```
VITE_PO_URL=
VITE_SOLV_CLIENT_HASH=
```

- [ ] **Step 2: Write failing tests**

Create `src/hooks/useCostings.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCostings } from './useCostings'

const mockPOResponse = {
  PO: {
    value: [{
      PurchaseOrderNumber: 'PO-001',
      PurchaseOrderName: 'Acme Corp',
      OrderVendorAccountNumber: 'V001',
      CurrencyCode: 'GBP',
      PurchaseOrderLines: [
        { LineNumber: '1', LineAmount: 1500, DefaultLedgerDimensionDisplayValue: '||||||||||JOB-1|' }
      ]
    }]
  },
  VendorInvoiceLines: []
}

describe('useCostings', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns empty array when vendorNumber is empty', async () => {
    const { result } = renderHook(() =>
      useCostings({ vendorNumber: '', entity: 'UKLS', role: 'Admin', userEmail: 'k@example.com' })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.costings).toEqual([])
  })

  it('returns mapped costings after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockPOResponse), { status: 200 })
    )
    const { result } = renderHook(() =>
      useCostings({ vendorNumber: 'V001', entity: 'UKLS', role: 'Admin', userEmail: 'k@example.com' })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.costings).toHaveLength(1)
    expect(result.current.costings[0].PurchaseOrderNumber).toBe('PO-001')
    expect(result.current.costings[0].value).toBe(1500)
    expect(result.current.costings[0].jobNumber).toBe('JOB-1')
  })

  it('returns empty array on fetch error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network'))
    const { result } = renderHook(() =>
      useCostings({ vendorNumber: 'V001', entity: 'UKLS', role: 'Admin', userEmail: 'k@example.com' })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.costings).toEqual([])
  })
})
```

- [ ] **Step 3: Implement `useCostings`**

Interface for params:
```typescript
interface UseCostingsParams {
  vendorNumber: string
  entity: string
  role: string
  userEmail: string | null
}
```

Use `useEffect` with `AbortController`. When `vendorNumber` is empty string, set `loading: false` and `costings: []` without fetching. Include a `refetch: () => void` in the return value (same pattern as `useInvoices`).

- [ ] **Step 4: Run tests — all green**

---

### Task 5: Extend `InvoiceContext` with costing selection state

**Files:**
- Update: `src/context/InvoiceContext.tsx`, `src/context/InvoiceContext.test.tsx`

Add to `InvoiceContext`:
- `selectedVendorNumber: string` — the vendor account number chosen in the combobox
- `setSelectedVendorNumber: (n: string) => void`
- `selectedCostingIds: Set<string>` — IDs of selected costings
- `toggleCosting: (id: string) => void` — adds if not present, removes if present
- `clearCostingSelections: () => void`
- `vendors: Vendor[]` — loaded from `useVendors` inside the provider
- `costings: Costing[]` — loaded from `useCostings` inside the provider
- `costingsLoading: boolean`

Wire `useVendors` and `useCostings` inside `InvoiceProvider`. Pass `selectedVendorNumber`, `selectedInvoice?.entity`, `currentUserRole` (from `useAuthContext`), and `user?.userDetails` into `useCostings`.

> **Note on `currentUserRole`:** The original app uses `currentUserRoles.at(-1)` — the last role in the array. You'll need to pass `user?.userRoles?.at(-1) ?? ''` from `useAuthContext`.

- [ ] **Step 1: Write failing tests for new costing state**

Add to `src/context/InvoiceContext.test.tsx`:

```typescript
it('toggleCosting adds and removes costing IDs', async () => {
  // render with InvoiceProvider, call toggleCosting twice with same ID
  // first call: ID is in selectedCostingIds
  // second call: ID is removed
})

it('clearCostingSelections empties selectedCostingIds', async () => {
  // toggle an ID in, then call clearCostingSelections, expect empty Set
})
```

- [ ] **Step 2: Extend `InvoiceContextValue` interface and implement**

- [ ] **Step 3: Run tests — all green**

---

### Task 6: `VendorCombobox` component (TDD)

**Files:**
- Create: `src/components/VendorCombobox.tsx`, `src/components/VendorCombobox.css`, `src/components/VendorCombobox.test.tsx`

The combobox:
- Shows a text input with a dropdown list of vendors
- Filters list as user types (by name or account number)
- Displays a confidence badge (e.g. "83% match") next to the selected vendor when `score > 0`
- Auto-selects the best match on load if score > 0.3 (call `setSelectedVendorNumber` in context)
- Has a clear button that resets `selectedVendorNumber` to `''`
- Dropdown closes when user selects a vendor or clicks outside

Props: none — reads `vendors` from `InvoiceContext`, reads `selectedInvoice.vendor` to score against, writes `selectedVendorNumber` via context.

- [ ] **Step 1: Write failing tests**

```typescript
// VendorCombobox.test.tsx
it('renders the vendor input', ...)
it('shows vendor options when input is focused', ...)
it('filters vendors as user types', ...)
it('selects a vendor when clicked', ...)
it('clears selection when clear button clicked', ...)
it('shows confidence badge when vendor has score > 0', ...)
```

- [ ] **Step 2: Implement `VendorCombobox`**

Key implementation notes:
- Use `useMemo` to compute `scoredVendors` — array of `{ vendor, vendorNumber, score }` sorted by score descending when `selectedInvoice?.vendor` is non-empty
- Local state: `inputValue: string`, `isOpen: boolean`
- Use `useEffect` to auto-select best vendor when vendors load (score > 0.3)
- Add `onBlur`/outside click handler to close dropdown

- [ ] **Step 3: Migrate CSS from original `styles.css`**

Search `styles.css` in the original repo for `.vendor-combo*` rules and copy them into `VendorCombobox.css`.

- [ ] **Step 4: Run tests — all green**

---

### Task 7: `CostingCard` component (TDD)

**Files:**
- Create: `src/components/CostingCard.tsx`, `src/components/CostingCard.css`, `src/components/CostingCard.test.tsx`

A single costing row. Renders:
- Checkbox area (checked / indeterminate / unchecked) — controlled by `isSelected` prop
- PO number + vendor name
- Formatted value (Intl.NumberFormat, currency from costing)
- Match badge: "Value match" (exact within 0.01) or "Within 5%" — compare against `invoiceNetTotal ?? invoiceGrossTotal`
- Expandable lines panel (toggle chevron) — only shown when `lines.length > 1` or `usedLines.length > 0`
- Job number pills
- Used lines shown greyed out with the invoice number they're already on

Props:
```typescript
interface CostingCardProps {
  costing: Costing
  isSelected: boolean
  invoiceNetTotal: number | null
  invoiceGrossTotal: number | null
  onToggle: (id: string) => void
}
```

- [ ] **Step 1: Write failing tests**

```typescript
it('renders the PO number', ...)
it('renders the formatted value', ...)
it('shows "Value match" badge when costing value exactly matches invoice net total', ...)
it('shows "Within 5%" badge when costing value is within 5% of invoice total', ...)
it('calls onToggle with costing id when clicked', ...)
it('applies selected class when isSelected is true', ...)
it('shows expandable lines panel when lines.length > 1', ...)
```

- [ ] **Step 2: Implement `CostingCard`**

- [ ] **Step 3: Migrate CSS — search `styles.css` for `.costing-row*`, `.match-badge*`, `.costing-lines*`, `.costing-job-pill`**

- [ ] **Step 4: Run tests — all green**

---

### Task 8: `CostingList` component (TDD)

**Files:**
- Create: `src/components/CostingList.tsx`, `src/components/CostingList.css`, `src/components/CostingList.test.tsx`

The list container:
- Reads `costings`, `costingsLoading`, `selectedCostingIds`, `toggleCosting`, `selectedInvoice` from `InvoiceContext`
- Search input filters by PO number or job number (local state, `useMemo`)
- Sort: selected costings always float to the top; within unselected, sort by closest value to invoice net/gross total
- Shows count label: "N Open costings for this vendor. Refresh if you've recently added one."
- Shows a loading skeleton or spinner when `costingsLoading`
- Hidden entirely when `selectedVendorNumber` is empty (no vendor chosen yet)

- [ ] **Step 1: Write failing tests**

```typescript
it('renders nothing when no vendor is selected', ...)
it('shows loading state when costingsLoading is true', ...)
it('renders a CostingCard for each costing', ...)
it('filters costings by search term', ...)
it('shows correct count label', ...)
```

- [ ] **Step 2: Implement `CostingList`**

- [ ] **Step 3: Migrate CSS — search `styles.css` for `.costing-section*`, `#costingOptions`, `.costing-search*`**

- [ ] **Step 4: Run tests — all green**

---

### Task 9: `CostingSelectionSummary` component (TDD)

**Files:**
- Create: `src/components/CostingSelectionSummary.tsx`, `src/components/CostingSelectionSummary.test.tsx`

Shows when at least one costing is selected:
- Running total of selected costing values (formatted with Intl.NumberFormat)
- Difference vs invoice net/gross total — positive means over-allocated, negative means under-allocated
- "Clear all" button that calls `clearCostingSelections` from context

Props: none — reads everything from `InvoiceContext`.

- [ ] **Step 1: Write failing tests**

```typescript
it('renders nothing when no costings are selected', ...)
it('shows the formatted running total', ...)
it('shows the difference vs invoice total', ...)
it('calls clearCostingSelections when "Clear all" is clicked', ...)
```

- [ ] **Step 2: Implement `CostingSelectionSummary`**

- [ ] **Step 3: Migrate relevant CSS from `styles.css` (`#costingSelectionSummary`, `.costing-running-total*`)**

- [ ] **Step 4: Run tests — all green**

---

### Task 10: Wire into `InvoiceRouterPage`

**Files:**
- Update: `src/pages/InvoiceRouterPage.tsx`

Add the costing section to the form panel, below the existing invoice section:

```tsx
<div className="form-section">
  <div className="form-section-title">Vendor</div>
  <VendorCombobox />
</div>
<div className="form-section" id="costingSection">
  <div className="form-section-title">Costings</div>
  <CostingList />
  <CostingSelectionSummary />
</div>
```

Update `ProgressSteps` active step logic:
- Step 1: no invoice selected
- Step 2: invoice selected but no costings selected
- Step 3: invoice selected AND at least one costing selected

```tsx
const { selectedInvoice, selectedCostingIds } = useInvoiceContext()
const activeStep = !selectedInvoice ? 1 : selectedCostingIds.size === 0 ? 2 : 3
```

- [ ] **Step 1: Update `InvoiceRouterPage`**

- [ ] **Step 2: Update the existing `InvoiceRouterPage.test.tsx` tests** — mock context now needs to include `selectedVendorNumber`, `vendors`, `costings`, `costingsLoading`, `selectedCostingIds`, `toggleCosting`, `clearCostingSelections`

- [ ] **Step 3: Run all tests — all green**

- [ ] **Step 4: Start dev server (`npm run dev:swa`) and manually verify:**
  - Selecting an invoice loads and scores the vendor list
  - Choosing a vendor triggers a costings fetch
  - Costing cards render with correct values and match badges
  - Selecting/deselecting costings updates the running total
  - ProgressSteps advances to step 3 when a costing is selected
