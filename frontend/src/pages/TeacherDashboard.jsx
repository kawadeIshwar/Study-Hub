import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, notesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  BookOpen, Users, School, UserCheck, Upload, 
  FileText, TrendingUp, Award, CheckCircle, XCircle, Clock
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'teacher') {
      toast.error('Access denied. Teachers only.');
      navigate('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, notesRes, communitiesRes] = await Promise.all([
        teacherAPI.getDashboardStats(),
        teacherAPI.getNotes(),
        teacherAPI.getCommunities(),
      ]);

      setStats(statsRes.data);
      setNotes(notesRes.data);
      setCommunities(communitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (communityId) => {
    try {
      const res = await teacherAPI.getPendingRequests(communityId);
      setPendingRequests(res.data);
      setSelectedCommunity(communityId);
      setActiveTab('requests'); // Auto-switch to requests tab
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load pending requests');
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      await teacherAPI.handleJoinRequest(selectedCommunity, requestId, action);
      toast.success(`Request ${action}d successfully`);
      fetchPendingRequests(selectedCommunity);
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error('Error handling join request:', error);
      toast.error('Failed to handle request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your notes, communities, and student approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-8 h-8" />}
            title="Total Notes"
            value={stats?.totalNotes || 0}
            color="blue"
          />
          <StatCard
            icon={<School className="w-8 h-8" />}
            title="Communities"
            value={stats?.totalCommunities || 0}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Students"
            value={stats?.totalStudents || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            title="Pending Requests"
            value={stats?.pendingRequests || 0}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6 border-b dark:border-gray-700">
            {['overview', 'notes', 'communities', 'requests'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold capitalize transition-all duration-300 border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Notes */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      Recent Notes
                    </h3>
                    <div className="space-y-3">
                      {notes.slice(0, 5).map((note) => (
                        <div
                          key={note._id}
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {note.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {note.subject} • {new Date(note.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      View All Notes →
                    </button>
                  </div>

                  {/* Active Communities */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <School className="w-6 h-6 text-purple-600" />
                      Active Communities
                    </h3>
                    <div className="space-y-3">
                      {communities.slice(0, 5).map((community) => (
                        <div
                          key={community._id}
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {community.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {community.memberCount} members
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('communities')}
                      className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      View All Communities →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    All Your Notes
                  </h3>
                  <button
                    onClick={() => navigate('/upload')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload New Note
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {note.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {note.subject}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {note.likes} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'communities' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Your Communities
                  </h3>
                  <button
                    onClick={() => navigate('/communities')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                  >
                    <School className="w-5 h-5" />
                    Create Community
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.map((community) => (
                    <div
                      key={community._id}
                      className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {community.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {community.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {community.memberCount} members
                        </span>
                        <button
                          onClick={() => fetchPendingRequests(community._id)}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          View Requests
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Student Join Requests
                </h3>
                {!selectedCommunity ? (
                  <div className="text-center py-12">
                    <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a community to view pending requests
                    </p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {communities.map((community) => (
                        <button
                          key={community._id}
                          onClick={() => fetchPendingRequests(community._id)}
                          className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <p className="font-bold text-gray-900 dark:text-white">
                            {community.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to view requests
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No pending requests for this community
                    </p>
                    <button
                      onClick={() => setSelectedCommunity(null)}
                      className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      ← Back to communities
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setSelectedCommunity(null)}
                      className="mb-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      ← Back to communities
                    </button>
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                {request.user.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {request.user.email}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span>{request.user.college}</span>
                                <span>{request.user.course}</span>
                                <span>{request.user.year}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleJoinRequest(request._id, 'approve')}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleJoinRequest(request._id, 'reject')}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white mb-4`}>
        {icon}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
        {title}
      </p>
      <p className="text-3xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default TeacherDashboard;
