// src/screens/OnboardingScreen.js
// Beautiful onboarding experience with swipeable cards

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    emoji: '🚀',
    title: 'Turn Ideas Into Products',
    subtitle: 'Transform your product concepts into comprehensive strategies with AI-powered analysis',
    features: ['Market Analysis', 'User Personas', 'Go-to-Market Strategy']
  },
  {
    id: 2,
    emoji: '🎯',
    title: 'Strategic Planning Made Easy',
    subtitle: 'Get detailed roadmaps, competitive analysis, and actionable insights in minutes',
    features: ['RICE Prioritization', 'Sprint Planning', 'OKR Setting']
  },
  {
    id: 3,
    emoji: '💡',
    title: 'Your AI Product Partner',
    subtitle: 'Like having a senior PM mentor available 24/7 to guide your product decisions',
    features: ['Expert Guidance', 'Best Practices', 'Real-time Feedback']
  }
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const { completeOnboarding } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate in the first card
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({ x: prevIndex * width, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.navigate('Auth');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.navigate('Auth');
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Floating Background Elements */}
      <View style={styles.floatingShape1} />
      <View style={styles.floatingShape2} />
      <View style={styles.floatingShape3} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {onboardingData.map((item, index) => (
              <View key={item.id} style={styles.slide}>
                {/* Emoji Icon */}
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>

                {/* Title */}
                <GradientText
                  colors={['#ff6b6b', '#4ecdc4']}
                  fontSize={28}
                  fontWeight="700"
                  style={styles.title}
                >
                  {item.title}
                </GradientText>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {item.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureItem}>
                      <View style={styles.featureDot} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={goToPrevious} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentIndex < onboardingData.length - 1 ? (
            <TouchableOpacity onPress={goToNext} style={styles.primaryButton}>
              <LinearGradient
                colors={['#ff6b6b', '#4ecdc4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleGetStarted} style={styles.primaryButton}>
              <LinearGradient
                colors={['#ff6b6b', '#4ecdc4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
  // Floating background elements
  floatingShape1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 40,
  },
  floatingShape2: {
    position: 'absolute',
    top: '50%',
    right: '15%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderRadius: 12,
  },
  floatingShape3: {
    position: 'absolute',
    bottom: '25%',
    left: '20%',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(69, 183, 209, 0.08)',
    borderRadius: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ecdc4',
    marginRight: 12,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#4ecdc4',
    width: 24,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
};

export default OnboardingScreen; 