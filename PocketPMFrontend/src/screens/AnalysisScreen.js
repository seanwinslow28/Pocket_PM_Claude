import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AnalysisScreen({ navigation, route }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const { idea, analysis, usage } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState(null);

  const deepDiveOptions = [
    { 
      id: 'market', 
      name: 'Market Analysis', 
      icon: 'trending-up',
      description: 'Market size, target audience, and competitive landscape',
      color: '#3b82f6'
    },
    { 
      id: 'technical', 
      name: 'Technical Feasibility', 
      icon: 'construct',
      description: 'Technology requirements, development complexity, and resources',
      color: '#8b5cf6'
    },
    { 
      id: 'business', 
      name: 'Business Model', 
      icon: 'calculator',
      description: 'Revenue streams, cost structure, and financial projections',
      color: '#10b981'
    },
    { 
      id: 'competitive', 
      name: 'Competitive Analysis', 
      icon: 'people',
      description: 'Competitor analysis, positioning, and differentiation strategy',
      color: '#f59e0b'
    },
  ];

  const handleDeepDive = (analysisType) => {
    console.log('Deep dive clicked:', analysisType);
    try {
      // Navigate to deep dive analysis with the selected type
      navigation.navigate('DeepDive', {
        idea,
        analysisType,
        originalAnalysis: analysis
      });
    } catch (error) {
      console.error('Deep dive navigation failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = `💡 Product Idea Analysis\n\nIdea: ${idea}\n\nAnalysis:\n${analysis}\n\nAnalyzed with Pocket PM - AI-powered product analysis`;
      
      await Share.share({
        message: shareContent,
        title: 'My Product Analysis'
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    navigation.navigate('HomeMain');
  };

  const handleLaunch = () => {
    navigation.navigate('Launch', {
      idea,
      analysis,
      usage
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.text : '#111827'} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="analytics" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Analysis Results</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                AI-powered insights for your idea
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

              {/* Launch Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive]}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Idea Summary */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={[styles.ideaSummary, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.ideaHeader}>
                <Ionicons name="bulb" size={24} color="#fbbf24" />
                <Text style={[styles.ideaTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Your Idea</Text>
              </View>
              <Text style={[styles.ideaText, { color: isDarkMode ? colors.text : '#333333' }]}>
                {idea}
              </Text>
            </View>
          </Animatable.View>

          {/* Analysis Results */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={[styles.analysisResults, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.analysisHeader}>
                <View style={styles.analysisHeaderLeft}>
                  <Ionicons name="analytics" size={24} color="#ef4444" />
                  <Text style={[styles.analysisTitle, { color: isDarkMode ? colors.text : '#111827' }]}>AI Analysis</Text>
                </View>
                <View style={styles.analysisScore}>
                  <Text style={[styles.scoreText, { color: '#22c55e' }]}>✨ Complete</Text>
                </View>
              </View>
              <ScrollView style={styles.analysisContent} nestedScrollEnabled>
                <Text style={[styles.analysisText, { color: isDarkMode ? colors.text : '#333333' }]}>
                  {analysis}
                </Text>
              </ScrollView>
            </View>
          </Animatable.View>

          {/* Deep Dive Options */}
          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <View style={styles.deepDiveSection}>
              <Text style={[styles.deepDiveTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                🔍 Deep Dive Analysis
              </Text>
              <Text style={[styles.deepDiveSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Get specialized insights for different aspects of your idea
              </Text>
              
              <View style={styles.deepDiveGrid}>
                {deepDiveOptions.map((option, index) => (
                  <Animatable.View
                    key={option.id}
                    animation="fadeInUp"
                    duration={600}
                    delay={1000 + (index * 100)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.deepDiveCard,
                        { 
                          backgroundColor: isDarkMode ? colors.surface : '#ffffff',
                          borderLeftColor: option.color
                        }
                      ]}
                      onPress={() => {
                        console.log('Deep dive pressed:', option.id);
                        handleDeepDive(option.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.deepDiveCardHeader}>
                        <View style={[styles.deepDiveIcon, { backgroundColor: option.color + '15' }]}>
                          <Ionicons name={option.icon} size={24} color={option.color} />
                        </View>
                        <View style={styles.deepDiveCardTitle}>
                          <Text style={[styles.deepDiveCardName, { color: isDarkMode ? colors.text : '#111827' }]}>
                            {option.name}
                          </Text>
                          <Text style={[styles.deepDiveCardDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                            {option.description}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                ))}
              </View>
            </View>
          </Animatable.View>

          {/* Action Buttons */}
          <Animatable.View animation="fadeInUp" duration={800} delay={1200}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: isDarkMode ? colors.border : '#d1d5db' }]}
                onPress={handleNewAnalysis}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={isDarkMode ? colors.text : '#374151'} />
                <Text style={[styles.secondaryButtonText, { color: isDarkMode ? colors.text : '#374151' }]}>
                  New Analysis
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#f87171' }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Share Results</Text>
              </TouchableOpacity>
            </View>

            {/* Launch Button */}
            <View style={styles.launchButtonContainer}>
              <TouchableOpacity
                style={[styles.launchButton, { backgroundColor: '#ef4444' }]}
                onPress={handleLaunch}
                activeOpacity={0.8}
              >
                <Ionicons name="rocket" size={24} color="#ffffff" />
                <Text style={styles.launchButtonText}>Ready to Launch 🚀</Text>
                <Text style={styles.launchButtonSubtext}>Export documents & get launch-ready materials</Text>
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
  ideaSummary: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 0.75rem
    marginBottom: 16, // 1rem
  },
  ideaTitle: {
    fontSize: 20, // 1.25rem
    fontWeight: '700',
    fontFamily: 'System',
  },
  ideaText: {
    fontSize: 16, // 1rem
    lineHeight: 24,
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
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // 1rem
  },
  analysisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  analysisTitle: {
    fontSize: 20, // 1.25rem
    fontWeight: '700',
    fontFamily: 'System',
  },
  analysisScore: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12, // 0.75rem
    fontWeight: '600',
    fontFamily: 'System',
  },
  analysisContent: {
    maxHeight: 300,
  },
  analysisText: {
    fontSize: 16, // 1rem
    lineHeight: 24,
    fontFamily: 'System',
  },
  deepDiveSection: {
    marginBottom: 32, // 2rem
  },
  deepDiveTitle: {
    fontSize: 24, // 1.5rem
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8, // 0.5rem
    fontFamily: 'System',
  },
  deepDiveSubtitle: {
    fontSize: 16, // 1rem
    textAlign: 'center',
    marginBottom: 32, // 2rem
    fontFamily: 'System',
  },
  deepDiveGrid: {
    gap: 16, // 1rem
  },
  deepDiveCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deepDiveCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
  },
  deepDiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deepDiveCardTitle: {
    flex: 1,
  },
  deepDiveCardName: {
    fontSize: 18, // 1.125rem
    fontWeight: '600',
    marginBottom: 4, // 0.25rem
    fontFamily: 'System',
  },
  deepDiveCardDescription: {
    fontSize: 14, // 0.875rem
    lineHeight: 20,
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
  launchButtonContainer: {
    marginTop: 24, // 1.5rem
    width: '100%',
  },
  launchButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 20, // 1.25rem
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  launchButtonSubtext: {
    color: '#ffffff',
    fontSize: 14, // 0.875rem
    fontWeight: '400',
    fontFamily: 'System',
    opacity: 0.9,
    textAlign: 'center',
  },
});
