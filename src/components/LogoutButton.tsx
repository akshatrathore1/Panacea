"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/Providers'

export default function LogoutButton({ className }: { className?: string }) {
    const { user, isConnected, disconnectWallet } = useWeb3()
    const router = useRouter()

    const handleLogout = () => {
        disconnectWallet()
        try {
            router.replace('/')
        } catch {
            window.location.href = '/'
        }
    }

    if (!user && !isConnected) return null

    return (
        <button
            onClick={handleLogout}
            className={className ?? 'bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm'}
            aria-label="Logout"
        >
            Logout
        </button>
    )
}
