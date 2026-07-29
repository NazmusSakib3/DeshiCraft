import { create } from 'zustand';
import { api } from '../lib/api';

interface WishlistState {
  ids: string[];
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],

  load: async () => {
    try {
      const { data } = await api.get<{ items: { _id: string }[] }>('/users/wishlist');
      set({ ids: data.items.map((i) => i._id) });
    } catch {
      set({ ids: [] });
    }
  },

  toggle: async (productId) => {
    const { data } = await api.post<{ added: boolean; wishlist: string[] }>(
      `/users/wishlist/${productId}`,
    );
    set({ ids: data.wishlist });
    return data.added;
  },

  has: (productId) => get().ids.includes(productId),

  clear: () => set({ ids: [] }),
}));
