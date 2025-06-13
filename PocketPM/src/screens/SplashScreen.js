// src/screens/SplashScreen.js
// Beautiful animated splash screen

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import GradientText from '../components/GradientText';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations for a polished loading experience
    Animated.sequence([
      // Background fade in
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      // Logo scale and fade in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[
          backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#000000', '#0a0a0a'],
          }),
          '#1a1a1a',
          backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#000000', '#0f0f0f'],
          }),
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}
      >
        {/* Floating Background Elements */}
        <View style={styles.floatingShape1} />
        <View style={styles.floatingShape2} />
        <View style={styles.floatingShape3} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }]
              }
            ]}
          >
            <LinearGradient
              colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.logoIcon}
            >
              <GradientText
                colors={['#ffffff', '#ffffff']}
                fontSize={32}
                fontWeight="800"
              >
                PM
              </GradientText>
            </LinearGradient>
          </Animated.View>

          {/* App Title */}
          <Animated.View 
            style={[
              styles.titleContainer,
              { opacity: textOpacity }
            ]}
          >
            <GradientText
              colors={['#ff6b6b', '#4ecdc4']}
              fontSize={28}
              fontWeight="700"
              style={styles.title}
            >
              Pocket PM
            </GradientText>
            
            <Animated.Text 
              style={[
                styles.subtitle,
                { opacity: textOpacity }
              ]}
            >
              Your AI Product Strategist
            </Animated.Text>
          </Animated.View>
        </View>

        {/* Loading Indicator */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            { opacity: textOpacity }
          ]}
        >
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                {
                  width: backgroundAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Floating background elements
  floatingShape1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 30,
  },
  floatingShape2: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 8,
  },
  floatingShape3: {
    position: 'absolute',
    bottom: '25%',
    left: '25%',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(69, 183, 209, 0.1)',
    borderRadius: 40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: 'rgba(255, 107, 107, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 2,
  },
};

export default SplashScreen; 