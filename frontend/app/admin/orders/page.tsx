'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { ShoppingCart, CheckCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin ? `/admin/orders?page=${page}` : null,
    () =>
      adminApi.getAllReservations({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        status: 'completed',
      })
  );

  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push(ROUTES.HOME);
      showToast('Admin access required', 'error');
    }
  }, [isAuthenticated, user, authLoading, router, showToast]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-red-600">Failed to load orders</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / pageSize);
  const totalRevenue =
    data?.reservations.reduce(
      (sum, order) => sum + parseFloat(order.product.price) * order.quantity,
      0
    ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Completed Orders</h1>
        <p className="text-gray-600">View all successfully completed orders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Page Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Orders Table */}
      {!data?.reservations || data.reservations.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Completed orders will appear here</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.reservations.map((order) => {
                    const total = parseFloat(order.product.price) * order.quantity;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-600">
                            {order.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user.full_name}
                            </div>
                            <div className="text-xs text-gray-500">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900">{order.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(total)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {order.completed_at
                              ? formatDateTime(order.completed_at)
                              : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
