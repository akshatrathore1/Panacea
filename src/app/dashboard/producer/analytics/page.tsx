'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { ElementType, SVGProps } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  InboxStackIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/types/product'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

type Aggregates = {
  totalListedQty: number
  totalSoldQty: number
  totalListedRevenue: number
  totalSalesRevenue: number
  byCategory: Record<string, { listedQty: number; soldQty: number; salesRevenue: number }>
  byDay: Array<{ date: string; listedQty: number; soldQty: number }>
  bestCategory?: string
}

type StatTrend = {
  direction: 'up' | 'down'
  value: string
}

type IconComponent = ElementType<SVGProps<SVGSVGElement>>

const formatDateLabel = (isoDate: string, lang: 'en' | 'hi') => {
  const date = new Date(isoDate)
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    month: 'short',
    day: 'numeric'
  })
}

export default function ProducerAnalyticsPage() {
  const { i18n } = useTranslation()
  const initialLang = (i18n.language as 'en' | 'hi') || 'en'
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>(initialLang)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'hi' : 'en'
    setCurrentLang(nextLang)
    i18n.changeLanguage(nextLang)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', nextLang)
        document.documentElement.lang = nextLang
      }
    } catch { }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/marketplace/products', { method: 'GET' })
      if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`)
      }
      const payload = (await response.json()) as Product[]
      setProducts(payload)
      setLastUpdated(new Date())
      setError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load products'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const aggregates = useMemo<Aggregates>(() => {
    const byCategory: Aggregates['byCategory'] = {}
    const dayMap: Record<string, { listedQty: number; soldQty: number }> = {}

    let totalListedQty = 0
    let totalSoldQty = 0
    let totalListedRevenue = 0
    let totalSalesRevenue = 0

    for (const product of products) {
      const quantity = Number(product.quantity ?? 0)
      const price = Number(product.price ?? 0)
      const category = (product.category || 'Uncategorized').trim() || 'Uncategorized'
      const isSold = product.status === 'sold'
      const listedAt = product.createdAt ? new Date(product.createdAt) : null
      const soldAtSource = (product as unknown as { soldAt?: string | number | Date }).soldAt
      const soldAt = soldAtSource ? new Date(soldAtSource) : null

      totalListedQty += quantity
      totalListedRevenue += price * quantity

      if (!byCategory[category]) {
        byCategory[category] = { listedQty: 0, soldQty: 0, salesRevenue: 0 }
      }

      byCategory[category].listedQty += quantity

      if (isSold) {
        totalSoldQty += quantity
        totalSalesRevenue += price * quantity
        byCategory[category].soldQty += quantity
        byCategory[category].salesRevenue += price * quantity
      }

      const listedKey = listedAt ? listedAt.toISOString().slice(0, 10) : null
      if (listedKey) {
        dayMap[listedKey] ??= { listedQty: 0, soldQty: 0 }
        dayMap[listedKey].listedQty += quantity
      }

      const soldKey = soldAt ? soldAt.toISOString().slice(0, 10) : null
      if (soldKey && isSold) {
        dayMap[soldKey] ??= { listedQty: 0, soldQty: 0 }
        dayMap[soldKey].soldQty += quantity
      }
    }

    const byDay = Object.entries(dayMap)
      .map(([date, value]) => ({ date, ...value }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const bestCategory = Object.entries(byCategory)
      .sort((a, b) => b[1].salesRevenue - a[1].salesRevenue)[0]?.[0]

    return {
      totalListedQty,
      totalSoldQty,
      totalListedRevenue,
      totalSalesRevenue,
      byCategory,
      byDay,
      bestCategory
    }
  }, [products])

  const activeListings = useMemo(() => products.filter((product) => product.status !== 'sold'), [products])
  const soldListings = useMemo(() => products.filter((product) => product.status === 'sold'), [products])

  const averageListingPrice = aggregates.totalListedQty
    ? aggregates.totalListedRevenue / aggregates.totalListedQty
    : 0
  const averageSalePrice = aggregates.totalSoldQty
    ? aggregates.totalSalesRevenue / aggregates.totalSoldQty
    : 0
  const pendingQuantity = Math.max(aggregates.totalListedQty - aggregates.totalSoldQty, 0)
  const fulfilmentRate = aggregates.totalListedQty
    ? (aggregates.totalSoldQty / aggregates.totalListedQty) * 100
    : 0

  const categoriesForDisplay = useMemo(() => {
    return Object.entries(aggregates.byCategory)
      .map(([name, metrics]) => ({ name, ...metrics }))
      .sort((a, b) => b.listedQty - a.listedQty)
  }, [aggregates.byCategory])

  const recentDays = useMemo(() => {
    const days = aggregates.byDay.slice(-7)
    return days
  }, [aggregates.byDay])

  const maxDailyVolume = recentDays.length
    ? Math.max(1, ...recentDays.map((day) => Math.max(day.listedQty, day.soldQty)))
    : 1

  const priceDelta = averageSalePrice - averageListingPrice
  const priceTrend: StatTrend | undefined = aggregates.totalSoldQty
    ? {
      direction: priceDelta >= 0 ? 'up' : 'down',
      value: `${priceDelta >= 0 ? '+' : '-'}${INR.format(Math.abs(priceDelta))} ${currentLang === 'en' ? 'vs listed avg' : 'सूची औसत की तुलना'
        }`
    }
    : undefined

  const insights = useMemo(() => {
    const bestCategoryName = aggregates.bestCategory
    const bestCategoryStats = bestCategoryName ? aggregates.byCategory[bestCategoryName] : undefined

    return [
      {
        title: currentLang === 'en' ? 'Best selling category' : 'सबसे ज़्यादा बिकने वाली श्रेणी',
        description: bestCategoryName && bestCategoryStats
          ? currentLang === 'en'
            ? `${bestCategoryName} generated ${INR.format(bestCategoryStats.salesRevenue)} in sales with ${bestCategoryStats.soldQty.toLocaleString()} units sold.`
            : `${bestCategoryName} ने ${bestCategoryStats.soldQty.toLocaleString()} यूनिट बिक्री के साथ ${INR.format(bestCategoryStats.salesRevenue)} का राजस्व अर्जित किया।`
          : currentLang === 'en'
            ? 'Close a few sales to reveal your top-performing categories.'
            : 'कुछ बिक्री पूरी करें ताकि शीर्ष प्रदर्शन करने वाली श्रेणियाँ दिखाई दें।'
      },
      {
        title: currentLang === 'en' ? 'Pending inventory' : 'लंबित इन्वेंटरी',
        description: pendingQuantity > 0
          ? currentLang === 'en'
            ? `${pendingQuantity.toLocaleString()} units remain unsold. Highlight freshness or offer bundled pricing to move inventory faster.`
            : `${pendingQuantity.toLocaleString()} यूनिट अभी बिकनी बाकी हैं। ताज़गी को हाइलाइट करें या समूहीकृत कीमतों से बिक्री तेज़ करें।`
          : currentLang === 'en'
            ? 'Fantastic! Every listed batch has been sold—keep sourcing to meet demand.'
            : 'उत्कृष्ट! सूचीबद्ध सभी बैच बिक चुके हैं—मांग पूरी करने के लिए आपूर्ति जारी रखें।'
      },
      {
        title: currentLang === 'en' ? 'Average sale price' : 'औसत बिक्री मूल्य',
        description: aggregates.totalSoldQty > 0
          ? currentLang === 'en'
            ? `Sold batches average ${INR.format(averageSalePrice)} per unit compared to ${INR.format(averageListingPrice)} listed.`
            : `बिके हुए बैच का औसत मूल्य प्रति यूनिट ${INR.format(averageSalePrice)} है, जबकि सूचीबद्ध औसत ${INR.format(averageListingPrice)} था।`
          : currentLang === 'en'
            ? 'Track sale price vs listing price once orders are confirmed to spot negotiation patterns.'
            : 'आदेशों की पुष्टि होते ही बिक्री मूल्य और सूची मूल्य की तुलना करें ताकि बातचीत के रुझान दिखाई दें।'
      }
    ]
  }, [aggregates.bestCategory, aggregates.byCategory, aggregates.totalSoldQty, averageSalePrice, averageListingPrice, pendingQuantity, currentLang])

  const statCards = [
    {
      label: currentLang === 'en' ? 'Active listings' : 'सक्रिय सूचियाँ',
      value: activeListings.length.toLocaleString(),
      helper: currentLang === 'en'
        ? `${soldListings.length.toLocaleString()} batches sold`
        : `${soldListings.length.toLocaleString()} बैच बिक चुके हैं`,
      icon: Squares2X2Icon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: currentLang === 'en' ? 'Listed volume' : 'सूचीबद्ध मात्रा',
      value: aggregates.totalListedQty.toLocaleString(),
      helper: currentLang === 'en'
        ? `Sold volume ${aggregates.totalSoldQty.toLocaleString()}`
        : `बिक्री मात्रा ${aggregates.totalSoldQty.toLocaleString()}`,
      icon: InboxStackIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: currentLang === 'en' ? 'Gross sales revenue' : 'सकल बिक्री राजस्व',
      value: INR.format(aggregates.totalSalesRevenue),
      helper: currentLang === 'en'
        ? `Average sale ${INR.format(averageSalePrice || 0)} / unit`
        : `औसत बिक्री ${INR.format(averageSalePrice || 0)} / यूनिट`,
      icon: CurrencyRupeeIcon,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      trend: priceTrend
    },
    {
      label: currentLang === 'en' ? 'Fulfilment rate' : 'पूर्ति दर',
      value: `${fulfilmentRate.toFixed(1)}%`,
      helper: currentLang === 'en'
        ? `${pendingQuantity.toLocaleString()} units pending`
        : `${pendingQuantity.toLocaleString()} यूनिट लंबित`,
      icon: UsersIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard/producer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{currentLang === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस'}</span>
            </Link>
            <button
              onClick={toggleLanguage}
              data-local-language-toggle
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <GlobeAltIcon className="w-4 h-4" />
              {currentLang === 'en' ? 'हिंदी' : 'English'}
            </button>
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
                  {currentLang === 'en' ? 'Marketplace Analytics' : 'मार्केटप्लेस एनालिटिक्स'}
                </h1>
                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en'
                    ? 'Monitor listing momentum, sales velocity, and category performance to plan your next harvest.'
                    : 'लिस्टिंग की गति, बिक्री की रफ्तार और श्रेणी प्रदर्शन को ट्रैक करें ताकि अगली फसल की योजना बना सकें।'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-xs font-medium text-gray-500">
                {currentLang === 'en'
                  ? `Visible listings: ${products.length.toLocaleString()}`
                  : `दिखने वाली सूचियाँ: ${products.length.toLocaleString()}`}
                {lastUpdated
                  ? ` • ${currentLang === 'en' ? 'Updated' : 'अपडेट'} ${lastUpdated.toLocaleTimeString(currentLang === 'hi' ? 'hi-IN' : 'en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`
                  : ''}
              </span>
              <button
                onClick={fetchProducts}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="h-5 w-5" />
                {isLoading
                  ? currentLang === 'en'
                    ? 'Refreshing...'
                    : 'रिफ्रेश हो रहा है...'
                  : currentLang === 'en'
                    ? 'Refresh metrics'
                    : 'मेट्रिक्स रिफ्रेश करें'}
              </button>
            </div>
          </div>
        </section>

        {isLoading && (
          <section className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">
            {currentLang === 'en' ? 'Loading analytics…' : 'एनालिटिक्स लोड हो रहा है…'}
          </section>
        )}

        {error && !isLoading && (
          <section className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 text-sm text-red-700">
            {currentLang === 'en'
              ? `${error}. Make sure GET /api/marketplace/products is implemented.`
              : `${error}. सुनिश्चित करें कि GET /api/marketplace/products लागू किया गया है।`}
          </section>
        )}

        {!isLoading && !error && (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                    {currentLang === 'en' ? 'Category performance' : 'श्रेणी प्रदर्शन'}
                  </h2>
                </div>
                <div className="p-6 space-y-5">
                  {categoriesForDisplay.length === 0 && (
                    <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                      {currentLang === 'en'
                        ? 'No marketplace listings yet. Publish a batch to view performance.'
                        : 'अभी तक कोई लिस्टिंग नहीं है। प्रदर्शन देखने के लिए एक बैच प्रकाशित करें।'}
                    </p>
                  )}
                  {categoriesForDisplay.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className="text-xs text-gray-500">
                          {currentLang === 'en'
                            ? `${category.soldQty.toLocaleString()} sold`
                            : `${category.soldQty.toLocaleString()} बिक्री`}
                        </span>
                      </div>
                      <ProgressBar
                        label={currentLang === 'en' ? 'Listed' : 'सूचीबद्ध'}
                        value={category.listedQty}
                        max={categoriesForDisplay[0]?.listedQty || 1}
                        colorClass="bg-green-500"
                      />
                      <ProgressBar
                        label={currentLang === 'en' ? 'Sold' : 'बिक्री'}
                        value={category.soldQty}
                        max={categoriesForDisplay[0]?.listedQty || 1}
                        colorClass="bg-blue-500"
                      />
                      <div className="text-xs text-gray-500">
                        {currentLang === 'en'
                          ? `Revenue: ${INR.format(category.salesRevenue)}`
                          : `राजस्व: ${INR.format(category.salesRevenue)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                    {currentLang === 'en' ? 'Key insights' : 'मुख्य अंतर्दृष्टि'}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {insights.map((insight) => (
                    <InsightCard key={insight.title} {...insight} />
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className={`text-xl font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Daily activity' : 'दैनिक गतिविधि'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {recentDays.length === 0 && (
                  <p className={`text-sm text-gray-500 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                    {currentLang === 'en'
                      ? 'Activity will appear once listings are published or marked as sold.'
                      : 'जैसे ही सूची प्रकाशित या बेची जाती है, गतिविधि दिखाई देगी।'}
                  </p>
                )}
                {recentDays.map((day) => (
                  <div key={day.date} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{formatDateLabel(day.date, currentLang)}</span>
                      <span className="text-xs text-gray-500">
                        {currentLang === 'en'
                          ? `${(day.soldQty / (day.listedQty || 1) * 100).toFixed(0)}% fulfilment`
                          : `${(day.soldQty / (day.listedQty || 1) * 100).toFixed(0)}% पूर्ति`}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <ProgressBar
                        label={currentLang === 'en' ? 'Listed' : 'सूचीबद्ध'}
                        value={day.listedQty}
                        max={maxDailyVolume}
                        colorClass="bg-emerald-500"
                      />
                      <ProgressBar
                        label={currentLang === 'en' ? 'Sold' : 'बिक्री'}
                        value={day.soldQty}
                        max={maxDailyVolume}
                        colorClass="bg-sky-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  helper?: string
  icon: IconComponent
  iconBg: string
  iconColor: string
  trend?: StatTrend
}

function StatCard({ label, value, helper, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
          {trend && (
            <span
              className={`mt-2 inline-flex items-center gap-1 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {trend.direction === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

type ProgressBarProps = {
  label: string
  value: number
  max: number
  colorClass: string
}

function ProgressBar({ label, value, max, colorClass }: ProgressBarProps) {
  const safeMax = Math.max(max, 1)
  const width = Math.min(100, (value / safeMax) * 100)

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

type InsightCardProps = {
  title: string
  description: string
}

function InsightCard({ title, description }: InsightCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}