'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/Providers'
import { useTranslation } from 'react-i18next'
import {
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    ClockIcon,
    QrCodeIcon,
    MapPinIcon,
    StarIcon,
    BellIcon,
    GlobeAltIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function ConsumerDashboard() {
    const { i18n } = useTranslation()
    const router = useRouter()
    const { user } = useWeb3()
    const [currentLang, setCurrentLang] = useState('en')
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

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

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
            status: 'collected',
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
            status: 'collected',
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
            status: 'ready_for_pickup',
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
            qualityScore: 9.0,
            inStock: true
        },
        {
            batchId: 'KA-MIL-2024-016',
            product: 'Fresh Milk',
            farmer: 'Dairy Farm Co-op',
            retailer: 'Pure Dairy',
            price: 55,
            location: 'Amul, Gujarat',
            qualityScore: 9.3,
            inStock: true
        }
    ]

    const notifications = [
        {
            id: 'NOT-001',
            type: 'price_drop',
            message: currentLang === 'en'
                ? 'Price dropped for Organic Apples - Now ₹120/kg'
                : 'ऑर्गेनिक सेब की कीमत कम हो गई - अब ₹120/किग्रा',
            timestamp: '2 hours ago',
            isNew: true
        },
        {
            id: 'NOT-002',
            type: 'new_product',
            message: currentLang === 'en'
                ? 'New organic vegetables available from Amit Singh'
                : 'अमित सिंह से नई जैविक सब्जियां उपलब्ध हैं',
            timestamp: '1 day ago',
            isNew: false
        }
    ]

    const [showNotificationDot, setShowNotificationDot] = useState(notifications.some((notification) => notification.isNew))
    const notificationsRef = useRef<HTMLDivElement | null>(null)

    const handleNotificationsClick = () => {
        if (notificationsRef.current) {
            notificationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            notificationsRef.current.focus?.()
        }
        setShowNotificationDot(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'collected': return 'bg-green-100 text-green-800'
            case 'ready_for_pickup': return 'bg-indigo-100 text-indigo-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        const statusMap = {
            'collected': currentLang === 'en' ? 'Collected' : 'संग्रहित',
            'ready_for_pickup': currentLang === 'en' ? 'Ready for Pickup' : 'पिकअप के लिए तैयार',
            'pending': currentLang === 'en' ? 'Pending' : 'लंबित'
        }
        return statusMap[status as keyof typeof statusMap] || status
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Consumer Dashboard' : 'उपभोक्ता डैशबोर्ड'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? `Welcome back, ${user?.name ?? 'Priya Sharma'}!`
                                        : `वापस स्वागत है, ${user?.name ?? 'प्रिया शर्मा'}!`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={handleNotificationsClick}
                                className="relative rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label={currentLang === 'en' ? 'View notifications' : 'अधिसूचनाएं देखें'}
                            >
                                <BellIcon className="w-6 h-6" />
                                {showNotificationDot && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            <LogoutButton />
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md transition-colors"
                                data-local-language-toggle
                            >
                                <GlobeAltIcon className="w-4 h-4" />
                                <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Purchases' : 'कुल खरीदारी'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <ShoppingBagIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Saved Products' : 'सेव किए गए उत्पाद'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.savedProducts}</p>
                            </div>
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                <HeartIcon className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Tracked Items' : 'ट्रैक किए गए आइटम'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.trackedItems}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <QrCodeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Ratings Provided' : 'दी गई रेटिंग्स'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.ratingsSubmitted}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <StarIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Purchases */}
                    <div className="lg:col-span-2">
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
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(purchase.status)}`}>
                                                        {getStatusText(purchase.status)}
                                                    </span>
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
                                                {purchase.status === 'collected' && purchase.rating && (
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
                                                {purchase.status === 'ready_for_pickup' && (
                                                    <button className={`bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        <MapPinIcon className="w-4 h-4" />
                                                        <span>{currentLang === 'en' ? 'View Pickup Info' : 'पिकअप जानकारी देखें'}</span>
                                                    </button>
                                                )}
                                                {purchase.status === 'collected' && !purchase.rating && (
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
                        {/* Notifications */}
                        <div
                            ref={notificationsRef}
                            className="bg-white rounded-xl shadow-sm border"
                            tabIndex={-1}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Notifications' : 'अधिसूचनाएं'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className={`p-3 rounded-lg ${notification.isNew ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                                        <p className={`text-sm text-gray-800 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

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
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.inStock
                                                    ? (currentLang === 'en' ? 'In Stock' : 'स्टॉक में')
                                                    : (currentLang === 'en' ? 'Out of Stock' : 'स्टॉक समाप्त')
                                                }
                                            </span>
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
                                        <button className={`w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''} ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {product.inStock
                                                ? (currentLang === 'en' ? 'Buy Now' : 'अभी खरीदें')
                                                : (currentLang === 'en' ? 'Notify When Available' : 'उपलब्ध होने पर सूचित करें')
                                            }
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-3">
                                {/* Marketplace removed for consumer role — consumers do not have access */}

                                <button className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <QrCodeIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Scan QR Code' : 'QR कोड स्कैन करें'}</span>
                                </button>
                                <button className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Find Local Stores' : 'स्थानीय स्टोर खोजें'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}