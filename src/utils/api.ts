const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'Request failed', data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(0, 'Network error or server unavailable');
    }
  },

  // Auth endpoints
  auth: {
    zkLogin: async (authData: {
      jwt: string;
      walletAddress: string;
      userSalt: string;
      maxEpoch?: number;
      aud?: string;
    }) => {
      return api.request<{
        user: any;
        accessToken: string;
        refreshToken: string;
        walletAddress: string;
      }>('/auth/zklogin', {
        method: 'POST',
        body: JSON.stringify(authData),
      });
    },

    getProfile: async () => {
      return api.request<{ user: any }>('/auth/profile');
    },

    refreshToken: async (refreshToken: string) => {
      return api.request<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    logout: async (refreshToken?: string) => {
      return api.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ 
          refreshToken,
          logoutAll: false 
        }),
      });
    },

    getWalletAddress: async (jwt: string) => {
      return api.request<{
        walletAddress: string;
        userSalt: string;
      }>('/auth/wallet-address', {
        method: 'POST',
        body: JSON.stringify({ jwt }),
      });
    },
  },

  // Token management
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getTokens: () => {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
    };
  },

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export default api;