export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string | null;
}

export interface ApiError {
  message: string;
  status?: number;
}
