import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import InvoiceRouterPage from './pages/InvoiceRouterPage'
import InvoiceRegisterPage from './pages/InvoiceRegisterPage'

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/.auth/login/aad'
    }
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading, please wait...</p>
      </div>
    )
  }

  if (!user) return null
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<InvoiceRouterPage />} />
            <Route path="/register" element={<InvoiceRegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  )
}