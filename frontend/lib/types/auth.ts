export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
