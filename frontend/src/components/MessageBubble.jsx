import React, { useState } from 'react';
import { Pin, Trash2, MoreVertical, Reply, Hash, ExternalLink } from 'lucide-react';

export default function MessageBubble({ message, onPin, onDelete, userRole, isOwnMessage }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isMeetingLink = (text) => {
    const meetingPatterns = [
      /meet\.google\.com\/[a-zA-Z0-9-]+/,
      /zoom\.us\/j\/[0-9]+/,
      /teams\.microsoft\.com\/.*meetup-join/,
      /webex\.com\/.*join/,
      /skype\.com\/.*join/,
      /gotomeeting\.com\/.*join/,
      /bluejeans\.com\/.*join/
    ];
    return meetingPatterns.some(pattern => pattern.test(text));
  };

  const extractMeetingLink = (text) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlPattern);
    return matches ? matches.find(url => isMeetingLink(url)) : null;
  };

  const formatMessage = (content) => {
    // Convert URLs to clickable links
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <span className="text-yellow-500 text-xs">👑</span>;
      case 'moderator':
        return <span className="text-blue-500 text-xs">🛡️</span>;
      default:
        return null;
    }
  };

  const canModerate = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handlePin = () => {
    onPin(message._id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message._id);
    }
    setShowMenu(false);
  };

  const handleReply = () => {
    setShowReplyForm(true);
    setShowMenu(false);
  };

  const submitReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      // Handle reply submission
      console.log('Reply to message:', message._id, 'Reply:', replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  const meetingLink = extractMeetingLink(message.content);

  return (
    <div className={`group relative flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${
      message.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400' : ''
    }`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {message.author?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {message.author?.name || 'Unknown User'}
          </span>
          {getRoleIcon(message.author?.role)}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          {message.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded-full">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}
        </div>

        <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
        </div>

        {/* Meeting Link Button */}
        {meetingLink && (
          <div className="mt-2">
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </a>
          </div>
        )}

        {/* Replies */}
        {message.replies && message.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.replies.map((reply) => (
              <div key={reply._id} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white text-xs">
                    {reply.author?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reply.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={submitReply} className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={handleReply}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            {canModerate() && (
              <button
                onClick={handlePin}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Pin className="w-4 h-4" />
                {message.isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            {(canModerate() || isOwnMessage) && (
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}