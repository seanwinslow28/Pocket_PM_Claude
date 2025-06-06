import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('dark_mode')
          .eq('id', user.id)
          .single();

        if (data) {
          setIsDarkMode(data.dark_mode || false);
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ dark_mode: newTheme })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    loading,
    colors: isDarkMode ? darkColors : lightColors,
    styles: isDarkMode ? darkStyles : lightStyles
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Color schemes
const lightColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#007AFF',
  secondary: '#6c757d',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  card: '#ffffff',
  input: '#ffffff',
  placeholder: '#999999',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
};

const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#1e88e5',
  secondary: '#b0b0b0',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  card: '#1e1e1e',
  input: '#2a2a2a',
  placeholder: '#808080',
  error: '#ff5252',
  success: '#4caf50',
  warning: '#ff9800',
};

// Style objects
const lightStyles = {
  container: { backgroundColor: lightColors.background },
  surface: { backgroundColor: lightColors.surface },
  text: { color: lightColors.text },
  textSecondary: { color: lightColors.textSecondary },
  input: { 
    backgroundColor: lightColors.input,
    borderColor: lightColors.border,
    color: lightColors.text
  },
  card: { 
    backgroundColor: lightColors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
};

const darkStyles = {
  container: { backgroundColor: darkColors.background },
  surface: { backgroundColor: darkColors.surface },
  text: { color: darkColors.text },
  textSecondary: { color: darkColors.textSecondary },
  input: { 
    backgroundColor: darkColors.input,
    borderColor: darkColors.border,
    color: darkColors.text
  },
  card: { 
    backgroundColor: darkColors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  }
}; 