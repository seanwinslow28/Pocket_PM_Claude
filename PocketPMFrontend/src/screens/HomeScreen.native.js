import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Modal,
  Switch,
  Alert,
  Animated,
  StatusBar,

} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import dummyDataService from '../services/dummyDataService';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const [idea, setIdea] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);

  // Animation refs
  const logoGlow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const typingDots = useRef([
    new Animated.Value(0.5),
    new Animated.Value(0.5),
    new Animated.Value(0.5),
  ]).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Quick prompts
  const quickPrompts = [
    '💡 New Idea',
    '📊 Market Analysis', 
    '🚀 Go-to-Market',
    '📈 Growth Strategy',
    '💬 AI Chat'
  ];

  useEffect(() => {
    loadUserData();
    loadRecentAnalyses();
    loadTestMode();
    startAnimations();
    initializeWelcomeMessages();
  }, []);

  const startAnimations = () => {
    // Logo glow animation
    Animated.loop(
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
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Floating shapes animation
    floatingShapes.forEach((shape, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shape, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(shape, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Typing animation
    const typingAnimation = () => {
      typingDots.forEach((dot, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(dot, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    };

    if (showTyping) {
      typingAnimation();
    }
  };

  const initializeWelcomeMessages = () => {
    const welcomeMessages = [
      {
        id: 1,
        type: 'user',
        content: 'I have an idea for a productivity app that helps remote teams stay connected. Can you help me develop this?',
        timestamp: new Date(),
      },
      {
        id: 2,
        type: 'ai',
        content: 'Excellent! Remote team connectivity is a huge opportunity. Let me break this down into a comprehensive product strategy. I\'ll analyze the market, identify your target users, and create an execution roadmap.',
        timestamp: new Date(),
      }
    ];
    setMessages(welcomeMessages);
    setShowTyping(true);
  };

  const loadUserData = async () => {
    const userData = await ApiService.getCurrentUser();
    setUser(userData);
  };

  const loadRecentAnalyses = async () => {
    const history = await StorageService.getAnalysisHistory();
    setRecentAnalyses(history.slice(0, 3));
  };

  const loadTestMode = async () => {
    try {
      const isTestModeEnabled = await dummyDataService.isTestModeEnabled();
      setTestMode(isTestModeEnabled);
    } catch (error) {
      console.error('Error loading test mode:', error);
    }
  };

  const handleTestModeToggle = async (value) => {
    try {
      await dummyDataService.setTestMode(value);
      setTestMode(value);
      
      Alert.alert(
        'Test Mode Updated',
        value 
          ? 'Test mode enabled. You\'ll now use dummy data instead of OpenAI API calls.' 
          : 'Test mode disabled. You\'ll now use real OpenAI API calls.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating test mode:', error);
      Alert.alert('Error', 'Failed to update test mode setting.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAnalyses();
    await loadTestMode();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigation.navigate('Loading', { 
        idea: idea.trim(),
      });
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    // Handle AI Chat navigation
    if (prompt.includes('AI Chat')) {
      navigation.navigate('Chat');
      return;
    }
    
    setIdea(prompt);
  };

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const getFloatingShapeStyle = (index) => {
    const translateY = floatingShapes[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });
    const rotate = floatingShapes[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    
    return {
      transform: [{ translateY }, { rotate }],
    };
  };

  const renderMessage = (message, index) => {
    const isUser = message.type === 'user';
    return (
      <Animatable.View
        key={message.id}
        animation="fadeInUp"
        delay={index * 200}
        style={styles.messageContainer}
      >
        {/* Always show avatar on the left */}
        {isUser ? (
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={['#ff6b6b', '#4ecdc4']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>U</Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={['#4ecdc4', '#45b7d1']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>PM</Text>
            </LinearGradient>
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {isUser ? (
            <LinearGradient
              colors={['#ff6b6b', '#4ecdc4']}
              style={styles.userMessageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.userMessageText}>{message.content}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.aiMessageWrapper}>
              <Text style={styles.aiMessageText}>{message.content}</Text>
            </View>
          )}
        </View>
      </Animatable.View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.messageContainer}>
      <View style={styles.aiAvatar}>
        <LinearGradient
          colors={['#4ecdc4', '#45b7d1']}
          style={styles.avatarGradient}
        >
          <Text style={styles.avatarText}>PM</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.typingBubble}>
        <View style={styles.typingDotsContainer}>
          {typingDots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  opacity: dot,
                  transform: [
                    {
                      scale: dot.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const SettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowSettingsModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🧪 Development</Text>
              <Text style={styles.modalSectionDescription}>
                Settings for development and testing
              </Text>

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="flask" size={24} color="#7B68EE" />
                  </View>
                  <View style={styles.settingItemText}>
                    <Text style={styles.settingTitle}>Test Mode</Text>
                    <Text style={styles.settingDescription}>
                      Use dummy data instead of OpenAI API
                    </Text>
                  </View>
                </View>
                <Switch
                  value={testMode}
                  onValueChange={handleTestModeToggle}
                  trackColor={{ false: '#767577', true: '#4ecdc4' }}
                  thumbColor={testMode ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Background Shapes */}
      <View style={styles.floatingElements} pointerEvents="none">
        <Animated.View style={[styles.floatingShape1, getFloatingShapeStyle(0)]}>
          <LinearGradient
            colors={['#ff6b6b', '#4ecdc4']}
            style={styles.shapeGradient}
          />
        </Animated.View>
        <Animated.View style={[styles.floatingShape2, getFloatingShapeStyle(1)]}>
          <LinearGradient
            colors={['#4ecdc4', '#45b7d1']}
            style={styles.shapeGradient}
          />
        </Animated.View>
        <Animated.View style={[styles.floatingShape3, getFloatingShapeStyle(2)]}>
          <LinearGradient
            colors={['#45b7d1', '#ff6b6b']}
            style={styles.shapeGradient}
          />
        </Animated.View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header with exact styling */}
        <View style={styles.header}>
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Ionicons name="settings" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.logoText}>PM</Text>
                  {/* Shimmer overlay */}
                  <Animated.View
                    style={[
                      styles.shimmerOverlay,
                      {
                        transform: [{ translateX: shimmerTranslate }],
                      },
                    ]}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.logoTitle}>Pocket PM</Text>
            </View>
            
            <View style={styles.headerSpacer} />
          </BlurView>
        </View>

        {/* Chat Container */}
        <ScrollView 
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ecdc4"
            />
          }
        >
          {/* Welcome Message - exact styling */}
          <View style={styles.welcomeContainer}>
            <LinearGradient
              colors={['#ff6b6b', '#4ecdc4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeTitleNativeGradient}
            >
              <Text style={styles.welcomeTitleNative}>
                Your AI Product Strategist
              </Text>
            </LinearGradient>
            <Text style={styles.welcomeSubtitle}>
              Turn your ideas into actionable product roadmaps
            </Text>
          </View>

          {/* Quick Prompts - exact styling */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsContainer}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPromptWrapper}
                onPress={() => handleQuickPrompt(prompt)}
                activeOpacity={0.7}
              >
                <View style={styles.quickPrompt}>
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages */}
          {messages.map((message, index) => renderMessage(message, index))}
          
          {/* Typing Indicator */}
          {showTyping && renderTypingIndicator()}
        </ScrollView>

        {/* Input Container - exact styling */}
        <View style={styles.inputContainer}>
          <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Describe your product idea..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={idea}
                onChangeText={setIdea}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButtonWrapper}
                onPress={handleAnalyze}
                disabled={!idea.trim() || isAnalyzing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  style={styles.sendButton}
                >
                  <Ionicons 
                    name={isAnalyzing ? "hourglass" : "arrow-forward"} 
                    size={16} 
                    color="white" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </SafeAreaView>

      <SettingsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingShape1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.1,
  },
  floatingShape2: {
    position: 'absolute',
    top: '60%',
    right: '15%',
    width: 40,
    height: 40,
    borderRadius: 8,
    opacity: 0.1,
  },
  floatingShape3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.1,
  },
  shapeGradient: {
    flex: 1,
    borderRadius: 40,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 80,
  },
  headerBlur: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    left: 20,
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 2,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '45deg' }],
  },
  logoTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 36,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 24,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitleNativeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  welcomeTitleNative: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  quickPromptsContainer: {
    marginBottom: 20,
  },
  quickPromptsContent: {
    paddingHorizontal: 4,
  },
  quickPromptWrapper: {
    marginRight: 8,
  },
  quickPrompt: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  quickPromptText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    borderBottomLeftRadius: 8,
  },
  aiBubble: {
    borderBottomLeftRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userMessageGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  aiMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  typingDotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34, // Extra padding for home indicator
  },
  inputBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  messageInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 24,
    textAlignVertical: 'center',
  },
  sendButtonWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSectionDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
