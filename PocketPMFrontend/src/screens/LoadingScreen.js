import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import StorageService from '../utils/storage';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ route, navigation }) => {
  const { idea } = route.params;
  
  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  const [loadingText, setLoadingText] = useState('Analyzing your idea...');
  const [progress, setProgress] = useState(0);

  // Extract product name from idea for display
  const getProductName = (ideaText) => {
    const ideaParts = ideaText.split(':');
    if (ideaParts.length > 1) {
      return ideaParts[0].trim();
    }
    // Extract first few words if no colon
    const words = ideaText.trim().split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

  const productName = getProductName(idea);

  useEffect(() => {
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

    // Pulse animation for loading indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    // Start progress animation
    startProgressAnimation();
    
    // Start analysis
    performAnalysis();
    
    // Cycling loading messages
    const messages = [
      'Analyzing your idea...',
      'Researching market opportunities...',
      'Evaluating competitive landscape...',
      'Assessing technical feasibility...',
      'Generating strategic insights...',
      'Finalizing analysis...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingText(messages[messageIndex]);
    }, 3000);

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
      pulseAnimation.stop();
      clearInterval(messageInterval);
    };
  }, []);

  const startProgressAnimation = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 20000, // 20 seconds for full progress
      useNativeDriver: false,
    }).start();

    // Update progress percentage
    const progressListener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value * 100));
    });

    return () => {
      progressAnim.removeListener(progressListener);
    };
  };

  const performAnalysis = async () => {
    try {
      const result = await ApiService.analyzeIdea(idea);

      if (result.success && result.data.analysis) {
        // Save analysis to storage
        await StorageService.saveAnalysis({
          idea: idea,
          analysis: result.data.analysis,
          usage: result.data.usage,
          testMode: result.data.testMode
        });

        // Show completion state briefly
        setLoadingText('✨ Analysis Complete!');
        setProgress(100);
        
        // Auto-navigate after 1.5 seconds
        setTimeout(() => {
          navigation.replace('AnalysisResults', {
            idea: idea,
            analysis: result.data.analysis,
            usage: result.data.usage,
            testMode: result.data.testMode
          });
        }, 1500);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed', 
        'Something went wrong analyzing your idea. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderLoadingDots = () => {
    const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
    
    useEffect(() => {
      const animations = dots.map((dot, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * 200);
      });
      
      return () => animations.forEach(anim => anim.stop());
    }, []);

    return (
      <View style={styles.loadingDots}>
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.loadingDot,
              {
                opacity: dot,
                transform: [{
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
    );
  };

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
          
          {/* Header with Logo */}
          <View style={styles.header}>
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
                <Text style={styles.logoIconText}>PM</Text>
              </LinearGradient>
              <Text style={styles.logoText}>Pocket PM</Text>
            </Animated.View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            
            {/* AI Brain Animation */}
            <Animated.View style={[
              styles.brainContainer,
              {
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  })
                }]
              }
            ]}>
              <BlurView intensity={20} tint="dark" style={styles.brainBlur}>
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.brainGradient}
                >
                  <Ionicons name="bulb" size={60} color="white" />
                </LinearGradient>
                {renderLoadingDots()}
              </BlurView>
            </Animated.View>

            {/* Product Info */}
            <BlurView intensity={15} tint="dark" style={styles.ideaContainer}>
              <Text style={styles.ideaLabel}>Analyzing:</Text>
              <MaskedView
                style={styles.ideaTitleContainer}
                maskElement={
                  <Text style={styles.ideaTitleMask}>
                    {productName}
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.ideaTitleGradient}
                />
              </MaskedView>
            </BlurView>

            {/* Loading Text */}
            <Text style={styles.loadingText}>{loadingText}</Text>

            {/* Progress Bar */}
            <BlurView intensity={15} tint="dark" style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={['#ff6b6b', '#4ecdc4']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={[styles.progressFill, { width: progressWidth }]}
                  />
                </Animated.View>
              </View>
              <Text style={styles.progressText}>{progress}% Complete</Text>
            </BlurView>

            {/* Status Indicators */}
            <View style={styles.statusContainer}>
              {['Market Research', 'Competitive Analysis', 'Technical Assessment', 'Strategic Planning'].map((status, index) => (
                <BlurView key={index} intensity={10} tint="dark" style={styles.statusItem}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: progress > (index + 1) * 25 ? '#4ecdc4' : 'rgba(255,255,255,0.3)' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: progress > (index + 1) * 25 ? '#4ecdc4' : 'rgba(255,255,255,0.6)' }
                  ]}>
                    {status}
                  </Text>
                  {progress > (index + 1) * 25 && (
                    <Ionicons name="checkmark-circle" size={16} color="#4ecdc4" />
                  )}
                </BlurView>
              ))}
            </View>

          </View>
        </Animated.View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Main Content
  mainContent: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  // Brain Animation
  brainContainer: {
    marginBottom: 20,
  },
  brainBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  brainGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingDots: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  // Product Info
  ideaContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    minWidth: 280,
  },
  ideaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 8,
  },
  ideaTitleContainer: {
    height: 32,
  },
  ideaTitleMask: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  ideaTitleGradient: {
    flex: 1,
  },
  // Loading Text
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    minHeight: 25,
  },
  // Progress
  progressContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Status Indicators
  statusContainer: {
    width: '100%',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
};

export default LoadingScreen; 