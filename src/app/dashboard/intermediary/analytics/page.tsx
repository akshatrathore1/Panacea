'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeftIcon,
    CurrencyRupeeIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    TruckIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'

const INR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
})

export default function IntermediaryAnalyticsPage() {
    const { language: currentLang } = useLanguage()

    const stats = useMemo(
        () => [
            {
                label: currentLang === 'en' ? 'Procurement spend' : 'प्रोक्योरमेंट व्यय',
                value: INR.format(712000),
                helper:
                    currentLang === 'en'
                        ? 'Across 24 farmer producer collectives'
                        : '24 किसान उत्पादक समूहों से',
                icon: CurrencyRupeeIcon,
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600'
            },
            {
                label: currentLang === 'en' ? 'Active contracts' : 'सक्रिय अनुबंध',
                value: '18',
                helper:
                    currentLang === 'en'
                        ? 'Five negotiations in progress'
                        : 'पांच वार्ताएं प्रगति पर हैं',
                icon: ClipboardDocumentListIcon,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
            },
            {
                label: currentLang === 'en' ? 'Average margin' : 'औसत मार्जिन',
                value: '9.4%',
                helper:
                    currentLang === 'en'
                        ? 'Improved by 1.2% vs last cycle'
                        : 'पिछली साइकिल से 1.2% बेहतर',
                icon: ChartBarIcon,
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600'
            }
        ],
        [currentLang]
    )

    const sourcingMix = useMemo(
        () => [
            {
                label: currentLang === 'en' ? 'Pulses' : 'दलहन',
                share: 44,
                trend: 'up' as const,
                value: INR.format(312000)
            },
            {
                label: currentLang === 'en' ? 'Oilseeds' : 'तेलहन',
                share: 23,
                trend: 'down' as const,
                value: INR.format(162000)
            },
            {
                label: currentLang === 'en' ? 'Cereals' : 'अनाज',
                share: 19,
                trend: 'up' as const,
                value: INR.format(97000)
            }
        ],
        [currentLang]
    )

    const demandAlignment = useMemo(
        () => [
            {
                market: currentLang === 'en' ? 'NCR Retail Cluster' : 'एनसीआर रिटेल क्लस्टर',
                committed: '68 MT',
                coverage: 92
            },
            {
                market: currentLang === 'en' ? 'Western UP Stores' : 'पश्चिमी यूपी स्टोर्स',
                committed: '41 MT',
                coverage: 84
            },
            {
                market: currentLang === 'en' ? 'Vidarbha Supermarts' : 'विदर्भ सुपरमार्ट्स',
                committed: '36 MT',
                coverage: 78
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
                            href="/dashboard/intermediary"
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <TruckIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Aggregator Analytics' : 'एग्रीगेटर एनालिटिक्स'}
                                </h1>
                                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en'
                                        ? 'Track procurement velocity, market coverage, and margin trends for your network.'
                                        : 'अपने नेटवर्क के लिए प्रोक्योरमेंट गति, बाजार कवरेज और मार्जिन ट्रेंड ट्रैक करें।'}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {currentLang === 'en' ? 'Current cycle' : 'वर्तमान चक्र'}
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
                                {currentLang === 'en' ? 'Sourcing mix' : 'सोर्सिंग मिश्रण'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {sourcingMix.map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.value}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{ width: `${item.share}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {item.trend === 'up' ? (
                                            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={currentLang === 'hi' ? 'font-hindi' : ''}>
                                            {currentLang === 'en'
                                                ? `${item.share}% of sourced volume`
                                                : `सोर्स की गई मात्रा का ${item.share}%`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Demand coverage' : 'मांग कवरेज'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {demandAlignment.map((row) => (
                                <div key={row.market} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className={`text-sm font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {row.market}
                                    </h3>
                                    <p className={`text-xs text-gray-500 mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? `Committed volume ${row.committed}` : `प्रतिबद्ध मात्रा ${row.committed}`}
                                    </p>
                                    <div className="h-2 rounded-full bg-gray-100 mb-2">
                                        <div
                                            className="h-2 rounded-full bg-indigo-500"
                                            style={{ width: `${row.coverage}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-xs text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? `${row.coverage}% of shipment targets met` : `${row.coverage}% शिपमेंट लक्ष्य पूरे हुए`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Network velocity' : 'नेटवर्क गति'}
                        </h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Route' : 'रूट'}
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Transit time' : 'ट्रांजिट समय'}
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        {currentLang === 'en' ? 'Dispatches this cycle' : 'इस चक्र की डिस्पैच'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[
                                    {
                                        route: currentLang === 'en' ? 'Sehore ➝ Delhi NCR' : 'सीहोर ➝ दिल्ली एनसीआर',
                                        transit: currentLang === 'en' ? '21 hours avg' : 'औसत 21 घंटे',
                                        dispatches: 12
                                    },
                                    {
                                        route: currentLang === 'en' ? 'Wardha ➝ Pune' : 'वर्धा ➝ पुणे',
                                        transit: currentLang === 'en' ? '16 hours avg' : 'औसत 16 घंटे',
                                        dispatches: 9
                                    },
                                    {
                                        route: currentLang === 'en' ? 'Nanded ➝ Nagpur' : 'नांदेड़ ➝ नागपुर',
                                        transit: currentLang === 'en' ? '12 hours avg' : 'औसत 12 घंटे',
                                        dispatches: 7
                                    }
                                ].map((row) => (
                                    <tr key={row.route} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{row.route}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.transit}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.dispatches}</td>
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
