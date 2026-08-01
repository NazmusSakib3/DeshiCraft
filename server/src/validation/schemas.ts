import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  street: z.string().min(2),
  city: z.string().min(1),
  district: z.string().min(1),
  postalCode: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const sellerApplySchema = z.object({
  shopName: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  region: z.string().max(80).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const productSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  material: z.string().max(80).optional(),
  region: z.string().max(80).optional(),
  tags: z.array(z.string()).optional(),
});

export const productUpdateSchema = productSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['cod', 'stripe', 'sslcommerz']),
});

export const paymentSessionSchema = z.object({
  orderId: z.string().min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export const blockUserSchema = z.object({
  blocked: z.boolean(),
  reason: z.string().max(500).optional(),
});
