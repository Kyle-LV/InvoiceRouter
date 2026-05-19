import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import InvoiceRouterPage from './InvoiceRouterPage'
import { AuthProvider } from '../context/AuthContext'
import { InvoiceContext, InvoiceProvider } from '../context/InvoiceContext'
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
        return Promise.resolve(new Response(JSON.stringify({
            Invoiced: [
                { ID: '1', Title: 'INV-001', Vendor: 'Acme', CurrencyCode: 'GBP', Entity: { Value: 'UKLS' } }
            ]
        }), { status: 200 }))
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
        render(
            <MemoryRouter>
                <InvoiceContext.Provider value={{
                    invoices: [], loading:
                        true, error: null, selectedInvoice: null, setSelectedInvoice: vi.fn()
                }}>
                    <InvoiceRouterPage />
                </InvoiceContext.Provider>
            </MemoryRouter>
        )
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