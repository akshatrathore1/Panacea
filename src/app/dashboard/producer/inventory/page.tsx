'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Download, PlusCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
];

export default function InventoryPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language as 'en' | 'hi') || 'en';
  const [items, setItems] = useState<InventoryItem[]>(initialData);
  const [q, setQ] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<OwnerType | 'All'>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    productName: '',
    ownerType: 'Farmer',
    ownerName: '',
    quantity: 0,
    unit: '',
  });

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return items.filter((it) => {
      if (ownerFilter !== 'All' && it.ownerType !== ownerFilter) return false;
      if (!qLower) return true;
      return (
        it.productName.toLowerCase().includes(qLower) ||
        it.ownerName.toLowerCase().includes(qLower) ||
        (it.location || '').toLowerCase().includes(qLower)
      );
    });
  }, [items, q, ownerFilter]);

  const addItem = () => {
    if (!newItem.productName || !newItem.ownerName || !newItem.unit) return;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      productName: newItem.productName!,
      ownerType: (newItem.ownerType || 'Farmer') as OwnerType,
      ownerName: newItem.ownerName!,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit!,
      location: newItem.location,
      lastUpdated: new Date().toISOString(),
      status: 'Available',
    };
    setItems((s) => [item, ...s]);
    setShowAdd(false);
    setNewItem({
      productName: '',
      ownerType: 'Farmer',
      ownerName: '',
      quantity: 0,
      unit: '',
    });
  };

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

  const exportCSV = () => {
    const headers = ['id', 'productName', 'ownerType', 'ownerName', 'quantity', 'unit', 'location', 'lastUpdated', 'status'];
    const rows = items.map((it) =>
      headers.map((h) => `"${String((it as any)[h] ?? '')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <PageHeader
        title={lang === 'en' ? 'Inventory' : 'इन्वेंटरी'}
        backHref="/dashboard/producer"
        actions={
          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              data-local-language-toggle
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Globe className="h-4 w-4" />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            <button
              onClick={() => setShowAdd((s) => !s)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              <PlusCircle className="h-4 w-4" /> {showAdd ? (lang === 'en' ? 'Close' : 'बंद करें') : (lang === 'en' ? 'Add Item' : 'आइटम जोड़ें')}
            </button>
            <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-900">
              <Download className="h-4 w-4" /> {lang === 'en' ? 'Export CSV' : 'CSV निर्यात करें'}
            </button>
          </div>
        }
      />

      {showAdd && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder={lang === 'en' ? 'Product name' : 'उत्पाद का नाम'}
              value={newItem.productName || ''}
              onChange={(e) => setNewItem((s) => ({ ...s, productName: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              placeholder={lang === 'en' ? 'Owner name' : 'स्वामी का नाम'}
              value={newItem.ownerName || ''}
              onChange={(e) => setNewItem((s) => ({ ...s, ownerName: e.target.value }))}
              className="border p-2 rounded"
            />
            <select
              value={newItem.ownerType || 'Farmer'}
              onChange={(e) => setNewItem((s) => ({ ...s, ownerType: e.target.value as OwnerType }))}
              className="border p-2 rounded"
            >
              <option>Farmer</option>
              <option>Distributor</option>
              <option>Retailer</option>
              <option>Consumer</option>
              <option>Government</option>
            </select>
            <input
              type="number"
              placeholder={lang === 'en' ? 'Quantity' : 'मात्रा'}
              value={String(newItem.quantity ?? '')}
              onChange={(e) => setNewItem((s) => ({ ...s, quantity: Number(e.target.value) }))}
              className="border p-2 rounded"
            />
            <input
              placeholder={lang === 'en' ? 'Unit (kg, liters, sacks...)' : 'इकाई (kg, लीटर, बोरे...)'}
              value={newItem.unit || ''}
              onChange={(e) => setNewItem((s) => ({ ...s, unit: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              placeholder={lang === 'en' ? 'Location (optional)' : 'स्थान (वैकल्पिक)'}
              value={newItem.location || ''}
              onChange={(e) => setNewItem((s) => ({ ...s, location: e.target.value }))}
              className="border p-2 rounded"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addItem} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
              {lang === 'en' ? 'Save' : 'सहेजें'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 border rounded hover:bg-gray-50">
              {lang === 'en' ? 'Cancel' : 'रद्द करें'}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            placeholder={lang === 'en' ? 'Search product, owner or location...' : 'उत्पाद, स्वामी या स्थान खोजें...'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value as any)} className="border p-2 rounded">
            <option value="All">{lang === 'en' ? 'All Participants' : 'सभी प्रतिभागी'}</option>
            <option value="Farmer">{lang === 'en' ? 'Farmers' : 'किसान'}</option>
            <option value="Distributor">{lang === 'en' ? 'Distributors' : 'वितरक'}</option>
            <option value="Retailer">{lang === 'en' ? 'Retailers' : 'खुदरा विक्रेता'}</option>
            <option value="Consumer">{lang === 'en' ? 'Consumers' : 'उपभोक्ता'}</option>
            <option value="Government">{lang === 'en' ? 'Government' : 'सरकार'}</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {lang === 'en' ? `Showing ${filtered.length} of ${items.length} items` : `${items.length} में से ${filtered.length} आइटम दिखा रहे हैं`}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Product' : 'उत्पाद'}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Owner' : 'स्वामी'}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Quantity' : 'मात्रा'}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Location' : 'स्थान'}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Last Updated' : 'अंतिम अपडेट'}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">{lang === 'en' ? 'Status' : 'स्थिति'}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-xs text-gray-500">{it.id}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{it.ownerName}</div>
                  <div className="text-xs text-gray-500">{it.ownerType}</div>
                </td>
                <td className="px-4 py-3">{it.quantity} {it.unit}</td>
                <td className="px-4 py-3">{it.location || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(it.lastUpdated).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${it.status === 'Available' ? 'bg-green-100 text-green-800' : it.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {it.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-sm text-gray-500">
                  {lang === 'en' ? 'No items found.' : 'कोई आइटम नहीं मिला।'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}