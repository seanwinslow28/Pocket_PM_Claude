// Simple API service for Pocket PM
const API_BASE_URL = 'http://localhost:3001/api'; // Your existing backend

class ApiService {
  // Test the API connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.log('API connection test failed:', error);
      return false;
    }
  }

  // Analyze an idea using your existing backend
  async analyzeIdea(idea) {
    try {
      // Validate input
      if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return {
          success: false,
          error: 'Please provide a valid idea description'
        };
      }

      // For now, let's use a simple mock response to test the UI
      // You can uncomment the real API call below when ready
      
      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      return {
        success: true,
        data: {
          analysis: `Great idea! Here's a quick analysis of "${idea}":\n\n• Market Opportunity: This addresses a real need in the market\n• Target Users: Professionals and businesses looking for efficiency\n• Key Benefits: Saves time, improves productivity\n• Next Steps: Validate with potential users and build an MVP\n\nThis is a promising concept worth exploring further!`,
          timestamp: new Date().toISOString()
        }
      };

      // Real API call (uncomment when ready to test with your backend)
      /*
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Server error: ${response.status}`
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
      */
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze idea. Please check your connection and try again.'
      };
    }
  }

  // User authentication (simplified for now)
  async login(email, password) {
    try {
      // Mock login for testing
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
    } catch (error) {
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      // Mock registration for testing
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
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }
}

export default new ApiService(); 