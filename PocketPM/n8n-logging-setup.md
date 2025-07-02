# N8n Logging Setup for AI Evaluations

This guide explains how to set up conversation logging to n8n for AI evaluation automation.

## Overview

The app now automatically logs all conversations to an n8n webhook for AI evaluation. This includes:
- Real-time conversation updates after each AI response
- Complete conversation logs when users start new chats or leave the app
- Rich metadata including session duration, message counts, and platform info

## Quick Start

1. **Start n8n** (if you haven't already):
   ```bash
   # Install n8n globally if needed
   npm install -g n8n
   
   # Start n8n
   n8n start
   ```

2. **Create the Webhook in n8n**:
   - Open n8n at `http://localhost:5678`
   - Create a new workflow
   - Add a "Webhook" node as the trigger
   - Set the webhook path to: `/webhook/chat-evaluation`
   - Set HTTP Method to: `POST`
   - Save and activate the workflow

3. **The app will automatically start logging** conversations to:
   ```
   http://localhost:5678/webhook/chat-evaluation
   ```

## Configuration

### Webhook URL
Edit `PocketPM/src/services/loggingService.js` to change the webhook URL:

```javascript
// For local development
this.webhookUrl = 'http://localhost:5678/webhook/chat-evaluation';

// For production
this.webhookUrl = 'https://your-n8n-domain.com/webhook/chat-evaluation';

// For testing with ngrok
this.webhookUrl = 'https://xxxxx.ngrok.io/webhook/chat-evaluation';
```

### Enable/Disable Logging
```javascript
// In loggingService.js constructor
this.isEnabled = false; // Set to false to disable all logging
```

Or dynamically:
```javascript
import LoggingService from '../services/loggingService';
LoggingService.setEnabled(false); // Disable logging
LoggingService.setEnabled(true);  // Enable logging
```

## Data Structure

Each logged conversation includes:

```json
{
  "sessionId": "session_1703123456789_abc123def",
  "timestamp": "2023-12-21T10:30:00.000Z",
  "userId": "user123",
  "platform": "ios",
  "appVersion": "1.0.0",
  "duration": 45000,
  "conversationLength": 6,
  "totalUserMessages": 3,
  "totalAssistantMessages": 3,
  "hasChunkedResponse": true,
  "messages": [
    {
      "role": "user",
      "content": "I have an idea for a fitness app...",
      "timestamp": "2023-12-21T10:30:00.000Z"
    },
    {
      "role": "assistant", 
      "content": "That's a great idea! Let me help you...",
      "timestamp": "2023-12-21T10:30:15.000Z",
      "chunkTitle": "Market Analysis",
      "chunkedData": {
        "analysisId": "Fitness Gamification App",
        "currentChunk": 0,
        "totalChunks": 5
      }
    }
  ]
}
```

## Logging Events

The app logs conversations at these events:

1. **After each AI response** (`logRealTimeUpdate`)
   - Includes `isRealTimeUpdate: true`
   - Useful for monitoring ongoing conversations

2. **When starting a new conversation** (`logConversationEnd`)
   - Includes `conversationComplete: true` and `reason: 'new_conversation_started'`
   - Logs the completed previous conversation

3. **When user leaves the chat screen** (`logConversationEnd`)
   - Includes `reason: 'screen_unmount'`
   - Captures conversations when users navigate away

## Testing the Integration

1. **Check console logs** for logging status:
   ```
   🔧 N8n Logging Service initialized
   📡 Webhook URL: http://localhost:5678/webhook/chat-evaluation
   🔄 Logging ENABLED
   ✅ Conversation logged successfully to n8n
   ```

2. **Test with a simple conversation**:
   - Open the app
   - Send a message to the AI
   - Check your n8n workflow execution log
   - You should see the conversation data

3. **Common issues**:
   - `⚠️ N8n webhook not available` - n8n is not running
   - `❌ Failed to log conversation` - Check webhook URL and n8n setup

## Example N8n Workflow

Here's a basic n8n workflow to get started:

1. **Webhook Trigger** - Receives conversation data
2. **Code Node** - Process/analyze the conversation
3. **HTTP Request** - Send to your evaluation API
4. **Spreadsheet** - Log results for analysis

## Production Setup

For production use:

1. **Deploy n8n** to a cloud service
2. **Update webhook URL** in `loggingService.js`
3. **Add authentication** to your webhook if needed
4. **Set up monitoring** for failed webhook calls
5. **Consider rate limiting** for high-volume apps

## Privacy & Security

- Conversations are logged with user consent implied by app usage
- Consider implementing user opt-out mechanisms
- Ensure n8n webhook is secured (HTTPS, authentication)
- Review data retention policies for logged conversations
- Be mindful of PII in conversation content

## Next Steps

Once logging is working, you can:
- Build AI evaluation workflows in n8n
- Set up automated quality scoring
- Create dashboards for conversation analytics
- Implement A/B testing for different AI prompts
- Set up alerts for conversation quality issues 