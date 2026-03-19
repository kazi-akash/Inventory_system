'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';

interface AdminMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileSidebar({ isOpen, onClose }: AdminMobileSidebarProps) {
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
      icon: Calendar,
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              // For dashboard, only match exact path. For others, match if path starts with the route
              const isActive = item.href === ROUTES.ADMIN_DASHBOARD
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon 
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                      size={20}
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
