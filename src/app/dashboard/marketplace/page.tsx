'use client'

import { useState, useEffect } from 'react'
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
import LogoutButton from '@/components/LogoutButton'
import { formatNumber } from '@/lib/format'

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

    // Listings state (loaded from the marketplace API which stores
    // 'marketplace_products' created by the List-for-sale flow)
    const [listings, setListings] = useState<any[]>([])
    const [isLoadingListings, setIsLoadingListings] = useState(true)

    useEffect(() => {
        let mounted = true

        async function fetchListings() {
            try {
                const resp = await fetch('/api/marketplace/products')
                if (!resp.ok) throw new Error(`Marketplace API returned ${resp.status}`)
                const products = await resp.json()

                // Map API product shape to the UI's expected listing fields
                const mapped = (products || []).map((p: any) => ({
                    id: p.id || p._id || p.documentId || '',
                    // essential fields for the marketplace card
                    name: String(p.name || ''),
                    category: String(p.category || ''),
                    description: String(p.description || ''),
                    quantity: Number(p.quantity || 0),
                    unit: String(p.unit || 'kg'),
                    pricePerUnit: Number(p.price || 0),
                    totalPrice: Number(p.price || 0) * Number(p.quantity || 0),
                    harvestDate: p.harvestDate || null,
                    status: p.status || 'active',
                    createdAt: p.createdAt || new Date().toISOString(),
                    images: p.images || [],
                    // normalize producer to a simple object with the fields we use in UI
                    producer: (p.producer && typeof p.producer === 'object')
                        ? { name: p.producer.name || '', address: p.producer.address || '', phone: p.producer.phone || '' }
                        : { name: '', address: String(p.producer || ''), phone: '' },
                    verified: p.verified || false,
                    organic: p.organic || false,
                    // posted date for display
                    postedDate: p.createdAt || p.postedDate || new Date().toISOString()
                }))

                if (mounted) setListings(mapped)
            } catch (err) {
                console.warn('Failed to load marketplace listings:', err)
            } finally {
                if (mounted) setIsLoadingListings(false)
            }
        }

        fetchListings()

        return () => { mounted = false }
    }, [])

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
        const q = searchTerm.trim().toLowerCase()

        const matchesSearch = q === '' || (
            String(listing.name || '').toLowerCase().includes(q) ||
            String(listing.description || '').toLowerCase().includes(q) ||
            (listing.producer && String(listing.producer.name || '').toLowerCase().includes(q))
        )

        const matchesCrop = selectedCrop === '' || String(listing.category || '').toLowerCase() === selectedCrop

        const matchesLocation = selectedLocation === '' ||
            String(listing.category || '').toLowerCase().includes(selectedLocation)

        const matchesPrice = priceRange === '' || (() => {
            if (priceRange === '0-2000') return listing.pricePerUnit <= 2000
            if (priceRange === '2000-5000') return listing.pricePerUnit > 2000 && listing.pricePerUnit <= 5000
            if (priceRange === '5000-10000') return listing.pricePerUnit > 5000 && listing.pricePerUnit <= 10000
            if (priceRange === '10000+') return listing.pricePerUnit > 10000
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
                            <LogoutButton />
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
                            {/* Image (use uploaded image if available; fall back to placeholder) */}
                            <div className="relative">
                                <div className="aspect-video bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                                        {listing.images && listing.images.length > 0 ? (
                                        // Listing images may be stored as URLs in Firestore; render the first one
                                        // Use simple img tag to avoid Next/Image optimizations on unknown remote hosts.
                                        <img src={String(listing.images[0])} alt={listing.name || listing.category} className="w-full h-full object-cover" />
                                    ) : (
                                        <TagIcon className="w-12 h-12 text-gray-400" />
                                    )}
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
                                        <h3 className="font-semibold text-lg">{listing.name}</h3>
                                        <p className="text-sm text-gray-600">{listing.category}</p>
                                        {listing.harvestDate && (
                                            <p className="text-xs text-gray-500 mt-1">{currentLang === 'en' ? 'Harvest:' : 'कटाई'} {String(listing.harvestDate)}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-700 font-medium">{(listing.producer && listing.producer.name) || listing.name || listing.id}</div>
                                        {listing.producer && listing.producer.address && (
                                            <div className="text-xs text-gray-500 mt-1">{String(listing.producer.address).slice(0, 24)}</div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <ScaleIcon className="w-4 h-4 mr-2" />
                                        <span>{listing.quantity} {listing.unit}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-4 h-4 mr-2" />
                                        <span>{listing.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        <span>{(listing.producer && listing.producer.name) || listing.name}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">₹{formatNumber(listing.pricePerUnit)}</p>
                                            <p className="text-sm text-gray-500">{currentLang === 'en' ? `per ${listing.unit}` : `प्रति ${listing.unit}`}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{formatNumber(listing.totalPrice)}</p>
                                            <p className="text-sm text-gray-500">{currentLang === 'en' ? 'Total' : 'कुल'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleInquiry(listing)}
                                            className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        >
                                            {currentLang === 'en' ? 'Inquire Now' : 'पूछताछ करें'}
                                        </button>
                                        <a
                                            href={`tel:${(listing.producer && listing.producer.phone) || ''}`}
                                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                        </a>
                                        <button className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-3">
                                    {currentLang === 'en' ? 'Posted' : 'पोस्ट किया गया'} {new Date(listing.postedDate).toLocaleString('en-IN')}
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