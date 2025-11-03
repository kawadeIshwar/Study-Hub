import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const CommunitiesContext = createContext();

const initialState = {
  communities: [],
  currentCommunity: null,
  members: [],
  messages: [],
  polls: [],
  notifications: [],
  loading: false,
  error: null,
  socket: null,
  onlineUsers: new Set()
};

function communitiesReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_COMMUNITIES':
      return { ...state, communities: action.payload, loading: false };
    case 'SET_CURRENT_COMMUNITY':
      return { ...state, currentCommunity: action.payload };
    case 'ADD_COMMUNITY':
      return { ...state, communities: [action.payload, ...state.communities] };
    case 'UPDATE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community._id === action.payload._id ? action.payload : community
        ),
        currentCommunity: state.currentCommunity?._id === action.payload._id ? action.payload : state.currentCommunity
      };
    case 'SET_MEMBERS':
      return { ...state, members: action.payload };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'REMOVE_MEMBER':
      return { ...state, members: state.members.filter(member => member.user._id !== action.payload) };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload._id ? action.payload : msg
        )
      };
    case 'DELETE_MESSAGE':
      return { ...state, messages: state.messages.filter(msg => msg._id !== action.payload) };
    case 'SET_POLLS':
      return { ...state, polls: action.payload };
    case 'ADD_POLL':
      return { ...state, polls: [action.payload, ...state.polls] };
    case 'UPDATE_POLL':
      return {
        ...state,
        polls: state.polls.map(poll =>
          poll._id === action.payload._id ? action.payload : poll
        )
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: new Set(action.payload) };
    case 'ADD_ONLINE_USER':
      return { ...state, onlineUsers: new Set([...state.onlineUsers, action.payload]) };
    case 'REMOVE_ONLINE_USER':
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(action.payload);
      return { ...state, onlineUsers: newOnlineUsers };
    default:
      return state;
  }
}

export function CommunitiesProvider({ children }) {
  const [state, dispatch] = useReducer(communitiesReducer, initialState);

  // Fetch all communities (accessible to all users)
  const fetchCommunities = async (search = '', tags = '') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tags) params.append('tags', tags);
      
      const response = await api.get(`/communities?${params}`);
      dispatch({ type: 'SET_COMMUNITIES', payload: response.data.communities });
    } catch (error) {
      console.error('Error fetching communities:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.msg || error.message || 'Failed to fetch communities' });
    }
  };

  // Create new community
  const createCommunity = async (communityData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/communities', communityData);
      dispatch({ type: 'ADD_COMMUNITY', payload: response.data.community });
      return response.data.community;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create community' });
      throw error;
    }
  };

  // Join community
  const joinCommunity = async (communityId) => {
    try {
      const response = await api.post(`/communities/${communityId}/join`);
      dispatch({ type: 'UPDATE_COMMUNITY', payload: response.data.community });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to join community' });
      throw error;
    }
  };

  // Leave community
  const leaveCommunity = async (communityId) => {
    try {
      const response = await api.post(`/communities/${communityId}/leave`);
      dispatch({ type: 'UPDATE_COMMUNITY', payload: response.data.community });
      
      // If we're currently viewing this community, clear it
      if (state.currentCommunity?._id === communityId) {
        dispatch({ type: 'SET_CURRENT_COMMUNITY', payload: null });
      }
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to leave community' });
      throw error;
    }
  };

  // Fetch community details (accessible to all users)
  const fetchCommunityDetails = async (communityId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/communities/${communityId}`);
      dispatch({ type: 'SET_CURRENT_COMMUNITY', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching community details:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.msg || error.message || 'Failed to fetch community details' });
      throw error;
    }
  };

  // Fetch community members
  const fetchCommunityMembers = async (communityId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/communities/${communityId}/members?${params}`);
      dispatch({ type: 'SET_MEMBERS', payload: response.data.members });
      return response.data.members;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch members' });
      throw error;
    }
  };

  // Fetch community messages
  const fetchCommunityMessages = async (communityId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/messages/community/${communityId}?${params}`);
      dispatch({ type: 'SET_MESSAGES', payload: response.data.messages });
      return response.data.messages;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch messages' });
      throw error;
    }
  };

  // Send message
  const sendMessage = async (communityId, messageData) => {
    try {
      const response = await api.post(`/messages/community/${communityId}`, messageData);
      dispatch({ type: 'ADD_MESSAGE', payload: response.data.message });
      return response.data.message;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to send message' });
      throw error;
    }
  };

  // Pin/unpin message
  const togglePinMessage = async (messageId) => {
    try {
      const response = await api.patch(`/messages/${messageId}/pin`);
      dispatch({ type: 'UPDATE_MESSAGE', payload: response.data.message });
      return response.data.message;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to pin/unpin message' });
      throw error;
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete message' });
      throw error;
    }
  };

  // Fetch community polls
  const fetchCommunityPolls = async (communityId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/polls/community/${communityId}?${params}`);
      dispatch({ type: 'SET_POLLS', payload: response.data.polls });
      return response.data.polls;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch polls' });
      throw error;
    }
  };

  // Create poll
  const createPoll = async (communityId, pollData) => {
    try {
      const response = await api.post(`/polls/community/${communityId}`, pollData);
      dispatch({ type: 'ADD_POLL', payload: response.data.poll });
      return response.data.poll;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create poll' });
      throw error;
    }
  };

  // Vote on poll
  const votePoll = async (pollId, optionId) => {
    try {
      const response = await api.post(`/polls/${pollId}/vote`, { optionId });
      dispatch({ type: 'UPDATE_POLL', payload: response.data.poll });
      return response.data.poll;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to vote on poll' });
      throw error;
    }
  };

  // Fetch notifications
  const fetchNotifications = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/notifications?${params}`);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.notifications });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch notifications' });
      throw error;
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      // Update local state
      const updatedNotifications = state.notifications.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      );
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to mark notification as read' });
      throw error;
    }
  };

  // Socket.io connection
  const connectSocket = (socket) => {
    dispatch({ type: 'SET_SOCKET', payload: socket });
  };

  // Update online users
  const updateOnlineUsers = (userIds) => {
    dispatch({ type: 'SET_ONLINE_USERS', payload: userIds });
  };

  const value = {
    ...state,
    fetchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    fetchCommunityDetails,
    fetchCommunityMembers,
    fetchCommunityMessages,
    sendMessage,
    togglePinMessage,
    deleteMessage,
    fetchCommunityPolls,
    createPoll,
    votePoll,
    fetchNotifications,
    markNotificationRead,
    connectSocket,
    updateOnlineUsers
  };

  return (
    <CommunitiesContext.Provider value={value}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunities() {
  const context = useContext(CommunitiesContext);
  if (!context) {
    throw new Error('useCommunities must be used within a CommunitiesProvider');
  }
  return context;
}