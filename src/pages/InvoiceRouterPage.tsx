import { useRef, useState } from 'react'
import { useInvoiceContext } from '../context/InvoiceContext'
import AppHeader from '../components/AppHeader'
import ProgressSteps from '../components/ProgressSteps'
import PdfViewer from '../components/PdfViewer'
import LoadingScreen from '../components/LoadingScreen'
import NoInvoicesScreen from '../components/NoInvoicesScreen'
import InvoicePickerButton from '../components/InvoicePickerButton'
import InvoiceSummary from '../components/InvoiceSummary'
import InvoicePickerModal from '../components/InvoicePickerModal'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
    const { invoices, selectedInvoice, setSelectedInvoice, loading } = useInvoiceContext()
    const [pickerOpen, setPickerOpen] = useState(false)

    const resizerRef = useRef<HTMLDivElement>(null)
    const formPanelRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    function onResizerMouseDown(e: React.MouseEvent) {
        const startX = e.clientX
        const startW = formPanelRef.current!.offsetWidth
        resizerRef.current!.classList.add('resizing')
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        function onMouseMove(e: MouseEvent) {
            const container = containerRef.current!
            const maxW = container.offsetWidth - 320 - 5
            const newW = Math.min(Math.max(startW + (e.clientX - startX), 320), maxW)
            formPanelRef.current!.style.flex = 'none'
            formPanelRef.current!.style.width = newW + 'px'
        }

        function onMouseUp() {
            resizerRef.current?.classList.remove('resizing')
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        e.preventDefault()
    }

    if (loading) return <LoadingScreen />
    if (invoices.length === 0) return <NoInvoicesScreen />

    return (
        <>
            <div className="invoice-router-page" ref={containerRef}>
                <section className="form-panel" ref={formPanelRef}>
                    <AppHeader />
                    <ProgressSteps activeStep={selectedInvoice ? 2 : 1} />
                    <div className="form-section">
                        <div className="form-section-title">Invoice</div>
                        <InvoicePickerButton
                            selectedInvoice={selectedInvoice}
                            onClick={() => setPickerOpen(true)}
                        />
                        <InvoiceSummary selectedInvoice={selectedInvoice} />
                    </div>
                </section>
                <div
                    className="panel-resizer"
                    ref={resizerRef}
                    onMouseDown={onResizerMouseDown}
                />
                <section className="invoice-panel">
                    <PdfViewer pdfBase64={null} />
                </section>
            </div>
            <InvoicePickerModal
                isOpen={pickerOpen}
                invoices={invoices}
                selectedId={selectedInvoice?.id}
                onSelect={setSelectedInvoice}
                onClose={() => setPickerOpen(false)}
            />
        </>
    )
}