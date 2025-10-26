'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useWeb3 } from '@/components/Providers'
import type { UserRole } from '@/types/user'

const ROLE_OPTIONS: UserRole[] = ['producer', 'intermediary', 'retailer', 'consumer']
import {
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    IdentificationIcon,
    WalletIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline'

function RegisterContent() {
    const { t, i18n } = useTranslation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { connectWallet, registerUser, isConnected, user, isLoading, setLocalUser } = useWeb3()

    const [currentLang, setCurrentLang] = useState('en')
    const [step, setStep] = useState(1)
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        aadhaar: ''
    })
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')

    useEffect(() => {
        const roleParam = searchParams.get('role')
        if (roleParam && ROLE_OPTIONS.includes(roleParam as UserRole)) {
            setSelectedRole(roleParam as UserRole)
            setStep(2)
        }
    }, [searchParams])

    useEffect(() => {
        if (user) {
            router.push(`/dashboard/${user.role}`)
        }
    }, [user, router])

    const roles: Array<{
        id: UserRole
        title: string
        description: string
        icon: string
        benefits: string[]
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
                    : ['डिजिटल फसल बैच बनाएं', 'प्रत्यक्ष बाजार पहुंच', 'मूल्य पारदर्शिता', 'सरकारी योजना जानकारी']
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
                    : ['थोक खरीद प्रबंधन', 'गुणवत्ता सत्यापन', 'आपूर्ति श्रृंखला ट्रैकिंग', 'इन्वेंटरी प्रबंधन']
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
                    : ['उत्पाद प्रामाणिकता सत्यापन', 'ग्राहक विश्वास निर्माण', 'प्रतिस्पर्धी मूल्य निर्धारण', 'बिक्री विश्लेषण']
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
                    : ['उत्पाद अनुरेखणीयता', 'गुणवत्ता आश्वासन', 'मूल्य तुलना', 'किसान समर्थन']
            }
        ]

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    const handleRoleSelect = (roleId: UserRole) => {
        setSelectedRole(roleId)
        setStep(2)
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
                        location: formData.location
                    })
                    console.log('Registered consumer, saved profile:', saved)
                    // Ensure context/localStorage is set (registerUser persists, but call setLocalUser to be explicit)
                    try { setLocalUser(saved) } catch (e) { /* ignore */ }

                    // Try replace first, then fallback to push after short delay if not redirected
                    await router.replace(`/dashboard/${saved.role}`)
                    // small delay to allow navigation; if not navigated, fallback
                    await new Promise((res) => setTimeout(res, 200))
                    if (typeof window !== 'undefined' && !window.location.pathname.startsWith(`/dashboard/${saved.role}`)) {
                        console.warn('router.replace did not navigate, forcing push.')
                        router.push(`/dashboard/${saved.role}`)
                    }
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
            const signer = await connectWallet()
            if (signer && formData.name && selectedRole) {
                await registerUser({
                    role: selectedRole,
                    name: formData.name,
                    phone: formData.phone,
                    location: formData.location
                })
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
                        <Link href="/" className="flex items-center space-x-3">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🌾</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                                </span>
                            </div>
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-md transition-colors"
                        >
                            {currentLang === 'en' ? 'हिंदी' : 'English'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 3 && (
                                    <div className={`w-12 h-1 mx-2 ${step > stepNum ? 'bg-orange-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {step === 1 && (currentLang === 'en' ? 'Choose Your Role' : 'अपनी भूमिका चुनें')}
                            {step === 2 && (currentLang === 'en' ? 'Personal Details' : 'व्यक्तिगत विवरण')}
                            {step === 3 && (currentLang === 'en' ? 'Connect Wallet' : 'वॉलेट कनेक्ट करें')}
                        </p>
                    </div>
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
                                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-orange-200"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-4xl">{role.icon}</div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-semibold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {role.title}
                                            </h3>
                                            <p className={`text-gray-600 mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {role.description}
                                            </p>
                                            <div className="space-y-2">
                                                {role.benefits.slice(0, 2).map((benefit, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className={`text-sm text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
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

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('location')}
                                    </label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                            placeholder={currentLang === 'en' ? 'City, State' : 'शहर, राज्य'}
                                            required
                                        />
                                    </div>
                                </div>

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

                            {!isConnected ? (
                                <>
                                    <button
                                        onClick={handleWalletConnect}
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

                                    {/* Allow skipping wallet connection — registration will still proceed using phone-derived id */}
                                    <div className="mt-4">
                                        <button
                                            onClick={async () => {
                                                if (!selectedRole) {
                                                    alert(currentLang === 'en' ? 'Please select a role first' : 'कृपया पहले एक भूमिका चुनें')
                                                    return
                                                }

                                                try {
                                                    const saved = await registerUser({
                                                        role: selectedRole as UserRole,
                                                        name: formData.name,
                                                        phone: formData.phone,
                                                        location: formData.location
                                                    })
                                                    // Use role returned by server (saved profile) to redirect reliably
                                                    console.log('Registered (skip) saved profile:', saved)
                                                    await router.replace(`/dashboard/${saved.role}`)
                                                } catch (err) {
                                                    console.error('Registration skipped wallet error:', err)
                                                    alert(currentLang === 'en' ? 'Registration failed' : 'पंजीकरण विफल')
                                                }
                                            }}
                                            className="text-sm text-gray-600 underline"
                                            disabled={isLoading}
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