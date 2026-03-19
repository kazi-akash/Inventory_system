'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import { ProductForm } from '@/components/admin/ProductForm';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/lib/utils/constants';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push(ROUTES.HOME);
      showToast('Admin access required', 'error');
    }
  }, [isAuthenticated, user, authLoading, router, showToast]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await productsApi.createProduct(data);
      showToast('Product created successfully', 'success');
      router.push(ROUTES.ADMIN_PRODUCTS);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Failed to create product',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.ADMIN_PRODUCTS);
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={ROUTES.ADMIN_PRODUCTS}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
        <p className="text-gray-600">Add a new product to your inventory</p>
      </div>

      <Card>
        <CardBody>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            submitLabel="Create Product"
          />
        </CardBody>
      </Card>
    </div>
  );
}
