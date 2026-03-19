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
import { Users, TrendingUp } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin ? `/admin/users?page=${page}` : null,
    () =>
      adminApi.getUserStats({
        skip: (page - 1) * pageSize,
        limit: pageSize,
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
          <p className="text-red-600">Failed to load user statistics</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Statistics</h1>
        <p className="text-gray-600">Customer analytics and spending insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    data?.users.reduce((sum, u) => sum + parseFloat(u.total_spent), 0) || 0
                  )}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    data?.users.length
                      ? data.users.reduce((sum, u) => sum + parseFloat(u.total_spent), 0) /
                          data.users.length
                      : 0
                  )}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Users Table */}
      {!data?.users || data.users.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No registered users yet</p>
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
                      User
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Total Reservations
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Expired
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Member Since
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.users.map((userStat) => (
                    <tr key={userStat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userStat.full_name}
                          </div>
                          <div className="text-xs text-gray-500">{userStat.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {userStat.total_reservations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="success">{userStat.completed_reservations}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="danger">{userStat.expired_reservations}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(parseFloat(userStat.total_spent))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(userStat.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
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
