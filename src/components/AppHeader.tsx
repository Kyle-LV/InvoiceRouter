import { Link } from 'react-router-dom'
import './AppHeader.css'

export default function AppHeader() {
    return (
        <div className="form-header">
            <div className="form-header-left">
                <img
                    src="/SOLV_Logo_Black_No_Subtitle.png"
                    alt="SOLV"
                    className="app-logo"
                />
                <h2>Invoice Router</h2>
                <p className="lead">Select an invoice and match it to an open costing.</p>
            </div>
            <Link to="/register" className="nav-link">
                Invoice Register
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ flexShrink: 0 }}
                >
                    <path
                        d="M2.5 6h7M6.5 3l3 3-3 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Link>
        </div>
    )
}