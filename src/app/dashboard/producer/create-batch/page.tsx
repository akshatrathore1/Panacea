'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeftIcon,
    CubeIcon,
    MapPinIcon,
    ScaleIcon,
    StarIcon,
    BanknotesIcon,
    CloudArrowUpIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline'

import { getClientDb } from '../../../../lib/firebase/client'
import { collection, addDoc } from 'firebase/firestore'
import { ethers } from 'ethers'
import { blockchainHelpers } from '../../../../lib/blockchain'

export default function CreateBatchPage() {
    const { t, i18n } = useTranslation()
    const router = useRouter()
    const [currentLang, setCurrentLang] = useState('en')
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)
    const [generatedBatchId, setGeneratedBatchId] = useState('')

    const [formData, setFormData] = useState({
        cropType: '',
        variety: '',
        farmLocation: '',
        weight: '',
        qualityGrade: '',
        pricePerKg: '',
        sowingDate: '',
        harvestDate: '',
        organicCertified: false,
        moistureContent: '',
        testResults: '',
        images: [] as File[],
        nfcCardId: '',
        biometricVerified: false
    })

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'hi' : 'en'
        setCurrentLang(newLang)
        i18n.changeLanguage(newLang)
    }

    const cropTypes = [
        { value: 'wheat', label: currentLang === 'en' ? 'Wheat' : 'गेहूं' },
        { value: 'rice', label: currentLang === 'en' ? 'Rice' : 'चावल' },
        { value: 'corn', label: currentLang === 'en' ? 'Corn' : 'मक्का' },
        { value: 'sugarcane', label: currentLang === 'en' ? 'Sugarcane' : 'गन्ना' },
        { value: 'cotton', label: currentLang === 'en' ? 'Cotton' : 'कपास' },
        { value: 'tomato', label: currentLang === 'en' ? 'Tomato' : 'टमाटर' },
        { value: 'potato', label: currentLang === 'en' ? 'Potato' : 'आलू' },
        { value: 'onion', label: currentLang === 'en' ? 'Onion' : 'प्याज' }
    ]

    const qualityGrades = [
        { value: 'A', label: 'Grade A - Premium' },
        { value: 'B', label: 'Grade B - Good' },
        { value: 'C', label: 'Grade C - Standard' },
        { value: 'Organic', label: currentLang === 'en' ? 'Organic Certified' : 'जैविक प्रमाणित' },
        { value: 'Premium', label: currentLang === 'en' ? 'Premium Quality' : 'प्रीमियम गुणवत्ता' }
    ]

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setFormData({ ...formData, images: [...formData.images, ...files] })
    }

    const simulateNFCTap = () => {
        setFormData({ ...formData, nfcCardId: 'NFC_' + Math.random().toString(36).substr(2, 9) })
        alert(currentLang === 'en' ? 'NFC Card Tapped Successfully!' : 'NFC कार्ड सफलतापूर्वक टैप किया गया!')
    }

    const simulateBiometric = () => {
        setFormData({ ...formData, biometricVerified: true })
        alert(currentLang === 'en' ? 'Biometric Verification Complete!' : 'बायोमेट्रिक सत्यापन पूर्ण!')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Generate batch ID
            const batchId = 'BATCH_' + Date.now()

            // Try to write to blockchain if wallet available (best-effort)
            try {
                if ((window as any).ethereum) {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                    const signer = await provider.getSigner()

                    await blockchainHelpers.createBatch(
                        signer,
                        batchId,
                        formData.cropType || 'unknown',
                        formData.farmLocation || '',
                        formData.harvestDate ? new Date(formData.harvestDate).getTime() : Date.now(),
                        JSON.stringify({ variety: formData.variety, weight: formData.weight })
                    )
                }
            } catch (chainErr) {
                // Non-fatal: continue and persist to Firestore for marketplace indexing
                console.warn('Blockchain write failed (continuing):', chainErr)
            }

            // Persist listing to Firestore for marketplace indexing
            try {
                const db = getClientDb()
                const batchesCol = collection(db, 'batches')

                // Attempt to fetch producer address if wallet present
                let producerAddress = ''
                if ((window as any).ethereum) {
                    try {
                        const provider = new ethers.BrowserProvider((window as any).ethereum)
                        const signer = await provider.getSigner()
                        producerAddress = await signer.getAddress()
                    } catch (addrErr) {
                        console.warn('Could not read wallet address:', addrErr)
                    }
                }

                await addDoc(batchesCol, {
                    batchId,
                    cropType: formData.cropType,
                    variety: formData.variety,
                    weight: Number(formData.weight) || 0,
                    qualityGrade: formData.qualityGrade,
                    pricePerKg: Number(formData.pricePerKg) || 0,
                    totalPrice: (Number(formData.pricePerKg) || 0) * (Number(formData.weight) || 0),
                    location: formData.farmLocation,
                    farmerName: producerAddress || 'Producer',
                    farmerPhone: '',
                    postedDate: new Date().toISOString(),
                    images: [],
                    verified: false,
                    organic: formData.organicCertified || false,
                    description: '',
                    distance: ''
                })
            } catch (dbErr) {
                console.warn('Failed to save batch to Firestore:', dbErr)
            }

            // Set UI state
            setGeneratedBatchId(batchId)
            setShowSuccess(true)
            setStep(3)

        } catch (error) {
            console.error('Failed to create batch:', error)
            alert(currentLang === 'en' ? 'Failed to create batch' : 'बैच बनाने में असफल')
        } finally {
            setIsLoading(false)
        }
    }

    const generateQRCode = () => {
        // In a real implementation, this would generate a proper QR code
        const qrData = `https://krishialok.com/trace/${generatedBatchId}`
        return qrData
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard/producer" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>{currentLang === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस'}</span>
                            </Link>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {currentLang === 'en' ? 'हिंदी' : 'English'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 3 && (
                                    <div className={`w-12 h-1 mx-2 ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {step === 1 && (currentLang === 'en' ? 'Crop Details' : 'फसल विवरण')}
                            {step === 2 && (currentLang === 'en' ? 'Verification' : 'सत्यापन')}
                            {step === 3 && (currentLang === 'en' ? 'Batch Created' : 'बैच बनाया गया')}
                        </p>
                    </div>
                </div>

                {/* Step 1: Crop Details */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="text-center mb-8">
                            <CubeIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h1 className={`text-3xl font-bold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Create New Crop Batch' : 'नई फसल बैच बनाएं'}
                            </h1>
                            <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Enter details about your agricultural produce for blockchain tracking'
                                    : 'ब्लॉकचेन ट्रैकिंग के लिए अपने कृषि उत्पाद के बारे में विवरण दर्ज करें'}
                            </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('crop_type')}
                                    </label>
                                    <select
                                        value={formData.cropType}
                                        onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        required
                                    >
                                        <option value="">{currentLang === 'en' ? 'Select crop type' : 'फसल का प्रकार चुनें'}</option>
                                        {cropTypes.map((crop) => (
                                            <option key={crop.value} value={crop.value}>{crop.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('variety')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.variety}
                                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        placeholder={currentLang === 'en' ? 'e.g., Basmati, Durum' : 'जैसे, बासमती, दुरुम'}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Farm Location' : 'खेत का स्थान'}
                                </label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.farmLocation}
                                        onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        placeholder={currentLang === 'en' ? 'Village, District, State' : 'गांव, जिला, राज्य'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('weight')}
                                    </label>
                                    <div className="relative">
                                        <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('quality_grade')}
                                    </label>
                                    <select
                                        value={formData.qualityGrade}
                                        onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        required
                                    >
                                        <option value="">{currentLang === 'en' ? 'Select grade' : 'ग्रेड चुनें'}</option>
                                        {qualityGrades.map((grade) => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {t('price_per_kg')}
                                    </label>
                                    <div className="relative">
                                        <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.pricePerKg}
                                            onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="2500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Sowing Date' : 'बुआई की तारीख'}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.sowingDate}
                                        onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Harvest Date' : 'कटाई की तारीख'}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.harvestDate}
                                        onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Upload Images' : 'चित्र अपलोड करें'}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="text-center">
                                        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                        >
                                            {currentLang === 'en' ? 'Select Images' : 'चित्र चुनें'}
                                        </label>
                                        <p className={`text-sm text-gray-500 mt-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en' ? 'Upload photos of your crop and farm' : 'अपनी फसल और खेत की तस्वीरें अपलोड करें'}
                                        </p>
                                    </div>
                                    {formData.images.length > 0 && (
                                        <div className="mt-4">
                                            <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {formData.images.length} {currentLang === 'en' ? 'images selected' : 'चित्र चुने गए'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link
                                    href="/dashboard/producer"
                                    className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {t('cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {currentLang === 'en' ? 'Continue' : 'जारी रखें'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 2: Verification */}
                {step === 2 && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="text-center mb-8">
                            <StarIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h2 className={`text-2xl font-bold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Verification Required' : 'सत्यापन आवश्यक'}
                            </h2>
                            <p className={`text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'Complete verification to register your batch on blockchain'
                                    : 'ब्लॉकचेन पर अपना बैच पंजीकृत करने के लिए सत्यापन पूरा करें'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* NFC Card Verification */}
                            <div className="border rounded-lg p-6">
                                <h3 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'NFC Card Verification' : 'NFC कार्ड सत्यापन'}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en'
                                                ? 'Tap your NFC farmer card to verify identity'
                                                : 'पहचान सत्यापित करने के लिए अपना NFC किसान कार्ड टैप करें'}
                                        </p>
                                        {formData.nfcCardId && (
                                            <p className="text-sm text-green-600 mt-1">Card ID: {formData.nfcCardId}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={simulateNFCTap}
                                        className={`px-4 py-2 ${formData.nfcCardId ? 'bg-green-600' : 'bg-blue-600'} hover:bg-blue-700 text-white rounded-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                    >
                                        {formData.nfcCardId
                                            ? (currentLang === 'en' ? 'Verified ✓' : 'सत्यापित ✓')
                                            : (currentLang === 'en' ? 'Tap NFC Card' : 'NFC कार्ड टैप करें')}
                                    </button>
                                </div>
                            </div>

                            {/* Biometric Verification */}
                            <div className="border rounded-lg p-6">
                                <h3 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Biometric Verification' : 'बायोमेट्रिक सत्यापन'}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                            {currentLang === 'en'
                                                ? 'Complete fingerprint verification for secure transaction signing'
                                                : 'सुरक्षित लेनदेन हस्ताक्षर के लिए फिंगरप्रिंट सत्यापन पूरा करें'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={simulateBiometric}
                                        className={`px-4 py-2 ${formData.biometricVerified ? 'bg-green-600' : 'bg-orange-600'} hover:bg-orange-700 text-white rounded-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                    >
                                        {formData.biometricVerified
                                            ? (currentLang === 'en' ? 'Verified ✓' : 'सत्यापित ✓')
                                            : (currentLang === 'en' ? 'Scan Fingerprint' : 'फिंगरप्रिंट स्कैन करें')}
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className={`font-semibold mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                    {currentLang === 'en' ? 'Batch Summary' : 'बैच सारांश'}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">{currentLang === 'en' ? 'Crop:' : 'फसल:'}</span>
                                        <span className="ml-2 font-medium">{formData.cropType} ({formData.variety})</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{currentLang === 'en' ? 'Weight:' : 'वजन:'}</span>
                                        <span className="ml-2 font-medium">{formData.weight} kg</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{currentLang === 'en' ? 'Quality:' : 'गुणवत्ता:'}</span>
                                        <span className="ml-2 font-medium">{formData.qualityGrade}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{currentLang === 'en' ? 'Price:' : 'मूल्य:'}</span>
                                        <span className="ml-2 font-medium">₹{formData.pricePerKg}/kg</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {currentLang === 'en' ? 'Back' : 'वापस'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.nfcCardId || !formData.biometricVerified || isLoading}
                                    className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="loading-dots">
                                            {currentLang === 'en' ? 'Creating Batch' : 'बैच बनाया जा रहा है'}
                                        </span>
                                    ) : (
                                        currentLang === 'en' ? 'Create Batch' : 'बैच बनाएं'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && showSuccess && (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="text-6xl mb-6">🎉</div>
                        <h2 className={`text-3xl font-bold text-green-600 mb-4 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en' ? 'Batch Created Successfully!' : 'बैच सफलतापूर्वक बनाया गया!'}
                        </h2>
                        <p className={`text-gray-600 mb-6 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                            {currentLang === 'en'
                                ? 'Your crop batch has been registered on the blockchain and is now traceable.'
                                : 'आपका फसल बैच ब्लॉकचेन पर पंजीकृत हो गया है और अब ट्रैक किया जा सकता है।'}
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <QrCodeIcon className="w-16 h-16 text-gray-600" />
                            </div>
                            <p className={`font-semibold mb-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en' ? 'Batch ID:' : 'बैच ID:'}
                            </p>
                            <p className="text-lg font-mono bg-white p-2 rounded border">{generatedBatchId}</p>
                            <p className={`text-sm text-gray-600 mt-2 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                {currentLang === 'en'
                                    ? 'QR Code will be generated for your produce packaging'
                                    : 'आपके उत्पाद पैकेजिंग के लिए QR कोड जेनरेट किया जाएगा'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/dashboard/producer"
                                className={`block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {currentLang === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएं'}
                            </Link>
                            <button
                                onClick={() => {
                                    setStep(1)
                                    setShowSuccess(false)
                                    setFormData({
                                        cropType: '',
                                        variety: '',
                                        farmLocation: '',
                                        weight: '',
                                        qualityGrade: '',
                                        pricePerKg: '',
                                        sowingDate: '',
                                        harvestDate: '',
                                        organicCertified: false,
                                        moistureContent: '',
                                        testResults: '',
                                        images: [],
                                        nfcCardId: '',
                                        biometricVerified: false
                                    })
                                }}
                                className={`w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {currentLang === 'en' ? 'Create Another Batch' : 'दूसरा बैच बनाएं'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}