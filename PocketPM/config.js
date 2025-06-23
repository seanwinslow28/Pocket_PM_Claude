// Configuration for different environments
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export const config = {
  // API Configuration
  API_BASE_URL: isDevelopment 
    ? 'http://192.168.1.156:3001/api' // Local development - use IP for mobile device
    : 'https://qdveadgujcflgvpsgtsx.supabase.co/functions/v1', // Production Supabase Functions
  
  // Supabase Configuration
  // TODO: Replace with your actual values from Supabase Dashboard → Settings → API
  SUPABASE_URL: 'https://qdveadgujcflgvpsgtsx.supabase.co',
  SUPABASE_ANON_KEY: 
  
  // Error logging
  // TODO: Sign up at sentry.io and add your DSN
  SENTRY_DSN: 
  
  // Feature flags
  USE_MOCK_DATA: false, // Use real backend API
  ENVIRONMENT: isDevelopment ? 'development' : 'production' // Proper environment detection
}; 
