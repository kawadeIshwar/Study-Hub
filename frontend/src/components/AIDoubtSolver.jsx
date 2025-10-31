import React, { useState, useEffect } from 'react';
import { Brain, X, RefreshCw, Lightbulb, BookOpen, Link, Send } from 'lucide-react';

export default function AIDoubtSolver({ isOpen, onClose, communityId, messages }) {
  const [doubts, setDoubts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      analyzeDoubts();
    }
  }, [isOpen, messages]);

  const analyzeDoubts = async () => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis of recent messages
      const recentMessages = messages.slice(-20); // Analyze last 20 messages
      const detectedDoubts = [];

      // Simple keyword-based doubt detection
      const doubtKeywords = [
        'doubt', 'confused', 'don\'t understand', 'help', 'clarify',
        'question', 'unclear', 'difficult', 'stuck', 'problem',
        'explain', 'how to', 'what is', 'why', 'when', 'where'
      ];

      recentMessages.forEach((message, index) => {
        const hasDoubtKeyword = doubtKeywords.some(keyword => 
          message.content.toLowerCase().includes(keyword)
        );
        
        if (hasDoubtKeyword && message.content.length > 10) {
          detectedDoubts.push({
            id: `doubt_${index}`,
            message: message.content,
            author: message.author?.name || 'Unknown',
            timestamp: message.createdAt,
            confidence: Math.random() * 0.5 + 0.5, // Random confidence 0.5-1.0
            type: 'general'
          });
        }
      });

      setDoubts(detectedDoubts.slice(0, 5)); // Show top 5 doubts
      
      // Generate suggestions based on doubts
      if (detectedDoubts.length > 0) {
        generateSuggestions(detectedDoubts[0]);
      }
    } catch (error) {
      console.error('Failed to analyze doubts:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSuggestions = async (doubt) => {
    setLoading(true);
    try {
      // Simulate AI suggestions based on doubt content
      const mockSuggestions = [
        {
          type: 'resource',
          title: 'Recommended Study Material',
          content: 'Based on your doubt about "' + doubt.message.substring(0, 50) + '...", here are some resources:',
          items: [
            { title: 'Khan Academy - Basic Concepts', url: 'https://www.khanacademy.org', type: 'video' },
            { title: 'Coursera - Advanced Topics', url: 'https://www.coursera.org', type: 'course' },
            { title: 'Wikipedia Reference', url: 'https://en.wikipedia.org', type: 'article' }
          ]
        },
        {
          type: 'explanation',
          title: 'Step-by-Step Explanation',
          content: 'Let me break this down for you:',
          steps: [
            'First, understand the basic concept...',
            'Then, apply the relevant formula/theorem...',
            'Finally, solve step by step...',
            'Practice with similar examples'
          ]
        },
        {
          type: 'similar',
          title: 'Similar Solved Examples',
          content: 'Here are some similar problems that might help:',
          examples: [
            'Problem 1: [Similar concept with different numbers]',
            'Problem 2: [Related application]',
            'Problem 3: [Advanced variation]'
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    analyzeDoubts();
  };

  const handleSendSuggestion = (suggestion) => {
    // This would typically send a message to the chat
    console.log('Sending suggestion to chat:', suggestion);
    alert('Suggestion would be sent to the community chat!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Doubt Solver</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyzing recent messages to identify and solve doubts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Refresh analysis"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doubts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detected Doubts
                </h3>
                {analyzing && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Analyzing...
                  </div>
                )}
              </div>

              {doubts.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No doubts detected in recent messages
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doubts.map((doubt) => (
                    <div
                      key={doubt.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedDoubt?.id === doubt.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => {
                        setSelectedDoubt(doubt);
                        generateSuggestions(doubt);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {doubt.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            by {doubt.author} • {new Date(doubt.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <div className={`w-2 h-2 rounded-full ${
                            doubt.confidence > 0.8 ? 'bg-green-500' : 
                            doubt.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {Math.round(doubt.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Suggestions
              </h3>

              {loading ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating suggestions...
                  </p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a doubt to get AI-powered suggestions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        {suggestion.type === 'resource' && <BookOpen className="w-5 h-5 text-blue-600" />}
                        {suggestion.type === 'explanation' && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                        {suggestion.type === 'similar' && <BarChart className="w-5 h-5 text-green-600" />}
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h4>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {suggestion.content}
                      </p>

                      {suggestion.items && (
                        <div className="space-y-2 mb-3">
                          {suggestion.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex items-center gap-2">
                                <Link className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {item.title}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {item.type}
                                </span>
                              </div>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Visit
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestion.steps && (
                        <div className="space-y-2 mb-3">
                          {suggestion.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                              <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {stepIndex + 1}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white flex-1">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestion.examples && (
                        <div className="space-y-2 mb-3">
                          {suggestion.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="p-2 bg-white dark:bg-gray-800 rounded border">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {example}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleSendSuggestion(suggestion)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Share in Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}