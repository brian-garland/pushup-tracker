export interface User {
  id: string;
  name: string;
  email: string;
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PushupEntry {
  _id: string;
  userId: string;
  date: string;
  count: number;
  goalMet: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  dailyGoal?: number;
}

export interface Quote {
  content: string;
  author: string;
} 