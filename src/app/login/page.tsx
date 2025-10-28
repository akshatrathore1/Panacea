'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useWeb3 } from '@/components/Providers'
import type { UserProfile, UserRole } from '@/types/user'
import {
    WalletIcon,
    PhoneIcon,
    ArrowLeftIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function LoginPage() {
    const { t, i18n } = useTranslation()
    const router = useRouter()
    const { connectWallet, isConnected, user, isLoading, setLocalUser } = useWeb3()

    const [currentLang, setCurrentLang] = useState('en')
    const [loginMethod, setLoginMethod] = useState<'wallet' | 'phone'>('wallet')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    

    // NOTE: removed automatic redirect on mount. Users must explicitly log in
    // (wallet connect or phone OTP) before being redirected to the dashboard.

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    const handleWalletLogin = async () => {
        try {
            const signer = await connectWallet()

            // After connecting the wallet, if a user profile exists in the Web3
            // context or in localStorage, redirect them to the appropriate
            // dashboard. Otherwise send them to registration so they can create
            // a profile for this wallet address.
            if (signer) {
                // Prefer the context user if present
                if (user) {
                    router.push(`/dashboard/${user.role}`)
                    return
                }

                // Fallback: check persisted local user that may have been
                // loaded by the provider earlier
                try {
                    const saved = localStorage.getItem('krishialok_user')
                    if (saved) {
                        const parsed = JSON.parse(saved)
                        if (parsed?.address) {
                            router.push(`/dashboard/${parsed.role || 'consumer'}`)
                            return
                        }
                    }
                } catch (err) {
                    // ignore parse errors and fall through to registration
                }

                // No profile found - forward user to registration to create one
                router.push('/register')
            }
        } catch (error) {
            console.error('Wallet login failed:', error)
        }
    }

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!otpSent) {
            // Simulate sending OTP
            setOtpSent(true)
            return
        }

        // Simulate OTP verification
        if (otp === '123456') {
            // Simulate successful login - attempt to fetch user profile by phone-based id
            try {
                const phoneAddr = `phone:${phoneNumber}`
                const res = await fetch(`/api/users?address=${encodeURIComponent(phoneAddr)}`)
                if (res.ok) {
                    const profile = await res.json()
                    // Persist profile into Web3 context so other parts of app see logged-in user
                    setLocalUser(profile)
                    router.push(`/dashboard/${profile.role}`)
                    return
                }

                // If user not found, create a minimal consumer-like session locally
                const fallbackProfile: UserProfile = {
                    address: phoneAddr,
                    role: 'consumer' as UserRole,
                    name: phoneNumber,
                    phone: phoneNumber,
                    location: '',
                    verified: false
                }
                setLocalUser(fallbackProfile)
                alert(currentLang === 'en' ? 'Login successful! (Demo)' : 'लॉगिन सफल! (डेमो)')
                router.push(`/dashboard/${fallbackProfile.role}`)
            } catch (err) {
                console.error('Phone login failed:', err)
                alert(currentLang === 'en' ? 'Login failed' : 'लॉगिन विफल')
            }
        } else {
            alert(currentLang === 'en' ? 'Invalid OTP. Use 123456 for demo.' : 'अमान्य OTP। डेमो के लिए 123456 का उपयोग करें।')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm">
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
                            className="flex items-center space-x-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-md transition-colors"
                        >
                            <GlobeAltIcon className="w-4 h-4" />
                            <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-3xl">🌾</span>
                        </div>
                        <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Welcome Back' : 'वापस स्वागत है'}
                        </h2>
                        <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en'
                                ? 'Sign in to your KrashiAalok account'
                                : 'अपने कृषिआलोक खाते में साइन इन करें'}
                        </p>
                    </div>

                    {/* Login Methods Toggle */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="flex">
                            <button
                                onClick={() => setLoginMethod('wallet')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-l-xl transition-colors ${loginMethod === 'wallet'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    } ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                <WalletIcon className="w-5 h-5 mx-auto mb-1" />
                                {currentLang === 'en' ? 'Wallet Login' : 'वॉलेट लॉगिन'}
                            </button>
                            <button
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-r-xl transition-colors ${loginMethod === 'phone'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    } ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                <PhoneIcon className="w-5 h-5 mx-auto mb-1" />
                                {currentLang === 'en' ? 'Phone Login' : 'फोन लॉगिन'}
                            </button>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-xl shadow-sm border p-8">
                        {loginMethod === 'wallet' ? (
                            /* Wallet Login */
                            <div className="space-y-6">
                                <div className="text-center">
                                    <WalletIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className={`text-xl font-semibold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Connect Your Wallet' : 'अपना वॉलेट कनेक्ट करें'}
                                    </h3>
                                    <p className={`text-gray-600 text-sm ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en'
                                            ? 'Use your MetaMask wallet to securely sign in with blockchain technology'
                                            : 'ब्लॉकचेन तकनीक के साथ सुरक्षित रूप से साइन इन करने के लिए अपना MetaMask वॉलेट का उपयोग करें'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleWalletLogin}
                                    disabled={isLoading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>{currentLang === 'en' ? 'Connecting...' : 'कनेक्ट हो रहा है...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <WalletIcon className="w-5 h-5" />
                                            <span>{currentLang === 'en' ? 'Connect MetaMask' : 'MetaMask कनेक्ट करें'}</span>
                                        </>
                                    )}
                                </button>

                                <div className="space-y-3 text-center">
                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? "Don't have MetaMask?" : "MetaMask नहीं है?"}
                                    </p>
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                    >
                                        {currentLang === 'en' ? 'Download MetaMask' : 'MetaMask डाउनलोड करें'}
                                    </a>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className={`font-medium text-blue-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Why use wallet login?' : 'वॉलेट लॉगिन क्यों उपयोग करें?'}
                                    </h4>
                                    <ul className={`text-sm text-blue-800 space-y-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        <li>• {currentLang === 'en' ? 'Secure blockchain authentication' : 'सुरक्षित ब्लॉकचेन प्रमाणीकरण'}</li>
                                        <li>• {currentLang === 'en' ? 'No passwords to remember' : 'याद रखने के लिए कोई पासवर्ड नहीं'}</li>
                                        <li>• {currentLang === 'en' ? 'Full control of your data' : 'आपके डेटा का पूर्ण नियंत्रण'}</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            /* Phone Login */
                            <form onSubmit={handlePhoneLogin} className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Phone Number' : 'फोन नंबर'}
                                    </label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="+91 98765 43210"
                                            required
                                        />
                                    </div>
                                </div>

                                {!otpSent ? (
                                    <div>
                                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en'
                                                ? 'We will send a 6-digit OTP to this phone number to sign you in.'
                                                : 'हम आपको साइन इन करने के लिए इस फोन नंबर पर 6-अंकीय OTP भेजेंगे।'}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Enter OTP' : 'OTP दर्ज करें'}
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                            placeholder={currentLang === 'en' ? 'Enter 6-digit OTP (use 123456 for demo)' : '6-अंकीय OTP दर्ज करें (डेमो के लिए 123456 का उपयोग करें)'}
                                            required
                                        />
                                        <p className={`text-sm text-gray-600 mt-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en'
                                                ? `OTP sent to ${phoneNumber}. Didn't receive? `
                                                : `${phoneNumber} पर OTP भेजा गया। प्राप्त नहीं हुआ? `}
                                            <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                                                {currentLang === 'en' ? 'Resend' : 'फिर से भेजें'}
                                            </button>
                                        </p>
                                    </div>
                                )}

                                {/* No password needed for OTP login — removed Remember me / Forgot password */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="loading-dots">
                                            {currentLang === 'en' ? 'Signing In' : 'साइन इन हो रहा है'}
                                        </span>
                                    ) : (
                                        otpSent
                                            ? (currentLang === 'en' ? 'Verify OTP' : 'OTP सत्यापित करें')
                                            : (currentLang === 'en' ? 'Send OTP' : 'OTP भेजें')
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? "Don't have an account? " : "खाता नहीं है? "}
                            <Link href="/register" className={`text-green-600 hover:text-green-700 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Sign up here' : 'यहाँ साइन अप करें'}
                            </Link>
                        </p>
                    </div>

                    {/* Help Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className={`font-semibold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Need Help?' : 'मदद चाहिए?'}
                        </h3>
                        <p className={`text-sm text-gray-600 mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en'
                                ? 'Having trouble signing in? Contact our support team.'
                                : 'साइन इन करने में परेशानी? हमारी सहायता टीम से संपर्क करें।'}
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="tel:+91-1800-123-4567"
                                className={`text-sm text-green-600 hover:text-green-700 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {currentLang === 'en' ? 'Call Support' : 'सहायता कॉल करें'}
                            </a>
                            <span className="text-gray-300">|</span>
                            <Link
                                href="/help"
                                className={`text-sm text-green-600 hover:text-green-700 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {currentLang === 'en' ? 'Help Center' : 'सहायता केंद्र'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}