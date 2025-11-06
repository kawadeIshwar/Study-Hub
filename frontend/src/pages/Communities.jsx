import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCommunities } from '../contexts/CommunitiesContext';
import { Search, Users, Calendar, Plus, Filter, TrendingUp, BookOpen, Code, Calculator, Globe, Beaker, MessageCircle, Shield, GraduationCap, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const categoryIcons = {
  'Web Development': Globe,
  'DSA': Code,
  'Mathematics': Calculator,
  'Science': Beaker,
  'General': BookOpen,
  'Trending': TrendingUp
};

const predefinedTags = [
  'Web Development', 'DSA', 'Mathematics', 'Science', 'JavaScript', 'React', 'Node.js', 
  'Python', 'Java', 'C++', 'Database', 'Machine Learning', 'AI', 'Exam Preparation'
];

export default function Communities() {
  const { communities, fetchCommunities, loading, error, createCommunity } = useCommunities();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeSection, setActiveSection] = useState('all'); // 'all', 'teacher', 'student'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    tags: [],
    isPrivate: false
  });

  useEffect(() => {
    const creatorRole = activeSection === 'all' ? '' : activeSection;
    fetchCommunities(searchTerm, selectedTags.join(','), creatorRole);
  }, [searchTerm, selectedTags, activeSection]);

  const handleCommunityClick = (e, communityId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      e.preventDefault();
      toast.info('Please login to access community', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login', { state: { from: `/communities/${communityId}` } });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    
    // Validate community name
    if (!newCommunity.name || newCommunity.name.trim() === '') {
      toast.error('Community name is required and cannot be empty');
      return;
    }
    
    if (newCommunity.name.trim().length < 3) {
      toast.error('Community name must be at least 3 characters long');
      return;
    }
    
    if (newCommunity.name.trim().length > 50) {
      toast.error('Community name must not exceed 50 characters');
      return;
    }
    
    // Validate description
    if (!newCommunity.description || newCommunity.description.trim() === '') {
      toast.error('Description is required and cannot be empty');
      return;
    }
    
    if (newCommunity.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long');
      return;
    }
    
    if (newCommunity.description.trim().length > 300) {
      toast.error('Description must not exceed 300 characters');
      return;
    }
    
    // Validate tags
    if (!newCommunity.tags || newCommunity.tags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }
    
    try {
      // Trim data before submission
      const trimmedCommunity = {
        name: newCommunity.name.trim(),
        description: newCommunity.description.trim(),
        tags: newCommunity.tags,
        isPrivate: newCommunity.isPrivate
      };
      
      await createCommunity(trimmedCommunity);
      setShowCreateModal(false);
      setNewCommunity({ name: '', description: '', tags: [], isPrivate: false });
      fetchCommunities();
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };

  const getCategoryIcon = (tags) => {
    const mainTag = tags?.[0];
    const Icon = categoryIcons[mainTag] || BookOpen;
    return Icon;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-300 dark:from-teal-900 dark:to-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-300 dark:from-blue-900 dark:to-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
        </div>
        
        <div className="relative text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-teal-600 dark:border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-xl font-bold text-gray-700 dark:text-gray-300">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-red-400 to-orange-300 dark:from-red-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-float"></div>
        </div>
        
        <div className="relative text-center max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-3">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error}
          </p>
          <button 
            onClick={() => fetchCommunities()}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-300 dark:from-teal-900 dark:to-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-indigo-300 dark:from-blue-900 dark:to-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-violet-400 to-purple-300 dark:from-violet-900 dark:to-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 section-container pt-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 dark:from-teal-800 dark:via-cyan-800 dark:to-blue-900 rounded-[40px] shadow-2xl overflow-hidden mb-12 animate-slideUp">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 md:py-16">
            <div className="flex-1 text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Users className="w-5 h-5 text-cyan-200 animate-pulse" />
                <span className="text-sm font-bold">Join {communities.length}+ Active Communities</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                Connect & <span className="text-yellow-300">Collaborate</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed max-w-2xl">
                Join specialized study groups, share knowledge, and grow together with peers worldwide
              </p>
              
              <button
                onClick={() => {
                  if (isAuthenticated()) {
                    setShowCreateModal(true);
                  } else {
                    window.location.href = '/login';
                  }
                }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create Community</span>
              </button>
            </div>
            
            <div className="flex-1 hidden md:block relative">
              <img 
                src="/student-2.png" 
                alt="Community" 
                className="w-full max-w-[400px] mx-auto drop-shadow-2xl floating"
              />
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-cyan-400/30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50 dark:fill-gray-900/50"></path>
            </svg>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8 mb-10 border border-gray-200/50 dark:border-gray-700/50 animate-fadeIn delay-200">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 w-5 h-5 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search communities by name, tags..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-semibold"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 text-teal-700 dark:text-teal-300 rounded-2xl hover:from-teal-200 hover:to-cyan-200 dark:hover:from-teal-800/50 dark:hover:to-cyan-800/50 transition-all duration-300 font-bold border-2 border-teal-200 dark:border-teal-800">
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">Filter by tags:</p>
            <div className="flex flex-wrap gap-3">
              {predefinedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                Clear all filters ({selectedTags.length})
              </button>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex justify-center mb-8 animate-fadeIn delay-300">
          <div className="inline-flex bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl p-2 shadow-2xl border border-gray-700/50 dark:border-gray-600/50">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-10 py-4 rounded-2xl font-black text-base transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                activeSection === 'all'
                  ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-2xl shadow-teal-500/50 scale-105 transform'
                  : 'text-gray-400 dark:text-gray-500 hover:text-teal-400 dark:hover:text-teal-300 hover:bg-gray-800/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="flex items-center gap-2">
                All Communities
                <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeSection === 'all' 
                    ? 'bg-white/30 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {communities.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveSection('teacher')}
              className={`px-10 py-4 rounded-2xl font-black text-base transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                activeSection === 'teacher'
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-2xl shadow-blue-500/50 scale-105 transform'
                  : 'text-gray-400 dark:text-gray-500 hover:text-blue-400 dark:hover:text-blue-300 hover:bg-gray-800/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              <span>By Teachers</span>
            </button>
            <button
              onClick={() => setActiveSection('student')}
              className={`px-10 py-4 rounded-2xl font-black text-base transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                activeSection === 'student'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-2xl shadow-emerald-500/50 scale-105 transform'
                  : 'text-gray-400 dark:text-gray-500 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-gray-800/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <UserCircle className="w-6 h-6" />
              <span>By Students</span>
            </button>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Available Communities
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Found {communities.length} {communities.length === 1 ? 'community' : 'communities'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-teal-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <Users className="relative w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-700 dark:text-gray-300 mb-3">No communities found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Try adjusting your search or filters, or be the first to create a community!
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTags([]);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 text-teal-700 dark:text-teal-300 rounded-xl font-bold hover:scale-105 transition-all duration-300"
                  >
                    Clear filters
                  </button>
                  <button 
                    onClick={() => isAuthenticated() ? setShowCreateModal(true) : window.location.href = '/login'}
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
                  >
                    Create Community
                  </button>
                </div>
              </div>
            ) : (
              communities.map((community, index) => {
                const Icon = getCategoryIcon(community.tags);
                return (
                  <Link
                    key={community._id}
                    to={`/communities/${community._id}`}
                    onClick={(e) => handleCommunityClick(e, community._id)}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 animate-fadeInUp"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Top gradient border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                              {community.name}
                            </h3>
                            <div className="flex gap-1 mt-1">
                              {community.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 rounded-full font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {community.isPrivate && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs rounded-full font-bold">
                            <TrendingUp className="w-3 h-3" />
                            Private
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {community.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span className="font-semibold text-teal-700 dark:text-teal-300">{community.stats?.totalMembers || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                          <MessageCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span className="font-semibold text-cyan-700 dark:text-cyan-300">{community.stats?.totalMessages || 0}</span>
                        </div>
                      </div>

                      {community.stats?.lastActivity && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-teal-500" />
                            <span>Last active {new Date(community.stats.lastActivity).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom decorative corner */}
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-teal-500/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-scaleIn">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-3xl border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-t-3xl"></div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Create New Community
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Build your study group and connect with peers
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateCommunity} className="px-8 py-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="text-teal-600 dark:text-teal-400">*</span>
                  Community Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  required
                  minLength={3}
                  placeholder="e.g., DSA Study Group"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newCommunity.name.length}/50 characters
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="text-teal-600 dark:text-teal-400">*</span>
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 dark:bg-gray-700 dark:text-white transition-all duration-300 resize-none"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Describe what this community is about... Share the goals, topics, and what members can expect."
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newCommunity.description.length}/300 characters
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-teal-600 dark:text-teal-400">*</span>
                  Tags (select up to 3)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {predefinedTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const newTags = newCommunity.tags.includes(tag)
                          ? newCommunity.tags.filter(t => t !== tag)
                          : newCommunity.tags.length < 3 
                            ? [...newCommunity.tags, tag]
                            : newCommunity.tags;
                        setNewCommunity({ ...newCommunity, tags: newTags });
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 text-center ${
                        newCommunity.tags.includes(tag)
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-800 scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-teal-600 dark:text-teal-400">{newCommunity.tags.length}</span>/3 tags selected
                  </p>
                  {newCommunity.tags.length > 0 && (
                    <div className="flex gap-2">
                      {newCommunity.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                    className="w-6 h-6 text-teal-600 rounded-lg focus:ring-2 focus:ring-teal-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        Make this community private
                      </span>
                      <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full">
                        OPTIONAL
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Private communities are invite-only. Members must be approved before joining.
                    </span>
                  </div>
                </label>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-6 pb-2 -mx-8 px-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCommunity.name || !newCommunity.description || newCommunity.tags.length === 0}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl text-base font-bold hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Create Community
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}