import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, PushupEntry, Quote } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/users/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/users/register', userData);
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  updateProfile: async (updates: Partial<RegisterData>) => {
    const { data } = await api.put('/users/profile', updates);
    return data;
  },
};

export const pushups = {
  createEntry: async (count: number): Promise<PushupEntry> => {
    const { data } = await api.post('/pushups', { count });
    return data;
  },

  getEntries: async (startDate?: string, endDate?: string): Promise<PushupEntry[]> => {
    const params = startDate && endDate ? { startDate, endDate } : {};
    const { data } = await api.get('/pushups', { params });
    return data;
  },

  updateEntry: async (id: string, count: number): Promise<PushupEntry> => {
    const { data } = await api.put(`/pushups/${id}`, { count });
    return data;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await api.delete(`/pushups/${id}`);
  },
};

// Quotes service using the Type.fit API
export const quotes = {
  getRandomQuote: async (): Promise<Quote> => {
    try {
      const { data } = await axios.get('https://type.fit/api/quotes');
      const quotes = data as Array<{ text: string; author: string }>;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return {
        content: randomQuote.text,
        author: randomQuote.author?.split(',')[0] || 'Unknown' // Clean up author name
      };
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Fallback to a default quote if API fails
      return {
        content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      };
    }
  }
};

export default api; 