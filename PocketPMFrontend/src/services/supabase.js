import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://qdveadgujcflgvpsgtsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmVhZGd1amNmbGd2cHNndHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDg2OTYsImV4cCI6MjA2NDc4NDY5Nn0.GJI3flF8IQ3m1IEfsuFTfYR8BUKoyQ3bH06GDJ3waY0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};