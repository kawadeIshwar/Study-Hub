import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Edit2,
  Save,
  X,
  Camera,
  FileText,
  Users,
  MessageCircle,
  Calendar,
  Hash
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    // Student fields
    college: '',
    course: '',
    department: '',
    year: '',
    semester: '',
    rollNumber: '',
    // Teacher fields
    qualification: '',
    specialization: '',
    institution: '',
    experience: '',
    subjects: []
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        college: res.data.college || '',
        course: res.data.course || '',
        department: res.data.department || '',
        year: res.data.year || '',
        semester: res.data.semester || '',
        rollNumber: res.data.rollNumber || '',
        qualification: res.data.qualification || '',
        specialization: res.data.specialization || '',
        institution: res.data.institution || '',
        experience: res.data.experience || '',
        subjects: res.data.subjects || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectsChange = (e) => {
    const subjectsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
    setFormData(prev => ({
      ...prev,
      subjects: subjectsArray
    }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Name is required');
      return false;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      toast.error('Phone number is required');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare data based on role
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/[\s-]/g, ''),
        bio: formData.bio.trim()
      };

      if (user.role === 'student') {
        updateData.college = formData.college.trim();
        updateData.course = formData.course.trim();
        updateData.department = formData.department.trim();
        updateData.year = formData.year;
        updateData.semester = formData.semester.trim();
        updateData.rollNumber = formData.rollNumber.trim();
      } else if (user.role === 'teacher') {
        updateData.qualification = formData.qualification.trim();
        updateData.specialization = formData.specialization.trim();
        updateData.institution = formData.institution.trim();
        updateData.experience = formData.experience;
        updateData.subjects = formData.subjects;
      }

      const res = await axios.put(`${API_URL}/api/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      college: user.college || '',
      course: user.course || '',
      department: user.department || '',
      year: user.year || '',
      semester: user.semester || '',
      rollNumber: user.rollNumber || '',
      qualification: user.qualification || '',
      specialization: user.specialization || '',
      institution: user.institution || '',
      experience: user.experience || '',
      subjects: user.subjects || []
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <span className="text-6xl font-black text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>
            </div>

            {/* Name and Role */}
            <div className="pt-24 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {user.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    user.role === 'teacher'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-semibold"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FileText className="w-8 h-8" />}
              label="Notes Uploaded"
              value={stats.notesUploaded || 0}
              color="blue"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Communities"
              value={stats.communitiesJoined || 0}
              color="purple"
            />
            <StatCard
              icon={<MessageCircle className="w-8 h-8" />}
              label="Messages"
              value={stats.messagesSent || 0}
              color="green"
            />
            <StatCard
              icon={<Award className="w-8 h-8" />}
              label="Contributions"
              value={stats.totalContributions || 0}
              color="orange"
            />
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <InputField
                icon={<User className="w-5 h-5" />}
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />

              <InputField
                icon={<Mail className="w-5 h-5" />}
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                type="email"
              />

              <InputField
                icon={<Phone className="w-5 h-5" />}
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                type="tel"
                placeholder="1234567890"
                required
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Academic/Professional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              {user.role === 'teacher' ? (
                <>
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Professional Information
                </>
              ) : (
                <>
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Academic Information
                </>
              )}
            </h2>

            <div className="space-y-4">
              {user.role === 'student' ? (
                <>
                  <InputField
                    icon={<Building2 className="w-5 h-5" />}
                    label="College/University"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      icon={<BookOpen className="w-5 h-5" />}
                      label="Course"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="B.Tech"
                    />

                    <InputField
                      icon={<GraduationCap className="w-5 h-5" />}
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Semester <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <label
                          key={sem}
                          className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.semester === String(sem)
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-md'
                              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300'
                          } ${
                            !isEditing ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'
                          }`}
                        >
                          <input
                            type="radio"
                            name="semester"
                            value={String(sem)}
                            checked={formData.semester === String(sem)}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="absolute opacity-0"
                          />
                          <span className="text-lg font-semibold">{sem}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <InputField
                    icon={<Hash className="w-5 h-5" />}
                    label="Roll Number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </>
              ) : (
                <>
                  <InputField
                    icon={<Building2 className="w-5 h-5" />}
                    label="Institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />

                  <InputField
                    icon={<Award className="w-5 h-5" />}
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="M.Tech, PhD"
                  />

                  <InputField
                    icon={<BookOpen className="w-5 h-5" />}
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Computer Science"
                  />

                  <InputField
                    icon={<Briefcase className="w-5 h-5" />}
                    label="Experience (years)"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    type="number"
                    placeholder="5"
                  />

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Subjects (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.subjects.join(', ')}
                      onChange={handleSubjectsChange}
                      disabled={!isEditing}
                      placeholder="Data Structures, Algorithms, DBMS"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({ icon, label, required, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
        {label}
      </p>
    </div>
  );
};

export default Profile;
