// src/components/TypingIndicator.js
// Enhanced typing indicator with smooth animations

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

const TypingIndicator = ({ isVisible }) => {
  // Animation refs for each dot
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];
  
  // Container animation for smooth show/hide
  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Show container first
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate dots with staggered timing
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
      
      // Start each animation with a 200ms delay
      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * 200);
      });
      
      return () => animations.forEach(anim => anim.stop());
    } else {
      // Hide container
      Animated.timing(containerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Reset dots
      dots.forEach(dot => dot.setValue(0));
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          opacity: containerAnim,
          transform: [{
            translateY: containerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }
      ]}
    >
      {/* AI Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>PM</Text>
      </View>
      
      {/* Typing Container */}
      <View style={styles.typingContainer}>
        <BlurView intensity={20} tint="dark" style={styles.typingIndicator}>
          <Text style={styles.typingText}>AI Product Manager is thinking</Text>
          <View style={styles.typingDots}>
            {dots.map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
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
        </BlurView>
      </View>
    </Animated.View>
  );
};

const styles = {
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    paddingRight: 40,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    marginHorizontal: 8,
    marginTop: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  typingContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'rgba(78, 205, 196, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  typingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ecdc4',
  },
};

export default TypingIndicator; 