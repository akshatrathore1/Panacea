'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
    GlobeAltIcon,
    ShieldCheckIcon,
    CubeTransparentIcon,
    UserGroupIcon,
    ChartBarIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
    const { t, i18n } = useTranslation()
    const [currentLang, setCurrentLang] = useState('en')

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    const features = [
        {
            icon: ShieldCheckIcon,
            title: currentLang === 'en' ? 'Blockchain Security' : 'ब्लॉकचेन सुरक्षा',
            description: currentLang === 'en'
                ? 'Immutable records ensuring data integrity and transparency'
                : 'डेटा अखंडता और पारदर्शिता सुनिश्चित करने वाले अपरिवर्तनीय रिकॉर्ड'
        },
        {
            icon: CubeTransparentIcon,
            title: currentLang === 'en' ? 'Complete Traceability' : 'पूर्ण अनुरेखणीयता',
            description: currentLang === 'en'
                ? 'Track produce journey from farm to consumer table'
                : 'खेत से उपभोक्ता की मेज तक उत्पाद की यात्रा को ट्रैक करें'
        },
        {
            icon: UserGroupIcon,
            title: currentLang === 'en' ? 'Multi-Stakeholder Platform' : 'बहु-हितधारक मंच',
            description: currentLang === 'en'
                ? 'Connecting farmers, intermediaries, retailers and consumers'
                : 'किसानों, मध्यस्थों, खुदरा विक्रेताओं और उपभोक्ताओं को जोड़ना'
        },
        {
            icon: ChartBarIcon,
            title: currentLang === 'en' ? 'Price Transparency' : 'मूल्य पारदर्शिता',
            description: currentLang === 'en'
                ? 'Fair pricing with real-time market analytics'
                : 'वास्तविक समय के बाजार विश्लेषण के साथ उचित मूल्य निर्धारण'
        }
    ]

    const roles = [
        {
            title: t('producer'),
            description: currentLang === 'en'
                ? 'Farmers and agricultural producers'
                : 'किसान और कृषि उत्पादक',
            icon: '🌾',
            href: '/register?role=producer'
        },
        {
            title: t('intermediary'),
            description: currentLang === 'en'
                ? 'Distributors, agents, and aggregators'
                : 'वितरक, एजेंट और एग्रीगेटर',
            icon: '🚛',
            href: '/register?role=intermediary'
        },
        {
            title: t('retailer'),
            description: currentLang === 'en'
                ? 'Wholesalers and retail vendors'
                : 'थोक विक्रेता और खुदरा विक्रेता',
            icon: '🏪',
            href: '/register?role=retailer'
        },
        {
            title: t('consumer'),
            description: currentLang === 'en'
                ? 'End consumers and buyers'
                : 'अंतिम उपभोक्ता और खरीदार',
            icon: '👥',
            href: '/register?role=consumer'
        }
    ]

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="gov-header sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl">🌾</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                                </h1>
                                <p className="text-xs text-white opacity-90">
                                    {t('platform_tagline')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md transition-colors"
                                data-local-language-toggle
                            >
                                <GlobeAltIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {currentLang === 'en' ? 'हिंदी' : 'English'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? (
                            <>
                                <span className="text-orange-600">Transparent</span>{' '}
                                <span className="text-green-600">Agricultural</span>{' '}
                                <span className="text-blue-600">Supply Chain</span>
                            </>
                        ) : (
                            <>
                                <span className="text-orange-600">पारदर्शी</span>{' '}
                                <span className="text-green-600">कृषि</span>{' '}
                                <span className="text-blue-600">आपूर्ति श्रृंखला</span>
                            </>
                        )}
                    </h2>

                    <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {t('platform_description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/register"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                        >
                            {t('register')}
                        </Link>

                        <Link
                            href="/login"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
                        >
                            {t('login')}
                        </Link>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className={`text-3xl font-bold text-center mb-16 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Why Choose KrashiAalok?' : 'कृषिआलोक क्यों चुनें?'}
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon
                            return (
                                <div key={index} className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconComponent className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <h4 className={`text-xl font-semibold mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {feature.title}
                                    </h4>
                                    <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Role Selection Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className={`text-3xl font-bold text-center mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'Join as' : 'के रूप में जुड़ें'}
                    </h3>
                    <p className={`text-gray-600 text-center mb-16 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en'
                            ? 'Choose your role in the agricultural supply chain'
                            : 'कृषि आपूर्ति श्रृंखला में अपनी भूमिका चुनें'}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roles.map((role, index) => (
                            <Link
                                key={index}
                                href={role.href}
                                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-orange-200 card-hover"
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-4">{role.icon}</div>
                                    <h4 className={`text-xl font-semibold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {role.title}
                                    </h4>
                                    <p className={`text-gray-600 text-sm ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {role.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className={`text-3xl font-bold text-center mb-16 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                        {currentLang === 'en' ? 'How It Works' : 'यह कैसे काम करता है'}
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h4 className={`text-xl font-semibold mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Register & Create' : 'पंजीकरण और निर्माण'}
                            </h4>
                            <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Farmers register and create digital batches of their produce'
                                    : 'किसान पंजीकरण करते हैं और अपने उत्पाद के डिजिटल बैच बनाते हैं'}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h4 className={`text-xl font-semibold mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Track & Transfer' : 'ट्रैक और स्थानांतरण'}
                            </h4>
                            <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Each transaction is recorded on blockchain as produce moves through supply chain'
                                    : 'प्रत्येक लेनदेन ब्लॉकचेन पर दर्ज किया जाता है जब उत्पाद आपूर्ति श्रृंखला में चलता है'}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <QrCodeIcon className="w-10 h-10 text-orange-600" />
                            </div>
                            <h4 className={`text-xl font-semibold mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Scan & Verify' : 'स्कैन और सत्यापन'}
                            </h4>
                            <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Consumers scan QR codes to view complete journey and verify authenticity'
                                    : 'उपभोक्ता पूरी यात्रा देखने और प्रामाणिकता सत्यापित करने के लिए QR कोड स्कैन करते हैं'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h5 className={`text-lg font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                            </h5>
                            <p className={`text-gray-400 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Empowering transparent agricultural supply chains through blockchain technology.'
                                    : 'ब्लॉकचेन तकनीक के माध्यम से पारदर्शी कृषि आपूर्ति श्रृंखला को सशक्त बनाना।'}
                            </p>
                        </div>

                        <div>
                            <h6 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Platform' : 'मंच'}
                            </h6>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/about" className="hover:text-white">{t('about')}</Link></li>
                                <li><Link href="/marketplace" className="hover:text-white">{t('marketplace')}</Link></li>
                                <li><Link href="/analytics" className="hover:text-white">{t('analytics')}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h6 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Support' : 'सहायता'}
                            </h6>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                                <li><Link href="/contact" className="hover:text-white">{t('contact')}</Link></li>
                                <li><Link href="/dashboard/community" className="hover:text-white">Community</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h6 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Government' : 'सरकार'}
                            </h6>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/schemes" className="hover:text-white">{t('schemes')}</Link></li>
                                <li><Link href="/subsidies" className="hover:text-white">{t('subsidies')}</Link></li>
                                <li><Link href="/loans" className="hover:text-white">{t('loans')}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 KrashiAalok. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}