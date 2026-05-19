# Invoice Router — Slice 3: Invoice Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up real invoice data — fetch invoices from the Azure backend, display them in a searchable/sortable picker modal, show the selected invoice summary, and handle loading and empty states.

**Architecture:** A `useInvoices` hook fetches from the Azure Logic App and maps the raw API response to a typed `Invoice` interface. An `InvoiceContext` wraps the app and holds the loaded invoices plus the currently selected invoice. `InvoicePickerModal` reads from context and lets the user search, sort, and select. `InvoiceRouterPage` reads context to decide whether to show `LoadingScreen`, `NoInvoicesScreen`, or the main form. The Azure URL is stored in `.env.local` (gitignored) to keep secrets out of source control.

**Tech Stack:** React 18, TypeScript, Vite env vars (`import.meta.env`), Context API

---

## File Map

| File | Purpose |
|---|---|
| `.env.local` | Secret env vars (gitignored) — VITE_INVOICES_URL |
| `.env.example` | Template showing which env vars are needed |
| `src/types/invoice.ts` | Invoice interface + SortKey type |
| `src/utils/invoiceSort.ts` | Pure sort function — extracted for testability |
| `src/utils/invoiceSort.test.ts` | Tests for sort function |
| `src/hooks/useInvoices.ts` | Fetches invoices, maps API response to Invoice[] |
| `src/hooks/useInvoices.test.ts` | Tests for useInvoices |
| `src/context/InvoiceContext.tsx` | Holds invoices + selectedInvoice, exposes setSelectedInvoice |
| `src/context/InvoiceContext.test.tsx` | Tests for InvoiceContext |
| `src/components/LoadingScreen.tsx` | Full-screen loading overlay |
| `src/components/LoadingScreen.css` | Loading screen styles (empty, from global CSS) |
| `src/components/LoadingScreen.test.tsx` | Tests for LoadingScreen |
| `src/components/NoInvoicesScreen.tsx` | Full-screen "no invoices" message |
| `src/components/NoInvoicesScreen.test.tsx` | Tests for NoInvoicesScreen |
| `src/components/Modal.tsx` | Reusable modal shell (header, body, footer, close button) |
| `src/components/Modal.test.tsx` | Tests for Modal |
| `src/components/InvoicePickerModal.tsx` | Modal: search input, sort select, scrollable invoice list |
| `src/components/InvoicePickerModal.css` | Picker modal styles (empty, from global CSS) |
| `src/components/InvoicePickerModal.test.tsx` | Tests for InvoicePickerModal |
| `src/components/InvoicePickerButton.tsx` | "Choose an invoice" button that opens the modal |
| `src/components/InvoiceSummary.tsx` | Inline summary: vendor · total · date |
| `src/components/InvoicePickerButton.test.tsx` | Tests for button + summary |
| `src/App.tsx` | Updated to include InvoiceProvider |
| `src/pages/InvoiceRouterPage.tsx` | Updated to wire loading/empty/picker into the form panel |

---

### Task 1: Define Invoice types and sort utility

**Files:**
- Create: `src/types/invoice.ts`, `src/utils/invoiceSort.ts`, `src/utils/invoiceSort.test.ts`

- [ ] **Step 1: Create the Invoice type**

Create `src/types/invoice.ts`:

```typescript
export type SortKey = 'oldest' | 'newest' | 'az' | 'za' | 'entity'

export interface Invoice {
  id: string
  label: string
  netTotal: number | null
  grossTotal: number | null
  vendor: string
  currency: string
  poNos: string[]
  jobNos: string[]
  jobInfo: unknown[]
  entity: string
  status: string | null
  date: string | null
}
```

- [ ] **Step 2: Write failing tests for the sort utility**

Create `src/utils/invoiceSort.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { sortInvoices } from './invoiceSort'
import type { Invoice } from '../types/invoice'

const base: Invoice = {
  id: '1', label: 'Test', netTotal: null, grossTotal: null,
  vendor: '', currency: 'EUR', poNos: [], jobNos: [], jobInfo: [],
  entity: '', status: null, date: null,
}

const invoices: Invoice[] = [
  { ...base, id: '1', vendor: 'Zebra Ltd',  entity: 'UKLS', date: '2024-01-01' },
  { ...base, id: '2', vendor: 'Alpha Co',   entity: 'NLCT', date: '2024-03-01' },
  { ...base, id: '3', vendor: 'Beta GmbH',  entity: 'AZLS', date: '2024-02-01' },
]

describe('sortInvoices', () => {
  it('sorts oldest first by default', () => {
    const result = sortInvoices(invoices, 'oldest')
    expect(result.map((i) => i.id)).toEqual(['1', '3', '2'])
  })

  it('sorts newest first', () => {
    const result = sortInvoices(invoices, 'newest')
    expect(result.map((i) => i.id)).toEqual(['2', '3', '1'])
  })

  it('sorts vendor A-Z', () => {
    const result = sortInvoices(invoices, 'az')
    expect(result.map((i) => i.vendor)).toEqual(['Alpha Co', 'Beta GmbH', 'Zebra Ltd'])
  })

  it('sorts vendor Z-A', () => {
    const result = sortInvoices(invoices, 'za')
    expect(result.map((i) => i.vendor)).toEqual(['Zebra Ltd', 'Beta GmbH', 'Alpha Co'])
  })

  it('sorts by entity', () => {
    const result = sortInvoices(invoices, 'entity')
    expect(result.map((i) => i.entity)).toEqual(['AZLS', 'NLCT', 'UKLS'])
  })

  it('does not mutate the original array', () => {
    const original = [...invoices]
    sortInvoices(invoices, 'newest')
    expect(invoices).toEqual(original)
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```powershell
npm test -- --run src/utils/invoiceSort.test.ts
```

Expected: FAIL with "Cannot find module './invoiceSort'"

- [ ] **Step 4: Implement the sort utility**

Create `src/utils/invoiceSort.ts`:

```typescript
import type { Invoice, SortKey } from '../types/invoice'

function cmp<T>(a: T, b: T, desc = false): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a < b) return desc ? 1 : -1
  if (a > b) return desc ? -1 : 1
  return 0
}

export function sortInvoices(invoices: Invoice[], key: SortKey): Invoice[] {
  const copy = [...invoices]
  switch (key) {
    case 'newest':
      return copy.sort((a, b) => cmp(a.date, b.date, true))
    case 'az':
      return copy.sort((a, b) => cmp(a.vendor?.toLowerCase(), b.vendor?.toLowerCase()))
    case 'za':
      return copy.sort((a, b) => cmp(a.vendor?.toLowerCase(), b.vendor?.toLowerCase(), true))
    case 'entity':
      return copy.sort((a, b) => cmp(a.entity?.toLowerCase(), b.entity?.toLowerCase()))
    case 'oldest':
    default:
      return copy.sort((a, b) => cmp(a.date, b.date))
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```powershell
npm test -- --run src/utils/invoiceSort.test.ts
```

Expected: `6 passed`

- [ ] **Step 6: Commit**

```powershell
git add src/types/invoice.ts src/utils/invoiceSort.ts src/utils/invoiceSort.test.ts
git commit -m "feat: add Invoice type and sortInvoices utility"
```

---

### Task 2: Set up environment variables

**Files:**
- Create: `.env.local`, `.env.example`

The invoices URL contains a SAS signature token — it must not be committed to git. Vite exposes any variable prefixed with `VITE_` to client-side code via `import.meta.env`.

- [ ] **Step 1: Create .env.local with the invoices URL**

Create `.env.local` in the project root:

```
VITE_INVOICES_URL=https://prod-25.uksouth.logic.azure.com:443/workflows/bbd252600d9c4fcbac6d0ef98fc8b8da/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=sTXKEDv8GwTLzfHNFYfBq-UUaqhuAshSCeVDX_QV6GY
```

- [ ] **Step 2: Create .env.example as a template for other developers**

Create `.env.example` in the project root:

```
VITE_INVOICES_URL=<azure-logic-app-url>
```

- [ ] **Step 3: Verify .env.local is gitignored**

```powershell
git check-ignore -v .env.local
```

Expected output includes `.env.local` — confirming it is ignored. If it is not ignored, add `.env.local` to `.gitignore`.

- [ ] **Step 4: Commit .env.example only**

```powershell
git add .env.example
git commit -m "feat: add .env.example with required environment variables"
```

---

### Task 3: Create the useInvoices hook

**Files:**
- Create: `src/hooks/useInvoices.ts`, `src/hooks/useInvoices.test.ts`

This hook takes the current user's email, POSTs to the invoices endpoint, and maps the raw response to `Invoice[]`. It exposes a `refetch` function so the picker modal can refresh the list.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useInvoices.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInvoices } from './useInvoices'

const mockRawInvoice = {
  ID: '42',
  Title: 'INV-001',
  NetTotal: '1500.00',
  Total: '1800.00',
  Vendor: 'Acme Corp',
  CurrencyCode: 'GBP',
  PONos: 'PO-001,PO-002',
  JobNos: 'JOB-1',
  Entity: { Value: 'UKLS' },
  Status: { Value: 'Pending' },
  InvoiceDate: '2024-01-15',
}

describe('useInvoices', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns loading true initially', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ Invoiced: [] }), { status: 200 })
    )
    const { result } = renderHook(() => useInvoices('kyle@example.com'))
    expect(result.current.loading).toBe(true)
  })

  it('returns mapped invoices after fetch resolves', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ Invoiced: [mockRawInvoice] }), { status: 200 })
    )
    const { result } = renderHook(() => useInvoices('kyle@example.com'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.invoices).toHaveLength(1)
    expect(result.current.invoices[0].id).toBe('42')
    expect(result.current.invoices[0].label).toBe('INV-001')
    expect(result.current.invoices[0].vendor).toBe('Acme Corp')
    expect(result.current.invoices[0].entity).toBe('UKLS')
    expect(result.current.invoices[0].poNos).toEqual(['PO-001', 'PO-002'])
  })

  it('returns empty array when user email is null', async () => {
    const { result } = renderHook(() => useInvoices(null))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.invoices).toEqual([])
  })

  it('sets error when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useInvoices('kyle@example.com'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to load invoices')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/hooks/useInvoices.test.ts
```

Expected: FAIL with "Cannot find module './useInvoices'"

- [ ] **Step 3: Implement useInvoices**

Create `src/hooks/useInvoices.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Invoice } from '../types/invoice'

const INVOICES_URL = import.meta.env.VITE_INVOICES_URL as string

function mapInvoice(item: Record<string, unknown>): Invoice {
  const id = String(
    item.ID ?? item.ItemInternalId ?? item.SharepointID ?? item.SharePointID ??
    item.InvoiceId ?? item.InvoiceID ?? item.Id ?? ''
  )
  const label = String(
    item.Title ?? item.InvoiceNo ?? item.InvoiceNumber ?? item.Name ?? item.FileName ??
    `Invoice ${item.ID ?? item.ItemInternalId ?? 'Unknown'}`
  )
  const netTotal = (() => {
    const n = parseFloat(item.NetTotal as string)
    return !isNaN(n) && n !== 0 ? n : null
  })()
  const grossTotal = (() => {
    const n = parseFloat(item.Total as string)
    return !isNaN(n) && n !== 0 ? n : null
  })()
  const vendor = String(item.Vendor ?? item.VendorName ?? item.vendor ?? '')
  const currency = String(item.CurrencyCode ?? item.currencyCode ?? item.Currency ?? item.currency ?? 'EUR')
  const poNos: string[] = item.PONos
    ? Array.isArray(item.PONos) ? (item.PONos as string[])
      : String(item.PONos).split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const jobNos: string[] = item.JobNos
    ? Array.isArray(item.JobNos) ? (item.JobNos as string[])
      : String(item.JobNos).split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const jobInfo: unknown[] = (() => {
    try {
      const parsed = typeof item.JobInfo === 'string' ? JSON.parse(item.JobInfo) : item.JobInfo
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  })()
  const entityRaw = item.Entity as { Value?: string } | string | undefined
  const entity = String(typeof entityRaw === 'object' ? (entityRaw?.Value ?? '') : (entityRaw ?? ''))
  const statusRaw = item.Status as { Value?: string } | string | null | undefined
  const status = (typeof statusRaw === 'object' ? (statusRaw?.Value ?? null) : (statusRaw ?? null))
  const date = String(item.InvoiceDate ?? item.DocumentDate ?? item.Date ?? item.Created ?? '') || null

  return { id, label, netTotal, grossTotal, vendor, currency, poNos, jobNos, jobInfo, entity, status, date }
}

interface UseInvoicesResult {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInvoices(userEmail: string | null): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    if (!userEmail) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(INVOICES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserEmail: userEmail }),
      })
      const data = await res.json().catch(() => null)
      const raw: unknown[] = Array.isArray(data?.Invoiced) ? data.Invoiced
        : Array.isArray(data?.value) ? data.value
        : Array.isArray(data) ? data : []
      setInvoices((raw as Record<string, unknown>[]).map(mapInvoice).filter((inv) => inv.id))
    } catch {
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [userEmail])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  return { invoices, loading, error, refetch: fetchInvoices }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```powershell
npm test -- --run src/hooks/useInvoices.test.ts
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```powershell
git add src/hooks/useInvoices.ts src/hooks/useInvoices.test.ts
git commit -m "feat: add useInvoices hook with API mapping"
```

---

### Task 4: Create InvoiceContext

**Files:**
- Create: `src/context/InvoiceContext.tsx`, `src/context/InvoiceContext.test.tsx`

`InvoiceContext` wraps `useInvoices` in a context so any component can access the invoice list and selected invoice without prop drilling. It also stores `selectedInvoice` as local state.

- [ ] **Step 1: Write the failing tests**

Create `src/context/InvoiceContext.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { InvoiceProvider, useInvoiceContext } from './InvoiceContext'
import { AuthProvider } from './AuthContext'
import type { Invoice } from '../types/invoice'

const mockUser = {
  identityProvider: 'aad', userId: 'abc', userDetails: 'kyle@example.com',
  userRoles: ['authenticated'], claims: [],
}

const mockInvoice: Invoice = {
  id: '1', label: 'INV-001', netTotal: 100, grossTotal: 120,
  vendor: 'Acme', currency: 'GBP', poNos: [], jobNos: [],
  jobInfo: [], entity: 'UKLS', status: null, date: '2024-01-01',
}

function TestConsumer() {
  const { invoices, selectedInvoice, setSelectedInvoice, loading } = useInvoiceContext()
  if (loading) return <div>loading</div>
  return (
    <div>
      <div>count: {invoices.length}</div>
      <div>selected: {selectedInvoice?.label ?? 'none'}</div>
      <button onClick={() => setSelectedInvoice(mockInvoice)}>select</button>
    </div>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (String(url).includes('auth/me')) {
      return Promise.resolve(new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 }))
    }
    return Promise.resolve(new Response(JSON.stringify({ Invoiced: [
      { ID: '1', Title: 'INV-001', Vendor: 'Acme', CurrencyCode: 'GBP', Entity: { Value: 'UKLS' } }
    ] }), { status: 200 }))
  })
  return <AuthProvider><InvoiceProvider>{children}</InvoiceProvider></AuthProvider>
}

describe('InvoiceContext', () => {
  it('provides loaded invoices', async () => {
    render(<TestConsumer />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument())
  })

  it('tracks selected invoice', async () => {
    const user = userEvent.setup()
    render(<TestConsumer />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByText('selected: none')).toBeInTheDocument())
    await user.click(screen.getByText('select'))
    expect(screen.getByText('selected: INV-001')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/context/InvoiceContext.test.tsx
```

Expected: FAIL with "Cannot find module './InvoiceContext'"

- [ ] **Step 3: Implement InvoiceContext**

Create `src/context/InvoiceContext.tsx`:

```typescript
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { useInvoices } from '../hooks/useInvoices'
import { useAuthContext } from './AuthContext'
import type { Invoice } from '../types/invoice'

interface InvoiceContextValue {
  invoices: Invoice[]
  selectedInvoice: Invoice | null
  setSelectedInvoice: (invoice: Invoice) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const { invoices, loading, error, refetch } = useInvoices(user?.userDetails ?? null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  return (
    <InvoiceContext.Provider value={{ invoices, selectedInvoice, setSelectedInvoice, loading, error, refetch }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoiceContext(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext)
  if (!ctx) throw new Error('useInvoiceContext must be used within InvoiceProvider')
  return ctx
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```powershell
npm test -- --run src/context/InvoiceContext.test.tsx
```

Expected: `2 passed`

- [ ] **Step 5: Add InvoiceProvider to App.tsx**

Update `src/App.tsx` — wrap `AuthGuard` children with `InvoiceProvider`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { InvoiceProvider } from './context/InvoiceContext'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/.auth/login/aad'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <InvoiceProvider>
            <Routes>
              <Route path="/" element={<InvoiceRouterPage />} />
              <Route path="/register" element={<InvoiceRegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </InvoiceProvider>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 6: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```powershell
git add src/context/InvoiceContext.tsx src/context/InvoiceContext.test.tsx src/App.tsx
git commit -m "feat: add InvoiceContext and wire InvoiceProvider into App"
```

---

### Task 5: Build LoadingScreen

**Files:**
- Create: `src/components/LoadingScreen.tsx`, `src/components/LoadingScreen.css`, `src/components/LoadingScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/LoadingScreen.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingScreen from './LoadingScreen'

describe('LoadingScreen', () => {
  it('renders the loading message', () => {
    render(<LoadingScreen />)
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
npm test -- --run src/components/LoadingScreen.test.tsx
```

Expected: FAIL with "Cannot find module './LoadingScreen'"

- [ ] **Step 3: Implement LoadingScreen**

Create `src/components/LoadingScreen.tsx`:

```typescript
import './LoadingScreen.css'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading invoices...</p>
    </div>
  )
}
```

- [ ] **Step 4: Create the CSS**

Create `src/components/LoadingScreen.css`:

```css
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: Inter, sans-serif;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #4f46e5;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-screen p {
  color: #475569;
  font-weight: 600;
}
```

- [ ] **Step 5: Run the test to verify it passes**

```powershell
npm test -- --run src/components/LoadingScreen.test.tsx
```

Expected: `1 passed`

- [ ] **Step 6: Commit**

```powershell
git add src/components/LoadingScreen.tsx src/components/LoadingScreen.css src/components/LoadingScreen.test.tsx
git commit -m "feat: add LoadingScreen component"
```

---

### Task 6: Build NoInvoicesScreen

**Files:**
- Create: `src/components/NoInvoicesScreen.tsx`, `src/components/NoInvoicesScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/NoInvoicesScreen.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import NoInvoicesScreen from './NoInvoicesScreen'

describe('NoInvoicesScreen', () => {
  it('renders the no invoices message', () => {
    render(<NoInvoicesScreen />, { wrapper: MemoryRouter })
    expect(screen.getByText('No invoices to process')).toBeInTheDocument()
  })

  it('renders a link to the register', () => {
    render(<NoInvoicesScreen />, { wrapper: MemoryRouter })
    expect(screen.getByRole('link', { name: /go to register/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
npm test -- --run src/components/NoInvoicesScreen.test.tsx
```

Expected: FAIL with "Cannot find module './NoInvoicesScreen'"

- [ ] **Step 3: Implement NoInvoicesScreen**

Create `src/components/NoInvoicesScreen.tsx`:

```typescript
import { Link } from 'react-router-dom'

export default function NoInvoicesScreen() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: '#ffffff', zIndex: 2000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: '2rem', color: '#102a43', marginBottom: 12 }}>
        No invoices to process
      </h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>You're all caught up 🎉</p>
      <Link
        to="/register"
        style={{
          display: 'inline-block', padding: '10px 20px', background: '#1e3a5f',
          color: '#fff', borderRadius: 6, fontSize: '0.9rem', fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Go to Register
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/NoInvoicesScreen.test.tsx
```

Expected: `2 passed`

- [ ] **Step 5: Commit**

```powershell
git add src/components/NoInvoicesScreen.tsx src/components/NoInvoicesScreen.test.tsx
git commit -m "feat: add NoInvoicesScreen component"
```

---

### Task 7: Build the shared Modal wrapper

**Files:**
- Create: `src/components/Modal.tsx`, `src/components/Modal.test.tsx`

All 8 modals in the app share the same shell: a backdrop, a content box, a header with title + close button, a body, and a footer. This component wraps that structure so each modal only needs to provide its content.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Modal.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when not open', () => {
    render(
      <Modal isOpen={false} title="Test" onClose={() => {}}>
        <p>body content</p>
      </Modal>
    )
    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })

  it('renders title and children when open', () => {
    render(
      <Modal isOpen={true} title="Select Invoice" onClose={() => {}}>
        <p>body content</p>
      </Modal>
    )
    expect(screen.getByText('Select Invoice')).toBeInTheDocument()
    expect(screen.getByText('body content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} title="Test" onClose={onClose}>
        <p>content</p>
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/Modal.test.tsx
```

Expected: FAIL with "Cannot find module './Modal'"

- [ ] **Step 3: Implement Modal**

Create `src/components/Modal.tsx`:

```typescript
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number
}

export default function Modal({ isOpen, title, onClose, children, footer, maxWidth = 720 }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content" style={{ maxWidth }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/Modal.test.tsx
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```powershell
git add src/components/Modal.tsx src/components/Modal.test.tsx
git commit -m "feat: add shared Modal wrapper component"
```

---

### Task 8: Build InvoicePickerModal

**Files:**
- Create: `src/components/InvoicePickerModal.tsx`, `src/components/InvoicePickerModal.css`, `src/components/InvoicePickerModal.test.tsx`

The picker modal shows a search input, a sort select, a count label, and a scrollable list of invoice items. Clicking an invoice calls `onSelect` and closes the modal.

- [ ] **Step 1: Write the failing tests**

Create `src/components/InvoicePickerModal.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import InvoicePickerModal from './InvoicePickerModal'
import type { Invoice } from '../types/invoice'

const invoices: Invoice[] = [
  { id: '1', label: 'INV-001', netTotal: 100, grossTotal: 120, vendor: 'Acme Corp',
    currency: 'GBP', poNos: [], jobNos: [], jobInfo: [], entity: 'UKLS', status: null, date: '2024-01-01' },
  { id: '2', label: 'INV-002', netTotal: 200, grossTotal: 240, vendor: 'Beta Ltd',
    currency: 'GBP', poNos: [], jobNos: [], jobInfo: [], entity: 'NLCT', status: null, date: '2024-02-01' },
]

describe('InvoicePickerModal', () => {
  it('renders nothing when not open', () => {
    render(
      <InvoicePickerModal isOpen={false} invoices={invoices} onSelect={vi.fn()} onClose={vi.fn()} />,
      { wrapper: MemoryRouter }
    )
    expect(screen.queryByText('INV-001')).not.toBeInTheDocument()
  })

  it('renders invoice labels when open', () => {
    render(
      <InvoicePickerModal isOpen={true} invoices={invoices} onSelect={vi.fn()} onClose={vi.fn()} />,
      { wrapper: MemoryRouter }
    )
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('INV-002')).toBeInTheDocument()
  })

  it('filters invoices by search term', async () => {
    const user = userEvent.setup()
    render(
      <InvoicePickerModal isOpen={true} invoices={invoices} onSelect={vi.fn()} onClose={vi.fn()} />,
      { wrapper: MemoryRouter }
    )
    await user.type(screen.getByPlaceholderText('Search invoices...'), 'INV-001')
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.queryByText('INV-002')).not.toBeInTheDocument()
  })

  it('calls onSelect with the invoice when an item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <InvoicePickerModal isOpen={true} invoices={invoices} onSelect={onSelect} onClose={vi.fn()} />,
      { wrapper: MemoryRouter }
    )
    await user.click(screen.getByText('INV-001'))
    expect(onSelect).toHaveBeenCalledWith(invoices[0])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/InvoicePickerModal.test.tsx
```

Expected: FAIL with "Cannot find module './InvoicePickerModal'"

- [ ] **Step 3: Implement InvoicePickerModal**

Create `src/components/InvoicePickerModal.tsx`:

```typescript
import { useState, useMemo } from 'react'
import Modal from './Modal'
import { sortInvoices } from '../utils/invoiceSort'
import type { Invoice, SortKey } from '../types/invoice'
import './InvoicePickerModal.css'

interface InvoicePickerModalProps {
  isOpen: boolean
  invoices: Invoice[]
  selectedId?: string
  onSelect: (invoice: Invoice) => void
  onClose: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function formatAmount(invoice: Invoice): string | null {
  const amount = invoice.netTotal ?? invoice.grossTotal
  if (amount == null) return null
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: invoice.currency || 'EUR' }).format(amount)
}

export default function InvoicePickerModal({ isOpen, invoices, selectedId, onSelect, onClose }: InvoicePickerModalProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('oldest')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const sorted = sortInvoices(invoices, sort)
    if (!term) return sorted
    return sorted.filter((inv) =>
      [inv.label, inv.vendor, inv.entity, formatAmount(inv), ...inv.jobNos]
        .filter(Boolean).join(' ').toLowerCase().includes(term)
    )
  }, [invoices, search, sort])

  const footer = (
    <button type="button" className="secondary" onClick={onClose}>Cancel</button>
  )

  return (
    <Modal isOpen={isOpen} title="Select Invoice" onClose={onClose} footer={footer}>
      <div className="modal-search">
        <svg className="invoice-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="5.5" cy="5.5" r="4" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M9 9L12 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="invoice-search-input"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          aria-label="Search invoices"
          autoFocus
        />
        <select
          className="invoice-sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort invoices"
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
          <option value="az">Vendor A-Z</option>
          <option value="za">Vendor Z-A</option>
          <option value="entity">LV Entity</option>
        </select>
      </div>
      <div className="invoice-search-count">
        {search
          ? `Showing ${filtered.length} of ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
          : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
        }
      </div>
      <div className="invoice-list">
        {filtered.length === 0 ? (
          <div className="no-invoices">No invoices match your search</div>
        ) : (
          filtered.map((invoice) => {
            const amount = formatAmount(invoice)
            const date = formatDate(invoice.date)
            const meta = [invoice.vendor, date].filter(Boolean).join(' · ')
            return (
              <div
                key={invoice.id}
                className={`invoice-item${invoice.id === selectedId ? ' active' : ''}`}
                onClick={() => { onSelect(invoice); onClose() }}
              >
                <div className="invoice-row-top">
                  <span className="invoice-row-title">{invoice.label}</span>
                  {invoice.entity && (
                    <span className="entity-badge">{invoice.entity}</span>
                  )}
                  {amount && <span className="invoice-row-amount">{amount}</span>}
                </div>
                {meta && (
                  <div className="invoice-row-bottom">
                    <span className="invoice-row-meta">{meta}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Modal>
  )
}
```

- [ ] **Step 4: Create the CSS file**

Create `src/components/InvoicePickerModal.css` with empty contents. Styles come from `src/index.css`.

- [ ] **Step 5: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/InvoicePickerModal.test.tsx
```

Expected: `4 passed`

- [ ] **Step 6: Commit**

```powershell
git add src/components/InvoicePickerModal.tsx src/components/InvoicePickerModal.css src/components/InvoicePickerModal.test.tsx
git commit -m "feat: add InvoicePickerModal with search and sort"
```

---

### Task 9: Build InvoicePickerButton and InvoiceSummary

**Files:**
- Create: `src/components/InvoicePickerButton.tsx`, `src/components/InvoiceSummary.tsx`, `src/components/InvoicePickerButton.test.tsx`

`InvoicePickerButton` opens the picker modal. `InvoiceSummary` shows vendor · total · date below the button when an invoice is selected. Both read from `InvoiceContext`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/InvoicePickerButton.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InvoicePickerButton from './InvoicePickerButton'
import InvoiceSummary from './InvoiceSummary'
import type { Invoice } from '../types/invoice'

const mockInvoice: Invoice = {
  id: '1', label: 'INV-001', netTotal: 1500, grossTotal: 1800,
  vendor: 'Acme Corp', currency: 'GBP', poNos: [], jobNos: [],
  jobInfo: [], entity: 'UKLS', status: null, date: '2024-01-15',
}

describe('InvoicePickerButton', () => {
  it('renders the placeholder text when no invoice is selected', () => {
    render(<InvoicePickerButton selectedInvoice={null} onClick={vi.fn()} />)
    expect(screen.getByText('Choose an invoice...')).toBeInTheDocument()
  })

  it('renders the selected invoice label', () => {
    render(<InvoicePickerButton selectedInvoice={mockInvoice} onClick={vi.fn()} />)
    expect(screen.getByText('INV-001')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<InvoicePickerButton selectedInvoice={null} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('InvoiceSummary', () => {
  it('renders nothing when no invoice is selected', () => {
    const { container } = render(<InvoiceSummary selectedInvoice={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders vendor and formatted total', () => {
    render(<InvoiceSummary selectedInvoice={mockInvoice} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('£1,500.00')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/InvoicePickerButton.test.tsx
```

Expected: FAIL with "Cannot find module './InvoicePickerButton'"

- [ ] **Step 3: Implement InvoicePickerButton**

Create `src/components/InvoicePickerButton.tsx`:

```typescript
import type { Invoice } from '../types/invoice'

interface InvoicePickerButtonProps {
  selectedInvoice: Invoice | null
  onClick: () => void
}

export default function InvoicePickerButton({ selectedInvoice, onClick }: InvoicePickerButtonProps) {
  return (
    <button
      type="button"
      className={`picker-btn${selectedInvoice ? ' has-value' : ''}`}
      onClick={onClick}
    >
      <span>{selectedInvoice ? selectedInvoice.label : 'Choose an invoice...'}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 4: Implement InvoiceSummary**

Create `src/components/InvoiceSummary.tsx`:

```typescript
import type { Invoice } from '../types/invoice'

interface InvoiceSummaryProps {
  selectedInvoice: Invoice | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export default function InvoiceSummary({ selectedInvoice }: InvoiceSummaryProps) {
  if (!selectedInvoice) return null

  const amount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: selectedInvoice.currency || 'EUR',
  }).format(selectedInvoice.netTotal ?? selectedInvoice.grossTotal ?? 0)

  const date = formatDate(selectedInvoice.date)

  return (
    <div className="invoice-summary" style={{ display: 'flex' }}>
      <span className="summary-vendor">{selectedInvoice.vendor}</span>
      {selectedInvoice.vendor && <span className="summary-sep">•</span>}
      <span className="summary-total">{amount}</span>
      {date && <span className="summary-sep">•</span>}
      {date && <span className="summary-date">{date}</span>}
    </div>
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/InvoicePickerButton.test.tsx
```

Expected: `5 passed`

- [ ] **Step 6: Commit**

```powershell
git add src/components/InvoicePickerButton.tsx src/components/InvoiceSummary.tsx src/components/InvoicePickerButton.test.tsx
git commit -m "feat: add InvoicePickerButton and InvoiceSummary components"
```

---

### Task 10: Wire everything into InvoiceRouterPage

**Files:**
- Modify: `src/pages/InvoiceRouterPage.tsx`, `src/pages/InvoiceRouterPage.test.tsx`

The page now reads from `InvoiceContext`. If invoices are loading it shows `LoadingScreen`. If none are loaded it shows `NoInvoicesScreen`. Otherwise it shows the form with the picker button and summary.

- [ ] **Step 1: Update InvoiceRouterPage.tsx**

Replace the full contents of `src/pages/InvoiceRouterPage.tsx`:

```typescript
import { useRef, useState } from 'react'
import { useInvoiceContext } from '../context/InvoiceContext'
import AppHeader from '../components/AppHeader'
import ProgressSteps from '../components/ProgressSteps'
import PdfViewer from '../components/PdfViewer'
import LoadingScreen from '../components/LoadingScreen'
import NoInvoicesScreen from '../components/NoInvoicesScreen'
import InvoicePickerButton from '../components/InvoicePickerButton'
import InvoiceSummary from '../components/InvoiceSummary'
import InvoicePickerModal from '../components/InvoicePickerModal'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
  const { invoices, selectedInvoice, setSelectedInvoice, loading } = useInvoiceContext()
  const [pickerOpen, setPickerOpen] = useState(false)

  const resizerRef = useRef<HTMLDivElement>(null)
  const formPanelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function onResizerMouseDown(e: React.MouseEvent) {
    const startX = e.clientX
    const startW = formPanelRef.current!.offsetWidth
    resizerRef.current!.classList.add('resizing')
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMouseMove(e: MouseEvent) {
      const container = containerRef.current!
      const maxW = container.offsetWidth - 320 - 5
      const newW = Math.min(Math.max(startW + (e.clientX - startX), 320), maxW)
      formPanelRef.current!.style.flex = 'none'
      formPanelRef.current!.style.width = newW + 'px'
    }

    function onMouseUp() {
      resizerRef.current?.classList.remove('resizing')
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    e.preventDefault()
  }

  if (loading) return <LoadingScreen />
  if (invoices.length === 0) return <NoInvoicesScreen />

  return (
    <>
      <div className="invoice-router-page" ref={containerRef}>
        <section className="form-panel" ref={formPanelRef}>
          <AppHeader />
          <ProgressSteps activeStep={selectedInvoice ? 2 : 1} />
          <div className="form-section">
            <div className="form-section-title">Invoice</div>
            <InvoicePickerButton
              selectedInvoice={selectedInvoice}
              onClick={() => setPickerOpen(true)}
            />
            <InvoiceSummary selectedInvoice={selectedInvoice} />
          </div>
        </section>
        <div
          className="panel-resizer"
          ref={resizerRef}
          onMouseDown={onResizerMouseDown}
        />
        <section className="invoice-panel">
          <PdfViewer pdfBase64={null} />
        </section>
      </div>
      <InvoicePickerModal
        isOpen={pickerOpen}
        invoices={invoices}
        selectedId={selectedInvoice?.id}
        onSelect={setSelectedInvoice}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}
```

- [ ] **Step 2: Update InvoiceRouterPage test**

Replace `src/pages/InvoiceRouterPage.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import InvoiceRouterPage from './InvoiceRouterPage'
import { AuthProvider } from '../context/AuthContext'
import { InvoiceProvider } from '../context/InvoiceContext'
import type { ReactNode } from 'react'

const mockUser = {
  identityProvider: 'aad', userId: 'abc', userDetails: 'kyle@example.com',
  userRoles: ['authenticated'], claims: [],
}

function Wrapper({ children }: { children: ReactNode }) {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (String(url).includes('auth/me')) {
      return Promise.resolve(new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 }))
    }
    return Promise.resolve(new Response(JSON.stringify({ Invoiced: [
      { ID: '1', Title: 'INV-001', Vendor: 'Acme', CurrencyCode: 'GBP', Entity: { Value: 'UKLS' } }
    ] }), { status: 200 }))
  })
  return (
    <MemoryRouter>
      <AuthProvider>
        <InvoiceProvider>{children}</InvoiceProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('InvoiceRouterPage', () => {
  it('shows loading screen while invoices are loading', () => {
    render(<InvoiceRouterPage />, { wrapper: Wrapper })
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument()
  })

  it('shows the invoice picker button after loading', async () => {
    render(<InvoiceRouterPage />, { wrapper: Wrapper })
    await waitFor(() =>
      expect(screen.getByText('Choose an invoice...')).toBeInTheDocument()
    )
  })

  it('renders the app header', async () => {
    render(<InvoiceRouterPage />, { wrapper: Wrapper })
    await waitFor(() =>
      expect(screen.getByText('Invoice Router')).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 3: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 4: Verify in the browser with SWA CLI**

Start both servers and navigate to `http://localhost:4280`. You should see:
- Loading screen briefly while invoices fetch
- Invoice picker button: "Choose an invoice..."
- Clicking the button opens the picker modal with real invoices
- Selecting an invoice updates the button label and shows the summary below it
- Progress steps advance to step 2 once an invoice is selected

- [ ] **Step 5: Commit**

```powershell
git add src/pages/InvoiceRouterPage.tsx src/pages/InvoiceRouterPage.test.tsx
git commit -m "feat: wire invoice loading, picker modal, and summary into InvoiceRouterPage"
```

---

## What's Next

This completes **Slice 3: Invoice Loading**. The next plan will be **Slice 4: Costing Section** — the vendor combobox with confidence scoring, `useCostings` hook, costing card list, and selection summary with running total.
