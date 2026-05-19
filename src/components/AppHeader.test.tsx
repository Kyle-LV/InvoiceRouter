import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import AppHeader from './AppHeader'

describe('AppHeader', () => {
    it('renders the app title', () => {
        render(<AppHeader />, { wrapper: MemoryRouter })
        expect(screen.getByText('Invoice Router')).toBeInTheDocument()
    })

    it('renders the SOLV logo', () => {
        render(<AppHeader />, { wrapper: MemoryRouter })
        expect(screen.getByAltText('SOLV')).toBeInTheDocument()
    })

    it('renders a link to the register page', () => {
        render(<AppHeader />, { wrapper: MemoryRouter })
        expect(screen.getByRole('link', { name: /invoice register/i })).toBeInTheDocument()
    })
})