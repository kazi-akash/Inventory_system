'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { useToast } from '@/lib/hooks/useToast';
import type { Product } from '@/lib/types/product';
import { getImageUrl } from '@/lib/utils/formatters';

const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number',
  }),
  short_description: z.string().max(500, 'Short description must be 500 characters or less').optional(),
  description: z.string().optional(),
  total_inventory: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), {
    message: 'Total inventory must be a positive integer',
  }),
  available_inventory: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), {
    message: 'Available inventory must be a non-negative integer',
  }),
  discount_percentage: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
    message: 'Discount must be between 0 and 100',
  }).optional(),
  is_active: z.boolean().optional(),
}).refine((data) => Number(data.available_inventory) <= Number(data.total_inventory), {
  message: 'Available inventory cannot exceed total inventory',
  path: ['available_inventory'],
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(product?.image_url);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price.toString(),
          short_description: product.short_description || '',
          description: product.description || '',
          total_inventory: product.total_inventory.toString(),
          available_inventory: product.available_inventory.toString(),
          discount_percentage: product.discount_percentage?.toString() || '',
          is_active: product.is_active ?? true,
        }
      : {
          is_active: true,
        },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, GIF, or WebP)', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(undefined);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    let finalImageUrl = imageUrl;

    // Upload image if a new one was selected
    if (imageFile) {
      setUploadingImage(true);
      try {
        const uploadResponse = await productsApi.uploadImage(imageFile);
        finalImageUrl = uploadResponse.image_url;
        showToast('Image uploaded successfully', 'success');
      } catch (error) {
        showToast('Failed to upload image', 'error');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    await onSubmit({
      name: data.name,
      price: Number(data.price),
      image_url: finalImageUrl,
      short_description: data.short_description || undefined,
      description: data.description || undefined,
      total_inventory: Number(data.total_inventory),
      available_inventory: Number(data.available_inventory),
      discount_percentage: data.discount_percentage ? Number(data.discount_percentage) : undefined,
      is_active: data.is_active,
    });
  };

  const getImageSrc = () => {
    if (imagePreview) return imagePreview;
    if (imageUrl) return getImageUrl(imageUrl);
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        
        {imageSrc ? (
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageSrc}
              alt="Product preview"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, or WebP (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      <Input
        label="Product Name"
        placeholder="iPhone 15 Pro"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Price"
        type="number"
        step="0.01"
        placeholder="999.99"
        error={errors.price?.message}
        {...register('price')}
      />

      <div>
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <input
          id="short_description"
          type="text"
          placeholder="Brief product summary (max 500 characters)"
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...register('short_description')}
        />
        {errors.short_description && (
          <p className="mt-1 text-sm text-red-600">{errors.short_description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Full Description
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Detailed product information..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <Input
        label="Total Inventory"
        type="number"
        placeholder="100"
        error={errors.total_inventory?.message}
        {...register('total_inventory')}
      />

      <Input
        label="Available Inventory"
        type="number"
        placeholder="100"
        error={errors.available_inventory?.message}
        {...register('available_inventory')}
      />

      <Input
        label="Discount Percentage (Optional)"
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="15.00"
        error={errors.discount_percentage?.message}
        {...register('discount_percentage')}
      />

      <div className="flex items-center">
        <input
          id="is_active"
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          {...register('is_active')}
        />
        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
          Product is active (visible to customers)
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading || uploadingImage}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading || uploadingImage}
          className="flex-1"
        >
          {uploadingImage ? 'Uploading...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
