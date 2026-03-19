'use client';

import React, { memo } from 'react';
import useSWR from 'swr';
import { productsApi } from '@/lib/api/products';
import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import { POLL_INTERVALS } from '@/lib/utils/constants';
import { Package } from 'lucide-react';

export const ProductList = memo(function ProductList() {
  const { data, error, isLoading } = useSWR(
    '/products',
    () => productsApi.getProducts(),
    {
      refreshInterval: POLL_INTERVALS.PRODUCTS,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">Failed to load products</p>
        <p className="text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-600">Check back later for new products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
