const Footer = () => {
  return (
    <footer className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl mt-16 border-t border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left Section - Brand */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="relative h-10 w-10 text-indigo-600 dark:text-indigo-400 transform group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  <circle cx="10" cy="8" r="2" />
                  <path d="M17 8h.01" />
                  <path d="M17 12h.01" />
                  <path d="M13 12h.01" />
                </svg>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                StudyHub
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center md:text-left">
              Empowering students worldwide through collaborative learning and knowledge sharing. Join thousands of learners today.
            </p>
          </div>
          
          {/* Right Section - Info */}
          <div className="flex flex-col items-center md:items-end space-y-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200 dark:border-indigo-800">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                &copy; {new Date().getFullYear()} StudyHub. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Built with</span>
              <span className="text-red-500 animate-heartbeat text-lg">♥</span>
              <span>by</span>
              <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent hover:scale-110 transition-transform duration-300 cursor-default">
                Ishwar
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-300">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-300">Terms of Service</span>
            </div>
          </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Made with React, TailwindCSS, and lots of ☕
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
