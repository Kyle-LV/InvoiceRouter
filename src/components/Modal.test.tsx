import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
    it('renders nothing when not open', () => {
        render(
            <Modal isOpen={false} title="Test" onClose={() => { }}>
                <p>body content</p>
            </Modal>
        )
        expect(screen.queryByText('Test')).not.toBeInTheDocument()
    })

    it('renders title and children when open', () => {
        render(
            <Modal isOpen={true} title="Select Invoice" onClose={() => { }}>
                <p>body content</p>
            </Modal>
        )
        expect(screen.getByText('Select Invoice')).toBeInTheDocument()
        expect(screen.getByText('body content')).toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        render(
            <Modal isOpen={true} title="Test" onClose={onClose}>
                <p>content</p>
            </Modal>
        )
        await user.click(screen.getByRole('button', { name: /close/i }))
        expect(onClose).toHaveBeenCalledOnce()
    })
})