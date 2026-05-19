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
    userDetails: 'kyle.williams@lv-logistics.com',
    userRoles: ['authenticated'],
    claims: []
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