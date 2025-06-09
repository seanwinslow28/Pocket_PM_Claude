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
  const [showWritingTips, setShowWritingTips] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Input validation and helper functions
  const getCharacterCount = () => idea.length;
  const getWordCount = () => idea.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isIdeaTooShort = () => idea.trim().length < 20;
  const isIdeaTooLong = () => idea.length > 1000;
  const hasGoodLength = () => idea.trim().length >= 50 && idea.length <= 500;

  const getInputValidation = () => {
    if (idea.trim().length === 0) return { type: 'empty', message: 'Tell us about your product idea' };
    if (isIdeaTooShort()) return { type: 'warning', message: 'Add more details for better analysis' };
    if (isIdeaTooLong()) return { type: 'error', message: 'Please keep it under 1000 characters' };
    if (hasGoodLength()) return { type: 'success', message: 'Perfect! Ready for analysis' };
    return { type: 'info', message: 'Looking good, add more details if needed' };
  };

  const validation = getInputValidation();

  // Enhanced example ideas with better variety
  const exampleIdeas = [
    {
      category: '🏃‍♀️ Health & Fitness',
      text: "A mobile app that helps people find and book local fitness classes with real-time availability, instructor ratings, and flexible payment options",
      short: "Fitness class finder"
    },
    {
      category: '🍽️ Food & Sustainability', 
      text: "An AI-powered meal planning service that creates personalized weekly menus based on dietary preferences, reduces food waste by optimizing portions, and connects users with local farmers",
      short: "Smart meal planner"
    },
    {
      category: '💼 Remote Work',
      text: "A platform connecting remote workers with local coffee shops, co-working spaces, and quiet venues, featuring wifi speed tests, noise levels, and booking capabilities",
      short: "Remote workspace finder"
    },
    {
      category: '🎓 Education',
      text: "An interactive learning platform that uses gamification and AI to help adults learn new skills through bite-sized lessons, peer collaboration, and real-world projects",
      short: "Adult skill learning"
    },
    {
      category: '🏠 Home Services',
      text: "A marketplace for trusted local service providers (cleaning, repairs, gardening) with instant booking, transparent pricing, and quality guarantees",
      short: "Home services marketplace"
    },
    {
      category: '💰 Financial Planning',
      text: "A personal finance app that helps young adults build wealth through automated savings, investment education, and goal-based financial planning with social features",
      short: "Youth wealth builder"
    }
  ];

  const getRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * exampleIdeas.length);
    return exampleIdeas[randomIndex];
  };

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
    if (!idea.trim() || isIdeaTooLong()) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Small delay for better UX 
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to loading screen with the idea
      navigation.navigate('Loading', { 
        idea: idea.trim(),
      });
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isButtonDisabled = !idea.trim() || isIdeaTooLong() || isAnalyzing;

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
                {/* Input Header */}
                <View style={styles.inputHeader}>
                  <View style={styles.inputHeaderLeft}>
                    <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#111827' }]}>
                      Your Product Idea
                    </Text>
                    <TouchableOpacity 
                      style={styles.tipsButton}
                      onPress={() => setShowWritingTips(!showWritingTips)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="help-circle-outline" size={16} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
                      <Text style={[styles.tipsButtonText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        Writing tips
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputHeaderRight}>
                    <Text style={[
                      styles.characterCount, 
                      { 
                        color: isIdeaTooLong() ? '#ef4444' : 
                               hasGoodLength() ? '#22c55e' : 
                               isDarkMode ? colors.textSecondary : '#6b7280'
                      }
                    ]}>
                      {getCharacterCount()}/1000
                    </Text>
                  </View>
                </View>

                {/* Writing Tips (collapsible) */}
                {showWritingTips && (
                  <Animatable.View 
                    animation="fadeInDown" 
                    duration={300}
                    style={[styles.writingTips, { backgroundColor: isDarkMode ? colors.surface : '#f8fafc', borderColor: isDarkMode ? colors.border : '#e2e8f0' }]}
                  >
                    <Text style={[styles.writingTipsTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                      ✨ How to write a great idea description:
                    </Text>
                    <View style={styles.tipsList}>
                      <Text style={[styles.tipItem, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        • <Text style={styles.tipBold}>Problem:</Text> What issue does it solve?
                      </Text>
                      <Text style={[styles.tipItem, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        • <Text style={styles.tipBold}>Solution:</Text> How does your idea solve it?
                      </Text>
                      <Text style={[styles.tipItem, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        • <Text style={styles.tipBold}>Target:</Text> Who is this for?
                      </Text>
                      <Text style={[styles.tipItem, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        • <Text style={styles.tipBold}>Unique:</Text> What makes it different?
                      </Text>
                    </View>
                  </Animatable.View>
                )}

                {/* Text Input */}
                <TextInput
                  style={[
                    styles.ideaTextarea, 
                    { 
                      backgroundColor: isDarkMode ? colors.input : '#ffffff',
                      borderColor: validation.type === 'error' ? '#ef4444' : 
                                   validation.type === 'success' ? '#22c55e' :
                                   validation.type === 'warning' ? '#f59e0b' :
                                   isDarkMode ? colors.border : '#d1d5db',
                      color: isDarkMode ? colors.text : '#333333',
                      borderWidth: 2,
                    }
                  ]}
                  value={idea}
                  onChangeText={setIdea}
                  placeholder="Describe your product idea in detail... What problem does it solve? Who is it for? What makes it unique?"
                  placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />

                {/* Input Validation Message */}
                <View style={styles.validationContainer}>
                  <View style={styles.validationLeft}>
                    <Ionicons 
                      name={
                        validation.type === 'success' ? 'checkmark-circle' :
                        validation.type === 'error' ? 'close-circle' :
                        validation.type === 'warning' ? 'warning' :
                        'information-circle'
                      } 
                      size={16} 
                      color={
                        validation.type === 'success' ? '#22c55e' :
                        validation.type === 'error' ? '#ef4444' :
                        validation.type === 'warning' ? '#f59e0b' :
                        isDarkMode ? colors.textSecondary : '#6b7280'
                      } 
                    />
                    <Text style={[
                      styles.validationMessage,
                      { 
                        color: validation.type === 'success' ? '#22c55e' :
                               validation.type === 'error' ? '#ef4444' :
                               validation.type === 'warning' ? '#f59e0b' :
                               isDarkMode ? colors.textSecondary : '#6b7280'
                      }
                    ]}>
                      {validation.message}
                    </Text>
                  </View>
                  {idea.trim().length > 0 && (
                    <Text style={[styles.wordCount, { color: isDarkMode ? colors.textSecondary : '#9ca3af' }]}>
                      {getWordCount()} words
                    </Text>
                  )}
                </View>

                {/* Enhanced Analyze Button */}
                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    {
                      opacity: isButtonDisabled ? 0.6 : 1,
                      backgroundColor: validation.type === 'success' ? '#22c55e' :
                                       isIdeaTooLong() ? '#ef4444' : 
                                       isAnalyzing ? '#f59e0b' : '#f87171'
                    }
                  ]}
                  onPress={handleAnalyze}
                  disabled={isButtonDisabled}
                  activeOpacity={isButtonDisabled ? 1 : 0.8}
                >
                  {isAnalyzing ? (
                    <>
                      <Ionicons name="hourglass" size={20} color="#ffffff" />
                      <Text style={styles.analyzeButtonText}>Starting Analysis...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="#ffffff" />
                      <Text style={styles.analyzeButtonText}>
                        {validation.type === 'success' ? 'Analyze My Idea ✨' : 
                         isIdeaTooLong() ? 'Too Long - Shorten First' :
                         'Analyze My Idea'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Example Ideas */}
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: isDarkMode ? colors.text : '#111827' }]}>💡 Need inspiration?</Text>
                <View style={styles.examplesList}>
                  {exampleIdeas.slice(0, 3).map((example, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[styles.exampleChip, { backgroundColor: isDarkMode ? colors.surface : '#f3f4f6' }]}
                      onPress={() => setIdea(example.text)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.exampleCategory, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                        {example.category}
                      </Text>
                      <Text style={[styles.exampleText, { color: isDarkMode ? colors.text : '#374151' }]}>
                        {example.short}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Random Example Button */}
                  <TouchableOpacity 
                    style={[styles.randomExampleChip, { borderColor: isDarkMode ? colors.border : '#d1d5db' }]}
                    onPress={() => {
                      const randomExample = getRandomExample();
                      setIdea(randomExample.text);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="shuffle" size={16} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
                    <Text style={[styles.randomExampleText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Random idea
                    </Text>
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
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tipsButtonText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
  inputHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  characterCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  validationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  validationMessage: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'System',
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
    gap: 8,
    marginTop: 12,
  },
  exampleChip: {
    padding: 16,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exampleCategory: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 6,
    opacity: 0.8,
  },
  exampleText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    lineHeight: 18,
  },
  randomExampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    minWidth: 120,
  },
  randomExampleText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    marginLeft: 6,
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
  writingTips: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  writingTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
  },
  ideaTextarea: {
    minHeight: 160,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 12,
    fontFamily: 'System',
    lineHeight: 24,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
});
