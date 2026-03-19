'use client';

import React, { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api/reservations';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { CountdownTimer } from '@/components/reservations/CountdownTimer';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { POLL_INTERVALS, ROUTES } from '@/lib/utils/constants';
import { 
  Package, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Calendar,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils/formatters';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: reservation, error, isLoading } = useSWR(
    isAuthenticated ? `/reservations/${id}` : null,
    () => reservationsApi.getReservation(id),
    {
      refreshInterval: POLL_INTERVALS.RESERVATION_DETAIL,
      revalidateOnFocus: true,
    }
  );

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await reservationsApi.checkout(id);
      showToast('Checkout completed successfully!', 'success');
      setIsCheckoutModalOpen(false);
      mutate(`/reservations/${id}`);
      mutate('/reservations');
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || 'Checkout failed',
        'error'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">Reservation not found</p>
          <Link href={ROUTES.RESERVATIONS}>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Back to Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Use backend status directly - trust the server
  const status = reservation.status;

  const getStatusConfig = () => {
    switch (status) {
      case 'reserved':
        return {
          label: 'Active',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        };
      case 'expired':
        return {
          label: 'Expired',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
        };
      default:
        return {
          label: status,
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          icon: <Clock className="w-6 h-6 text-gray-600" />,
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

  // Can checkout only if status is reserved (trust backend)
  const canCheckout = status === 'reserved';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={ROUTES.RESERVATIONS}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {statusConfig.icon}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className={`text-sm ${statusConfig.textColor} mt-1`}>
                  Status: {statusConfig.label}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg`}>
              <span className={`text-sm font-bold ${statusConfig.textColor}`}>
                {statusConfig.label.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Product Information
                </h2>
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-40 h-40 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={reservation.product?.name || 'Product'}
                        className="w-full h-full object-cover"
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
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {reservation.product?.name || 'Product'}
                    </h3>
                    {reservation.product?.short_description && (
                      <p className="text-gray-600 mb-4">{reservation.product.short_description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                        <p className="text-lg font-bold text-gray-900">{reservation.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price per item</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(discountedPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer for Active Reservations */}
            {status === 'reserved' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Time Remaining</h3>
                </div>
                <CountdownTimer 
                  createdAt={reservation.created_at}
                  expiresAt={reservation.expires_at}
                  durationMinutes={5}
                />
                <p className="text-sm text-blue-700 mt-3">
                  Complete your purchase before the timer expires to secure your order.
                </p>
              </div>
            )}

            {/* Completed Message */}
            {status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-900">Purchase Completed</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your order has been confirmed and processed successfully.
                      {reservation.completed_at && ` Completed on ${formatDate(reservation.completed_at)}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expired Message */}
            {status === 'expired' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-bold text-red-900">Reservation Expired</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This reservation has expired. The items have been returned to inventory.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(productPrice * reservation.quantity)}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency((productPrice - discountedPrice) * reservation.quantity)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {canCheckout && (
                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Complete Checkout
                </button>
              )}
            </div>

            {/* Customer Info */}
            {reservation.user && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{reservation.user.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{reservation.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(reservation.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Checkout"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to complete this purchase?
          </p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-semibold">{reservation.product?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold">{reservation.quantity}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
              className="flex-1"
            >
              Confirm Purchase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
