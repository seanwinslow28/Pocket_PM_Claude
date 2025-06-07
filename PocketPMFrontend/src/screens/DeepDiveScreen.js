import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/api';
import StorageService from '../utils/storage';

const { width } = Dimensions.get('window');

export default function DeepDiveScreen({ navigation, route }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const { idea, analysisType, originalAnalysis } = route.params;
  const [loading, setLoading] = useState(true);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const iconRef = useRef(null);

  const analysisConfig = {
    market: {
      name: 'Market Analysis',
      icon: 'trending-up',
      color: '#3b82f6',
      emoji: '📊',
      statusMessages: [
        'Analyzing market size...',
        'Identifying target audience...',
        'Researching competitors...',
        'Evaluating market trends...',
        'Generating market insights...'
      ]
    },
    technical: {
      name: 'Technical Feasibility',
      icon: 'construct',
      color: '#8b5cf6',
      emoji: '⚙️',
      statusMessages: [
        'Evaluating technical requirements...',
        'Analyzing development complexity...',
        'Assessing resource needs...',
        'Reviewing technical risks...',
        'Finalizing feasibility report...'
      ]
    },
    business: {
      name: 'Business Model',
      icon: 'calculator',
      color: '#10b981',
      emoji: '💰',
      statusMessages: [
        'Analyzing revenue streams...',
        'Calculating cost structure...',
        'Projecting financial metrics...',
        'Evaluating business viability...',
        'Creating business model...'
      ]
    },
    competitive: {
      name: 'Competitive Analysis',
      icon: 'people',
      color: '#f59e0b',
      emoji: '🏆',
      statusMessages: [
        'Identifying key competitors...',
        'Analyzing market positioning...',
        'Evaluating competitive advantages...',
        'Researching differentiation strategies...',
        'Generating competitive insights...'
      ]
    }
  };

  const currentConfig = analysisConfig[analysisType] || analysisConfig.market;

  useEffect(() => {
    startDeepAnalysis();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Start icon animation
    if (iconRef.current) {
      iconRef.current.pulse(1200);
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        
        // Update status text based on progress
        const messageIndex = Math.floor((newProgress / 100) * currentConfig.statusMessages.length);
        if (messageIndex < currentConfig.statusMessages.length) {
          setStatusText(currentConfig.statusMessages[messageIndex]);
        }

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setLoading(false);
        }
        return newProgress;
      });
    }, 60); // Complete in ~6 seconds

    return () => clearInterval(progressInterval);
  };

  const startDeepAnalysis = async () => {
    try {
      // Use the new API method for deep dive analysis
      const result = await ApiService.getDeepDiveAnalysis(idea, analysisType);
      
      if (result.success) {
        setDeepAnalysis(result.data);
        
        // Save specialized analysis to storage
        await StorageService.saveAnalysis({
          idea: idea,
          analysis: result.data.analysis,
          usage: result.data.usage,
          analysisType: analysisType,
          testMode: result.data.testMode
        });
      } else {
        console.error('Deep dive analysis failed:', result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Deep dive analysis failed:', error);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = `${currentConfig.emoji} ${currentConfig.name}\n\nIdea: ${idea}\n\n${currentConfig.name} Results:\n${deepAnalysis?.analysis || 'Analysis in progress...'}\n\nAnalyzed with Pocket PM - AI-powered product analysis`;
      
      await Share.share({
        message: shareContent,
        title: `${currentConfig.name} - Pocket PM`
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    navigation.navigate('HomeMain');
  };

  const handleBackToResults = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackToResults} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.text : '#111827'} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: currentConfig.color }]}>
                <Ionicons name={currentConfig.icon} size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>{currentConfig.name}</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Deep dive analysis in progress
              </Text>
            </View>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContent}>
          {/* Progress Steps */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.progressSteps}>
              {/* Idea Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Idea</Text>
              </View>

              {/* Analysis Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Analysis</Text>
              </View>

              {/* Deep Dive Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive, { backgroundColor: currentConfig.color }]}>
                  <Ionicons name={currentConfig.icon} size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Deep Dive</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Animation Container */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.animationContainer}>
            {/* Icon Animation */}
            <Animatable.View
              ref={iconRef}
              animation="pulse"
              iterationCount="infinite"
              duration={1200}
              style={styles.iconContainer}
            >
              <View style={[styles.iconGlow, { backgroundColor: currentConfig.color + '30' }]} />
              <Text style={styles.emojiIcon}>{currentConfig.emoji}</Text>
            </Animatable.View>

            {/* Status Text */}
            <Animatable.Text
              animation="fadeIn"
              duration={500}
              style={[styles.statusText, { color: isDarkMode ? colors.text : '#111827' }]}
              key={statusText}
            >
              {statusText}
            </Animatable.Text>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
              <Animatable.View
                animation="fadeInLeft"
                duration={200}
                style={[
                  styles.progressBar,
                  { 
                    width: `${progress}%`,
                    backgroundColor: currentConfig.color
                  }
                ]}
              />
            </View>

            {/* Progress Percentage */}
            <Text style={[styles.progressText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
              {Math.round(progress)}% Complete
            </Text>
          </Animatable.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Powered by OpenAI • Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackToResults} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.text : '#111827'} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: currentConfig.color }]}>
                <Ionicons name={currentConfig.icon} size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>{currentConfig.name}</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Specialized insights for your idea
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleNewAnalysis} activeOpacity={0.7}>
              <Ionicons name="add-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Progress Steps */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.progressSteps}>
              {/* Idea Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Idea</Text>
              </View>

              {/* Analysis Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Analysis</Text>
              </View>

              {/* Deep Dive Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted, { backgroundColor: currentConfig.color }]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Deep Dive</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Analysis Header */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={[styles.analysisHeader, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.analysisHeaderContent}>
                <View style={[styles.analysisIcon, { backgroundColor: currentConfig.color + '15' }]}>
                  <Text style={styles.analysisEmoji}>{currentConfig.emoji}</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisHeaderTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    {currentConfig.name}
                  </Text>
                  <Text style={[styles.analysisHeaderSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    Specialized analysis complete
                  </Text>
                </View>
                <View style={[styles.completeBadge, { backgroundColor: currentConfig.color + '15' }]}>
                  <Text style={[styles.completeText, { color: currentConfig.color }]}>✨ Complete</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          {/* Deep Analysis Results */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={[styles.analysisResults, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderLeftColor: currentConfig.color }]}>
              <ScrollView style={styles.analysisContent} nestedScrollEnabled>
                <Text style={[styles.analysisText, { color: isDarkMode ? colors.text : '#333333' }]}>
                  {deepAnalysis?.analysis || 'Analysis results will appear here...'}
                </Text>
              </ScrollView>
            </View>
          </Animatable.View>

          {/* Action Buttons */}
          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: isDarkMode ? colors.border : '#d1d5db' }]}
                onPress={handleBackToResults}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color={isDarkMode ? colors.text : '#374151'} />
                <Text style={[styles.secondaryButtonText, { color: isDarkMode ? colors.text : '#374151' }]}>
                  Back to Results
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: currentConfig.color }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Share Analysis</Text>
              </TouchableOpacity>
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
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
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
    marginBottom: 48, // 3rem
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
  stepIconCompleted: {
    backgroundColor: '#22c55e',
  },
  stepLabel: {
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'System',
  },
  stepLabelActive: {
    color: '#111827',
  },
  stepLabelCompleted: {
    color: '#22c55e',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  emojiIcon: {
    fontSize: 80,
  },
  statusText: {
    fontSize: 20, // 1.25rem
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32, // 2rem
    fontFamily: 'System',
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    marginBottom: 16, // 1rem
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16, // 1rem
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32, // 2rem
    fontFamily: 'System',
  },
  analysisHeader: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
  },
  analysisIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisEmoji: {
    fontSize: 32,
  },
  analysisHeaderText: {
    flex: 1,
  },
  analysisHeaderTitle: {
    fontSize: 24, // 1.5rem
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  analysisHeaderSubtitle: {
    fontSize: 16, // 1rem
    fontFamily: 'System',
  },
  completeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeText: {
    fontSize: 14, // 0.875rem
    fontWeight: '600',
    fontFamily: 'System',
  },
  analysisResults: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32, // 2rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  analysisContent: {
    maxHeight: 400,
  },
  analysisText: {
    fontSize: 16, // 1rem
    lineHeight: 24,
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16, // 1rem
    marginBottom: 32, // 2rem
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 24, // 1.5rem
    borderRadius: 12, // 0.75rem
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16, // 1rem
    fontWeight: '500',
    fontFamily: 'System',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 24, // 1.5rem
    borderRadius: 12, // 0.75rem
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16, // 1rem
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
}); 