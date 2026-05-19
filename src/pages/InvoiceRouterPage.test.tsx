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