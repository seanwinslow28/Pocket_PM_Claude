import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSATIONS_STORAGE_KEY = 'user_conversations';

// Category detection based on keywords and context
const detectCategory = (messages) => {
  const fullText = messages.map(m => m.text).join(' ').toLowerCase();
  
  // Product Strategy keywords
  if (fullText.includes('product') || fullText.includes('feature') || fullText.includes('roadmap') || 
      fullText.includes('strategy') || fullText.includes('development') || fullText.includes('pricing') ||
      fullText.includes('launch') || fullText.includes('mvp')) {
    return 'Product Strategy';
  }
  
  // Market Research keywords
  if (fullText.includes('market') || fullText.includes('competitor') || fullText.includes('industry') ||
      fullText.includes('customers') || fullText.includes('target audience') || fullText.includes('demand') ||
      fullText.includes('size') || fullText.includes('opportunity')) {
    return 'Market Research';
  }
  
  // User Research keywords
  if (fullText.includes('user') || fullText.includes('customer journey') || fullText.includes('persona') ||
      fullText.includes('behavior') || fullText.includes('interview') || fullText.includes('survey') ||
      fullText.includes('feedback') || fullText.includes('testing')) {
    return 'User Research';
  }
  
  // Growth keywords
  if (fullText.includes('growth') || fullText.includes('acquisition') || fullText.includes('retention') ||
      fullText.includes('marketing') || fullText.includes('viral') || fullText.includes('funnel') ||
      fullText.includes('conversion') || fullText.includes('metrics')) {
    return 'Growth';
  }
  
  // Analytics keywords
  if (fullText.includes('analytics') || fullText.includes('data') || fullText.includes('metrics') ||
      fullText.includes('kpi') || fullText.includes('tracking') || fullText.includes('measurement') ||
      fullText.includes('performance') || fullText.includes('roi')) {
    return 'Analytics';
  }
  
  // Default category
  return 'Product Strategy';
};

// Generate simple icon based on category (no emojis)
const getCategoryIcon = (category) => {
  // Return empty string since we're removing emojis
  return '';
};

// Generate conversation title from AI analysis
const generateTitle = (messages) => {
  const firstUserMessage = messages.find(m => m.isUser);
  const firstAiMessage = messages.find(m => !m.isUser && m.text);
  
  if (!firstUserMessage) return 'New Conversation';
  
  // Look for chunked analysis with ideaTitle first
  const aiMessage = messages.find(m => !m.isUser && m.chunkedData);
  if (aiMessage && aiMessage.chunkedData.analysisId) {
    return aiMessage.chunkedData.analysisId;
  }
  
  // Generate title using keywords from user input and AI response
  if (firstAiMessage) {
    return generateKeywordTitle(firstUserMessage.text, firstAiMessage.text);
  }
  
  // Fallback to keywords from user input only
  const keywords = extractKeywords(firstUserMessage.text);
  if (keywords.length > 0) {
    return `${keywords.join(' ')} App`;
  }
  
  return 'Business Concept';
};

// Generate clean, keyword-based titles
const generateKeywordTitle = (userInput, aiResponse) => {
  // Extract key concepts from user input
  const userKeywords = extractKeywords(userInput);
  
  // Extract business type from AI response if available
  const businessType = extractBusinessType(aiResponse);
  
  // Combine for a clean title
  if (userKeywords.length > 0 && businessType) {
    return `${userKeywords.join(' ')} ${businessType}`;
  } else if (userKeywords.length > 0) {
    return `${userKeywords.join(' ')} App`;
  } else if (businessType) {
    return `New ${businessType}`;
  }
  
  return 'Business Concept';
};

// Extract keywords from user input
const extractKeywords = (text) => {
  const cleanText = text.toLowerCase()
    .replace(/^(i\s+have\s+an\s+idea|i'm\s+looking\s+for|i\s+want\s+to\s+create|help\s+me\s+with)/i, '')
    .replace(/[^\w\s]/g, '')
    .trim();
  
  // Common words to filter out
  const stopWords = ['that', 'for', 'app', 'application', 'idea', 'business', 'product', 'service', 'platform', 'tool', 'system', 'solution', 'website', 'mobile', 'web', 'about', 'like', 'would', 'could', 'should', 'will', 'can', 'make', 'create', 'build', 'develop'];
  
  const words = cleanText.split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .slice(0, 3); // Take max 3 meaningful words
  
  // Capitalize first letter of each word
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
};

// Extract business type from AI response
const extractBusinessType = (text) => {
  const businessTypes = [
    'App', 'Platform', 'Service', 'Tool', 'Solution', 'System', 
    'Marketplace', 'Network', 'Dashboard', 'Assistant', 'Tracker',
    'Manager', 'Optimizer', 'Analyzer', 'Generator', 'Builder'
  ];
  
  for (const type of businessTypes) {
    if (text.toLowerCase().includes(type.toLowerCase())) {
      return type;
    }
  }
  
  return null;
};

export class ConversationService {
  // Save a conversation when it's completed
  static async saveConversation(messages, userId = 'default') {
    try {
      if (!messages || messages.length < 2) return; // Need at least user message and AI response
      
      const conversation = {
        id: Date.now().toString(),
        title: generateTitle(messages),
        category: detectCategory(messages),
        emoji: getCategoryIcon(detectCategory(messages)),
        date: new Date().toISOString(),
        messages: messages,
        preview: this.generatePreview(messages),
        analysis: this.extractKeyInsights(messages),
        userId: userId
      };
      
      const existingConversations = await this.getConversations(userId);
      const updatedConversations = [conversation, ...existingConversations];
      
      // Keep only last 50 conversations to manage storage
      const trimmedConversations = updatedConversations.slice(0, 50);
      
      await AsyncStorage.setItem(
        `${CONVERSATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(trimmedConversations)
      );
      
      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }
  
  // Get all conversations for a user
  static async getConversations(userId = 'default') {
    try {
      const stored = await AsyncStorage.getItem(`${CONVERSATIONS_STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }
  
  // Delete a conversation
  static async deleteConversation(conversationId, userId = 'default') {
    try {
      const conversations = await this.getConversations(userId);
      const filtered = conversations.filter(conv => conv.id !== conversationId);
      
      await AsyncStorage.setItem(
        `${CONVERSATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(filtered)
      );
      
      return filtered;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
  
  // Get conversations by category
  static async getConversationsByCategory(category, userId = 'default') {
    try {
      const conversations = await this.getConversations(userId);
      return category === 'All' 
        ? conversations 
        : conversations.filter(conv => conv.category === category);
    } catch (error) {
      console.error('Error filtering conversations:', error);
      return [];
    }
  }
  
  // Search conversations
  static async searchConversations(query, userId = 'default') {
    try {
      const conversations = await this.getConversations(userId);
      const lowercaseQuery = query.toLowerCase();
      
      return conversations.filter(conv => 
        conv.title.toLowerCase().includes(lowercaseQuery) ||
        conv.preview.toLowerCase().includes(lowercaseQuery) ||
        conv.category.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  }
  
  // Generate preview text from messages
  static generatePreview(messages) {
    const aiMessages = messages.filter(m => !m.isUser && !m.text.includes('What ideas would you like to share'));
    if (aiMessages.length === 0) return 'Business analysis and recommendations';
    
    const firstAiResponse = aiMessages[0].text;
    
    // Extract core business description
    const businessDescription = this.extractBusinessDescription(firstAiResponse);
    if (businessDescription) return businessDescription;
    
    // Extract value proposition
    const valueProps = this.extractValueProposition(firstAiResponse);
    if (valueProps) return valueProps;
    
    // Fallback to cleaned first meaningful sentence
    const cleanedSentences = firstAiResponse
      .replace(/\[.*?\]/g, '') // Remove section markers
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove all emojis
      .replace(/[#*]/g, '') // Remove markdown
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Convert **bold** to plain text
      .replace(/Business Concept Analysis:?/i, '') // Remove section headers
      .replace(/Market Analysis:?/i, '')
      .replace(/Execution Strategy:?/i, '')
      .replace(/Action Plan:?/i, '')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && !s.includes('analysis') && !s.includes('concept'))
      .slice(0, 1);
    
    if (cleanedSentences.length > 0) {
      const preview = cleanedSentences[0].trim();
      return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
    }
    
    return 'Comprehensive business analysis and strategic recommendations';
  }

  // Extract business description focusing on what the business does
  static extractBusinessDescription(text) {
    const descriptionPatterns = [
      /(?:creates?|provides?|offers?|delivers?|enables?|helps?)\s+([^.]{30,100})/i,
      /(?:is\s+designed\s+to|aims\s+to|focuses\s+on)\s+([^.]{30,100})/i,
      /(?:allows?\s+users?\s+to|enables?\s+users?\s+to)\s+([^.]{30,100})/i,
      /(?:solution\s+for|platform\s+for|app\s+for)\s+([^.]{30,100})/i,
      /(?:addresses|solves|tackles)\s+([^.]{30,100})/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const description = this.cleanText(match[1]);
        if (description.length >= 25) {
          return description.length > 90 ? description.substring(0, 90) + '...' : description;
        }
      }
    }
    
    return null;
  }

  // Extract value proposition or key benefits
  static extractValueProposition(text) {
    const valuePatterns = [
      /(?:key\s+benefits?|main\s+benefits?)[\s:]*([^.\n]{25,80})/i,
      /(?:users?\s+can|customers?\s+can)\s+([^.]{25,80})/i,
      /(?:saves?|improves?|increases?|reduces?|optimizes?)\s+([^.]{25,80})/i,
      /(?:provides?\s+|offers?\s+)([^.]{25,80})/i
    ];
    
    for (const pattern of valuePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = this.cleanText(match[1]);
        if (value.length >= 25) {
          return value.length > 80 ? value.substring(0, 80) + '...' : value;
        }
      }
    }
    
    return null;
  }

  // Helper method to clean extracted text
  static cleanText(text) {
    return text
      .trim()
      .replace(/[*]/g, '') // Remove asterisks
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Convert **bold** to plain text
      .replace(/^\s*[-•]\s*/, '') // Remove bullet points at start
      .replace(/\s+/g, ' '); // Clean up spaces
  }
  
  // Extract key insights from conversation
  static extractKeyInsights(messages) {
    const aiMessages = messages.filter(m => !m.isUser);
    if (aiMessages.length === 0) return 'No insights available';
    
    const fullText = aiMessages.map(m => m.text).join(' ');
    
    // Look for specific insight patterns
    const insightPatterns = [
      /(?:key\s+insights?|main\s+takeaways?)[\s:]*([^.\n]{30,100})/i,
      /(?:focus\s+on|key\s+benefits?)[\s:]*([^.\n]{30,100})/i,
      /(?:opportunity|market\s+potential)[\s:]*([^.\n]{30,100})/i,
      /(?:recommend|suggestion|next\s+steps?)[\s:]*([^.\n]{30,100})/i,
      /(?:key\s+benefits?)[\s:]*([^.\n]{30,100})/i
    ];
    
    for (const pattern of insightPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        const insight = match[1]
          .trim()
          .replace(/[*]/g, '') // Remove asterisks
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
          .replace(/\*\*([^*]+)\*\*/g, '$1'); // Convert **bold** to plain text
        if (insight.length >= 30) {
          return insight.length > 100 ? insight.substring(0, 100) + '...' : insight;
        }
      }
    }
    
    // Look for bullet points or numbered insights
    const bulletPoints = fullText.match(/[•\-\*]\s*([^.\n]{20,80})/g);
    if (bulletPoints && bulletPoints.length > 0) {
      const insight = bulletPoints[0]
        .replace(/[•\-\*\s]+/, '')
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Convert **bold** to plain text
        .trim();
      return insight.length > 80 ? insight.substring(0, 80) + '...' : insight;
    }
    
    // Extract sentences with insight keywords as fallback
    const sentences = fullText.split(/[.!?]+/);
    const insightKeywords = ['key', 'important', 'focus', 'opportunity', 'challenge', 'recommend', 'critical'];
    
    const insights = sentences.filter(sentence => 
      insightKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      ) && sentence.trim().length > 30
    );
    
    if (insights.length > 0) {
      const insight = insights[0]
        .trim()
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove all emojis
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Convert **bold** to plain text
        .replace(/[*]/g, ''); // Remove remaining asterisks
      return insight.length > 100 ? insight.substring(0, 100) + '...' : insight;
    }
    
    // Final fallback
    return 'Comprehensive business analysis with actionable insights';
  }
  
  // Regenerate conversation metadata (titles, previews, insights)
  static async regenerateConversationData(userId = 'default') {
    try {
      const conversations = await this.getConversations(userId);
      
      const updatedConversations = conversations.map(conv => ({
        ...conv,
        title: generateTitle(conv.messages),
        preview: this.generatePreview(conv.messages),
        analysis: this.extractKeyInsights(conv.messages),
        category: detectCategory(conv.messages),
        emoji: getCategoryIcon(detectCategory(conv.messages))
      }));
      
      await AsyncStorage.setItem(
        `${CONVERSATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedConversations)
      );
      
      return updatedConversations;
    } catch (error) {
      console.error('Error regenerating conversation data:', error);
      throw error;
    }
  }

  // Clear all conversations (useful for testing)
  static async clearAllConversations(userId = 'default') {
    try {
      await AsyncStorage.removeItem(`${CONVERSATIONS_STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      throw error;
    }
  }
}

export default ConversationService; 