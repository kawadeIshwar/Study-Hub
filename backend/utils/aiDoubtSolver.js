import Sentiment from 'sentiment';
import Message from '../models/Message.js';
import Community from '../models/Community.js';

const sentiment = new Sentiment();

// Analyze message content and provide AI-powered suggestions
export const analyzeDoubt = async (messageContent, communityId, contextMessages = []) => {
  try {
    // Perform sentiment analysis
    const sentimentResult = sentiment.analyze(messageContent);
    
    // Extract key terms and concepts
    const keyTerms = extractKeyTerms(messageContent);
    
    // Determine if this is likely a doubt/question
    const isQuestion = detectQuestion(messageContent);
    
    // Find related resources in the community
    const relatedResources = await findRelatedResources(keyTerms, communityId);
    
    // Generate suggestions based on analysis
    const suggestions = generateSuggestions(messageContent, keyTerms, relatedResources, sentimentResult);
    
    return {
      isQuestion,
      confidence: calculateConfidence(sentimentResult, keyTerms, relatedResources),
      keyTerms,
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        mood: getMoodFromScore(sentimentResult.score)
      },
      relatedResources,
      suggestions
    };
  } catch (error) {
    console.error('Error analyzing doubt:', error);
    return {
      isQuestion: false,
      confidence: 0,
      keyTerms: [],
      sentiment: { score: 0, comparative: 0, mood: 'neutral' },
      relatedResources: [],
      suggestions: []
    };
  }
};

// Summarize chat history to identify common doubts
export const summarizeChatDoubts = async (communityId, timeRange = 24 * 60 * 60 * 1000) => {
  try {
    const startTime = new Date(Date.now() - timeRange);
    
    const messages = await Message.find({
      community: communityId,
      createdAt: { $gte: startTime },
      type: 'text'
    }).populate('sender', 'name').sort({ createdAt: -1 }).limit(100);

    const doubts = [];
    const doubtPatterns = {};

    messages.forEach(message => {
      if (detectQuestion(message.content)) {
        const keyTerms = extractKeyTerms(message.content);
        const doubtKey = keyTerms.join(' ');
        
        if (doubtKey) {
          if (!doubtPatterns[doubtKey]) {
            doubtPatterns[doubtKey] = {
              terms: keyTerms,
              count: 0,
              examples: [],
              lastAsked: null
            };
          }
          
          doubtPatterns[doubtKey].count++;
          doubtPatterns[doubtKey].examples.push({
            content: message.content,
            sender: message.sender.name,
            timestamp: message.createdAt
          });
          doubtPatterns[doubtKey].lastAsked = message.createdAt;
        }
        
        doubts.push({
          content: message.content,
          sender: message.sender.name,
          timestamp: message.createdAt,
          keyTerms
        });
      }
    });

    // Sort by frequency and recency
    const frequentDoubts = Object.values(doubtPatterns)
      .filter(doubt => doubt.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalDoubts: doubts.length,
      frequentDoubts,
      recentDoubts: doubts.slice(0, 10),
      summary: generateDoubtSummary(doubts, frequentDoubts)
    };
  } catch (error) {
    console.error('Error summarizing chat doubts:', error);
    return {
      totalDoubts: 0,
      frequentDoubts: [],
      recentDoubts: [],
      summary: 'Unable to analyze doubts at this time.'
    };
  }
};

// Extract key terms from message
function extractKeyTerms(content) {
  // Remove common words and extract meaningful terms
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall']);
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Return unique terms
  return [...new Set(words)];
}

// Detect if content is a question
function detectQuestion(content) {
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'was', 'were', 'do', 'does', 'did'];
  const questionMarks = content.split('?').length - 1;
  const startsWithQuestionWord = questionWords.some(word => 
    content.toLowerCase().trim().startsWith(word + ' ')
  );
  
  return questionMarks > 0 || startsWithQuestionWord;
}

// Find related resources in the community
async function findRelatedResources(keyTerms, communityId) {
  try {
    // Search for messages tagged as resources or solutions
    const relatedMessages = await Message.find({
      community: communityId,
      tags: { $in: ['resource', 'solution'] },
      $or: keyTerms.map(term => ({
        content: { $regex: term, $options: 'i' }
      }))
    }).populate('sender', 'name').limit(5);

    return relatedMessages.map(msg => ({
      type: 'message',
      id: msg._id,
      content: msg.content,
      sender: msg.sender.name,
      tags: msg.tags,
      createdAt: msg.createdAt
    }));
  } catch (error) {
    console.error('Error finding related resources:', error);
    return [];
  }
}

// Generate suggestions based on analysis
function generateSuggestions(content, keyTerms, relatedResources, sentimentResult) {
  const suggestions = [];
  
  // Sentiment-based suggestions
  if (sentimentResult.score < -3) {
    suggestions.push({
      type: 'sentiment',
      priority: 'high',
      message: 'It looks like you might be frustrated. Consider taking a short break and coming back to this problem with fresh eyes.',
      action: 'take_break'
    });
  }
  
  // Question-specific suggestions
  if (detectQuestion(content)) {
    suggestions.push({
      type: 'question_format',
      priority: 'medium',
      message: 'Great question! To get better help, consider providing more context about what you\'ve tried so far.',
      action: 'add_context'
    });
  }
  
  // Resource suggestions
  if (relatedResources.length > 0) {
    suggestions.push({
      type: 'resources',
      priority: 'high',
      message: `I found ${relatedResources.length} related resource${relatedResources.length > 1 ? 's' : ''} that might help.`,
      resources: relatedResources,
      action: 'view_resources'
    });
  }
  
  // Study suggestions based on key terms
  const studySuggestions = getStudySuggestions(keyTerms);
  if (studySuggestions.length > 0) {
    suggestions.push({
      type: 'study_tips',
      priority: 'medium',
      message: 'Here are some study suggestions based on your question:',
      tips: studySuggestions,
      action: 'view_tips'
    });
  }
  
  return suggestions;
}

// Get study suggestions based on key terms
function getStudySuggestions(keyTerms) {
  const suggestions = [];
  
  const topicSuggestions = {
    'algorithm': ['Practice with visualizations', 'Start with simple examples', 'Break down the problem'],
    'data structure': ['Draw diagrams', 'Implement from scratch', 'Compare different approaches'],
    'web development': ['Check browser console', 'Validate HTML/CSS', 'Test on different devices'],
    'database': ['Check query syntax', 'Verify connections', 'Test with sample data'],
    'javascript': ['Use console.log for debugging', 'Check browser dev tools', 'Verify syntax'],
    'python': ['Use print statements', 'Check indentation', 'Verify imports']
  };
  
  keyTerms.forEach(term => {
    Object.keys(topicSuggestions).forEach(topic => {
      if (term.includes(topic) || topic.includes(term)) {
        suggestions.push(...topicSuggestions[topic]);
      }
    });
  });
  
  return [...new Set(suggestions)];
}

// Calculate confidence score
function calculateConfidence(sentimentResult, keyTerms, relatedResources) {
  let confidence = 0;
  
  // Base confidence from sentiment clarity
  confidence += Math.abs(sentimentResult.score) > 2 ? 20 : 10;
  
  // Confidence from key terms
  confidence += Math.min(keyTerms.length * 5, 30);
  
  // Confidence from related resources
  confidence += relatedResources.length * 15;
  
  return Math.min(confidence, 95);
}

// Get mood from sentiment score
function getMoodFromScore(score) {
  if (score > 3) return 'very_positive';
  if (score > 0) return 'positive';
  if (score === 0) return 'neutral';
  if (score > -3) return 'negative';
  return 'very_negative';
}

// Generate doubt summary
function generateDoubtSummary(doubts, frequentDoubts) {
  if (doubts.length === 0) {
    return 'No doubts were identified in the recent chat history.';
  }
  
  let summary = `Found ${doubts.length} doubt${doubts.length > 1 ? 's' : ''} in recent conversations. `;
  
  if (frequentDoubts.length > 0) {
    summary += `The most common topics are: ${frequentDoubts.map(d => d.terms.join(', ')).join('; ')}. `;
    summary += 'Consider creating resources or study sessions for these topics.';
  } else {
    summary += 'Most doubts appear to be unique, suggesting diverse learning needs.';
  }
  
  return summary;
}

export default {
  analyzeDoubt,
  summarizeChatDoubts
};