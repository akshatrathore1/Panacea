'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/components/Providers';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { ethers } from 'ethers';

export default function ListForSalePage() {
  const router = useRouter();
  const { user, contract, signer, connectWallet, isConnected } = useWeb3();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check wallet and registration
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        alert('Please install MetaMask and connect your wallet');
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
        throw new Error(err.error || 'Failed to save product');
      }

      // navigate to marketplace to see listing
      router.push('/marketplace');
    } catch (err) {
      console.error('Submit error:', err);
      alert(err instanceof Error ? err.message : 'Failed to list product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add connection status indicator
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/producer" className="px-3 py-2 bg-gray-100 rounded">
            ←
          </Link>
          <h1 className="text-2xl font-semibold">List Product for Sale</h1>
        </div>
        
        {/* Wallet status indicator */}
        <div className="text-sm">
          {isConnected ? (
            <span className="text-green-600">
              ✓ Wallet Connected: {user?.name || 'Not Registered'}
            </span>
          ) : (
            <button 
              onClick={() => connectWallet()} 
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                required
                placeholder="Product name"
                value={productForm.name ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, name: e.target.value }))}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select category</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  placeholder="Quantity"
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
                Price per {productForm.unit}
              </label>
              <input
                required
                type="number"
                placeholder="Price"
                value={productForm.price ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                className="border p-2 rounded"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harvest Date
              </label>
              <input
                type="date"
                placeholder="Harvest date"
                value={productForm.harvestDate ?? ''}
                onChange={(e) => setProductForm(s => ({ ...s, harvestDate: e.target.value || null }))}
                className="border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Description"
              value={productForm.description ?? ''}
              onChange={(e) => setProductForm(s => ({ ...s, description: e.target.value }))}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
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
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Listing...' : 'List Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}