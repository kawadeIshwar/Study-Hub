import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Pin, Search, Settings, Bell, Hash, UserPlus, Lock, Clock } from 'lucide-react';
import CommunityChat from '../components/CommunityChat';
import axios from 'axios';
import { toast } from 'react-toastify';
import cacheService from '../services/cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  
  const token = localStorage.getItem('token');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      toast.info('Please login to view community details', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login', { state: { from: `/communities/${communityId}` } });
    }
  }, [token, navigate, communityId]);

  const isUserOnline = (userId) => {
    return onlineMembers.has(userId);
  };

  useEffect(() => {
    if (!communityId || !token) return;
    
    // Fetch community details FIRST (fastest - just show the page)
    const fetchCommunityDetails = async () => {
      try {
        // Check cache first
        const cachedCommunity = cacheService.get(`communities_${communityId}`);
        
        if (cachedCommunity) {
          setCurrentCommunity(cachedCommunity);
          setUserRole(cachedCommunity.userRole);
          setIsMember(cachedCommunity.isMember || false);
          setIsPending(cachedCommunity.isPending || false);
          setLoading(false); // Show UI immediately with cached data
        }

        // Fetch fresh data
        const communityRes = await axios.get(`${API_URL}/api/communities/${communityId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        cacheService.set(`communities_${communityId}`, communityRes.data);
        setCurrentCommunity(communityRes.data);
        setUserRole(communityRes.data.userRole);
        setIsMember(communityRes.data.isMember || false);
        setIsPending(communityRes.data.isPending || false);
        setLoading(false); // Show UI as soon as we have community details
        
      } catch (error) {
        console.error('Error fetching community:', error);
        const cachedCommunity = cacheService.get(`communities_${communityId}`);
        if (!cachedCommunity) {
          toast.error('Failed to load community');
        }
        setLoading(false);
      }
    };
    
    // Fetch members in BACKGROUND (parallel, non-blocking)
    const fetchMembers = async () => {
      try {
        const cachedMembers = cacheService.get(`communities_${communityId}_members`);
        
        if (cachedMembers) {
          setMembers(cachedMembers);
          setMembersLoading(false);
        }

        const membersRes = await axios.get(`${API_URL}/api/communities/${communityId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        cacheService.set(`communities_${communityId}_members`, membersRes.data.members || []);
        setMembers(membersRes.data.members || []);
        setMembersLoading(false);
        
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembersLoading(false);
      }
    };
    
    // Execute both but don't wait - let UI show immediately
    fetchCommunityDetails();
    fetchMembers(); // Run in background
    
  }, [communityId, token]);

  const handleJoinCommunity = async () => {
    if (!token) {
      toast.error('Please login to join communities');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/communities/${communityId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if approval is required
      if (response.data.requiresApproval) {
        setIsPending(true);
        setIsMember(false);
        toast.info('📨 Join request sent! Waiting for teacher approval.', {
          autoClose: 5000
        });
      } else {
        setIsMember(true);
        setUserRole('member');
        setIsPending(false);
        toast.success('Successfully joined community! 🎉');
      }
      
      // Refresh community data
      const communityRes = await axios.get(`${API_URL}/api/communities/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentCommunity(communityRes.data);
      
      cacheService.set(`communities_${communityId}`, communityRes.data);
      
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error(error.response?.data?.msg || 'Failed to join community');
    } finally {
      setJoining(false);
    }
  };

  // Show minimal loading only if we have no data at all
  if (loading && !currentCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Community not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar - Members */}
      {showMembers && (
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Members ({members.length})
              </h3>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {membersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Loading members...</p>
              </div>
            ) : (
              members.filter(member => 
                member?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(member => (
                member?.user ? (
                  <div key={member.user._id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 mb-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    {isUserOnline(member.user._id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role}
                    </p>
                  </div>
                  </div>
                ) : null
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!showMembers && (
                <button
                  onClick={() => setShowMembers(true)}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentCommunity.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentCommunity.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                {currentCommunity.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Component or Join Prompt */}
        <div className="flex-1 p-6">
          {!isMember ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className={`w-20 h-20 ${isPending ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  {isPending ? (
                    <Clock className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <Lock className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {isPending ? 'Request Pending' : 'Join to Start Chatting'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {isPending 
                    ? 'Your join request is waiting for teacher approval. You will be notified once approved.' 
                    : `Become a member to view messages, participate in discussions, and connect with ${members.length} members.`
                  }
                </p>
                {isPending ? (
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span>Waiting for Approval</span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={joining}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {joining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Request to Join</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <CommunityChat communityId={communityId} userRole={userRole} />
          )}
        </div>
      </div>
    </div>
  );
}