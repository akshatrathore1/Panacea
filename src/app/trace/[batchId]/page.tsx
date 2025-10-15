'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
    ArrowPathIcon,
    MapPinIcon,
    CalendarIcon,
    ScaleIcon,
    StarIcon,
    UserIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    PhotoIcon
} from '@heroicons/react/24/outline'

export default function TracePage() {
    const params = useParams()
    const { t, i18n } = useTranslation()
    const [currentLang, setCurrentLang] = useState('en')
    const [isLoading, setIsLoading] = useState(true)
    const [batchData, setBatchData] = useState<any>(null)

    const batchId = params.batchId as string

    useEffect(() => {
        // Simulate fetching batch data from blockchain
        const fetchBatchData = async () => {
            setIsLoading(true)
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500))

                // Mock batch data
                const mockData = {
                    batchId: batchId,
                    cropType: 'Wheat',
                    variety: 'Durum',
                    weight: 500,
                    qualityGrade: 'A',
                    pricePerKg: 2500,
                    farmLocation: 'Ludhiana, Punjab',
                    farmerName: 'Ram Singh',
                    farmerPhone: '+91 98765 43210',
                    sowingDate: '2024-01-15',
                    harvestDate: '2024-05-20',
                    createdAt: '2024-05-21',
                    currentOwner: 'Fresh Mart Retail',
                    transactions: [
                        {
                            id: 1,
                            from: 'Ram Singh (Farmer)',
                            to: 'AgriConnect Distributor',
                            date: '2024-05-21',
                            type: 'Initial Sale',
                            amount: 1250000, // 500kg * 2500
                            location: 'Farm Gate, Ludhiana'
                        },
                        {
                            id: 2,
                            from: 'AgriConnect Distributor',
                            to: 'Punjab Mandi',
                            date: '2024-05-22',
                            type: 'Wholesale Transfer',
                            amount: 1375000,
                            location: 'Ludhiana Mandi'
                        },
                        {
                            id: 3,
                            from: 'Punjab Mandi',
                            to: 'Fresh Mart Retail',
                            date: '2024-05-23',
                            type: 'Retail Purchase',
                            amount: 1500000,
                            location: 'Delhi Retail Store'
                        }
                    ],
                    qualityReports: [
                        {
                            id: 1,
                            inspector: 'Farm Quality Team',
                            grade: 'A',
                            date: '2024-05-20',
                            type: 'Harvest Inspection',
                            parameters: {
                                moistureContent: '12%',
                                pesticidesResidues: 'None',
                                organicCertified: false,
                                size: 'Medium',
                                color: 'Golden'
                            }
                        },
                        {
                            id: 2,
                            inspector: 'Mandi Quality Officer',
                            grade: 'A',
                            date: '2024-05-22',
                            type: 'IoT Sensor Verification',
                            parameters: {
                                temperature: '25°C',
                                humidity: '60%',
                                contamination: 'None',
                                freshness: '95%'
                            }
                        }
                    ],
                    images: [
                        '/api/placeholder/300/200?text=Farm+Photo',
                        '/api/placeholder/300/200?text=Crop+Quality',
                        '/api/placeholder/300/200?text=Harvest+Day'
                    ]
                }

                setBatchData(mockData)
            } catch (error) {
                console.error('Failed to fetch batch data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBatchData()
    }, [batchId])

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'Initial Sale':
                return UserIcon
            case 'Wholesale Transfer':
                return TruckIcon
            case 'Retail Purchase':
                return BuildingStorefrontIcon
            default:
                return ArrowPathIcon
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Loading batch information...' : 'बैच जानकारी लोड हो रही है...'}
                    </p>
                </div>
            </div>
        )
    }

    if (!batchData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Batch Not Found' : 'बैच नहीं मिला'}
                    </h1>
                    <p className={`text-gray-600 mb-6 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? 'The batch ID you scanned does not exist in our system.'
                            : 'आपके द्वारा स्कैन किया गया बैच ID हमारे सिस्टम में मौजूद नहीं है।'}
                    </p>
                    <Link
                        href="/"
                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                    >
                        {currentLang === 'en' ? 'Go to Homepage' : 'होमपेज पर जाएं'}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl">🌾</span>
                            <span className="text-xl font-bold text-gray-900">
                                {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                            </span>
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                        >
                            <GlobeAltIcon className="w-5 h-5" />
                            <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-8 mb-8">
                    <div className="flex items-center mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-green-200 mr-3" />
                        <span className={`text-sm font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Verified on Blockchain' : 'ब्लॉकचेन पर सत्यापित'}
                        </span>
                    </div>
                    <h1 className={`text-4xl font-bold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Product Journey' : 'उत्पाद की यात्रा'}
                    </h1>
                    <p className={`text-green-100 text-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'From Farm to Your Table' : 'खेत से आपकी मेज तक'}
                    </p>
                    <div className="mt-4 bg-white/20 rounded-lg p-3 inline-block">
                        <span className="text-sm font-medium">Batch ID: {batchData.batchId}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Product Details */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className={`text-xl font-semibold flex items-center ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-2" />
                                    {currentLang === 'en' ? 'Product Details' : 'उत्पाद विवरण'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Crop Type' : 'फसल का प्रकार'}
                                            </label>
                                            <p className="font-semibold text-lg">{batchData.cropType}</p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Variety' : 'किस्म'}
                                            </label>
                                            <p className="font-semibold">{batchData.variety}</p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Weight' : 'वजन'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <ScaleIcon className="w-4 h-4 mr-1" />
                                                {batchData.weight} kg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Quality Grade' : 'गुणवत्ता श्रेणी'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                                                Grade {batchData.qualityGrade}
                                            </p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Farm Location' : 'खेत का स्थान'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {batchData.farmLocation}
                                            </p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Harvest Date' : 'कटाई की तारीख'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                {batchData.harvestDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Journey */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className={`text-xl font-semibold flex items-center ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <ArrowPathIcon className="w-6 h-6 text-green-600 mr-2" />
                                    {currentLang === 'en' ? 'Supply Chain Journey' : 'आपूर्ति श्रृंखला यात्रा'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {batchData.transactions.map((transaction: any, index: number) => {
                                        const IconComponent = getTransactionIcon(transaction.type)
                                        return (
                                            <div key={transaction.id} className="flex">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <IconComponent className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    {index < batchData.transactions.length - 1 && (
                                                        <div className="w-0.5 h-16 bg-gray-200 mx-auto mt-2"></div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                                {transaction.type}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {transaction.from} → {transaction.to}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {transaction.location} • {transaction.date}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-green-600">
                                                                ₹{(transaction.amount / 100).toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ₹{(transaction.amount / 100 / batchData.weight).toFixed(2)}/kg
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quality Reports */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className={`text-xl font-semibold flex items-center ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <StarIcon className="w-6 h-6 text-purple-600 mr-2" />
                                    {currentLang === 'en' ? 'Quality Reports' : 'गुणवत्ता रिपोर्ट'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {batchData.qualityReports.map((report: any) => (
                                        <div key={report.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                        {report.type}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {currentLang === 'en' ? 'Inspector:' : 'निरीक्षक:'} {report.inspector}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{report.date}</p>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                                    Grade {report.grade}
                                                </span>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                {Object.entries(report.parameters).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-gray-600 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                                        </span>
                                                        <span className="font-medium">{value as string}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Farmer Information */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <UserIcon className="w-5 h-5 text-green-600 mr-2" />
                                    {currentLang === 'en' ? 'Farmer Information' : 'किसान की जानकारी'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserIcon className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-1">{batchData.farmerName}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{batchData.farmLocation}</p>
                                    <p className="text-sm text-gray-500">{batchData.farmerPhone}</p>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {currentLang === 'en' ? 'Sowing Date:' : 'बुआई की तारीख:'}
                                        </span>
                                        <span className="font-medium">{batchData.sowingDate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {currentLang === 'en' ? 'Harvest Date:' : 'कटाई की तारीख:'}
                                        </span>
                                        <span className="font-medium">{batchData.harvestDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Current Status' : 'वर्तमान स्थिति'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center">
                                    <BuildingStorefrontIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-semibold mb-1">{batchData.currentOwner}</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {currentLang === 'en' ? 'Current Owner' : 'वर्तमान स्वामी'}
                                    </p>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className={`text-sm text-green-800 font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Available for Purchase' : 'खरीदारी के लिए उपलब्ध'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    <PhotoIcon className="w-5 h-5 text-purple-600 mr-2" />
                                    {currentLang === 'en' ? 'Product Images' : 'उत्पाद चित्र'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {batchData.images.map((image: string, index: number) => (
                                        <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                            <PhotoIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trust Score */}
                        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl text-white p-6">
                            <h3 className={`font-semibold mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Trust Score' : 'भरोसा स्कोर'}
                            </h3>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">95%</div>
                                <p className={`text-green-100 text-sm ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Verified & Trusted' : 'सत्यापित और भरोसेमंद'}
                                </p>
                                <div className="mt-4 space-y-2 text-left">
                                    <div className="flex items-center text-sm">
                                        <CheckCircleIcon className="w-4 h-4 text-green-200 mr-2" />
                                        <span>{currentLang === 'en' ? 'Blockchain Verified' : 'ब्लॉकचेन सत्यापित'}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <CheckCircleIcon className="w-4 h-4 text-green-200 mr-2" />
                                        <span>{currentLang === 'en' ? 'Quality Certified' : 'गुणवत्ता प्रमाणित'}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <CheckCircleIcon className="w-4 h-4 text-green-200 mr-2" />
                                        <span>{currentLang === 'en' ? 'Origin Verified' : 'मूल सत्यापित'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 text-center space-y-4">
                    <Link
                        href="/"
                        className={`inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                    >
                        {currentLang === 'en' ? 'Explore More Products' : 'और उत्पाद देखें'}
                    </Link>
                    <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? 'Powered by KrashiAalok Blockchain Technology'
                            : 'कृषिआलोक ब्लॉकचेन तकनीक द्वारा संचालित'}
                    </p>
                </div>
            </div>
        </div>
    )
}