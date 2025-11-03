import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Pin, Trash2, Reply, Edit2, Search, X } from 'lucide-react';
import socketService from '../services/socket';
import axios from 'axios';
import { toast } from 'react-toastify';
import cacheService from '../services/cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommunityChat({ communityId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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
    socketService.onMessageEdited(handleMessageEdited);
    socketService.onReactionUpdated(handleReactionUpdated);
    socketService.onError((error) => {
      toast.error(error.message || 'An error occurred');
    });

    return () => {
      socketService.leaveCommunity(communityId);
      socketService.offEvent('new-message');
      socketService.offEvent('user-typing');
      socketService.offEvent('message-deleted');
      socketService.offEvent('message-pinned');
      socketService.offEvent('message-edited');
      socketService.offEvent('reaction-updated');
      socketService.offEvent('error');
    };
  }, [communityId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // Check cache first for instant load
      const cachedMessages = cacheService.get(`messages_${communityId}`);
      
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setLoading(false); // Show cached messages immediately
      }

      // Fetch fresh messages in background
      const response = await axios.get(
        `${API_URL}/api/messages/${communityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const freshMessages = response.data.messages || [];
      
      // Update cache with fresh data
      cacheService.set(`messages_${communityId}`, freshMessages, 300); // 5 min cache
      
      setMessages(freshMessages);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Only show error if we don't have cached data
      const cachedMessages = cacheService.get(`messages_${communityId}`);
      if (!cachedMessages || cachedMessages.length === 0) {
        toast.error('Failed to load messages');
      }
      
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      // Update cache when new message arrives
      cacheService.set(`messages_${communityId}`, updated, 300);
      return updated;
    });
  };

  const handleUserTyping = ({ userName, isTyping }) => {
    if (isTyping) {
      setTyping(prev => [...new Set([...prev, userName])]);
    } else {
      setTyping(prev => prev.filter(name => name !== userName));
    }
  };

  const handleMessageDeleted = ({ messageId }) => {
    setMessages(prev => {
      const updated = prev.filter(msg => msg._id !== messageId);
      cacheService.set(`messages_${communityId}`, updated, 300);
      return updated;
    });
  };

  const handleMessagePinned = ({ messageId, isPinned }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, isPinned } : msg
      )
    );
  };

  const handleMessageEdited = ({ messageId, content, editedAt }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, content, isEdited: true, editedAt } : msg
      )
    );
    toast.success('Message edited');
  };

  const handleReactionUpdated = ({ messageId, reactions }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId ? { ...msg, reactions } : msg
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    if (editingMessage) {
      // Edit existing message
      socketService.editMessage(editingMessage._id, newMessage);
      setEditingMessage(null);
      setNewMessage('');
      return;
    }

    if (selectedFile) {
      // Upload file first
      await handleFileUpload();
    } else {
      // Send text message
      const messageData = {
        communityId,
        content: newMessage,
        type: 'text',
        parentMessage: replyTo?._id
      };

      socketService.sendMessage(messageData);
      setNewMessage('');
      setReplyTo(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('content', newMessage || 'Shared a file');
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'file');
      if (replyTo) {
        formData.append('parentMessage', replyTo._id);
      }

      const response = await axios.post(
        `${API_URL}/api/messages/${communityId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // File uploaded successfully, message will be broadcast via socket
      setNewMessage('');
      setSelectedFile(null);
      setReplyTo(null);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
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

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setReplyTo(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleReaction = (messageId, emoji) => {
    socketService.addReaction(messageId, emoji);
    setShowEmojiPicker(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/messages/${communityId}/search`,
        {
          params: { query: searchQuery },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSearchResults(response.data.messages || []);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast.error('Failed to search messages');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

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

  // Use skeleton loader instead of blocking spinner for better perceived performance
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  const currentUserId = getCurrentUserId();

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
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Search messages"
        >
          <Search size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search messages..."
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {searchResults.length} result(s)
            </div>
          )}
        </div>
      )}

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
                      {message.isEdited && (
                        <span className="ml-2 text-xs text-gray-400 italic">(edited)</span>
                      )}
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

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReaction(message._id, reaction.emoji)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {reaction.users.length}
                            </span>
                          </button>
                        ))}
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

                      {/* Emoji Picker Button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Add reaction"
                        >
                          <Smile size={14} className="text-gray-500" />
                        </button>
                        {showEmojiPicker === message._id && (
                          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10">
                            <div className="flex gap-1">
                              {commonEmojis.map((emoji, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleReaction(message._id, emoji)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Edit button for own messages */}
                      {message.sender?._id === currentUserId && (
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Edit"
                        >
                          <Edit2 size={14} className="text-gray-500" />
                        </button>
                      )}
                      
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

      {/* Reply/Edit Preview */}
      {(replyTo || editingMessage) && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingMessage ? (
              <>
                <Edit2 size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Editing message
                </span>
              </>
            ) : (
              <>
                <Reply size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Replying to {replyTo.sender?.name}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setReplyTo(null);
              setEditingMessage(null);
              setNewMessage('');
            }}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>
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
              placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
              disabled={uploadingFile}
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Attach file"
              disabled={uploadingFile}
            >
              <Paperclip size={20} className="text-gray-500" />
            </button>
          </div>
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || uploadingFile}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadingFile ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
