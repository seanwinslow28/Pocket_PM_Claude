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
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmVhZGd1amNmbGd2cHNndHN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTIwODY5NiwiZXhwIjoyMDY0Nzg0Njk2fQ.bwQOu_a3ZJeF6nbgV4Vtoo8I7IyO_emuvEGOi2W52Bs', // TODO: Add your actual anon key
  
  // Error logging
  // TODO: Sign up at sentry.io and add your DSN
  SENTRY_DSN: 'https://c321cdd661a358f3149999daca884196@o4509544004648960.ingest.us.sentry.io/4509544014282752', // TODO: Add your Sentry DSN for error tracking
  
  // Feature flags
  USE_MOCK_DATA: false, // Use real backend API
  ENVIRONMENT: isDevelopment ? 'development' : 'production' // Proper environment detection
}; 