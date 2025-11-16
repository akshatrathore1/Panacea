'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowPathIcon,
    MapPinIcon,
    CalendarIcon,
    ScaleIcon,
    BanknotesIcon,
    StarIcon,
    UserIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    PhotoIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import { formatNumber } from '@/lib/format'

type OwnershipHistoryEntry = {
    from?: string | null
    to?: string | null
    actorRole?: string | null
    recipientRole?: string | null
    note?: string | null
    timestamp?: string | number | null
    amount?: number | string | null
    location?: string | null
    otp?: string | null
}

type DerivedTransaction = {
    id: string
    from: string
    to: string
    note: string
    timestamp: string | null
    location: string
    amount: number | null
    actorRole: string | null
    recipientRole: string | null
}

type QualityReportEntry = {
    id?: string | number | null
    type?: string | null
    inspector?: string | null
    grade?: string | null
    date?: string | null
    parameters?: Record<string, unknown> | null
}

type MediaEntry = {
    url?: string
    name?: string | null
    contentType?: string | null
    hash?: string | null
}

type BatchMetadata = {
    cropType?: string
    variety?: string
    quantityKg?: number | string
    weight?: number | string
    qualityGrade?: string
    pricePerKg?: number | string
    origin?: string
    createdBy?: {
        name?: string | null
        phone?: string | null
    } | null
    sowingDate?: string | null
    harvestDate?: string | null
    createdAt?: string | null
    currentOwnerAddress?: string
    ownershipHistory?: OwnershipHistoryEntry[]
    media?: MediaEntry[]
    qualityReports?: QualityReportEntry[]
    metadataHash?: string
    workflowActor?: string
}

interface BatchViewModel {
    batchId: string
    cropType: string
    variety: string
    weight: number | string
    qualityGrade: string
    pricePerKg: number | null
    farmLocation: string
    farmerName: string
    farmerPhone: string
    sowingDate: string | null
    harvestDate: string | null
    createdAt: string | null
    currentOwner: string
    transactions: DerivedTransaction[]
    qualityReports: QualityReportEntry[]
    images: string[]
    metadataHash: string | null
    computedHash: string | null
    metadataValid: boolean
    mediaEntries: MediaEntry[]
    onChainHistory: TraceApiResponse['onChainHistory']
}

interface TraceApiResponse {
    batchId: string
    metadata: BatchMetadata | null
    metadataHash: string | null
    metadataCanonical: string | null
    computedHash: string | null
    metadataValid: boolean
    onChainBatch: {
        batchId?: string
        productType?: string
        currentOwner?: string
        origin?: string
        harvestDate?: string | null
        createdAt?: string | null
        additionalInfo?: string | null
    } | null
    onChainHistory: Array<{
        from: string
        to: string
        timestamp: string | null
        additionalInfo: string | null
    }>
}

export default function TracePage() {
    const params = useParams()
    const { language: currentLang } = useLanguage()
    const lang = currentLang
    const [isLoading, setIsLoading] = useState(true)
    const [batchData, setBatchData] = useState<BatchViewModel | null>(null)
    const [traceDetails, setTraceDetails] = useState<TraceApiResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const batchId = params.batchId as string
    const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'

    const formatDateTime = (value: string | null) => {
        if (!value) return '—'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date)
    }

    const formatQuantity = (value: number | string) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return `${formatNumber(value, locale)} kg`
        }
        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value)
            if (!Number.isNaN(parsed)) {
                return `${formatNumber(parsed, locale)} kg`
            }
            return value
        }
        return '—'
    }

    const formatCurrency = (value: number | null) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return null
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(value)
    }

    const formatOnChainTimestamp = (value: string | null) => {
        if (!value) return '—'
        const numeric = Number(value)
        if (!Number.isNaN(numeric) && numeric > 0) {
            const millis = numeric < 1e12 ? numeric * 1000 : numeric
            const candidate = new Date(millis)
            if (!Number.isNaN(candidate.getTime())) {
                return formatDateTime(candidate.toISOString())
            }
        }
        return formatDateTime(value)
    }

    const formatOwner = (value: string) => {
        if (!value || value === '—') return '—'
        if (value.startsWith('0x') && value.length > 10) {
            return `${value.slice(0, 6)}…${value.slice(-4)}`
        }
        return value
    }

    const resolveTransactionLabel = (note: string) => {
        switch (note) {
            case 'batch_created':
            case 'batch_created_by_producer':
                return lang === 'en' ? 'Batch created' : 'बैच बनाया गया'
            case 'ownership_transfer':
            case 'transfer_to_intermediary':
            case 'transfer_to_distributor':
                return lang === 'en' ? 'Ownership transfer' : 'स्वामित्व स्थानांतरण'
            case 'batch_listed':
                return lang === 'en' ? 'Marketplace listing' : 'मार्केटप्लेस सूची'
            case 'batch_sold':
                return lang === 'en' ? 'Batch sold' : 'बैच बेचा गया'
            default:
                return note || (lang === 'en' ? 'Event' : 'घटना')
        }
    }

    useEffect(() => {
        if (!batchId) return

        let cancelled = false

        const fetchBatchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const resp = await fetch(`/api/batches/${encodeURIComponent(batchId)}`, { cache: 'no-store' })
                if (!resp.ok) {
                    const message = await resp.json().catch(() => ({ error: 'Unable to load batch data' }))
                    throw new Error(message.error || 'Unable to load batch data')
                }

                const payload = (await resp.json()) as TraceApiResponse
                if (cancelled) return

                setTraceDetails(payload)

                const metadata: BatchMetadata = payload.metadata ?? {}

                const ownershipHistoryRaw: OwnershipHistoryEntry[] = Array.isArray(metadata.ownershipHistory)
                    ? metadata.ownershipHistory
                    : []

                const derivedTransactions: DerivedTransaction[] = ownershipHistoryRaw.map((entry, index) => {
                    const timestampValue = entry?.timestamp
                    let timestamp: string | null = null
                    if (typeof timestampValue === 'number') {
                        const date = new Date(timestampValue)
                        timestamp = Number.isNaN(date.getTime()) ? String(timestampValue) : date.toISOString()
                    } else if (typeof timestampValue === 'string' && timestampValue.trim().length > 0) {
                        timestamp = timestampValue
                    }

                    const amountCandidate =
                        typeof entry?.amount === 'number'
                            ? entry.amount
                            : typeof entry?.amount === 'string'
                                ? Number(entry.amount)
                                : null
                    const normalizedAmount =
                        typeof amountCandidate === 'number' && Number.isFinite(amountCandidate)
                            ? amountCandidate
                            : null

                    const idSource =
                        typeof timestampValue === 'string' && timestampValue.trim().length > 0
                            ? timestampValue
                            : typeof timestampValue === 'number'
                                ? String(timestampValue)
                                : String(index)

                    return {
                        id: idSource,
                        from: entry?.from ?? '—',
                        to: entry?.to ?? '—',
                        note: entry?.note ?? (index === 0 ? 'batch_created' : 'ownership_transfer'),
                        timestamp,
                        location: entry?.location ?? metadata.origin ?? '—',
                        amount: normalizedAmount,
                        actorRole: entry?.actorRole ?? null,
                        recipientRole: entry?.recipientRole ?? null
                    }
                })

                const mediaEntries: MediaEntry[] = Array.isArray(metadata.media)
                    ? metadata.media.filter((media) => media && typeof media === 'object')
                    : []

                const derivedImages = mediaEntries
                    .map((media) => media?.url)
                    .filter((url): url is string => typeof url === 'string' && url.length > 0)

                const qualityReports: QualityReportEntry[] = Array.isArray(metadata.qualityReports)
                    ? metadata.qualityReports.filter((report) => report && typeof report === 'object')
                    : []

                const weightCandidate =
                    typeof metadata.quantityKg === 'number'
                        ? metadata.quantityKg
                        : typeof metadata.quantityKg === 'string'
                            ? Number(metadata.quantityKg)
                            : typeof metadata.weight === 'number'
                                ? metadata.weight
                                : typeof metadata.weight === 'string'
                                    ? Number(metadata.weight)
                                    : null

                const normalizedWeight =
                    typeof weightCandidate === 'number' && Number.isFinite(weightCandidate)
                        ? weightCandidate
                        : '—'

                const priceCandidate =
                    typeof metadata.pricePerKg === 'number'
                        ? metadata.pricePerKg
                        : typeof metadata.pricePerKg === 'string'
                            ? Number(metadata.pricePerKg)
                            : null

                const normalizedPrice =
                    typeof priceCandidate === 'number' && Number.isFinite(priceCandidate)
                        ? priceCandidate
                        : null

                setBatchData({
                    batchId: payload.batchId || batchId,
                    cropType: metadata.cropType ?? '—',
                    variety: metadata.variety ?? '—',
                    weight: normalizedWeight,
                    qualityGrade: metadata.qualityGrade ?? '—',
                    pricePerKg: normalizedPrice,
                    farmLocation: metadata.origin ?? '—',
                    farmerName: metadata.createdBy?.name ?? '—',
                    farmerPhone: metadata.createdBy?.phone ?? '—',
                    sowingDate: metadata.sowingDate ?? null,
                    harvestDate: metadata.harvestDate ?? null,
                    createdAt: metadata.createdAt ?? null,
                    currentOwner: metadata.currentOwnerAddress ?? payload.onChainBatch?.currentOwner ?? '—',
                    transactions: derivedTransactions,
                    qualityReports,
                    images: derivedImages,
                    metadataHash: payload.metadataHash ?? null,
                    computedHash: payload.computedHash ?? null,
                    metadataValid: !!payload.metadataValid,
                    mediaEntries,
                    onChainHistory: Array.isArray(payload.onChainHistory) ? payload.onChainHistory : []
                })
            } catch (err) {
                if (cancelled) return
                setError(err instanceof Error ? err.message : 'Failed to load batch data')
                setBatchData(null)
                setTraceDetails(null)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchBatchData().catch(console.error)
        return () => {
            cancelled = true
        }
    }, [batchId])

    const onChainAdditional = useMemo(() => {
        if (!traceDetails?.onChainBatch?.additionalInfo) return null
        const info = traceDetails.onChainBatch.additionalInfo
        if (typeof info !== 'string') return info
        try {
            return JSON.parse(info)
        } catch {
            return info
        }
    }, [traceDetails])

    const canonicalPretty = useMemo(() => {
        if (!traceDetails?.metadataCanonical) return null
        try {
            return JSON.stringify(JSON.parse(traceDetails.metadataCanonical), null, 2)
        } catch {
            return null
        }
    }, [traceDetails])

    const getTransactionIcon = (note: string) => {
        switch (note) {
            case 'batch_created':
            case 'batch_created_by_producer':
                return CheckCircleIcon
            case 'ownership_transfer':
            case 'ownership_transfer_completed':
            case 'transfer_to_intermediary':
            case 'transfer_to_distributor':
                return TruckIcon
            case 'batch_listed':
            case 'batch_sold':
                return BuildingStorefrontIcon
            case 'quality_check':
                return StarIcon
            default:
                return ArrowPathIcon
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <p className={`text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en' ? 'Loading batch information...' : 'बैच जानकारी लोड हो रही है...'}
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
                    <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en' ? 'Batch Not Found' : 'बैच नहीं मिला'}
                    </h1>
                    <p className={`text-gray-600 mb-6 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en'
                            ? 'The batch ID you scanned does not exist in our system.'
                            : 'आपके द्वारा स्कैन किया गया बैच ID हमारे सिस्टम में मौजूद नहीं है।'}
                    </p>
                    {error && (
                        <p className="text-sm text-red-600 mb-4">
                            {error}
                        </p>
                    )}
                    <Link
                        href="/"
                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg ${lang === 'hi' ? 'font-hindi' : ''}`}
                    >
                        {lang === 'en' ? 'Go to Homepage' : 'होमपेज पर जाएं'}
                    </Link>
                </div>
            </div>
        )
    }

    const HeroStatusIcon = batchData.metadataValid ? CheckCircleIcon : ExclamationTriangleIcon
    const heroStatusText = batchData.metadataValid
        ? lang === 'en'
            ? 'Metadata hash verified'
            : 'मेटाडेटा हैश सत्यापित'
        : lang === 'en'
            ? 'Verification pending'
            : 'सत्यापन लंबित'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl">🌾</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {lang === 'en' ? 'KrashiAalok' : 'कृषिआलोक'}
                            </span>
                        </Link>

                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-8 mb-8">
                    <div className="flex items-center mb-4">
                        <HeroStatusIcon
                            className={`w-8 h-8 mr-3 ${batchData.metadataValid ? 'text-green-200' : 'text-amber-200'}`}
                        />
                        <span className={`text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>{heroStatusText}</span>
                    </div>
                    <h1 className={`text-4xl font-bold mb-2 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en' ? 'Product Journey' : 'उत्पाद की यात्रा'}
                    </h1>
                    <p className={`text-green-100 text-lg ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en' ? 'From Farm to Your Table' : 'खेत से आपकी मेज तक'}
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
                                <h2 className={`text-xl font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-2" />
                                    {lang === 'en' ? 'Product Details' : 'उत्पाद विवरण'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Crop Type' : 'फसल का प्रकार'}
                                            </label>
                                            <p className="font-semibold text-lg">{batchData.cropType}</p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Variety' : 'किस्म'}
                                            </label>
                                            <p className="font-semibold">{batchData.variety}</p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Weight' : 'वजन'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <ScaleIcon className="w-4 h-4 mr-1" />
                                                {formatQuantity(batchData.weight)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Quality Grade' : 'गुणवत्ता श्रेणी'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                                                Grade {batchData.qualityGrade}
                                            </p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Farm Location' : 'खेत का स्थान'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {batchData.farmLocation}
                                            </p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Price per kg' : 'प्रति किलोग्राम मूल्य'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <BanknotesIcon className="w-4 h-4 mr-1" />
                                                {formatCurrency(batchData.pricePerKg) || '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                {lang === 'en' ? 'Harvest Date' : 'कटाई की तारीख'}
                                            </label>
                                            <p className="font-semibold flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                {formatDateTime(batchData.harvestDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Journey */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className={`text-xl font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <ArrowPathIcon className="w-6 h-6 text-green-600 mr-2" />
                                    {lang === 'en' ? 'Supply Chain Journey' : 'आपूर्ति श्रृंखला यात्रा'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {batchData.transactions.length === 0 && (
                                        <p className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                            {lang === 'en'
                                                ? 'No ownership changes have been recorded yet.'
                                                : 'अभी तक कोई स्वामित्व परिवर्तन रिकॉर्ड नहीं किया गया है।'}
                                        </p>
                                    )}
                                    {batchData.transactions.map((transaction, index) => {
                                        const IconComponent = getTransactionIcon(transaction.note)
                                        const amountLabel = formatCurrency(transaction.amount)
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
                                                            <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                                {resolveTransactionLabel(transaction.note)}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {transaction.from} → {transaction.to}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {transaction.location && transaction.location !== '—'
                                                                    ? `${transaction.location} • `
                                                                    : ''}
                                                                {formatDateTime(transaction.timestamp)}
                                                            </p>
                                                            {(transaction.actorRole || transaction.recipientRole) && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {lang === 'en' ? 'Roles:' : 'भूमिकाएँ:'}{' '}
                                                                    {transaction.actorRole ?? '—'} → {transaction.recipientRole ?? '—'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {amountLabel && (
                                                            <div className="text-right">
                                                                <p className="font-semibold text-green-600">
                                                                    {amountLabel}
                                                                </p>
                                                            </div>
                                                        )}
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
                                <h2 className={`text-xl font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <StarIcon className="w-6 h-6 text-purple-600 mr-2" />
                                    {lang === 'en' ? 'Quality Reports' : 'गुणवत्ता रिपोर्ट'}
                                </h2>
                            </div>
                            <div className="p-6">
                                {batchData.qualityReports.length === 0 ? (
                                    <p className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                        {lang === 'en'
                                            ? 'No quality inspections have been uploaded yet.'
                                            : 'अभी तक कोई गुणवत्ता निरीक्षण अपलोड नहीं किया गया है।'}
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {batchData.qualityReports.map((report, index) => {
                                            const entriesSource =
                                                report?.parameters && typeof report.parameters === 'object'
                                                    ? Object.entries(report.parameters as Record<string, unknown>)
                                                    : []
                                            return (
                                                <div key={report.id ?? index} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                                                {report.type || (lang === 'en' ? 'Quality check' : 'गुणवत्ता जांच')}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {lang === 'en' ? 'Inspector:' : 'निरीक्षक:'}{' '}
                                                                {report.inspector || '—'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDateTime(report.date ?? null)}
                                                            </p>
                                                        </div>
                                                        {report.grade && (
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                                                {lang === 'en' ? 'Grade' : 'ग्रेड'} {report.grade}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entriesSource.length === 0 ? (
                                                        <p className="text-sm text-gray-500">
                                                            {lang === 'en'
                                                                ? 'No parameters were provided with this report.'
                                                                : 'इस रिपोर्ट के साथ कोई पैरामीटर प्रदान नहीं किए गए।'}
                                                        </p>
                                                    ) : (
                                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                            {entriesSource.map(([key, value]) => {
                                                                const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()
                                                                let valueLabel: string
                                                                if (typeof value === 'number') {
                                                                    valueLabel = formatNumber(value, locale)
                                                                } else if (typeof value === 'boolean') {
                                                                    valueLabel = value ? (lang === 'en' ? 'Yes' : 'हाँ') : (lang === 'en' ? 'No' : 'नहीं')
                                                                } else if (value === null || value === undefined) {
                                                                    valueLabel = '—'
                                                                } else {
                                                                    valueLabel = String(value)
                                                                }
                                                                return (
                                                                    <div key={key} className="flex justify-between">
                                                                        <span className="text-gray-600 capitalize">{label}:</span>
                                                                        <span className="font-medium text-right">{valueLabel}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Farmer Information */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <UserIcon className="w-5 h-5 text-green-600 mr-2" />
                                    {lang === 'en' ? 'Farmer Information' : 'किसान की जानकारी'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserIcon className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-1">{batchData.farmerName}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{batchData.farmLocation || '—'}</p>
                                    <p className="text-sm text-gray-500">{batchData.farmerPhone || '—'}</p>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {lang === 'en' ? 'Sowing Date:' : 'बुआई की तारीख:'}
                                        </span>
                                        <span className="font-medium">{formatDateTime(batchData.sowingDate)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {lang === 'en' ? 'Harvest Date:' : 'कटाई की तारीख:'}
                                        </span>
                                        <span className="font-medium">{formatDateTime(batchData.harvestDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    {lang === 'en' ? 'Current Status' : 'वर्तमान स्थिति'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center">
                                    <BuildingStorefrontIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-semibold mb-1" title={batchData.currentOwner}>
                                        {formatOwner(batchData.currentOwner)}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {lang === 'en' ? 'Current Owner' : 'वर्तमान स्वामी'}
                                    </p>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className={`text-sm text-green-800 font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                            {lang === 'en'
                                                ? 'Traceable via KrashiAalok ledger'
                                                : 'कृषिआलोक लेजर के माध्यम से ट्रेसेबल'}
                                        </p>
                                    </div>
                                    {traceDetails?.metadata?.workflowActor && (
                                        <p className="mt-3 text-xs text-gray-500">
                                            {lang === 'en' ? 'Declared role:' : 'घोषित भूमिका:'} {traceDetails?.metadata?.workflowActor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <PhotoIcon className="w-5 h-5 text-purple-600 mr-2" />
                                    {lang === 'en' ? 'Product Images' : 'उत्पाद चित्र'}
                                </h3>
                            </div>
                            <div className="p-6">
                                {batchData.images.length === 0 ? (
                                    <p className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                        {lang === 'en'
                                            ? 'No supporting media has been uploaded yet.'
                                            : 'अभी तक कोई सहायक मीडिया अपलोड नहीं किया गया है।'}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {batchData.images.map((image, index) => {
                                            const mediaMeta = batchData.mediaEntries.find((entry) => entry.url === image)
                                            return (
                                                <figure key={image || index} className="space-y-2">
                                                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-gray-100">
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                                                            <PhotoIcon className="w-10 h-10" />
                                                        </div>
                                                        <Image
                                                            src={image}
                                                            alt={mediaMeta?.name || `Batch media ${index + 1}`}
                                                            fill
                                                            sizes="(min-width: 1024px) 33vw, 100vw"
                                                            className="absolute inset-0 h-full w-full object-cover z-10"
                                                            unoptimized
                                                            onError={(event) => {
                                                                event.currentTarget.classList.add('hidden')
                                                            }}
                                                        />
                                                    </div>
                                                    {(mediaMeta?.name || mediaMeta?.contentType) && (
                                                        <figcaption className="text-xs text-gray-500 truncate">
                                                            {mediaMeta?.name || mediaMeta?.contentType}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Integrity Proofs */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <ShieldCheckIcon
                                        className={`w-5 h-5 mr-2 ${batchData.metadataValid ? 'text-green-600' : 'text-amber-600'}`}
                                    />
                                    {lang === 'en' ? 'Integrity Proofs' : 'अखंडता प्रमाण'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    {batchData.metadataValid ? (
                                        <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {batchData.metadataValid
                                                ? lang === 'en'
                                                    ? 'Metadata hash verified'
                                                    : 'मेटाडेटा हैश सत्यापित'
                                                : lang === 'en'
                                                    ? 'Hash mismatch detected'
                                                    : 'हैश मेल नहीं खाता'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {lang === 'en'
                                                ? 'Off-chain document hash compared with the canonical JSON snapshot.'
                                                : 'ऑफ-चेन दस्तावेज़ हैश को कैनोनिकल JSON स्नैपशॉट से मिलाया गया।'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-xs text-gray-600">
                                    <div>
                                        <span className="uppercase text-[11px] tracking-wide text-gray-500">
                                            {lang === 'en' ? 'Stored hash' : 'संग्रहीत हैश'}
                                        </span>
                                        <p className="font-mono break-all bg-gray-50 border border-gray-200 rounded-lg p-2">
                                            {batchData.metadataHash ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="uppercase text-[11px] tracking-wide text-gray-500">
                                            {lang === 'en' ? 'Recomputed hash' : 'पुनर्गणित हैश'}
                                        </span>
                                        <p className="font-mono break-all bg-gray-50 border border-gray-200 rounded-lg p-2">
                                            {batchData.computedHash ?? '—'}
                                        </p>
                                    </div>
                                </div>
                                {traceDetails?.metadataCanonical && (
                                    <details className="rounded-lg border border-gray-200 p-3 text-sm">
                                        <summary className="cursor-pointer font-medium">
                                            {lang === 'en' ? 'View canonical JSON' : 'कैनोनिकल JSON देखें'}
                                        </summary>
                                        <div className="mt-3 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {lang === 'en'
                                                        ? 'Exact string hashed on-chain'
                                                        : 'ऑन-चेन हैश की गई सटीक स्ट्रिंग'}
                                                </p>
                                                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-all font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {traceDetails.metadataCanonical}
                                                </pre>
                                            </div>
                                            {canonicalPretty && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {lang === 'en'
                                                            ? 'Readable view (not used for hashing)'
                                                            : 'पठनीय दृश्य (हैशिंग के लिए उपयोग नहीं)'}
                                                    </p>
                                                    <pre className="max-h-48 overflow-y-auto whitespace-pre font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        {canonicalPretty}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>

                        {/* On-chain Snapshot */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className={`font-semibold flex items-center ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                    <GlobeAltIcon className="w-5 h-5 text-blue-600 mr-2" />
                                    {lang === 'en' ? 'On-chain Snapshot' : 'ऑन-चेन स्नैपशॉट'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4 text-sm text-gray-700">
                                {traceDetails?.onChainBatch ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {lang === 'en' ? 'Product type' : 'उत्पाद प्रकार'}
                                            </span>
                                            <span className="font-medium">
                                                {traceDetails.onChainBatch.productType || '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {lang === 'en' ? 'Current owner' : 'वर्तमान स्वामी'}
                                            </span>
                                            <span className="font-medium" title={traceDetails.onChainBatch.currentOwner || undefined}>
                                                {formatOwner(traceDetails.onChainBatch.currentOwner ?? '—')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {lang === 'en' ? 'Origin' : 'उत्पत्ति'}
                                            </span>
                                            <span className="font-medium">
                                                {traceDetails.onChainBatch.origin || '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {lang === 'en' ? 'Harvest date' : 'कटाई दिनांक'}
                                            </span>
                                            <span className="font-medium">
                                                {formatOnChainTimestamp(traceDetails.onChainBatch.harvestDate ?? null)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {lang === 'en' ? 'Registered at' : 'पंजीकृत दिनांक'}
                                            </span>
                                            <span className="font-medium">
                                                {formatOnChainTimestamp(traceDetails.onChainBatch.createdAt ?? null)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                                        {lang === 'en'
                                            ? 'No on-chain record was found for this batch. Ensure the contract configuration is set.'
                                            : 'इस बैच के लिए कोई ऑन-चेन रिकॉर्ड नहीं मिला। सुनिश्चित करें कि कॉन्ट्रैक्ट कॉन्फ़िगरेशन सेट है।'}
                                    </p>
                                )}

                                {Array.isArray(traceDetails?.onChainHistory) && traceDetails.onChainHistory.length > 0 && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                            {lang === 'en' ? 'Recent ledger events' : 'हाल की लेजर घटनाएँ'}
                                        </h4>
                                        <ul className="space-y-2 text-xs text-gray-600">
                                            {traceDetails.onChainHistory.slice(-3).reverse().map((event, index) => {
                                                const infoLabel = (() => {
                                                    if (!event?.additionalInfo) return null
                                                    if (typeof event.additionalInfo === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(event.additionalInfo)
                                                            return JSON.stringify(parsed)
                                                        } catch {
                                                            return event.additionalInfo
                                                        }
                                                    }
                                                    return JSON.stringify(event.additionalInfo)
                                                })()
                                                const infoPreview =
                                                    typeof infoLabel === 'string' && infoLabel.length > 160
                                                        ? `${infoLabel.slice(0, 157)}…`
                                                        : infoLabel
                                                return (
                                                    <li key={`${event?.timestamp ?? index}`} className="border border-gray-200 rounded-lg p-2">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">
                                                                {formatOwner(event?.from ?? '—')} → {formatOwner(event?.to ?? '—')}
                                                            </span>
                                                            <span className="text-gray-500">
                                                                {formatOnChainTimestamp(event?.timestamp != null ? String(event.timestamp) : null)}
                                                            </span>
                                                        </div>
                                                        {infoPreview && (
                                                            <p className="mt-1 text-[11px] leading-relaxed break-all text-gray-500">
                                                                {infoPreview}
                                                            </p>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {onChainAdditional && (
                                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 border border-gray-200">
                                        <span className="font-semibold block mb-2">
                                            {lang === 'en' ? 'Additional info' : 'अतिरिक्त जानकारी'}
                                        </span>
                                        <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                                            {typeof onChainAdditional === 'string'
                                                ? onChainAdditional
                                                : JSON.stringify(onChainAdditional, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 text-center space-y-4">
                    <Link
                        href="/"
                        className={`inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}
                    >
                        {lang === 'en' ? 'Explore More Products' : 'और उत्पाद देखें'}
                    </Link>
                    <p className={`text-sm text-gray-600 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                        {lang === 'en'
                            ? 'Powered by KrashiAalok Blockchain Technology'
                            : 'कृषिआलोक ब्लॉकचेन तकनीक द्वारा संचालित'}
                    </p>
                </div>
            </div>
        </div>
    )
}