export interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  short_description?: string;
  description?: string;
  total_inventory: number;
  available_inventory: number;
  is_active: boolean;
  discount_percentage?: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  image_url?: string;
  short_description?: string;
  description?: string;
  total_inventory: number;
  available_inventory: number;
  is_active?: boolean;
  discount_percentage?: number;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  image_url?: string;
  short_description?: string;
  description?: string;
  total_inventory?: number;
  available_inventory?: number;
  is_active?: boolean;
  discount_percentage?: number;
}

export interface ImageUploadResponse {
  image_url: string;
  filename: string;
}
