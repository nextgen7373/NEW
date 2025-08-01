const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('trivault-token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('trivault-token', data.token);
    localStorage.setItem('trivault-user', JSON.stringify(data.user));
    
    return data;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    const data = await response.json();
    return data.user;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('trivault-token', data.token);
    localStorage.setItem('trivault-user', JSON.stringify(data.user));
    
    return data;
  }

  logout(): void {
    localStorage.removeItem('trivault-token');
    localStorage.removeItem('trivault-user');
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem('trivault-user');
    return userData ? JSON.parse(userData) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('trivault-token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
