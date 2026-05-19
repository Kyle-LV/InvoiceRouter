import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import PdfViewer from './PdfViewer'

describe('PdfViewer', () => {
    it('shows placeholder text when no PDF is provided', () => {
        render(<PdfViewer pdfBase64={null} />)
        expect(screen.getByText('Select an invoice to view the PDF.')).toBeInTheDocument()
    })

    it('shows the default zoom level of 150%', () => {
        render(<PdfViewer pdfBase64={null} />)
        expect(screen.getByText('150%')).toBeInTheDocument()
    })

    it('increases zoom when zoom in is clicked', async () => {
        const user = userEvent.setup()
        render(<PdfViewer pdfBase64={null} />)
        await user.click(screen.getByTitle('Zoom in'))
        expect(screen.getByText('175%')).toBeInTheDocument()
    })

    it('decreases zoom when zoom out is clicked', async () => {
        const user = userEvent.setup()
        render(<PdfViewer pdfBase64={null} />)
        await user.click(screen.getByTitle('Zoom out'))
        expect(screen.getByText('125%')).toBeInTheDocument()
    })

    it('does not zoom below 50%', async () => {
        const user = userEvent.setup()
        render(<PdfViewer pdfBase64={null} />)
        for (let i = 0; i < 20; i++) {
            await user.click(screen.getByTitle('Zoom out'))
        }
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('does not zoom above 400%', async () => {
        const user = userEvent.setup()
        render(<PdfViewer pdfBase64={null} />)
        for (let i = 0; i < 20; i++) {
            await user.click(screen.getByTitle('Zoom in'))
        }
        expect(screen.getByText('400%')).toBeInTheDocument()
    })
})