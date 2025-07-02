// src/screens/SettingsScreen.js
// Comprehensive settings screen with profile management

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import { configManager } from '../../config';

const settingsData = [
  {
    section: 'Account',
    items: [
      { id: 'profile', title: 'Edit Profile', subtitle: 'Update your name and email', icon: '👤', type: 'action' },
      { id: 'subscription', title: 'Subscription', subtitle: 'Free Plan • Upgrade available', icon: '💎', type: 'action' },
      { id: 'usage', title: 'Usage Stats', subtitle: 'View your conversation history', icon: '📊', type: 'action' },
    ]
  },
  {
    section: 'Preferences',
    items: [
      { id: 'notifications', title: 'Push Notifications', subtitle: 'Get notified about updates', icon: '🔔', type: 'toggle', value: true },
      { id: 'analytics', title: 'Analytics', subtitle: 'Help improve the app', icon: '📈', type: 'toggle', value: false },
      { id: 'theme', title: 'Dark Mode', subtitle: 'Always on for optimal experience', icon: '🌙', type: 'toggle', value: true, disabled: true },
    ]
  },
  {
    section: 'Support',
    items: [
      { id: 'help', title: 'Help Center', subtitle: 'Get answers to common questions', icon: '❓', type: 'action' },
      { id: 'feedback', title: 'Send Feedback', subtitle: 'Share your thoughts with us', icon: '💬', type: 'action' },
      { id: 'contact', title: 'Contact Support', subtitle: 'Get help from our team', icon: '📧', type: 'action' },
    ]
  },
  {
    section: 'Developer',
    items: [
      { id: 'mockData', title: 'Use Mock Data', subtitle: 'Use dummy data instead of real API calls', icon: '🧪', type: 'toggle', value: true },
      { id: 'apiKey', title: 'OpenAI API Key', subtitle: 'Enter your API key for real responses', icon: '🔑', type: 'action' },
      { id: 'testConnection', title: 'Test API Connection', subtitle: 'Verify your API key works', icon: '🔗', type: 'action' },
    ]
  },
  {
    section: 'About',
    items: [
      { id: 'version', title: 'App Version', subtitle: '1.0.0 (Build 1)', icon: 'ℹ️', type: 'info' },
      { id: 'terms', title: 'Terms of Service', subtitle: 'Read our terms and conditions', icon: '📄', type: 'action' },
      { id: 'privacy', title: 'Privacy Policy', subtitle: 'Learn how we protect your data', icon: '🔒', type: 'action' },
    ]
  }
];

const SettingsScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [settings, setSettings] = useState(settingsData);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Load developer settings
    loadDeveloperSettings();
  }, []);

  const loadDeveloperSettings = async () => {
    try {
      const storedSettings = await configManager.getStoredSettings();
      const apiKey = configManager.getConfig().OPENAI_API_KEY;
      
      setCurrentApiKey(apiKey || '');
      
      // Update settings array with current values
      const newSettings = [...settings];
      const developerSection = newSettings.find(section => section.section === 'Developer');
      if (developerSection) {
        const mockDataItem = developerSection.items.find(item => item.id === 'mockData');
        if (mockDataItem) {
          mockDataItem.value = storedSettings.useMockData ?? true;
        }
        
        const apiKeyItem = developerSection.items.find(item => item.id === 'apiKey');
        if (apiKeyItem) {
          apiKeyItem.subtitle = apiKey ? '••••••••••••••••' : 'Enter your API key for real responses';
        }
      }
      setSettings(newSettings);
    } catch (error) {
      console.log('Error loading developer settings:', error);
    }
  };

  const handleToggle = async (sectionIndex, itemIndex, newValue) => {
    const newSettings = [...settings];
    newSettings[sectionIndex].items[itemIndex].value = newValue;
    setSettings(newSettings);
    
    const itemId = newSettings[sectionIndex].items[itemIndex].id;
    
    // Handle developer settings
    if (itemId === 'mockData') {
      await configManager.saveSetting('useMockData', newValue);
      console.log(`Mock data mode: ${newValue ? 'enabled' : 'disabled'}`);
    } else {
      console.log(`Toggle ${itemId}: ${newValue}`);
    }
  };

  const handleActionPress = async (item) => {
    switch (item.id) {
      case 'profile':
        Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
        break;
      case 'subscription':
        Alert.alert(
          'Upgrade to Pro',
          'Get unlimited conversations, priority support, and advanced features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => console.log('Navigate to subscription') }
          ]
        );
        break;
      case 'usage':
        Alert.alert('Usage Stats', `Total conversations: 12\nThis month: 5\nAverage per week: 2`);
        break;
      case 'help':
        Alert.alert('Help Center', 'Opening help documentation...');
        break;
      case 'feedback':
        Alert.alert('Send Feedback', 'Thank you for helping us improve Pocket PM!');
        break;
      case 'contact':
        Alert.alert('Contact Support', 'Email: support@pocketpm.com\nResponse time: 24 hours');
        break;
      case 'terms':
        Alert.alert('Terms of Service', 'Opening terms and conditions...');
        break;
      case 'privacy':
        Alert.alert('Privacy Policy', 'Opening privacy policy...');
        break;
      case 'apiKey':
        setTempApiKey(currentApiKey);
        setApiKeyModalVisible(true);
        break;
      case 'testConnection':
        await testApiConnection();
        break;
      default:
        console.log(`Action pressed: ${item.id}`);
    }
  };

  const saveApiKey = async () => {
    try {
      await configManager.saveSetting('openAiApiKey', tempApiKey);
      setCurrentApiKey(tempApiKey);
      setApiKeyModalVisible(false);
      
      // Update the subtitle in settings
      await loadDeveloperSettings();
      
      Alert.alert(
        'API Key Saved',
        tempApiKey ? 'Your OpenAI API key has been saved successfully.' : 'API key has been removed.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

  const testApiConnection = async () => {
    const apiKey = configManager.getConfig().OPENAI_API_KEY;
    
    if (!apiKey) {
      Alert.alert('No API Key', 'Please enter your OpenAI API key first.');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        Alert.alert('✅ Connection Successful', 'Your OpenAI API key is working correctly!');
      } else {
        const errorData = await response.json();
        Alert.alert('❌ Connection Failed', `API Error: ${errorData.error?.message || 'Invalid API key'}`);
      }
    } catch (error) {
      Alert.alert('❌ Connection Failed', 'Could not connect to OpenAI. Please check your internet connection.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const renderSettingItem = (item, sectionIndex, itemIndex) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={() => item.type === 'action' ? handleActionPress(item) : null}
        disabled={item.type === 'info' || item.disabled}
      >
        <View style={styles.settingIcon}>
          <Text style={styles.settingEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.settingAction}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={(newValue) => handleToggle(sectionIndex, itemIndex, newValue)}
              trackColor={{ false: '#767577', true: '#4ecdc4' }}
              thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
              disabled={item.disabled}
            />
          )}
          {item.type === 'action' && (
            <Text style={styles.actionArrow}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
          <GradientText
            colors={['#ff6b6b', '#4ecdc4']}
            fontSize={24}
            fontWeight="700"
            style={styles.title}
          >
            Settings
          </GradientText>
        </Animated.View>

        {/* User Profile Card */}
        <Animated.View 
          style={[
            styles.profileContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <LinearGradient
                colors={['#ff6b6b', '#4ecdc4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.profilePlan}>Free Plan • Member since {new Date(user?.joinedAt || Date.now()).getFullYear()}</Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView 
            style={styles.settingsList}
            showsVerticalScrollIndicator={false}
          >
            {settings.map((section, sectionIndex) => (
              <View key={section.section} style={styles.settingSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
                <BlurView intensity={15} tint="dark" style={styles.sectionCard}>
                  {section.items.map((item, itemIndex) => 
                    renderSettingItem(item, sectionIndex, itemIndex)
                  )}
                </BlurView>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View 
          style={[
            styles.logoutContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* API Key Modal */}
      <Modal
        visible={apiKeyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setApiKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>OpenAI API Key</Text>
              <Text style={styles.modalSubtitle}>
                Enter your OpenAI API key to use real AI responses instead of mock data.
              </Text>
              
              <TextInput
                style={styles.apiKeyInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="sk-..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setApiKeyModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveApiKey}
                >
                  <LinearGradient
                    colors={['#4ecdc4', '#45b7d1']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 4,
  },
  profileContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileAvatar: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  profilePlan: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingsList: {
    flex: 1,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  settingAction: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
  },
  actionArrow: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 20,
    fontWeight: '300',
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  apiKeyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default SettingsScreen; 