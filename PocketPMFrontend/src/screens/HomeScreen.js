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
      category: 'Health & Fitness',
      text: "A mobile app that helps people find and book local fitness classes with real-time availability, instructor ratings, and flexible payment options",
      short: "Fitness class finder"
    },
    {
      category: 'Food & Sustainability', 
      text: "An AI-powered meal planning service that creates personalized weekly menus based on dietary preferences, reduces food waste by optimizing portions, and connects users with local farmers",
      short: "Smart meal planner"
    },
    {
      category: 'Remote Work',
      text: "A platform connecting remote workers with local coffee shops, co-working spaces, and quiet venues, featuring wifi speed tests, noise levels, and booking capabilities",
      short: "Remote workspace finder"
    },
    {
      category: 'Education',
      text: "An interactive learning platform that uses gamification and AI to help adults learn new skills through bite-sized lessons, peer collaboration, and real-world projects",
      short: "Adult skill learning"
    },
    {
      category: 'Home Services',
      text: "A marketplace for trusted local service providers (cleaning, repairs, gardening) with instant booking, transparent pricing, and quality guarantees",
      short: "Home services marketplace"
    },
    {
      category: 'Financial Planning',
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
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDarkMode ? colors.background : '#FFFFFF' }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { backgroundColor: isDarkMode ? colors.surface : '#FFFFE3', borderBottomColor: isDarkMode ? colors.border : '#D3D3D3' }]}>
          <TouchableOpacity onPress={() => setShowSettingsModal(false)} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={isDarkMode ? colors.text : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: isDarkMode ? colors.text : '#000000' }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Modal Content */}
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Development Section */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: isDarkMode ? colors.text : '#000000' }]}>
              🧪 Development
            </Text>
            <Text style={[styles.modalSectionDescription, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
              Settings for development and testing
            </Text>

            <View style={[styles.settingItem, { backgroundColor: isDarkMode ? colors.surface : '#FFFFE3', borderColor: isDarkMode ? colors.border : '#D3D3D3' }]}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#7B68EE15' }]}>
                  <Ionicons name="flask" size={24} color="#7B68EE" />
                </View>
                <View style={styles.settingItemText}>
                  <Text style={[styles.settingTitle, { color: isDarkMode ? colors.text : '#000000' }]}>
                    Test Mode
                  </Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
                    Use dummy data instead of real API calls
                  </Text>
                </View>
              </View>
              <Switch
                value={testMode}
                onValueChange={handleTestModeToggle}
                trackColor={{ false: '#D3D3D3', true: '#7B68EE30' }}
                thumbColor={testMode ? '#7B68EE' : '#9ca3af'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>
          </View>

          {/* Test Mode Info */}
          {testMode && (
            <View style={[styles.infoCard, { backgroundColor: '#7B68EE15', borderColor: '#7B68EE' }]}>
              <View style={styles.infoCardContent}>
                <Ionicons name="warning" size={20} color="#7B68EE" />
                <Text style={[styles.infoTitle, { color: '#7B68EE' }]}>Test Mode Active</Text>
              </View>
              <Text style={[styles.infoDescription, { color: '#7B68EE' }]}>
                Using dummy data. Toggle off to use real OpenAI API calls.
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.modalFooter}>
            <Text style={[styles.modalFooterText, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
              Made with ❤️ for Product Innovators
            </Text>
            <Text style={[styles.modalFooterText, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#FFFFFF' }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7B68EE']}
            tintColor="#7B68EE"
          />
        }
      >
        {/* Header */}
        <View style={[
          styles.header, 
          { 
            backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', 
            borderBottomColor: isDarkMode ? colors.border : '#D3D3D3',
            shadowColor: '#7B68EE',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }
        ]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: '#7B68EE' }]}>
                <Ionicons name="create" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#000000' }]}>Pocket PM</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
                AI-powered product analysis
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ProfileMain')} activeOpacity={0.7}>
              <Ionicons name="time-outline" size={20} color={isDarkMode ? colors.textSecondary : '#666666'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettingsModal(true)} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={isDarkMode ? colors.textSecondary : '#666666'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Steps */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={[
                  styles.stepIcon, 
                  { 
                    backgroundColor: '#7B68EE',
                    shadowColor: '#7B68EE',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 6,
                  }
                ]}>
                  <Ionicons name="bulb" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Share</Text>
              </View>
              <View style={styles.step}>
                <View style={[
                  styles.stepIcon, 
                  { 
                    backgroundColor: '#7B68EE',
                    shadowColor: '#7B68EE',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 6,
                  }
                ]}>
                  <Ionicons name="analytics" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Analyze</Text>
              </View>
              <View style={styles.step}>
                <View style={[
                  styles.stepIcon, 
                  { 
                    backgroundColor: '#7B68EE',
                    shadowColor: '#7B68EE',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 6,
                  }
                ]}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Form */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: isDarkMode ? colors.text : '#000000' }]}>Share Your Idea</Text>
              <Text style={[styles.formSubtitle, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
                Tell us about your product idea and get AI-powered insights in seconds
              </Text>

              {/* Text Input */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? colors.input : '#FFFFFF',
                    borderColor: validation.type === 'error' ? '#7B68EE' :
                      validation.type === 'success' ? '#7B68EE' :
                      validation.type === 'warning' ? '#7B68EE' :
                      isDarkMode ? colors.border : '#D3D3D3',
                    color: isDarkMode ? colors.text : '#000000',
                    shadowColor: '#7B68EE',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 5,
                  }
                ]}
                placeholder="Describe your product idea in detail. What problem does it solve? How does it work? Who is your target audience?"
                placeholderTextColor={isDarkMode ? colors.placeholder : '#999999'}
                value={idea}
                onChangeText={setIdea}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!isAnalyzing}
              />

              {/* Analyze Button */}
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  {
                    backgroundColor: validation.type === 'success' ? '#7B68EE' :
                      isIdeaTooLong() ? '#D3D3D3' :
                      isAnalyzing ? '#7B68EE' : '#7B68EE',
                    opacity: isButtonDisabled ? 0.6 : 1,
                    shadowColor: '#7B68EE',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }
                ]}
                onPress={handleAnalyze}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
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
                      {validation.type === 'error' ? 'Too Long - Shorten First' : 'Analyze My Idea'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Examples */}
          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <View style={styles.examplesContainer}>
              <Text style={[styles.examplesTitle, { color: isDarkMode ? colors.text : '#000000' }]}>💡 Need inspiration?</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
                {exampleIdeas.map((example, index) => {
                  // Create different gradient styles for each card
                  const gradientStyles = [
                    { backgroundColor: 'linear-gradient(135deg, #7B68EE15 0%, #FFFFFF 100%)', borderColor: '#7B68EE30' },
                    { backgroundColor: 'linear-gradient(135deg, #9B59B615 0%, #FFFFFF 100%)', borderColor: '#9B59B630' },
                    { backgroundColor: 'linear-gradient(135deg, #6A5ACD15 0%, #FFFFFF 100%)', borderColor: '#6A5ACD30' },
                    { backgroundColor: 'linear-gradient(135deg, #8A70D315 0%, #FFFFFF 100%)', borderColor: '#8A70D330' },
                    { backgroundColor: 'linear-gradient(135deg, #7B68EE20 0%, #FFFFFF 100%)', borderColor: '#7B68EE40' },
                    { backgroundColor: 'linear-gradient(135deg, #6B5B9515 0%, #FFFFFF 100%)', borderColor: '#6B5B9530' }
                  ];
                  
                  // Fallback solid colors for React Native compatibility
                  const cardColors = [
                    { backgroundColor: '#7B68EE08', borderColor: '#7B68EE25', shadowColor: '#7B68EE' },
                    { backgroundColor: '#9B59B608', borderColor: '#9B59B625', shadowColor: '#9B59B6' },
                    { backgroundColor: '#6A5ACD08', borderColor: '#6A5ACD25', shadowColor: '#6A5ACD' },
                    { backgroundColor: '#8A70D308', borderColor: '#8A70D325', shadowColor: '#8A70D3' },
                    { backgroundColor: '#7B68EE12', borderColor: '#7B68EE30', shadowColor: '#7B68EE' },
                    { backgroundColor: '#6B5B9508', borderColor: '#6B5B9525', shadowColor: '#6B5B95' }
                  ];
                  
                  const cardStyle = cardColors[index % cardColors.length];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.exampleChip, 
                        { 
                          backgroundColor: isDarkMode ? colors.surface : cardStyle.backgroundColor,
                          borderColor: isDarkMode ? colors.border : cardStyle.borderColor,
                          borderWidth: 1.5,
                          shadowColor: cardStyle.shadowColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 3,
                        }
                      ]}
                      onPress={() => setIdea(example.text)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.exampleCategory, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
                        {example.category}
                      </Text>
                      <Text style={[styles.exampleText, { color: isDarkMode ? colors.text : '#000000' }]}>
                        {example.short}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.randomExampleChip, { borderColor: isDarkMode ? colors.border : '#D3D3D3' }]}
                  onPress={() => {
                    const randomExample = getRandomExample();
                    setIdea(randomExample.text);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.randomExampleContent}>
                    <Ionicons name="shuffle" size={16} color={isDarkMode ? colors.textSecondary : '#666666'} />
                    <Text style={[styles.randomExampleText, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
                      Random idea
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animatable.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#666666' }]}>
            Made with ❤️ for Product Innovators
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
    flex: 1,
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
  stepsContainer: {
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
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'System',
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
  textInput: {
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
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    paddingVertical: 18, // 1rem
    paddingHorizontal: 32, // 2rem
    borderRadius: 16, // 0.75rem
    marginTop: 8,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 18, // 1.125rem
    fontWeight: '700',
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
  examplesScroll: {
    padding: 12,
  },
  exampleChip: {
    padding: 18,
    marginRight: 14,
    marginBottom: 12,
    borderRadius: 18,
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 180,
    maxWidth: 200,
    minHeight: 80,
    justifyContent: 'center',
  },
  exampleCategory: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 6,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
    lineHeight: 20,
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
  randomExampleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 12,
    marginBottom: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
