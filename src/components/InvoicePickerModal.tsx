import { useState, useMemo } from 'react'
import Modal from './Modal'
import { sortInvoices } from '../utils/invoiceSort'
import type { Invoice, SortKey } from '../types/invoice'
import './InvoicePickerModal.css'

interface InvoicePickerModalProps {
    isOpen: boolean
    invoices: Invoice[]
    selectedId?: string
    onSelect: (invoice: Invoice) => void
    onClose: () => void
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function formatAmount(invoice: Invoice): string | null {
    const amount = invoice.netTotal ?? invoice.grossTotal
    if (amount == null) return null
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: invoice.currency || 'EUR' }).format(amount)
}

export default function InvoicePickerModal({ isOpen, invoices, selectedId, onSelect, onClose }: InvoicePickerModalProps) {
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<SortKey>('oldest')

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        const sorted = sortInvoices(invoices, sort)
        if (!term) return sorted
        return sorted.filter((inv) =>
            [inv.label, inv.vendor, inv.entity, formatAmount(inv), ...inv.jobNos]
                .filter(Boolean).join(' ').toLowerCase().includes(term)
        )
    }, [invoices, search, sort])

    const footer = (
        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
    )

    return (
        <Modal isOpen={isOpen} title="Select Invoice" onClose={onClose} footer={footer}>
            <div className="modal-search">
                <svg className="invoice-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="5.5" cy="5.5" r="4" stroke="#94a3b8" strokeWidth="1.5" />
                    <path d="M9 9L12 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    className="invoice-search-input"
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    aria-label="Search invoices"
                    autoFocus
                />
                <select
                    className="invoice-sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort invoices"
                >
                    <option value="oldest">Oldest first</option>
                    <option value="newest">Newest first</option>
                    <option value="az">Vendor A-Z</option>
                    <option value="za">Vendor Z-A</option>
                    <option value="entity">LV Entity</option>
                </select>
            </div>
            <div className="invoice-search-count">
                {search
                    ? `Showing ${filtered.length} of ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
                    : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
                }
            </div>
            <div className="invoice-list">
                {filtered.length === 0 ? (
                    <div className="no-invoices">No invoices match your search</div>
                ) : (
                    filtered.map((invoice) => {
                        const amount = formatAmount(invoice)
                        const date = formatDate(invoice.date)
                        const meta = [invoice.vendor, date].filter(Boolean).join(' · ')
                        return (
                            <div
                                key={invoice.id}
                                className={`invoice-item${invoice.id === selectedId ? ' active' : ''}`}
                                onClick={() => { onSelect(invoice); onClose() }}
                            >
                                <div className="invoice-row-top">
                                    <span className="invoice-row-title">{invoice.label}</span>
                                    {invoice.entity && (
                                        <span className="entity-badge">{invoice.entity}</span>
                                    )}
                                    {amount && <span className="invoice-row-amount">{amount}</span>}
                                </div>
                                {meta && (
                                    <div className="invoice-row-bottom">
                                        <span className="invoice-row-meta">{meta}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </Modal>
    )
}