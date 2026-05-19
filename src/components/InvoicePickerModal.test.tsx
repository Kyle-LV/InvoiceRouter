import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import InvoicePickerModal from './InvoicePickerModal'
import type { Invoice } from '../types/invoice'

const invoices: Invoice[] = [
    {
        id: '1', label: 'INV-001', netTotal: 100, grossTotal: 120, vendor: 'Acme Corp',
        currency: 'GBP', poNos: [], jobNos: [], jobInfo: [], entity: 'UKLS', status: null, date: '2024-01-01'
    },
    {
        id: '2', label: 'INV-002', netTotal: 200, grossTotal: 240, vendor: 'Beta Ltd',
        currency: 'GBP', poNos: [], jobNos: [], jobInfo: [], entity: 'NLCT', status: null, date: '2024-02-01'
    },
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