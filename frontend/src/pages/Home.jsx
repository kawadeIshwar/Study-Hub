import { useEffect, useState } from 'react';
import { notesAPI } from '../utils/api';
import NoteCard from "../components/NoteCard";
import { Sparkles, BookOpen, Upload, Search, Users, TrendingUp, Star, Award, FileText, Clock, Shield, Zap } from 'lucide-react';

const Home = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await notesAPI.getAll();
        setNotes(res.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load notes", err);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-300 dark:from-blue-900 dark:to-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-violet-400 to-purple-300 dark:from-violet-900 dark:to-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-300 dark:from-pink-900 dark:to-rose-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-amber-400 to-orange-300 dark:from-amber-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-floatSlow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section - Redesigned */}
      <section className="relative z-10 section-container pt-12 md:pt-20">
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 rounded-[40px] shadow-2xl overflow-hidden animate-slideUp">
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative flex flex-col lg:flex-row items-center gap-12 px-8 md:px-16 py-16 md:py-20">
            {/* Left Content */}
            <div className="flex-1 text-white space-y-8 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-bold">Trusted by 10,000+ Students</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
                Your Gateway to <span className="text-yellow-300">Academic Success</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                Access thousands of quality study notes, collaborate with peers, and excel in your academic journey
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => (window.location.href = "/upload")}
                  className="group px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Upload className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Upload Notes</span>
                </button>
                
                <button
                  onClick={() => (window.location.href = "/communities")}
                  className="group px-10 py-4 bg-yellow-400 text-indigo-900 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Explore Communities</span>
                </button>
                
                <button
                  onClick={() => (window.location.href = "/notes")}
                  className="group px-10 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-bold text-base hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Search className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  <span>Explore Notes</span>
                </button>
              </div>
              
              {/* Live Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div>
                  <div className="text-4xl font-black text-yellow-300">10K+</div>
                  <div className="text-blue-200 text-sm font-semibold">Notes Available</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-yellow-300">5K+</div>
                  <div className="text-blue-200 text-sm font-semibold">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-yellow-300">50+</div>
                  <div className="text-blue-200 text-sm font-semibold">Subjects</div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="flex-1 relative animate-fadeInUp delay-200">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
              <img 
                src="/student-1.png" 
                alt="Happy Student" 
                className="relative w-full max-w-[500px] mx-auto drop-shadow-2xl floating"
              />
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-pink-400/30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50 dark:fill-gray-900/50"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 section-container animate-fadeIn delay-300">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full border border-cyan-200 dark:border-cyan-800 mb-6">
            <Star className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">Why Choose StudyHub</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Everything You Need to Excel
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to enhance your learning experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FileText className="w-12 h-12" />,
              title: 'Quality Content',
              description: 'Access verified study materials from top students',
              gradient: 'from-blue-500 to-cyan-500',
              delay: '0ms'
            },
            {
              icon: <Users className="w-12 h-12" />,
              title: 'Collaborative Learning',
              description: 'Connect and learn with a global student community',
              gradient: 'from-purple-500 to-pink-500',
              delay: '100ms'
            },
            {
              icon: <Zap className="w-12 h-12" />,
              title: 'Instant Access',
              description: 'Download notes instantly with one click',
              gradient: 'from-amber-500 to-orange-500',
              delay: '200ms'
            },
            {
              icon: <Shield className="w-12 h-12" />,
              title: 'Secure Platform',
              description: 'Your data and content are always protected',
              gradient: 'from-green-500 to-emerald-500',
              delay: '300ms'
            },
            {
              icon: <TrendingUp className="w-12 h-12" />,
              title: 'Track Progress',
              description: 'Monitor your learning journey and achievements',
              gradient: 'from-rose-500 to-red-500',
              delay: '400ms'
            },
            {
              icon: <Award className="w-12 h-12" />,
              title: 'Earn Recognition',
              description: 'Get acknowledged for your contributions',
              gradient: 'from-violet-500 to-purple-500',
              delay: '500ms'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 section-container">
        <div className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-[40px] p-12 md:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-10"></div>
          
          <div className="relative text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-purple-200 dark:border-purple-800 mb-6">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-bold text-purple-700 dark:text-purple-400">Quick & Easy</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                Get Started in 3 Simple Steps
              </span>
            </h2>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Sign Up',
                description: 'Create your free account in seconds',
                image: '/student-9.png',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Explore & Upload',
                description: 'Browse notes or share your own knowledge',
                image: '/student-10.png',
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Learn & Grow',
                description: 'Access quality materials and excel in studies',
                image: '/student-12.png',
                color: 'from-amber-500 to-orange-500'
              }
            ].map((step, index) => (
              <div key={index} className="relative group animate-fadeInUp" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`text-7xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4 opacity-20`}>
                    {step.step}
                  </div>
                  
                  <div className="mb-6">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-32 h-32 mx-auto object-contain floating"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Notes Section */}
      <section className="relative z-10 section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full border border-emerald-200 dark:border-emerald-800 mb-6">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Featured Content</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Popular Notes To Discover
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore trending study materials from top contributors worldwide
          </p>
        </div>

        <div className="flex flex-wrap gap-8 justify-center max-w-7xl mx-auto">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div 
                key={note._id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <NoteCard
                  id={note._id}
                  title={note.title}
                  subject={note.subject}
                  uploaderName={note.uploader?.name}
                  date={new Date(note.date).toLocaleDateString()}
                  likes={note.likes}
                  fileUrl={note.fileUrl}
                  format={note.format}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-6 py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">Loading amazing content...</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-12">
          <button
            onClick={() => (window.location.href = "/notes")}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            View All Notes →
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 section-container">
        <div className="relative bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 dark:from-orange-700 dark:via-rose-700 dark:to-pink-800 rounded-[40px] p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative space-y-8 animate-fadeInUp">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Ready to Transform Your <br className="hidden md:block" />
              <span className="text-yellow-300">Learning Journey?</span>
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of students already excelling with StudyHub. Start your success story today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => (window.location.href = "/signup")}
                className="px-10 py-5 bg-white text-rose-600 rounded-2xl font-black text-xl shadow-2xl hover:scale-110 transition-all duration-300"
              >
                Get Started Free
              </button>
              
              <button
                onClick={() => (window.location.href = "/notes")}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-black text-xl hover:bg-white/20 transition-all duration-300"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
