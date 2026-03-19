'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { reservationsApi } from '@/lib/api/reservations';
import { ROUTES } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { Lock } from 'lucide-react';
import type { Product } from '@/lib/types/product';

interface ReserveButtonProps {
  product: Product;
}

export function ReserveButton({ product }: ReserveButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${ROUTES.PRODUCT_DETAIL(product.id)}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleReserve = async () => {
    setIsLoading(true);
    try {
      await reservationsApi.createReservation({
        product_id: product.id,
        quantity,
      });
      showToast('Reservation created successfully!', 'success');
      setIsModalOpen(false);
      router.push(ROUTES.RESERVATIONS);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Failed to create reservation',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = product.available_inventory === 0;
  const maxQuantity = Math.min(product.available_inventory, 10);

  if (isOutOfStock) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <>
      <Button variant="primary" onClick={handleClick} className="w-full">
        {isAuthenticated ? (
          'Reserve Now'
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Login to Reserve
          </>
        )}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserve Product"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
            <p className="text-sm text-gray-600">
              Price: {formatCurrency(product.price)} per item
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(product.price * quantity)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReserve}
              isLoading={isLoading}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
