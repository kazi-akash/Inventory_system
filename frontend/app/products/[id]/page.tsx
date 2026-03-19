'use client';

import React, { useState } from 'react';
import { use } from 'react';
import useSWR from 'swr';
import { productsApi } from '@/lib/api/products';
import { ReserveButton } from '@/components/products/ReserveButton';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils/formatters';
import { POLL_INTERVALS } from '@/lib/utils/constants';
import { 
  Package, 
  ArrowLeft, 
  Truck, 
  Shield, 
  RefreshCw, 
  Star,
  Check,
  Clock,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import { getImageUrl } from '@/lib/utils/formatters';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quantity, setQuantity] = useState(1);
  
  const { data: product, error, isLoading } = useSWR(
    `/products/${id}`,
    () => productsApi.getProduct(id),
    {
      refreshInterval: POLL_INTERVALS.PRODUCTS,
      revalidateOnFocus: true,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <Link href={ROUTES.PRODUCTS}>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Back to Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount_percentage! / 100)
    : product.price;

  const imageUrl = getImageUrl(product.image_url);
  const isOutOfStock = product.available_inventory === 0;
  const isLowStock = product.available_inventory > 0 && product.available_inventory <= 10;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 aspect-square">
              {hasDiscount && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    -{product.discount_percentage}% OFF
                  </span>
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    Only {product.available_inventory} left!
                  </span>
                </div>
              )}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <Package className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <Truck className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <Shield className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Secure Payment</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <RefreshCw className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8 - 124 reviews)</span>
              </div>

              {product.short_description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              {hasDiscount ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(discountedPrice)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    You save {formatCurrency(product.price - discountedPrice)} ({product.discount_percentage}%)
                  </p>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                <span className={`text-sm font-semibold ${
                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.available_inventory} in stock`}
                </span>
              </div>
              
              {!isOutOfStock && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isLowStock ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((product.available_inventory / product.total_inventory) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Reserve Button */}
            <div className="pt-2">
              <ReserveButton product={product} />
            </div>

            {/* Reservation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Reservation Information</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Reservations expire after 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Complete checkout before expiration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Real-time inventory updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">SKU</p>
                <p className="text-sm font-medium text-gray-900">{product.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">Electronics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        {product.description && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Total Inventory</span>
                <span className="font-medium text-gray-900">{product.total_inventory} units</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Available Now</span>
                <span className="font-medium text-gray-900">{product.available_inventory} units</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Price</span>
                <span className="font-medium text-gray-900">{formatCurrency(product.price)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">{product.discount_percentage}% OFF</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
