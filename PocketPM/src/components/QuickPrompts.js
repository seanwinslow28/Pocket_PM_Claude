// src/components/QuickPrompts.js
// Enhanced quick prompts with animations and better UX

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

// Expanded prompt options for better AI PM experience
const QUICK_PROMPTS = [
  { emoji: '💡', text: 'New Idea', fullPrompt: 'I have a new product idea that I need help developing and analyzing.' },
  { emoji: '📊', text: 'Market Analysis', fullPrompt: 'Can you help me analyze the market opportunity for my idea?' },
  { emoji: '🚀', text: 'Go-to-Market', fullPrompt: 'I need a comprehensive go-to-market strategy for my product.' },
  { emoji: '📈', text: 'Growth Strategy', fullPrompt: 'Help me create a growth strategy and identify key metrics to track.' },
  { emoji: '🎯', text: 'User Personas', fullPrompt: 'Can you help me define detailed user personas for my target market?' },
  { emoji: '⚡', text: 'MVP Planning', fullPrompt: 'I need help planning my minimum viable product and feature prioritization.' },
];

const QuickPrompts = ({ onPromptPress }) => {
  const animatedValues = useRef(
    QUICK_PROMPTS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Stagger the animation of prompt buttons
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // 100ms delay between each button
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, []);

  const handlePromptPress = (prompt) => {
    // Add haptic feedback and pass the full prompt text
    onPromptPress(prompt.fullPrompt);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Start</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_PROMPTS.map((prompt, index) => (
          <Animated.View
            key={index}
            style={[
              styles.promptButtonWrapper,
              {
                opacity: animatedValues[index],
                transform: [{
                  translateY: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.promptButton}
              onPress={() => handlePromptPress(prompt)}
              activeOpacity={0.7}
            >
              <BlurView intensity={15} tint="dark" style={styles.promptBlur}>
                <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
                <Text style={styles.promptText}>{prompt.text}</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  scrollView: {
    // No additional styles needed
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  promptButtonWrapper: {
    marginRight: 12,
  },
  promptButton: {
    // Wrapper for touch handling
  },
  promptBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  promptEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  promptText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
};

export default QuickPrompts; 