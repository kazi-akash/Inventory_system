export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Flash Sale System';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const RESERVATION_EXPIRY_MINUTES = parseInt(
  process.env.NEXT_PUBLIC_RESERVATION_EXPIRY_MINUTES || '5'
);

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  LOGIN: '/login',
  REGISTER: '/register',
  RESERVATIONS: '/reservations',
  RESERVATION_DETAIL: (id: string) => `/reservations/${id}`,
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/${id}/edit`,
  ADMIN_RESERVATIONS: '/admin/reservations',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;

export const INVENTORY_THRESHOLDS = {
  HIGH: 20,
  MEDIUM: 5,
  LOW: 0,
} as const;

export const POLL_INTERVALS = {
  PRODUCTS: 10000, // 10 seconds - reduced frequency
  RESERVATIONS: 15000, // 15 seconds - reduced frequency
  RESERVATION_DETAIL: 5000, // 5 seconds
  COUNTDOWN: 1000, // 1 second
} as const;
