'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types/product';
import { getImageUrl } from '@/lib/utils/formatters';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, error, isLoading } = useSWR(
    isAuthenticated && user?.is_admin ? '/admin/products' : null,
    () => productsApi.getProducts(false) // Show all products including inactive
  );

  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push(ROUTES.HOME);
      showToast('Admin access required', 'error');
    }
  }, [isAuthenticated, user, authLoading, router, showToast]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(productToDelete.id);
      showToast('Product deleted successfully', 'success');
      setDeleteModalOpen(false);
      mutate('/admin/products');
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Failed to delete product',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
          <p className="text-red-600">Failed to load products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Link href={ROUTES.ADMIN_PRODUCT_NEW}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {!data?.products || data.products.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first product</p>
              <Link href={ROUTES.ADMIN_PRODUCT_NEW}>
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.products.map((product) => {
                  const imageUrl = getImageUrl(product.image_url);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.short_description && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {product.short_description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.discount_percentage && product.discount_percentage > 0 ? (
                          <Badge variant="danger">-{product.discount_percentage}%</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.available_inventory} / {product.total_inventory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {!product.is_active ? (
                            <Badge variant="default">Inactive</Badge>
                          ) : product.available_inventory === 0 ? (
                            <Badge variant="danger">Out of Stock</Badge>
                          ) : product.available_inventory < 10 ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
