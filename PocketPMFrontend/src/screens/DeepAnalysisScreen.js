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
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import AnalysisTextRenderer from '../components/AnalysisTextRenderer';

const { width } = Dimensions.get('window');

export default function DeepAnalysisScreen({ navigation, route }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const routeParams = route.params || {};
  const { idea, analysisType, originalAnalysis } = routeParams;
  
  // Debug logging
  console.log('=== DeepAnalysisScreen Debug ===');
  console.log('Route params:', routeParams);
  console.log('Idea:', idea);
  console.log('Analysis type:', analysisType);
  console.log('Original analysis:', originalAnalysis);
  console.log('Route name:', route.name);
  
  // If no route params, this is accessed from the bottom tab - show Deep Analysis features
  const isTabAccess = !idea && !analysisType;
  console.log('isTabAccess:', isTabAccess);
  
  const [loading, setLoading] = useState(!isTabAccess); // Only load if we have specific analysis to do
  console.log('Initial loading state:', !isTabAccess);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [showScoring, setShowScoring] = useState(false);
  const [ideaScores, setIdeaScores] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const iconRef = useRef(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  // States for latest analysis data when in tab access mode
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [latestIdea, setLatestIdea] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

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
  
  // Safety check for currentConfig
  if (!currentConfig) {
    console.error('Current config is null/undefined for analysisType:', analysisType);
    console.log('Available analysisConfig keys:', Object.keys(analysisConfig));
  }
  
  // TEMPORARY DEBUG: Force skip loading for navigation from deep dive buttons
  const forceSkipLoading = routeParams.isDemo && analysisType;
  console.log('Force skip loading?', forceSkipLoading);
  
  // Override loading state if we have demo data
  const actualLoading = forceSkipLoading ? false : loading;
  console.log('Actual loading state:', actualLoading);

  // Load latest analysis data when in tab access mode
  useEffect(() => {
    console.log('=== Loading analysis data ===');
    console.log('isTabAccess:', isTabAccess);
    
    if (isTabAccess) {
      const loadLatestAnalysis = async () => {
        console.log('Loading latest analysis from storage...');
        setLoadingAnalysis(true);
        try {
          const history = await StorageService.getAnalysisHistory();
          console.log('Analysis history loaded:', history);
          
          if (history && history.length > 0) {
            const latest = history[0];
            console.log('Latest analysis found:', latest);
            setLatestAnalysis(latest.analysis);
            setLatestIdea(latest.idea);
            console.log('Analysis data set successfully');
          } else {
            console.log('No analysis history found');
          }
        } catch (error) {
          console.error('Failed to load analysis:', error);
        } finally {
          setLoadingAnalysis(false);
          console.log('Loading analysis complete');
        }
      };
      loadLatestAnalysis();
    } else {
      // If not tab access, set loading to false immediately
      setLoadingAnalysis(false);
    }
  }, [isTabAccess]);

  // Debug effect to monitor data changes
  useEffect(() => {
    console.log('=== Data Change Debug ===');
    console.log('Latest Analysis available:', !!latestAnalysis);
    console.log('Latest Idea available:', !!latestIdea);
    console.log('Loading Analysis:', loadingAnalysis);
    console.log('Analysis sample:', latestAnalysis ? latestAnalysis.substring(0, 100) + '...' : 'None');
  }, [latestAnalysis, latestIdea, loadingAnalysis]);

  useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('isTabAccess in useEffect:', isTabAccess);
    // Only start analysis if we have specific parameters (not tab access)
    if (!isTabAccess) {
      console.log('Starting deep analysis and animations...');
      startDeepAnalysis();
      startAnimations();
      
      // Fallback timeout to prevent infinite loading
      const fallbackTimeout = setTimeout(() => {
        console.log('=== FALLBACK TIMEOUT TRIGGERED ===');
        console.log('Setting loading to false due to timeout');
        setLoading(false);
      }, 10000); // 10 seconds max
      
      return () => clearTimeout(fallbackTimeout);
    } else {
      console.log('Tab access detected, not starting analysis');
    }
  }, [isTabAccess]);

  const startAnimations = () => {
    console.log('=== startAnimations called ===');
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
          console.log('Animation complete, setting loading to false');
          clearInterval(progressInterval);
          setLoading(false);
        }
        return newProgress;
      });
    }, 60); // Complete in ~6 seconds

    return () => clearInterval(progressInterval);
  };

  const startDeepAnalysis = async () => {
    console.log('=== startDeepAnalysis called ===');
    console.log('Analysis type for API:', analysisType);
    console.log('Idea for API:', idea);
    
    try {
      // Use the new API method for deep dive analysis
      const result = await ApiService.getDeepDiveAnalysis(idea, analysisType);
      console.log('API result:', result);
      
      if (result.success) {
        console.log('API success, setting deep analysis data');
        setDeepAnalysis(result.data);
        
        // Save specialized analysis to storage
        await StorageService.saveAnalysis({
          idea: idea,
          analysis: result.data.analysis,
          usage: result.data.usage,
          analysisType: analysisType,
          testMode: result.data.testMode
        });
        console.log('Analysis saved to storage');
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

  // Define deep dive options for tab access
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
    console.log('Current route name:', route.name);
    console.log('Navigation state:', navigation.getState());
    
    // Use demo data for navigation
    const demoIdea = "A mobile app that helps users track their daily habits and build positive routines";
    const demoAnalysis = "This is a demo analysis for habit tracking app ideas...";
    
    try {
      // Check if we're in the Analysis tab context
      if (route.name === 'AnalysisMain') {
        console.log('Navigating from Analysis tab to Home stack');
        // We're in the Deep Analysis tab, so we need to navigate to the Home stack's DeepDive route
        navigation.navigate('Home', {
          screen: 'DeepDive',
          params: {
            idea: demoIdea,
            analysisType,
            originalAnalysis: demoAnalysis,
            isDemo: true,
            fromAnalysisTab: true
          }
        });
      } else {
        console.log('Pushing DeepDive in current stack');
        // We're in the Home stack, so we can use push
        navigation.push('DeepDive', {
          idea: demoIdea,
          analysisType,
          originalAnalysis: demoAnalysis,
          isDemo: true
        });
      }
      
      // Show immediate feedback
      Alert.alert(
        'Loading Analysis',
        `Starting ${analysisConfig[analysisType]?.name || 'Deep Analysis'}...`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Deep dive navigation failed:', error);
      Alert.alert('Navigation Error', `Failed to navigate to deep dive analysis: ${error.message}\n\nRoute: ${route.name}\nAnalysis Type: ${analysisType}`);
    }
  };

  const calculateIdeaScore = async () => {
    setScoringLoading(true);
    setShowScoring(true);
    
    try {
      // Simulate scoring calculation
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for effect
      
      // Generate scores (in a real app, this would be AI-powered)
      const currentIdea = "A mobile app that helps users track their daily habits and build positive routines";
      
      // Simple scoring algorithm based on idea content
      const ideaLength = currentIdea.length;
      const hasKeywords = /app|platform|service|tool|system|solution/i.test(currentIdea);
      const hasProblem = /help|solve|improve|track|manage|organize/i.test(currentIdea);
      const hasTarget = /user|people|business|customer|student/i.test(currentIdea);
      
      const marketViability = Math.min(10, 6 + (hasKeywords ? 1.5 : 0) + (hasProblem ? 1.5 : 0) + (hasTarget ? 1 : 0));
      const technicalFeasibility = Math.min(10, 5 + (ideaLength > 50 ? 2 : 1) + (hasKeywords ? 1.5 : 0) + Math.random() * 1.5);
      const marketPotential = Math.min(10, 7 + (hasProblem ? 2 : 0) + (hasTarget ? 1 : 0) + Math.random() * 1);
      
      const scores = {
        marketViability: Number(marketViability.toFixed(1)),
        technicalFeasibility: Number(technicalFeasibility.toFixed(1)),
        marketPotential: Number(marketPotential.toFixed(1)),
        overall: Number(((marketViability + technicalFeasibility + marketPotential) / 3).toFixed(1)),
        confidence: Math.floor(70 + Math.random() * 25) // 70-95%
      };
      
      setIdeaScores(scores);
    } catch (error) {
      console.error('Scoring failed:', error);
      Alert.alert('Scoring Error', 'Failed to calculate idea scores. Please try again.');
    } finally {
      setScoringLoading(false);
    }
  };

  if (actualLoading) {
    console.log('=== Rendering loading screen ===');
    console.log('Loading state:', actualLoading);
    console.log('Progress:', progress);
    console.log('Current config:', currentConfig);
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

              {/* Analysis Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive, { backgroundColor: currentConfig.color }]}>
                  <Ionicons name={currentConfig.icon} size={32} color="#ffffff" ref={iconRef} />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive, { color: currentConfig.color }]}>{currentConfig.name}</Text>
              </View>

              {/* Launch Step - Pending */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconPending]}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelPending]}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Progress Card */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={[styles.progressCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.progressHeader}>
                <View style={[styles.progressIcon, { backgroundColor: currentConfig.color + '15' }]}>
                  <Text style={[styles.progressEmoji, { fontSize: 32 }]}>{currentConfig.emoji}</Text>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    Analyzing Your Idea
                  </Text>
                  <Text style={[styles.progressSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    {statusText || 'Preparing analysis...'}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progress}%`,
                        backgroundColor: currentConfig.color
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressPercentage, { color: currentConfig.color }]}>
                  {progress}%
                </Text>
              </View>
            </View>
          </Animatable.View>

          {/* Analysis Preview */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={[styles.previewCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <Text style={[styles.previewTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                What We're Analyzing
              </Text>
              <View style={styles.previewItems}>
                {currentConfig.statusMessages.map((message, index) => (
                  <View key={index} style={styles.previewItem}>
                    <View style={[
                      styles.previewDot, 
                      { 
                        backgroundColor: index <= Math.floor((progress / 100) * currentConfig.statusMessages.length) 
                          ? currentConfig.color 
                          : isDarkMode ? colors.border : '#e5e7eb'
                      }
                    ]} />
                    <Text style={[
                      styles.previewText, 
                      { 
                        color: index <= Math.floor((progress / 100) * currentConfig.statusMessages.length) 
                          ? (isDarkMode ? colors.text : '#111827')
                          : (isDarkMode ? colors.textSecondary : '#6b7280')
                      }
                    ]}>
                      {message}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animatable.View>
        </View>
      </SafeAreaView>
    );
  }

  // Show Deep Analysis features when accessed from tab
  if (isTabAccess) {
    console.log('=== Rendering tab access screen ===');
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Ionicons name="analytics" size={24} color="#ffffff" />
                  <View style={styles.sparkles}>
                    <Ionicons name="sparkles" size={12} color="#ffffff" />
                  </View>
                </View>
              </View>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Deep Analysis</Text>
                <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                  Advanced AI-powered insights
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Detailed Analysis Section */}
            <View style={[styles.featureSection, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: '#ef444415' }]}>
                  <Ionicons name="document-text" size={24} color="#ef4444" />
                </View>
                <View style={styles.featureHeaderText}>
                  <Text style={[styles.featureTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    📋 Detailed Analysis
                  </Text>
                  <Text style={[styles.featureSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    {latestAnalysis ? 'View your complete analysis report' : 'Analyze an idea to see detailed insights'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.analysisToggleHeader, { 
                  backgroundColor: isDarkMode ? colors.background : '#f8fafc',
                  borderColor: isDarkMode ? colors.border : '#e5e7eb'
                }]}
                onPress={() => {
                  console.log('=== Analysis Toggle Pressed ===');
                  console.log('Current showFullAnalysis:', showFullAnalysis);
                  console.log('Latest analysis available:', !!latestAnalysis);
                  console.log('Loading analysis:', loadingAnalysis);
                  setShowFullAnalysis(!showFullAnalysis);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.analysisHeaderLeft}>
                  <Ionicons 
                    name="document-text" 
                    size={20} 
                    color="#ef4444"
                  />
                  <Text style={[styles.analysisToggleTitle, { 
                    color: isDarkMode ? colors.text : '#111827'
                  }]}>
                    {loadingAnalysis ? 'Loading Analysis...' : 'Full Analysis Report'}
                  </Text>
                </View>
                <View style={styles.toggleButton}>
                  <Ionicons 
                    name={showFullAnalysis ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={isDarkMode ? colors.textSecondary : '#6b7280'} 
                  />
                  <Text style={[styles.toggleText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    {showFullAnalysis ? 'Hide' : 'Show'}
                  </Text>
                </View>
              </TouchableOpacity>

              {showFullAnalysis && (
                <Animatable.View animation="fadeInDown" duration={300}>
                  <View style={[styles.analysisContentContainer, { 
                    backgroundColor: isDarkMode ? colors.background : '#ffffff',
                    borderColor: isDarkMode ? colors.border : '#e5e7eb'
                  }]}>
                    <ScrollView style={styles.analysisContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {loadingAnalysis ? (
                        <View style={styles.analysisLoadingContainer}>
                          <ActivityIndicator size="large" color="#ef4444" />
                          <Text style={[styles.loadingText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                            Loading your analysis...
                          </Text>
                        </View>
                      ) : latestAnalysis ? (
                        <AnalysisTextRenderer content={latestAnalysis} />
                      ) : (
                        <View style={styles.demoAnalysisContainer}>
                          <Ionicons name="bulb-outline" size={48} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                          <Text style={[styles.demoAnalysisTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                            Demo Analysis Preview
                          </Text>
                          <Text style={[styles.demoAnalysisText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                            **Executive Summary**{'\n\n'}
                            Your idea shows strong potential in the growing digital wellness market. The habit-tracking app concept addresses a clear user need with proven market demand.{'\n\n'}
                            **Market Analysis**{'\n'}
                            • Market size: $4.2B and growing at 23% annually{'\n'}
                            • Target audience: Health-conscious millennials and Gen-Z{'\n'}
                            • Competitive landscape: Moderate with differentiation opportunities{'\n\n'}
                            **Key Strengths**{'\n'}
                            • Addresses real user pain points{'\n'}
                            • Scalable business model{'\n'}
                            • Strong retention potential{'\n\n'}
                            **Recommended Next Steps**{'\n'}
                            • Validate with user interviews{'\n'}
                            • Build MVP with core features{'\n'}
                            • Test monetization strategies
                          </Text>
                          <TouchableOpacity 
                            style={[styles.demoAnalysisButton, { backgroundColor: '#ef4444' }]}
                            onPress={() => navigation.navigate('HomeMain')}
                          >
                            <Text style={styles.demoAnalysisButtonText}>Analyze Your Real Idea</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </Animatable.View>
              )}
            </View>

            {/* Deep Dive Analysis Section */}
            <View style={[styles.featureSection, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: '#ef444415' }]}>
                  <Ionicons name="layers" size={24} color="#ef4444" />
                </View>
                <View style={styles.featureHeaderText}>
                  <Text style={[styles.featureTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    🔍 Deep Dive Analysis
                  </Text>
                  <Text style={[styles.featureSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    Get specialized insights for different aspects of your idea
                  </Text>
                </View>
              </View>
              
              <View style={styles.deepDiveGridContainer}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.deepDiveCard, 
                    { 
                      backgroundColor: isDarkMode ? colors.background : '#f8fafc',
                      borderLeftColor: '#3b82f6',
                      opacity: pressed ? 0.6 : 1
                    }
                  ]}
                  onPress={() => {
                    console.log('=== Market Analysis Button Pressed ===');
                    const ideaToUse = latestIdea || "A mobile app that helps users track their daily habits and build positive routines";
                    const analysisToUse = latestAnalysis || "Demo analysis for habit tracking app";
                    
                    console.log('Navigating to DeepDive with:', {
                      idea: ideaToUse,
                      analysisType: 'market',
                      originalAnalysis: analysisToUse,
                      isDemo: !latestIdea
                    });
                    
                    try {
                      // Navigate to Home tab first, then to DeepDive
                      navigation.navigate('Home', {
                        screen: 'DeepDive',
                        params: {
                          idea: ideaToUse,
                          analysisType: 'market',
                          originalAnalysis: analysisToUse,
                          isDemo: !latestIdea
                        }
                      });
                    } catch (error) {
                      console.error('Navigation error:', error);
                      Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
                    }
                  }}
                  testID="market-analysis-button"
                >
                  <View style={[styles.deepDiveIcon, { backgroundColor: '#3b82f615' }]}>
                    <Ionicons name="trending-up" size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.deepDiveCardContent}>
                    <Text style={[styles.deepDiveCardName, { color: isDarkMode ? colors.text : '#111827' }]}>
                      Market Analysis
                    </Text>
                    <Text style={[styles.deepDiveCardDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Market size, target audience, and competitive landscape
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </Pressable>

                <Pressable 
                  style={({ pressed }) => [
                    styles.deepDiveCard, 
                    { 
                      backgroundColor: isDarkMode ? colors.background : '#f8fafc',
                      borderLeftColor: '#8b5cf6',
                      opacity: pressed ? 0.6 : 1
                    }
                  ]}
                  onPress={() => {
                    console.log('=== Technical Analysis Button Pressed ===');
                    const ideaToUse = latestIdea || "A mobile app that helps users track their daily habits and build positive routines";
                    const analysisToUse = latestAnalysis || "Demo analysis for habit tracking app";
                    
                    try {
                      navigation.navigate('Home', {
                        screen: 'DeepDive',
                        params: {
                          idea: ideaToUse,
                          analysisType: 'technical',
                          originalAnalysis: analysisToUse,
                          isDemo: !latestIdea
                        }
                      });
                    } catch (error) {
                      console.error('Navigation error:', error);
                      Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
                    }
                  }}
                  testID="technical-analysis-button"
                >
                  <View style={[styles.deepDiveIcon, { backgroundColor: '#8b5cf615' }]}>
                    <Ionicons name="construct" size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.deepDiveCardContent}>
                    <Text style={[styles.deepDiveCardName, { color: isDarkMode ? colors.text : '#111827' }]}>
                      Technical
                    </Text>
                    <Text style={[styles.deepDiveCardDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Technology requirements, development complexity, and resources
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </Pressable>

                <Pressable 
                  style={({ pressed }) => [
                    styles.deepDiveCard, 
                    { 
                      backgroundColor: isDarkMode ? colors.background : '#f8fafc',
                      borderLeftColor: '#10b981',
                      opacity: pressed ? 0.6 : 1
                    }
                  ]}
                  onPress={() => {
                    console.log('=== Business Analysis Button Pressed ===');
                    const ideaToUse = latestIdea || "A mobile app that helps users track their daily habits and build positive routines";
                    const analysisToUse = latestAnalysis || "Demo analysis for habit tracking app";
                    
                    try {
                      navigation.navigate('Home', {
                        screen: 'DeepDive',
                        params: {
                          idea: ideaToUse,
                          analysisType: 'business',
                          originalAnalysis: analysisToUse,
                          isDemo: !latestIdea
                        }
                      });
                    } catch (error) {
                      console.error('Navigation error:', error);
                      Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
                    }
                  }}
                  testID="business-analysis-button"
                >
                  <View style={[styles.deepDiveIcon, { backgroundColor: '#10b98115' }]}>
                    <Ionicons name="calculator" size={20} color="#10b981" />
                  </View>
                  <View style={styles.deepDiveCardContent}>
                    <Text style={[styles.deepDiveCardName, { color: isDarkMode ? colors.text : '#111827' }]}>
                      Business
                    </Text>
                    <Text style={[styles.deepDiveCardDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Revenue streams, cost structure, and financial projections
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </Pressable>

                <Pressable 
                  style={({ pressed }) => [
                    styles.deepDiveCard, 
                    { 
                      backgroundColor: isDarkMode ? colors.background : '#f8fafc',
                      borderLeftColor: '#f59e0b',
                      opacity: pressed ? 0.6 : 1
                    }
                  ]}
                  onPress={() => {
                    console.log('=== Competitive Analysis Button Pressed ===');
                    const ideaToUse = latestIdea || "A mobile app that helps users track their daily habits and build positive routines";
                    const analysisToUse = latestAnalysis || "Demo analysis for habit tracking app";
                    
                    try {
                      navigation.navigate('Home', {
                        screen: 'DeepDive',
                        params: {
                          idea: ideaToUse,
                          analysisType: 'competitive',
                          originalAnalysis: analysisToUse,
                          isDemo: !latestIdea
                        }
                      });
                    } catch (error) {
                      console.error('Navigation error:', error);
                      Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
                    }
                  }}
                  testID="competitive-analysis-button"
                >
                  <View style={[styles.deepDiveIcon, { backgroundColor: '#f59e0b15' }]}>
                    <Ionicons name="people" size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.deepDiveCardContent}>
                    <Text style={[styles.deepDiveCardName, { color: isDarkMode ? colors.text : '#111827' }]}>
                      Competitive
                    </Text>
                    <Text style={[styles.deepDiveCardDescription, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Competitor analysis, positioning, and differentiation strategy
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </Pressable>
              </View>
            </View>

            {/* Smart Idea Scoring Section */}
            <View style={[styles.featureSection, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: '#3b82f615' }]}>
                  <Ionicons name="star" size={24} color="#3b82f6" />
                </View>
                <View style={styles.featureHeaderText}>
                  <Text style={[styles.featureTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    🎯 Smart Idea Scoring
                  </Text>
                  <Text style={[styles.featureSubtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    AI rates your ideas with detailed validation scores
                  </Text>
                </View>
              </View>

              {/* Scoring Metrics */}
              <View style={styles.scoringMetrics}>
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Market Viability
                    </Text>
                    <View style={styles.scoreContainer}>
                      <View style={[styles.scoreBar, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
                        <View style={[styles.scoreProgress, { 
                          width: ideaScores ? `${(ideaScores.marketViability / 10) * 100}%` : '85%', 
                          backgroundColor: '#22c55e' 
                        }]} />
                      </View>
                      <Text style={[styles.scoreValue, { color: '#22c55e' }]}>
                        {ideaScores ? `${ideaScores.marketViability}/10` : '8.5/10'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Technical Feasibility
                    </Text>
                    <View style={styles.scoreContainer}>
                      <View style={[styles.scoreBar, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
                        <View style={[styles.scoreProgress, { 
                          width: ideaScores ? `${(ideaScores.technicalFeasibility / 10) * 100}%` : '70%', 
                          backgroundColor: '#3b82f6' 
                        }]} />
                      </View>
                      <Text style={[styles.scoreValue, { color: '#3b82f6' }]}>
                        {ideaScores ? `${ideaScores.technicalFeasibility}/10` : '7.0/10'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      Market Potential
                    </Text>
                    <View style={styles.scoreContainer}>
                      <View style={[styles.scoreBar, { backgroundColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
                        <View style={[styles.scoreProgress, { 
                          width: ideaScores ? `${(ideaScores.marketPotential / 10) * 100}%` : '92%', 
                          backgroundColor: '#f59e0b' 
                        }]} />
                      </View>
                      <Text style={[styles.scoreValue, { color: '#f59e0b' }]}>
                        {ideaScores ? `${ideaScores.marketPotential}/10` : '9.2/10'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Validation Confidence */}
              <View style={[styles.confidenceCard, { backgroundColor: isDarkMode ? colors.background : '#f8fafc' }]}>
                <View style={styles.confidenceHeader}>
                  <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
                  <Text style={[styles.confidenceTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                    Validation Confidence: {ideaScores ? `${ideaScores.confidence}%` : '84%'}
                  </Text>
                </View>
                <Text style={[styles.confidenceReason, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                  {ideaScores ? 
                    `Overall score: ${ideaScores.overall}/10. Analysis based on idea complexity, market indicators, and feasibility factors. ${ideaScores.overall >= 8 ? 'High potential for success!' : ideaScores.overall >= 6 ? 'Good potential with some considerations.' : 'Consider refining the concept.'}` :
                    'High market demand, proven business model, moderate technical complexity. Similar products show 73% success rate in this category.'
                  }
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.featureButton, { 
                  backgroundColor: scoringLoading ? '#9ca3af' : '#3b82f6',
                  opacity: scoringLoading ? 0.7 : 1
                }]}
                onPress={() => {
                  console.log('Score Your Idea button pressed');
                  calculateIdeaScore();
                }}
                activeOpacity={0.8}
                disabled={scoringLoading}
              >
                {scoringLoading ? (
                  <>
                    <Ionicons name="hourglass" size={20} color="#ffffff" />
                    <Text style={styles.featureButtonText}>Calculating Scores...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="bulb" size={20} color="#ffffff" />
                    <Text style={styles.featureButtonText}>
                      {ideaScores ? 'Recalculate Scores' : 'Score Your Idea'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Coming Soon Features */}
            <View style={[styles.comingSoonCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <Text style={[styles.comingSoonTitle, { color: isDarkMode ? colors.text : '#111827' }]}>
                🚀 More Advanced Features Coming Soon
              </Text>
              <Text style={[styles.comingSoonText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                • Automated Market Research{'\n'}
                • AI Product Advisor Chat{'\n'}
                • Smart Action Plans
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  console.log('=== Rendering results screen ===');
  console.log('Loading:', actualLoading);
  console.log('isTabAccess:', isTabAccess);
  console.log('Deep analysis data:', deepAnalysis);
  
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
                <AnalysisTextRenderer content={deepAnalysis?.analysis || 'Analysis results will appear here...'} />
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
  stepIconPending: {
    backgroundColor: '#9ca3af',
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
  stepLabelPending: {
    color: '#9ca3af',
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
  progressBarFill: {
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
  progressPercentage: {
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
    fontSize: 16,
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
    fontSize: 16,
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
  featureSection: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 16,
    fontFamily: 'System',
  },
  scoringMetrics: {
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontWeight: '500',
    fontFamily: 'System',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBar: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 8,
  },
  scoreValue: {
    fontWeight: '500',
    fontFamily: 'System',
  },
  confidenceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  confidenceTitle: {
    fontWeight: '700',
    fontFamily: 'System',
  },
  confidenceReason: {
    fontSize: 16,
    fontFamily: 'System',
  },
  featureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  featureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  deepDiveGridContainer: {
    marginBottom: 24,
  },
  deepDiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deepDiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deepDiveCardContent: {
    flex: 1,
  },
  deepDiveCardName: {
    fontWeight: '700',
    fontFamily: 'System',
  },
  deepDiveCardDescription: {
    fontSize: 16,
    fontFamily: 'System',
  },
  comingSoonCard: {
    padding: 24,
    borderRadius: 16,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 16,
    fontFamily: 'System',
  },
  previewCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 16,
  },
  previewItems: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'System',
  },
  analysisToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  analysisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'center',
  },
  analysisToggleTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  analyzeButton: {
    padding: 16,
    borderRadius: 12,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  analysisContentContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  demoAnalysisContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  demoAnalysisTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
  },
  demoAnalysisText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  demoAnalysisButton: {
    padding: 16,
    borderRadius: 12,
  },
  demoAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  analysisLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 