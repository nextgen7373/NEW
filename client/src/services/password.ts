const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface PasswordEntry {
  _id?: string;
  id: string;
  websiteName: string;
  clientName: string;
  email: string;
  password: string;
  notes?: string;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class PasswordService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('trivault-token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async getAllPasswords(): Promise<PasswordEntry[]> {
    const response = await fetch(`${API_BASE_URL}/passwords`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch passwords');
    }

    const data = await response.json();
    // Map MongoDB _id to id for frontend compatibility
    return data.map((entry: any) => ({
      ...entry,
      id: entry._id || entry.id
    }));
  }

  async createPassword(entryData: Partial<Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PasswordEntry> {
    const response = await fetch(`${API_BASE_URL}/passwords`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create password entry');
    }

    const data = await response.json();
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...data,
      id: data._id || data.id
    };
  }

  async updatePassword(id: string, updates: Partial<PasswordEntry>): Promise<PasswordEntry> {
    if (!id || id === 'undefined') {
      throw new Error('Invalid ID provided for update');
    }
    
    const response = await fetch(`${API_BASE_URL}/passwords/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update password entry');
    }

    const data = await response.json();
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...data,
      id: data._id || data.id
    };
  }

  async deletePassword(id: string): Promise<void> {
    if (!id || id === 'undefined') {
      throw new Error('Invalid ID provided for deletion');
    }
    
    const response = await fetch(`${API_BASE_URL}/passwords/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete password entry');
    }
  }

  async getAllTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/passwords/tags`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tags');
    }

    return response.json();
  }
}

export const passwordService = new PasswordService();

