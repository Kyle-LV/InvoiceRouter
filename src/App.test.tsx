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