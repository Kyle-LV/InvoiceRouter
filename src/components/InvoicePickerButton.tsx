import type { Invoice } from '../types/invoice'

interface InvoicePickerButtonProps {
    selectedInvoice: Invoice | null
    onClick: () => void
}

export default function InvoicePickerButton({ selectedInvoice, onClick }: InvoicePickerButtonProps) {
    return (
        <button
            type="button"
            className={`picker-btn${selectedInvoice ? ' has-value' : ''}`}
            onClick={onClick}
        >
            <span>{selectedInvoice ? selectedInvoice.label : 'Choose an invoice...'}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    )
}