'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    ArrowLeftIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyRupeeIcon,
    TruckIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'

type Timeframe = '7days' | '30days' | '90days' | '1year'
type PriceTrend = 'up' | 'down'

export default function AnalyticsPage() {
    const { language: currentLang } = useLanguage()
    const [timeframe, setTimeframe] = useState<Timeframe>('30days')

    const overallStats = {
        totalTransactions: 1247,
        totalValue: 2850000,
        averagePrice: 85,
        activeUsers: 342
    }

    const priceData: Array<{
        product: string
        currentPrice: number
        change: number
        trend: PriceTrend
        volume: string
    }> = [
            { product: 'Lokwan Wheat', currentPrice: 45, change: 2.5, trend: 'up', volume: '2.8K kg' },
            { product: 'Basmati Rice', currentPrice: 92, change: -1.2, trend: 'down', volume: '1.9K kg' },
            { product: 'Toor Dal', currentPrice: 86, change: 4.1, trend: 'up', volume: '1.1K kg' },
            { product: 'Pearl Millet (Bajra)', currentPrice: 38, change: 3.6, trend: 'up', volume: '840 kg' },
            { product: 'Mustard Oil', currentPrice: 120, change: 2.1, trend: 'up', volume: '680 L' }
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

    const formatBarWidth = (value: number, max: number) => `${Math.min((value / max) * 100, 100)}%`

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Link
                            href="/dashboard/producer"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>{currentLang === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस'}</span>
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                                <ChartBarIcon className="h-6 w-6 text-cyan-600" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Analytics Dashboard' : 'एनालिटिक्स डैशबोर्ड'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Track marketplace performance, pricing trends, and supply chain health in real time.'
                                        : 'बाज़ार प्रदर्शन, मूल्य रुझान और आपूर्ति श्रृंखला की स्थिति को रीयल-टाइम में ट्रैक करें।'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {currentLang === 'en' ? 'Timeframe' : 'समय अवधि'}
                            </span>
                            <select
                                value={timeframe}
                                onChange={(event) => setTimeframe(event.target.value as Timeframe)}
                                className={`rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                <option value="7days">{currentLang === 'en' ? 'Last 7 Days' : 'पिछले 7 दिन'}</option>
                                <option value="30days">{currentLang === 'en' ? 'Last 30 Days' : 'पिछले 30 दिन'}</option>
                                <option value="90days">{currentLang === 'en' ? 'Last 3 Months' : 'पिछले 3 महीने'}</option>
                                <option value="1year">{currentLang === 'en' ? 'Last Year' : 'पिछला साल'}</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Transactions' : 'कुल लेनदेन'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTransactions.toLocaleString()}</p>
                                <p className="mt-1 flex items-center text-sm text-green-600">
                                    <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                                    +12.5%
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Total Value' : 'कुल मूल्य'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{(overallStats.totalValue / 100000).toFixed(1)}L</p>
                                <p className="mt-1 flex items-center text-sm text-green-600">
                                    <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                                    +8.2%
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Average Price' : 'औसत कीमत'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">₹{overallStats.averagePrice}/kg</p>
                                <p className="mt-1 flex items-center text-sm text-red-600">
                                    <ArrowTrendingDownIcon className="mr-1 h-4 w-4" />
                                    -2.1%
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                <TruckIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Active Users' : 'सक्रिय उपयोगकर्ता'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{overallStats.activeUsers}</p>
                                <p className="mt-1 flex items-center text-sm text-green-600">
                                    <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                                    +15.8%
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <UsersIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Price Trends' : 'मूल्य रुझान'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {priceData.map((item) => (
                                <div key={item.product} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product}</h3>
                                        <p className="text-sm text-gray-600">
                                            {currentLang === 'en' ? 'Volume:' : 'मात्रा:'} {item.volume}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">₹{item.currentPrice}/kg</p>
                                        <p
                                            className={`mt-1 flex items-center text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {item.trend === 'up' ? (
                                                <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="mr-1 h-4 w-4" />
                                            )}
                                            {Math.abs(item.change)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Regional Performance' : 'क्षेत्रीय प्रदर्शन'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
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
                                        <p className="mt-1 flex items-center text-sm text-green-600">
                                            <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                                            +{region.growthRate}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Supply Chain Health' : 'आपूर्ति श्रृंखला स्वास्थ्य'}
                            </h2>
                        </div>
                        <div className="space-y-6 p-6">
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Avg Delivery Time' : 'औसत डिलीवरी समय'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.averageDeliveryTime} days</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div className="h-2 rounded-full bg-green-600" style={{ width: '80%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'On-time Delivery' : 'समय पर डिलीवरी'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.onTimeDeliveryRate}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: '94%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Quality Score' : 'गुणवत्ता स्कोर'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.qualityScore}/10</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div className="h-2 rounded-full bg-yellow-600" style={{ width: '87%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`text-sm font-medium text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Customer Satisfaction' : 'ग्राहक संतुष्टि'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{supplyChainMetrics.customerSatisfaction}/5</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div className="h-2 rounded-full bg-purple-600" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'User Growth by Role' : 'भूमिका के आधार पर उपयोगकर्ता वृद्धि'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {monthlyData.map((data) => (
                                <div key={data.month} className="space-y-3">
                                    <h3 className="font-medium text-gray-900">{data.month} 2024</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Farmers' : 'किसान'}
                                                </span>
                                                <span className="text-sm font-medium">{data.farmers}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-green-600" style={{ width: formatBarWidth(data.farmers, 100) }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Intermediaries' : 'मध्यस्थ'}
                                                </span>
                                                <span className="text-sm font-medium">{data.intermediaries}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-blue-600" style={{ width: formatBarWidth(data.intermediaries, 30) }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Retailers' : 'रिटेलर'}
                                                </span>
                                                <span className="text-sm font-medium">{data.retailers}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-purple-600" style={{ width: formatBarWidth(data.retailers, 60) }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                    {currentLang === 'en' ? 'Consumers' : 'उपभोक्ता'}
                                                </span>
                                                <span className="text-sm font-medium">{data.consumers}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-indigo-600" style={{ width: formatBarWidth(data.consumers, 400) }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Key Insights' : 'मुख्य अंतर्दृष्टि'}
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <h3 className={`mb-2 font-semibold text-green-800 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Growing Demand' : 'बढ़ती मांग'}
                                </h3>
                                <p className={`text-sm text-green-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Lokwan wheat prices firmed up by 2.5% as cooperative mills stock up ahead of festive demand.'
                                        : 'त्योहारी मांग से पहले सहकारी मिलों द्वारा स्टॉक बढ़ाने से लोकवन गेहूं की कीमतों में 2.5% की वृद्धि हुई।'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <h3 className={`mb-2 font-semibold text-blue-800 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Regional Leader' : 'क्षेत्रीय अग्रणी'}
                                </h3>
                                <p className={`text-sm text-blue-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Punjab retailers drove Basmati rice trading volumes, accounting for 44% of platform activity.'
                                        : 'पंजाब के रिटेलर्स ने बासमती चावल के व्यापारिक वॉल्यूम को बढ़ाया, जिससे प्लेटफॉर्म गतिविधि में 44% योगदान मिला।'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <h3 className={`mb-2 font-semibold text-yellow-800 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Quality Excellence' : 'गुणवत्ता उत्कृष्टता'}
                                </h3>
                                <p className={`text-sm text-yellow-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Mustard oil lots continue to score 8.7/10 on quality checks with 94% timely dispatches.'
                                        : 'सरसों तेल के लॉट्स 8.7/10 गुणवत्ता स्कोर और 94% समय पर डिस्पैच के साथ स्थिर बने हुए हैं।'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

