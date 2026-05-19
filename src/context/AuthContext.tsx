import { createContext, useContext } from "react"
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { ClientPrincipal } from '../types/auth'

interface AuthContextValue {
    user: ClientPrincipal | null
    loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth()
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
    return ctx
}