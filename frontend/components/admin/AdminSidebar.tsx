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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
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

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Content */}
      <nav className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto py-4">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon 
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                      size={20}
                    />
                    {!isCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Toggle Button */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="text-gray-500" size={20} />
            ) : (
              <ChevronLeft className="text-gray-500" size={20} />
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}
