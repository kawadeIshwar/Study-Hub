import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Pin, Search, Settings, Bell, Hash } from 'lucide-react';
import CommunityChat from '../components/CommunityChat';
import axios from 'axios';
import { toast } from 'react-toastify';
import cacheService from '../services/cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommunityDetail() {
  const { communityId } = useParams();
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  
  const token = localStorage.getItem('token');

  const isUserOnline = (userId) => {
    return onlineMembers.has(userId);
  };

  useEffect(() => {
    if (!communityId || !token) return;
    
    const fetchCommunityData = async () => {
      try {
        // Try to load from cache first
        const cachedCommunity = cacheService.get(`communities_${communityId}`);
        const cachedMembers = cacheService.get(`communities_${communityId}_members`);
        
        if (cachedCommunity && cachedMembers) {
          console.log('📦 Loading community from cache...');
          setCurrentCommunity(cachedCommunity);
          setMembers(cachedMembers);
          setUserRole(cachedCommunity.userRole);
          setLoading(false);
          // Removed toast - silent cache load for better UX
        } else {
          setLoading(true);
        }

        // Fetch fresh data
        const [communityRes, membersRes] = await Promise.all([
          axios.get(`${API_URL}/api/communities/${communityId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/communities/${communityId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Update cache
        cacheService.set(`communities_${communityId}`, communityRes.data);
        cacheService.set(`communities_${communityId}_members`, membersRes.data.members || []);
        
        setCurrentCommunity(communityRes.data);
        setMembers(membersRes.data.members || []);
        setUserRole(communityRes.data.userRole);
        
        // Silent update - no toast needed
        if (!cachedCommunity) {
          console.log('✅ Community data loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
        // Only show error if no cached data available
        const cachedCommunity = cacheService.get(`communities_${communityId}`);
        if (!cachedCommunity && !currentCommunity) {
          toast.error('Failed to load community details');
        } else {
          // Silent fallback to cache
          console.warn('Using cached data, fresh fetch failed:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunityData();
  }, [communityId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading community...</p>
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
            {members.filter(member => 
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
            ))}
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

        {/* Chat Component */}
        <div className="flex-1 p-6">
          <CommunityChat communityId={communityId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}