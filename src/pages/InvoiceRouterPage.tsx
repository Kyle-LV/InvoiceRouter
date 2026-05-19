import { useRef } from 'react'
import './InvoiceRouterPage.css'

export default function InvoiceRouterPage() {
    const resizerRef = useRef<HTMLDivElement>(null)
    const formPanelRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    function onResizerMouseDown(e: React.MouseEvent) {
        const startX = e.clientX;
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
        e.preventDefault();
    }

    return (
        <div className="invoice-router-page" ref={containerRef}>
            <section className="form-panel" ref={formPanelRef}>
                <p>Form panel</p>
            </section>
            <div className="panel-resizer" ref={resizerRef} onMouseDown={onResizerMouseDown} />
            <section className="invoice-panel">
                <p>PDF panel</p>
            </section>
        </div>
    )
}