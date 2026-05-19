import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from './context/AuthContext'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'
import type { ReactNode } from 'react'
import { InvoiceProvider } from './context/InvoiceContext'

const mockUser = {
    identityProvider: 'aad',
    userId: 'abc123',
    userDetails: 'kyle.williams@lv-logistics.com',
    userRoles: ['authenticated'],
    claims: []
}

function withAuth(ui: ReactNode) {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
        if (String(url).includes('auth/me')) {
            return Promise.resolve(new Response(JSON.stringify({
                clientPrincipal: mockUser
            }), { status: 200 }))
        }
        return Promise.resolve(new Response(JSON.stringify({
            Invoiced: [
                {
                    ID: '1', Title: 'INV-001', Vendor: 'Acme', CurrencyCode: 'GBP',
                    Entity: { Value: 'UKLS' }
                }
            ]
        }), { status: 200 }))
    })
    return render(
        <MemoryRouter>
            <AuthProvider>
                <InvoiceProvider>{ui}</InvoiceProvider>
            </AuthProvider>
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