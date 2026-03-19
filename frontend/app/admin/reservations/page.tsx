'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { ShoppingCart, Search, Filter } from 'lucide-react';

type StatusFilter = 'all' | 'reserved' | 'completed' | 'expired';

export default function AdminReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin
      ? `/admin/reservations?status=${statusFilter}&page=${page}&limit=${pageSize}&search=${debouncedSearch}`
      : null,
    () =>
      adminApi.getAllReservations({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
  );

  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push(ROUTES.HOME);
      showToast('Admin access required', 'error');
    }
  }, [isAuthenticated, user, authLoading, router, showToast]);

  // Filter reservations based on search query (client-side)
  const filteredReservations = React.useMemo(() => {
    if (!data?.reservations) return [];
    if (!debouncedSearch.trim()) return data.reservations;

    const query = debouncedSearch.toLowerCase();
    return data.reservations.filter(
      (reservation) =>
        reservation.user.full_name.toLowerCase().includes(query) ||
        reservation.user.email.toLowerCase().includes(query) ||
        reservation.product.name.toLowerCase().includes(query) ||
        reservation.id.toLowerCase().includes(query)
    );
  }, [data?.reservations, debouncedSearch]);

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Failed to load reservations</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reserved':
        return <Badge variant="warning">Reserved</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reservations</h1>
        <p className="text-sm text-gray-600">Monitor and manage all user reservations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, email, product, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="reserved">Reserved</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Per Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredReservations.length} of {data?.total || 0} reservations
          {searchQuery && searchQuery !== debouncedSearch && (
            <span className="ml-2 text-blue-600">Searching...</span>
          )}
        </div>
      </div>

      {/* Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-600">
            {debouncedSearch
              ? 'Try adjusting your search criteria'
              : statusFilter === 'all'
              ? 'No reservations have been made yet'
              : `No ${statusFilter} reservations found`}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => {
                    const total = parseFloat(reservation.product.price) * reservation.quantity;

                    return (
                      <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.user.full_name}
                            </div>
                            <div className="text-xs text-gray-500">{reservation.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.product.name}
                            </div>
                            {reservation.product.discount_percentage &&
                              parseFloat(reservation.product.discount_percentage) > 0 && (
                                <div className="text-xs text-red-600">
                                  -{reservation.product.discount_percentage}% off
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-sm text-gray-900">{reservation.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDateTime(reservation.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDateTime(reservation.expires_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
