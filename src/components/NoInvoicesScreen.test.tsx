import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import NoInvoicesScreen from './NoInvoicesScreen'

describe('NoInvoicesScreen', () => {
    it('renders the no invoices message', () => {
        render(<NoInvoicesScreen />, { wrapper: MemoryRouter })
        expect(screen.getByText('No invoices to process')).toBeInTheDocument()
    })

    it('renders a link to the register', () => {
        render(<NoInvoicesScreen />, { wrapper: MemoryRouter })
        expect(screen.getByRole('link', { name: /go to register/i })).toBeInTheDocument()
    })
})