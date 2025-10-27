'use client'

import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { RefreshCcw } from 'lucide-react'
import type { Product } from '@/types/product'
import { useTranslation } from 'react-i18next'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

type Aggregates = {
  totalListedQty: number
  totalSoldQty: number
  totalListedRevenue: number // price * qty for all listed (potential)
  totalSalesRevenue: number  // price * qty for sold (gross)
  byCategory: Record<string, { listedQty: number; soldQty: number; salesRevenue: number }>
  byDay: Array<{ date: string; listedQty: number; soldQty: number }>
  bestCategory?: string
}

export default function ProducerAnalyticsPage() {
  const { i18n } = useTranslation()
  const lang = (i18n.language as 'en' | 'hi') || 'en'
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/marketplace/products', { method: 'GET' })
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
      const data = (await res.json()) as Product[]
      setProducts(data)
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const agg = useMemo<Aggregates>(() => {
    const byCategory: Aggregates['byCategory'] = {}
    const dayMap: Record<string, { listedQty: number; soldQty: number }> = {
      // date -> qty
    }

    let totalListedQty = 0
    let totalSoldQty = 0
    let totalListedRevenue = 0
    let totalSalesRevenue = 0

    for (const p of products) {
      const qty = Number(p.quantity || 0)
      const price = Number(p.price || 0)
      const category = (p.category || 'Uncategorized').trim() || 'Uncategorized'
      const isSold = p.status === 'sold'
      const listedAt = p.createdAt ? new Date(p.createdAt) : null
      // soldAt not in type; fallback to createdAt if missing
      const soldAt = (p as any)?.soldAt ? new Date((p as any).soldAt) : null

      totalListedQty += qty
      totalListedRevenue += price * qty

      if (!byCategory[category]) {
        byCategory[category] = { listedQty: 0, soldQty: 0, salesRevenue: 0 }
      }
      byCategory[category].listedQty += qty

      if (isSold) {
        totalSoldQty += qty
        totalSalesRevenue += price * qty
        byCategory[category].soldQty += qty
        byCategory[category].salesRevenue += price * qty
      }

      const listedKey = listedAt ? listedAt.toISOString().slice(0, 10) : null
      if (listedKey) {
        dayMap[listedKey] ??= { listedQty: 0, soldQty: 0 }
        dayMap[listedKey].listedQty += qty
      }
      const soldKey = soldAt ? soldAt.toISOString().slice(0, 10) : null
      if (soldKey && isSold) {
        dayMap[soldKey] ??= { listedQty: 0, soldQty: 0 }
        dayMap[soldKey].soldQty += qty
      }
    }

    const byDay = Object.entries(dayMap)
      .map(([date, v]) => ({ date, ...v }))
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
      bestCategory,
    }
  }, [products])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={lang === 'en' ? 'Analytics' : 'एनालिटिक्स'}
        backHref="/dashboard/producer"
        actions={
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCcw className="h-4 w-4" /> {lang === 'en' ? 'Refresh' : 'रीफ़्रेश'}
          </button>
        }
      />

      {isLoading && (
        <div className="p-4 bg-white shadow rounded">
          {lang === 'en' ? 'Loading analytics…' : 'एनालिटिक्स लोड हो रहा है…'}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 shadow rounded">
          {error}. {lang === 'en' ? 'Make sure GET /api/marketplace/products is implemented.' : 'सुनिश्चित करें कि GET /api/marketplace/products लागू है।'}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPI
              title={lang === 'en' ? 'Total Listed (Qty)' : 'कुल सूचीबद्ध (मात्रा)'}
              value={agg.totalListedQty.toLocaleString()}
            />
            <KPI
              title={lang === 'en' ? 'Total Sold (Qty)' : 'कुल बिक्री (मात्रा)'}
              value={agg.totalSoldQty.toLocaleString()}
            />
            <KPI
              title={lang === 'en' ? 'Potential Revenue' : 'संभावित राजस्व'}
              value={INR.format(agg.totalListedRevenue)}
            />
            <KPI
              title={lang === 'en' ? 'Gross Sales Revenue' : 'सकल बिक्री राजस्व'}
              value={INR.format(agg.totalSalesRevenue)}
            />
          </div>

          {/* Category breakdown */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-3 {lang === 'hi' ? 'font-hindi' : ''}">{lang === 'en' ? 'By Category' : 'श्रेणी के अनुसार'}</h2>
            <div className="space-y-2">
              {Object.keys(agg.byCategory).length === 0 && (
                <div className="text-gray-500 text-sm">{lang === 'en' ? 'No data yet.' : 'अभी कोई डेटा नहीं।'}</div>
              )}
              {Object.entries(agg.byCategory).map(([cat, v]) => (
                <div key={cat} className="flex items-center justify-between border-b last:border-b-0 py-2">
                  <div className="font-medium">{cat}</div>
                  <div className="text-sm text-gray-600">
                    {lang === 'en' ? 'Listed' : 'सूचीबद्ध'}: {v.listedQty.toLocaleString()} • {lang === 'en' ? 'Sold' : 'बिक्री'}: {v.soldQty.toLocaleString()} • {lang === 'en' ? 'Revenue' : 'राजस्व'}: {INR.format(v.salesRevenue)}
                  </div>
                </div>
              ))}
              {agg.bestCategory && (
                <div className="mt-2 text-sm text-green-700">
                  {lang === 'en' ? 'Best performing category' : 'सबसे बेहतर श्रेणी'}: <span className="font-medium">{agg.bestCategory}</span>
                </div>
              )}
            </div>
          </section>

          {/* Sales/listings over time */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-3">{lang === 'en' ? 'Over Time' : 'समय के साथ'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{lang === 'en' ? 'Listed Qty per Day' : 'प्रति दिन सूचीबद्ध मात्रा'}</h3>
                <MiniBars data={agg.byDay.map(d => ({ label: d.date, value: d.listedQty }))} />
              </div>
              <div>
                <h3 className="font-medium mb-2">{lang === 'en' ? 'Sold Qty per Day' : 'प्रति दिन बिक्री मात्रा'}</h3>
                <MiniBars data={agg.byDay.map(d => ({ label: d.date, value: d.soldQty }))} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {lang === 'en'
                ? "Note: Sold quantities depend on product.status === 'sold'. If you do not record sales yet, this will appear as zero."
                : "नोट: बेची गई मात्रा product.status === 'sold' पर निर्भर करती है। यदि आपने अभी तक बिक्री दर्ज नहीं की है, तो यह शून्य के रूप में दिखाई देगा।"}
            </p>
          </section>
        </div>
      )}
    </div>
  )
}

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function MiniBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="space-y-2">
      {data.length === 0 && <div className="text-gray-500 text-sm">No data.</div>}
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <div className="w-28 text-xs text-gray-600">{d.label}</div>
          <div className="flex-1 h-3 bg-gray-100 rounded">
            <div
              className="h-3 bg-green-600 rounded"
              style={{ width: `${(d.value / max) * 100}%` }}
              title={`${d.value}`}
            />
          </div>
          <div className="w-10 text-right text-xs">{d.value}</div>
        </div>
      ))}
    </div>
  )
}