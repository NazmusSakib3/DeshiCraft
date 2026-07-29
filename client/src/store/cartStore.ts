import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

export interface CartLine {
  productId: string;
  slug: string;
  title: string;
  image?: string;
  price: number;
  stock: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      add: (product, quantity = 1) => {
        const image = product.images[0];
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product._id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product._id
                  ? { ...l, quantity: Math.min(l.stock, l.quantity + quantity) }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                productId: product._id,
                slug: product.slug,
                title: product.title,
                image,
                price: product.price,
                stock: product.stock,
                quantity: Math.min(product.stock, quantity),
              },
            ],
          };
        });
      },

      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId
              ? { ...l, quantity: Math.max(1, Math.min(l.stock, quantity)) }
              : l,
          ),
        })),

      clear: () => set({ lines: [] }),

      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),

      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: 'deshicraft-cart' },
  ),
);
