import apiClient from './client';
import type {
  SystemStats,
  AdminReservationsResponse,
  UserStatsResponse,
  ProductStatsResponse,
  RecentReservationsResponse,
  RecentOrdersResponse,
} from '@/lib/types/admin';

export const adminApi = {
  // Get system overview statistics
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get('/admin/stats/overview');
    return response.data;
  },

  // Get all reservations with filtering
  getAllReservations: async (params?: {
    skip?: number;
    limit?: number;
    status?: 'reserved' | 'completed' | 'expired';
    user_id?: string;
    product_id?: string;
  }): Promise<AdminReservationsResponse> => {
    const response = await apiClient.get('/admin/reservations', { params });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<UserStatsResponse> => {
    const response = await apiClient.get('/admin/users/stats', { params });
    return response.data;
  },

  // Get product statistics
  getProductStats: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<ProductStatsResponse> => {
    const response = await apiClient.get('/admin/products/stats', { params });
    return response.data;
  },

  // Get recent reservations
  getRecentReservations: async (limit: number = 10): Promise<RecentReservationsResponse> => {
    const response = await apiClient.get('/admin/reservations/recent', {
      params: { limit },
    });
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (limit: number = 10): Promise<RecentOrdersResponse> => {
    const response = await apiClient.get('/admin/orders/recent', {
      params: { limit },
    });
    return response.data;
  },
};
