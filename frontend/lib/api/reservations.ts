import apiClient from './client';
import type {
  Reservation,
  CreateReservationRequest,
  ReservationListResponse,
  CheckoutResponse,
} from '@/lib/types/reservation';

export const reservationsApi = {
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    const response = await apiClient.post<Reservation>('/reservations', data);
    return response.data;
  },

  async getReservations(): Promise<ReservationListResponse> {
    const response = await apiClient.get<ReservationListResponse>('/reservations');
    return response.data;
  },

  async getReservation(id: string): Promise<Reservation> {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  async checkout(id: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<CheckoutResponse>(`/checkout/${id}`);
    return response.data;
  },
};
