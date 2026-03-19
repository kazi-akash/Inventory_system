import React, { memo } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import { formatCurrency, getImageUrl } from '@/lib/utils/formatters';
import type { Product } from '@/lib/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount_percentage! / 100)
    : product.price;

  const imageUrl = getImageUrl(product.image_url);

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="group">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              UP TO -{product.discount_percentage}%
            </span>
          )}
          {product.available_inventory < 10 && product.available_inventory > 0 && (
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
              NEW
            </span>
          )}
          {product.available_inventory === 0 && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded z-10">
              OUT OF STOCK
            </span>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-32 h-32 text-gray-300 group-hover:scale-105 transition-transform" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">
                From {formatCurrency(discountedPrice)}
              </p>
              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
            <span className="text-xs text-gray-500 ml-1">(12)</span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-4 line-clamp-2">
            {product.short_description || product.description || "High quality product available now"}
          </p>

          {/* Buy Button */}
          <button className="w-full py-2 px-4 border border-gray-900 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors">
            Buy now
          </button>

          {/* Availability */}
          <p className="text-xs text-gray-500 text-center mt-2">
            {product.available_inventory > 0 ? `${product.available_inventory} available` : 'Out of stock'}
          </p>
        </div>
      </div>
    </Link>
  );
});
