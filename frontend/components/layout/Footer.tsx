'use client';

import React from 'react';
import Link from 'next/link';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Get <span className="text-yellow-400">20%</span> Off for Your First Order
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="px-6 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-[300px]"
              />
              <button className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                Subscribe
                <span>→</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            By subscribing you agree to the Terms of use & Privacy Policy
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 italic mb-4">{APP_NAME}</h3>
            <p className="text-sm text-gray-400 mb-6">
              Your trusted partner for premium products. Quality products for champions.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  123 Flash Sale Street,<br />
                  Commerce City, CS-1234
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="text-sm">
                  <a href="tel:880-1615500080" className="hover:text-yellow-400 transition-colors">
                    880-1615500080
                  </a>
                  {' | '}
                  <a href="tel:880-1615550079" className="hover:text-yellow-400 transition-colors">
                    880-1615550079
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a href="mailto:info@flashsale.com" className="text-sm hover:text-yellow-400 transition-colors">
                  info@flashsale.com
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Our Store
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LOGIN} className="text-sm hover:text-yellow-400 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Limited Edition
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.RESERVATIONS} className="text-sm hover:text-yellow-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Refund & Return
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Terms & Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-sm hover:text-yellow-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} <span className="text-yellow-400 font-semibold">{APP_NAME}</span>. All Rights Reserved.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white rounded text-xs font-semibold text-gray-900">VISA</div>
              <div className="px-3 py-1.5 bg-white rounded text-xs font-semibold text-gray-900">MC</div>
              <div className="px-3 py-1.5 bg-white rounded text-xs font-semibold text-gray-900">AMEX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
