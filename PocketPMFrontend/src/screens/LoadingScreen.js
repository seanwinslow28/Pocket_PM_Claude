import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { idea } = route.params;
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pencilX = useRef(new Animated.Value(0)).current;
  const pencilY = useRef(new Animated.Value(0)).current;
  const pencilRotation = useRef(new Animated.Value(0)).current;
  
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

    // Start pencil animation
    startPencilAnimation();
    
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
      clearInterval(messageInterval);
    };
  }, []);

  const startPencilAnimation = () => {
    // Generate natural scribbling movement - just pencil motion, no actual drawing
    const generateScribblingMotion = () => {
      const centerX = 120;
      const startY = 60;
      const points = [];
      
      // Create natural scribbling movements across the paper
      for (let i = 0; i < 20; i++) {
        const x = 40 + Math.random() * 140; // Random X across paper width
        const y = startY + (i * 8) + (Math.random() * 10 - 5); // Roughly descending with variation
        const delay = i * 400 + Math.random() * 200; // Varied timing
        
        points.push({ x, y, delay });
      }
      
      return points;
    };

    const scribblingPath = generateScribblingMotion();

    // Animate pencil in natural scribbling motion
    const animateScribbling = () => {
      scribblingPath.forEach((point, index) => {
        setTimeout(() => {
          // Move pencil with natural writing motion
          Animated.parallel([
            Animated.timing(pencilX, {
              toValue: point.x - 15,
              duration: 300 + Math.random() * 200, // Varied speed
              useNativeDriver: true,
            }),
            Animated.timing(pencilY, {
              toValue: point.y - 15,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(pencilRotation, {
              toValue: -20 + Math.random() * 40, // Natural hand angle variation
              duration: 250,
              useNativeDriver: true,
            })
          ]).start();
        }, point.delay);
      });
    };

    // Start animation and loop it
    animateScribbling();
    
    // Loop the animation every 10 seconds with new random path
    const loopInterval = setInterval(() => {
      // Generate new random scribbling path
      const newPath = generateScribblingMotion();
      
      // Animate new path
      newPath.forEach((point, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(pencilX, {
              toValue: point.x - 15,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(pencilY, {
              toValue: point.y - 15,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(pencilRotation, {
              toValue: -20 + Math.random() * 40,
              duration: 250,
              useNativeDriver: true,
            })
          ]).start();
        }, point.delay);
      });
    }, 10000);

    return () => clearInterval(loopInterval);
  };

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
        
        // Auto-navigate after 1.5 seconds with slide animation
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f5f5f5' }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Paper and Pencil Animation */}
        <View style={styles.paperContainer}>
          {/* Paper */}
          <View style={[styles.paper, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
            {/* Red margin line */}
            <View style={styles.marginLine} />
            
            {/* Blue horizontal lines */}
            {Array.from({ length: 12 }).map((_, index) => (
              <View key={index} style={[styles.horizontalLine, { top: 35 + index * 20, backgroundColor: isDarkMode ? colors.border : '#e3f2fd' }]} />
            ))}
            
            {/* No actual drawing - just pencil motion */}
          </View>
          
          {/* Animated Pencil */}
          <Animated.View
            style={[
              styles.pencilContainer,
              {
                transform: [
                  { translateX: pencilX },
                  { translateY: pencilY },
                  { rotate: pencilRotation.interpolate({
                    inputRange: [-30, 30],
                    outputRange: ['-30deg', '30deg']
                  })}
                ]
              }
            ]}
          >
            {/* Pencil Body */}
            <View style={styles.pencil}>
              {/* Pencil tip */}
              <View style={styles.pencilTip} />
              {/* Pencil wood */}
              <View style={styles.pencilWood} />
              {/* Pencil body */}
              <View style={styles.pencilBody} />
              {/* Pencil eraser ferrule */}
              <View style={styles.pencilFerrule} />
              {/* Pencil eraser */}
              <View style={styles.pencilEraser} />
            </View>
          </Animated.View>
        </View>

        {/* Product Info */}
        <View style={styles.ideaContainer}>
          <Text style={[styles.ideaLabel, { color: isDarkMode ? colors.textSecondary : '#666' }]}>Analyzing:</Text>
          <Text style={[styles.ideaName, { color: isDarkMode ? colors.text : '#2c3e50' }]}>{productName}</Text>
        </View>

        {/* Loading Text */}
        <Text style={[styles.loadingText, { color: isDarkMode ? colors.text : '#2c3e50' }]}>{loadingText}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDarkMode ? colors.border : '#e9ecef' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: colors.primary || '#ff6b6b' }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: isDarkMode ? colors.textSecondary : '#666' }]}>{progress}% Complete</Text>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paperContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  paper: {
    width: 240,
    height: 300,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  marginLine: {
    position: 'absolute',
    left: 25,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ff6b6b',
  },
  horizontalLine: {
    position: 'absolute',
    left: 35,
    right: 15,
    height: 1,
  },
  pencilContainer: {
    position: 'absolute',
    top: 50,
    left: 50,
    width: 80,
    height: 20,
    zIndex: 10,
  },
  pencil: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 12,
  },
  pencilTip: {
    width: 8,
    height: 8,
    backgroundColor: '#2c3e50',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    transform: [{ scaleX: 1.5 }],
  },
  pencilWood: {
    width: 4,
    height: 10,
    backgroundColor: '#d4af37',
  },
  pencilBody: {
    width: 50,
    height: 12,
    backgroundColor: '#ffd700',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e6c200',
  },
  pencilFerrule: {
    width: 8,
    height: 12,
    backgroundColor: '#c0392b',
  },
  pencilEraser: {
    width: 6,
    height: 10,
    backgroundColor: '#ff69b4',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  ideaContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ideaLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  ideaName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    minHeight: 25,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoadingScreen; 