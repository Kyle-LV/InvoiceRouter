# Invoice Router — Slice 2: Invoice Router Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the visual shell of the Invoice Router page — two-panel layout with a draggable resizer, AppHeader, ProgressSteps indicator, and PdfViewer with zoom/print/download toolbar. No real invoice data yet.

**Architecture:** `InvoiceRouterPage` owns the two-panel layout and resizer logic via `useRef`. Each visual section is its own component (`AppHeader`, `ProgressSteps`, `PdfViewer`) with its own CSS file. The global `src/index.css` is seeded from the original app's `styles.css` so existing class names work immediately. Component-specific CSS files are created alongside each component but start empty — styles migrate there gradually as the app grows.

**Tech Stack:** React 18, TypeScript, React Router (Link), pdfjs-dist, CSS

---

## File Map

| File | Purpose |
|---|---|
| `src/index.css` | Global styles — seeded from original `styles.css` |
| `src/pages/InvoiceRouterPage.tsx` | Two-panel layout with draggable resizer |
| `src/pages/InvoiceRouterPage.css` | Layout wrapper styles not in original CSS |
| `src/pages/InvoiceRouterPage.test.tsx` | Tests for page layout |
| `src/components/AppHeader.tsx` | Logo, title, subtitle, nav link to Register |
| `src/components/AppHeader.css` | Header-specific styles (empty for now) |
| `src/components/AppHeader.test.tsx` | Tests for AppHeader |
| `src/components/ProgressSteps.tsx` | 1 / 2 / 3 step indicator |
| `src/components/ProgressSteps.css` | Step indicator styles (empty for now) |
| `src/components/ProgressSteps.test.tsx` | Tests for ProgressSteps |
| `src/components/PdfViewer.tsx` | PDF display area with zoom/print/select toolbar |
| `src/components/PdfViewer.css` | PDF viewer styles (empty for now) |
| `src/components/PdfViewer.test.tsx` | Tests for PdfViewer toolbar behaviour |

---

### Task 1: Seed global styles from the original app

**Files:**
- Modify: `src/index.css`, `index.html`
- Delete: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`

The original app's `styles.css` has all the class names the components will use. Copying it into `src/index.css` means components can use class names like `form-header`, `progress-steps`, `step`, etc. immediately.

- [ ] **Step 1: Copy the original styles into src/index.css**

Open `C:\Users\KyleWilliams\Documents\GitHub\SOLVPreProcessingVendorInvoiceWebAppRePo\styles.css` and copy its full contents into `src/index.css`, replacing everything that's there.

Then add this line at the very top of `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

- [ ] **Step 2: Remove the Google Fonts links from index.html**

Open `index.html` and remove these three lines — the font is now loaded via CSS instead:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Delete Vite boilerplate files**

```powershell
Remove-Item "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\src\App.css"
Remove-Item "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\src\assets\react.svg"
Remove-Item "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\src\assets\vite.svg"
Remove-Item "C:\Users\KyleWilliams\Documents\GitHub\InvoiceRouter\public\icons.svg"
```

- [ ] **Step 4: Commit**

```powershell
git add src/index.css index.html
git rm src/App.css src/assets/react.svg src/assets/vite.svg public/icons.svg
git commit -m "feat: seed global styles from original app CSS"
```

---

### Task 2: Build the two-panel layout

**Files:**
- Modify: `src/pages/InvoiceRouterPage.tsx`
- Create: `src/pages/InvoiceRouterPage.css`, `src/pages/InvoiceRouterPage.test.tsx`

The page is a horizontal split: form panel on the left, PDF panel on the right, with a draggable 5px resizer between them. The resizer uses `useRef` to access DOM elements and attaches `mousemove`/`mouseup` listeners directly to `window` while dragging.

- [ ] **Step 1: Create the layout CSS**

Create `src/pages/InvoiceRouterPage.css`:

```css
.invoice-router-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.panel-resizer {
  width: 5px;
  cursor: col-resize;
  background: #e2e8f0;
  flex-shrink: 0;
  transition: background 0.15s;
}

.panel-resizer:hover,
.panel-resizer.resizing {
  background: #94a3b8;
}
```

Note: `.form-panel` and `.invoice-panel` styles already exist in `src/index.css` from Task 1.

- [ ] **Step 2: Write the failing test**

Create `src/pages/InvoiceRouterPage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import InvoiceRouterPage from './InvoiceRouterPage'

describe('InvoiceRouterPage', () => {
  it('renders the form panel placeholder', () => {
    render(<InvoiceRouterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('Form panel')).toBeInTheDocument()
  })

  it('renders the PDF panel placeholder', () => {
    render(<InvoiceRouterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('PDF panel')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

```powershell
npm test -- --run src/pages/InvoiceRouterPage.test.tsx
```

Expected: FAIL (the page renders "Invoice Router" not "Form panel")

- [ ] **Step 4: Replace InvoiceRouterPage.tsx with the layout**

Replace the full contents of `src/pages/InvoiceRouterPage.tsx`:

```typescript
import { useRef } from 'react'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
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

  return (
    <div className="invoice-router-page" ref={containerRef}>
      <section className="form-panel" ref={formPanelRef}>
        <p>Form panel</p>
      </section>
      <div
        className="panel-resizer"
        ref={resizerRef}
        onMouseDown={onResizerMouseDown}
      />
      <section className="invoice-panel">
        <p>PDF panel</p>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

```powershell
npm test -- --run src/pages/InvoiceRouterPage.test.tsx
```

Expected: `2 passed`

- [ ] **Step 6: Verify the layout in the browser**

```powershell
npm run dev
```

Navigate to `http://localhost:5173`. You should see two panels side by side with a thin divider you can drag to resize them. Press `Ctrl+C`.

- [ ] **Step 7: Commit**

```powershell
git add src/pages/InvoiceRouterPage.tsx src/pages/InvoiceRouterPage.css src/pages/InvoiceRouterPage.test.tsx
git commit -m "feat: add two-panel layout with draggable resizer"
```

---

### Task 3: Build AppHeader

**Files:**
- Create: `src/components/AppHeader.tsx`, `src/components/AppHeader.css`, `src/components/AppHeader.test.tsx`

The header shows the SOLV logo, the "Invoice Router" title, a subtitle, and a nav link to `/register`. It uses React Router's `Link` instead of a plain `<a>` tag so navigation doesn't do a full page reload.

- [ ] **Step 1: Write the failing tests**

Create `src/components/AppHeader.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import AppHeader from './AppHeader'

describe('AppHeader', () => {
  it('renders the app title', () => {
    render(<AppHeader />, { wrapper: MemoryRouter })
    expect(screen.getByText('Invoice Router')).toBeInTheDocument()
  })

  it('renders the SOLV logo', () => {
    render(<AppHeader />, { wrapper: MemoryRouter })
    expect(screen.getByAltText('SOLV')).toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    render(<AppHeader />, { wrapper: MemoryRouter })
    expect(screen.getByRole('link', { name: /invoice register/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/AppHeader.test.tsx
```

Expected: FAIL with "Cannot find module './AppHeader'"

- [ ] **Step 3: Implement AppHeader**

Create `src/components/AppHeader.tsx`:

```typescript
import { Link } from 'react-router-dom'
import './AppHeader.css'

export default function AppHeader() {
  return (
    <div className="form-header">
      <div className="form-header-left">
        <img
          src="/SOLV_Logo_Black_No_Subtitle.png"
          alt="SOLV"
          className="app-logo"
        />
        <h2>Invoice Router</h2>
        <p className="lead">Select an invoice and match it to an open costing.</p>
      </div>
      <Link to="/register" className="nav-link">
        Invoice Register
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M2.5 6h7M6.5 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Create the CSS file**

Create `src/components/AppHeader.css` with empty contents. The `.form-header`, `.form-header-left`, `.app-logo`, `.nav-link`, and `.lead` styles come from the global `src/index.css`.

- [ ] **Step 5: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/AppHeader.test.tsx
```

Expected: `3 passed`

- [ ] **Step 6: Add AppHeader to InvoiceRouterPage**

Update `src/pages/InvoiceRouterPage.tsx` — import `AppHeader` and replace `<p>Form panel</p>` with it:

```typescript
import { useRef } from 'react'
import AppHeader from '../components/AppHeader'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
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

  return (
    <div className="invoice-router-page" ref={containerRef}>
      <section className="form-panel" ref={formPanelRef}>
        <AppHeader />
      </section>
      <div
        className="panel-resizer"
        ref={resizerRef}
        onMouseDown={onResizerMouseDown}
      />
      <section className="invoice-panel">
        <p>PDF panel</p>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Update InvoiceRouterPage test to match**

Update `src/pages/InvoiceRouterPage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import InvoiceRouterPage from './InvoiceRouterPage'

describe('InvoiceRouterPage', () => {
  it('renders the app header', () => {
    render(<InvoiceRouterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('Invoice Router')).toBeInTheDocument()
  })

  it('renders the PDF panel placeholder', () => {
    render(<InvoiceRouterPage />, { wrapper: MemoryRouter })
    expect(screen.getByText('PDF panel')).toBeInTheDocument()
  })
})
```

- [ ] **Step 8: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 9: Commit**

```powershell
git add src/components/AppHeader.tsx src/components/AppHeader.css src/components/AppHeader.test.tsx src/pages/InvoiceRouterPage.tsx src/pages/InvoiceRouterPage.test.tsx
git commit -m "feat: add AppHeader component"
```

---

### Task 4: Build ProgressSteps

**Files:**
- Create: `src/components/ProgressSteps.tsx`, `src/components/ProgressSteps.css`, `src/components/ProgressSteps.test.tsx`

The progress indicator shows three steps: Invoice → Costing → Process. It receives an `activeStep` prop (1, 2, or 3) and highlights all steps up to and including the active one. The connecting lines also highlight as the user progresses.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ProgressSteps.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressSteps from './ProgressSteps'

describe('ProgressSteps', () => {
  it('renders all three step labels', () => {
    render(<ProgressSteps activeStep={1} />)
    expect(screen.getByText('Invoice')).toBeInTheDocument()
    expect(screen.getByText('Costing')).toBeInTheDocument()
    expect(screen.getByText('Process')).toBeInTheDocument()
  })

  it('marks only step 1 active when activeStep is 1', () => {
    render(<ProgressSteps activeStep={1} />)
    const steps = document.querySelectorAll('.step')
    expect(steps[0]).toHaveClass('active')
    expect(steps[1]).not.toHaveClass('active')
    expect(steps[2]).not.toHaveClass('active')
  })

  it('marks steps 1 and 2 active when activeStep is 2', () => {
    render(<ProgressSteps activeStep={2} />)
    const steps = document.querySelectorAll('.step')
    expect(steps[0]).toHaveClass('active')
    expect(steps[1]).toHaveClass('active')
    expect(steps[2]).not.toHaveClass('active')
  })

  it('marks all steps active when activeStep is 3', () => {
    render(<ProgressSteps activeStep={3} />)
    const steps = document.querySelectorAll('.step')
    expect(steps[0]).toHaveClass('active')
    expect(steps[1]).toHaveClass('active')
    expect(steps[2]).toHaveClass('active')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/ProgressSteps.test.tsx
```

Expected: FAIL with "Cannot find module './ProgressSteps'"

- [ ] **Step 3: Implement ProgressSteps**

Create `src/components/ProgressSteps.tsx`:

```typescript
import './ProgressSteps.css'

interface ProgressStepsProps {
  activeStep: 1 | 2 | 3
}

export default function ProgressSteps({ activeStep }: ProgressStepsProps) {
  return (
    <div className="progress-steps">
      <div className={`step${activeStep >= 1 ? ' active' : ''}`}>
        <div className="step-dot">1</div>
        <div className="step-label">Invoice</div>
      </div>
      <div className={`step-line${activeStep >= 2 ? ' active' : ''}`} />
      <div className={`step${activeStep >= 2 ? ' active' : ''}`}>
        <div className="step-dot">2</div>
        <div className="step-label">Costing</div>
      </div>
      <div className={`step-line${activeStep >= 3 ? ' active' : ''}`} />
      <div className={`step${activeStep >= 3 ? ' active' : ''}`}>
        <div className="step-dot">3</div>
        <div className="step-label">Process</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create the CSS file**

Create `src/components/ProgressSteps.css` with empty contents. The `.progress-steps`, `.step`, `.step-dot`, `.step-label`, and `.step-line` styles come from `src/index.css`.

- [ ] **Step 5: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/ProgressSteps.test.tsx
```

Expected: `4 passed`

- [ ] **Step 6: Add ProgressSteps to InvoiceRouterPage**

Update `src/pages/InvoiceRouterPage.tsx` — add the import and render `<ProgressSteps activeStep={1} />` below `<AppHeader />`:

```typescript
import { useRef } from 'react'
import AppHeader from '../components/AppHeader'
import ProgressSteps from '../components/ProgressSteps'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
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

  return (
    <div className="invoice-router-page" ref={containerRef}>
      <section className="form-panel" ref={formPanelRef}>
        <AppHeader />
        <ProgressSteps activeStep={1} />
      </section>
      <div
        className="panel-resizer"
        ref={resizerRef}
        onMouseDown={onResizerMouseDown}
      />
      <section className="invoice-panel">
        <p>PDF panel</p>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 8: Commit**

```powershell
git add src/components/ProgressSteps.tsx src/components/ProgressSteps.css src/components/ProgressSteps.test.tsx src/pages/InvoiceRouterPage.tsx
git commit -m "feat: add ProgressSteps component"
```

---

### Task 5: Build PdfViewer

**Files:**
- Create: `src/components/PdfViewer.tsx`, `src/components/PdfViewer.css`, `src/components/PdfViewer.test.tsx`

The PDF viewer has a toolbar with zoom in/out (clamped between 50% and 400%), a zoom percentage display, print, text selection toggle, download, and fit-to-width buttons. It accepts a `pdfBase64` prop — when `null`, it shows a placeholder message. Actual PDF rendering will be wired up in Slice 3.

- [ ] **Step 1: Install pdfjs-dist**

```powershell
npm install pdfjs-dist
```

- [ ] **Step 2: Write the failing tests**

Create `src/components/PdfViewer.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import PdfViewer from './PdfViewer'

describe('PdfViewer', () => {
  it('shows placeholder text when no PDF is provided', () => {
    render(<PdfViewer pdfBase64={null} />)
    expect(screen.getByText('Select an invoice to view the PDF.')).toBeInTheDocument()
  })

  it('shows the default zoom level of 150%', () => {
    render(<PdfViewer pdfBase64={null} />)
    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('increases zoom when zoom in is clicked', async () => {
    const user = userEvent.setup()
    render(<PdfViewer pdfBase64={null} />)
    await user.click(screen.getByTitle('Zoom in'))
    expect(screen.getByText('175%')).toBeInTheDocument()
  })

  it('decreases zoom when zoom out is clicked', async () => {
    const user = userEvent.setup()
    render(<PdfViewer pdfBase64={null} />)
    await user.click(screen.getByTitle('Zoom out'))
    expect(screen.getByText('125%')).toBeInTheDocument()
  })

  it('does not zoom below 50%', async () => {
    const user = userEvent.setup()
    render(<PdfViewer pdfBase64={null} />)
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByTitle('Zoom out'))
    }
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('does not zoom above 400%', async () => {
    const user = userEvent.setup()
    render(<PdfViewer pdfBase64={null} />)
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByTitle('Zoom in'))
    }
    expect(screen.getByText('400%')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```powershell
npm test -- --run src/components/PdfViewer.test.tsx
```

Expected: FAIL with "Cannot find module './PdfViewer'"

- [ ] **Step 4: Implement PdfViewer**

Create `src/components/PdfViewer.tsx`:

```typescript
import { useState } from 'react'
import './PdfViewer.css'

const PDF_SCALE_MIN = 0.5
const PDF_SCALE_MAX = 4.0
const PDF_SCALE_STEP = 0.25

interface PdfViewerProps {
  pdfBase64: string | null
}

export default function PdfViewer({ pdfBase64 }: PdfViewerProps) {
  const [scale, setScale] = useState(1.5)
  const [selectMode, setSelectMode] = useState(false)

  function zoomIn() {
    setScale((s) => Math.min(s + PDF_SCALE_STEP, PDF_SCALE_MAX))
  }

  function zoomOut() {
    setScale((s) => Math.max(s - PDF_SCALE_STEP, PDF_SCALE_MIN))
  }

  return (
    <div id="pdfViewerWrap">
      <div id="pdfToolbar">
        <button className="pdf-zoom-btn" onClick={zoomOut} title="Zoom out">
          &#8722;
        </button>
        <span id="pdfZoomLevel">{Math.round(scale * 100)}%</span>
        <button className="pdf-zoom-btn" onClick={zoomIn} title="Zoom in">
          &#43;
        </button>
        <span className="pdf-toolbar-sep" />
        <button className="pdf-zoom-btn" onClick={() => window.print()} title="Print">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </button>
        <button
          className={`pdf-zoom-btn${selectMode ? ' active' : ''}`}
          onClick={() => setSelectMode((m) => !m)}
          title="Select text"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="8" y1="3" x2="16" y2="3" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </button>
        <button className="pdf-zoom-btn" title="Download">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button className="pdf-zoom-btn" title="Fit to width">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
      <div id="pdfScrollContainer">
        <div id="pdfPagesInner">
          {!pdfBase64 && (
            <p className="pdf-placeholder">Select an invoice to view the PDF.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create the CSS file**

Create `src/components/PdfViewer.css` with empty contents. The `#pdfViewerWrap`, `#pdfToolbar`, `.pdf-zoom-btn`, `#pdfScrollContainer` styles come from `src/index.css`.

- [ ] **Step 6: Run the tests to verify they pass**

```powershell
npm test -- --run src/components/PdfViewer.test.tsx
```

Expected: `6 passed`

- [ ] **Step 7: Add PdfViewer to InvoiceRouterPage**

Update `src/pages/InvoiceRouterPage.tsx` — replace `<p>PDF panel</p>` with `<PdfViewer pdfBase64={null} />`:

```typescript
import { useRef } from 'react'
import AppHeader from '../components/AppHeader'
import ProgressSteps from '../components/ProgressSteps'
import PdfViewer from '../components/PdfViewer'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
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

  return (
    <div className="invoice-router-page" ref={containerRef}>
      <section className="form-panel" ref={formPanelRef}>
        <AppHeader />
        <ProgressSteps activeStep={1} />
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
  )
}
```

- [ ] **Step 8: Run all tests**

```powershell
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 9: Verify the full shell in the browser**

```powershell
npm run dev
```

Navigate to `http://localhost:5173`. You should see:
- Left panel: SOLV logo, "Invoice Router" heading, 1/2/3 step indicator
- Right panel: PDF toolbar with zoom controls and action buttons, placeholder text below

Press `Ctrl+C`.

- [ ] **Step 10: Commit**

```powershell
git add src/components/PdfViewer.tsx src/components/PdfViewer.css src/components/PdfViewer.test.tsx src/pages/InvoiceRouterPage.tsx package.json package-lock.json
git commit -m "feat: add PdfViewer component with zoom toolbar"
```

---

## What's Next

This completes **Slice 2: Invoice Router Shell**. The next plan will be **Slice 3: Invoice Loading** — the `useInvoices` hook, `InvoicePickerModal` with search and sort, invoice summary display, and the loading screen.
