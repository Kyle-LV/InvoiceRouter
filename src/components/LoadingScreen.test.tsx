import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingScreen from './LoadingScreen'

describe('LoadingScreen', () => {
    it('renders the loading message', () => {
        render(<LoadingScreen />)
        expect(screen.getByText('Loading invoices...')).toBeInTheDocument()
    })
})