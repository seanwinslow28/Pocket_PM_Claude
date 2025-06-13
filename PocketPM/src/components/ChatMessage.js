import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ChatMessage = ({ message }) => {
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
        {
          opacity: messageAnim,
          transform: [{
            translateY: messageAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }
      ]}
    >
      <View style={[
        styles.avatar,
        message.isUser ? styles.userAvatar : styles.aiAvatar
      ]}>
        <Text style={styles.avatarText}>
          {message.isUser ? 'U' : 'PM'}
        </Text>
      </View>
      
      <View style={[
        styles.messageContent,
        message.isUser ? styles.userMessageContent : styles.aiMessageContent
      ]}>
        {message.isUser ? (
          <LinearGradient
            colors={['#ff6b6b', '#4ecdc4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.userMessageGradient}
          >
            <Text style={styles.userMessageText}>{message.text}</Text>
          </LinearGradient>
        ) : (
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
    marginBottom: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    minHeight: 50,
    justifyContent: 'center',
  },
  userMessageText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  aiMessageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  aiMessageBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  aiMessageText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
};

export default ChatMessage; 