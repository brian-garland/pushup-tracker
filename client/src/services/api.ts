import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, PushupEntry, Quote } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
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
  createEntry: async (count: number, date?: string): Promise<PushupEntry> => {
    const payload = date ? { count, date } : { count };
    const { data } = await api.post('/pushups', payload);
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

// Quotes service with better error handling and fallback quotes
const FALLBACK_QUOTES = [
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    content: "The difference between try and triumph is just a little umph!",
    author: "Marvin Phillips"
  },
  {
    content: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  }
];

export const quotes = {
  getRandomQuote: async (): Promise<Quote> => {
    try {
      console.log('Fetching new quote...');
      const response = await fetch('https://api.quotable.io/random?tags=inspirational,motivational');
      
      if (!response.ok) {
        throw new Error(`Quote API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Quote received:', data);
      
      return {
        content: data.content,
        author: data.author
      };
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Return a random fallback quote
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  }
};

export default api; 