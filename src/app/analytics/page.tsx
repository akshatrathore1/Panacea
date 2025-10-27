'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyRupeeIcon,
    TruckIcon,
    UsersIcon,
    BuildingStorefrontIcon,
    CalendarIcon,
    MapPinIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
    const { t, i18n } = useTranslation()
    const [currentLang, setCurrentLang] = useState('en')
    const [timeframe, setTimeframe] = useState('30days')

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    // Mock analytics data
    const overallStats = {
        totalTransactions: 1247,
        totalValue: 2850000,
        averagePrice: 85,
        activeUsers: 342
    }

    const priceData = [
        { product: 'Wheat', currentPrice: 45, change: 2.5, trend: 'up', volume: '2.5K kg' },
        { product: 'Rice', currentPrice: 85, change: -1.2, trend: 'down', volume: '1.8K kg' },
        { product: 'Vegetables', currentPrice: 65, change: 5.8, trend: 'up', volume: '950 kg' },
        { product: 'Fruits', currentPrice: 120, change: -3.1, trend: 'down', volume: '650 kg' },
        { product: 'Milk', currentPrice: 55, change: 1.8, trend: 'up', volume: '1.2K L' }
    ]

    const regionData = [
        { state: 'Haryana', transactions: 456, value: 1250000, growthRate: 12.5 },
        { state: 'Punjab', transactions: 342, value: 890000, growthRate: 8.2 },
        { state: 'Uttar Pradesh', transactions: 278, value: 520000, growthRate: 15.8 },
        { state: 'Gujarat', transactions: 171, value: 190000, growthRate: 6.4 }
    ]

    const supplyChainMetrics = {
        averageDeliveryTime: 2.4,
        onTimeDeliveryRate: 94.2,
        qualityScore: 8.7,
        customerSatisfaction: 4.6
    }

    const monthlyData = [
        { month: 'Oct', farmers: 45, intermediaries: 12, retailers: 28, consumers: 156 },
        { month: 'Nov', farmers: 52, intermediaries: 15, retailers: 34, consumers: 198 },
        { month: 'Dec', farmers: 68, intermediaries: 18, retailers: 41, consumers: 267 },
        { month: 'Jan', farmers: 78, intermediaries: 22, retailers: 48, consumers: 342 }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Analytics Dashboard' : 'एनालिटिक्स डैशबोर्ड'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Market Insights & Supply Chain Analytics' : 'बाजार अंतर्दृष्टि और आपूर्ति श्रृंखला एनालिटिक्स'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className={`bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                <option value="7days">{currentLang === 'en' ? 'Last 7 Days' : 'पिछले 7 दिन'}</option>
                                <option value="30days">{currentLang === 'en' ? 'Last 30 Days' : 'पिछले 30 दिन'}</option>
                                <option value="90days">{currentLang === 'en' ? 'Last 3 Months' : 'पिछले 3 महीने'}</option>
                                <option value="1year">{currentLang === 'en' ? 'Last Year' : 'पिछला साल'}</option>
                            </select>
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-3 py-1 rounded-md transition-colors"
                                data-local-language-toggle
                            >
                                <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Transactions' : 'कुल लेनदेन'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTransactions.toLocaleString()}</p>
                                <p className="text-sm text-green-600 flex items-center mt-1">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                    +12.5%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Value' : 'कुल मूल्य'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{(overallStats.totalValue / 100000).toFixed(1)}L</p>
                                <p className="text-sm text-green-600 flex items-center mt-1">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                    +8.2%
                                </p>
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
                                    {currentLang === 'en' ? 'Average Price' : 'औसत कीमत'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{overallStats.averagePrice}/kg</p>
                                <p className="text-sm text-red-600 flex items-center mt-1">
                                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                                    -2.1%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <TruckIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Active Users' : 'सक्रिय उपयोगकर्ता'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{overallStats.activeUsers}</p>
                                <p className="text-sm text-green-600 flex items-center mt-1">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                    +15.8%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Price Trends */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Price Trends' : 'मूल्य रुझान'}
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {priceData.map((item) => (
                                    <div key={item.product} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product}</h3>
                                            <p className="text-sm text-gray-600">{currentLang === 'en' ? 'Volume:' : 'मात्रा:'} {item.volume}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">₹{item.currentPrice}/kg</p>
                                            <p className={`text-sm flex items-center ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.trend === 'up' ? (
                                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                                                )}
                                                {Math.abs(item.change)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Regional Performance */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Regional Performance' : 'क्षेत्रीय प्रदर्शन'}
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {regionData.map((region) => (
                                    <div key={region.state} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{region.state}</h3>
                                            <p className="text-sm text-gray-600">
                                                {region.transactions} {currentLang === 'en' ? 'transactions' : 'लेनदेन'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">₹{(region.value / 100000).toFixed(1)}L</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                                +{region.growthRate}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Supply Chain Metrics */}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Supply Chain Health' : 'आपूर्ति श्रृंखला स्वास्थ्य'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Avg Delivery Time' : 'औसत डिलीवरी समय'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.averageDeliveryTime} days</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'On-time Delivery' : 'समय पर डिलीवरी'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.onTimeDeliveryRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Quality Score' : 'गुणवत्ता स्कोर'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.qualityScore}/10</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Customer Satisfaction' : 'ग्राहक संतुष्टि'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.customerSatisfaction}/5 ★</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Growth */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'User Growth by Role' : 'भूमिका के आधार पर उपयोगकर्ता वृद्धि'}
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* Simple bar chart representation */}
                            <div className="space-y-6">
                                {monthlyData.map((data, index) => (
                                    <div key={data.month} className="space-y-3">
                                        <h3 className="font-medium text-gray-900">{data.month} 2024</h3>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Farmers' : 'किसान'}
                                                    </span>
                                                    <span className="text-sm font-medium">{data.farmers}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${(data.farmers / 100) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Intermediaries' : 'मध्यस्थ'}
                                                    </span>
                                                    <span className="text-sm font-medium">{data.intermediaries}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(data.intermediaries / 30) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Retailers' : 'रिटेलर'}
                                                    </span>
                                                    <span className="text-sm font-medium">{data.retailers}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${(data.retailers / 60) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {currentLang === 'en' ? 'Consumers' : 'उपभोक्ता'}
                                                    </span>
                                                    <span className="text-sm font-medium">{data.consumers}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${(data.consumers / 400) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Insights */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Key Insights' : 'मुख्य अंतर्दृष्टि'}
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className={`font-semibold text-green-800 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Growing Demand' : 'बढ़ती मांग'}
                                </h3>
                                <p className={`text-sm text-green-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Vegetable prices increased by 5.8% due to high demand in urban areas.'
                                        : 'शहरी क्षेत्रों में उच्च मांग के कारण सब्जियों की कीमतों में 5.8% की वृद्धि हुई।'}
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className={`font-semibold text-blue-800 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Regional Leader' : 'क्षेत्रीय अग्रणी'}
                                </h3>
                                <p className={`text-sm text-blue-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Haryana leads with 456 transactions, contributing 44% of total platform activity.'
                                        : 'हरियाणा 456 लेनदेन के साथ अग्रणी है, जो कुल प्लेटफॉर्म गतिविधि का 44% योगदान देता है।'}
                                </p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className={`font-semibold text-yellow-800 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Quality Excellence' : 'गुणवत्ता उत्कृष्टता'}
                                </h3>
                                <p className={`text-sm text-yellow-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Platform maintains 8.7/10 quality score with 94% on-time delivery rate.'
                                        : 'प्लेटफॉर्म 94% समय पर डिलीवरी दर के साथ 8.7/10 गुणवत्ता स्कोर बनाए रखता है।'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}