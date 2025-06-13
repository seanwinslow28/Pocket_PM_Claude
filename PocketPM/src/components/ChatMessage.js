// src/components/ChatMessage.js
// Complete message component with proper animations and styling

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ChatMessage = ({ message }) => {
  // Animation refs for smooth message appearance
  const messageAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Stagger the animations for a polished effect
    Animated.parallel([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
        {
          opacity: messageAnim,
          transform: [
            {
              translateY: messageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            },
            {
              scale: scaleAnim
            }
          ]
        }
      ]}
    >
      {/* Avatar */}
      <View style={[
        styles.avatar,
        message.isUser ? styles.userAvatar : styles.aiAvatar
      ]}>
        <Text style={styles.avatarText}>
          {message.isUser ? 'U' : 'PM'}
        </Text>
      </View>
      
      {/* Message Content */}
      <View style={[
        styles.messageContent,
        message.isUser ? styles.userMessageContent : styles.aiMessageContent
      ]}>
        {message.isUser ? (
          // User message with coral-to-teal gradient
          <LinearGradient
            colors={['#ff6b6b', '#4ecdc4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.userMessageGradient}
          >
            <Text style={styles.userMessageText}>{message.text}</Text>
          </LinearGradient>
        ) : (
          // AI message with glassmorphism effect
          <View style={styles.aiMessageContainer}>
            <BlurView intensity={20} tint="dark" style={styles.aiMessageBlur}>
              <Text style={styles.aiMessageText}>{message.text}</Text>
            </BlurView>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = {
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    flexDirection: 'row-reverse',
    paddingLeft: 40,
  },
  aiMessage: {
    flexDirection: 'row',
    paddingRight: 40,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  userAvatar: {
    backgroundColor: '#ff6b6b',
  },
  aiAvatar: {
    backgroundColor: '#4ecdc4',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageContent: {
    flex: 1,
    maxWidth: width * 0.75,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  aiMessageContent: {
    alignItems: 'flex-start',
  },
  userMessageGradient: {
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: 'rgba(255, 107, 107, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiMessageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: 'rgba(78, 205, 196, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  aiMessageBlur: {
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  aiMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
};

export default ChatMessage; 