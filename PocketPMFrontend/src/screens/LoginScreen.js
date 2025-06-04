import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbar({ visible: true, message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.login({ email, password });
      
      if (result.success) {
        setSnackbar({ visible: true, message: 'Welcome back! 🎉' });
        // Navigation will happen automatically due to auth state change
        setTimeout(() => {
          // Force a refresh of auth state if needed
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }, 1000);
      } else {
        setSnackbar({ visible: true, message: result.error });
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
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
              <Text style={styles.headerTitle}>🚀 Pocket PM</Text>
              <Text style={styles.headerSubtitle}>
                AI-Powered Product Analysis
              </Text>
            </View>
          </Animatable.View>

          {/* Login Card */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.cardTitle}>Welcome Back</Title>
                <Paragraph style={styles.cardSubtitle}>
                  Sign in to analyze your next big idea
                </Paragraph>

                <View style={styles.form}>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    disabled={loading}
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    disabled={loading}
                  />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.loginButton}
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>or</Text>
                  </View>

                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.registerButton}
                    disabled={loading}
                  >
                    Create New Account
                  </Button>
                </View>

                <View style={styles.demoInfo}>
                  <Text style={styles.demoText}>
                    💡 Demo: Use any email and password to get started
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeIn" duration={1000} delay={600}>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Built with ❤️ for Product Managers
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
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
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
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
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  loginButton: {
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
  registerButton: {
    borderRadius: 12,
    borderColor: '#6366F1',
  },
  demoInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  demoText: {
    color: '#4338CA',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#E2E8F0',
    fontSize: 14,
  },
});
