import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import dummyDataService from '../services/dummyDataService';

const { width } = Dimensions.get('window');

export default function SettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();

    // Start entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

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

  const loadSettings = async () => {
    try {
      const isTestModeEnabled = await dummyDataService.isTestModeEnabled();
      setTestMode(isTestModeEnabled);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestModeToggle = async (value) => {
    try {
      await dummyDataService.setTestMode(value);
      setTestMode(value);
      
      Alert.alert(
        'Test Mode Updated',
        value 
          ? 'Test mode enabled. You\'ll now use dummy data instead of OpenAI API calls.' 
          : 'Test mode disabled. You\'ll now use real OpenAI API calls.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating test mode:', error);
      Alert.alert('Error', 'Failed to update test mode setting.');
    }
  };

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch', iconColor = '#4ecdc4' }) => (
    <BlurView intensity={15} tint="dark" style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: 'rgba(255,255,255,0.2)', true: iconColor + '40' }}
          thumbColor={value ? iconColor : 'rgba(255,255,255,0.6)'}
        />
      )}
    </BlurView>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <BlurView intensity={20} tint="dark" style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
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
                <Ionicons name="settings" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.logoText}>Settings</Text>
            </Animated.View>

            <View style={styles.headerRight} />
          </BlurView>

          {/* Main Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Settings Title */}
            <BlurView intensity={15} tint="dark" style={styles.titleContainer}>
              <MaskedView
                style={styles.titleMaskContainer}
                maskElement={
                  <Text style={styles.titleMask}>
                    App Settings
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.titleGradient}
                />
              </MaskedView>
              <Text style={styles.subtitle}>
                Customize your Pocket PM experience
              </Text>
            </BlurView>

            {/* Development Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Development</Text>
              <Text style={styles.sectionDescription}>
                Settings for development and testing
              </Text>

              <SettingItem
                icon="flask"
                title="Test Mode"
                description={testMode 
                  ? "Using dummy data - no OpenAI API calls" 
                  : "Using real OpenAI API - costs money"
                }
                value={testMode}
                onValueChange={handleTestModeToggle}
                iconColor="#feca57"
              />
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎨 Appearance</Text>
              <Text style={styles.sectionDescription}>
                Customize the app appearance
              </Text>

              <SettingItem
                icon="moon"
                title="Dark Mode"
                description={isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
                value={isDarkMode}
                onValueChange={toggleTheme}
                iconColor="#45b7d1"
              />
            </View>

            {/* Test Mode Info */}
            {testMode && (
              <BlurView intensity={15} tint="dark" style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="warning" size={20} color="#feca57" />
                  <Text style={styles.infoTitle}>Test Mode Active</Text>
                </View>
                <Text style={styles.infoDescription}>
                  All analysis requests will use dummy data. No OpenAI API calls will be made, so you won't be charged.
                  This is perfect for development and testing the app flow.
                </Text>
              </BlurView>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Pocket PM v1.0.0</Text>
              <Text style={styles.footerText}>
                Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
              </Text>
            </View>

          </ScrollView>
        </Animated.View>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Title
  titleContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    marginBottom: 32,
  },
  titleMaskContainer: {
    height: 36,
    marginBottom: 8,
  },
  titleMask: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  titleGradient: {
    flex: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 18,
  },
  // Info Card
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 87, 0.3)',
    marginBottom: 32,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    color: '#feca57',
    fontSize: 16,
    fontWeight: '600',
  },
  infoDescription: {
    color: 'rgba(254, 202, 87, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
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