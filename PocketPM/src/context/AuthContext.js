// src/context/AuthContext.js
// Complete authentication context with persistent storage

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/aiService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Initialize app - check for existing auth and onboarding status
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Check if user has seen onboarding
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      if (onboardingStatus) {
        setHasSeenOnboarding(true);
      }

      // Check for existing user session
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Use your existing API service
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        const userData = {
          id: Date.now().toString(),
          email: response.user.email,
          name: response.user.name,
          joinedAt: new Date().toISOString(),
          subscription: 'free', // Can be 'free', 'pro', 'enterprise'
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Use your existing API service
      const response = await ApiService.register(userData);
      
      if (response.success) {
        const newUser = {
          id: Date.now().toString(),
          email: response.user.email,
          name: response.user.name,
          joinedAt: new Date().toISOString(),
          subscription: 'free',
        };
        
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      setHasSeenOnboarding(true);
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value = {
    user,
    loading,
    hasSeenOnboarding,
    login,
    register,
    logout,
    completeOnboarding,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 