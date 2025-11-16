'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useWeb3 } from '@/components/Providers'
import type { UserRole } from '@/types/user'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'

const ROLE_OPTIONS: UserRole[] = ['producer', 'intermediary', 'retailer', 'consumer']
import {
    UserIcon,
    PhoneIcon,
    IdentificationIcon,
    WalletIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline'
import LogoutButton from '@/components/LogoutButton'

function RegisterContent() {
    const { t } = useTranslation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { connectWallet, registerUser, isConnected, user, isLoading, setLocalUser, walletExplicitlyConnected, provider, signer } = useWeb3()

    // Safely navigate to a new path: skip replace if already on the same path,
    // otherwise attempt replace and fall back to push if replace doesn't take effect.
    const safeReplace = useCallback(async (target: string) => {
        try {
            await router.replace(target)
        } catch (err) {
            console.error('Navigation error (safeReplace):', err)
            try {
                router.push(target)
            } catch (pushErr) {
                console.error('Fallback push failed:', pushErr)
                try { window.location.href = target } catch {
                    /* final fallback ignored */
                }
            }
        }
    }, [router])

    const { language: currentLang } = useLanguage()
    const [step, setStep] = useState(1)
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        aadhaar: ''
    })
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [processingSkip, setProcessingSkip] = useState(false)

    useEffect(() => {
        const roleParam = searchParams.get('role')
        if (roleParam && ROLE_OPTIONS.includes(roleParam as UserRole)) {
            setSelectedRole(roleParam as UserRole)
            setStep(2)
        }
    }, [searchParams])

    // If role changes to consumer, ensure we don't show step 3
    useEffect(() => {
        if (selectedRole === 'consumer' && step > 2) {
            setStep(2)
        }
    }, [selectedRole, step])

    // Automatic redirect: if a persisted user exists or a connected wallet maps
    // to a registered profile, navigate to the dashboard immediately.
    useEffect(() => {
        if (user) {
            safeReplace(`/dashboard/${user.role}`)
            return
        }

        const tryRedirectFromWallet = async () => {
            if (!isConnected) return

            try {
                const saved = localStorage.getItem('krishialok_user')
                if (saved) {
                    const parsed = JSON.parse(saved)
                    if (parsed?.address) {
                        await safeReplace(`/dashboard/${parsed.role || 'consumer'}`)
                        return
                    }
                }
            } catch {
                // ignore
            }

            try {
                let addr: string | null = null
                if (signer) {
                    try { addr = (await signer.getAddress()).toLowerCase() } catch {
                        addr = null
                    }
                }

                if (!addr && provider) {
                    try {
                        const accounts = await provider.listAccounts()
                        if (accounts && accounts.length > 0) {
                            const firstAccount = accounts[0] as unknown
                            if (typeof firstAccount === 'string') {
                                addr = firstAccount.toLowerCase()
                            } else if (
                                firstAccount &&
                                typeof (firstAccount as { getAddress?: unknown }).getAddress === 'function'
                            ) {
                                try {
                                    const fetched = await (firstAccount as { getAddress: () => Promise<string> }).getAddress()
                                    addr = fetched.toLowerCase()
                                } catch {
                                    // ignore nested failure
                                }
                            } else if (
                                firstAccount &&
                                typeof (firstAccount as { address?: unknown }).address === 'string'
                            ) {
                                addr = String((firstAccount as { address?: unknown }).address).toLowerCase()
                            }
                        }
                    } catch {
                        // ignore
                    }
                }

                if (addr) {
                    // For the registration flow we avoid calling the server here
                    // to prevent a 404 network response when the wallet isn't
                    // yet registered. We already checked localStorage above; if
                    // no profile was found, allow the user to connect MetaMask
                    // and complete registration explicitly.
                }
            } catch (err) {
                console.error('Auto-redirect (wallet) failed in register:', err)
            }
        }

        tryRedirectFromWallet()
    }, [user, isConnected, provider, signer, safeReplace])

    const roleBackgrounds: Record<UserRole, string> = {
        producer: '/producer.jpg',
        intermediary: '/intermediary.jpg',
        retailer: '/retailer.jpg',
        consumer: '/consumer.jpg'
    }

    const roles: Array<{
        id: UserRole
        title: string
        description: string
        icon: string
        benefits: string[]
        bgImage: string
    }> = [
            {
                id: 'producer',
                title: t('producer'),
                description: currentLang === 'en'
                    ? 'Farmers and agricultural producers who grow crops'
                    : 'किसान और कृषि उत्पादक जो फसल उगाते हैं',
                icon: '🌾',
                benefits: currentLang === 'en'
                    ? ['Create digital crop batches', 'Direct market access', 'Price transparency', 'Government schemes info']
                    : ['डिजिटल फसल बैच बनाएं', 'प्रत्यक्ष बाजार पहुंच', 'मूल्य पारदर्शिता', 'सरकारी योजना जानकारी'],
                bgImage: roleBackgrounds.producer
            },
            {
                id: 'intermediary',
                title: t('intermediary'),
                description: currentLang === 'en'
                    ? 'Distributors, agents, aggregators, and food processing companies'
                    : 'वितरक, एजेंट, एग्रीगेटर और खाद्य प्रसंस्करण कंपनियां',
                icon: '🚛',
                benefits: currentLang === 'en'
                    ? ['Bulk purchase management', 'Quality verification', 'Supply chain tracking', 'Inventory management']
                    : ['थोक खरीद प्रबंधन', 'गुणवत्ता सत्यापन', 'आपूर्ति श्रृंखला ट्रैकिंग', 'इन्वेंटरी प्रबंधन'],
                bgImage: roleBackgrounds.intermediary
            },
            {
                id: 'retailer',
                title: t('retailer'),
                description: currentLang === 'en'
                    ? 'Wholesalers, retail stores, and small vendors'
                    : 'थोक विक्रेता, खुदरा दुकानें और छोटे विक्रेता',
                icon: '🏪',
                benefits: currentLang === 'en'
                    ? ['Product authenticity verification', 'Customer trust building', 'Competitive pricing', 'Sales analytics']
                    : ['उत्पाद प्रामाणिकता सत्यापन', 'ग्राहक विश्वास निर्माण', 'प्रतिस्पर्धी मूल्य निर्धारण', 'बिक्री विश्लेषण'],
                bgImage: roleBackgrounds.retailer
            },
            {
                id: 'consumer',
                title: t('consumer'),
                description: currentLang === 'en'
                    ? 'End consumers who purchase agricultural products'
                    : 'अंतिम उपभोक्ता जो कृषि उत्पाद खरीदते हैं',
                icon: '👥',
                benefits: currentLang === 'en'
                    ? ['Product traceability', 'Quality assurance', 'Price comparison', 'Farmer support']
                    : ['उत्पाद अनुरेखणीयता', 'गुणवत्ता आश्वासन', 'मूल्य तुलना', 'किसान समर्थन'],
                bgImage: roleBackgrounds.consumer
            }
        ]

    const handleRoleSelect = (roleId: UserRole) => {
        setSelectedRole(roleId)
        setStep(2)
    }

    const handleBackClick = () => {
        if (step > 1) {
            if (step === 2) {
                setOtpSent(false)
                setOtp('')
            }

            if (step === 3) {
                setProcessingSkip(false)
            }

            setStep((prev) => Math.max(1, prev - 1))
            return
        }

        safeReplace('/')
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!otpSent) {
            // Simulate OTP sending
            setOtpSent(true)
            return
        }

        if (otp === '123456') { // Simulate OTP verification
            // If consumer, skip wallet step and register immediately
            if (selectedRole === 'consumer') {
                try {
                    console.log('Registering consumer...', { selectedRole, formData })
                    const saved = await registerUser({
                        role: selectedRole as UserRole,
                        name: formData.name,
                        phone: formData.phone,
                        // consumer registering without wallet: mark provider as phone
                        provider: 'phone'
                    })
                    console.log('Registered consumer, saved profile:', saved)
                    // Ensure context/localStorage is set (registerUser persists, but call setLocalUser to be explicit)
                    try {
                        setLocalUser(saved)
                    } catch (persistError) {
                        console.warn('Failed to persist consumer profile locally:', persistError)
                    }

                    // Try replace first, then fallback to push after short delay if not redirected
                    await safeReplace(`/dashboard/${saved.role}`)
                } catch (err) {
                    console.error('Registration error (consumer):', err)
                    alert(currentLang === 'en' ? 'Registration failed' : 'पंजीकरण विफल')
                }
                return
            }

            // Other roles proceed to wallet connection (optional)
            setStep(3)
        } else {
            alert(currentLang === 'en' ? 'Invalid OTP. Use 123456 for demo.' : 'अमान्य OTP। डेमो के लिए 123456 का उपयोग करें।')
        }
    }

    const handleWalletConnect = async () => {
        try {
            // During registration we allow connecting an unregistered wallet so
            // the user can complete registration using MetaMask. Pass `false` to
            // indicate an existing Firestore user is not required.
            const signer = await connectWallet(false)
            // Validate required fields (role, name, phone) before calling register API
            if (!selectedRole) {
                alert(currentLang === 'en' ? 'Please select a role first' : 'कृपया पहले एक भूमिका चुनें')
                return
            }
            if (!formData.name || !formData.phone) {
                alert(currentLang === 'en' ? 'Please fill name and phone before connecting wallet' : 'कृपया वॉलेट कनेक्ट करने से पहले नाम और फोन भरें')
                return
            }

            if (signer) {
                // Read the connected wallet address directly from the signer and
                // pass it to the register API to avoid any race with provider
                // state updates in the context.
                let walletAddr: string | null = null
                try {
                    walletAddr = (await signer.getAddress()).toLowerCase()
                } catch (addressError) {
                    console.warn('Could not read address from signer after connect:', addressError)
                }

                const saved = await registerUser({
                    role: selectedRole,
                    name: formData.name,
                    phone: formData.phone,
                    provider: 'metamask'
                }, walletAddr ?? undefined)

                // Ensure local context/localStorage updated and then navigate to dashboard
                try {
                    setLocalUser(saved)
                } catch (persistError) {
                    console.warn('Failed to persist wallet profile locally:', persistError)
                }

                try {
                    await safeReplace(`/dashboard/${saved.role}`)
                } catch (navErr) {
                    console.error('Navigation after wallet connect failed:', navErr)
                }
            }
        } catch (error) {
            console.error('Registration failed:', error)
        }
    }

    const selectedRoleData = roles.find(role => role.id === selectedRole)

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <button
                            type="button"
                            onClick={handleBackClick}
                            className="flex items-center space-x-3 text-left"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🌾</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                                </span>
                            </div>
                        </button>

                        <div className="flex items-center space-x-2">
                            <LogoutButton />
                            <LanguageToggle />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar - show 2 steps for consumers, 3 for other roles */}
                <div className="mb-8">
                    {/** determine whether the selected role is consumer **/}
                    {/** showSteps contains the sequence of step numbers to render **/}
                    {(() => {
                        const isConsumer = selectedRole === 'consumer'
                        const showSteps = isConsumer ? [1, 2] : [1, 2, 3]

                        return (
                            <>
                                <div className="flex items-center justify-center space-x-4">
                                    {showSteps.map((stepNum, idx) => (
                                        <div key={stepNum} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {stepNum}
                                            </div>
                                            {idx < showSteps.length - 1 && (
                                                <div className={`w-12 h-1 mx-2 ${step > stepNum ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center mt-4">
                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {step === 1 && (currentLang === 'en' ? 'Choose Your Role' : 'अपनी भूमिका चुनें')}
                                        {step === 2 && (currentLang === 'en' ? 'Personal Details' : 'व्यक्तिगत विवरण')}
                                        {!isConsumer && step === 3 && (currentLang === 'en' ? 'Connect Wallet' : 'वॉलेट कनेक्ट करें')}
                                    </p>
                                </div>
                            </>
                        )
                    })()}
                </div>

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div>
                        <h1 className={`text-3xl font-bold text-center mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Join KrashiAalok' : 'कृषिआलोक से जुड़ें'}
                        </h1>
                        <p className={`text-gray-600 text-center mb-8 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en'
                                ? 'Select your role to get started with the agricultural supply chain'
                                : 'कृषि आपूर्ति श्रृंखला के साथ शुरुआत करने के लिए अपनी भूमिका का चयन करें'}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className="relative p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-200 overflow-hidden group"
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${role.bgImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" aria-hidden="true" />
                                    <div className="relative flex items-start space-x-4 text-white">
                                        <div className="w-12 h-12" aria-hidden="true" />
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-semibold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {role.title}
                                            </h3>
                                            <p className={`text-white/90 mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {role.description}
                                            </p>
                                            <div className="space-y-2">
                                                {role.benefits.slice(0, 2).map((benefit, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-green-300 rounded-full" />
                                                        <span className={`text-sm text-white/90 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                            {benefit}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <div className="text-center mb-8">
                                <div className="text-4xl mb-4">{selectedRoleData?.icon}</div>
                                <h2 className={`text-2xl font-bold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? `Register as ${selectedRoleData?.title}`
                                        : `${selectedRoleData?.title} के रूप में पंजीकरण करें`}
                                </h2>
                                <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {selectedRoleData?.description}
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('name')}
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                            placeholder={currentLang === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('phone')}
                                    </label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="+91 98765 43210"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Location field removed by user request; server accepts missing location */}

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Aadhaar Number' : 'आधार संख्या'}
                                    </label>
                                    <div className="relative">
                                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.aadhaar}
                                            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="XXXX XXXX XXXX"
                                            required
                                        />
                                    </div>
                                </div>

                                {otpSent && (
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Enter OTP' : 'OTP दर्ज करें'}
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder={currentLang === 'en' ? 'Enter 6-digit OTP (use 123456 for demo)' : '6-अंकीय OTP दर्ज करें (डेमो के लिए 123456 का उपयोग करें)'}
                                            required
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="loading-dots">
                                            {currentLang === 'en' ? 'Processing' : 'प्रसंस्करण'}
                                        </span>
                                    ) : (
                                        otpSent
                                            ? (currentLang === 'en' ? 'Verify OTP' : 'OTP सत्यापित करें')
                                            : (currentLang === 'en' ? 'Send OTP' : 'OTP भेजें')
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Step 3: Wallet Connection */}
                {step === 3 && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <WalletIcon className="w-16 h-16 text-orange-600 mx-auto mb-6" />
                            <h2 className={`text-2xl font-bold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Connect Your Wallet' : 'अपना वॉलेट कनेक्ट करें'}
                            </h2>
                            <p className={`text-gray-600 mb-8 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Connect your MetaMask wallet to complete registration and start using blockchain features'
                                    : 'पंजीकरण पूरा करने और ब्लॉकचेन सुविधाओं का उपयोग शुरू करने के लिए अपना MetaMask वॉलेट कनेक्ट करें'}
                            </p>

                            {/* Show Connect / Skip unless the wallet was explicitly connected by the user in this session. */}
                            {!isConnected || !walletExplicitlyConnected ? (
                                <>
                                    {processingSkip ? (
                                        <div className="py-8">
                                            <div className="text-center text-gray-700">
                                                <div className="inline-block w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
                                                <div className="font-medium">{currentLang === 'en' ? 'Processing...' : 'प्रसंस्करण...'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={processingSkip ? 'pointer-events-none' : ''}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleWalletConnect() }}
                                                    disabled={isLoading}
                                                    className={`bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isLoading ? (
                                                        <span className="loading-dots">
                                                            {currentLang === 'en' ? 'Connecting' : 'कनेक्ट हो रहा है'}
                                                        </span>
                                                    ) : (
                                                        currentLang === 'en' ? 'Connect MetaMask' : 'MetaMask कनेक्ट करें'
                                                    )}
                                                </button>

                                            </div>
                                            {/* Allow skipping wallet connection — registration will still proceed using phone-derived id */}
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={async (e) => {
                                                        e.preventDefault()
                                                        // prevent double activation
                                                        if (processingSkip || isLoading) return
                                                        setProcessingSkip(true)

                                                        if (!selectedRole) {
                                                            alert(currentLang === 'en' ? 'Please select a role first' : 'कृपया पहले एक भूमिका चुनें')
                                                            setProcessingSkip(false)
                                                            return
                                                        }

                                                        if (!formData.name || !formData.phone) {
                                                            alert(currentLang === 'en' ? 'Please fill name and phone before continuing' : 'कृपया जारी रखने से पहले नाम और फोन भरें')
                                                            setProcessingSkip(false)
                                                            return
                                                        }

                                                        try {
                                                            const saved = await registerUser({
                                                                role: selectedRole as UserRole,
                                                                name: formData.name,
                                                                phone: formData.phone,
                                                                // user chose to skip wallet: persist as phone-based registration
                                                                provider: 'phone'
                                                            })
                                                            // Use role returned by server (saved profile) to redirect reliably
                                                            console.log('Registered (skip) saved profile:', saved)
                                                            // ensure local context updated
                                                            try {
                                                                setLocalUser(saved)
                                                            } catch (persistError) {
                                                                console.warn('Failed to persist skipped-wallet profile locally:', persistError)
                                                            }
                                                            await safeReplace(`/dashboard/${saved.role}`)
                                                        } catch (err) {
                                                            console.error('Registration skipped wallet error:', err)
                                                            alert(currentLang === 'en' ? 'Registration failed' : 'पंजीकरण विफल')
                                                        } finally {
                                                            setProcessingSkip(false)
                                                        }
                                                    }}
                                                    className="text-sm text-gray-600 underline"
                                                    disabled={isLoading || processingSkip}
                                                >
                                                    {currentLang === 'en' ? 'Skip & continue without wallet' : 'वॉलेट के बिना छोड़ें और जारी रखें'}
                                                </button>
                                            </div>

                                            <div className={`mt-6 text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en'
                                                    ? "Don't have MetaMask? "
                                                    : "MetaMask नहीं है? "}
                                                <a
                                                    href="https://metamask.io/download/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-orange-600 hover:underline"
                                                >
                                                    {currentLang === 'en' ? 'Download here' : 'यहाँ डाउनलोड करें'}
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-green-600">
                                    <div className="text-2xl mb-2">✅</div>
                                    <p className={`font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Wallet Connected Successfully!' : 'वॉलेट सफलतापूर्वक कनेक्ट हो गया!'}
                                    </p>
                                    <p className={`text-sm text-gray-600 mt-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Redirecting to dashboard...' : 'डैशबोर्ड पर भेजा जा रहा है...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
        </Suspense>
    )
}