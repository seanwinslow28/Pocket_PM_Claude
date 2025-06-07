import { supabase, handleSupabaseError } from './supabase';
import * as SecureStore from 'expo-secure-store';
import dummyDataService from './dummyDataService';

class ApiService {
  constructor() {
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        SecureStore.setItemAsync('authToken', session.access_token);
        SecureStore.setItemAsync('userData', JSON.stringify(session.user));
      } else if (event === 'SIGNED_OUT') {
        SecureStore.deleteItemAsync('authToken');
        SecureStore.deleteItemAsync('userData');
      }
    });
  }

  // Authentication methods using Supabase Auth
  async register(userData) {
    try {
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
        return { 
          success: false, 
          error: handleSupabaseError(error)
        };
      }

      return { 
        success: true, 
        data: {
          user: data.user,
          message: 'Registration successful! Please check your email to verify your account.'
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  }

  async login(credentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { 
          success: false, 
          error: handleSupabaseError(error)
        };
      }

      return { 
        success: true, 
        data: {
          user: data.user,
          message: 'Login successful!'
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !!session && !error;
    } catch (error) {
      return false;
    }
  }

  // AI Analysis using Supabase Edge Functions or dummy data
  async analyzeIdea(idea) {
    try {
      // Check if test mode is enabled
      const isTestMode = await dummyDataService.isTestModeEnabled();
      
      if (isTestMode) {
        console.log('🧪 Test mode enabled - using dummy data');
        // Parse the idea into product name and description
        const ideaParts = idea.split(':');
        const productName = ideaParts.length > 1 ? ideaParts[0].trim() : 'Product Idea';
        const productDescription = ideaParts.length > 1 ? ideaParts[1].trim() : idea;
        
        // Get dummy analysis
        const dummyResult = await dummyDataService.getDummyAnalysis(productName, productDescription, 'comprehensive');
        
        return {
          success: true,
          data: {
            idea: idea,
            analysis: dummyResult.data.analysis,
            usage: dummyResult.data.usage,
            timestamp: new Date().toISOString(),
            testMode: true
          }
        };
      }

      // Production mode - use real Supabase/OpenAI
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { 
          success: false, 
          error: 'Please login to analyze ideas' 
        };
      }

      // Parse the idea into product name and description
      // If it's a simple idea, use it as both name and description
      const ideaParts = idea.split(':');
      const productName = ideaParts.length > 1 ? ideaParts[0].trim() : 'Product Idea';
      const productDescription = ideaParts.length > 1 ? ideaParts[1].trim() : idea;

      // Call Supabase Edge Function for AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { 
          productName,
          productDescription,
          analysisType: 'business', // Default to business analysis
          userId: session.user.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return { 
          success: false, 
          error: handleSupabaseError(error)
        };
      }

      // Return the analysis data
      return { 
        success: true, 
        data: {
          idea: idea,
          analysis: data.analysis.content,
          usage: data.usage,
          timestamp: data.analysis.createdAt,
          userId: session.user.id,
          analysisId: data.analysis.id,
          testMode: false
        }
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return { 
        success: false, 
        error: 'Analysis failed' 
      };
    }
  }

  // Deep dive analysis for specialized insights
  async getDeepDiveAnalysis(idea, analysisType) {
    try {
      // Check if test mode is enabled
      const isTestMode = await dummyDataService.isTestModeEnabled();
      
      if (isTestMode) {
        console.log(`🧪 Test mode enabled - using dummy ${analysisType} analysis`);
        // Parse the idea into product name and description
        const ideaParts = idea.split(':');
        const productName = ideaParts.length > 1 ? ideaParts[0].trim() : 'Product Idea';
        
        // Get dummy specialized analysis
        const dummyResult = await dummyDataService.getDummyAnalysis(productName, '', analysisType);
        
        return {
          success: true,
          data: {
            analysis: dummyResult.data.analysis,
            usage: dummyResult.data.usage,
            analysisType: analysisType,
            timestamp: new Date().toISOString(),
            testMode: true
          }
        };
      }

      // Production mode - use real Supabase/OpenAI
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { 
          success: false, 
          error: 'Please login to analyze ideas' 
        };
      }

      // Parse the idea into product name and description
      const ideaParts = idea.split(':');
      const productName = ideaParts.length > 1 ? ideaParts[0].trim() : 'Product Idea';
      const productDescription = ideaParts.length > 1 ? ideaParts[1].trim() : idea;

      // Call Supabase Edge Function for specialized analysis
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { 
          productName,
          productDescription,
          analysisType: analysisType,
          userId: session.user.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return { 
          success: false, 
          error: handleSupabaseError(error)
        };
      }

      return { 
        success: true, 
        data: {
          analysis: data.analysis.content,
          usage: data.usage,
          analysisType: analysisType,
          timestamp: data.analysis.createdAt,
          analysisId: data.analysis.id,
          testMode: false
        }
      };
    } catch (error) {
      console.error('Deep dive analysis error:', error);
      return { 
        success: false, 
        error: 'Deep dive analysis failed' 
      };
    }
  }

  // Get user's analysis history
  async getAnalysisHistory() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('product_analyses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return { 
          success: false, 
          error: handleSupabaseError(error)
        };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to load history' };
    }
  }

  // Health check
  async checkHealth() {
    try {
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1);

      return { 
        success: !error, 
        data: { 
          status: error ? 'Error' : 'OK',
          timestamp: new Date().toISOString(),
          service: 'Supabase'
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Supabase unavailable' 
      };
    }
  }
}

export default new ApiService();
