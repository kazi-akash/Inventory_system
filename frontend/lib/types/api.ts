export interface ApiError {
  detail: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
