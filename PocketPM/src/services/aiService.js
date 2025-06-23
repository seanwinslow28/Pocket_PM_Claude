// Enhanced API service for Pocket PM with environment support
import { config } from '../../config';
import { createClient } from '@supabase/supabase-js';
import ErrorService from './errorService';

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

class ApiService {
  constructor() {
    this.API_BASE_URL = config.API_BASE_URL;
    this.useMockData = config.USE_MOCK_DATA;
  }

  // Test the API connection
  async testConnection() {
    try {
      if (this.useMockData) {
        return true; // Mock always works
      }
      
      const response = await fetch(`${this.API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.log('API connection test failed:', error);
      return false;
    }
  }

  // Analyze an idea using your backend
  async analyzeIdea(idea) {
    try {
      // Validate input
      if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return {
          success: false,
          error: 'Please provide a valid idea description'
        };
      }

      // Use mock data in development or if API fails
      if (this.useMockData) {
        // Mock response for testing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        
        return {
          success: true,
          data: {
            analysis: `Great idea! Here's a quick analysis of "${idea}":\n\n• Market Opportunity: This addresses a real need in the market\n• Target Users: Professionals and businesses looking for efficiency\n• Key Benefits: Saves time, improves productivity\n• Next Steps: Validate with potential users and build an MVP\n\nThis is a promising concept worth exploring further!`,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Real API call for production
      const response = await fetch(`${this.API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Log error for debugging
        console.error('API Error:', {
          status: response.status,
          error: errorData,
          idea: idea.substring(0, 50) + '...'
        });
        
        return {
          success: false,
          error: errorData.error || `Server error: ${response.status}. Please try again.`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          analysis: data.analysis,
          usage: data.usage,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Report to error logging service
      this.logError('analyzeIdea', error, { idea: idea?.substring(0, 50) });
      
      return {
        success: false,
        error: 'Failed to analyze idea. Please check your connection and try again.'
      };
    }
  }

  // Enhanced user authentication with Supabase
  async login(email, password) {
    try {
      if (this.useMockData) {
        // Mock login for development
        if (email && password) {
          return {
            success: true,
            user: { email, name: 'Test User' }
          };
        }
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Production: Use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.logError('login', error, { email });
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'User'
        },
        session: data.session
      };
    } catch (error) {
      this.logError('login', error, { email });
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      if (this.useMockData) {
        // Mock registration for development
        if (userData.email && userData.password && userData.name) {
          return {
            success: true,
            user: { email: userData.email, name: userData.name }
          };
        }
        return {
          success: false,
          error: 'Please fill in all fields'
        };
      }

      // Production: Use Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) {
        this.logError('register', error, { email: userData.email });
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: userData.name
        },
        session: data.session
      };
    } catch (error) {
      this.logError('register', error, { email: userData.email });
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Save analysis to database (for user testing analytics)
  async saveAnalysis(userId, idea, analysis) {
    try {
      if (this.useMockData) {
        console.log('Mock: Saving analysis', { userId, idea: idea.substring(0, 50) });
        return { success: true };
      }

      const { error } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          title: idea.substring(0, 100),
          idea: idea,
          analysis: analysis
        });

      if (error) {
        this.logError('saveAnalysis', error, { userId, idea: idea.substring(0, 50) });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      this.logError('saveAnalysis', error, { userId });
      return { success: false, error: 'Failed to save analysis' };
    }
  }

  // Error logging method
  logError(method, error, context = {}) {
    ErrorService.logError(error, {
      method,
      service: 'ApiService',
      ...context
    });
  }
}

export default new ApiService(); 