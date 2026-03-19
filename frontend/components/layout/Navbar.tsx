'use client';

import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  User, 
  MapPin, 
  Package, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Phone, 
  Mail,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';

export const Navbar = memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  const handleLogout = useCallback(() => {
    logout();
    setShowUserMenu(false);
    router.push(ROUTES.HOME);
  }, [logout, router]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const closeUserMenu = useCallback(() => {
    setShowUserMenu(false);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-9 text-xs">
            <div className="flex items-center gap-6">
              <a href="tel:880-1615500080" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">880-1615500080</span>
              </a>
              <a href="mailto:info@flashsale.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden md:inline">info@flashsale.com</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href={ROUTES.PRODUCTS} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Find Store</span>
              </Link>
              {isAuthenticated && (
                <Link href={ROUTES.RESERVATIONS} className="hover:text-white transition-colors">
                  Track Order
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link 
                href={ROUTES.HOME}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(ROUTES.HOME) 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              
              <div className="relative group">
                <Link
                  href={ROUTES.PRODUCTS}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(ROUTES.PRODUCTS) 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Shop
                  <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href={ROUTES.PRODUCTS} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                    All Products
                  </Link>
                  <Link href={ROUTES.PRODUCTS} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    Flash Sale
                  </Link>
                  <Link href={ROUTES.PRODUCTS} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg">
                    New Arrivals
                  </Link>
                </div>
              </div>

              <Link 
                href={ROUTES.PRODUCTS}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                About
              </Link>

              <Link 
                href={ROUTES.PRODUCTS}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {user?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={closeUserMenu}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          {!user?.is_admin && (
                            <Link 
                              href={ROUTES.RESERVATIONS} 
                              onClick={closeUserMenu}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              My Orders
                            </Link>
                          )}
                          {user?.is_admin && (
                            <Link 
                              href={ROUTES.ADMIN_DASHBOARD} 
                              onClick={closeUserMenu}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-200 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href={ROUTES.LOGIN}>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top duration-200">
            <div className="px-4 py-4 space-y-1">
              {/* Mobile Search */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                  />
                </div>
              </div>

              <Link
                href={ROUTES.HOME}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(ROUTES.HOME) 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(ROUTES.PRODUCTS) 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Shop
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
});
