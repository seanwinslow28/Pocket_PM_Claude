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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AnalysisScreen({ navigation, route }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const { idea: routeIdea, analysis: routeAnalysis, usage: routeUsage } = route.params || {};
  
  // Convert to state variables so they can be updated
  const [idea, setIdea] = useState(routeIdea);
  const [analysis, setAnalysis] = useState(routeAnalysis);
  const [usage, setUsage] = useState(routeUsage);
  const [loading, setLoading] = useState(false);
  const [analysisInsights, setAnalysisInsights] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('AnalysisScreen mounted with params:', route.params);
    console.log('Route name:', route.name);
    console.log('Idea:', idea);
    console.log('Analysis:', analysis ? 'Present' : 'Missing');
    console.log('Usage:', usage);
  }, []);

  // Add null safety check and load from storage if missing
  useEffect(() => {
    const loadMissingData = async () => {
      if (!idea || !analysis) {
        console.log('Missing data, attempting to load from storage...');
        setLoading(true);
        try {
          const history = await StorageService.getAnalysisHistory();
          console.log('Storage history:', history);
          
          if (history && history.length > 0) {
            const latest = history[0];
            console.log('Loaded from storage:', latest);
            setIdea(latest.idea);
            setAnalysis(latest.analysis);
            setUsage(latest.usage);
          } else {
            console.log('No analysis history found in storage');
            // Keep the fallback text that's already set
          }
        } catch (error) {
          console.error('Failed to load from storage:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadMissingData();
  }, [idea, analysis]);

  // Generate insights when analysis is available
  useEffect(() => {
    if (analysis) {
      const insights = generateInsights(analysis);
      setAnalysisInsights(insights);
    }
  }, [analysis]);

  // Show loading state while fetching from storage
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
        <View style={[styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={[styles.loadingText, { color: isDarkMode ? colors.text : '#111827' }]}>
            Loading your latest analysis...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
    console.log('New analysis clicked');
    try {
      navigation.navigate('HomeMain');
    } catch (error) {
      console.error('Navigation to HomeMain failed:', error);
      // Try alternative navigation
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  const handleLaunch = () => {
    navigation.navigate('Launch', {
      idea,
      analysis,
      usage
    });
  };

  // Generate analysis insights from the analysis text
  const generateInsights = (analysisText) => {
    if (!analysisText) return null;
    
    const text = analysisText.toLowerCase();
    
    // Simple keyword analysis to extract insights
    const marketPotential = text.includes('high potential') || text.includes('strong market') || text.includes('growing demand') ? 'High' :
                           text.includes('moderate') || text.includes('steady') ? 'Moderate' : 'Needs Research';
                           
    const technicalComplexity = text.includes('complex') || text.includes('challenging') || text.includes('difficult') ? 'High' :
                               text.includes('moderate') || text.includes('medium') ? 'Moderate' : 'Low';
                               
    const timeToMarket = text.includes('quick') || text.includes('fast') || text.includes('rapid') ? '3-6 months' :
                        text.includes('moderate') || text.includes('medium') ? '6-12 months' : '12+ months';
                        
    const fundingNeeded = text.includes('expensive') || text.includes('significant investment') ? 'High' :
                         text.includes('moderate cost') || text.includes('medium budget') ? 'Moderate' : 'Low';

    // Extract key strengths and challenges
    const strengths = [];
    const challenges = [];
    
    if (text.includes('innovative') || text.includes('unique')) strengths.push('Innovative concept');
    if (text.includes('market demand') || text.includes('clear need')) strengths.push('Clear market need');
    if (text.includes('scalable') || text.includes('scale')) strengths.push('Scalable business model');
    if (text.includes('competitive advantage')) strengths.push('Competitive advantage');
    
    if (text.includes('competition') || text.includes('competitors')) challenges.push('Market competition');
    if (text.includes('technical') || text.includes('development')) challenges.push('Technical complexity');
    if (text.includes('funding') || text.includes('capital')) challenges.push('Funding requirements');
    if (text.includes('regulation') || text.includes('legal')) challenges.push('Regulatory considerations');

    return {
      marketPotential,
      technicalComplexity,
      timeToMarket,
      fundingNeeded,
      strengths: strengths.length > 0 ? strengths : ['Strong concept', 'Clear vision'],
      challenges: challenges.length > 0 ? challenges : ['Market validation needed', 'Implementation planning'],
      overallScore: marketPotential === 'High' ? 85 : marketPotential === 'Moderate' ? 70 : 60
    };
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
                {idea || 'No idea data available. Please analyze a new idea.'}
              </Text>
            </View>
          </Animatable.View>

          {/* Analysis Results */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            {/* Analysis Insights Dashboard */}
            {analysisInsights && (
              <View style={[styles.insightsDashboard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
                <View style={styles.dashboardHeader}>
                  <View style={styles.dashboardHeaderLeft}>
                    <Ionicons name="analytics" size={24} color="#ef4444" />
                    <Text style={[styles.dashboardTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                      📊 Analysis Dashboard
                    </Text>
                  </View>
                  <View style={[styles.overallScore, { backgroundColor: '#22c55e15' }]}>
                    <Text style={[styles.scoreValue, { color: '#22c55e' }]}>
                      {analysisInsights.overallScore}/100
                    </Text>
                    <Text style={[styles.scoreLabel, { color: '#22c55e' }]}>Score</Text>
                  </View>
                </View>

                {/* Key Metrics Grid */}
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: isDarkMode ? colors.background : '#f8fafc' }]}>
                    <View style={[styles.metricIcon, { backgroundColor: '#3b82f615' }]}>
                      <Ionicons name="trending-up" size={20} color="#3b82f6" />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Market Potential
                    </Text>
                    <Text style={[styles.metricValue, { 
                      color: analysisInsights.marketPotential === 'High' ? '#22c55e' : 
                             analysisInsights.marketPotential === 'Moderate' ? '#f59e0b' : '#ef4444'
                    }]}>
                      {analysisInsights.marketPotential}
                    </Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: isDarkMode ? colors.background : '#f8fafc' }]}>
                    <View style={[styles.metricIcon, { backgroundColor: '#8b5cf615' }]}>
                      <Ionicons name="construct" size={20} color="#8b5cf6" />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Complexity
                    </Text>
                    <Text style={[styles.metricValue, { 
                      color: analysisInsights.technicalComplexity === 'Low' ? '#22c55e' : 
                             analysisInsights.technicalComplexity === 'Moderate' ? '#f59e0b' : '#ef4444'
                    }]}>
                      {analysisInsights.technicalComplexity}
                    </Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: isDarkMode ? colors.background : '#f8fafc' }]}>
                    <View style={[styles.metricIcon, { backgroundColor: '#10b98115' }]}>
                      <Ionicons name="time" size={20} color="#10b981" />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Time to Market
                    </Text>
                    <Text style={[styles.metricValue, { color: isDarkMode ? colors.text : '#111827' }]}>
                      {analysisInsights.timeToMarket}
                    </Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: isDarkMode ? colors.background : '#f8fafc' }]}>
                    <View style={[styles.metricIcon, { backgroundColor: '#f59e0b15' }]}>
                      <Ionicons name="wallet" size={20} color="#f59e0b" />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Funding Needed
                    </Text>
                    <Text style={[styles.metricValue, { color: isDarkMode ? colors.text : '#111827' }]}>
                      {analysisInsights.fundingNeeded}
                    </Text>
                  </View>
                </View>

                {/* Strengths and Challenges */}
                <View style={styles.strengthsChallenges}>
                  <View style={styles.strengthsSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                      <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>Key Strengths</Text>
                    </View>
                    {analysisInsights.strengths.map((strength, index) => (
                      <View key={index} style={styles.listItem}>
                        <View style={[styles.listDot, { backgroundColor: '#22c55e' }]} />
                        <Text style={[styles.listText, { color: isDarkMode ? colors.text : '#374151' }]}>
                          {strength}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.challengesSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="warning" size={20} color="#f59e0b" />
                      <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>Key Challenges</Text>
                    </View>
                    {analysisInsights.challenges.map((challenge, index) => (
                      <View key={index} style={styles.listItem}>
                        <View style={[styles.listDot, { backgroundColor: '#f59e0b' }]} />
                        <Text style={[styles.listText, { color: isDarkMode ? colors.text : '#374151' }]}>
                          {challenge}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: isDarkMode ? colors.border : '#d1d5db' }]}
                onPress={() => {
                  console.log('New Analysis button pressed');
                  handleNewAnalysis();
                }}
                activeOpacity={0.8}
                testID="new-analysis-button"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Start a new analysis"
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

            {/* Get Deep Analysis Button */}
            <View style={styles.launchButtonContainer}>
              <TouchableOpacity
                style={[styles.launchButton, { backgroundColor: '#ef4444' }]}
                onPress={() => {
                  console.log('Get Deep Analysis button pressed');
                  console.log('Navigating to Analysis tab');
                  try {
                    // Navigate to the Analysis tab
                    navigation.navigate('Analysis');
                  } catch (error) {
                    console.error('Navigation failed:', error);
                    // Fallback navigation
                    navigation.jumpTo('Analysis');
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="analytics" size={24} color="#ffffff" />
                <Text style={styles.launchButtonText}>Get Deep Analysis 🔍</Text>
                <Text style={styles.launchButtonSubtext}>Advanced insights & specialized analysis features</Text>
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
    paddingBottom: 100, // Extra padding to prevent cut-off from bottom tab
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
    maxHeight: 600, // Increased height for better content display
    flex: 1,
    paddingTop: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    fontFamily: 'System',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'System',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  featureSection: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureHeaderText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'System',
  },
  featureSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  scoringMetrics: {
    marginBottom: 24,
  },
  metricRow: {
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
  },
  confidenceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  confidenceReason: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  comingSoonCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'System',
  },
  deepDiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  deepDiveCard: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deepDiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deepDiveCardName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  deepDiveCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  insightsDashboard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dashboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  overallScore: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: '#22c55e15',
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
  },
  strengthsChallenges: {
    marginTop: 24,
  },
  strengthsSection: {
    marginBottom: 20,
  },
  challengesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    flex: 1,
    lineHeight: 20,
  },
  analysisToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  deepDiveSection: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deepDiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  deepDiveTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  deepDiveSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
    marginBottom: 20,
  },
});
