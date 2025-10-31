import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Filter, TrendingUp, BookOpen, Users, Download, Sparkles, Award } from 'lucide-react';
import cacheService from '../services/cacheService';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // Try to load from cache first for instant display
        const cachedNotes = cacheService.get('notes_all');
        if (cachedNotes) {
          console.log('📦 Loading notes from cache...');
          setNotes(cachedNotes);
          // Removed toast - silent cache load for better UX
        }

        // Fetch fresh data in background
        setIsLoadingFresh(true);
        const res = await axios.get('https://studyhub-backend-kxxh.onrender.com/api/upload/all');
        
        // Update cache and state with fresh data
        cacheService.set('notes_all', res.data);
        setNotes(res.data);
        setIsLoadingFresh(false);
        
        // Only show success toast if it's the first load (no cached data)
        if (!cachedNotes) {
          console.log('✅ Notes loaded successfully');
        }
      } catch (error) {
        setIsLoadingFresh(false);
        // Only show error if we have no data to display
        if (!cachedNotes && notes.length === 0) {
          toast.error("Couldn't load notes. Please check your connection.");
        } else {
          // Silent fallback to cache - better UX
          console.warn('Using cached data, fresh fetch failed:', error.message);
        }
      }
    };

    fetchNotes();
  }, []);

  const handleDeleteNote = (deletedId) => {
    setNotes(notes.filter((note) => note._id !== deletedId));
  };

  const subjects = [...new Set(notes.map((note) => note.subject))];

  const filteredNotes = notes
    .filter((note) =>
      selectedSubject ? note.subject === selectedSubject : true
    )
    .filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.join(',').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-orange-400 to-amber-300 dark:from-orange-900 dark:to-amber-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-red-400 to-rose-300 dark:from-red-900 dark:to-rose-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-300 dark:from-yellow-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 section-container pt-8">
        <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 dark:from-orange-800 dark:via-red-800 dark:to-rose-900 rounded-[40px] shadow-2xl overflow-hidden mb-12 animate-slideUp">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 md:py-16">
            <div className="flex-1 text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <TrendingUp className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-bold">{notes.length}+ Study Materials Available</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                Explore & <span className="text-yellow-300">Discover</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-orange-100 leading-relaxed max-w-2xl">
                Access thousands of quality notes from top students across all subjects
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{notes.length}+</div>
                    <div className="text-sm text-orange-200">Notes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{subjects.length}+</div>
                    <div className="text-sm text-orange-200">Subjects</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 hidden md:block relative">
              <img 
                src="/student-5.png" 
                alt="Explore" 
                className="w-full max-w-[400px] mx-auto drop-shadow-2xl floating"
              />
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-rose-400/30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50 dark:fill-gray-900/50"></path>
            </svg>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fadeIn delay-200">
          {[
            {
              icon: <Award className="w-8 h-8" />,
              title: 'Top Quality',
              description: 'Verified study materials',
              gradient: 'from-orange-500 to-red-500',
              count: notes.length
            },
            {
              icon: <Download className="w-8 h-8" />,
              title: 'Instant Access',
              description: 'Download anytime',
              gradient: 'from-red-500 to-rose-500',
              count: '24/7'
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: 'Fresh Content',
              description: 'Updated regularly',
              gradient: 'from-rose-500 to-pink-500',
              count: 'Daily'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fadeInUp border border-gray-200/50 dark:border-gray-700/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                {stat.count}
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                {stat.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8 mb-10 border border-gray-200/50 dark:border-gray-700/50 animate-fadeIn delay-300">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 w-5 h-5 transition-colors duration-300" />
              <div className="pl-12">
                <SearchBar onSearch={(query) => setSearchQuery(query)} />
              </div>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full md:w-auto pl-12 pr-8 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all duration-300 cursor-pointer appearance-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Subjects */}
          {subjects.length > 0 && !selectedSubject && (
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">Popular Subjects:</p>
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 8).map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSubject(subject)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-xl font-bold text-sm hover:from-orange-200 hover:to-red-200 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 transition-all duration-300 hover:scale-105"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSubject && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedSubject('')}
                className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                Clear filter: {selectedSubject}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredNotes.length > 0 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Showing <span className="text-2xl font-black text-orange-600 dark:text-orange-400 mx-1">{filteredNotes.length}</span> 
                {filteredNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="flex flex-wrap gap-8 justify-center pb-12">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <div 
                key={note._id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NoteCard
                  id={note._id}
                  title={note.title}
                  subject={note.subject}
                  uploader={note.uploader}
                  uploaderName={note.uploader?.name}
                  date={new Date(note.date).toLocaleDateString()}
                  likes={note.likes}
                  fileUrl={note.fileUrl}
                  format={note.format}
                  onDelete={handleDeleteNote}
                />
              </div>
            ))
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 border-4 border-orange-600 dark:border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">Loading amazing notes for you...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative text-8xl">🔍</div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">No notes found</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                  Try adjusting your search or filter criteria, or explore all notes
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('');
                  }}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
                >
                  View All Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
// ✅ Notes page to display all notes with search and filter functionality
// ✅ Uses SearchBar component for searching notes by title, subject, or tags
// ✅ Uses NoteCard component to display each note
// ✅ Fetches notes from backend API and handles delete functionality
// ✅ Filters notes based on selected subject and search query
// ✅ Displays unique subjects in a dropdown for filtering





