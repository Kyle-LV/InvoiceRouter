import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuthContext } from './AuthContext'

function TestConsumer() {
    const { user, loading } = useAuthContext()
    if (loading) return <div>Loading, please wait...</div>
    return <div>{user ? user.userDetails : 'Currently logged out'}</div>
}

describe('AuthContext', () => {
    it('provides loading state initially', () => {
        vi.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
        )
        render(<AuthProvider>
            <TestConsumer />
        </AuthProvider>
        )
        expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    })

    it('provides user details after auth resolves', async () => {
        const mockUser = {
            identityProvider: 'aad',
            userId: 'abc123',
            userDetails: 'kyle.williams@lv-logistics.com',
            userRoles: ['authenticated'],
            claims: [],
        }
        vi.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ clientPrincipal: mockUser }), { status: 200 }),
        )
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )
        await waitFor(() =>
            expect(screen.getByText('kyle.williams@lv-logistics.com')).toBeInTheDocument()
        )
    })

    it('shows currently logged out when unauthenticated', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 })
        )
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )
        await waitFor(() =>
            expect(screen.getByText('Currently logged out')).toBeInTheDocument()
        )
    })
})