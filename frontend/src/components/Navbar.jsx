import { useState, useEffect } from 'react';   // Hooks for state and side effects
import { Link } from 'react-router-dom';       // For navigation links
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for menu toggle
import { Users, MessageCircle } from 'lucide-react'; // Community icons
import { toast } from 'react-toastify';        // For toast notifications
import DarkModeToggle from './DarkModeToggle';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // For mobile menu open/close
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from localStorage

  useEffect(() => {
    const handleStorageChange = () => {
      const savedToken = localStorage.getItem('token');
      setToken(savedToken);  // Update token if changed elsewhere
    };

    window.addEventListener('storage', handleStorageChange); // Listen for storage changes

    return () => {
      window.removeEventListener('storage', handleStorageChange); // Cleanup listener
    };
  }, []);

  const handleLogout = () => {
    toast.success('Logout successful!');  // Show logout message
    setTimeout(() => {
      localStorage.removeItem('token');   // Remove token from storage
      setToken(null);                     // Clear token state
      window.location.href = '/login';    // Redirect to login page
    }, 1500);  // Delay to show toast
  };

  const toggleMenu = () => setIsOpen(!isOpen); // Open/close mobile menu

  return (
    <nav className="navbar sticky top-0 px-6 py-4 flex justify-between items-center z-50 shadow-lg backdrop-blur-xl">
      {/* Website Logo */}
      <Link
        to="/"
        className="group text-2xl font-bold tracking-wide flex items-center gap-2 transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="relative h-9 w-9 text-indigo-600 dark:text-indigo-400 transform group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <circle cx="10" cy="8" r="2" />
            <path d="M17 8h.01" />
            <path d="M17 12h.01" />
            <path d="M13 12h.01" />
          </svg>
        </div>
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-black">
          StudyHub
        </span>
      </Link>

      {/* Desktop Links (shown only on medium screens and up) */}
      <div className="space-x-2 hidden md:flex items-center">
        <NavItem to="/" text="Home" />
        <NavItem to="/communities" text="Communities" icon={<Users className="w-4 h-4" />} />
        <NavItem to="/upload" text="Upload" />
        <NavItem to="/notes" text="Explore" />
        {!token ? (
          <>
            <NavItem to="/login" text="Login" />
            <Link 
              to="/signup" 
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              Sign up
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="ml-2 px-5 py-2.5 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
          >
            Logout
          </button>
        )}
        <div className="ml-2">
          <DarkModeToggle />
        </div>
      </div>

      {/* Hamburger Button (Mobile) */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
          aria-label="Toggle menu"
        >
          {/* Toggle between open and close icon */}
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg flex flex-col items-center space-y-4 py-6 md:hidden z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'
        }`}
      >
        <NavItem to="/" text="Home" onClick={toggleMenu} />
        <NavItem to="/communities" text="Communities" onClick={toggleMenu} icon={<Users className="w-4 h-4" />} />
        <NavItem to="/upload" text="Upload" onClick={toggleMenu} />
        <NavItem to="/notes" text="Explore" onClick={toggleMenu} />
        {!token ? (
          <>
            <NavItem to="/login" text="Login" onClick={toggleMenu} />
            <NavItem to="/signup" text="Sign up" onClick={toggleMenu} />
          </>
        ) : (
          <button
            onClick={() => {
              handleLogout();
              toggleMenu(); // Close menu after logout
            }}
            className="hover:text-black hover:underline transition"
          >
            Logout
          </button>
        )}
        <div className="pt-2">
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
};

// ✅ Nav item component for links
const NavItem = ({ to, text, onClick, icon }) => (
  <Link
    to={to}
    onClick={onClick}
    className="group relative px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 flex items-center gap-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
  >
    {icon && <span className="text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">{icon}</span>}
    <span className="relative">
      {text}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
    </span>
  </Link>
);

export default Navbar;

