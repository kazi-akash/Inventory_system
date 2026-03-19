import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function isExpired(expiresAt: string | Date): boolean {
  const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiryDate.getTime() < Date.now();
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Constructs the full URL for a product image
 * @param imageUrl - The relative image URL from the API (e.g., "/uploads/products/uuid.png")
 * @returns Full image URL or null if no image URL provided
 */
export function getImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}${imageUrl}`;
}
