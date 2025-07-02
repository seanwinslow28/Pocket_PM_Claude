// Enhanced API service for Pocket PM with environment support
import { config, configManager } from '../../config';
import { createClient } from '@supabase/supabase-js';
import ErrorService from './errorService';

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

class ApiService {
  constructor() {
    this.API_BASE_URL = config.API_BASE_URL;
  }

  get useMockData() {
    return configManager.getConfig().USE_MOCK_DATA;
  }

  get openAiApiKey() {
    return configManager.getConfig().OPENAI_API_KEY;
  }

  // Test the API connection
  async testConnection() {
    try {
      if (this.useMockData) {
        return true; // Mock always works
      }
      
      const response = await fetch(`${this.API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.log('API connection test failed:', error);
      return false;
    }
  }

  // Analyze an idea using your backend
  async analyzeIdea(idea) {
    try {
      // Validate input
      if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return {
          success: false,
          error: 'Please provide a valid idea description'
        };
      }

      // Use mock data in development or if API fails
      if (this.useMockData) {
        // Mock response for testing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        
        return {
          success: true,
          data: {
            analysis: this.generateChunkedAnalysis(idea),
            timestamp: new Date().toISOString()
          }
        };
      }

      // Try OpenAI API if key is available
      if (this.openAiApiKey) {
        console.log('Using OpenAI API...');
        return await this.callOpenAI(idea);
      }

      // No API key available - inform user
      return {
        success: false,
        error: 'No OpenAI API key found. Please add your API key in Settings → Developer → OpenAI API Key, or turn on Mock Data mode.'
      };

      // Note: Backend API calls removed since you don't have a backend server
      // If you want to set up your own backend later, you can uncomment and modify the code below
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Report to error logging service
      this.logError('analyzeIdea', error, { idea: idea?.substring(0, 50) });
      
      return {
        success: false,
        error: 'Failed to analyze idea. Please check your connection and try again.'
      };
    }
  }

  // Call OpenAI API directly
  async callOpenAI(idea) {
    try {
      console.log('🔑 API Key present:', !!this.openAiApiKey);
      console.log('🌐 Making request to OpenAI...');
      
      const response = await fetch(config.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product management expert helping entrepreneurs analyze their business ideas. Please provide analysis in exactly 4 distinct sections separated by "===SECTION_BREAK===". Format your response as:\n\n**Business Concept Analysis:**\nStart with a clear description of what this business idea revolves around or focuses on. Describe the core concept, target users, and key benefits.\n\n===SECTION_BREAK===\n\n**Market Analysis:**\nAnalyze the market landscape, competition, market size, and key opportunities or challenges.\n\n===SECTION_BREAK===\n\n**Execution Strategy:**\nCover technical feasibility, resource requirements, development timeline, and implementation approach.\n\n===SECTION_BREAK===\n\n**Action Plan:**\nProvide specific, actionable recommendations and next steps.\n\nUse clear, professional language with organized bullet points. Be specific about insights and recommendations. Avoid emojis and focus on substance.'
            },
            {
              role: 'user',
              content: `Please analyze this business idea in 4 structured sections - Overview, Market Analysis, Execution Strategy, and Action Plan: "${idea}"`
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ OpenAI API Error:', errorData);
        
        let errorMessage = 'OpenAI API error';
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key in Settings.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (response.status === 402) {
          errorMessage = 'Insufficient credits. Please add credits to your OpenAI account.';
        } else {
          errorMessage = `OpenAI API error: ${errorData.error?.message || `Status ${response.status}`}`;
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      console.log('✅ OpenAI response received');
      
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        return {
          success: false,
          error: 'No response content from OpenAI'
        };
      }

      return {
        success: true,
        data: {
          analysis: this.generateChunkedAnalysisFromText(idea, aiResponse),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('💥 OpenAI API call failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        error: `Connection failed: ${error.message}. Please check your API key and connection.`
      };
    }
  }

  // Generate chunked analysis from OpenAI response
  generateChunkedAnalysisFromText(idea, aiResponse) {
    // Extract idea title from the response or use a cleaned version of the input
    const ideaTitle = this.extractIdeaTitle(aiResponse, idea);
    
    // Clean the response and split by section breaks
    let cleanResponse = aiResponse
      .replace(/===SECTION_BREAK===/g, '|||BREAK|||')
      .replace(/\[OVERVIEW SECTION\]/gi, '')
      .replace(/\[MARKET SECTION\]/gi, '')
      .replace(/\[EXECUTION SECTION\]/gi, '')
      .replace(/\[ACTION PLAN SECTION\]/gi, '')
      .replace(/\[.*?\]/g, '') // Remove any remaining section markers
      .trim();
    
    const sections = cleanResponse.split('|||BREAK|||').map(section => 
      section.trim().replace(/^[\n\r]+|[\n\r]+$/g, '')
    ).filter(section => section.length > 0);
    
    console.log('Parsed sections:', sections.length, sections.map(s => s.substring(0, 100) + '...'));
    
    // If we don't get exactly 4 sections, fall back to simple chunking
    if (sections.length !== 4) {
      console.warn('Expected 4 sections, got:', sections.length);
      return this.generateFallbackChunks(idea, aiResponse, ideaTitle);
    }

    return {
      isChunked: true,
      currentChunk: 0,
      totalChunks: 4,
      ideaTitle: ideaTitle,
      chunks: [
        {
          id: 'overview',
          title: 'Idea Overview',
          content: this.formatSectionContent(sections[0], 'Business Concept Analysis'),
          nextPrompt: 'Would you like the Market Analysis?'
        },
        {
          id: 'market',
          title: 'Market Analysis',
          content: this.formatSectionContent(sections[1], 'Market Analysis'),
          nextPrompt: 'Want to dive into the Execution Plan?'
        },
        {
          id: 'execution',
          title: 'Execution Strategy',
          content: this.formatSectionContent(sections[2], 'Execution Strategy'),
          nextPrompt: 'Ready for the Action Plan?'
        },
        {
          id: 'action',
          title: 'Action Plan',
          content: `${this.formatSectionContent(sections[3], 'Action Plan')}\n\nYour idea analysis is complete! Feel free to ask for any additional insights or clarification.`,
          nextPrompt: null
        }
      ]
    };
  }

  // Generate clean, keyword-based titles  
  extractIdeaTitle(aiResponse, originalIdea) {
    // Extract key concepts from user input
    const userKeywords = this.extractKeywords(originalIdea);
    
    // Extract business type from AI response if available
    const businessType = this.extractBusinessType(aiResponse);
    
    // Combine for a clean title
    if (userKeywords.length > 0 && businessType) {
      return `${userKeywords.join(' ')} ${businessType}`;
    } else if (userKeywords.length > 0) {
      return `${userKeywords.join(' ')} App`;
    } else if (businessType) {
      return `New ${businessType}`;
    }
    
    return 'Business Concept';
  }

  // Extract keywords from user input
  extractKeywords(text) {
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
  }

  // Extract business type from AI response
  extractBusinessType(text) {
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
  }

  // Format section content with clean, professional structure
  formatSectionContent(content, sectionTitle = '') {
    if (!content) return '';
    
    // Clean any remaining formatting artifacts and emojis
    let cleaned = content
      .replace(/^\s*===+\s*/gm, '')
      .replace(/^\s*---+\s*/gm, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove all emojis
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Convert **bold** to plain text
      .replace(/^\s*[-•]\s*/gm, '• ') // Standardize bullet points
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra line breaks
      .trim();
    
    // Add clean section header if content doesn't already have one
    if (sectionTitle && !cleaned.match(/^(Business Concept|Market|Execution|Action Plan)/i)) {
      cleaned = `${sectionTitle}:\n\n${cleaned}`;
    }
    
    return cleaned;
  }

  // Fallback chunking if sections aren't properly formatted
  generateFallbackChunks(idea, aiResponse, ideaTitle = null) {
    const title = ideaTitle || this.extractIdeaTitle(aiResponse, idea);
    const responseLength = aiResponse.length;
    const chunkSize = Math.ceil(responseLength / 4);
    
    return {
      isChunked: true,
      currentChunk: 0,
      totalChunks: 4,
      ideaTitle: title,
      chunks: [
        {
          id: 'overview',
          title: 'Idea Overview',
          content: `Business Concept Analysis:\n\n${this.formatSectionContent(aiResponse.substring(0, chunkSize))}`,
          nextPrompt: 'Would you like the Market Analysis?'
        },
        {
          id: 'market',
          title: 'Market Analysis',
          content: `Market Analysis:\n\n${this.formatSectionContent(aiResponse.substring(chunkSize, chunkSize * 2))}`,
          nextPrompt: 'Want to dive into the Execution Plan?'
        },
        {
          id: 'execution',
          title: 'Execution Strategy',
          content: `Execution Strategy:\n\n${this.formatSectionContent(aiResponse.substring(chunkSize * 2, chunkSize * 3))}`,
          nextPrompt: 'Ready for the Action Plan?'
        },
        {
          id: 'action',
          title: 'Action Plan',
          content: `Action Plan:\n\n${this.formatSectionContent(aiResponse.substring(chunkSize * 3))}\n\nYour analysis is complete! Feel free to ask for additional insights.`,
          nextPrompt: null
        }
      ]
    };
  }

  // Generate chunked analysis for better UX
  generateChunkedAnalysis(idea) {
    const ideaTitle = this.extractIdeaTitle('', idea);
    
    return {
      isChunked: true,
      currentChunk: 0,
      totalChunks: 4,
      ideaTitle: ideaTitle,
      chunks: [
        {
          id: 'overview',
          title: 'Idea Overview',
          content: `Business Concept Analysis:\n\nThis addresses a real need in the market with a clear value proposition.\n\nCore Concept: The idea focuses on solving genuine market pain points through an efficient, user-friendly solution.\n\nTarget Users: Professionals and businesses looking for productivity improvements and streamlined processes.\n\nKey Benefits:\n• Saves time and improves operational efficiency\n• Addresses genuine market pain points\n• Clear value proposition for target users\n• Scalable business model potential`,
          nextPrompt: 'Would you like to see the Market Analysis?'
        },
        {
          id: 'market',
          title: 'Market Analysis',
          content: `Market Analysis:\n\nMarket Size: Large addressable market with strong growth potential in the target sector.\n\nCompetition Level: Moderate competition with clear opportunities for differentiation and market positioning.\n\nMarket Trends:\n• Growing demand for efficiency and productivity solutions\n• Shift towards digital-first approaches across industries\n• Increasing focus on user experience and simplicity\n• Rising adoption of automated solutions\n\nPositioning: Strong potential for successful market entry with proper execution and positioning strategy.`,
          nextPrompt: 'Want to dive into Execution Strategy?'
        },
        {
          id: 'execution',
          title: 'Execution & Feasibility',
          content: `Execution Strategy:\n\nTechnical Feasibility: High - achievable with current technology stack and industry best practices.\n\nResource Requirements:\n• Development timeline: 3-6 months for MVP\n• Team size: 2-4 people initially (can scale as needed)\n• Budget: Moderate initial investment required\n• Infrastructure: Standard cloud-based setup\n\nImplementation Plan:\n• Phase 1: MVP development and core feature build (3 months)\n• Phase 2: User testing, feedback integration, and refinement\n• Phase 3: Feature expansion and market scaling`,
          nextPrompt: 'Ready for the Action Plan?'
        },
        {
          id: 'action',
          title: 'Action Plan & Next Steps',
          content: `Action Plan:\n\nImmediate Steps (Next 2 weeks):\n• Validate concept with 10-15 potential users\n• Create detailed feature specifications and requirements\n• Build landing page for market interest validation\n• Research competitors and pricing strategies\n\nShort Term (1-3 months):\n• Develop minimum viable product (MVP)\n• Set up user feedback and analytics systems\n• Plan comprehensive go-to-market strategy\n• Establish key partnerships if applicable\n\nLong Term (3+ months):\n• Launch beta version to select user group\n• Iterate based on user feedback and market response\n• Scale operations and expand feature set\n• Plan funding or growth strategy\n\nThis concept shows strong potential and is worth pursuing with proper validation and execution.`,
          nextPrompt: null
        }
      ]
    };
  }

  // Enhanced user authentication with Supabase
  async login(email, password) {
    try {
      if (this.useMockData) {
        // Mock login for development
        if (email && password) {
          return {
            success: true,
            user: { email, name: 'Test User' }
          };
        }
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Production: Use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.logError('login', error, { email });
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'User'
        },
        session: data.session
      };
    } catch (error) {
      this.logError('login', error, { email });
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      if (this.useMockData) {
        // Mock registration for development
        if (userData.email && userData.password && userData.name) {
          return {
            success: true,
            user: { email: userData.email, name: userData.name }
          };
        }
        return {
          success: false,
          error: 'Please fill in all fields'
        };
      }

      // Production: Use Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) {
        this.logError('register', error, { email: userData.email });
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: userData.name
        },
        session: data.session
      };
    } catch (error) {
      this.logError('register', error, { email: userData.email });
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Save analysis to database (for user testing analytics)
  async saveAnalysis(userId, idea, analysis) {
    try {
      if (this.useMockData) {
        console.log('Mock: Saving analysis', { userId, idea: idea.substring(0, 50) });
        return { success: true };
      }

      const { error } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          title: idea.substring(0, 100),
          idea: idea,
          analysis: analysis
        });

      if (error) {
        this.logError('saveAnalysis', error, { userId, idea: idea.substring(0, 50) });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      this.logError('saveAnalysis', error, { userId });
      return { success: false, error: 'Failed to save analysis' };
    }
  }

  // Error logging method
  logError(method, error, context = {}) {
    ErrorService.logError(error, {
      method,
      service: 'ApiService',
      ...context
    });
  }
}

export default new ApiService(); 