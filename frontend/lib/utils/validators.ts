import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  total_inventory: z.number().int().positive('Total inventory must be a positive integer'),
  available_inventory: z.number().int().nonnegative('Available inventory must be non-negative'),
}).refine((data) => data.available_inventory <= data.total_inventory, {
  message: 'Available inventory cannot exceed total inventory',
  path: ['available_inventory'],
});

export const reservationSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(10, 'Maximum quantity is 10'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
