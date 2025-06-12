import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import ApiService from '../services/api';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "I have an idea for a productivity app that helps remote teams stay connected. Can you help me develop this?",
      isUser: true,
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Excellent! Remote team connectivity is a huge opportunity. Let me break this down into a comprehensive product strategy. I'll analyze the market, identify your target users, and create an execution roadmap.",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollViewRef = useRef(null);
  
  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Get initial context from route params if navigated from another screen
  const initialContext = route?.params?.initialMessage || null;

  useEffect(() => {
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

    // If there's an initial context, add it as the first user message
    if (initialContext) {
      sendMessage(initialContext, false);
    }

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
    };
  }, []);

  const sendMessage = async (messageText = null, updateInput = true) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const newMessage = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    if (updateInput) setInputText('');
    setIsTyping(true);

    try {
      // Use your existing API service for AI analysis
      const response = await ApiService.analyzeIdea(textToSend);
      
      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          text: response.data.analysis,
          isUser: false,
          timestamp: new Date(),
          analysisData: response.data, // Store full analysis data
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Handle error
        const errorResponse = {
          id: Date.now() + 1,
          text: `Sorry, I encountered an error: ${response.error}. Please try again.`,
          isUser: false,
          timestamp: new Date(),
          isError: true,
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputText(prompt);
  };

  const renderMessage = (message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.aiMessage,
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
            <BlurView intensity={20} tint="dark" style={styles.aiMessageBlur}>
              <Text style={styles.aiMessageText}>{message.text}</Text>
              
              {/* Action buttons for AI responses with analysis data */}
              {!message.isError && message.analysisData && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Navigate to full analysis screen
                    navigation.navigate('AnalysisResults', {
                      analysisData: message.analysisData
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>📊 View Full Analysis</Text>
                </TouchableOpacity>
              )}
            </BlurView>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.avatar, styles.aiAvatar]}>
          <Text style={styles.avatarText}>PM</Text>
        </View>
        <BlurView intensity={20} tint="dark" style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </BlurView>
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
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <BlurView intensity={20} tint="dark" style={styles.header}>
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
          </BlurView>

          {/* Chat Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <MaskedView
                style={styles.welcomeTitleContainer}
                maskElement={
                  <Text style={styles.welcomeTitleMask}>
                    Your AI Product Strategist
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.welcomeTitleGradient}
                />
              </MaskedView>
              <Text style={styles.welcomeSubtitle}>
                Turn your ideas into actionable product roadmaps
              </Text>
            </View>

            {/* Quick Prompts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickPromptsContainer}
              contentContainerStyle={styles.quickPromptsContent}
            >
              {['💡 New Idea', '📊 Market Analysis', '🚀 Go-to-Market', '📈 Growth Strategy'].map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPrompt}
                  onPress={() => handleQuickPrompt(prompt)}
                >
                  <BlurView intensity={15} tint="dark" style={styles.quickPromptBlur}>
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Messages */}
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
          </ScrollView>

          {/* Input Container */}
          <BlurView intensity={20} tint="dark" style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Describe your product idea..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 24,
    paddingBottom: 100,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitleContainer: {
    height: 35,
    marginBottom: 8,
  },
  welcomeTitleMask: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  welcomeTitleGradient: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Quick Prompts
  quickPromptsContainer: {
    marginBottom: 20,
  },
  quickPromptsContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  quickPrompt: {
    marginRight: 8,
  },
  quickPromptBlur: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickPromptText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  // Messages
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: width * 0.75,
    borderRadius: 20,
  },
  userMessageContent: {
    borderBottomRightRadius: 8,
  },
  aiMessageContent: {
    borderBottomLeftRadius: 8,
  },
  userMessageGradient: {
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 8,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageBlur: {
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  aiMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '500',
  },
  // Typing Indicator
  typingIndicator: {
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  // Input
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default ChatScreen; 