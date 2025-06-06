import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await signIn(email.trim(), password);
      
      if (error) {
        Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
      }
      // Success navigation will happen automatically due to auth state change
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    }
  };

  const isButtonDisabled = !email.trim() || !password.trim() || loading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={800} delay={200}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Ionicons name="create" size={32} color="#ffffff" />
                  <View style={styles.sparkles}>
                    <Ionicons name="sparkles" size={16} color="#ffffff" />
                  </View>
                </View>
              </View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Pocket PM</Text>
              <Text style={[styles.headerSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                From Idea → Execution → Launch
              </Text>
            </View>
          </Animatable.View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Welcome Card */}
            <Animatable.View animation="fadeInUp" duration={800} delay={400}>
              <View style={[styles.welcomeCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
                <Text style={[styles.welcomeTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Welcome Back</Text>
                <Text style={[styles.welcomeSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                  Sign in to analyze your next big idea
                </Text>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#333333' }]}>Email</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDarkMode ? colors.input : '#ffffff',
                          borderColor: isDarkMode ? colors.border : '#d1d5db',
                          color: isDarkMode ? colors.text : '#333333'
                        }
                      ]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#333333' }]}>Password</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDarkMode ? colors.input : '#ffffff',
                          borderColor: isDarkMode ? colors.border : '#d1d5db',
                          color: isDarkMode ? colors.text : '#333333'
                        }
                      ]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      {
                        opacity: isButtonDisabled ? 0.5 : 1,
                        backgroundColor: isButtonDisabled ? '#fca5a5' : '#f87171'
                      }
                    ]}
                    onPress={handleLogin}
                    disabled={isButtonDisabled}
                    activeOpacity={isButtonDisabled ? 1 : 0.8}
                  >
                    {loading ? (
                      <>
                        <Ionicons name="refresh" size={20} color="#ffffff" style={styles.rotating} />
                        <Text style={styles.loginButtonText}>Signing In...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="log-in" size={20} color="#ffffff" />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]} />
                    <Text style={[styles.dividerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>or</Text>
                    <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]} />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      {
                        borderColor: isDarkMode ? colors.border : '#d1d5db',
                        backgroundColor: isDarkMode ? 'transparent' : '#ffffff'
                      }
                    ]}
                    onPress={() => navigation.navigate('Register')}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add" size={20} color={isDarkMode ? colors.text : '#374151'} />
                    <Text style={[styles.registerButtonText, { color: isDarkMode ? colors.text : '#374151' }]}>
                      Create New Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animatable.View>

            {/* Demo Info */}
            <Animatable.View animation="fadeInUp" duration={800} delay={600}>
              <View style={[styles.demoCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
                <View style={styles.demoHeader}>
                  <Ionicons name="information-circle" size={20} color="#ef4444" />
                  <Text style={[styles.demoTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Demo Account</Text>
                </View>
                <Text style={[styles.demoText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                  Create a real account to get started with Supabase authentication and save your analyses.
                </Text>
              </View>
            </Animatable.View>
          </View>

          {/* Footer */}
          <Animatable.View animation="fadeIn" duration={800} delay={800}>
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Powered by OpenAI • Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24, // 1.5rem
    paddingVertical: 48, // 3rem
  },
  header: {
    alignItems: 'center',
    marginBottom: 64, // 4rem
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24, // 1.5rem
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkles: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  headerTitle: {
    fontSize: 32, // 2rem
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16, // 1rem
    fontWeight: '400',
    fontFamily: 'System',
    textAlign: 'center',
  },
  mainContent: {
    maxWidth: 400, // Smaller than main screens for login focus
    width: '100%',
    alignSelf: 'center',
  },
  welcomeCard: {
    padding: 32, // 2rem
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 28, // 1.75rem
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16, // 1rem
    fontWeight: '400',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 32, // 2rem
  },
  form: {
    gap: 24, // 1.5rem
  },
  inputGroup: {
    gap: 8, // 0.5rem
  },
  inputLabel: {
    fontSize: 16, // 1rem
    fontWeight: '600',
    fontFamily: 'System',
  },
  textInput: {
    padding: 16, // 1rem
    fontSize: 16, // 1rem
    borderWidth: 1,
    borderRadius: 12, // 0.75rem
    fontFamily: 'System',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 24, // 1.5rem
    borderRadius: 12, // 0.75rem
    marginTop: 8,
  },
  rotating: {
    // Add rotation animation here if needed
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18, // 1.125rem
    fontWeight: '600',
    fontFamily: 'System',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14, // 0.875rem
    fontFamily: 'System',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 24, // 1.5rem
    borderRadius: 12, // 0.75rem
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 16, // 1rem
    fontWeight: '500',
    fontFamily: 'System',
  },
  demoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 0.5rem
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16, // 1rem
    fontWeight: '600',
    fontFamily: 'System',
  },
  demoText: {
    fontSize: 14, // 0.875rem
    fontFamily: 'System',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32, // 2rem
  },
  footerText: {
    fontSize: 14, // 0.875rem
    textAlign: 'center',
    fontFamily: 'System',
  },
  heart: {
    color: '#ef4444',
  },
});