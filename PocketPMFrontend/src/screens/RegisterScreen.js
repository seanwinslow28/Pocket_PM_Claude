import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [errors, setErrors] = useState({});

  const { signUp, loading } = useAuth();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setSnackbar({ visible: true, message: 'Please fix the errors above' });
      return;
    }

    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        {
          full_name: formData.name,
          name: formData.name, // For backward compatibility
        }
      );
      
      if (error) {
        if (error.message.includes('already registered')) {
          setSnackbar({ 
            visible: true, 
            message: 'This email is already registered. Please sign in instead.' 
          });
        } else {
          setSnackbar({ 
            visible: true, 
            message: error.message || 'Registration failed. Please try again.' 
          });
        }
      } else {
        setSnackbar({ 
          visible: true, 
          message: 'Account created successfully! 🎉 Please check your email to verify your account.' 
        });
        // Navigation will happen automatically when auth state changes
        // OR redirect to login if email confirmation is required
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'An unexpected error occurred. Please try again.' 
      });
      console.error('Registration error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#EC4899']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={1000}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🚀 Join Pocket PM</Text>
              <Text style={styles.headerSubtitle}>
                Start analyzing your product ideas with AI
              </Text>
            </View>
          </Animatable.View>

          {/* Register Card */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.cardTitle}>Create Account</Title>
                <Paragraph style={styles.cardSubtitle}>
                  Get started with AI-powered product analysis
                </Paragraph>

                <View style={styles.form}>
                  <TextInput
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(value) => updateField('name', value)}
                    mode="outlined"
                    style={styles.input}
                    disabled={loading}
                    error={!!errors.name}
                  />
                  <HelperText type="error" visible={!!errors.name}>
                    {errors.name}
                  </HelperText>

                  <TextInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    disabled={loading}
                    error={!!errors.email}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    disabled={loading}
                    error={!!errors.password}
                  />
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password}
                  </HelperText>

                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    disabled={loading}
                    error={!!errors.confirmPassword}
                  />
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword}
                  </HelperText>

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.registerButton}
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>or</Text>
                  </View>

                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginButton}
                    disabled={loading}
                  >
                    Already have an account? Sign In
                  </Button>
                </View>

                <View style={styles.features}>
                  <Text style={styles.featuresTitle}>What you'll get:</Text>
                  <Text style={styles.featureItem}>✨ AI-powered product analysis</Text>
                  <Text style={styles.featureItem}>📊 Market insights and validation</Text>
                  <Text style={styles.featureItem}>🎯 Competitive analysis</Text>
                  <Text style={styles.featureItem}>💡 Go-to-market strategies</Text>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
      >
        {snackbar.message}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 30,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardSubtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F8FAFC',
  },
  registerButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
    borderColor: '#6366F1',
  },
  features: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 12,
  },
  featureItem: {
    color: '#0369A1',
    fontSize: 14,
    marginBottom: 6,
  },
});