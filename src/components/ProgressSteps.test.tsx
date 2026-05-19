import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressSteps from './ProgressSteps'

describe('ProgressSteps', () => {
    it('renders all three step labels', () => {
        render(<ProgressSteps activeStep={1} />)
        expect(screen.getByText('Invoice')).toBeInTheDocument()
        expect(screen.getByText('Costing')).toBeInTheDocument()
        expect(screen.getByText('Process')).toBeInTheDocument()
    })

    it('marks only step 1 active when activeStep is 1', () => {
        render(<ProgressSteps activeStep={1} />)
        const steps = document.querySelectorAll('.step')
        expect(steps[0]).toHaveClass('active')
        expect(steps[1]).not.toHaveClass('active')
        expect(steps[2]).not.toHaveClass('active')
    })

    it('marks steps 1 and 2 active when activeStep is 2', () => {
        render(<ProgressSteps activeStep={2} />)
        const steps = document.querySelectorAll('.step')
        expect(steps[0]).toHaveClass('active')
        expect(steps[1]).toHaveClass('active')
        expect(steps[2]).not.toHaveClass('active')
    })

    it('marks all steps active when activeStep is 3', () => {
        render(<ProgressSteps activeStep={3} />)
        const steps = document.querySelectorAll('.step')
        expect(steps[0]).toHaveClass('active')
        expect(steps[1]).toHaveClass('active')
        expect(steps[2]).toHaveClass('active')
    })
})