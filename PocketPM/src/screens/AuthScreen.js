// src/screens/AuthScreen.js
// Beautiful authentication screen with login and register

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Form transition animation
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLogin]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Floating Background Elements */}
      <View style={styles.floatingShape1} />
      <View style={styles.floatingShape2} />
      <View style={styles.floatingShape3} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.logoIcon}
                >
                  <Text style={styles.logoText}>PM</Text>
                </LinearGradient>
              </View>

              {/* Title */}
              <GradientText
                colors={['#ff6b6b', '#4ecdc4']}
                fontSize={24}
                fontWeight="700"
                style={styles.title}
              >
                {isLogin ? 'Welcome Back' : 'Join Pocket PM'}
              </GradientText>

              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Sign in to continue your product journey'
                  : 'Start building better products with AI'
                }
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: formAnim,
                }
              ]}
            >
              <BlurView intensity={20} tint="dark" style={styles.formBlur}>
                {/* Name Field (Register only) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry
                  />
                </View>

                {/* Confirm Password Field (Register only) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry
                    />
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#4ecdc4']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>
                      {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Toggle Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </Text>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={styles.toggleLink}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

            {/* Demo Account Info */}
            <Animated.View 
              style={[
                styles.demoContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.demoTitle}>Demo Account</Text>
              <Text style={styles.demoText}>
                Email: demo@pocketpm.com{'\n'}
                Password: demo123
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  // Floating background elements
  floatingShape1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 40,
  },
  floatingShape2: {
    position: 'absolute',
    top: '50%',
    right: '15%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderRadius: 12,
  },
  floatingShape3: {
    position: 'absolute',
    bottom: '25%',
    left: '20%',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(69, 183, 209, 0.08)',
    borderRadius: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(255, 107, 107, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 32,
  },
  formBlur: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  toggleLink: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '600',
  },
  demoContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  demoTitle: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
};

export default AuthScreen; 