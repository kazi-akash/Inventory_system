'use client';

import React, { memo, useMemo } from 'react';
import useSWR from 'swr';
import { reservationsApi } from '@/lib/api/reservations';
import { ReservationCard } from './ReservationCard';
import { Spinner } from '@/components/ui/Spinner';
import { POLL_INTERVALS } from '@/lib/utils/constants';
import { Package } from 'lucide-react';

interface ReservationListProps {
  filterStatus?: 'all' | 'reserved' | 'completed' | 'expired';
}

export const ReservationList = memo(function ReservationList({ filterStatus = 'all' }: ReservationListProps) {
  const { data, error, isLoading } = useSWR(
    '/reservations',
    () => reservationsApi.getReservations(),
    {
      refreshInterval: POLL_INTERVALS.RESERVATIONS,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-red-600 mb-2 font-semibold">Failed to load reservations</p>
        <p className="text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!data?.reservations || data.reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">Start browsing products to make your first order</p>
        <a
          href="/products"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Browse Products
        </a>
      </div>
    );
  }

  // Filter reservations based on status - memoized to prevent unnecessary recalculations
  const filteredReservations = useMemo(() => {
    if (!data?.reservations) return [];
    return filterStatus === 'all'
      ? data.reservations
      : data.reservations.filter(r => r.status === filterStatus);
  }, [data?.reservations, filterStatus]);

  if (filteredReservations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No {filterStatus} orders
        </h3>
        <p className="text-gray-600">
          {filterStatus === 'reserved' && 'You have no active reservations at the moment.'}
          {filterStatus === 'completed' && 'You have no completed orders yet.'}
          {filterStatus === 'expired' && 'You have no expired reservations.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReservations.map((reservation) => (
        <ReservationCard key={reservation.id} reservation={reservation} />
      ))}
    </div>
  );
});
