import type { ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
    maxWidth?: number
}

export default function Modal({ isOpen, title, onClose, children, footer, maxWidth = 720 }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-content" style={{ maxWidth }}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    )
}