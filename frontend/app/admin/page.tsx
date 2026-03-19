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
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const { data: stats, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin ? '/admin/stats' : null,
    () => adminApi.getSystemStats(),
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  const { data: recentOrders } = useSWR(
    isAuthenticated && user?.is_admin ? '/admin/recent-orders' : null,
    () => adminApi.getRecentOrders(5)
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
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(stats?.total_revenue || '0'))}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-gray-500">
                Today: {formatCurrency(parseFloat(stats?.revenue_today || '0'))}
              </p>
              <p className="text-xs text-gray-500">
                This Week: {formatCurrency(parseFloat(stats?.revenue_this_week || '0'))}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_products || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {stats?.active_products || 0} active
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_reservations || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="success">{stats?.active_reservations || 0} Active</Badge>
              <Badge variant="default">{stats?.completed_reservations || 0} Done</Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (24h)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Completed Orders</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats?.recent_activity.completed_orders_24h || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">New Reservations</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.recent_activity.new_reservations_24h || 0}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <Badge variant="warning">{stats?.active_reservations || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge variant="success">{stats?.completed_reservations || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expired</span>
                <Badge variant="danger">{stats?.expired_reservations || 0}</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Selling Products */}
      {stats?.top_selling_products && stats.top_selling_products.length > 0 && (
        <Card className="mb-8">
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Units Sold
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.top_selling_products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {product.units_sold}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Orders */}
      {recentOrders?.orders && recentOrders.orders.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.product.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(parseFloat(order.product.price) * order.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody>
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Manage Products</h4>
                  <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">User Statistics</h4>
                  <p className="text-sm text-gray-600">View customer analytics</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/admin/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">All Reservations</h4>
                  <p className="text-sm text-gray-600">Monitor all orders</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
