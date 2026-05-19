import { useState } from 'react'
import './PdfViewer.css'

const PDF_SCALE_MIN = 0.5
const PDF_SCALE_MAX = 4.0
const PDF_SCALE_STEP = 0.25

interface PdfViewerProps {
    pdfBase64: string | null
}

export default function PdfViewer({ pdfBase64 }: PdfViewerProps) {
    const [scale, setScale] = useState(1.5)
    const [selectMode, setSelectMode] = useState(false)

    function zoomIn() {
        setScale((s) => Math.min(s + PDF_SCALE_STEP, PDF_SCALE_MAX))
    }

    function zoomOut() {
        setScale((s) => Math.max(s - PDF_SCALE_STEP, PDF_SCALE_MIN))
    }

    return (
        <div id="pdfViewerWrap">
            <div id="pdfToolbar">
                <button className="pdf-zoom-btn" onClick={zoomOut} title="Zoom out">
                    &#8722;
                </button>
                <span id="pdfZoomLevel">{Math.round(scale * 100)}%</span>
                <button className="pdf-zoom-btn" onClick={zoomIn} title="Zoom in">
                    &#43;
                </button>
                <span className="pdf-toolbar-sep" />
                <button className="pdf-zoom-btn" onClick={() => window.print()} title="Print">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                </button>
                <button
                    className={`pdf-zoom-btn${selectMode ? ' active' : ''}`}
                    onClick={() => setSelectMode((m) => !m)}
                    title="Select text"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="3" x2="12" y2="21" />
                        <line x1="8" y1="3" x2="16" y2="3" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                    </svg>
                </button>
                <button className="pdf-zoom-btn" title="Download">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
                <button className="pdf-zoom-btn" title="Fit to width">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>
            </div>
            <div id="pdfScrollContainer">
                <div id="pdfPagesInner">
                    {!pdfBase64 && (
                        <p className="pdf-placeholder">Select an invoice to view the PDF.</p>
                    )}
                </div>
            </div>
        </div>
    )
}