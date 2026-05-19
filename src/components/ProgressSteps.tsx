import './ProgressSteps.css'

interface ProgressStepsProps {
    activeStep: 1 | 2 | 3
}

export default function ProgressSteps({ activeStep }: ProgressStepsProps) {
    return (
        <div className="progress-steps">
            <div className={`step${activeStep >= 1 ? ' active' : ''}`}>
                <div className="step-dot">1</div>
                <div className="step-label">Invoice</div>
            </div>
            <div className={`step-line${activeStep >= 2 ? ' active' : ''}`} />
            <div className={`step${activeStep >= 2 ? ' active' : ''}`}>
                <div className="step-dot">2</div>
                <div className="step-label">Costing</div>
            </div>
            <div className={`step-line${activeStep >= 3 ? ' active' : ''}`} />
            <div className={`step${activeStep >= 3 ? ' active' : ''}`}>
                <div className="step-dot">3</div>
                <div className="step-label">Process</div>
            </div>
        </div>
    )
}