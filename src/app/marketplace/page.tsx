'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types/product';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/marketplace/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="p-8">Loading marketplace...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/producer" className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
            ←
          </Link>
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-sm text-gray-600">{p.category}</div>
            <div className="mt-2">
              <div className="font-medium">₹{p.price} / {p.unit}</div>
              <div className="text-sm">Qty: {p.quantity} {p.unit}</div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{p.description}</p>
            <div className="mt-3 text-xs text-gray-500">Producer: {p.producer?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}