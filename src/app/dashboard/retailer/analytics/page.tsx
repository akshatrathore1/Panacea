'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeftIcon,
    ChartBarIcon,
    CurrencyRupeeIcon,
    UsersIcon,
    ShoppingBagIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'

const INR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
})

export default function RetailerAnalyticsPage() {
    const { language: currentLang } = useLanguage()

    const stats = useMemo(
        () => [
            {
                label: currentLang === 'en' ? 'Gross sales' : 'कुल बिक्री',
                value: INR.format(482000),
                helper:
                    currentLang === 'en'
                        ? 'Across 162 store transactions'
                        : '162 स्टोर लेन-देन में',
                icon: CurrencyRupeeIcon,
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600'
            },
            {
                label: currentLang === 'en' ? 'Repeat customers' : 'दोहराए ग्राहक',
                value: '42%',
                helper:
                    currentLang === 'en'
                        ? 'Up 6% vs previous month'
                        : 'पिछले महीने से 6% अधिक',
                icon: UsersIcon,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
            },
            {
                label: currentLang === 'en' ? 'Average basket value' : 'औसत बास्केट मूल्य',
                value: INR.format(1240),
                helper:
                    currentLang === 'en'
                        ? 'Measured across billing counters'
                        : 'सभी बिलिंग काउंटरों का औसत',
                icon: ShoppingBagIcon,
                iconBg: 'bg-indigo-100',
                iconColor: 'text-indigo-600'
            }
        ],
        [currentLang]
    )

    const commodityShare = useMemo(
        () => [
            {
                name: currentLang === 'en' ? 'Organic Grains' : 'जैविक अनाज',
                revenue: INR.format(186000),
                contribution: 38
            },
            {
                name: currentLang === 'en' ? 'Fresh Vegetables' : 'ताज़ी सब्ज़ियाँ',
                revenue: INR.format(139000),
                contribution: 29
            },
            {
                name: currentLang === 'en' ? 'Cold-pressed Oils' : 'कोल्ड प्रेस्ड तेल',
                revenue: INR.format(87000),
                contribution: 18
            }
        ],
        [currentLang]
    )

    const footfallTrend = useMemo(
        () => [
            {
                week: currentLang === 'en' ? 'Week 1' : 'सप्ताह 1',
                visitors: 610,
                conversion: currentLang === 'en' ? '27%' : '27%'
            },
            {
                week: currentLang === 'en' ? 'Week 2' : 'सप्ताह 2',
                visitors: 655,
                conversion: currentLang === 'en' ? '29%' : '29%'
            },
            {
                week: currentLang === 'en' ? 'Week 3' : 'सप्ताह 3',
                visitors: 640,
                conversion: currentLang === 'en' ? '28%' : '28%'
            },
            {
                week: currentLang === 'en' ? 'Week 4' : 'सप्ताह 4',
                visitors: 702,
                conversion: currentLang === 'en' ? '31%' : '31%'
            }
        ],
        [currentLang]
    )

    const insights = useMemo(
        () => [
            {
                title:
                    currentLang === 'en'
                        ? 'Vegetable footfall spikes on weekends'
                        : 'सप्ताहांत पर सब्ज़ियों की मांग बढ़ती है',
                body:
                    currentLang === 'en'
                        ? 'Saturday evening throughput is 1.8× a weekday. Schedule additional staff and prep promotional bundles.'
                        : 'शनिवार शाम का throughput कार्यदिवस से 1.8× अधिक है। अतिरिक्त स्टाफ शेड्यूल करें और प्रोत्साहन बंडल तैयार रखें।'
            },
            {
                title:
                    currentLang === 'en'
                        ? 'Inventory turns improved'
                        : 'इन्वेंटरी टर्न बेहतर हुए',
                body:
                    currentLang === 'en'
                        ? 'Average shelf days dropped to 11 from 15. Maintain freshness tags for premium grains to keep the momentum.'
                        : 'औसत शेल्फ दिन 15 से घटकर 11 पर आ गए हैं। प्रीमियम अनाज पर ताज़गी टैग जारी रखें ताकि गति बनी रहे।'
            }
        ],
        [currentLang]
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Link
                            href="/dashboard/retailer"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className={currentLang === 'hi' ? 'font-hindi' : ''}>
                                {currentLang === 'en' ? 'Back to dashboard' : 'डैशबोर्ड पर वापस'}
                            </span>
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <section className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Retail Insights' : 'रिटेल इनसाइट्स'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Understand store performance, repeat behaviour, and merchandising impact.'
                                        : 'स्टोर प्रदर्शन, दोहराव व्यवहार और मर्चेंडाइजिंग प्रभाव को समझें।'}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {currentLang === 'en' ? 'Last 30 days' : 'पिछले 30 दिन'}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {stats.map((card) => {
                        const Icon = card.icon
                        return (
                            <div key={card.label} className="bg-white border rounded-xl shadow-sm p-6 flex items-start gap-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                </div>
                                <div>
                                    <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{card.label}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                                    <p className={`text-xs text-gray-500 mt-1 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>{card.helper}</p>
                                </div>
                            </div>
                        )
                    })}
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 border rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Category contribution' : 'श्रेणी योगदान'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {commodityShare.map((item) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.revenue}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100">
                                        <div
                                            className="h-2 rounded-full bg-purple-500"
                                            style={{ width: `${item.contribution}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-xs text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? `${item.contribution}% of monthly revenue` : `मासिक राजस्व का ${item.contribution}%`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Key insights' : 'मुख्य अंतर्दृष्टि'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {insights.map((insight) => (
                                <div key={insight.title} className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <h3 className={`text-sm font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {insight.title}
                                            </h3>
                                            <p className={`mt-1 text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {insight.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Visitor trend' : 'आगंतुक रुझान'}
                        </h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Week' : 'सप्ताह'}
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Average footfall' : 'औसत फुटफॉल'}
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Conversion rate' : 'रूपांतरण दर'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {footfallTrend.map((row) => (
                                    <tr key={row.week} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{row.week}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.visitors.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.conversion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    )
}
