import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Pin, Trash2, Reply } from 'lucide-react';
import socketService from '../services/socket';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommunityChat({ communityId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !communityId) return;

    // Connect to socket
    socketService.connect(token);
    socketService.joinCommunity(communityId);

    // Fetch initial messages
    fetchMessages();

    // Socket event listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onMessagePinned(handleMessagePinned);

    return () => {
      socketService.leaveCommunity(communityId);
      socketService.offEvent('new-message');
      socketService.offEvent('user-typing');
      socketService.offEvent('message-deleted');
      socketService.offEvent('message-pinned');
    };
  }, [communityId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/messages/${communityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserTyping = ({ userName, isTyping }) => {
    if (isTyping) {
      setTyping(prev => [...new Set([...prev, userName])]);
    } else {
      setTyping(prev => prev.filter(name => name !== userName));
    }
  };

  const handleMessageDeleted = ({ messageId }) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  };

  const handleMessagePinned = ({ messageId, isPinned }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, isPinned } : msg
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      communityId,
      content: newMessage,
      type: 'text',
      parentMessage: replyTo?._id
    };

    socketService.sendMessage(messageData);
    setNewMessage('');
    setReplyTo(null);
  };

  const handleTyping = () => {
    socketService.sendTyping({ communityId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping({ communityId, isTyping: false });
    }, 1000);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      socketService.deleteMessage(messageId);
    }
  };

  const handlePinMessage = (messageId) => {
    socketService.pinMessage(messageId);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(msg => {
      const date = formatDate(msg.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Chat</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {date}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            {msgs.map((message) => (
              <div key={message._id} className="group mb-3">
                {message.isPinned && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500 mb-1">
                    <Pin size={12} />
                    <span>Pinned message</span>
                  </div>
                )}
                
                {message.parentMessage && (
                  <div className="ml-10 mb-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400 border-l-2 border-blue-500">
                    <span className="text-xs">Replying to previous message</span>
                  </div>
                )}

                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {message.sender?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Message Header */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {message.sender?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="text-gray-800 dark:text-gray-200 break-words">
                      {message.content}
                    </div>

                    {/* File Attachment */}
                    {message.fileUrl && (
                      <div className="mt-2">
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800"
                        >
                          <Paperclip size={16} />
                          <span className="text-sm">{message.fileName || 'File'}</span>
                        </a>
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setReplyTo(message)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Reply"
                      >
                        <Reply size={14} className="text-gray-500" />
                      </button>
                      
                      {(userRole === 'admin' || userRole === 'moderator') && (
                        <>
                          <button
                            onClick={() => handlePinMessage(message._id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title={message.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin size={14} className={message.isPinned ? 'text-yellow-500' : 'text-gray-500'} />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typing.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            <span>{typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reply size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Replying to {replyTo.sender?.name}
            </span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button
              type="button"
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Smile size={20} className="text-gray-500" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Paperclip size={20} className="text-gray-500" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
