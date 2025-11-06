import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Sparkles, Shield, GraduationCap, BookOpen, Building2, Phone, Award, Briefcase } from 'lucide-react';

const TeacherSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    qualification: '',
    specialization: '',
    experience: '',
    institution: '',
    subjects: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Check for empty or whitespace-only fields
    const requiredFields = ['name', 'email', 'password', 'qualification', 'specialization', 'institution', 'subjects', 'phone'];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required and cannot be empty`);
        return false;
      }
    }

    // Validate name (at least 2 characters)
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate password (minimum 6 characters)
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    // Validate experience (must be a positive number)
    if (formData.experience && (isNaN(formData.experience) || parseInt(formData.experience) < 0)) {
      toast.error('Experience must be a positive number');
      return false;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    // Validate subjects (at least one subject)
    const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(s => s !== '');
    if (subjectsArray.length === 0) {
      toast.error('Please enter at least one subject');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Convert subjects string to array and trim
      const subjectsArray = formData.subjects
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

      // Trim all fields before submission
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        institution: formData.institution.trim(),
        subjects: subjectsArray,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        phone: formData.phone.trim().replace(/[\s-]/g, ''),
      };

      const res = await authAPI.teacherSignup(payload);
      toast.success('Teacher account registered successfully!');
      setFormData({ 
        name: '', 
        email: '', 
        password: '',
        qualification: '',
        specialization: '',
        experience: '',
        institution: '',
        subjects: '',
        phone: '',
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err.response?.data?.msg || err.response?.data?.error || 'Signup failed!');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-300 dark:from-blue-900 dark:to-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-pink-300 dark:from-purple-900 dark:to-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 p-12 items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-sm font-bold">Empower Students Worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Teach & <span className="text-yellow-300">Inspire</span> Together
          </h1>
          
          <p className="text-xl text-blue-100 leading-relaxed">
            Join as an educator to share knowledge, create communities, and guide students on their learning journey.
          </p>
          
          <div className="space-y-4 pt-6">
            {[
              { icon: <Shield className="w-6 h-6" />, text: 'Verified Educators' },
              { icon: <BookOpen className="w-6 h-6" />, text: 'Share Resources' },
              { icon: <Sparkles className="w-6 h-6" />, text: 'Build Communities' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-lg font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="pt-8">
            <img 
              src="/student-8.png" 
              alt="Teacher" 
              className="w-full max-w-md mx-auto drop-shadow-2xl floating"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-8 animate-fadeIn">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center">
            <h2 className="text-3xl font-black">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                StudyHub
              </span>
            </h2>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Join as Teacher
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create your educator account to start teaching
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            {/* Teacher Information Section */}
            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Professional Information
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Help students know more about you
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Institution */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Institution/School
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Enter your institution name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Qualification and Specialization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Qualification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Qualification
                    </label>
                    <div className="relative group">
                      <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., M.Sc, Ph.D"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Specialization
                    </label>
                    <div className="relative group">
                      <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Mathematics"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Years of Experience
                  </label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      min="0"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Subjects You Teach
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleChange}
                      placeholder="e.g., Math, Physics, Chemistry (comma-separated)"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    Separate multiple subjects with commas
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Create Teacher Account</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-semibold">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center space-y-2">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
            >
              Sign in to your account
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
            <a
              href="/signup"
              className="inline-block text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-300"
            >
              Join as a Student
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignup;
