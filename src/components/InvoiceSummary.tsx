import type { Invoice } from '../types/invoice'

interface InvoiceSummaryProps {
    selectedInvoice: Invoice | null
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export default function InvoiceSummary({ selectedInvoice }: InvoiceSummaryProps) {
    if (!selectedInvoice) return null

    const amount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: selectedInvoice.currency || 'EUR',
    }).format(selectedInvoice.netTotal ?? selectedInvoice.grossTotal ?? 0)

    const date = formatDate(selectedInvoice.date)

    return (
        <div className="invoice-summary" style={{ display: 'flex' }}>
            <span className="summary-vendor">{selectedInvoice.vendor}</span>
            {selectedInvoice.vendor && <span className="summary-sep">•</span>}
            <span className="summary-total">{amount}</span>
            {date && <span className="summary-sep">•</span>}
            {date && <span className="summary-date">{date}</span>}
        </div>
    )
}