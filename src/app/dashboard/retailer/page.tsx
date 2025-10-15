'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    BuildingStorefrontIcon,
    ShoppingCartIcon,
    CurrencyRupeeIcon,
    UsersIcon,
    TruckIcon,
    ClockIcon,
    StarIcon,
    QrCodeIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function RetailerDashboard() {
    const { t, i18n } = useTranslation()
    const [currentLang, setCurrentLang] = useState('en')

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    // Mock data for retailer operations
    const stats = {
        totalProducts: 89,
        todaySales: 45230,
        pendingOrders: 12,
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

    const recentOrders = [
        {
            id: 'ORD-R-2024-156',
            customerName: 'Priya Sharma',
            items: [
                { product: 'Organic Wheat', quantity: '5 kg', batchId: 'KA-WH-2024-003' },
                { product: 'Basmati Rice', quantity: '2 kg', batchId: 'KA-RIC-2024-007' }
            ],
            total: 395,
            timestamp: '2024-01-14 14:30',
            status: 'completed',
            paymentMethod: 'UPI'
        },
        {
            id: 'ORD-R-2024-157',
            customerName: 'Raj Patel',
            items: [
                { product: 'Fresh Vegetables', quantity: '3 kg', batchId: 'KA-VEG-2024-011' }
            ],
            total: 195,
            timestamp: '2024-01-14 15:45',
            status: 'pending',
            paymentMethod: 'Cash'
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
            productRequested: 'Fresh Milk',
            quantity: '5 liters',
            priceRange: '₹55-65/liter',
            timestamp: '2024-01-14 10:30',
            status: 'pending'
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
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Retailer Dashboard' : 'रिटेलर डैशबोर्ड'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Fresh Mart Delhi - Store Management' : 'फ्रेश मार्ट दिल्ली - स्टोर प्रबंधन'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md transition-colors"
                        >
                            <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                        </button>
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
                                    {currentLang === 'en' ? 'Total Products' : 'कुल उत्पाद'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? "Today's Sales" : 'आज की बिक्री'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{stats.todaySales.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Pending Orders' : 'लंबित ऑर्डर'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Customer Rating' : 'ग्राहक रेटिंग'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction}★</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <StarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inventory Management */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Current Inventory' : 'वर्तमान इन्वेंटरी'}
                                    </h2>
                                    <Link
                                        href="/marketplace"
                                        className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                    >
                                        {currentLang === 'en' ? 'Browse Products' : 'उत्पाद ब्राउज़ करें'}
                                    </Link>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {inventory.map((item) => (
                                    <div key={item.batchId} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{item.product}</h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(item.status)}`}>
                                                        {getStockStatusText(item.status)}
                                                    </span>
                                                    <div className="flex items-center text-yellow-500">
                                                        <StarIcon className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-medium text-gray-700 ml-1">{item.qualityScore}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {currentLang === 'en' ? 'Farmer:' : 'किसान:'} {item.farmer} |
                                                    {currentLang === 'en' ? ' Batch:' : ' बैच:'} {item.batchId}
                                                </p>
                                                <p className="text-sm text-gray-600">
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
                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Recent Orders' : 'हाल के ऑर्डर'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="border-l-4 border-purple-400 pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                                                <p className="text-sm text-gray-600">{order.id}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status === 'completed'
                                                    ? (currentLang === 'en' ? 'Completed' : 'पूर्ण')
                                                    : (currentLang === 'en' ? 'Pending' : 'लंबित')
                                                }
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <p key={index} className="text-sm text-gray-600">
                                                    {item.product} - {item.quantity}
                                                </p>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-medium text-gray-900">₹{order.total}</span>
                                            <span className="text-sm text-gray-500">{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Requests */}
                        <div className="bg-white rounded-xl shadow-sm border">
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
                                        <p className="text-sm text-gray-600 mb-1">
                                            {currentLang === 'en' ? 'Product:' : 'उत्पाद:'} {request.productRequested}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {currentLang === 'en' ? 'Quantity:' : 'मात्रा:'} {request.quantity}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-3">
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

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <button className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <ChartBarIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Sales Analytics' : 'बिक्री एनालिटिक्स'}</span>
                                </button>
                                <button className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <TruckIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Track Deliveries' : 'डिलीवरी ट्रैक करें'}</span>
                                </button>
                                <button className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <UsersIcon className="w-5 h-5" />
                                    <span>{currentLang === 'en' ? 'Customer Management' : 'ग्राहक प्रबंधन'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}