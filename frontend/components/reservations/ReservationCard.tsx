'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { CountdownTimer } from './CountdownTimer';
import { ROUTES } from '@/lib/utils/constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import type { Reservation } from '@/lib/types/reservation';
import { getImageUrl } from '@/lib/utils/formatters';

interface ReservationCardProps {
  reservation: Reservation;
}

export const ReservationCard = memo(function ReservationCard({ reservation }: ReservationCardProps) {
  // Use the status from the backend directly
  const status = reservation.status;

  const getStatusConfig = () => {
    switch (status) {
      case 'reserved':
        return {
          badge: <Badge variant="info">Active</Badge>,
          icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'completed':
        return {
          badge: <Badge variant="success">Completed</Badge>,
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'expired':
        return {
          badge: <Badge variant="danger">Expired</Badge>,
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          badge: <Badge variant="default">{status}</Badge>,
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const hasDiscount = reservation.product?.discount_percentage && reservation.product.discount_percentage > 0;
  const productPrice = parseFloat(String(reservation.product?.price || '0'));
  const discountedPrice = hasDiscount 
    ? productPrice * (1 - parseFloat(String(reservation.product!.discount_percentage!)) / 100)
    : productPrice;
  const totalPrice = discountedPrice * reservation.quantity;

  const imageUrl = getImageUrl(reservation.product?.image_url);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Image */}
          <div className="relative w-full lg:w-40 h-40 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={reservation.product?.name || 'Product'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{reservation.product!.discount_percentage}%
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {reservation.product?.name || 'Product'}
                </h3>
                {reservation.product?.short_description && (
                  <p className="text-sm text-gray-600">
                    {reservation.product.short_description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {statusConfig.icon}
                {statusConfig.badge}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                <p className="text-sm font-semibold text-gray-900">{reservation.quantity} units</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(discountedPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(reservation.created_at)}
                </p>
              </div>
            </div>

            {/* Countdown Timer for Active Reservations */}
            {status === 'reserved' && (
              <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Time Remaining</span>
                </div>
                <CountdownTimer 
                  createdAt={reservation.created_at}
                  expiresAt={reservation.expires_at}
                  durationMinutes={5}
                />
              </div>
            )}

            {/* Completed Info */}
            {status === 'completed' && reservation.completed_at && (
              <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Completed on {formatDate(reservation.completed_at)}
                  </span>
                </div>
              </div>
            )}

            {/* Expired Info */}
            {status === 'expired' && (
              <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4`}>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    Expired on {formatDate(reservation.expires_at)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Link href={ROUTES.RESERVATION_DETAIL(reservation.id)}>
                <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
