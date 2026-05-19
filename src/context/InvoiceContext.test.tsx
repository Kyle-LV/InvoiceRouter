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
        return Promise.resolve(new Response(JSON.stringify({
            Invoiced: [
                { ID: '1', Title: 'INV-001', Vendor: 'Acme', CurrencyCode: 'GBP', Entity: { Value: 'UKLS' } }
            ]
        }), { status: 200 }))
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