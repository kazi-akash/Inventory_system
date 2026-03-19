'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/formatters';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const { data: productStats, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin ? '/admin/product-stats' : null,
    () => adminApi.getProductStats({ limit: 50 })
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
          <p className="text-red-600">Failed to load product analytics</p>
        </div>
      </div>
    );
  }

  const totalRevenue =
    productStats?.products.reduce((sum, p) => sum + parseFloat(p.revenue), 0) || 0;
  const totalSales =
    productStats?.products.reduce((sum, p) => sum + p.completed_sales, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Analytics</h1>
        <p className="text-gray-600">Sales performance and inventory insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{productStats?.total || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Product Performance Table */}
      {!productStats?.products || productStats.products.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Add products to see analytics</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Inventory
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Reservations
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Sales
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productStats.products.map((product) => {
                    const imageUrl = getImageUrl(product.image_url);
                    const conversionRate =
                      product.total_reservations > 0
                        ? ((product.completed_sales / product.total_reservations) * 100).toFixed(
                            1
                          )
                        : '0';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(parseFloat(product.price))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm text-gray-900">
                            {product.available_inventory} / {product.total_inventory}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-900">
                            {product.total_reservations}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {product.completed_sales}
                            </div>
                            <div className="text-xs text-gray-500">{conversionRate}% conv.</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(parseFloat(product.revenue))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!product.is_active ? (
                            <Badge variant="default">Inactive</Badge>
                          ) : product.available_inventory === 0 ? (
                            <Badge variant="danger">Out of Stock</Badge>
                          ) : product.available_inventory < 10 ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
