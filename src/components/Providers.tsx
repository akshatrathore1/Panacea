'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ethers } from 'ethers'
import '@/lib/i18n'
import type { UserProfile } from '@/types/user'
import contractABI from '@/lib/contractABI.json'; // adjust path to where your ABI is stored

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xYourContractAddressHere'
const hasConfiguredContract = ethers.isAddress(CONTRACT_ADDRESS) && CONTRACT_ADDRESS !== '0xYourContractAddressHere'



interface Web3ContextType {
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    contract: ethers.Contract | null
    user: UserProfile | null
    isConnected: boolean
    isLoading: boolean
    // if `requireRegistered` is true (default) connectWallet only succeeds when
    // a Firestore user document exists for the connected wallet (used by Login).
    // If false, connectWallet will establish a signer even if there's no user yet
    // (used by Register flow before calling registerUser).
    connectWallet: (requireRegistered?: boolean) => Promise<ethers.JsonRpcSigner | null>
    disconnectWallet: () => void
    // `explicitAddress` may be provided by callers (e.g. the Register page)
    // to avoid races reading provider state immediately after connecting.
    registerUser: (userData: Omit<UserProfile, 'address' | 'verified'>, explicitAddress?: string | undefined) => Promise<UserProfile>
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

    const router = useRouter()

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
                    }).catch(() => { })
                }
            }).catch(() => {
                // ignore errors — do not trigger any wallet prompt
            })
        }
    }, [])

    // Keep the in-memory user state in sync with history navigation (back/forward)
    // and cross-tab localStorage changes. Some browsers or navigation flows can
    // cause the app to show an earlier state; when that happens rehydrate the
    // persisted user from localStorage so the UI remains logged-in if a session
    // is present. This avoids accidental «logged out» UX when the user presses
    // the browser Back button after signing in.
    useEffect(() => {
        if (typeof window === 'undefined') return

        const syncUserFromStorage = () => {
            try {
                const saved = localStorage.getItem('krishialok_user')
                if (saved) {
                    const parsed = JSON.parse(saved)
                    setUser(parsed)
                }
                // If there's no saved user, do not force-clear the in-memory
                // user here — explicit logout should be the only way to clear
                // the session to avoid surprising UX when navigating.
            } catch (err) {
                console.error('Failed to sync saved user from storage:', err)
            }
        }

        window.addEventListener('popstate', syncUserFromStorage)
        window.addEventListener('storage', syncUserFromStorage)

        return () => {
            window.removeEventListener('popstate', syncUserFromStorage)
            window.removeEventListener('storage', syncUserFromStorage)
        }
    }, [])

    const connectWallet = async (requireRegistered = true) => {
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
            // If caller requires a registered user (login flow) we must verify
            // the wallet exists in Firestore. If requireRegistered is false
            // (register flow) allow connecting even when there is no server doc.
            if (requireRegistered) {
                try {
                    const response = await fetch(`/api/users?address=${walletAddress}`)
                    if (response.ok) {
                        const profile = (await response.json()) as UserProfile
                        persistUser(profile)
                        // After successful MetaMask login, go to role-specific dashboard
                        try {
                            router.replace(`/dashboard/${profile.role || 'consumer'}`)
                        } catch (navigationError) {
                            console.warn('Navigation fallback after MetaMask login:', navigationError)
                            window.location.href = `/dashboard/${profile.role || 'consumer'}`
                        }
                        // Initialize contract
                        if (!hasConfiguredContract) {
                            console.warn('Smart contract address is not configured. Update NEXT_PUBLIC_CONTRACT_ADDRESS (or edit Providers.tsx) to enable blockchain features.')
                        } else {
                            try {
                                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, web3Signer)
                                setContract(contractInstance)
                                console.log('✅ Contract connected:', CONTRACT_ADDRESS)
                            } catch (err) {
                                console.error('❌ Failed to initialize contract:', err)
                            }
                        }


                        return web3Signer
                    }

                    // If the server responded 404 the wallet hasn't been registered yet
                    if (response.status === 404) {
                        // Clear signer/connection because we won't treat this as a successful login
                        setSigner(null)
                        setIsConnected(false)
                        alert('MetaMask address is not registered. Please register using MetaMask or sign up with phone.')
                        return null
                    }
                } catch (fetchErr) {
                    console.error('Failed to load user profile from API:', fetchErr)
                    // continue to check local cache as a fallback
                }
            }

            // Check for a cached local profile that matches this wallet
            const savedUser = localStorage.getItem('krishialok_user')
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser) as UserProfile
                    if (parsed.address.toLowerCase() === walletAddress) {
                        setUser(parsed)
                        try {
                            router.replace(`/dashboard/${parsed.role || 'consumer'}`)
                        } catch (navigationError) {
                            console.warn('Navigation fallback when using cached profile:', navigationError)
                            window.location.href = `/dashboard/${parsed.role || 'consumer'}`
                        }
                        return web3Signer
                    }
                } catch (error) {
                    console.error('Failed to parse cached user profile:', error)
                    localStorage.removeItem('krishialok_user')
                }
            }

            // No server profile and no matching local profile: if caller required a registered
            // user, inform the user. Otherwise (register flow) return the signer so
            // the caller can complete registration.
            if (requireRegistered) {
                setSigner(null)
                setIsConnected(false)
                alert('MetaMask address is not registered. Please register first.')
                return null
            }

            return web3Signer
        } catch (error: unknown) {
            const details = error instanceof Error
                ? error.message
                : (() => {
                    try {
                        return JSON.stringify(error)
                    } catch {
                        return 'Unknown error'
                    }
                })()
            console.error('Failed to connect wallet:', details, error)
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
        setWalletExplicitlyConnected(false)
        localStorage.removeItem('krishialok_user')
    }

    const registerUser = async (userData: Omit<UserProfile, 'address' | 'verified'>, explicitAddress?: string | undefined) => {
        // Allow registration even if wallet is not connected.
        // If a signer is available, use its address. Otherwise, fall back to a phone-derived address.
        let address: string | null = null
        const activeSigner = signer

        // If caller supplied an explicit address (from the signer right after connect), prefer it.
        if (explicitAddress) {
            address = explicitAddress
        }

        // Only attempt to use the signer if the wallet was explicitly connected
        // by the user in this session. This avoids triggering provider prompts
        // when a persisted user or detected accounts exist.
        if (!address && walletExplicitlyConnected && activeSigner) {
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

            // If this registration is for an Ethereum address, mark provider='metamask'
            const isEthAddress = typeof address === 'string' && /^0x[a-f0-9]{40}$/i.test(address)

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    address,
                    provider: isEthAddress ? 'metamask' : (userData.provider ?? undefined),
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

export function useWeb3() {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Providers');
    }
    return context;
}

// Make sure Providers wraps your app in layout