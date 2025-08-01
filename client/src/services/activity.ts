const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ActivityLog {
  id: string;
  adminName: string;
  action: 'add' | 'edit' | 'delete' | 'view';
  entryName: string;
  details: string;
  createdAt: Date;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ActivityService {
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

  async getActivityLogs(page = 1, limit = 50): Promise<ActivityLogResponse> {
    const response = await fetch(`${API_BASE_URL}/activity?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch activity logs');
    }

    return response.json();
  }

  async getActivityLogsByUser(adminName: string, page = 1, limit = 50): Promise<ActivityLogResponse> {
    const response = await fetch(`${API_BASE_URL}/activity/user/${encodeURIComponent(adminName)}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user activity logs');
    }

    return response.json();
  }

  async getActivityStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/activity/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch activity stats');
    }

    return response.json();
  }
}

export const activityService = new ActivityService();
