
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/Providers'
import Link from 'next/link'
import {
    PlusIcon,
    CubeIcon,
    ChartBarIcon,
    BanknotesIcon,
    GlobeAltIcon,
    SunIcon,
    BeakerIcon,
    UserGroupIcon,
    ArrowRightIcon,
    TagIcon
} from '@heroicons/react/24/outline'

export default function ProducerDashboard() {
    const { t, i18n } = useTranslation()
    const router = useRouter()
    const { user, isConnected } = useWeb3()
    const [currentLang, setCurrentLang] = useState('en')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!loading && (!isConnected || !user || user.role !== 'producer')) {
            router.push('/')
        }
    }, [isConnected, user, router, loading])
    
    useEffect(() => {
        if (user) setLoading(false)
    }, [user])

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

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

    const quickActions = [
        {
            title: currentLang === 'en' ? 'Create New Batch' : 'नया बैच बनाएं',
            description: currentLang === 'en' ? 'Register new crop batch' : 'नई फसल बैच पंजीकृत करें',
            icon: PlusIcon,
            href: '/dashboard/producer/create-batch',
            color: 'bg-green-500'
        },
        {
            title: currentLang === 'en' ? 'My Inventory' : 'मेरी सूची',
            description: currentLang === 'en' ? 'View all batches' : 'सभी बैच देखें',
            icon: CubeIcon,
            href: '/dashboard/producer/inventory',
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
                                <span className="text-xl font-bold text-gray-900">
                                    {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                                </span>
                            </Link>
                            <div className="text-sm text-gray-500">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {t('producer')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                                data-local-language-toggle
                            >
                                <GlobeAltIcon className="w-5 h-5" />
                                <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? `Welcome back, ${user.name}!`
                            : `स्वागत है, ${user.name}!`}
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
                            <CubeIcon className="w-8 h-8 text-blue-600" />
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
                            <TagIcon className="w-8 h-8 text-green-600" />
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
                            <BeakerIcon className="w-8 h-8 text-purple-600" />
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
                            <BanknotesIcon className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    {currentLang === 'en' ? 'Total Earnings' : 'कुल आय'}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {/* Weather Widget */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center mb-4">
                                <SunIcon className="w-6 h-6 text-yellow-500 mr-2" />
                                <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Weather' : 'मौसम'}
                                </h3>
                            </div>
                            <div className="space-y-3">
    {/* City Name */}
    <div className="flex justify-between">
        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
            {currentLang === 'en' ? 'City' : 'शहर'}
        </span>
        <span className="text-sm font-medium">{weatherData.city}</span>
    </div>

    {/* Temperature */}
    <div className="flex justify-between">
        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
            {currentLang === 'en' ? 'Temperature' : 'तापमान'}
        </span>
        <span className="text-sm font-medium">{weatherData.temperature}</span>
    </div>

    {/* Humidity */}
    <div className="flex justify-between">
        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
            {currentLang === 'en' ? 'Humidity' : 'आर्द्रता'}
        </span>
        <span className="text-sm font-medium">{weatherData.humidity}</span>
    </div>

    {/* Rainfall */}
    <div className="flex justify-between">
        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
            {currentLang === 'en' ? 'Rainfall' : 'वर्षा'}
        </span>
        <span className="text-sm font-medium">{weatherData.rainfall}</span>
    </div>

    {/* Condition */}
    <div className="flex justify-between">
        <span className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
            {currentLang === 'en' ? 'Condition' : 'स्थिति'}
        </span>
        <span className="text-sm font-medium">{weatherData.condition}</span>
    </div>
</div>

                        </div>

                        {/* Government Information */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
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

                        {/* Community Forum */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center mb-4">
                                <UserGroupIcon className="w-6 h-6 text-blue-600 mr-2" />
                                <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Community Forum' : 'समुदायिक मंच'}
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded">
                                    <p className={`text-sm text-blue-900 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en'
                                            ? 'Best practices for wheat storage'
                                            : 'गेहूं भंडारण की सर्वोत्तम प्रथाएं'}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">12 replies</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded">
                                    <p className={`text-sm text-blue-900 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en'
                                            ? 'Organic certification process'
                                            : 'जैविक प्रमाणन प्रक्रिया'}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">8 replies</p>
                                </div>
                                <Link
                                    href="/dashboard/community"
                                    className={`text-sm text-blue-600 hover:text-blue-800 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {currentLang === 'en' ? 'View all discussions →' : 'सभी चर्चाएं देखें →'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}