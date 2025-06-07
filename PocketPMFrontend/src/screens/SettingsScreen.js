import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import dummyDataService from '../services/dummyDataService';

export default function SettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
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

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch' }) => (
    <View style={[styles.settingItem, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={[styles.settingTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            {description}
          </Text>
        </View>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e5e7eb', true: colors.primary + '30' }}
          thumbColor={value ? colors.primary : '#9ca3af'}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDarkMode ? colors.text : '#111827' }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.text : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Development Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
            🧪 Development
          </Text>
          <Text style={[styles.sectionDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
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
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
            🎨 Appearance
          </Text>
          <Text style={[styles.sectionDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Customize the app appearance
          </Text>

          <SettingItem
            icon="moon"
            title="Dark Mode"
            description={isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
            value={isDarkMode}
            onValueChange={toggleTheme}
          />
        </View>

        {/* Test Mode Info */}
        {testMode && (
          <View style={[styles.infoCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text style={[styles.infoTitle, { color: '#92400e' }]}>Test Mode Active</Text>
            </View>
            <Text style={[styles.infoDescription, { color: '#92400e' }]}>
              All analysis requests will use dummy data. No OpenAI API calls will be made, so you won't be charged.
              This is perfect for development and testing the app flow.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Pocket PM v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'System',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  heart: {
    color: '#ef4444',
  },
}); 