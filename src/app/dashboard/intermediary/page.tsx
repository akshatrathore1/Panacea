"use client"
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TruckIcon,
    ClipboardDocumentListIcon,
    CurrencyRupeeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    DocumentCheckIcon,
    MapPinIcon,
    PhoneIcon,
    ShoppingCartIcon,
    GlobeAltIcon,
    PlusIcon,
    TagIcon
} from '@heroicons/react/24/outline'
import LogoutButton from '@/components/LogoutButton'
import { formatNumber } from '@/lib/format'

export default function IntermediaryDashboard() {
    const { i18n } = useTranslation()
    const [currentLang, setCurrentLang] = useState('en')

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    // Mock data for intermediary operations
    const stats = {
        activeOrders: 24,
        completedDeliveries: 156,
        monthlyRevenue: 285000,
        pendingVerifications: 7
    }

    const pendingOrders = [
        {
            id: 'ORD-2024-001',
            batchId: 'KA-WH-2024-003',
            product: 'Organic Wheat',
            farmer: 'Rajesh Kumar',
            retailer: 'Fresh Mart Delhi',
            quantity: '500 kg',
            pickupLocation: 'Sonipat, Haryana',
            deliveryLocation: 'Karol Bagh, Delhi',
            estimatedDelivery: '2024-01-15',
            status: 'ready_for_pickup',
            value: 25000
        },
        {
            id: 'ORD-2024-002',
            batchId: 'KA-RIC-2024-007',
            product: 'Basmati Rice',
            farmer: 'Sunita Devi',
            retailer: 'Organic Store Mumbai',
            quantity: '200 kg',
            pickupLocation: 'Kurukshetra, Haryana',
            deliveryLocation: 'Bandra, Mumbai',
            estimatedDelivery: '2024-01-16',
            status: 'in_transit',
            value: 18000
        },
        {
            id: 'ORD-2024-003',
            batchId: 'KA-VEG-2024-011',
            product: 'Fresh Vegetables',
            farmer: 'Amit Singh',
            retailer: 'Green Valley Store',
            quantity: '100 kg',
            pickupLocation: 'Panipat, Haryana',
            deliveryLocation: 'Sector 17, Gurgaon',
            estimatedDelivery: '2024-01-14',
            status: 'pending_verification',
            value: 8500
        }
    ]

    const recentDeliveries = [
        {
            id: 'DEL-2024-089',
            batchId: 'KA-FRT-2024-021',
            product: 'Organic Apples',
            completedDate: '2024-01-12',
            rating: 4.8,
            value: 15000
        },
        {
            id: 'DEL-2024-088',
            batchId: 'KA-MIL-2024-016',
            product: 'Fresh Milk',
            completedDate: '2024-01-11',
            rating: 5.0,
            value: 12000
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready_for_pickup': return 'bg-yellow-100 text-yellow-800'
            case 'in_transit': return 'bg-blue-100 text-blue-800'
            case 'pending_verification': return 'bg-orange-100 text-orange-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        const statusMap = {
            'ready_for_pickup': currentLang === 'en' ? 'Ready for Pickup' : 'पिकअप के लिए तैयार',
            'in_transit': currentLang === 'en' ? 'In Transit' : 'ट्रांजिट में',
            'pending_verification': currentLang === 'en' ? 'Pending Verification' : 'सत्यापन लंबित',
            'delivered': currentLang === 'en' ? 'Delivered' : 'डिलीवर किया गया'
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
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TruckIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Intermediary Dashboard' : 'मध्यस्थ डैशबोर्ड'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Distribution Management' : 'लॉजिस्टिक्स और वितरण प्रबंधन'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <LogoutButton />
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors"
                            >
                                <GlobeAltIcon className="w-4 h-4" />
                                <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                            </button>
                        </div>
                        {/* Marketplace link removed from header; shown as a quick-action card in the sidebar below */}
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
                                    {currentLang === 'en' ? 'Active Orders' : 'सक्रिय ऑर्डर'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Completed Deliveries' : 'पूर्ण डिलीवरी'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Monthly Revenue' : 'मासिक राजस्व'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{formatNumber(stats.monthlyRevenue)}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Pending Verifications' : 'लंबित सत्यापन'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Active Orders' : 'सक्रिय ऑर्डर'}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {pendingOrders.map((order) => (
                                    <div key={order.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{order.product}</h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {currentLang === 'en' ? 'Order ID:' : 'ऑर्डर ID:'} {order.id} |
                                                    {currentLang === 'en' ? ' Batch:' : ' बैच:'} {order.batchId}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {currentLang === 'en' ? 'Quantity:' : 'मात्रा:'} {order.quantity} |
                                                    {currentLang === 'en' ? ' Value:' : ' मूल्य:'} ₹{formatNumber(order.value)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'From:' : 'से:'} {order.farmer}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                    {order.pickupLocation}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'To:' : 'को:'} {order.retailer}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                    {order.deliveryLocation}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Delivery by:' : 'डिलीवरी तक:'} {order.estimatedDelivery}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                {order.status === 'ready_for_pickup' && (
                                                    <button className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Start Pickup' : 'पिकअप शुरू करें'}
                                                    </button>
                                                )}
                                                {order.status === 'in_transit' && (
                                                    <button className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Update Location' : 'स्थान अपडेट करें'}
                                                    </button>
                                                )}
                                                {order.status === 'pending_verification' && (
                                                    <button className={`bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Verify Quality' : 'गुणवत्ता सत्यापित करें'}
                                                    </button>
                                                )}
                                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    <PhoneIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recent Deliveries */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Recent Deliveries' : 'हाल की डिलीवरी'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {recentDeliveries.map((delivery) => (
                                    <div key={delivery.id} className="border-l-4 border-green-400 pl-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{delivery.product}</h4>
                                                <p className="text-sm text-gray-600">{delivery.batchId}</p>
                                                <p className="text-sm text-gray-500">{delivery.completedDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">₹{formatNumber(delivery.value)}</p>
                                                <div className="flex items-center text-xs text-yellow-600">
                                                    <span>★ {delivery.rating}</span>
                                                </div>
                                            </div>
                                        </div>
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
                                <Link
                                    href="/dashboard/producer/create-batch"
                                    className="block bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-lg bg-green-50">
                                            <PlusIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{currentLang === 'en' ? 'Create Batch' : 'नया बैच बनाएँ'}</h4>
                                            <p className="text-sm text-gray-600">{currentLang === 'en' ? 'Register produce batches before logistics' : 'लॉजिस्टिक्स से पहले उत्पाद बैच पंजीकृत करें'}</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/producer/list"
                                    className="block bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-lg bg-orange-50">
                                            <TagIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{currentLang === 'en' ? 'List for Sale' : 'बिक्री के लिए सूची'}</h4>
                                            <p className="text-sm text-gray-600">{currentLang === 'en' ? 'Publish available lots for retailers' : 'खुदरा विक्रेताओं के लिए उपलब्ध बैच सूचीबद्ध करें'}</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/marketplace" className="block bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-lg bg-purple-50">
                                            <ShoppingCartIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{currentLang === 'en' ? 'Marketplace' : 'मार्केटप्लेस'}</h4>
                                            <p className="text-sm text-gray-600">{currentLang === 'en' ? 'Browse products & listings' : 'उत्पाद और सूची ब्राउज़ करें'}</p>
                                        </div>
                                    </div>
                                </Link>

                                <button className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <TruckIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Track Vehicles' : 'वाहन ट्रैक करें'}</span>
                                </button>
                                <button className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <DocumentCheckIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Quality Reports' : 'गुणवत्ता रिपोर्ट'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Performance' : 'प्रदर्शन'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'On-time Delivery' : 'समय पर डिलीवरी'}
                                    </span>
                                    <span className="font-semibold text-green-600">94%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Customer Rating' : 'ग्राहक रेटिंग'}
                                    </span>
                                    <span className="font-semibold text-yellow-600">4.7★</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}