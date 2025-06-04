import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For local development - your backend running on localhost:3001
const BASE_URL = 'http://localhost:3001';
// For production - uncomment this line when deploying:
// const BASE_URL = 'https://pocketpmclaude-production.up.railway.app';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // 30 seconds for AI analysis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests automatically
    this.api.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, remove it
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async register(userData) {
    try {
      const response = await this.api.post('/api/register', userData);
      const { token, user } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/api/login', credentials);
      const { token, user } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  }

  async logout() {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  async getCurrentUser() {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated() {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // AI Analysis method
  async analyzeIdea(idea) {
    try {
      const response = await this.api.post('/api/analyze', { idea });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Analysis failed' 
      };
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Backend unavailable' };
    }
  }
}

export default new ApiService();
