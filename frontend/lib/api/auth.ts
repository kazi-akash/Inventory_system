import apiClient, { setTokens, clearTokens } from './client';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@/lib/types/auth';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    clearTokens();
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },
};
