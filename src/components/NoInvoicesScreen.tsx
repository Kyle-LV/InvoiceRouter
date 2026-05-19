import { Link } from 'react-router-dom'

export default function NoInvoicesScreen() {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: '#ffffff', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            fontFamily: 'Inter, sans-serif',
        }}>
            <h1 style={{ fontSize: '2rem', color: '#102a43', marginBottom: 12 }}>
                No invoices to process
            </h1>
            <p style={{ color: '#64748b', marginBottom: 24 }}>You're all caught up 🎉</p>
            <Link
                to="/register"
                style={{
                    display: 'inline-block', padding: '10px 20px', background: '#1e3a5f',
                    color: '#fff', borderRadius: 6, fontSize: '0.9rem', fontWeight: 500,
                    textDecoration: 'none',
                }}
            >
                Go to Register
            </Link>
        </div>
    )
}