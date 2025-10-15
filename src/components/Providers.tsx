'use client'

import React, { createContext, useContext, useState } from 'react'
import { ethers } from 'ethers'
import '@/lib/i18n'

// Types
export interface User {
    address: string
    role: 'producer' | 'intermediary' | 'retailer' | 'consumer' | null
    name: string
    phone: string
    location: string
    verified: boolean
}

interface Web3ContextType {
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    contract: ethers.Contract | null
    user: User | null
    isConnected: boolean
    isLoading: boolean
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    registerUser: (userData: Omit<User, 'address' | 'verified'>) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Providers({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const connectWallet = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                setIsLoading(true)
                await window.ethereum.request({ method: 'eth_requestAccounts' })

                const web3Provider = new ethers.BrowserProvider(window.ethereum)
                const web3Signer = await web3Provider.getSigner()

                setProvider(web3Provider)
                setSigner(web3Signer)
                setIsConnected(true)

                // Load user data from localStorage
                const savedUser = localStorage.getItem('krishialok_user')
                if (savedUser) {
                    setUser(JSON.parse(savedUser))
                }

            } catch (error) {
                console.error('Failed to connect wallet:', error)
            } finally {
                setIsLoading(false)
            }
        } else {
            alert('Please install MetaMask!')
        }
    }

    const disconnectWallet = () => {
        setProvider(null)
        setSigner(null)
        setContract(null)
        setUser(null)
        setIsConnected(false)
        localStorage.removeItem('krishialok_user')
    }

    const registerUser = async (userData: Omit<User, 'address' | 'verified'>) => {
        if (!signer) return

        try {
            setIsLoading(true)
            const address = await signer.getAddress()

            const newUser: User = {
                ...userData,
                address,
                verified: false
            }

            setUser(newUser)
            localStorage.setItem('krishialok_user', JSON.stringify(newUser))

        } catch (error) {
            console.error('Failed to register user:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const value: Web3ContextType = {
        provider,
        signer,
        contract,
        user,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        registerUser
    }

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    )
}

export const useWeb3 = () => {
    const context = useContext(Web3Context)
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider')
    }
    return context
}