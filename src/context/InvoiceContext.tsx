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

// eslint-disable-next-line react-refresh/only-export-components
export function useInvoiceContext(): InvoiceContextValue {
    const ctx = useContext(InvoiceContext)
    if (!ctx) throw new Error('useInvoiceContext must be used within InvoiceProvider')
    return ctx
}