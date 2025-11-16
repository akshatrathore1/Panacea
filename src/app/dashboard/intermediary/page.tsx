'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useMemo } from 'react'

import {
    ClipboardDocumentListIcon,
    ArchiveBoxIcon,
    CurrencyRupeeIcon,
    ShoppingCartIcon,
    PlusIcon,
    TagIcon,
    CubeIcon,
    ChartBarIcon,
    ArrowRightIcon,
    ScaleIcon,
    ClockIcon,
    BellIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline'
import LogoutButton from '@/components/LogoutButton'
import { formatNumber } from '@/lib/format'
import { useWeb3 } from '@/components/Providers'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import type { LanguageCode } from '@/lib/language'

type DealStatus = 'negotiating' | 'pending_approval' | 'confirmed'
type CommitmentStatus = 'awaiting_dispatch' | 'scheduled' | 'fulfilled'
type PurchaseStatus = 'released' | 'pending' | 'scheduled'

interface ProcurementDeal {
    id: string
    commodity: string
    farmerGroup: string
    origin: string
    quantity: string
    pricePerUnit: number
    status: DealStatus
    targetMargin: number
    nextActionEn: string
    nextActionHi: string
}

interface InventoryLot {
    lotId: string
    commodity: string
    grade: string
    quantity: string
    avgPurchasePrice: number
    targetSellingPrice: number
    committedQuantity: string
    location: string
}

interface RetailCommitment {
    id: string
    retailer: string
    market: string
    commodity: string
    quantity: string
    agreedPrice: number
    fulfillmentDate: string
    status: CommitmentStatus
}

interface RecentPurchase {
    id: string
    commodity: string
    quantity: string
    totalValue: number
    farmerGroup: string
    date: string
    paymentStatus: PurchaseStatus
}

const dealStatusMeta: Record<DealStatus, { className: string; label: { en: string; hi: string } }> = {
    negotiating: {
        className: 'bg-orange-100 text-orange-800',
        label: { en: 'Negotiating', hi: 'बातचीत चल रही है' }
    },
    pending_approval: {
        className: 'bg-amber-100 text-amber-800',
        label: { en: 'Pending Approval', hi: 'मंजूरी लंबित' }
    },
    confirmed: {
        className: 'bg-green-100 text-green-800',
        label: { en: 'Confirmed', hi: 'पुष्ट' }
    }
}

const commitmentStatusMeta: Record<CommitmentStatus, { className: string; label: { en: string; hi: string } }> = {
    awaiting_dispatch: {
        className: 'bg-indigo-100 text-indigo-800',
        label: { en: 'Awaiting Dispatch', hi: 'प्रेषण की प्रतीक्षा' }
    },
    scheduled: {
        className: 'bg-blue-100 text-blue-800',
        label: { en: 'Scheduled', hi: 'निर्धारित' }
    },
    fulfilled: {
        className: 'bg-green-100 text-green-800',
        label: { en: 'Fulfilled', hi: 'पूर्ण' }
    }
}

const purchaseStatusMeta: Record<PurchaseStatus, { className: string; label: { en: string; hi: string } }> = {
    released: {
        className: 'bg-green-100 text-green-800',
        label: { en: 'Payment Released', hi: 'भुगतान जारी' }
    },
    pending: {
        className: 'bg-yellow-100 text-yellow-800',
        label: { en: 'Payment Pending', hi: 'भुगतान लंबित' }
    },
    scheduled: {
        className: 'bg-blue-100 text-blue-800',
        label: { en: 'Scheduled Release', hi: 'निर्धारित जारी' }
    }
}

const INTERMEDIARY_NOTIFICATION_TEMPLATES = [
    {
        id: 'INT-NOT-001',
        messages: {
            en: 'Quality lab shared moisture report for Chickpeas lot LOT-094',
            hi: 'गुणवत्ता लैब ने चना लॉट LOT-094 की नमी रिपोर्ट साझा की'
        },
        timestamps: {
            en: '25 minutes ago',
            hi: '25 मिनट पहले'
        },
        isNew: true
    },
    {
        id: 'INT-NOT-002',
        messages: {
            en: 'Tur Dal dispatch to Annapurna Mart confirmed for 18 Jan',
            hi: '18 जनवरी के लिए तूर दाल डिस्पैच अन्नपूर्णा मार्ट हेतु पुष्टि की गई'
        },
        timestamps: {
            en: '2 hours ago',
            hi: '2 घंटे पहले'
        },
        isNew: false
    }
]

const INTERMEDIARY_COMMODITY_TRANSLATIONS: Record<string, string> = {
    'Chickpeas (Desi)': 'चना (देसी)',
    'Chickpeas': 'चना',
    'Tur Dal': 'तूर दाल',
    'Onion (Red) Grade A': 'लाल प्याज़ ग्रेड A',
    'Onion (Red)': 'लाल प्याज़'
}

export default function IntermediaryDashboard() {
    const { language: currentLang } = useLanguage()
    const currentLangRef = useRef<LanguageCode>(currentLang)
    const { user } = useWeb3()

    const notificationsUserToken = useMemo(() => {
        const keySource = (user?.address || user?.phone || 'anon').toString().toLowerCase()
        return keySource.replace(/[^a-z0-9:\-]/g, '-')
    }, [user?.address, user?.phone])

    const notificationsStorageKey = useMemo(
        () => `notifications-read-intermediary-${notificationsUserToken}`,
        [notificationsUserToken]
    )
    const notificationsSessionKey = useMemo(
        () => `notifications-session-intermediary-${notificationsUserToken}`,
        [notificationsUserToken]
    )

    const buildNotifications = (lang: LanguageCode) =>
        INTERMEDIARY_NOTIFICATION_TEMPLATES.map((template) => ({
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
        setNotifications((prev) =>
            prev.map((notification) => {
                const template = INTERMEDIARY_NOTIFICATION_TEMPLATES.find((t) => t.id === notification.id)
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

    const handleNotificationsClick = () => {
        setShowNotificationPopup((prev) => !prev)
    }

    const roleLabel = currentLang === 'en' ? 'Intermediary' : 'मध्यस्थ'

    const welcomeSubtitle = currentLang === 'en'
        ? 'Aggregate crops, close purchase deals, and service your retailer network'
        : 'फसलें एकत्र करें, खरीद सौदों को अंतिम रूप दें और अपने रिटेल नेटवर्क को सेवा दें'

    const stats = {
        activeContracts: 12,
        availableInventory: 184,
        monthlySpend: 325000,
        pendingRetailOrders: 9
    }

    const metricTonnesLabel = currentLang === 'en' ? 'Metric Tonnes' : 'मेट्रिक टन'

    const translateCommodity = (value: string) =>
        currentLang === 'en' ? value : INTERMEDIARY_COMMODITY_TRANSLATIONS[value] ?? value

    const procurementDeals: ProcurementDeal[] = [
        {
            id: 'DEAL-2024-031',
            commodity: 'Chickpeas (Desi)',
            farmerGroup: 'Shivam FPO',
            origin: currentLang === 'en' ? 'Vidisha, Madhya Pradesh' : 'विदिशा, मध्य प्रदेश',
            quantity: currentLang === 'en' ? '18 Metric Tonnes' : '18 मेट्रिक टन',
            pricePerUnit: 52,
            status: 'negotiating',
            targetMargin: 8.5,
            nextActionEn: 'Share revised offer for moisture adjustment',
            nextActionHi: 'नमी समायोजन के लिए संशोधित प्रस्ताव साझा करें'
        },
        {
            id: 'DEAL-2024-027',
            commodity: 'Tur Dal',
            farmerGroup: 'Nanded Pulse Collective',
            origin: currentLang === 'en' ? 'Nanded, Maharashtra' : 'नांदेड़, महाराष्ट्र',
            quantity: currentLang === 'en' ? '12 Metric Tonnes' : '12 मेट्रिक टन',
            pricePerUnit: 78,
            status: 'pending_approval',
            targetMargin: 11.2,
            nextActionEn: 'Awaiting FPO board confirmation',
            nextActionHi: 'FPO बोर्ड पुष्टि की प्रतीक्षा'
        },
        {
            id: 'DEAL-2024-020',
            commodity: 'Onion (Red) Grade A',
            farmerGroup: 'Lasalgaon Growers Co-op',
            origin: currentLang === 'en' ? 'Lasalgaon, Maharashtra' : 'लासलगांव, महाराष्ट्र',
            quantity: currentLang === 'en' ? '25 Metric Tonnes' : '25 मेट्रिक टन',
            pricePerUnit: 28,
            status: 'confirmed',
            targetMargin: 7.3,
            nextActionEn: 'Arrange staggered pickup schedule with transport partner',
            nextActionHi: 'परिवहन भागीदार के साथ चरणबद्ध पिकअप समय तय करें'
        }
    ]

    const inventoryLots: InventoryLot[] = [
        {
            lotId: 'LOT-102',
            commodity: 'Tur Dal',
            grade: 'A+',
            quantity: currentLang === 'en' ? '12 Metric Tonnes' : '12 मेट्रिक टन',
            avgPurchasePrice: 74,
            targetSellingPrice: 84,
            committedQuantity: currentLang === 'en' ? '5 Metric Tonnes' : '5 मेट्रिक टन',
            location: currentLang === 'en' ? 'Nagpur Aggregation Hub' : 'नागपुर एग्रीगेशन हब'
        },
        {
            lotId: 'LOT-094',
            commodity: 'Chickpeas',
            grade: 'Fair Average',
            quantity: currentLang === 'en' ? '9 Metric Tonnes' : '9 मेट्रिक टन',
            avgPurchasePrice: 50,
            targetSellingPrice: 57,
            committedQuantity: currentLang === 'en' ? '0 Metric Tonnes' : '0 मेट्रिक टन',
            location: currentLang === 'en' ? 'Bhopal Warehouse' : 'भोपाल गोदाम'
        },
        {
            lotId: 'LOT-089',
            commodity: 'Onion (Red)',
            grade: 'Export',
            quantity: currentLang === 'en' ? '16 Metric Tonnes' : '16 मेट्रिक टन',
            avgPurchasePrice: 27,
            targetSellingPrice: 33,
            committedQuantity: currentLang === 'en' ? '12 Metric Tonnes' : '12 मेट्रिक टन',
            location: currentLang === 'en' ? 'Nashik Cold Store' : 'नासिक कोल्ड स्टोर'
        }
    ]

    const retailCommitments: RetailCommitment[] = [
        {
            id: 'RET-PO-221',
            retailer: 'Annapurna Mart',
            market: currentLang === 'en' ? 'Pune' : 'पुणे',
            commodity: 'Tur Dal',
            quantity: currentLang === 'en' ? '5 Metric Tonnes' : '5 मेट्रिक टन',
            agreedPrice: 86,
            fulfillmentDate: currentLang === 'en' ? '18 Jan 2024' : '18 जन 2024',
            status: 'awaiting_dispatch'
        },
        {
            id: 'RET-PO-217',
            retailer: 'City Bazaar',
            market: currentLang === 'en' ? 'Nagpur' : 'नागपुर',
            commodity: 'Chickpeas',
            quantity: currentLang === 'en' ? '3 Metric Tonnes' : '3 मेट्रिक टन',
            agreedPrice: 60,
            fulfillmentDate: currentLang === 'en' ? '20 Jan 2024' : '20 जन 2024',
            status: 'scheduled'
        },
        {
            id: 'RET-PO-210',
            retailer: 'Fresh Basket',
            market: currentLang === 'en' ? 'Indore' : 'इंदौर',
            commodity: 'Onion (Red)',
            quantity: currentLang === 'en' ? '10 Metric Tonnes' : '10 मेट्रिक टन',
            agreedPrice: 35,
            fulfillmentDate: currentLang === 'en' ? '15 Jan 2024' : '15 जन 2024',
            status: 'fulfilled'
        }
    ]

    const recentPurchases: RecentPurchase[] = [
        {
            id: 'PUR-2024-078',
            commodity: 'Onion (Red) Grade A',
            quantity: currentLang === 'en' ? '25 Metric Tonnes' : '25 मेट्रिक टन',
            totalValue: 745000,
            farmerGroup: 'Nashik Growers Cooperative',
            date: currentLang === 'en' ? '13 Jan 2024' : '13 जन 2024',
            paymentStatus: 'released'
        },
        {
            id: 'PUR-2024-074',
            commodity: 'Tur Dal',
            quantity: currentLang === 'en' ? '8 Metric Tonnes' : '8 मेट्रिक टन',
            totalValue: 592000,
            farmerGroup: 'Wardha Pulses FPC',
            date: currentLang === 'en' ? '11 Jan 2024' : '11 जन 2024',
            paymentStatus: 'pending'
        },
        {
            id: 'PUR-2024-071',
            commodity: 'Chickpeas (Desi)',
            quantity: currentLang === 'en' ? '6 Metric Tonnes' : '6 मेट्रिक टन',
            totalValue: 312000,
            farmerGroup: 'Sehore Farmer Producer Co.',
            date: currentLang === 'en' ? '08 Jan 2024' : '08 जन 2024',
            paymentStatus: 'scheduled'
        }
    ]

    const quickActions = [
        {
            id: 'create-batch',
            title: currentLang === 'en' ? 'Create New Batch' : 'नया बैच बनाएं',
            description: currentLang === 'en' ? 'Register new crop batch' : 'नई फसल बैच पंजीकृत करें',
            icon: PlusIcon,
            href: '/dashboard/intermediary/create-batch',
            color: 'bg-green-500'
        },
        {
            id: 'batches',
            title: currentLang === 'en' ? 'Batch Inventory' : 'बैच सूची',
            description: currentLang === 'en' ? 'View & transfer batches' : 'बैच देखें और स्थानांतरण करें',
            icon: QrCodeIcon,
            href: '/dashboard/intermediary/batches',
            color: 'bg-teal-500'
        },
        {
            id: 'listings',
            title: currentLang === 'en' ? 'My Listings' : 'मेरी सूचियाँ',
            description: currentLang === 'en' ? 'View all listings' : 'सभी सूचियाँ देखें',
            icon: CubeIcon,
            href: '/dashboard/intermediary/listings',
            color: 'bg-blue-500'
        },
        {
            id: 'list',
            title: currentLang === 'en' ? 'List for Sale' : 'बिक्री के लिए सूची',
            description: currentLang === 'en' ? 'Sell your produce' : 'अपना उत्पाद बेचें',
            icon: TagIcon,
            href: '/dashboard/intermediary/list',
            color: 'bg-orange-500'
        },
        {
            id: 'analytics',
            title: currentLang === 'en' ? 'Analytics' : 'विश्लेषण',
            description: currentLang === 'en' ? 'View sales data' : 'बिक्री डेटा देखें',
            icon: ChartBarIcon,
            href: '/dashboard/intermediary/analytics',
            color: 'bg-purple-500'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
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
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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
                                    className="relative rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-amber-100">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Active Purchase Deals' : 'सक्रिय खरीद सौदे'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <ArchiveBoxIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Available Inventory' : 'उपलब्ध भंडार'}
                                </p>
                                <div className="flex items-baseline gap-2 text-gray-900">
                                    <span className="text-2xl font-bold">{formatNumber(stats.availableInventory)}</span>
                                    <span className="text-sm font-medium text-gray-500">{metricTonnesLabel}</span>
                                </div>
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
                                    {currentLang === 'en' ? 'Monthly Spend' : 'मासिक व्यय'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{formatNumber(stats.monthlySpend)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Pending Retail Orders' : 'लंबित रिटेल ऑर्डर'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingRetailOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
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
                        </section>

                        <section id="intermediary-procurement" className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Active Procurement Deals' : 'सक्रिय खरीदारी सौदे'}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {procurementDeals.map((deal) => {
                                    const statusMeta = dealStatusMeta[deal.status]
                                    return (
                                        <div key={deal.id} className="p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                            {translateCommodity(deal.commodity)}
                                                        </h3>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                                                            {statusMeta.label[currentLang]}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Deal ID:' : 'सौदा ID:'} {deal.id} · {deal.farmerGroup} · {deal.origin}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">{currentLang === 'en' ? 'Offer Price' : 'प्रस्ताव मूल्य'}</p>
                                                    <p className="text-lg font-semibold text-gray-900">₹{formatNumber(deal.pricePerUnit)}/kg</p>
                                                    <p className="text-xs text-gray-500">{currentLang === 'en' ? `Target margin ${deal.targetMargin}%` : `लक्षित मार्जिन ${deal.targetMargin}%`}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                                <div className={`flex items-center gap-3 text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    <ScaleIcon className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {currentLang === 'en' ? 'Quantity' : 'मात्रा'}: {deal.quantity}
                                                    </span>
                                                </div>
                                                <div className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Next action:' : 'अगला कार्य:'} {currentLang === 'en' ? deal.nextActionEn : deal.nextActionHi}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <section id="intermediary-inventory" className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Recent Purchases' : 'हाल की खरीदारी'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {recentPurchases.map((purchase) => {
                                    const statusMeta = purchaseStatusMeta[purchase.paymentStatus]
                                    return (
                                        <div key={purchase.id} className="border rounded-lg p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{purchase.date}</p>
                                                    <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {translateCommodity(purchase.commodity)}
                                                    </h3>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{purchase.farmerGroup}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Quantity' : 'मात्रा'}
                                                    </p>
                                                    <p className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{purchase.quantity}</p>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>₹{formatNumber(purchase.totalValue)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                                                    {statusMeta.label[currentLang]}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

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

                        <section id="intermediary-commitments" className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Inventory Position' : 'भंडार स्थिति'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {inventoryLots.map((lot) => (
                                    <div key={lot.lotId} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {translateCommodity(lot.commodity)}
                                                </h4>
                                                <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Lot' : 'लॉट'} {lot.lotId} · {lot.grade}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{lot.quantity}</p>
                                                <p className={`text-xs text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{lot.location}</p>
                                            </div>
                                        </div>
                                        <div className={`mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            <div>
                                                {currentLang === 'en' ? 'Avg purchase' : 'औसत खरीद'}: ₹{formatNumber(lot.avgPurchasePrice)}/kg
                                            </div>
                                            <div>
                                                {currentLang === 'en' ? 'Target sell' : 'लक्षित बिक्री'}: ₹{formatNumber(lot.targetSellingPrice)}/kg
                                            </div>
                                            <div>
                                                {currentLang === 'en' ? 'Committed' : 'प्रतिबद्ध'}: {lot.committedQuantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Retail Commitments' : 'रिटेल प्रतिबद्धताएँ'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {retailCommitments.map((commitment) => {
                                    const statusMeta = commitmentStatusMeta[commitment.status]
                                    return (
                                        <div key={commitment.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className={`font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{commitment.retailer}</h4>
                                                    <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {commitment.market} · {translateCommodity(commitment.commodity)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{commitment.quantity}</p>
                                                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>₹{formatNumber(commitment.agreedPrice)}/kg</p>
                                                </div>
                                            </div>
                                            <div className={`mt-3 flex items-center justify-between text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                                    <span>{currentLang === 'en' ? 'Fulfillment' : 'पूर्ति'}: {commitment.fulfillmentDate}</span>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                                                    {statusMeta.label[currentLang]}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
