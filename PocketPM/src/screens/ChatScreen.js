import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import QuickPrompts from '../components/QuickPrompts';
import GradientText from '../components/GradientText';
import ApiService from '../services/aiService'; // Your existing backend service

const { width } = Dimensions.get('window');

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! What ideas would you like to share with me today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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
            duration: 6000 + (index * 1000),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 6000 + (index * 1000),
            useNativeDriver: true,
          }),
        ])
      );
      setTimeout(() => floatingAnimation.start(), index * 2000);
    });

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Call your existing backend service with the integrated prompt
      const response = await ApiService.analyzeIdea(currentInput);
      
      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          text: response.data.analysis,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        Alert.alert('Error', response.error || 'Failed to get AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputText(prompt);
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
      {floatingShapes.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingShape,
            {
              transform: [{
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              }, {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            },
            index === 0 && styles.floatingShape1,
            index === 1 && styles.floatingShape2,
            index === 2 && styles.floatingShape3,
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header - Now properly respects safe area */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <Animated.View style={[
            styles.logo,
            {
              shadowColor: logoGlow.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(78, 205, 196, 0.3)', 'rgba(255, 107, 107, 0.6)'],
              }),
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 15,
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

        {/* Main Content with Keyboard Avoidance */}
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Chat Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome Message with TRUE SVG Gradient Text */}
            <View style={styles.welcomeContainer}>
              <GradientText 
                colors={['#ff6b6b', '#4ecdc4']}
                fontSize={24}
                fontWeight="700"
                style={styles.gradientTextContainer}
              >
                Your AI Product Strategist
              </GradientText>
              <Text style={styles.welcomeSubtitle}>
                Turn your ideas into actionable product roadmaps
              </Text>
            </View>

            {/* Quick Prompts */}
            <QuickPrompts onPromptPress={handleQuickPrompt} />

            {/* Messages */}
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Typing Indicator */}
            <TypingIndicator isVisible={isTyping} />
          </ScrollView>

          {/* Input Container - Now relative positioned for better keyboard handling */}
          <View style={styles.inputContainer}>
            <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Describe your product idea..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  maxLength={500}
                  onFocus={() => {
                    // Scroll to bottom when focused
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
                <TouchableOpacity
                  style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
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
          </View>
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
    opacity: 0.08,
  },
  floatingShape1: {
    top: '20%', // Moved down to avoid notch area
    left: '10%',
    width: 80,
    height: 80,
    backgroundColor: '#ff6b6b',
    borderRadius: 40,
  },
  floatingShape2: {
    top: '55%', // Adjusted positioning
    right: '15%',
    width: 60,
    height: 60,
    backgroundColor: '#4ecdc4',
    borderRadius: 12,
  },
  floatingShape3: {
    bottom: '30%', // Moved up to avoid input area
    left: '20%',
    width: 100,
    height: 100,
    backgroundColor: '#45b7d1',
    borderRadius: 50,
  },
  // Header - Better safe area handling
  header: {
    paddingVertical: 15,
    paddingTop: 20, // Extra padding for camera area
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 24,
    paddingBottom: 20, // Reduced padding since input is now relative
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  gradientTextContainer: {
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Input - Better keyboard handling
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputBlur: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15, // Extra bottom padding for iOS
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 12,
    height: 60,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    maxHeight: 100,
    height: 44,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: Platform.OS === 'ios' ? 'center' : 'top',
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
    includeFontPadding: false,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
};

export default ChatScreen; 