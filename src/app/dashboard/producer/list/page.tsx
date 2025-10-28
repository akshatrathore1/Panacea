'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/components/Providers';
import type { Product } from '@/types/product';
import PageHeader from '@/components/PageHeader';
import { PlusCircle, Trash2, Wallet, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ListForSalePage() {
  const router = useRouter();
  const { user, contract, signer, connectWallet, isConnected } = useWeb3();
  const { i18n } = useTranslation();
  const lang = (i18n.language as 'en' | 'hi') || 'en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    quantity: 0,
    unit: 'kg',
    price: 0,
    description: '',
    category: '',
    harvestDate: ''
  });

  // Check wallet connection on page load
  useEffect(() => {
    if (!isConnected) {
      connectWallet().catch(console.error);
    }
  }, [isConnected, connectWallet]);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLang);
        document.documentElement.lang = newLang;
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check wallet and registration
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        alert(lang === 'en' ? 'Please install MetaMask and connect your wallet' : 'कृपया MetaMask स्थापित करें और अपना वॉलेट कनेक्ट करें');
        return;
      }
    }

    if (!user) {
      router.push('/register'); // Redirect to registration if no user profile
      return;
    }

    setIsSubmitting(true);
    try {
      const producer = {
        address: signer ? (await signer.getAddress()) : user.address,
        name: user.name || 'Anonymous Producer'
      };

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
      };

      console.log('Submitting payload:', payload);
      const res = await fetch('/api/marketplace/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      console.log('API response status', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown' }));
        throw new Error(err.error || (lang === 'en' ? 'Failed to save product' : 'उत्पाद सहेजने में विफल'));
      }

      // navigate to marketplace to see listing
      router.push('/dashboard/marketplace');
    } catch (err) {
      console.error('Submit error:', err);
      alert(err instanceof Error ? err.message : (lang === 'en' ? 'Failed to list product' : 'उत्पाद सूचीबद्ध करने में विफल'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add connection status indicator
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={lang === 'en' ? 'List Product for Sale' : 'बिक्री के लिए उत्पाद सूचीबद्ध करें'}
        backHref="/dashboard/producer"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              data-local-language-toggle
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Globe className="h-4 w-4" />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            <div className="text-sm">
              {isConnected ? (
                <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md">
                  <Wallet className="h-4 w-4" />
                  {lang === 'en' ? 'Wallet' : 'वॉलेट'}: {user?.name || (lang === 'en' ? 'Connected' : 'कनेक्टेड')}
                </span>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Wallet className="h-4 w-4" /> {lang === 'en' ? 'Connect Wallet' : 'वॉलेट कनेक्ट करें'}
                </button>
              )}
            </div>
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'en' ? 'Product Name' : 'उत्पाद का नाम'}
              </label>
              <input
                required
                placeholder={lang === 'en' ? 'Product name' : 'उत्पाद का नाम'}
                value={productForm.name ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, name: e.target.value }))}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'en' ? 'Category' : 'श्रेणी'}
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">{lang === 'en' ? 'Select category' : 'श्रेणी चुनें'}</option>
                <option value="vegetables">{lang === 'en' ? 'Vegetables' : 'सब्ज़ियाँ'}</option>
                <option value="fruits">{lang === 'en' ? 'Fruits' : 'फल'}</option>
                <option value="grains">{lang === 'en' ? 'Grains' : 'अनाज'}</option>
                <option value="dairy">{lang === 'en' ? 'Dairy' : 'डेयरी'}</option>
                <option value="other">{lang === 'en' ? 'Other' : 'अन्य'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'en' ? 'Quantity' : 'मात्रा'}
              </label>
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  placeholder={lang === 'en' ? 'Quantity' : 'मात्रा'}
                  value={productForm.quantity ?? ''}
                  onChange={(e) => setProductForm(s => ({ ...s, quantity: e.target.value === '' ? 0 : Number(e.target.value) }))}
                  className="border p-2 rounded"
                  min="0"
                />
                <select
                  value={productForm.unit}
                  onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">L</option>
                  <option value="units">units</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'en' ? 'Price per' : 'प्रति'} {productForm.unit}
              </label>
              <input
                required
                type="number"
                placeholder={lang === 'en' ? 'Price' : 'कीमत'}
                value={productForm.price ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                className="border p-2 rounded"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'en' ? 'Harvest Date' : 'कटाई की तारीख'}
              </label>
              <input
                type="date"
                placeholder={lang === 'en' ? 'Harvest date' : 'कटाई की तारीख'}
                value={productForm.harvestDate ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, harvestDate: e.target.value || null }))}
                className="border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'en' ? 'Description' : 'विवरण'}
            </label>
            <textarea
              placeholder={lang === 'en' ? 'Description' : 'विवरण'}
              value={productForm.description ?? ''}
              onChange={(e) => setProductForm(s => ({ ...s, description: e.target.value }))}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setProductForm({
                name: '',
                quantity: 0,
                unit: 'kg',
                price: 0,
                description: '',
                category: '',
                harvestDate: ''
              })}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              <Trash2 className="h-4 w-4" /> {lang === 'en' ? 'Clear' : 'साफ़ करें'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              <PlusCircle className="h-4 w-4" /> {isSubmitting ? (lang === 'en' ? 'Listing…' : 'सूचीबद्ध हो रहा है…') : (lang === 'en' ? 'List Product' : 'उत्पाद सूचीबद्ध करें')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}