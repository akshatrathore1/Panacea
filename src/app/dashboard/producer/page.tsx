
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/Providers'
import Link from 'next/link'
import {
    PlusIcon,
    CubeIcon,
    ChartBarIcon,
    BanknotesIcon,
    SunIcon,
    BeakerIcon,
    UserGroupIcon,
    ArrowRightIcon,
    TagIcon,
    ShoppingCartIcon,
    BellIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline'
import LogoutButton from '@/components/LogoutButton'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import type { LanguageCode } from '@/lib/language'

const PRODUCER_NOTIFICATION_TEMPLATES = [
    {
        id: 'PROD-NOT-001',
        messages: {
            en: 'Intermediary confirmed pickup window for Wheat batch BATCH001',
            hi: 'गेंहू बैच BATCH001 के लिए पिकअप समय स्लॉट मध्यस्थ ने पुष्टि किया'
        },
        timestamps: {
            en: '1 hour ago',
            hi: '1 घंटे पहले'
        },
        isNew: true
    },
    {
        id: 'PROD-NOT-002',
        messages: {
            en: 'Soil health advisory available for upcoming mustard crop',
            hi: 'आगामी सरसों फसल के लिए मृदा स्वास्थ्य परामर्श उपलब्ध'
        },
        timestamps: {
            en: 'Yesterday',
            hi: 'कल'
        },
        isNew: false
    }
]

export default function ProducerDashboard() {
    const { t } = useTranslation()
    const router = useRouter()
    const { user } = useWeb3()
    const { language: currentLang } = useLanguage()
    const currentLangRef = useRef<LanguageCode>(currentLang)
    const [loading, setLoading] = useState(true)
    const notificationsUserToken = useMemo(() => {
        const keySource = (user?.address || user?.phone || 'anon').toString().toLowerCase()
        return keySource.replace(/[^a-z0-9:\-]/g, '-')
    }, [user?.address, user?.phone])

    const notificationsStorageKey = useMemo(
        () => `notifications-read-producer-${notificationsUserToken}`,
        [notificationsUserToken]
    )
    const notificationsSessionKey = useMemo(
        () => `notifications-session-producer-${notificationsUserToken}`,
        [notificationsUserToken]
    )
    const buildNotifications = (lang: LanguageCode) =>
        PRODUCER_NOTIFICATION_TEMPLATES.map((template) => ({
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

    useEffect(() => {
        // Allow phone-only users (not wallet-connected) to access producer dashboard.
        // Only redirect if there is no user or the role doesn't match.
        if (!loading && (!user || user.role !== 'producer')) {
            router.push('/')
        }
    }, [user, router, loading])

    useEffect(() => {
        if (user) setLoading(false)
    }, [user])

    const handleNotificationsClick = () => {
        setShowNotificationPopup((prev) => !prev)
    }

    useEffect(() => {
        setNotifications((prev) =>
            prev.map((notification) => {
                const template = PRODUCER_NOTIFICATION_TEMPLATES.find((t) => t.id === notification.id)
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

    // Mock data for demonstration
    const stats = {
        totalBatches: 12,
        activeBatches: 8,
        soldBatches: 4,
        totalEarnings: "₹45,680"
    }

    const recentBatches = [
        {
            id: 'BATCH001',
            cropType: 'Wheat',
            variety: 'Durum',
            weight: 500,
            status: 'For Sale',
            price: 2500,
            createdAt: '2024-01-15'
        },
        {
            id: 'BATCH002',
            cropType: 'Rice',
            variety: 'Basmati',
            weight: 300,
            status: 'Sold',
            price: 4500,
            createdAt: '2024-01-10'
        }
    ]

    const forumHighlights = [
        {
            id: 'storage',
            title: {
                en: 'Best practices for wheat storage',
                hi: 'गेहूं भंडारण की सर्वोत्तम प्रथाएं'
            },
            category: {
                en: 'Post-harvest Care',
                hi: 'फसलोत्तर देखभाल'
            },
            replies: 12,
            activity: {
                en: 'Active 3h ago',
                hi: '3 घंटे पहले सक्रिय'
            }
        },
        {
            id: 'organic',
            title: {
                en: 'Organic certification made simple',
                hi: 'जैविक प्रमाणन आसान बनाया'
            },
            category: {
                en: 'Compliance',
                hi: 'अनुपालन'
            },
            replies: 8,
            activity: {
                en: 'Answered yesterday',
                hi: 'उत्तर कल मिला'
            }
        },
        {
            id: 'buyers',
            title: {
                en: 'Finding reliable buyers this season',
                hi: 'इस सीजन विश्वसनीय खरीदार खोजें'
            },
            category: {
                en: 'Marketplace Tips',
                hi: 'बाज़ार सुझाव'
            },
            replies: 15,
            activity: {
                en: 'New replies today',
                hi: 'आज नए उत्तर'
            }
        },
        {
            id: 'inputs',
            title: {
                en: 'Recommended inputs for higher yield',
                hi: 'बेहतर उपज के लिए सुझाए इनपुट'
            },
            category: {
                en: 'Crop Advisory',
                hi: 'फसल सलाह'
            },
            replies: 6,
            activity: {
                en: 'Thread started 2d ago',
                hi: 'टॉपिक 2 दिन पहले शुरू हुआ'
            }
        }
    ]

    const quickActions = [
        {
            title: currentLang === 'en' ? 'Create New Batch' : 'नया बैच बनाएं',
            description: currentLang === 'en' ? 'Register new crop batch' : 'नई फसल बैच पंजीकृत करें',
            icon: PlusIcon,
            href: '/dashboard/producer/create-batch',
            color: 'bg-green-500'
        },
        {
            title: currentLang === 'en' ? 'Batch Inventory' : 'बैच सूची',
            description: currentLang === 'en' ? 'View & transfer batches' : 'बैच देखें और स्थानांतरण करें',
            icon: QrCodeIcon,
            href: '/dashboard/producer/batches',
            color: 'bg-teal-500'
        },
        {
            title: currentLang === 'en' ? 'My Listings' : 'मेरी सूचियाँ',
            description: currentLang === 'en' ? 'View all listings' : 'सभी सूचियाँ देखें',
            icon: CubeIcon,
            href: '/dashboard/producer/listings',
            color: 'bg-blue-500'
        },
        {
            title: currentLang === 'en' ? 'List for Sale' : 'बिक्री के लिए सूची',
            description: currentLang === 'en' ? 'Sell your produce' : 'अपना उत्पाद बेचें',
            icon: TagIcon,
            href: '/dashboard/producer/list',
            color: 'bg-orange-500'
        },
        {
            title: currentLang === 'en' ? 'Analytics' : 'विश्लेषण',
            description: currentLang === 'en' ? 'View sales data' : 'बिक्री डेटा देखें',
            icon: ChartBarIcon,
            href: '/dashboard/producer/analytics',
            color: 'bg-purple-500'
        }
    ]

    const governmentInfo = [
        {
            title: currentLang === 'en' ? 'Available Subsidies' : 'उपलब्ध सब्सिडी',
            amount: '₹15,000',
            description: currentLang === 'en' ? 'Seed subsidy for wheat' : 'गेहूं के लिए बीज सब्सिडी',
            action: currentLang === 'en' ? 'Apply Now' : 'अभी आवेदन करें'
        },
        {
            title: currentLang === 'en' ? 'Loan Offer' : 'ऋण प्रस्ताव',
            amount: '5.2% Interest',
            description: currentLang === 'en' ? 'Agricultural loan' : 'कृषि ऋण',
            action: currentLang === 'en' ? 'View Details' : 'विवरण देखें'
        }
    ]
    const [weatherData, setWeatherData] = useState({
        temperature: '—',
        humidity: '—',
        rainfall: '—',
        condition: currentLang === 'en' ? 'Loading...' : 'लोड हो रहा है...',
        city: currentLang === 'en' ? 'Loading...' : 'लोड हो रहा है...'
    })

    useEffect(() => {
        let mounted = true

        async function loadWeather() {
            try {
                let lat: number | null = null
                let lon: number | null = null

                // try to get browser geolocation with a short timeout
                if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
                    await new Promise((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                lat = pos.coords.latitude
                                lon = pos.coords.longitude
                                resolve(true)
                            },
                            () => resolve(true),
                            { timeout: 5000 }
                        )
                    })
                }

                const params = new URLSearchParams()
                if (lat && lon) {
                    params.set('lat', String(lat))
                    params.set('lon', String(lon))
                } else {
                    // fallback city
                    params.set('city', 'New Delhi')
                }

                const resp = await fetch(`/api/weather?${params.toString()}`)
                if (!mounted) return

                if (resp.ok) {
                    const json = await resp.json()
                    setWeatherData({
                        temperature: json.temperature ?? '—',
                        humidity: json.humidity ?? '—',
                        rainfall: json.rainfall ?? '—',
                        condition: json.condition ?? (currentLang === 'en' ? 'Unknown' : 'अज्ञात'),
                        city: json.location?.name ?? json.city ?? (currentLang === 'en' ? 'Unknown' : 'अज्ञात')
                    })
                } else {
                    console.error('Weather fetch error', resp.status)
                }
            } catch (err) {
                console.error('Failed to load weather', err)
            }
        }

        loadWeather()
        return () => { mounted = false }
    }, [currentLang])


    if (!user) {
        return <div>Loading...</div>
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
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {t('producer')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    ref={notificationsButtonRef}
                                    type="button"
                                    onClick={handleNotificationsClick}
                                    className="relative rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                        className={`px-4 py-3 text-sm ${notification.isNew ? 'bg-green-50' : 'bg-white'} border-t border-gray-100 first:border-t-0`}
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
                {/* Welcome Section */}
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
                        {currentLang === 'en'
                            ? 'Manage your crops and track your agricultural business'
                            : 'अपनी फसलों का प्रबंधन करें और अपने कृषि व्यवसाय को ट्रैक करें'}
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <CubeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    {currentLang === 'en' ? 'Total Batches' : 'कुल बैच'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBatches}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100">
                                <TagIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    {currentLang === 'en' ? 'Active Batches' : 'सक्रिय बैच'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeBatches}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <BeakerIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    {currentLang === 'en' ? 'Sold Batches' : 'बेचे गए बैच'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.soldBatches}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-orange-100">
                                <BanknotesIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    {currentLang === 'en' ? 'Total Earnings' : 'कुल आय'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <h2 className={`text-xl font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon
                                return (
                                    <Link
                                        key={index}
                                        href={action.href}
                                        className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start space-x-4">
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

                        {/* Discussion Forum */}
                        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl border border-blue-100 shadow-sm mb-8">
                            <div className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 rounded-full bg-blue-600">
                                            <UserGroupIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Discussion Forum' : 'चर्चा मंच'}
                                            </h2>
                                            <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en'
                                                    ? 'Learn from fellow producers, share advice, and discover trusted buyers.'
                                                    : 'अन्य उत्पादकों से सीखें, सुझाव साझा करें और विश्वसनीय खरीदारों से जुड़ें।'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard/community"
                                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        {currentLang === 'en' ? 'Join the conversation' : 'चर्चा में शामिल हों'}
                                    </Link>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {forumHighlights.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="rounded-lg border border-blue-100 bg-white/70 p-4 shadow-sm hover:border-blue-200 transition-colors"
                                        >
                                            <p className={`text-xs font-semibold uppercase tracking-wide text-blue-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? topic.category.en : topic.category.hi}
                                            </p>
                                            <h3 className={`mt-2 text-sm font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? topic.title.en : topic.title.hi}
                                            </h3>
                                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {currentLang === 'en'
                                                        ? `${topic.replies} replies`
                                                        : `${topic.replies} उत्तर`}
                                                </span>
                                                <span>{currentLang === 'en' ? topic.activity.en : topic.activity.hi}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Batches */}
                        <h2 className={`text-xl font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Recent Batches' : 'हाल के बैच'}
                        </h2>
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Batch ID' : 'बैच ID'}
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Crop' : 'फसल'}
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Weight' : 'वजन'}
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Status' : 'स्थिति'}
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Price/KG' : 'मूल्य/किग्रा'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentBatches.map((batch) => (
                                            <tr key={batch.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {batch.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{batch.cropType}</div>
                                                        <div className="text-sm text-gray-500">{batch.variety}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {batch.weight} kg
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${batch.status === 'Sold'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {batch.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{batch.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

                        {/* Weather Widget */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <SunIcon className="w-6 h-6 text-yellow-500 mr-2" />
                                <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Weather' : 'मौसम'}
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'City' : 'शहर'}
                                    </span>
                                    <span className="text-sm font-medium">{weatherData.city}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Temperature' : 'तापमान'}
                                    </span>
                                    <span className="text-sm font-medium">{weatherData.temperature}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Humidity' : 'आर्द्रता'}
                                    </span>
                                    <span className="text-sm font-medium">{weatherData.humidity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Rainfall' : 'वर्षा'}
                                    </span>
                                    <span className="text-sm font-medium">{weatherData.rainfall}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Condition' : 'स्थिति'}
                                    </span>
                                    <span className="text-sm font-medium">{weatherData.condition}</span>
                                </div>
                            </div>
                        </div>

                        {/* Government Information */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center mb-4">
                                <BanknotesIcon className="w-6 h-6 text-green-600 mr-2" />
                                <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Government Schemes' : 'सरकारी योजनाएं'}
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {governmentInfo.map((info, index) => (
                                    <div key={index} className="p-4 bg-green-50 rounded-lg">
                                        <h4 className={`font-medium text-green-900 mb-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {info.title}
                                        </h4>
                                        <p className="text-sm text-green-700 mb-2">{info.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-green-800">{info.amount}</span>
                                            <button className={`text-sm text-green-600 hover:text-green-800 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {info.action}
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