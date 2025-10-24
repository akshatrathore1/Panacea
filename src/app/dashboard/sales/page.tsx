import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface SaleTransaction {
  id: string;
  date: Date;
  seller: {
    name: string;
    type: 'Farmer' | 'Distributor' | 'Retailer' | 'Consumer' | 'Government';
  };
  buyer: {
    name: string;
    type: 'Farmer' | 'Distributor' | 'Retailer' | 'Consumer' | 'Government';
  };
  product: {
    name: string;
    quantity: number;
    unit: string;
  };
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  transactionHash: string;
}

const SalesPage = () => {
  // Mock data - Replace with actual API call
  const transactions: SaleTransaction[] = [
    {
      id: '1',
      date: new Date(),
      seller: { name: 'John\'s Farm', type: 'Farmer' },
      buyer: { name: 'Fresh Distributors LLC', type: 'Distributor' },
      product: { name: 'Organic Tomatoes', quantity: 100, unit: 'kg' },
      amount: 500.00,
      status: 'Completed',
      transactionHash: '0x123...'
    },
    // Add more mock transactions
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supply Chain Transactions</h1>
        <div className="flex gap-4">
          <select className="border rounded-lg px-4 py-2">
            <option value="">All Participants</option>
            <option value="farmer">Farmers</option>
            <option value="distributor">Distributors</option>
            <option value="retailer">Retailers</option>
            <option value="consumer">Consumers</option>
            <option value="government">Government</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
            Export Data
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(transaction.date, 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.seller.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.seller.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.buyer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.buyer.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.product.quantity} {transaction.product.unit}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800">
                  <a href={`https://etherscan.io/tx/${transaction.transactionHash}`} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing 1 to {transactions.length} of {transactions.length} entries
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
          <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>
      <div className="mt-4">
        <Link href="/dashboard/sales" className="px-3 py-2">Sales</Link>
      </div>
    </div>
  );
};

export default SalesPage;