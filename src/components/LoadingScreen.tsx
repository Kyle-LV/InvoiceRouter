import './LoadingScreen.css'

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-spinner">
                <p>Loading invoices...</p>
            </div>
        </div>
    )
}