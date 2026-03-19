import { Product } from './product';

export type ReservationStatus = 'reserved' | 'completed' | 'expired';

export interface ReservationUser {
  id: string;
  email: string;
  full_name: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: ReservationStatus;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
  product?: Product;
  user?: ReservationUser;
}

export interface CreateReservationRequest {
  product_id: string;
  quantity: number;
}

export interface ReservationListResponse {
  reservations: Reservation[];
  total: number;
}

export interface CheckoutResponse {
  reservation_id: string;
  status: string;
  message: string;
  completed_at: string;
}
