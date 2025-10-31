import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI } from '../utils/api';
import { Mail, Lock, ArrowRight, Sparkles, Zap, BookOpen } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Get redirect path (or go to home if none)
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

// Handle Login
const handleLogin = async (e) => {
  e.preventDefault(); // Prevent form submission reload
  
  try {
    const res = await authAPI.login({ email, password });

    const token = res.data.token;
    localStorage.setItem('token', token);
    toast.success("Login Successful!");
    window.dispatchEvent(new Event("storage"));

    // Reset form data
    setEmail('');
    setPassword('');

    // Redirect after 1.5 seconds
    setTimeout(() => {
      navigate(redirectPath);
    }, 1500);

  } catch (err) {
    console.error('Login error:', err);
    toast.error(err.response?.data?.error || err.response?.data?.msg || 'Login failed! Please try again.');
  }
};


  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-sky-300 dark:from-blue-900 dark:to-sky-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400 to-indigo-300 dark:from-cyan-900 dark:to-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-700 dark:from-blue-800 dark:via-sky-800 dark:to-cyan-900 p-12 items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-sm font-bold">Welcome Back!</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Continue Your <span className="text-yellow-300">Learning</span>
          </h1>
          
          <p className="text-xl text-blue-100 leading-relaxed">
            Log in to access your notes, join study communities, and collaborate with students worldwide.
          </p>
          
          <div className="space-y-4 pt-6">
            {[
              { icon: <BookOpen className="w-6 h-6" />, text: 'Access 10K+ Notes' },
              { icon: <Zap className="w-6 h-6" />, text: 'Instant Downloads' },
              { icon: <Sparkles className="w-6 h-6" />, text: 'Join Communities' }
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
              src="/student-6.png" 
              alt="Student" 
              className="w-full max-w-md mx-auto drop-shadow-2xl floating"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center">
            <h2 className="text-3xl font-black">
              <span className="bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                StudyHub
              </span>
            </h2>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Log in to your StudyHub account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-sky-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Sign In</span>
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
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
            >
              Create a new account
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;