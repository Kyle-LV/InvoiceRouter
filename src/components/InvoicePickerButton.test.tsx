import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InvoicePickerButton from './InvoicePickerButton'
import InvoiceSummary from './InvoiceSummary'
import type { Invoice } from '../types/invoice'

const mockInvoice: Invoice = {
    id: '1', label: 'INV-001', netTotal: 1500, grossTotal: 1800,
    vendor: 'Acme Corp', currency: 'GBP', poNos: [], jobNos: [],
    jobInfo: [], entity: 'UKLS', status: null, date: '2024-01-15',
}

describe('InvoicePickerButton', () => {
    it('renders the placeholder text when no invoice is selected', () => {
        render(<InvoicePickerButton selectedInvoice={null} onClick={vi.fn()} />)
        expect(screen.getByText('Choose an invoice...')).toBeInTheDocument()
    })

    it('renders the selected invoice label', () => {
        render(<InvoicePickerButton selectedInvoice={mockInvoice} onClick={vi.fn()} />)
        expect(screen.getByText('INV-001')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup()
        const onClick = vi.fn()
        render(<InvoicePickerButton selectedInvoice={null} onClick={onClick} />)
        await user.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalledOnce()
    })
})

describe('InvoiceSummary', () => {
    it('renders nothing when no invoice is selected', () => {
        const { container } = render(<InvoiceSummary selectedInvoice={null} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders vendor and formatted total', () => {
        render(<InvoiceSummary selectedInvoice={mockInvoice} />)
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
        expect(screen.getByText('£1,500.00')).toBeInTheDocument()
    })
})