'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWeb3 } from '@/components/Providers'
import type { Product } from '@/types/product'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  PlusCircleIcon,
  TagIcon,
  TrashIcon,
  WalletIcon
} from '@heroicons/react/24/outline'

export default function ListForSalePage() {
  const router = useRouter()
  const { user, contract, signer, connectWallet, isConnected } = useWeb3()
  const { i18n } = useTranslation()
  const initialLang = (i18n.language as 'en' | 'hi') || 'en'
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>(initialLang)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    quantity: 0,
    unit: 'kg',
    price: 0,
    description: '',
    category: '',
    harvestDate: ''
  })

  // Check wallet connection on page load
  useEffect(() => {
    if (!isConnected) {
      connectWallet().catch(console.error)
    }
  }, [isConnected, connectWallet])

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

  const resetForm = () => {
    setProductForm({
      name: '',
      quantity: 0,
      unit: 'kg',
      price: 0,
      description: '',
      category: '',
      harvestDate: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Will hold a signer returned by connectWallet(false) if we call it below
    let web3Signer: any = null

    // Check wallet and registration
    if (!isConnected) {
      try {
        // Allow connecting the wallet even if the address is not yet registered
        // — producers should be able to list with a connected wallet and then
        // register later if needed. Passing `false` prevents connectWallet
        // from requiring a server-side user doc.
        // Use the returned signer to avoid relying on stale `signer` state in
        // the same render cycle.
  web3Signer = await connectWallet(false)
      } catch (err) {
        alert(
          currentLang === 'en'
            ? 'Please install MetaMask and connect your wallet'
            : 'कृपया MetaMask स्थापित करें और अपना वॉलेट कनेक्ट करें'
        )
        return
      }
    }

    // Allow listing when a wallet signer exists even if there's no registered
    // user profile (phone-only users will have `user` but wallet users may not).
    // If neither a user nor a signer is available, require registration.
    // Prefer the signer returned from connectWallet (if we called it above),
    // otherwise fall back to the context `signer`.
    const activeSigner = typeof web3Signer !== 'undefined' && web3Signer ? web3Signer : signer
    if (!user && !activeSigner) {
      router.push('/register') // Redirect to registration if no user profile or signer
      return
    }

    setIsSubmitting(true)
    try {
      const producerAddress = activeSigner ? await activeSigner.getAddress() : user?.address || 'unknown'
      const producer = {
        address: producerAddress,
        name: user?.name || 'Anonymous Producer'
      }

      const payload = {
        name: productForm.name,
        quantity: Number(productForm.quantity),
        unit: productForm.unit,
        price: Number(productForm.price),
        description: productForm.description,
        category: productForm.category,
        harvestDate: productForm.harvestDate,
        producer,
        images: []
      }

      console.log('Submitting payload:', payload)
      const res = await fetch('/api/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      console.log('API response status', res.status)

      if (!res.ok) {
        // Attempt to read error details from response body
        let errBody = null
        try {
          errBody = await res.json()
        } catch (_e) {
          try { errBody = await res.text() } catch { errBody = null }
        }
        console.error('Marketplace POST failed:', res.status, errBody)
        alert((currentLang === 'en' ? 'Failed to list product: ' : 'उत्पाद सूचीबद्ध करने में विफल: ') + (errBody?.error || errBody || res.status))
        return
      }

      // Success: inform user and navigate to marketplace to see listing
      try {
        const created = await res.json()
        alert(currentLang === 'en' ? 'Product listed successfully!' : 'उत्पाद सफलतापूर्वक सूचीबद्ध किया गया!')
        console.log('Created marketplace product:', created)
      } catch (e) {
        console.log('Product created, but response JSON parse failed', e)
      }
      router.push('/dashboard/marketplace')
    } catch (err) {
      console.error('Submit error:', err)
      alert(
        err instanceof Error
          ? err.message
          : currentLang === 'en'
            ? 'Failed to list product'
            : 'उत्पाद सूचीबद्ध करने में विफल'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <TagIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'List Product for Sale' : 'बिक्री के लिए उत्पाद सूचीबद्ध करें'}
                </h1>
                <p className={`text-sm text-gray-600 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en'
                    ? 'Share batch details with trusted buyers and publish transparent pricing in one place.'
                    : 'विश्वसनीय खरीदारों के साथ बैच विवरण साझा करें और पारदर्शी मूल्य एक ही स्थान पर प्रकाशित करें।'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              {isConnected ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                  <WalletIcon className="w-5 h-5" />
                  {currentLang === 'en' ? 'Wallet' : 'वॉलेट'}: {user?.name || (currentLang === 'en' ? 'Connected' : 'कनेक्टेड')}
                </span>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <WalletIcon className="w-5 h-5" /> {currentLang === 'en' ? 'Connect wallet' : 'वॉलेट जोड़ें'}
                </button>
              )}
              <div className="text-xs text-gray-500 text-left sm:text-right">
                {currentLang === 'en'
                  ? 'Ensure your wallet is linked before submitting the listing.'
                  : 'सूची जमा करने से पहले सुनिश्चित करें कि आपका वॉलेट जुड़ा हुआ है।'}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Product name' : 'उत्पाद का नाम'}
                </label>
                <input
                  required
                  placeholder={currentLang === 'en' ? 'Product name' : 'उत्पाद का नाम'}
                  value={productForm.name ?? ''}
                  onChange={(e) => setProductForm((state) => ({ ...state, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Category' : 'श्रेणी'}
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                  className={inputClass}
                  required
                >
                  <option value="">{currentLang === 'en' ? 'Select category' : 'श्रेणी चुनें'}</option>
                  <option value="vegetables">{currentLang === 'en' ? 'Vegetables' : 'सब्ज़ियाँ'}</option>
                  <option value="fruits">{currentLang === 'en' ? 'Fruits' : 'फल'}</option>
                  <option value="grains">{currentLang === 'en' ? 'Grains' : 'अनाज'}</option>
                  <option value="dairy">{currentLang === 'en' ? 'Dairy' : 'डेयरी'}</option>
                  <option value="other">{currentLang === 'en' ? 'Other' : 'अन्य'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Quantity' : 'मात्रा'}
                </label>
                <div className="flex gap-3">
                  <input
                    required
                    type="number"
                    placeholder={currentLang === 'en' ? 'Quantity' : 'मात्रा'}
                    value={productForm.quantity ?? ''}
                    onChange={(e) =>
                      setProductForm((state) => ({
                        ...state,
                        quantity: e.target.value === '' ? 0 : Number(e.target.value)
                      }))
                    }
                    className={`${inputClass} flex-1`}
                    min="0"
                  />
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, unit: e.target.value }))}
                    className={`${inputClass} max-w-[120px]`}
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Price per unit' : `प्रति ${productForm.unit || 'इकाई'} कीमत`}
                </label>
                <input
                  required
                  type="number"
                  placeholder={currentLang === 'en' ? 'Price' : 'कीमत'}
                  value={productForm.price ?? ''}
                  onChange={(e) =>
                    setProductForm((state) => ({
                      ...state,
                      price: e.target.value === '' ? 0 : Number(e.target.value)
                    }))
                  }
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                  {currentLang === 'en' ? 'Harvest date' : 'कटाई की तारीख'}
                </label>
                <input
                  type="date"
                  placeholder={currentLang === 'en' ? 'Harvest date' : 'कटाई की तारीख'}
                  value={productForm.harvestDate ?? ''}
                  onChange={(e) =>
                    setProductForm((state) => ({ ...state, harvestDate: e.target.value || '' }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium text-gray-700 ${currentLang === 'hi' ? 'font-hindi' : ''}`}>
                {currentLang === 'en' ? 'Description' : 'विवरण'}
              </label>
              <textarea
                placeholder={currentLang === 'en' ? 'Describe quality, certifications, storage conditions…' : 'गुणवत्ता, प्रमाणपत्र, भंडारण स्थिति का वर्णन करें…'}
                value={productForm.description ?? ''}
                onChange={(e) => setProductForm((state) => ({ ...state, description: e.target.value }))}
                className={`${inputClass} min-h-[120px]`}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <TrashIcon className="w-5 h-5" />
                {currentLang === 'en' ? 'Clear form' : 'फ़ॉर्म साफ़ करें'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <PlusCircleIcon className="w-5 h-5" />
                {isSubmitting
                  ? currentLang === 'en'
                    ? 'Listing…'
                    : 'सूचीबद्ध हो रहा है…'
                  : currentLang === 'en'
                    ? 'List product'
                    : 'उत्पाद सूचीबद्ध करें'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}