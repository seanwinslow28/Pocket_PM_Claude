// N8n Logging Service for AI Evaluation
import { Platform } from 'react-native';

class LoggingService {
  constructor() {
    // Configure the n8n webhook URL
    // For test mode: 'http://localhost:5678/webhook-test/chat-evaluation'  
    // For production: 'http://localhost:5678/webhook/chat-evaluation' (requires active workflow)
    // For cloud/production: 'https://your-n8n-domain.com/webhook/chat-evaluation'
    this.webhookUrl = 'http://localhost:5678/webhook/chat-evaluation';
    this.isEnabled = true; // Set to false to disable logging
    
    console.log(`🔧 N8n Logging Service initialized`);
    console.log(`📡 Webhook URL: ${this.webhookUrl}`);
    console.log(`🔄 Logging ${this.isEnabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Log conversation data to n8n webhook for AI evaluation
   * @param {Array} messages - Array of message objects with {id, text, isUser, timestamp}
   * @param {Object} sessionMetadata - Additional session information
   */
  async logConversationToN8n(messages, sessionMetadata = {}) {
    if (!this.isEnabled || !messages || messages.length === 0) {
      return;
    }

    try {
      // Convert our message format to the expected format
      const formattedMessages = messages
        .filter(msg => msg.text && msg.text.trim()) // Filter out empty messages
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text.trim(),
          timestamp: msg.timestamp || new Date(),
          chunkTitle: msg.chunkTitle || null,
          chunkedData: msg.chunkedData || null
        }));

      if (formattedMessages.length === 0) {
        return;
      }

      const conversationData = {
        sessionId: sessionMetadata.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        messages: formattedMessages,
        userId: sessionMetadata.userId || 'anonymous',
        duration: sessionMetadata.duration || null,
        userRating: sessionMetadata.userRating || null,
        platform: Platform.OS, // 'ios' or 'android'
        appVersion: sessionMetadata.appVersion || '1.0.0',
        conversationLength: formattedMessages.length,
        hasChunkedResponse: formattedMessages.some(msg => msg.chunkedData),
        totalUserMessages: formattedMessages.filter(msg => msg.role === 'user').length,
        totalAssistantMessages: formattedMessages.filter(msg => msg.role === 'assistant').length
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
        timeout: 10000, // 10 second timeout
      });

      if (response.ok) {
        console.log('✅ Conversation logged successfully to n8n');
        return { success: true, data: conversationData };
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to log conversation to n8n:', response.status, errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      // Don't throw errors for logging failures - just log them
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        console.warn('⚠️ N8n webhook not available - conversation not logged');
      } else {
        console.error('❌ Failed to log conversation to n8n:', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Log when a conversation ends or when user starts a new chat
   * @param {Array} messages - The complete conversation messages
   * @param {Object} metadata - Session and user metadata
   */
  async logConversationEnd(messages, metadata = {}) {
    const sessionDuration = this.calculateSessionDuration(messages);
    
    return await this.logConversationToN8n(messages, {
      ...metadata,
      duration: sessionDuration,
      conversationComplete: true
    });
  }

  /**
   * Log after each AI response for real-time evaluation
   * @param {Array} messages - Current conversation messages
   * @param {Object} metadata - Session metadata
   */
  async logRealTimeUpdate(messages, metadata = {}) {
    return await this.logConversationToN8n(messages, {
      ...metadata,
      isRealTimeUpdate: true
    });
  }

  /**
   * Calculate session duration from first to last message
   * @param {Array} messages - Message array with timestamps
   * @returns {number} Duration in milliseconds
   */
  calculateSessionDuration(messages) {
    if (!messages || messages.length < 2) return 0;
    
    const timestamps = messages
      .map(msg => new Date(msg.timestamp))
      .filter(ts => !isNaN(ts.getTime()));
    
    if (timestamps.length < 2) return 0;
    
    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);
    
    return latest - earliest;
  }

  /**
   * Enable or disable logging
   * @param {boolean} enabled - Whether to enable logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`N8n logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set custom webhook URL
   * @param {string} url - New webhook URL
   */
  setWebhookUrl(url) {
    this.webhookUrl = url;
    console.log('N8n webhook URL updated:', url);
  }
}

export default new LoggingService(); 