import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, Users, BarChart3, Pin, Calendar, Settings } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, unreadCount }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const getIcon = (type) => {
    switch (type) {
      case 'new_message':
      case 'mention':
        return <MessageSquare className="w-4 h-4" />;
      case 'new_member':
      case 'member_left':
        return <Users className="w-4 h-4" />;
      case 'poll_created':
      case 'poll_ended':
        return <BarChart3 className="w-4 h-4" />;
      case 'message_pinned':
        return <Pin className="w-4 h-4" />;
      case 'meeting_link':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'new_message':
      case 'mention':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'new_member':
      case 'member_left':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'poll_created':
      case 'poll_ended':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'message_pinned':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'meeting_link':
        return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = now - notificationTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'mentions') return notification.type === 'mention';
    if (filter === 'polls') return notification.type.includes('poll');
    if (filter === 'meetings') return notification.type === 'meeting_link';
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'unread') return a.isRead - b.isRead;
    return 0;
  });

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'new_message':
      case 'mention':
        // Navigate to the specific message/community
        break;
      case 'meeting_link':
        // Open meeting link
        if (notification.metadata?.meetingLink) {
          window.open(notification.metadata.meetingLink, '_blank');
        }
        break;
      case 'poll_created':
        // Navigate to the poll
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="mentions">Mentions</option>
              <option value="polls">Polls</option>
              <option value="meetings">Meetings</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="unread">Unread First</option>
            </select>
          </div>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onMarkAllAsRead}
                className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {sortedNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {filter === 'all' ? 'When something happens, you\'ll see it here.' : 'Try changing your filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {notification.content}
                          </p>
                          {notification.metadata && (
                            <div className="mt-2">
                              {notification.metadata.meetingLink && (
                                <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded">
                                  <Calendar className="w-3 h-3" />
                                  Join Meeting
                                </button>
                              )}
                              {notification.metadata.pollId && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded">
                                  <BarChart3 className="w-3 h-3" />
                                  View Poll
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}