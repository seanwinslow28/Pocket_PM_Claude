// Utility functions and constants for AI prompts

export const PROMPT_TYPES = {
  ANALYZE: 'analyze',
  MARKET_RESEARCH: 'market_research',
  BUSINESS_PLAN: 'business_plan',
  COMPETITOR_ANALYSIS: 'competitor_analysis',
};

export const getPromptTemplate = (type, userInput) => {
  switch (type) {
    case PROMPT_TYPES.ANALYZE:
      return `Please analyze this business idea: ${userInput}`;
    case PROMPT_TYPES.MARKET_RESEARCH:
      return `Conduct market research for: ${userInput}`;
    case PROMPT_TYPES.BUSINESS_PLAN:
      return `Create a business plan outline for: ${userInput}`;
    case PROMPT_TYPES.COMPETITOR_ANALYSIS:
      return `Analyze competitors for: ${userInput}`;
    default:
      return userInput;
  }
};

export const formatResponse = (response) => {
  // Add any response formatting logic here
  return response;
}; 