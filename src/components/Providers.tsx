'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
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
    connectWallet: () => Promise<ethers.JsonRpcSigner | null>
    disconnectWallet: () => void
    registerUser: (userData: Omit<UserProfile, 'address' | 'verified'>) => Promise<UserProfile>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Providers({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const persistUser = (profile: UserProfile) => {
        setUser(profile)
        localStorage.setItem('krishialok_user', JSON.stringify(profile))
    }

    useEffect(() => {
        const savedUser = localStorage.getItem('krishialok_user')
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                setUser(parsed)
                setIsConnected(true)
            } catch (err) {
                console.error('Failed to parse saved user:', err)
                localStorage.removeItem('krishialok_user')
            }
        }

        if (typeof window !== 'undefined' && window.ethereum) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            setProvider(web3Provider)
            web3Provider.getSigner().then(setSigner).catch(() => { })
        }
    }, [])

    const connectWallet = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            alert('Please install MetaMask!')
            return null
        }

        try {
            setIsLoading(true)
            await window.ethereum.request({ method: 'eth_requestAccounts' })

            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            const web3Signer = await web3Provider.getSigner()
            const walletAddress = (await web3Signer.getAddress()).toLowerCase()

            setProvider(web3Provider)
            setSigner(web3Signer)
            setIsConnected(true)
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


            try {
                const response = await fetch(`/api/users?address=${walletAddress}`)
                if (response.ok) {
                    const profile = (await response.json()) as UserProfile
                    persistUser(profile)
                    return web3Signer
                }
            } catch (error) {
                console.error('Failed to load user profile from API:', error)
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
        } catch (error) {
            console.error('Failed to connect wallet:', error)
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
        let activeSigner = signer

        if (!activeSigner) {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const fallbackProvider = new ethers.BrowserProvider(window.ethereum)
                    const fallbackSigner = await fallbackProvider.getSigner()
                    activeSigner = fallbackSigner

                    setProvider((current) => current ?? fallbackProvider)
                    setSigner(fallbackSigner)
                    setIsConnected(true)
                } catch (fallbackError) {
                    console.error('Failed to recover signer from provider:', fallbackError)
                    throw new Error('Wallet not connected')
                }
            } else {
                throw new Error('Wallet not connected')
            }
        }

        try {
            setIsLoading(true)
            const address = (await activeSigner.getAddress()).toLowerCase()

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