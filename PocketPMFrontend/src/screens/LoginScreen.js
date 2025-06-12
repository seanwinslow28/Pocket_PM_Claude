import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();
  
  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Logo glow animation
    const logoAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    logoAnimation.start();

    // Floating shapes animation
    floatingShapes.forEach((anim, index) => {
      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      );
      setTimeout(() => floatingAnimation.start(), index * 2000);
    });

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
    };
  }, []);

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
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Floating Background Elements */}
      {floatingShapes.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingShape,
            {
              transform: [{
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }, {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              }],
            },
            index === 0 && styles.floatingShape1,
            index === 1 && styles.floatingShape2,
            index === 2 && styles.floatingShape3,
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header with Logo */}
          <View style={styles.header}>
            <Animated.View style={[
              styles.logo,
              {
                shadowColor: logoGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(78, 205, 196, 0.5)', 'rgba(255, 107, 107, 0.8)'],
                }),
              }
            ]}>
              <LinearGradient
                colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.logoIcon}
              >
                <Text style={styles.logoIconText}>PM</Text>
              </LinearGradient>
              <Text style={styles.logoText}>Pocket PM</Text>
            </Animated.View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Welcome Section */}
            <View style={styles.welcomeContainer}>
              <MaskedView
                style={styles.welcomeTitleContainer}
                maskElement={
                  <Text style={styles.welcomeTitleMask}>
                    Welcome Back
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.welcomeTitleGradient}
                />
              </MaskedView>
              <Text style={styles.welcomeSubtitle}>
                Sign in to analyze your next big idea
              </Text>
            </View>

            {/* Login Form */}
            <BlurView intensity={20} tint="dark" style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <BlurView intensity={10} tint="dark" style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </BlurView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <BlurView intensity={10} tint="dark" style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry
                      editable={!loading}
                    />
                  </BlurView>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { opacity: isButtonDisabled ? 0.5 : 1 }]}
                  onPress={handleLogin}
                  disabled={isButtonDisabled}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#4ecdc4']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.loginButtonGradient}
                  >
                    {loading ? (
                      <>
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.loginButtonText}>Signing In...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="log-in" size={20} color="white" />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                >
                  <BlurView intensity={15} tint="dark" style={styles.registerButtonBlur}>
                    <Ionicons name="person-add" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.registerButtonText}>Create New Account</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Demo Info */}
            <BlurView intensity={15} tint="dark" style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={20} color="#4ecdc4" />
                <Text style={styles.demoTitle}>Demo Account</Text>
              </View>
              <Text style={styles.demoText}>
                Create a real account to get started with Supabase authentication and save your analyses.
              </Text>
            </BlurView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by OpenAI • Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Floating background elements
  floatingShape: {
    position: 'absolute',
    opacity: 0.1,
  },
  floatingShape1: {
    top: '15%',
    left: '10%',
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
  },
  floatingShape2: {
    top: '60%',
    right: '15%',
    width: 40,
    height: 40,
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
  },
  floatingShape3: {
    bottom: '20%',
    left: '20%',
    width: 80,
    height: 80,
    backgroundColor: '#45b7d1',
    borderRadius: 40,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Main Content
  mainContent: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitleContainer: {
    height: 40,
    marginBottom: 8,
  },
  welcomeTitleMask: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  welcomeTitleGradient: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Form
  formContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  textInput: {
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  registerButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  // Demo Card
  demoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  demoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  heart: {
    color: '#ff6b6b',
  },
};