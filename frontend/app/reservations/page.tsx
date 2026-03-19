'use client';

import React, { useState } from 'react';
import { ReservationList } from '@/components/reservations/ReservationList';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/lib/utils/constants';
import { Spinner } from '@/components/ui/Spinner';
import { ShoppingBag, Filter } from 'lucide-react';

export default function ReservationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<'all' | 'reserved' | 'completed' | 'expired'>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">
            Track and manage your product reservations. Complete checkout before expiration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilterStatus('reserved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === 'reserved'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === 'completed'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === 'expired'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Expired
          </button>
        </div>

        <ReservationList filterStatus={filterStatus} />
      </div>
    </div>
  );
}
