import { authService, type User } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

class AuthStore {
  private state: AuthState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const storedUser = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    
    this.state = {
      user: storedUser,
      isAuthenticated,
      isLoading: false,
      error: null,
      login: this.login.bind(this),
      logout: this.logout.bind(this),
      checkAuth: this.checkAuth.bind(this),
    };
  }

  private async login(email: string, password: string): Promise<boolean> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const response = await authService.login({ email, password });
      
      this.state.user = response.user;
      this.state.isAuthenticated = true;
      this.state.isLoading = false;
      this.notifyListeners();
      
      return true;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Login failed';
      this.state.isLoading = false;
      this.state.isAuthenticated = false;
      this.notifyListeners();
      return false;
    }
  }

  private async checkAuth(): Promise<void> {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      this.state.isLoading = true;
      this.notifyListeners();

      const user = await authService.getProfile();
      this.state.user = user;
      this.state.isAuthenticated = true;
    } catch (error) {
      // Token might be expired, logout
      this.logout();
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  private logout(): void {
    authService.logout();
    this.state.user = null;
    this.state.isAuthenticated = false;
    this.state.error = null;
    this.notifyListeners();
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const authStore = new AuthStore();

export function useAuth(): AuthState {
  const [state, setState] = React.useState(authStore.getState());
  
  React.useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });
    return unsubscribe;
  }, []);

  return state;
}

import * as React from 'react';
