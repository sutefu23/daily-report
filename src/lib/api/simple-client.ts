// Simplified API client for Issue #4
// This is a basic implementation to demonstrate the concept

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Array<{ field?: string; message?: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Basic API client
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add CSRF token for non-GET requests
  if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
      ?.split('=')[1];
    
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    const error = errorData.error || {};
    throw new ApiError(
      response.status,
      error.code || 'API_ERROR',
      error.message || 'An error occurred',
      error.details
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    async login(credentials: { email: string; password: string }) {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async logout() {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },

    async getMe() {
      return apiRequest('/api/auth/me');
    },
  },

  reports: {
    async getAll(params?: {
      start_date?: string;
      end_date?: string;
      sales_person_id?: number;
      page?: number;
      per_page?: number;
    }) {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const query = searchParams.toString();
      return apiRequest(`/api/reports${query ? `?${query}` : ''}`);
    },

    async getById(id: number) {
      return apiRequest(`/api/reports/${id}`);
    },

    async create(reportData: {
      report_date: string;
      problem: string;
      plan: string;
      visits: Array<{
        customer_id: number;
        visit_time?: string;
        visit_content: string;
      }>;
    }) {
      return apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
    },

    async update(
      id: number,
      reportData: {
        problem?: string;
        plan?: string;
        visits?: Array<{
          id?: number;
          customer_id: number;
          visit_time?: string;
          visit_content: string;
        }>;
      }
    ) {
      return apiRequest(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reportData),
      });
    },

    async delete(id: number) {
      return apiRequest(`/api/reports/${id}`, {
        method: 'DELETE',
      });
    },

    async getComments(id: number) {
      return apiRequest(`/api/reports/${id}/comments`);
    },

    async addComment(id: number, comment: string) {
      return apiRequest(`/api/reports/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    },
  },

  customers: {
    async getAll(params?: {
      search?: string;
      page?: number;
      per_page?: number;
    }) {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const query = searchParams.toString();
      return apiRequest(`/api/customers${query ? `?${query}` : ''}`);
    },

    async getById(id: number) {
      return apiRequest(`/api/customers/${id}`);
    },

    async create(customerData: {
      company_name: string;
      contact_person: string;
      phone: string;
      email: string;
      address?: string;
    }) {
      return apiRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
    },

    async update(
      id: number,
      customerData: {
        company_name: string;
        contact_person: string;
        phone: string;
        email: string;
        address?: string;
      }
    ) {
      return apiRequest(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
    },

    async delete(id: number) {
      return apiRequest(`/api/customers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  salesPersons: {
    async getAll(params?: {
      department?: string;
      is_manager?: boolean;
      page?: number;
      per_page?: number;
    }) {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const query = searchParams.toString();
      return apiRequest(`/api/sales-persons${query ? `?${query}` : ''}`);
    },

    async getById(id: number) {
      return apiRequest(`/api/sales-persons/${id}`);
    },
  },
};
