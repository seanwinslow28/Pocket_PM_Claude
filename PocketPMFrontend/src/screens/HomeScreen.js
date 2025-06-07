import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import dummyDataService from '../services/dummyDataService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const [idea, setIdea] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    loadUserData();
    loadRecentAnalyses();
    loadTestMode();
  }, []);

  const loadUserData = async () => {
    const userData = await ApiService.getCurrentUser();
    setUser(userData);
  };

  const loadRecentAnalyses = async () => {
    const history = await StorageService.getAnalysisHistory();
    setRecentAnalyses(history.slice(0, 3));
  };

  const loadTestMode = async () => {
    try {
      const isTestModeEnabled = await dummyDataService.isTestModeEnabled();
      setTestMode(isTestModeEnabled);
    } catch (error) {
      console.error('Error loading test mode:', error);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAnalyses();
    await loadTestMode();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      return;
    }

    // Navigate to loading screen with the idea
    navigation.navigate('Loading', { 
      idea: idea.trim(),
    });
  };

  const isButtonDisabled = !idea.trim();

  const SettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <TouchableOpacity onPress={() => setShowSettingsModal(false)} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={isDarkMode ? colors.text : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Modal Content */}
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Development Section */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
              🧪 Development
            </Text>
            <Text style={[styles.modalSectionDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
              Settings for development and testing
            </Text>

            <View style={[styles.settingItem, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="flask" size={24} color={colors.primary} />
                </View>
                <View style={styles.settingItemText}>
                  <Text style={[styles.settingTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    Test Mode
                  </Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    {testMode 
                      ? "Using dummy data - no OpenAI API calls" 
                      : "Using real OpenAI API - costs money"
                    }
                  </Text>
                </View>
              </View>
              <Switch
                value={testMode}
                onValueChange={handleTestModeToggle}
                trackColor={{ false: '#e5e7eb', true: colors.primary + '30' }}
                thumbColor={testMode ? colors.primary : '#9ca3af'}
              />
            </View>
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
          <View style={styles.modalFooter}>
            <Text style={[styles.modalFooterText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
              Pocket PM v1.0.0
            </Text>
            <Text style={[styles.modalFooterText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
              Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="create" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Pocket PM</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                From Idea → Analysis → Launch
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]} activeOpacity={0.7}>
              <Ionicons name="time-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]} 
              onPress={() => setShowSettingsModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Progress Steps */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.progressSteps}>
              {/* Idea Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive]}>
                  <Ionicons name="bulb" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Idea</Text>
              </View>

              {/* Analysis Step - Inactive */}
              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name="analytics" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Analysis</Text>
              </View>

              {/* Launch Step - Inactive */}
              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Form Container */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Share Your Idea</Text>
              <Text style={[styles.formSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Tell us about your product vision and we'll provide comprehensive AI analysis to help bring it to life.
              </Text>
              
              <View style={styles.form}>
                <TextInput
                  style={[
                    styles.ideaTextarea, 
                    { 
                      backgroundColor: isDarkMode ? colors.input : '#ffffff',
                      borderColor: isDarkMode ? colors.border : '#d1d5db',
                      color: isDarkMode ? colors.text : '#333333'
                    }
                  ]}
                  value={idea}
                  onChangeText={setIdea}
                  placeholder="Describe your product idea in detail... What problem does it solve? Who is it for? What makes it unique?"
                  placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    {
                      opacity: isButtonDisabled ? 0.5 : 1,
                      backgroundColor: isButtonDisabled ? '#fca5a5' : '#f87171'
                    }
                  ]}
                  onPress={handleAnalyze}
                  disabled={isButtonDisabled}
                  activeOpacity={isButtonDisabled ? 1 : 0.8}
                >
                  <Ionicons name="sparkles" size={20} color="#ffffff" />
                  <Text style={styles.analyzeButtonText}>Analyze My Idea</Text>
                </TouchableOpacity>
              </View>

              {/* Example Ideas */}
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: isDarkMode ? colors.text : '#111827' }]}>💡 Need inspiration?</Text>
                <View style={styles.examplesList}>
                  <TouchableOpacity 
                    style={[styles.exampleChip, { backgroundColor: isDarkMode ? colors.surface : '#f3f4f6' }]}
                    onPress={() => setIdea("A mobile app that helps people find and book local fitness classes")}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.exampleText, { color: isDarkMode ? colors.text : '#374151' }]}>Fitness class finder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.exampleChip, { backgroundColor: isDarkMode ? colors.surface : '#f3f4f6' }]}
                    onPress={() => setIdea("An AI-powered meal planning service that reduces food waste")}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.exampleText, { color: isDarkMode ? colors.text : '#374151' }]}>Smart meal planner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.exampleChip, { backgroundColor: isDarkMode ? colors.surface : '#f3f4f6' }]}
                    onPress={() => setIdea("A platform connecting remote workers with local coffee shops for workspace")}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.exampleText, { color: isDarkMode ? colors.text : '#374151' }]}>Remote workspace finder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animatable.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Powered by OpenAI • Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
          </Text>
        </View>
      </ScrollView>

      <SettingsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, // 1.5rem
    paddingVertical: 16, // 1rem
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#ef4444',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkles: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24, // 1.5rem
    fontWeight: '700',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14, // 0.875rem
    fontWeight: '400',
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    maxWidth: 1024, // 64rem
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24, // 1.5rem
    paddingVertical: 48, // 3rem
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32, // 2rem
    marginBottom: 64, // 4rem
  },
  step: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  stepActive: {
    // Active step styling
  },
  stepIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#9ca3af',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconActive: {
    backgroundColor: '#ef4444',
  },
  stepLabel: {
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'System',
  },
  stepLabelActive: {
    color: '#111827',
  },
  formContainer: {
    maxWidth: 512, // 32rem
    width: '100%',
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 30, // 1.875rem
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16, // 1rem
    fontFamily: 'System',
  },
  formSubtitle: {
    fontSize: 16, // 1rem
    textAlign: 'center',
    marginBottom: 32, // 2rem
    fontFamily: 'System',
    lineHeight: 24,
  },
  form: {
    flexDirection: 'column',
    gap: 24, // 1.5rem
  },
  ideaTextarea: {
    minHeight: 200,
    padding: 12, // 0.75rem
    fontSize: 16, // 1rem
    borderWidth: 1,
    borderRadius: 6, // 0.375rem
    fontFamily: 'System',
    lineHeight: 22,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    borderRadius: 12, // 0.75rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 16, // 1rem
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 18, // 1.125rem
    fontWeight: '500',
    fontFamily: 'System',
  },
  examplesContainer: {
    marginTop: 40, // 2.5rem
  },
  examplesTitle: {
    fontSize: 18, // 1.125rem
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16, // 1rem
    fontFamily: 'System',
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12, // 0.75rem
  },
  exampleChip: {
    paddingVertical: 8, // 0.5rem
    paddingHorizontal: 16, // 1rem
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exampleText: {
    fontSize: 14, // 0.875rem
    fontWeight: '500',
    fontFamily: 'System',
  },
  footer: {
    textAlign: 'center',
    paddingVertical: 32, // 2rem
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
  heart: {
    color: '#ef4444',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    padding: 24,
  },
  modalSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalSectionDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItemText: {
    flexDirection: 'column',
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  infoCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 12,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  modalFooter: {
    padding: 16,
    alignItems: 'center',
  },
  modalFooterText: {
    fontSize: 14,
    fontWeight: '400',
  },
  headerSpacer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
});
