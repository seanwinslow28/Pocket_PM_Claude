// src/components/ChatMessage.js
// Complete message component with proper animations and styling

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Function to clean up text formatting for better mobile display
const formatText = (text, isChunkedMessage = false) => {
  if (!text) return '';
  
  let formattedText = text
    // Remove problematic characters that show as diamonds
    .replace(/[^\w\s\n\r\u00A0-\uFFFF.,!?;:()\-\[\]{}'"/$%&*+=<>@#\|\\~`^]/g, '')
    // Remove any section break artifacts
    .replace(/===.*?===/g, '')
    // Keep bold markdown for emphasis but clean it up
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove any leftover markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Trim whitespace
    .trim();
  
  return formattedText;
};

const ChatMessage = ({ message, onAction }) => {
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
              {/* Chunked Message with Title */}
              {message.chunkedData ? (
                <>
                  <Text style={styles.chunkTitle}>{message.chunkTitle || 'Analysis'}</Text>
                  <Text style={styles.aiMessageText}>{formatText(message.text, true)}</Text>
                </>
              ) : (
                <Text style={styles.aiMessageText}>{formatText(message.text)}</Text>
              )}
              
              {/* Action Button for Chunked Messages */}
              {message.chunkedData && message.chunkedData.nextPrompt && onAction && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onAction('showNext', message.chunkedData)}
                >
                  <LinearGradient
                    colors={['#4ecdc4', '#45b7d1']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>
                      {message.chunkedData.nextPrompt}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
    paddingLeft: 16,
  },
  aiMessage: {
    flexDirection: 'row',
    paddingRight: 16,
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
    maxWidth: width * 0.85,
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
  chunkTitle: {
    color: 'white',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: 'rgba(69, 183, 209, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
};

export default ChatMessage; 