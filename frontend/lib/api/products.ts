import apiClient from './client';
import type {
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ImageUploadResponse,
} from '@/lib/types/product';

export const productsApi = {
  async getProducts(activeOnly: boolean = true, skip: number = 0, limit: number = 100): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/products', {
      params: { active_only: activeOnly, skip, limit },
    });
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ImageUploadResponse>('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
