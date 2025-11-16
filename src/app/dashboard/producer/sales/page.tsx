'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import { Download } from 'lucide-react';

console.log('SalesPage rendered'); // <-- debug log

type ParticipantType = 'Farmer' | 'Distributor' | 'Retailer' | 'Consumer' | 'Government';
type TxStatus = 'Completed' | 'Pending' | 'Cancelled';

interface SaleTransaction {
  id: string;
  date: string; // ISO
  seller: { name: string; type: ParticipantType };
  buyer: { name: string; type: ParticipantType };
  product: { name: string; quantity: number; unit: string };
  amount: number;
  status: TxStatus;
  transactionHash?: string;
}

/* Replace this mock data with a real API call when ready */
const MOCK_TRANSACTIONS: SaleTransaction[] = [
  {
    id: 'tx-001',
    date: new Date().toISOString(),
    seller: { name: "John's Farm", type: 'Farmer' },
    buyer: { name: 'Fresh Distributors LLC', type: 'Distributor' },
    product: { name: 'Organic Tomatoes', quantity: 100, unit: 'kg' },
    amount: 500.0,
    status: 'Completed',
    transactionHash: '0x123abc',
  },
  {
    id: 'tx-002',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    seller: { name: 'Green Valley', type: 'Retailer' },
    buyer: { name: 'Local Consumer', type: 'Consumer' },
    product: { name: 'Sweet Corn', quantity: 20, unit: 'pcs' },
    amount: 40.0,
    status: 'Pending',
    transactionHash: '0x456def',
  },
];

const statusBadge = (s: TxStatus) =>
  s === 'Completed' ? 'bg-green-100 text-green-800' : s === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

export default function SalesPage() {
  const [transactions] = useState<SaleTransaction[]>(MOCK_TRANSACTIONS);
  type ParticipantFilterOption = 'All' | ParticipantType;
  const [participantFilter, setParticipantFilter] = useState<ParticipantFilterOption>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (participantFilter !== 'All') {
        if (t.seller.type !== participantFilter && t.buyer.type !== participantFilter) return false;
      }
      if (!q) return true;
      return (
        t.product.name.toLowerCase().includes(q) ||
        t.seller.name.toLowerCase().includes(q) ||
        t.buyer.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [transactions, participantFilter, search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Sales Management"
        backHref="/dashboard/producer"
        actions={
          <button
            onClick={() => {
              const csvHeader = ['id,date,seller,buyer,product,quantity,unit,amount,status'].join(',');
              const rows = transactions.map((t) =>
                [
                  t.id,
                  t.date,
                  `${t.seller.name} (${t.seller.type})`,
                  `${t.buyer.name} (${t.buyer.type})`,
                  t.product.name,
                  t.product.quantity,
                  t.product.unit,
                  t.amount,
                  t.status,
                ]
                  .map((c) => `"${String(c).replace(/"/g, '""')}"`)
                  .join(',')
              );
              const blob = new Blob([csvHeader + '\n' + rows.join('\n')], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sales_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            placeholder="Search by product, seller, buyer or id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-72"
          />
          <select
            value={participantFilter}
            onChange={(event) => setParticipantFilter(event.target.value as ParticipantFilterOption)}
            className="border p-2 rounded"
          >
            <option value="All">All Participants</option>
            <option value="Farmer">Farmers</option>
            <option value="Distributor">Distributors</option>
            <option value="Retailer">Retailers</option>
            <option value="Consumer">Consumers</option>
            <option value="Government">Government</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">Showing {filtered.length} of {transactions.length} entries</div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Txn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{tx.seller.name}</div>
                  <div className="text-xs text-gray-500">{tx.seller.type}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{tx.buyer.name}</div>
                  <div className="text-xs text-gray-500">{tx.buyer.type}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{tx.product.name}</div>
                  <div className="text-xs text-gray-500">{tx.product.quantity} {tx.product.unit}</div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">${tx.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-blue-600">
                  {tx.transactionHash ? (
                    <a href={`https://etherscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noreferrer">View</a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-sm text-gray-500">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">Page controls placeholder</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
          <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}