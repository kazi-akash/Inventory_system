'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';
import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: ROUTES.ADMIN_DASHBOARD,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: ROUTES.ADMIN_PRODUCTS,
      label: 'Products',
      icon: Package,
    },
    {
      href: ROUTES.ADMIN_RESERVATIONS,
      label: 'Reservations',
      icon: ShoppingCart,
    },
    {
      href: ROUTES.ADMIN_USERS,
      label: 'Users',
      icon: Users,
    },
    {
      href: ROUTES.ADMIN_ANALYTICS,
      label: 'Analytics',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
