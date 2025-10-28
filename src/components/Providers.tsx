'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import '@/lib/i18n'
import type { UserProfile } from '@/types/user'

interface Web3ContextType {
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    contract: ethers.Contract | null
    user: UserProfile | null
    isConnected: boolean
    isLoading: boolean
    connectWallet: () => Promise<ethers.JsonRpcSigner | null>
    disconnectWallet: () => void
    registerUser: (userData: Omit<UserProfile, 'address' | 'verified'>) => Promise<UserProfile>
    // Persist a user profile into the context/localStorage (used for phone-only sign-in)
    setLocalUser: (profile: UserProfile) => void
    // Whether the wallet was explicitly connected by the user during this session
    walletExplicitlyConnected: boolean
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Providers({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    // Tracks whether the wallet was connected as a result of an explicit user action
    // (clicking Connect). We avoid using the signer automatically if accounts were
    // merely detected on page load to prevent any MetaMask prompts.
    const [walletExplicitlyConnected, setWalletExplicitlyConnected] = useState(false)

    const persistUser = (profile: UserProfile) => {
        setUser(profile)
        localStorage.setItem('krishialok_user', JSON.stringify(profile))
    }

    const setLocalUser = (profile: UserProfile) => {
        // Persist profile locally; this represents an authenticated user even without a wallet
        persistUser(profile)
        // Do not claim wallet connection; keep isConnected reflecting wallet state
        setIsConnected(false)
    }

       useEffect(() => {
        const savedUser = localStorage.getItem('krishialok_user')
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                setUser(parsed)
                // Do NOT mark wallet as connected when loading a persisted user.
                // A persisted user represents an authenticated session (phone-based)
                // but does not imply MetaMask is connected. Keep isConnected false
                // so the UI shows connect / skip options in registration/login flows.
                setIsConnected(false)
            } catch (err) {
                console.error('Failed to parse saved user:', err)
                localStorage.removeItem('krishialok_user')
            }
        }

        if (typeof window !== 'undefined' && window.ethereum) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            setProvider(web3Provider)

            // Check for already-authorized accounts without prompting the user.
            // `listAccounts()` uses the eth_accounts RPC which does not open a MetaMask popup.
            // Only create and store a signer if accounts are already authorized.
            web3Provider.listAccounts().then((accounts) => {
                if (accounts && accounts.length > 0) {
                    web3Provider.getSigner().then((s) => {
                        setSigner(s)
                        setIsConnected(true)
                    }).catch(() => {})
                }
            }).catch(() => {
                // ignore errors — do not trigger any wallet prompt
            })
        }
    }, [])

    const connectWallet = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            alert('Please install MetaMask!')
            return null
        }

        try {
            setIsLoading(true)

            if (typeof window === 'undefined' || !window.ethereum) {
                console.error('No Ethereum provider found (window.ethereum is undefined)')
                return null
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' })

            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            const web3Signer = await web3Provider.getSigner()
            const walletAddress = (await web3Signer.getAddress()).toLowerCase()

            setProvider(web3Provider)
            setSigner(web3Signer)
            setIsConnected(true)
            setWalletExplicitlyConnected(true)

            try {
                const response = await fetch(`/api/users?address=${walletAddress}`)
                if (response.ok) {
                    const profile = (await response.json()) as UserProfile
                    persistUser(profile)
                    return web3Signer
                }
            } catch (fetchErr) {
                console.error('Failed to load user profile from API:', fetchErr)
            }

            const savedUser = localStorage.getItem('krishialok_user')
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser) as UserProfile
                    if (parsed.address.toLowerCase() === walletAddress) {
                        setUser(parsed)
                    }
                } catch (error) {
                    console.error('Failed to parse cached user profile:', error)
                    localStorage.removeItem('krishialok_user')
                }
            }

            return web3Signer
        } catch (error: any) {
            // Improve error logging so the console shows a helpful message and details
            try {
                const details = error && error.message ? error.message : JSON.stringify(error)
                console.error('Failed to connect wallet:', details, error)
            } catch (logErr) {
                console.error('Failed to connect wallet (unable to stringify error):', error)
            }
            return null
        } finally {
            setIsLoading(false)
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

    const registerUser = async (userData: Omit<UserProfile, 'address' | 'verified'>) => {
        // Allow registration even if wallet is not connected.
        // If a signer is available, use its address. Otherwise, fall back to a phone-derived address.
        let address: string | null = null
        let activeSigner = signer

        // Only attempt to use the signer if the wallet was explicitly connected
        // by the user in this session. This avoids triggering provider prompts
        // when a persisted user or detected accounts exist.
        if (walletExplicitlyConnected && activeSigner) {
            try {
                address = (await activeSigner.getAddress()).toLowerCase()
            } catch (err) {
                console.warn('Could not read address from signer, falling back to phone-based id', err)
                address = null
            }
        }

        if (!address) {
            // No wallet available or failed to read address. Use phone-derived fallback id.
            if (userData.phone) {
                // Normalize phone by trimming and lowercasing; prefix to avoid collisions with real addresses
                address = `phone:${userData.phone.trim().toLowerCase()}`
            } else {
                // As a last resort create a timestamp-based anonymous id
                address = `anon:${Date.now()}`
            }
        }

        try {
            setIsLoading(true)

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    address,
                    verified: false
                })
            })

            if (!response.ok) {
                const message = await response.json().catch(() => ({ error: 'Unable to register user' }))
                throw new Error(message.error || 'Unable to register user')
            }

            const savedProfile = (await response.json()) as UserProfile
            persistUser(savedProfile)
            return savedProfile
        } catch (error) {
            console.error('Failed to register user:', error)
            throw error
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
        ,
        setLocalUser
        ,
        walletExplicitlyConnected
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