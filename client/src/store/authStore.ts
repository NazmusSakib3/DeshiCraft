import { create } from 'zustand';
import { api, setAccessToken } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post<{ user: User; accessToken: string }>('/auth/login', {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    set({ user: data.user, status: 'ready' });
    return data.user;
  },

  register: async (name, email, password) => {
    const { data } = await api.post<{ user: User; accessToken: string }>('/auth/register', {
      name,
      email,
      password,
    });
    setAccessToken(data.accessToken);
    set({ user: data.user, status: 'ready' });
    return data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      set({ user: null, status: 'ready' });
    }
  },

  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const refresh = await api.post<{ user: User; accessToken: string }>('/auth/refresh');
      setAccessToken(refresh.data.accessToken);
      set({ user: refresh.data.user, status: 'ready' });
    } catch {
      setAccessToken(null);
      set({ user: null, status: 'ready' });
    }
  },
}));
