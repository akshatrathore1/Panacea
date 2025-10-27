'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    ScaleIcon,
    StarIcon,
    UserIcon,
    PhoneIcon,
    TagIcon,
    GlobeAltIcon,
    ChatBubbleLeftRightIcon,
    HeartIcon
} from '@heroicons/react/24/outline'

export default function MarketplacePage() {
    const { t, i18n } = useTranslation()
    const currentLang = i18n.language || 'en'
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCrop, setSelectedCrop] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('')
    const [priceRange, setPriceRange] = useState('')
    const [sortBy, setSortBy] = useState('latest')

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        i18n.changeLanguage(newLang)
    }

    // Mock marketplace data
    const listings = [
        {
            id: 'BATCH001',
            cropType: 'Wheat',
            variety: 'Durum',
            weight: 500,
            qualityGrade: 'A',
            pricePerKg: 2500,
            totalPrice: 1250000,
            location: 'Ludhiana, Punjab',
            farmerName: 'Ram Singh',
            farmerPhone: '+91 98765 43210',
            postedDate: '2 days ago',
            images: ['/api/placeholder/200/150'],
            verified: true,
            organic: false,
            description: 'High quality durum wheat, freshly harvested and properly stored.',
            distance: '12 km'
        },
        {
            id: 'BATCH002',
            cropType: 'Rice',
            variety: 'Basmati',
            weight: 300,
            qualityGrade: 'Premium',
            pricePerKg: 4500,
            totalPrice: 1350000,
            location: 'Amritsar, Punjab',
            farmerName: 'Gurpreet Kaur',
            farmerPhone: '+91 98765 43211',
            postedDate: '1 day ago',
            images: ['/api/placeholder/200/150'],
            verified: true,
            organic: true,
            description: 'Premium basmati rice with authentic aroma and long grains.',
            distance: '25 km'
        },
        {
            id: 'BATCH003',
            cropType: 'Tomato',
            variety: 'Cherry',
            weight: 100,
            qualityGrade: 'A',
            pricePerKg: 8000,
            totalPrice: 800000,
            location: 'Chandigarh',
            farmerName: 'Rajesh Kumar',
            farmerPhone: '+91 98765 43212',
            postedDate: '3 hours ago',
            images: ['/api/placeholder/200/150'],
            verified: true,
            organic: false,
            description: 'Fresh cherry tomatoes, perfect for salads and cooking.',
            distance: '8 km'
        },
        {
            id: 'BATCH004',
            cropType: 'Potato',
            variety: 'Red',
            weight: 1000,
            qualityGrade: 'B',
            pricePerKg: 1800,
            totalPrice: 1800000,
            location: 'Jalandhar, Punjab',
            farmerName: 'Hardeep Singh',
            farmerPhone: '+91 98765 43213',
            postedDate: '1 week ago',
            images: ['/api/placeholder/200/150'],
            verified: false,
            organic: false,
            description: 'Good quality red potatoes suitable for wholesale purchase.',
            distance: '45 km'
        }
    ]

    const cropTypes = [
        { value: '', label: currentLang === 'en' ? 'All Crops' : 'सभी फसलें' },
        { value: 'wheat', label: currentLang === 'en' ? 'Wheat' : 'गेहूं' },
        { value: 'rice', label: currentLang === 'en' ? 'Rice' : 'चावल' },
        { value: 'tomato', label: currentLang === 'en' ? 'Tomato' : 'टमाटर' },
        { value: 'potato', label: currentLang === 'en' ? 'Potato' : 'आलू' },
        { value: 'onion', label: currentLang === 'en' ? 'Onion' : 'प्याज' }
    ]

    const locations = [
        { value: '', label: currentLang === 'en' ? 'All Locations' : 'सभी स्थान' },
        { value: 'punjab', label: 'Punjab' },
        { value: 'haryana', label: 'Haryana' },
        { value: 'rajasthan', label: 'Rajasthan' },
        { value: 'uttarpradesh', label: 'Uttar Pradesh' }
    ]

    const priceRanges = [
        { value: '', label: currentLang === 'en' ? 'Any Price' : 'कोई भी मूल्य' },
        { value: '0-2000', label: '₹0 - ₹2,000' },
        { value: '2000-5000', label: '₹2,000 - ₹5,000' },
        { value: '5000-10000', label: '₹5,000 - ₹10,000' },
        { value: '10000+', label: '₹10,000+' }
    ]

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCrop = selectedCrop === '' || listing.cropType.toLowerCase() === selectedCrop

        const matchesLocation = selectedLocation === '' ||
            listing.location.toLowerCase().includes(selectedLocation)

        const matchesPrice = priceRange === '' || (() => {
            if (priceRange === '0-2000') return listing.pricePerKg <= 2000
            if (priceRange === '2000-5000') return listing.pricePerKg > 2000 && listing.pricePerKg <= 5000
            if (priceRange === '5000-10000') return listing.pricePerKg > 5000 && listing.pricePerKg <= 10000
            if (priceRange === '10000+') return listing.pricePerKg > 10000
            return true
        })()

        return matchesSearch && matchesCrop && matchesLocation && matchesPrice
    })

    const handleInquiry = (listing: any) => {
        // Simulate inquiry functionality
        alert(currentLang === 'en'
            ? `Inquiry sent to ${listing.farmerName}! They will contact you soon.`
            : `${listing.farmerName} को पूछताछ भेजी गई! वे जल्द ही आपसे संपर्क करेंगे।`
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

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                                data-local-language-toggle
                            >
                                <GlobeAltIcon className="w-5 h-5" />
                                <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
                            </button>

                            <Link
                                href="/login"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                {t('login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Agricultural Marketplace' : 'कृषि बाज़ार'}
                    </h1>
                    <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? 'Discover fresh agricultural produce directly from verified farmers'
                            : 'सत्यापित किसानों से सीधे ताज़ा कृषि उत्पाद खोजें'}
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <div className="grid lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                    placeholder={currentLang === 'en' ? 'Search crops, varieties, farmers...' : 'फसल, किस्म, किसान खोजें...'}
                                />
                            </div>
                        </div>

                        {/* Crop Filter */}
                        <div>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {cropTypes.map((crop) => (
                                    <option key={crop.value} value={crop.value}>{crop.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {locations.map((location) => (
                                    <option key={location.value} value={location.value}>{location.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {priceRanges.map((range) => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                <option value="latest">{currentLang === 'en' ? 'Latest' : 'नवीनतम'}</option>
                                <option value="price-low">{currentLang === 'en' ? 'Price: Low to High' : 'मूल्य: कम से अधिक'}</option>
                                <option value="price-high">{currentLang === 'en' ? 'Price: High to Low' : 'मूल्य: अधिक से कम'}</option>
                                <option value="distance">{currentLang === 'en' ? 'Distance' : 'दूरी'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {filteredListings.length} {currentLang === 'en' ? 'listings found' : 'सूचियां मिलीं'}
                        </p>
                        <button className={`flex items-center space-x-1 text-green-600 hover:text-green-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            <FunnelIcon className="w-4 h-4" />
                            <span>{currentLang === 'en' ? 'More Filters' : 'अधिक फ़िल्टर'}</span>
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            {/* Image */}
                            <div className="relative">
                                <div className="aspect-video bg-gray-100 rounded-t-xl flex items-center justify-center">
                                    <TagIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                {listing.organic && (
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            {currentLang === 'en' ? 'Organic' : 'जैविक'}
                                        </span>
                                    </div>
                                )}
                                {listing.verified && (
                                    <div className="absolute top-3 right-3">
                                        <div className="bg-blue-500 text-white p-1 rounded-full">
                                            <StarIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                                <button className="absolute bottom-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full">
                                    <HeartIcon className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">{listing.cropType}</h3>
                                        <p className="text-sm text-gray-600">{listing.variety}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${listing.qualityGrade === 'Premium' || listing.qualityGrade === 'A'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {listing.qualityGrade}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <ScaleIcon className="w-4 h-4 mr-2" />
                                        <span>{listing.weight} kg</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPinIcon className="w-4 h-4 mr-2" />
                                        <span>{listing.location} • {listing.distance}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        <span>{listing.farmerName}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">₹{listing.pricePerKg.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">per kg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{(listing.totalPrice / 100).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">{currentLang === 'en' ? 'Total' : 'कुल'}</p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleInquiry(listing)}
                                            className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        >
                                            {currentLang === 'en' ? 'Inquire Now' : 'पूछताछ करें'}
                                        </button>
                                        <a
                                            href={`tel:${listing.farmerPhone}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                        </a>
                                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-3">
                                    {currentLang === 'en' ? 'Posted' : 'पोस्ट किया गया'} {listing.postedDate}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                    <button className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Load More Listings' : 'अधिक सूचियां लोड करें'}
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-16 bg-green-50 rounded-xl p-8 text-center">
                    <h2 className={`text-2xl font-bold text-green-800 mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Need Help?' : 'मदद चाहिए?'}
                    </h2>
                    <p className={`text-green-700 mb-6 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? 'Our team is here to help you find the right agricultural produce for your needs.'
                            : 'हमारी टीम आपकी आवश्यकताओं के लिए सही कृषि उत्पाद खोजने में आपकी मदद करने के लिए यहां है।'}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <a
                            href="tel:+91-1800-123-4567"
                            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                        >
                            {currentLang === 'en' ? 'Call Support' : 'सहायता कॉल करें'}
                        </a>
                        <Link
                            href="/help"
                            className={`border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                        >
                            {currentLang === 'en' ? 'Help Center' : 'सहायता केंद्र'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}