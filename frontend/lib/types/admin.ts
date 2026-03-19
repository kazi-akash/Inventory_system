// Admin Dashboard Types

export interface SystemStats {
  total_users: number;
  total_products: number;
  active_products: number;
  total_reservations: number;
  active_reservations: number;
  completed_reservations: number;
  expired_reservations: number;
  total_revenue: string;
  revenue_today: string;
  revenue_this_week: string;
  revenue_this_month: string;
  top_selling_products: TopSellingProduct[];
  recent_activity: {
    new_reservations_24h: number;
    completed_orders_24h: number;
  };
}

export interface TopSellingProduct {
  name: string;
  price: number;
  units_sold: number;
  revenue: number;
}

export interface AdminReservation {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'reserved' | 'completed' | 'expired';
  expires_at: string;
  created_at: string;
  completed_at: string | null;
  product: {
    id: string;
    name: string;
    price: string;
    image_url: string;
    short_description: string;
    discount_percentage: string;
  };
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface AdminReservationsResponse {
  reservations: AdminReservation[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserStats {
  id: string;
  email: string;
  full_name: string;
  total_reservations: number;
  completed_reservations: number;
  expired_reservations: number;
  total_spent: string;
  created_at: string;
}

export interface UserStatsResponse {
  users: UserStats[];
  total: number;
}

export interface ProductStats {
  id: string;
  name: string;
  price: string;
  image_url: string;
  total_inventory: number;
  available_inventory: number;
  total_reservations: number;
  completed_sales: number;
  revenue: string;
  is_active: boolean;
}

export interface ProductStatsResponse {
  products: ProductStats[];
  total: number;
}

export interface RecentReservationsResponse {
  reservations: AdminReservation[];
  total: number;
}

export interface RecentOrdersResponse {
  orders: AdminReservation[];
  total: number;
}
