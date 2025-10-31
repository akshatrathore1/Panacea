'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftIcon,
  CubeIcon,
  GlobeAltIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export type OwnerType = 'Farmer' | 'Distributor' | 'Retailer' | 'Consumer' | 'Government';

export interface InventoryItem {
  id: string;
  productName: string;
  ownerType: OwnerType;
  ownerName: string;
  quantity: number;
  unit: string;
  location?: string;
  lastUpdated: string; // ISO date
  status?: 'Available' | 'Reserved' | 'Sold' | 'Damaged';
}

const initialData: InventoryItem[] = [
  {
    id: 'inv-001',
    productName: 'Organic Tomatoes',
    ownerType: 'Farmer',
    ownerName: "John's Farm",
    quantity: 120,
    unit: 'kg',
    location: 'Lot 12',
    lastUpdated: new Date().toISOString(),
    status: 'Available',
  },
  {
    id: 'inv-002',
    productName: 'Fresh Milk',
    ownerType: 'Distributor',
    ownerName: 'Dairy Distributors Ltd.',
    quantity: 200,
    unit: 'liters',
    location: 'Warehouse A',
    lastUpdated: new Date().toISOString(),
    status: 'Available',
  },
  {
    id: 'inv-003',
    productName: 'Corn (sacks)',
    ownerType: 'Retailer',
    ownerName: 'Green Grocer',
    quantity: 30,
    unit: 'sacks',
    location: 'Store #3',
    lastUpdated: new Date().toISOString(),
    status: 'Reserved',
  },
]

export default function InventoryPage() {
  const { i18n } = useTranslation()
  const initialLang = (i18n.language as 'en' | 'hi') || 'en'
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>(initialLang)
  const [items, setItems] = useState<InventoryItem[]>(initialData)
  const [query, setQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<OwnerType | 'All'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    productName: '',
    ownerType: 'Farmer',
    ownerName: '',
    quantity: 0,
    unit: ''
  })

  const filtered = useMemo(() => {
    const qLower = query.trim().toLowerCase()
    return items.filter((it) => {
      if (ownerFilter !== 'All' && it.ownerType !== ownerFilter) return false
      if (!qLower) return true
      return (
        it.productName.toLowerCase().includes(qLower) ||
        it.ownerName.toLowerCase().includes(qLower) ||
        (it.location || '').toLowerCase().includes(qLower)
      )
    })
  }, [items, query, ownerFilter])

  const addItem = () => {
    if (!newItem.productName || !newItem.ownerName || !newItem.unit) return
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      productName: newItem.productName!,
      ownerType: (newItem.ownerType || 'Farmer') as OwnerType,
      ownerName: newItem.ownerName!,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit!,
      location: newItem.location,
      lastUpdated: new Date().toISOString(),
      status: 'Available'
    }
    setItems((s) => [item, ...s])
    setShowAdd(false)
    setNewItem({
      productName: '',
      ownerType: 'Farmer',
      ownerName: '',
      quantity: 0,
      unit: ''
    })
  }

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en'
    setCurrentLang(newLang)
    i18n.changeLanguage(newLang)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLang)
        document.documentElement.lang = newLang
      }
    } catch { }
  }

  const exportCSV = () => {
    const headers: Array<keyof InventoryItem> = [
      'id',
      'productName',
      'ownerType',
      'ownerName',
      'quantity',
      'unit',
      'location',
      'lastUpdated',
      'status'
    ]
    const rows = items.map((item) =>
      headers.map((header) => `"${String(item[header] ?? '')}"`).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'My Inventory' : 'मेरी सूची'}
                </h1>
                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en'
                    ? 'Review every registered batch, update stock levels, and keep listings ready for sale.'
                    : 'हर पंजीकृत बैच की समीक्षा करें, स्टॉक स्तर अपडेट करें और बिक्री के लिए तैयार रखें।'}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <dt className="text-gray-500">{currentLang === 'en' ? 'Total items' : 'कुल आइटम'}</dt>
                <dd className="text-lg font-semibold text-gray-900">{items.length}</dd>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <dt className="text-gray-500">{currentLang === 'en' ? 'Visible now' : 'अभी प्रदर्शित'}</dt>
                <dd className="text-lg font-semibold text-gray-900">{filtered.length}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAdd((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <PlusCircleIcon className="w-5 h-5" />
              {showAdd
                ? currentLang === 'en'
                  ? 'Close form'
                  : 'फॉर्म बंद करें'
                : currentLang === 'en'
                  ? 'Add inventory item'
                  : 'इन्वेंटरी आइटम जोड़ें'}
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {currentLang === 'en' ? 'Export as CSV' : 'CSV निर्यात करें'}
            </button>
          </div>
        </section>

        {showAdd && (
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className={`text-lg font-semibold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                {currentLang === 'en' ? 'Create a new inventory record' : 'नई इन्वेंटरी प्रविष्टि बनाएँ'}
              </h2>
              <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                {currentLang === 'en'
                  ? 'Capture essential batch details before you publish them in the marketplace.'
                  : 'मार्केटप्लेस में प्रकाशित करने से पहले आवश्यक बैच विवरण दर्ज करें।'}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                addItem()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  placeholder={currentLang === 'en' ? 'Product name' : 'उत्पाद का नाम'}
                  value={newItem.productName || ''}
                  onChange={(e) => setNewItem((s) => ({ ...s, productName: e.target.value }))}
                  className={inputClass}
                  required
                />
                <input
                  placeholder={currentLang === 'en' ? 'Owner name' : 'स्वामी का नाम'}
                  value={newItem.ownerName || ''}
                  onChange={(e) => setNewItem((s) => ({ ...s, ownerName: e.target.value }))}
                  className={inputClass}
                  required
                />
                <select
                  value={newItem.ownerType || 'Farmer'}
                  onChange={(e) => setNewItem((s) => ({ ...s, ownerType: e.target.value as OwnerType }))}
                  className={inputClass}
                >
                  <option value="Farmer">{currentLang === 'en' ? 'Farmer' : 'किसान'}</option>
                  <option value="Distributor">{currentLang === 'en' ? 'Distributor' : 'वितरक'}</option>
                  <option value="Retailer">{currentLang === 'en' ? 'Retailer' : 'खुदरा विक्रेता'}</option>
                  <option value="Consumer">{currentLang === 'en' ? 'Consumer' : 'उपभोक्ता'}</option>
                  <option value="Government">{currentLang === 'en' ? 'Government' : 'सरकार'}</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    placeholder={currentLang === 'en' ? 'Quantity' : 'मात्रा'}
                    value={Number.isFinite(newItem.quantity) ? String(newItem.quantity) : ''}
                    onChange={(e) =>
                      setNewItem((s) => ({ ...s, quantity: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    className={inputClass}
                    required
                  />
                  <input
                    placeholder={currentLang === 'en' ? 'Unit (kg, L, sacks...)' : 'इकाई (kg, L, बोरे…)'}
                    value={newItem.unit || ''}
                    onChange={(e) => setNewItem((s) => ({ ...s, unit: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <input
                placeholder={currentLang === 'en' ? 'Location (optional)' : 'स्थान (वैकल्पिक)'}
                value={newItem.location || ''}
                onChange={(e) => setNewItem((s) => ({ ...s, location: e.target.value }))}
                className={inputClass}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {currentLang === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  {currentLang === 'en' ? 'Save item' : 'आइटम सहेजें'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white border rounded-xl shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  placeholder={
                    currentLang === 'en'
                      ? 'Search product, owner or location...'
                      : 'उत्पाद, स्वामी या स्थान खोजें...'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value as OwnerType | 'All')}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">{currentLang === 'en' ? 'All participants' : 'सभी प्रतिभागी'}</option>
                  <option value="Farmer">{currentLang === 'en' ? 'Farmers' : 'किसान'}</option>
                  <option value="Distributor">{currentLang === 'en' ? 'Distributors' : 'वितरक'}</option>
                  <option value="Retailer">{currentLang === 'en' ? 'Retailers' : 'खुदरा विक्रेता'}</option>
                  <option value="Consumer">{currentLang === 'en' ? 'Consumers' : 'उपभोक्ता'}</option>
                  <option value="Government">{currentLang === 'en' ? 'Government' : 'सरकार'}</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                {currentLang === 'en'
                  ? `Showing ${filtered.length} of ${items.length} items`
                  : `${items.length} में से ${filtered.length} आइटम प्रदर्शित`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Product' : 'उत्पाद'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Owner' : 'स्वामी'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Quantity' : 'मात्रा'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Location' : 'स्थान'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Last updated' : 'अंतिम अपडेट'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {currentLang === 'en' ? 'Status' : 'स्थिति'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-500">{item.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.ownerName}</div>
                      <div className="text-xs text-gray-500">{item.ownerType}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.location || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.lastUpdated).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${item.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.status === 'Sold'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      {currentLang === 'en'
                        ? 'No matching records. Adjust filters to view another batch.'
                        : 'कोई मेल खाते रिकॉर्ड नहीं। अन्य बैच देखने के लिए फ़िल्टर बदलें।'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}