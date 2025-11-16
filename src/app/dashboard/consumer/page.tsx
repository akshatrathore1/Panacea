'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/Providers'
import {
    ShoppingBagIcon,
    HeartIcon,
    QrCodeIcon,
    StarIcon,
    BellIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import type { LanguageCode } from '@/lib/language'

const CONSUMER_NOTIFICATION_TEMPLATES = [
    {
        id: 'NOT-001',
        messages: {
            en: 'Price dropped for Organic Apples - Now ₹120/kg',
            hi: 'जैविक सेब की कीमत कम हो गई - अब ₹120/किग्रा'
        },
        timestamps: {
            en: '2 hours ago',
            hi: '2 घंटे पहले'
        },
        isNew: true
    },
    {
        id: 'NOT-002',
        messages: {
            en: 'New organic vegetables available from Amit Singh',
            hi: 'अमित सिंह से नई जैविक सब्जियां उपलब्ध हैं'
        },
        timestamps: {
            en: '1 day ago',
            hi: '1 दिन पहले'
        },
        isNew: false
    }
]

export default function ConsumerDashboard() {
    const router = useRouter()
    const { user } = useWeb3()
    const { language: currentLang } = useLanguage()
    const currentLangRef = useRef<LanguageCode>(currentLang)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) setLoading(false)
    }, [user])

    useEffect(() => {
        // redirect to home if not authenticated as consumer
        if (!loading && (!user || user.role !== 'consumer')) {
            router.push('/')
        }
    }, [user, router, loading])

    // Mock data for consumer activities
    const ratingsProvided = [
        {
            id: 'RAT-2024-001',
            product: 'Organic Wheat',
            batchId: 'KA-WH-2024-003',
            rating: 5,
            feedback: currentLang === 'en'
                ? 'Excellent quality and freshness'
                : 'उत्कृष्ट गुणवत्ता और ताजगी',
            date: '2024-01-12'
        },
        {
            id: 'RAT-2024-002',
            product: 'Basmati Rice',
            batchId: 'KA-RIC-2024-007',
            rating: 4,
            feedback: currentLang === 'en'
                ? 'Great aroma, slightly firm texture'
                : 'बेहतरीन सुगंध, थोड़ा कड़ा बनावट',
            date: '2024-01-10'
        }
    ]

    const roleLabel = currentLang === 'en' ? 'Consumer' : 'उपभोक्ता'

    const welcomeSubtitle = currentLang === 'en'
        ? 'Discover trusted produce and track your purchases'
        : 'विश्वसनीय उत्पाद खोजें और अपनी खरीदारी को ट्रैक करें'

    const stats = {
        totalPurchases: 23,
        savedProducts: 8,
        trackedItems: 5,
        ratingsSubmitted: ratingsProvided.length
    }

    const recentPurchases = [
        {
            id: 'PUR-2024-045',
            batchId: 'KA-WH-2024-003',
            product: 'Organic Wheat',
            farmer: 'Rajesh Kumar',
            retailer: 'Fresh Mart Delhi',
            quantity: '5 kg',
            price: 225,
            purchaseDate: '2024-01-12',
            qualityScore: 9.2,
            rating: 5
        },
        {
            id: 'PUR-2024-046',
            batchId: 'KA-RIC-2024-007',
            product: 'Basmati Rice',
            farmer: 'Sunita Devi',
            retailer: 'Organic Store Mumbai',
            quantity: '2 kg',
            price: 170,
            purchaseDate: '2024-01-10',
            qualityScore: 9.5,
            rating: 5
        },
        {
            id: 'PUR-2024-047',
            batchId: 'KA-VEG-2024-011',
            product: 'Fresh Vegetables',
            farmer: 'Amit Singh',
            retailer: 'Green Valley Store',
            quantity: '3 kg',
            price: 195,
            purchaseDate: '2024-01-14',
            qualityScore: 8.8,
            rating: null
        }
    ]

    const savedProducts = [
        {
            batchId: 'KA-FRT-2024-021',
            product: 'Organic Apples',
            farmer: 'Meera Sharma',
            retailer: 'Nature Fresh Store',
            price: 120,
            location: 'Shimla, HP',
            qualityScore: 9.0
        },
        {
            batchId: 'KA-JAG-2024-016',
            product: 'Organic Jaggery',
            farmer: 'Shakti Farmer Collective',
            retailer: 'Manduva Naturals',
            price: 95,
            location: 'Kolhapur, Maharashtra',
            qualityScore: 9.3
        }
    ]

    const quickActions = [
        {
            id: 'scan-qr',
            title: {
                en: 'Scan QR Code',
                hi: 'QR कोड स्कैन करें'
            },
            description: {
                en: 'Verify product authenticity before you buy',
                hi: 'खरीदने से पहले उत्पाद की प्रामाणिकता सत्यापित करें'
            },
            icon: QrCodeIcon,
            color: 'bg-indigo-500'
        },
        {
            id: 'find-stores',
            title: {
                en: 'Find Local Stores',
                hi: 'स्थानीय स्टोर खोजें'
            },
            description: {
                en: 'Discover trusted retailers near you',
                hi: 'अपने आसपास विश्वसनीय रिटेलर खोजें'
            },
            icon: AdjustmentsHorizontalIcon,
            color: 'bg-green-500'
        }
    ]

    const notificationsUserToken = useMemo(() => {
        const keySource = (user?.address || user?.phone || 'anon').toString().toLowerCase()
        return keySource.replace(/[^a-z0-9:\-]/g, '-')
    }, [user?.address, user?.phone])

    const notificationsStorageKey = useMemo(
        () => `notifications-read-consumer-${notificationsUserToken}`,
        [notificationsUserToken]
    )
    const notificationsSessionKey = useMemo(
        () => `notifications-session-consumer-${notificationsUserToken}`,
        [notificationsUserToken]
    )

    const buildNotifications = (lang: LanguageCode) =>
        CONSUMER_NOTIFICATION_TEMPLATES.map((template) => ({
            id: template.id,
            message: template.messages[lang] ?? template.messages.en,
            timestamp: template.timestamps[lang] ?? template.timestamps.en,
            isNew: template.isNew
        }))

    const [notifications, setNotifications] = useState(() => buildNotifications(currentLang))
    const [showNotificationPopup, setShowNotificationPopup] = useState(false)
    const notificationsButtonRef = useRef<HTMLButtonElement | null>(null)
    const notificationsPanelRef = useRef<HTMLDivElement | null>(null)
    const [hasSeenNotifications, setHasSeenNotifications] = useState(false)

    const handleNotificationsClick = () => {
        setShowNotificationPopup((prev) => !prev)
    }

    useEffect(() => {
        setNotifications((prev) =>
            prev.map((notification) => {
                const template = CONSUMER_NOTIFICATION_TEMPLATES.find((t) => t.id === notification.id)
                if (!template) return notification
                return {
                    ...notification,
                    message: template.messages[currentLang] ?? template.messages.en,
                    timestamp: template.timestamps[currentLang] ?? template.timestamps.en
                }
            })
        )
    }, [currentLang])

    useEffect(() => {
        currentLangRef.current = currentLang
    }, [currentLang])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const storedStatus = window.localStorage.getItem(notificationsStorageKey)
        const sessionStatus = window.sessionStorage.getItem(notificationsSessionKey)

        if (storedStatus === 'dismissed' || sessionStatus === 'dismissed') {
            setHasSeenNotifications(true)
            setNotifications((prev) => prev.map((notification) => ({ ...notification, isNew: false })))
        } else {
            setHasSeenNotifications(false)
            if (!sessionStatus) {
                window.sessionStorage.setItem(notificationsSessionKey, 'pending')
            }
        }
    }, [notificationsStorageKey, notificationsSessionKey])

    useEffect(() => {
        setNotifications(buildNotifications(currentLangRef.current))
    }, [notificationsStorageKey])

    useEffect(() => {
        if (!showNotificationPopup) return
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isNew: false })))
        setHasSeenNotifications(true)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(notificationsStorageKey, 'dismissed')
            window.sessionStorage.setItem(notificationsSessionKey, 'dismissed')
        }
    }, [showNotificationPopup, notificationsStorageKey, notificationsSessionKey])

    useEffect(() => {
        if (!showNotificationPopup) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (notificationsPanelRef.current?.contains(target)) return
            if (notificationsButtonRef.current?.contains(target)) return
            setShowNotificationPopup(false)
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowNotificationPopup(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showNotificationPopup])

    const hasUnreadNotifications = !hasSeenNotifications && notifications.some((notification) => notification.isNew)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="text-2xl">🌾</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                                </span>
                            </Link>
                            <div className="text-sm text-gray-500">
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                    {roleLabel}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    ref={notificationsButtonRef}
                                    type="button"
                                    onClick={handleNotificationsClick}
                                    className="relative rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-haspopup="true"
                                    aria-expanded={showNotificationPopup}
                                    aria-label={currentLang === 'en' ? 'View notifications' : 'अधिसूचनाएं देखें'}
                                >
                                    <BellIcon className="w-6 h-6" />
                                    {hasUnreadNotifications && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500"></span>
                                    )}
                                </button>
                                {showNotificationPopup && (
                                    <div
                                        ref={notificationsPanelRef}
                                        className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <h3 className={`text-sm font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Notifications' : 'अधिसूचनाएं'}
                                            </h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto py-2">
                                            {notifications.length === 0 ? (
                                                <p className="px-4 py-3 text-sm text-gray-500">
                                                    {currentLang === 'en' ? 'No notifications yet' : 'अभी कोई अधिसूचना नहीं'}
                                                </p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 text-sm ${notification.isNew ? 'bg-blue-50' : 'bg-white'} border-t border-gray-100 first:border-t-0`}
                                                    >
                                                        <p className={`text-gray-800 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">{notification.timestamp}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <LogoutButton />
                            <LanguageToggle />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? user?.name
                                ? `Welcome back, ${user.name}!`
                                : 'Welcome back!'
                            : user?.name
                                ? `स्वागत है, ${user.name}!`
                                : 'फिर से स्वागत है!'}
                    </h1>
                    <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {welcomeSubtitle}
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-indigo-100">
                                <ShoppingBagIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Purchases' : 'कुल खरीदारी'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-pink-100">
                                <HeartIcon className="w-6 h-6 text-pink-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Saved Products' : 'सेव किए गए उत्पाद'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.savedProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <QrCodeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Tracked Items' : 'ट्रैक किए गए आइटम'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.trackedItems}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-yellow-100">
                                <StarIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Ratings Provided' : 'दी गई रेटिंग्स'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.ratingsSubmitted}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className={`text-xl font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon
                                    return (
                                        <div key={action.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2.5 rounded-lg ${action.color}`}>
                                                    <ActionIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold text-gray-900 mb-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {action.title[currentLang]}
                                                    </h3>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {action.description[currentLang]}
                                                    </p>
                                                </div>
                                                <ArrowRightIcon className="w-5 h-5 text-gray-300" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Recent Purchases' : 'हाल की खरीदारी'}
                                    </h2>
                                    {/* Removed header button; Marketplace is now available as a quick-action card in the sidebar */}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentPurchases.map((purchase) => (
                                    <div key={purchase.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{purchase.product}</h3>
                                                    <div className="flex items-center text-yellow-500">
                                                        <StarIcon className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-medium text-gray-700 ml-1">{purchase.qualityScore}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {currentLang === 'en' ? 'Purchase ID:' : 'खरीदारी ID:'} {purchase.id} |
                                                    {currentLang === 'en' ? ' Batch:' : ' बैच:'} {purchase.batchId}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {currentLang === 'en' ? 'Farmer:' : 'किसान:'} {purchase.farmer} |
                                                    {currentLang === 'en' ? ' Store:' : ' स्टोर:'} {purchase.retailer}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">₹{purchase.price}</p>
                                                <p className="text-sm text-gray-500">{purchase.quantity}</p>
                                                <p className="text-sm text-gray-500">{purchase.purchaseDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {purchase.rating && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                            {currentLang === 'en' ? 'Your rating:' : 'आपकी रेटिंग:'}
                                                        </span>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < purchase.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/trace/${purchase.batchId}`}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                                                >
                                                    <QrCodeIcon className="w-4 h-4" />
                                                    <span>{currentLang === 'en' ? 'Trace' : 'ट्रेस'}</span>
                                                </Link>
                                                {!purchase.rating && (
                                                    <button className={`bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Rate Product' : 'उत्पाद रेट करें'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Ratings Provided' : 'दी गई रेटिंग्स'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {ratingsProvided.map((rating) => (
                                    <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{rating.product}</h4>
                                                <p className="text-sm text-gray-600">{rating.batchId}</p>
                                            </div>
                                            <div className="flex items-center text-yellow-500">
                                                <StarIcon className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium text-gray-700 ml-1">{rating.rating}</span>
                                            </div>
                                        </div>
                                        <p className={`text-sm text-gray-600 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {rating.feedback}
                                        </p>
                                        <p className="text-xs text-gray-500">{rating.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Saved Products */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Saved Products' : 'सेव किए गए उत्पाद'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {savedProducts.map((product) => (
                                    <div key={product.batchId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">{product.product}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {currentLang === 'en' ? 'Farmer:' : 'किसान:'} {product.farmer}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {currentLang === 'en' ? 'Store:' : 'स्टोर:'} {product.retailer}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="font-medium text-gray-900">₹{product.price}/kg</span>
                                            <div className="flex items-center text-yellow-500">
                                                <StarIcon className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium text-gray-700 ml-1">{product.qualityScore}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/trace/${product.batchId}`}
                                            className={`w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center block ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        >
                                            {currentLang === 'en' ? 'View Trace Details' : 'ट्रेस विवरण देखें'}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}