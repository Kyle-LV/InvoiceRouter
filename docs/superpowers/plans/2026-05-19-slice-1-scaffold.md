# Invoice Router — Slice 1: Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a Vite + React + TypeScript project in the InvoiceRouter repo, set up React Router with two empty page shells, wire up Azure Static Web Apps authentication, and confirm the app loads and authenticates locally.

**Architecture:** Vite handles the build tooling. React Router provides client-side routing between the two pages. Azure SWA's built-in auth is consumed via a `useAuth` hook that fetches `/.auth/me` — no MSAL library code needed in the app itself. An `AuthContext` makes the current user available throughout the component tree without prop-drilling.

**Tech Stack:** React 18, TypeScript, Vite, React Router v6, Vitest, React Testing Library, Azure Static Web Apps CLI (for local auth emulation)

---

## File Map

| File | Purpose |
|---|---|
| `package.json` | Project dependencies and scripts |
| `vite.config.ts` | Vite + Vitest configuration |
| `tsconfig.json` | TypeScript config |
| `index.html` | Vite entry HTML |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Root component: BrowserRouter + AuthProvider + routes |
| `src/index.css` | Global styles placeholder |
| `src/test/setup.ts` | Vitest + jsdom setup |
| `src/types/auth.ts` | TypeScript types for Azure SWA auth response |
| `src/hooks/useAuth.ts` | Hook: fetches `/.auth/me`, returns user + loading |
| `src/hooks/useAuth.test.ts` | Tests for useAuth |
| `src/context/AuthContext.tsx` | Context + provider exposing current user |
| `src/context/AuthContext.test.tsx` | Tests for AuthContext |
| `src/pages/InvoiceRouterPage.tsx` | Empty Invoice Router page shell |
| `src/pages/InvoiceRegisterPage.tsx` | Empty Invoice Register page shell |
| `src/App.test.tsx` | Smoke tests for routing |
| `swa-cli.config.json` | SWA CLI config for local auth emulation |
| `public/favicon.ico` | Copied from original app |
| `public/SOLV_Logo_Black_No_Subtitle.png` | Copied from original app |

---

### Task 1: Initialize the Vite project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Run Vite scaffolder**

From `C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter` in PowerShell:

```powershell
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — select **Ignore files and continue**. Vite will scaffold around the existing `README.md`.

- [ ] **Step 2: Install dependencies**

```powershell
npm install
```

- [ ] **Step 3: Verify the dev server starts**

```powershell
npm run dev
```

Expected: terminal shows `Local: http://localhost:5173/` and the browser shows the default Vite + React page. Press `Ctrl+C` to stop.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/ public/ .gitignore eslint.config.js
git commit -m "feat: initialize Vite + React + TypeScript scaffold"
```

---

### Task 2: Install and configure testing

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install test dependencies**

```powershell
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Update vite.config.ts to include test config**

Replace the full contents of `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 3: Create the test setup file**

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test scripts to package.json**

Open `package.json` and add these two lines to the `"scripts"` section:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 5: Write a smoke test**

Create `src/App.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })
})
```

- [ ] **Step 6: Run the test to verify it passes**

```powershell
npm test -- --run
```

Expected output includes: `1 passed`

- [ ] **Step 7: Commit**

```powershell
git add vite.config.ts src/test/setup.ts src/App.test.tsx package.json package-lock.json
git commit -m "feat: add Vitest + React Testing Library"
```

---

### Task 3: Install React Router and create page shells

**Files:**
- Create: `src/pages/InvoiceRouterPage.tsx`, `src/pages/InvoiceRegisterPage.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Install React Router**

```powershell
npm install react-router-dom
```

- [ ] **Step 2: Create the Invoice Router page shell**

Create `src/pages/InvoiceRouterPage.tsx`:

```typescript
export default function InvoiceRouterPage() {
  return (
    <div>
      <h1>Invoice Router</h1>
      <p>Coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 3: Create the Invoice Register page shell**

Create `src/pages/InvoiceRegisterPage.tsx`:

```typescript
export default function InvoiceRegisterPage() {
  return (
    <div>
      <h1>Invoice Register</h1>
      <p>Coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 4: Replace App.tsx with the router setup**

Replace the full contents of `src/App.tsx` with:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvoiceRouterPage />} />
        <Route path="/register" element={<InvoiceRegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Write tests for both page shells**

Replace `src/App.test.tsx` with:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

describe('InvoiceRouterPage', () => {
  it('renders the heading', () => {
    render(<InvoiceRouterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('Invoice Router')).toBeInTheDocument()
  })
})

describe('InvoiceRegisterPage', () => {
  it('renders the heading', () => {
    render(<InvoiceRegisterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('Invoice Register')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run tests**

```powershell
npm test -- --run
```

Expected: `2 passed`

- [ ] **Step 7: Verify both routes work in the browser**

```powershell
npm run dev
```

Navigate to `http://localhost:5173/` — should show "Invoice Router".
Navigate to `http://localhost:5173/register` — should show "Invoice Register".
Press `Ctrl+C` to stop.

- [ ] **Step 8: Commit**

```powershell
git add src/App.tsx src/App.test.tsx src/pages/InvoiceRouterPage.tsx src/pages/InvoiceRegisterPage.tsx package.json package-lock.json
git commit -m "feat: add React Router with page shells for Invoice Router and Invoice Register"
```

---

### Task 4: Define auth types

**Files:**
- Create: `src/types/auth.ts`

Azure Static Web Apps exposes the current user at `/.auth/me`. The shape below matches the actual response.

- [ ] **Step 1: Create the auth types file**

Create `src/types/auth.ts`:

```typescript
export interface ClientPrincipalClaim {
  typ: string
  val: string
}

export interface ClientPrincipal {
  identityProvider: string
  userId: string
  userDetails: string
  userRoles: string[]
  claims: ClientPrincipalClaim[]
}

export interface AuthMeResponse {
  clientPrincipal: ClientPrincipal | null
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/types/auth.ts
git commit -m "feat: add TypeScript types for Azure SWA auth"
```

---

### Task 5: Create the useAuth hook

**Files:**
- Create: `src/hooks/useAuth.ts`, `src/hooks/useAuth.test.ts`

This hook fetches `/.auth/me` once on mount and returns the current user plus a loading flag. The `[]` dependency array in `useEffect` means it only runs once — when the component first mounts.

- [ ] **Step 1: Write the failing tests first**

Create `src/hooks/useAuth.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns loading true initially', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
    )
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
  })

  it('returns the user after fetch resolves', async () => {
    const mockUser = {
      identityProvider: 'aad',
      userId: 'abc123',
      userDetails: 'kyle@example.com',
      userRoles: ['authenticated'],
      claims: [],
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 })
    )
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(mockUser)
  })

  it('returns null user when not authenticated', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
    )
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/hooks/useAuth.test.ts
```

Expected: FAIL with "Cannot find module './useAuth'"

- [ ] **Step 3: Implement the useAuth hook**

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react'
import type { ClientPrincipal, AuthMeResponse } from '../types/auth'

interface UseAuthResult {
  user: ClientPrincipal | null
  loading: boolean
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<ClientPrincipal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/.auth/me')
      .then((res) => res.json() as Promise<AuthMeResponse>)
      .then((data) => setUser(data.clientPrincipal))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```powershell
npm test -- --run src/hooks/useAuth.test.ts
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```powershell
git add src/hooks/useAuth.ts src/hooks/useAuth.test.ts
git commit -m "feat: add useAuth hook to fetch Azure SWA current user"
```

---

### Task 6: Create AuthContext

**Files:**
- Create: `src/context/AuthContext.tsx`, `src/context/AuthContext.test.tsx`

`AuthContext` wraps `useAuth` in a React context so any component can call `useAuthContext()` to get the current user — without receiving it as a prop.

- [ ] **Step 1: Write the failing tests**

Create `src/context/AuthContext.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuthContext } from './AuthContext'

function TestConsumer() {
  const { user, loading } = useAuthContext()
  if (loading) return <div>loading</div>
  return <div>{user ? user.userDetails : 'not logged in'}</div>
}

describe('AuthContext', () => {
  it('provides loading state initially', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
    )
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('provides user details after auth resolves', async () => {
    const mockUser = {
      identityProvider: 'aad',
      userId: 'abc123',
      userDetails: 'kyle@example.com',
      userRoles: ['authenticated'],
      claims: [],
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 })
    )
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('kyle@example.com')).toBeInTheDocument()
    )
  })

  it('shows not logged in when unauthenticated', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
    )
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('not logged in')).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test -- --run src/context/AuthContext.test.tsx
```

Expected: FAIL with "Cannot find module './AuthContext'"

- [ ] **Step 3: Implement AuthContext**

Create `src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { ClientPrincipal } from '../types/auth'

interface AuthContextValue {
  user: ClientPrincipal | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test -- --run src/context/AuthContext.test.tsx
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```powershell
git add src/context/AuthContext.tsx src/context/AuthContext.test.tsx
git commit -m "feat: add AuthContext and AuthProvider"
```

---

### Task 7: Wire AuthProvider into App and add auth guard

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`

If the user is not logged in, redirect them to the Azure SWA login page. If auth is still loading, show a loading screen. Otherwise render the routes.

- [ ] **Step 1: Replace App.tsx**

Replace the full contents of `src/App.tsx` with:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    window.location.href = '/.auth/login/aad'
    return null
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<InvoiceRouterPage />} />
            <Route path="/register" element={<InvoiceRegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Update App.test.tsx**

Replace the full contents of `src/App.test.tsx` with:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from './context/AuthContext'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'
import type { ReactNode } from 'react'

const mockUser = {
  identityProvider: 'aad',
  userId: 'abc123',
  userDetails: 'kyle@example.com',
  userRoles: ['authenticated'],
  claims: [],
}

function withAuth(ui: ReactNode) {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 })
  )
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}

describe('InvoiceRouterPage', () => {
  it('renders the heading', async () => {
    withAuth(<InvoiceRouterPage />)
    await waitFor(() =>
      expect(screen.getByText('Invoice Router')).toBeInTheDocument()
    )
  })
})

describe('InvoiceRegisterPage', () => {
  it('renders the heading', async () => {
    withAuth(<InvoiceRegisterPage />)
    await waitFor(() =>
      expect(screen.getByText('Invoice Register')).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 3: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```powershell
git add src/App.tsx src/App.test.tsx
git commit -m "feat: add AuthGuard — redirect to login if unauthenticated"
```

---

### Task 8: Set up SWA CLI for local development with auth

**Files:**
- Create: `swa-cli.config.json`
- Modify: `package.json`

The SWA CLI emulates Azure Static Web Apps locally, including the `/.auth/me` endpoint, so you can test auth without deploying.

- [ ] **Step 1: Install the SWA CLI globally**

```powershell
npm install -g @azure/static-web-apps-cli
```

- [ ] **Step 2: Create the SWA CLI config**

Create `swa-cli.config.json` in the project root:

```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "invoice-router": {
      "appLocation": ".",
      "outputLocation": "dist",
      "appDevserverUrl": "http://localhost:5173",
      "apiLocation": "api"
    }
  }
}
```

- [ ] **Step 3: Add a dev:swa script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"dev:swa": "swa start --config-name invoice-router"
```

- [ ] **Step 4: Test auth locally**

Open two PowerShell terminals.

Terminal 1 — start Vite:
```powershell
npm run dev
```

Terminal 2 — start SWA CLI:
```powershell
npm run dev:swa
```

Navigate to `http://localhost:4280` (the SWA CLI port, not 5173).

The app will redirect to `/.auth/login/aad`. The SWA CLI shows a local login emulator — enter any email and name. After submitting, you should land on the Invoice Router page showing "Invoice Router".

- [ ] **Step 5: Commit**

```powershell
git add swa-cli.config.json package.json package-lock.json
git commit -m "feat: add SWA CLI config for local auth emulation"
```

---

### Task 9: Copy static assets from original app

**Files:**
- Create: `public/favicon.ico`, `public/SOLV_Logo_Black_No_Subtitle.png`

- [ ] **Step 1: Copy the assets**

```powershell
Copy-Item "C:\Users\KyleWilliams\Documents\GitHub\SOLVPreProcessingVendorInvoiceWebAppRePo\favicon.ico" -Destination "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\public\favicon.ico" -Force
Copy-Item "C:\Users\KyleWilliams\Documents\GitHub\SOLVPreProcessingVendorInvoiceWebAppRePo\SOLV_Logo_Black_No_Subtitle.png" -Destination "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\public\SOLV_Logo_Black_No_Subtitle.png" -Force
```

- [ ] **Step 2: Commit**

```powershell
git add public/favicon.ico public/SOLV_Logo_Black_No_Subtitle.png
git commit -m "feat: copy static assets (logo and favicon) from original app"
```

---

## What's Next

This completes **Slice 1: Scaffold**. The next plan will be **Slice 2: Invoice Router Shell** — building the two-panel layout, `AppHeader`, `ProgressSteps`, and `PdfViewer` with its zoom/print/download toolbar.
