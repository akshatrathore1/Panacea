'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'
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
import LogoutButton from '@/components/LogoutButton'
import { useWeb3 } from '@/components/Providers'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import Image from 'next/image'

import { getClientDb, getClientApp } from '../../../../lib/firebase/client'
import { doc, setDoc } from 'firebase/firestore'
import { ethers } from 'ethers'
import QRCode from 'qrcode'
import { canonicalJson } from '@/lib/canonicalJson'
import { blockchainHelpers, isContractConfigured } from '../../../../lib/blockchain'
import type { JsonValue } from '@/types/json'

type MediaEntry = {
    name: string
    url: string
    hash: string
    contentType: string
    size: number
}

const canonicalizeAddress = (value?: string | null) => {
    if (!value) return null
    const trimmed = value.trim()
    if (!trimmed) return null
    const isHex = /^0x[a-f0-9]{40}$/i.test(trimmed)
    if (isHex) {
        try {
            return ethers.getAddress(trimmed)
        } catch {
            return trimmed.toLowerCase()
        }
    }
    return trimmed.toLowerCase()
}

export default function CreateBatchPage() {
    const { t } = useTranslation()
    const pathname = usePathname()
    const [dashboardBasePath, setDashboardBasePath] = useState('/dashboard/producer')

    useEffect(() => {
        if (!pathname) return
        const normalizedBase = pathname.startsWith('/dashboard/intermediary') ? '/dashboard/intermediary' : '/dashboard/producer'
        setDashboardBasePath(normalizedBase)
    }, [pathname])
    const { user } = useWeb3()
    const { language: currentLang } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)
    const [generatedBatchId, setGeneratedBatchId] = useState('')
    const [producerWalletAddress, setProducerWalletAddress] = useState('')

    const isIntermediaryFlow = dashboardBasePath === '/dashboard/intermediary'
    const [metadataHash, setMetadataHash] = useState('')
    const [metadataDocPath, setMetadataDocPath] = useState('')
    const [qrImage, setQrImage] = useState('')
    const [mediaAssets, setMediaAssets] = useState<MediaEntry[]>([])
    const [isListing, setIsListing] = useState(false)
    const [listingSuccess, setListingSuccess] = useState(false)
    const [listingError, setListingError] = useState<string | null>(null)
    const [onChainStatus, setOnChainStatus] = useState<'idle' | 'pending' | 'success' | 'skipped' | 'failed'>('idle')
    const [onChainError, setOnChainError] = useState<string | null>(null)

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
        biometricVerified: false,
        producerSourceName: '',
        producerSourceAddress: '',
        intermediaryNotes: ''
    })

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

    type EthereumWindow = Window & typeof globalThis & {
        ethereum?: ethers.Eip1193Provider & {
            request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
        }
    }

    const getEthereumWindow = (): EthereumWindow | null =>
        (typeof window === 'undefined' ? null : (window as EthereumWindow))

    const ensureOnChainRegistration = async (activeSigner: ethers.JsonRpcSigner) => {
        try {
            const provider = activeSigner.provider
            const walletAddress = await activeSigner.getAddress()
            if (provider) {
                const onChainProfile = await blockchainHelpers.getUser(provider, walletAddress)
                if (onChainProfile && (onChainProfile.wallet || onChainProfile.userAddress)) {
                    const recordedAddress = (onChainProfile.wallet ?? onChainProfile.userAddress) as string
                    if (recordedAddress && recordedAddress !== ethers.ZeroAddress) {
                        return true
                    }
                }
            }
        } catch (lookupErr) {
            console.warn('On-chain profile lookup failed, attempting registration:', lookupErr)
        }

        try {
            await blockchainHelpers.registerUser(
                activeSigner,
                isIntermediaryFlow ? 1 : 0,
                user?.name || (isIntermediaryFlow ? 'Intermediary' : 'Producer'),
                user?.phone || '+910000000000',
                formData.farmLocation || user?.address || 'Unknown'
            )
            return true
        } catch (registerErr) {
            console.error('On-chain user registration failed:', registerErr)
            setOnChainError(
                currentLang === 'en'
                    ? 'On-chain user registration failed. Please approve the MetaMask prompt and try again.'
                    : 'ऑन-चेन उपयोगकर्ता पंजीकरण विफल रहा। कृपया मेटामास्क प्रॉम्प्ट को स्वीकृत करके पुनः प्रयास करें।'
            )
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setOnChainStatus('idle')
        setOnChainError(null)

        try {
            const batchId = blockchainHelpers.generateBatchId(formData.cropType || 'CRP', formData.farmLocation || 'IN')
            const createdAt = new Date().toISOString()
            const actorRole = isIntermediaryFlow ? 'intermediary' : 'producer'

            let signer: ethers.JsonRpcSigner | null = null
            let producerAddress = ''

            const ethereumWindow = getEthereumWindow()
            if (ethereumWindow?.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(ethereumWindow.ethereum)
                    await ethereumWindow.ethereum.request?.({ method: 'eth_requestAccounts' })
                    signer = await provider.getSigner()
                    producerAddress = await signer.getAddress()
                } catch (walletErr) {
                    console.warn('Wallet interaction failed, proceeding without signer:', walletErr)
                    signer = null
                    producerAddress = ''
                }
            }

            setProducerWalletAddress(producerAddress || '')

            const creatorAddress = canonicalizeAddress(producerAddress) ?? canonicalizeAddress(user?.address) ?? null

            const mediaEntries: Array<{
                name: string
                url: string
                hash: string
                contentType: string
                size: number
            }> = []

            if (formData.images?.length) {
                try {
                    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
                    const app = getClientApp()
                    const storage = getStorage(app)

                    for (const file of formData.images) {
                        try {
                            const buffer = await file.arrayBuffer()
                            const hash = ethers.keccak256(new Uint8Array(buffer))
                            const safeName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
                            const fileRef = ref(storage, `batches/${batchId}/${safeName}`)
                            await uploadBytes(fileRef, file, { contentType: file.type })
                            const url = await getDownloadURL(fileRef)
                            mediaEntries.push({
                                name: file.name,
                                url,
                                hash,
                                contentType: file.type || 'application/octet-stream',
                                size: file.size
                            })
                        } catch (fileErr) {
                            console.warn('Failed to upload supporting file, skipping:', fileErr)
                        }
                    }
                } catch (storageErr) {
                    console.warn('Unable to upload media assets:', storageErr)
                }
            }

            setMediaAssets(mediaEntries)

            const metadataRecord = {
                batchId,
                cropType: formData.cropType,
                variety: formData.variety,
                quantityKg: Number(formData.weight) || 0,
                pricePerKg: Number(formData.pricePerKg) || 0,
                qualityGrade: formData.qualityGrade,
                harvestDate: formData.harvestDate || null,
                sowingDate: formData.sowingDate || null,
                origin: formData.farmLocation,
                moistureContent: formData.moistureContent || null,
                labReportSummary: formData.testResults || null,
                organicCertified: !!formData.organicCertified,
                media: mediaEntries,
                createdAt,
                workflowActor: actorRole,
                createdBy: {
                    name: user?.name ?? null,
                    address: creatorAddress,
                    phone: user?.phone ?? null
                },
                sourceProducer: isIntermediaryFlow
                    ? {
                        name: formData.producerSourceName || null,
                        address: formData.producerSourceAddress || null,
                        notes: formData.intermediaryNotes || null
                    }
                    : null,
                nfcCardId: formData.nfcCardId || null,
                biometricVerified: !!formData.biometricVerified,
                version: 1
            }

            const metadataCanonical = canonicalJson(metadataRecord as JsonValue)
            const metadataDigest = ethers.keccak256(ethers.toUtf8Bytes(metadataCanonical))

            try {
                const db = getClientDb()

                await setDoc(doc(db, 'batchMetadata', batchId), {
                    ...metadataRecord,
                    metadataHash: metadataDigest,
                    metadataCanonical,
                    updatedAt: createdAt,
                    currentOwnerAddress: creatorAddress,
                    ownershipHistory: [
                        {
                            from: null,
                            to: creatorAddress,
                            actorRole,
                            recipientRole: actorRole,
                            note: 'batch_created',
                            otp: null,
                            transactionHash: null,
                            timestamp: createdAt
                        }
                    ]
                })

                await setDoc(doc(db, 'batches', batchId), {
                    batchId,
                    cropType: formData.cropType,
                    variety: formData.variety,
                    weight: Number(formData.weight) || 0,
                    qualityGrade: formData.qualityGrade,
                    pricePerKg: Number(formData.pricePerKg) || 0,
                    totalPrice: (Number(formData.pricePerKg) || 0) * (Number(formData.weight) || 0),
                    location: formData.farmLocation,
                    farmerName: user?.name || producerAddress || 'Producer',
                    farmerPhone: user?.phone || '',
                    postedDate: createdAt,
                    images: mediaEntries.map((media) => media.url),
                    verified: false,
                    organic: formData.organicCertified || false,
                    description: formData.intermediaryNotes || '',
                    distance: '',
                    metadataHash: metadataDigest,
                    metadataPath: `batchMetadata/${batchId}`,
                    listed: false,
                    listedAt: null
                })

                setListingSuccess(false)
                setListingError(null)
            } catch (dbErr) {
                console.warn('Failed to persist batch metadata:', dbErr)
            }

            if (!signer) {
                setOnChainStatus('skipped')
                setOnChainError(
                    currentLang === 'en'
                        ? 'Skipped blockchain write because a wallet connection was not approved.'
                        : 'वॉलेट कनेक्शन स्वीकृत न होने के कारण ब्लॉकचेन पर लिखना छोड़ दिया गया।'
                )
            } else if (!isContractConfigured) {
                setOnChainStatus('skipped')
                setOnChainError(
                    currentLang === 'en'
                        ? 'Set NEXT_PUBLIC_CONTRACT_ADDRESS to your deployed SupplyChain contract address to enable blockchain storage.'
                        : 'ब्लॉकचेन स्टोरेज सक्षम करने के लिए NEXT_PUBLIC_CONTRACT_ADDRESS को परिनियोजित SupplyChain कॉन्ट्रैक्ट पते पर सेट करें।'
                )
            } else {
                const registered = await ensureOnChainRegistration(signer)
                if (!registered) {
                    setOnChainStatus('failed')
                } else {
                    setOnChainStatus('pending')
                    try {
                        const normalizedWeight = Math.max(1, Math.round(Number(formData.weight) || 0))
                        const qualityGradeIndex = (() => {
                            switch ((formData.qualityGrade || 'A').toUpperCase()) {
                                case 'B':
                                    return 1
                                case 'C':
                                    return 2
                                case 'ORGANIC':
                                    return 3
                                case 'PREMIUM':
                                    return 4
                                default:
                                    return 0
                            }
                        })()

                        const pricePerKgWei = (() => {
                            const raw = (formData.pricePerKg || '').toString().trim()
                            if (!raw) return BigInt(0)
                            try {
                                return ethers.parseUnits(raw, 18)
                            } catch {
                                return BigInt(0)
                            }
                        })()

                        await blockchainHelpers.createBatch(
                            signer,
                            formData.cropType || 'Unknown',
                            formData.variety || 'Standard',
                            formData.farmLocation || 'Unknown',
                            normalizedWeight,
                            qualityGradeIndex,
                            pricePerKgWei,
                            JSON.stringify({
                                metadataHash: metadataDigest,
                                metadataPath: `batchMetadata/${batchId}`,
                                createdAt,
                                workflowActor: actorRole
                            })
                        )
                        setOnChainStatus('success')
                    } catch (chainErr) {
                        console.warn('Blockchain write failed (continuing):', chainErr)
                        setOnChainStatus('failed')
                        setOnChainError(
                            currentLang === 'en'
                                ? 'Blockchain transaction failed. Check the console for details and try again.'
                                : 'ब्लॉकचेन ट्रांज़ेक्शन विफल हो गया। अधिक जानकारी के लिए कंसोल देखें और पुनः प्रयास करें।'
                        )
                    }
                }
            }

            const qrTarget = typeof window !== 'undefined'
                ? `${window.location.origin}/trace/${batchId}`
                : `https://example.com/trace/${batchId}`

            try {
                const dataUrl = await QRCode.toDataURL(qrTarget, { width: 256, margin: 2 })
                setQrImage(dataUrl)
            } catch (qrErr) {
                console.warn('QR code generation failed:', qrErr)
                setQrImage('')
            }

            setMetadataHash(metadataDigest)
            setMetadataDocPath(`batchMetadata/${batchId}`)
            setGeneratedBatchId(batchId)
            setShowSuccess(true)
            setStep(3)
        } catch (error: unknown) {
            console.error('Failed to create batch:', error)
            alert(currentLang === 'en' ? 'Failed to create batch' : 'बैच बनाने में असफल')
        } finally {
            setIsLoading(false)
        }
    }

    const handleListOnMarketplace = async () => {
        if (!generatedBatchId || listingSuccess) return
        setIsListing(true)
        setListingError(null)

        try {
            const producerAddressForListing = producerWalletAddress || user?.address || ''
            const productName = formData.variety
                ? `${formData.cropType || 'Produce'} - ${formData.variety}`
                : formData.cropType || 'Produce'
            const imageUrls = mediaAssets.map((media) => media.url)
            const productPayload = {
                name: productName,
                quantity: Number(formData.weight) || 0,
                unit: 'kg',
                price: Number(formData.pricePerKg) || 0,
                description: formData.intermediaryNotes || formData.variety || '',
                category: formData.cropType || 'uncategorized',
                harvestDate: formData.harvestDate || null,
                producer: producerAddressForListing,
                images: imageUrls,
                batchId: generatedBatchId,
                metadataHash,
                metadataPath: metadataDocPath,
                workflowActor: isIntermediaryFlow ? 'intermediary' : 'producer'
            }

            const resp = await fetch('/api/marketplace/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload)
            })

            if (!resp.ok) {
                const message = await resp.text()
                throw new Error(message || 'Marketplace API returned an error')
            }

            setListingSuccess(true)
            setListingError(null)

            try {
                const db = getClientDb()
                await setDoc(
                    doc(db, 'batches', generatedBatchId),
                    {
                        listed: true,
                        listedAt: new Date().toISOString()
                    },
                    { merge: true }
                )
            } catch (flagErr) {
                console.warn('Failed to mark batch as listed:', flagErr)
            }
        } catch (error: unknown) {
            console.error('Failed to list batch on marketplace:', error)
            const fallback = currentLang === 'en'
                ? 'Unable to list batch on marketplace. Please try again.'
                : 'बैच को मार्केटप्लेस पर सूचीबद्ध नहीं किया जा सका। कृपया पुनः प्रयास करें।'
            const message = error instanceof Error ? error.message : fallback
            setListingError(message)
        } finally {
            setIsListing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href={dashboardBasePath} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>{currentLang === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस'}</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2">
                            <LogoutButton />
                            <LanguageToggle />
                        </div>
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

                            {isIntermediaryFlow && (
                                <div className="rounded-lg border border-dashed border-green-300 bg-green-50/60 p-4">
                                    <h3 className={`text-sm font-semibold text-green-700 mb-3 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en'
                                            ? 'Source producer details'
                                            : 'स्रोत उत्पादक विवरण'}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={`block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Producer name' : 'उत्पादक का नाम'}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.producerSourceName}
                                                onChange={(e) => setFormData({ ...formData, producerSourceName: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder={currentLang === 'en' ? 'Farmer / FPO name' : 'किसान / एफपीओ नाम'}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Producer wallet / ID' : 'उत्पादक वॉलेट / आईडी'}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.producerSourceAddress}
                                                onChange={(e) => setFormData({ ...formData, producerSourceAddress: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder={currentLang === 'en' ? '0xABC... or producer phone ID' : '0xABC... या उत्पादक फोन आईडी'}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={`block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                                {currentLang === 'en' ? 'Notes for traceability' : 'ट्रेसेबिलिटी नोट्स'}
                                            </label>
                                            <textarea
                                                value={formData.intermediaryNotes}
                                                onChange={(e) => setFormData({ ...formData, intermediaryNotes: e.target.value })}
                                                className="w-full min-h-[72px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder={currentLang === 'en' ? 'Record terms agreed with producer, storage, transport etc.' : 'उत्पादक के साथ सहमति शर्तें, भंडारण, परिवहन आदि दर्ज करें'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                    href={dashboardBasePath}
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

                        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                {qrImage ? (
                                    <Image
                                        src={qrImage}
                                        alt="Batch QR code"
                                        width={160}
                                        height={160}
                                        className="h-40 w-40 rounded-lg border border-dashed border-gray-300 bg-white p-3 object-contain"
                                    />
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400">
                                        <QrCodeIcon className="h-16 w-16" />
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className={`font-semibold ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                                        {currentLang === 'en' ? 'Batch ID:' : 'बैच ID:'}
                                    </p>
                                    <p className="mt-1 rounded border bg-white px-3 py-1 font-mono text-sm">{generatedBatchId}</p>
                                </div>
                                {qrImage && (
                                    <a
                                        href={qrImage}
                                        download={`${generatedBatchId}-qr.png`}
                                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                    >
                                        {currentLang === 'en' ? 'Download QR code' : 'QR कोड डाउनलोड करें'}
                                    </a>
                                )}
                            </div>
                            <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {currentLang === 'en' ? 'Metadata hash' : 'मेटाडेटा हैश'}
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs">{metadataHash}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {currentLang === 'en' ? 'Storage path' : 'स्टोरेज पाथ'}
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs">{metadataDocPath}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {currentLang === 'en' ? 'Blockchain status' : 'ब्लॉकचेन स्थिति'}
                                </p>
                                {onChainStatus === 'success' && (
                                    <p className="mt-2 text-sm text-green-700">
                                        {currentLang === 'en'
                                            ? `Batch recorded on-chain${producerWalletAddress ? ` via ${producerWalletAddress}` : ''}.`
                                            : `बैच ऑन-चेन दर्ज कर दिया गया है${producerWalletAddress ? ` (${producerWalletAddress} के माध्यम से)` : ''}।`}
                                    </p>
                                )}
                                {onChainStatus === 'skipped' && onChainError && (
                                    <p className="mt-2 text-sm text-amber-700">{onChainError}</p>
                                )}
                                {onChainStatus === 'failed' && onChainError && (
                                    <p className="mt-2 text-sm text-red-700">{onChainError}</p>
                                )}
                                {onChainStatus === 'idle' && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {currentLang === 'en'
                                            ? 'Blockchain status not available yet.'
                                            : 'ब्लॉकचेन स्थिति अभी उपलब्ध नहीं है।'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!listingSuccess && (
                                <button
                                    type="button"
                                    onClick={handleListOnMarketplace}
                                    disabled={isListing}
                                    className={`w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                                >
                                    {isListing
                                        ? currentLang === 'en'
                                            ? 'Listing on marketplace...'
                                            : 'मार्केटप्लेस पर सूचीबद्ध किया जा रहा है...'
                                        : currentLang === 'en'
                                            ? 'List this batch on marketplace'
                                            : 'इस बैच को मार्केटप्लेस पर सूचीबद्ध करें'}
                                </button>
                            )}

                            {listingSuccess && (
                                <div className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {currentLang === 'en'
                                        ? 'Batch listed on marketplace. You can manage it from the marketplace dashboard.'
                                        : 'बैच मार्केटप्लेस पर सूचीबद्ध कर दिया गया है। आप इसे मार्केटप्लेस डैशबोर्ड से प्रबंधित कर सकते हैं।'}
                                </div>
                            )}

                            {listingError && (
                                <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {listingError}
                                </div>
                            )}

                            <Link
                                href={dashboardBasePath}
                                className={`block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium ${currentLang === 'hi' ? 'font-hindi' : ''}`}
                            >
                                {currentLang === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएं'}
                            </Link>
                            <button
                                onClick={() => {
                                    setStep(1)
                                    setShowSuccess(false)
                                    setMetadataHash('')
                                    setMetadataDocPath('')
                                    setQrImage('')
                                    setGeneratedBatchId('')
                                    setProducerWalletAddress('')
                                    setMediaAssets([])
                                    setListingSuccess(false)
                                    setListingError(null)
                                    setIsListing(false)
                                    setOnChainStatus('idle')
                                    setOnChainError(null)
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
                                        biometricVerified: false,
                                        producerSourceName: '',
                                        producerSourceAddress: '',
                                        intermediaryNotes: ''
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