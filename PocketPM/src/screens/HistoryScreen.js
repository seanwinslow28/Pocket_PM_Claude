// src/screens/HistoryScreen.js
// Beautiful conversation history with search and categories

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import ConversationService from '../services/conversationService';

const categories = ['All', 'Product Strategy', 'Market Research', 'User Research', 'Growth', 'Analytics'];

const HistoryScreen = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initial animation
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

  // Reload conversations when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [user])
  );

  // Load conversations from storage
  const loadConversations = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'default';
      
      // Regenerate conversation data on first load to ensure proper titles/previews
      const userConversations = await ConversationService.regenerateConversationData(userId);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to regular load if regeneration fails
      try {
        const userConversations = await ConversationService.getConversations(userId);
        setConversations(userConversations);
      } catch (fallbackError) {
        console.error('Fallback load also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter conversations based on search and category
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || conversation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleConversationPress = (conversation) => {
    const messageCount = conversation.messages ? conversation.messages.length : 0;
    const userMessages = conversation.messages ? conversation.messages.filter(m => m.isUser).length : 0;
    
    Alert.alert(
      conversation.title,
      `Category: ${conversation.category}\nDate: ${formatDate(conversation.date)}\nMessages: ${messageCount} (${userMessages} from you)\n\n${conversation.preview}\n\nKey insights: ${conversation.analysis}`,
      [
        { text: 'OK' },
        // TODO: In the future, could add "View Full Conversation" button to navigate to a detailed view
      ]
    );
  };

  const handleDeleteConversation = (id) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = user?.id || 'default';
              const updatedConversations = await ConversationService.deleteConversation(id, userId);
              setConversations(updatedConversations);
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation. Please try again.');
            }
          }
        }
      ]
    );
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
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <GradientText
            colors={['#ff6b6b', '#4ecdc4']}
            fontSize={24}
            fontWeight="700"
            style={styles.title}
          >
            History
          </GradientText>
          <Text style={styles.subtitle}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={15} tint="dark" style={styles.searchBlur}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View 
          style={[
            styles.categoryContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {selectedCategory === category ? (
                  <LinearGradient
                    colors={['#ff6b6b', '#4ecdc4']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.activeCategoryText}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.categoryText}>{category}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Conversations List */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingEmoji}>⏳</Text>
              <Text style={styles.loadingText}>Loading your conversations...</Text>
            </View>
          ) : filteredConversations.length > 0 ? (
            <ScrollView 
              style={styles.conversationsList}
              showsVerticalScrollIndicator={false}
            >
              {filteredConversations.map((conversation, index) => (
                <Animated.View
                  key={conversation.id}
                  style={[
                    styles.conversationItem,
                    {
                      opacity: fadeAnim,
                      transform: [{ 
                        translateY: Animated.add(slideAnim, new Animated.Value(index * 10))
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.conversationTouchable}
                    onPress={() => handleConversationPress(conversation)}
                  >
                    <BlurView intensity={15} tint="dark" style={styles.conversationBlur}>
                      <View style={styles.conversationHeader}>
                        <View style={styles.conversationIcon}>
                          <Text style={styles.conversationEmoji}>{conversation.emoji}</Text>
                        </View>
                        <View style={styles.conversationInfo}>
                          <Text style={styles.conversationTitle}>
                            {conversation.title}
                          </Text>
                          <Text style={styles.conversationCategory}>
                            {conversation.category}
                          </Text>
                        </View>
                        <View style={styles.conversationMeta}>
                          <Text style={styles.conversationDate}>
                            {formatDate(conversation.date)}
                          </Text>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteConversation(conversation.id)}
                          >
                            <Text style={styles.deleteText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.conversationPreview}>
                        {conversation.preview}
                      </Text>
                      <Text style={styles.conversationAnalysis}>
                        {conversation.analysis}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>
                {conversations.length === 0 ? '💬' : '📭'}
              </Text>
              <Text style={styles.emptyTitle}>
                {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
              </Text>
              <Text style={styles.emptyText}>
                {conversations.length === 0
                  ? 'Start analyzing your first business idea in the Chat tab to see your conversation history here!'
                  : searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter'
                  : 'All conversations have been filtered out'
                }
              </Text>
            </View>
          )}
        </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBlur: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 24,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeCategoryButton: {
    // No additional styles needed
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeCategoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    marginBottom: 16,
  },
  conversationTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  conversationBlur: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationEmoji: {
    fontSize: 20,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationCategory: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: '500',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationPreview: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  conversationAnalysis: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
};

export default HistoryScreen; 