import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, CheckCircle, Circle, Calendar, BarChart, TrendingUp } from 'lucide-react';

export default function PollCard({ poll, onVote, userId, isMember }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (poll && userId) {
      const userVote = poll.votes.find(vote => vote.userId === userId);
      if (userVote) {
        setHasVoted(true);
        setSelectedOptions(Array.isArray(userVote.options) ? userVote.options : [userVote.options]);
        setShowResults(true);
      }
    }
  }, [poll, userId]);

  const handleOptionSelect = (optionId) => {
    if (hasVoted || !isMember) return;

    if (poll.type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || hasVoted || !isMember) return;

    try {
      await onVote(poll._id, selectedOptions);
      setHasVoted(true);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(poll.expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + option.votes, 0);
  };

  const getVotePercentage = (optionVotes) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((optionVotes / total) * 100) : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!poll) return null;

  const isExpired = new Date(poll.expiresAt) <= new Date();
  const timeRemaining = getTimeRemaining();
  const totalVotes = getTotalVotes();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              Poll
            </span>
            {poll.isAnonymous && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                Anonymous
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {poll.question}
          </h3>
          {poll.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {poll.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span className={isExpired ? 'text-red-500' : ''}>
            {timeRemaining}
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {poll.options.map((option) => (
          <div key={option._id} className="space-y-2">
            {!showResults ? (
              // Voting view
              <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedOptions.includes(option._id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${!isMember || hasVoted || isExpired ? 'cursor-not-allowed opacity-60' : ''}`}>
                <input
                  type={poll.type === 'single' ? 'radio' : 'checkbox'}
                  name="poll-option"
                  checked={selectedOptions.includes(option._id)}
                  onChange={() => handleOptionSelect(option._id)}
                  disabled={!isMember || hasVoted || isExpired}
                  className="mr-3"
                />
                <span className="flex-1 text-gray-900 dark:text-white">
                  {option.text}
                </span>
                {selectedOptions.includes(option._id) ? (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </label>
            ) : (
              // Results view
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {option.text}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{option.votes} votes</span>
                    <span>({getVotePercentage(option.votes)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getVotePercentage(option.votes)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(poll.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showResults && !isExpired && isMember && (
            <button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Vote
            </button>
          )}
          
          {hasVoted && (
            <button
              onClick={() => setShowResults(!showResults)}
              className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showResults ? <BarChart className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {showResults ? 'Hide Results' : 'Show Results'}
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {!isMember && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Join this community to participate in polls.
          </p>
        </div>
      )}

      {isExpired && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            This poll has expired
          </p>
        </div>
      )}
    </div>
  );
}