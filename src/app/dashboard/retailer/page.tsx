'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
    ShoppingCartIcon,
    CurrencyRupeeIcon,
    StarIcon,
    QrCodeIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'
import { formatNumber } from '@/lib/format'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { useWeb3 } from '@/components/Providers'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import type { LanguageCode } from '@/lib/language'

const RETAILER_NOTIFICATION_TEMPLATES = [
    {
        id: 'RET-NOT-001',
        messages: {
            en: 'Low stock warning for Fresh Vegetables batch KA-VEG-2024-011',
            hi: 'ताज़ी सब्ज़ी बैच KA-VEG-2024-011 के लिए कम स्टॉक चेतावनी'
        },
        timestamps: {
            en: 'Just now',
            hi: 'अभी अभी'
        },
        isNew: true
    },
    {
        id: 'RET-NOT-002',
        messages: {
            en: 'New customer request for stone-ground wheat flour',
            hi: 'पिसे हुए गेहूं के आटे के लिए नया ग्राहक अनुरोध'
        },
        timestamps: {
            en: '3 hours ago',
            hi: '3 घंटे पहले'
        },
        isNew: false
    }
]

const RETAILER_COMMODITY_TRANSLATIONS: Record<string, string> = {
    'Organic Wheat': 'जैविक गेहूं',
    'Basmati Rice': 'बासमती चावल',
    'Fresh Vegetables': 'ताज़ी सब्ज़ियाँ',
    'Organic Tomatoes': 'जैविक टमाटर',
    'Stone-Ground Wheat Flour': 'पिसा हुआ गेहूं का आटा'
}

export default function RetailerDashboard() {
    const { language: currentLang } = useLanguage()
    const currentLangRef = useRef<LanguageCode>(currentLang)
    const { user } = useWeb3()

    const notificationsUserToken = useMemo(() => {
        const keySource = (user?.address || user?.phone || 'anon').toString().toLowerCase()
        return keySource.replace(/[^a-z0-9:\-]/g, '-')
    }, [user?.address, user?.phone])

    const notificationsStorageKey = useMemo(
        () => `notifications-read-retailer-${notificationsUserToken}`,
        [notificationsUserToken]
    )
    const notificationsSessionKey = useMemo(
        () => `notifications-session-retailer-${notificationsUserToken}`,
        [notificationsUserToken]
    )

    const buildNotifications = (lang: LanguageCode) =>
        RETAILER_NOTIFICATION_TEMPLATES.map((template) => ({
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
                const template = RETAILER_NOTIFICATION_TEMPLATES.find((t) => t.id === notification.id)
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

    const translateCommodity = (value: string) =>
        currentLang === 'en' ? value : RETAILER_COMMODITY_TRANSLATIONS[value] ?? value

    const roleLabel = currentLang === 'en' ? 'Retailer' : 'रिटेलर'

    const welcomeSubtitle = currentLang === 'en'
        ? 'Manage store performance and enhance customer experience'
        : 'स्टोर प्रदर्शन प्रबंधित करें और अपने ग्राहकों के अनुभव को बेहतर बनाएं'

    // Mock data for retailer operations
    const stats = {
        totalProducts: 89,
        todaySales: 45230,
        lowStockAlerts: 5,
        customerSatisfaction: 4.6
    }

    const inventory = [
        {
            batchId: 'KA-WH-2024-003',
            product: 'Organic Wheat',
            farmer: 'Rajesh Kumar',
            quantity: '100 kg',
            remaining: '75 kg',
            price: 45,
            expiryDate: '2024-03-15',
            qualityScore: 9.2,
            status: 'in_stock',
            received: '2024-01-10'
        },
        {
            batchId: 'KA-RIC-2024-007',
            product: 'Basmati Rice',
            farmer: 'Sunita Devi',
            quantity: '50 kg',
            remaining: '20 kg',
            price: 85,
            expiryDate: '2024-04-20',
            qualityScore: 9.5,
            status: 'low_stock',
            received: '2024-01-08'
        },
        {
            batchId: 'KA-VEG-2024-011',
            product: 'Fresh Vegetables',
            farmer: 'Amit Singh',
            quantity: '25 kg',
            remaining: '0 kg',
            price: 65,
            expiryDate: '2024-01-18',
            qualityScore: 8.8,
            status: 'out_of_stock',
            received: '2024-01-12'
        }
    ]

    const customerRequests = [
        {
            id: 'REQ-001',
            customerName: 'Anita Gupta',
            productRequested: 'Organic Tomatoes',
            quantity: '10 kg',
            priceRange: '₹40-50/kg',
            timestamp: '2024-01-14 12:00',
            status: 'pending'
        },
        {
            id: 'REQ-002',
            customerName: 'Vikram Singh',
            productRequested: 'Stone-Ground Wheat Flour',
            quantity: '25 kg',
            priceRange: '₹32-38/kg',
            timestamp: '2024-01-14 10:30',
            status: 'pending'
        }
    ]

    const quickActions = [
        {
            id: 'retailer-feedback',
            title: currentLang === 'en' ? 'Customer Feedback' : 'ग्राहक प्रतिक्रिया',
            description:
                currentLang === 'en'
                    ? 'Review ratings, comments, and follow up from one place'
                    : 'रेटिंग, टिप्पणियाँ और फॉलो-अप एक ही स्थान पर देखें',
            icon: ChatBubbleLeftRightIcon,
            href: '/dashboard/retailer/feedback',
            color: 'bg-teal-500'
        },
        {
            id: 'retailer-analytics',
            title: currentLang === 'en' ? 'Analytics' : 'विश्लेषण',
            description:
                currentLang === 'en'
                    ? 'Track store performance trends'
                    : 'स्टोर प्रदर्शन रुझानों का विश्लेषण करें',
            icon: ChartBarIcon,
            href: '/dashboard/retailer/analytics',
            color: 'bg-purple-500'
        }
    ]

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock': return 'bg-green-100 text-green-800'
            case 'low_stock': return 'bg-yellow-100 text-yellow-800'
            case 'out_of_stock': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStockStatusText = (status: string) => {
        const statusMap = {
            'in_stock': currentLang === 'en' ? 'In Stock' : 'स्टॉक में',
            'low_stock': currentLang === 'en' ? 'Low Stock' : 'कम स्टॉक',
            'out_of_stock': currentLang === 'en' ? 'Out of Stock' : 'स्टॉक समाप्त'
        }
        return statusMap[status as keyof typeof statusMap] || status
    }

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
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
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
                                    className="relative rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                                <p className={`px-4 py-3 text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'No notifications yet' : 'अभी कोई अधिसूचना नहीं'}
                                                </p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 text-sm ${notification.isNew ? 'bg-purple-50' : 'bg-white'} border-t border-gray-100 first:border-t-0`}
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
                            <div className="p-3 rounded-lg bg-purple-100">
                                <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Products' : 'कुल उत्पाद'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100">
                                <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? "Today's Sales" : 'आज की बिक्री'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{formatNumber(stats.todaySales)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-yellow-100">
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Low Stock Alerts' : 'कम स्टॉक चेतावनी'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.lowStockAlerts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <StarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Customer Rating' : 'ग्राहक रेटिंग'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className={`text-xl font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action) => {
                                    const IconComponent = action.icon
                                    return (
                                        <Link
                                            key={action.id}
                                            href={action.href}
                                            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${action.color}`}>
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold text-gray-900 mb-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {action.title}
                                                    </h3>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        <div id="retailer-inventory" className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Current Inventory' : 'वर्तमान इन्वेंटरी'}
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {inventory.map((item) => (
                                    <div key={item.batchId} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className={`font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {translateCommodity(item.product)}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(item.status)}`}>
                                                        {getStockStatusText(item.status)}
                                                    </span>
                                                    <div className="flex items-center text-yellow-500">
                                                        <StarIcon className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-medium text-gray-700 ml-1">{item.qualityScore}</span>
                                                    </div>
                                                </div>
                                                <p className={`text-sm text-gray-600 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Farmer:' : 'किसान:'} {item.farmer} |
                                                    {currentLang === 'en' ? ' Batch:' : ' बैच:'} {item.batchId}
                                                </p>
                                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Stock:' : 'स्टॉक:'} {item.remaining} / {item.quantity} |
                                                    {currentLang === 'en' ? ' Price:' : ' मूल्य:'} ₹{item.price}/kg
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">₹{item.price}/kg</p>
                                                <p className="text-sm text-gray-500">
                                                    {currentLang === 'en' ? 'Expires:' : 'समाप्ति:'} {item.expiryDate}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${item.status === 'in_stock' ? 'bg-green-500' :
                                                            item.status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{
                                                            width: `${(parseInt(item.remaining) / parseInt(item.quantity)) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {Math.round((parseInt(item.remaining) / parseInt(item.quantity)) * 100)}%
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/trace/${item.batchId}`}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                                                >
                                                    <QrCodeIcon className="w-4 h-4" />
                                                    <span>{currentLang === 'en' ? 'Trace' : 'ट्रेस'}</span>
                                                </Link>
                                                {item.status === 'low_stock' && (
                                                    <button className={`bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Reorder' : 'पुनः ऑर्डर'}
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
                        {/* Marketplace Spotlight */}
                        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6 shadow-sm">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-orange-500 p-3">
                                        <ShoppingCartIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Marketplace' : 'बाज़ार'}
                                        </h3>
                                        <p className={`text-sm text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en'
                                                ? 'Browse verified demand, list your produce, and track negotiations in one place.'
                                                : 'सत्यापित मांग देखें, अपना उत्पाद सूचीबद्ध करें और सभी बातचीत एक ही स्थान पर ट्रैक करें।'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                                            {currentLang === 'en' ? 'Fresh listings' : 'नई सूचियाँ'}
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">18</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                                            {currentLang === 'en' ? 'Active buyers' : 'सक्रिय खरीदार'}
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">9</p>
                                    </div>
                                </div>
                                <Link
                                    href="/marketplace"
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
                                >
                                    {currentLang === 'en' ? 'Open Marketplace' : 'बाज़ार खोलें'}
                                </Link>
                            </div>
                        </div>

                        {/* Customer Requests */}
                        <div id="retailer-customer-requests" className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Customer Requests' : 'ग्राहक अनुरोध'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {customerRequests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">{request.customerName}</h4>
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                                {currentLang === 'en' ? 'Pending' : 'लंबित'}
                                            </span>
                                        </div>
                                        <p className={`text-sm text-gray-600 mb-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Product:' : 'उत्पाद:'} {translateCommodity(request.productRequested)}
                                        </p>
                                        <p className={`text-sm text-gray-600 mb-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Quantity:' : 'मात्रा:'} {request.quantity}
                                        </p>
                                        <p className={`text-sm text-gray-600 mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Budget:' : 'बजट:'} {request.priceRange}
                                        </p>
                                        <div className="flex space-x-2">
                                            <button className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Accept' : 'स्वीकार'}
                                            </button>
                                            <button className={`bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Decline' : 'अस्वीकार'}
                                            </button>
                                        </div>
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