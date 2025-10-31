import UploadForm from '../components/UploadForm';
import { Upload as UploadIcon, Award, Users, TrendingUp, CheckCircle, Star, Zap } from 'lucide-react';

const Upload = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-violet-400 to-purple-300 dark:from-violet-900 dark:to-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-400 to-pink-300 dark:from-fuchsia-900 dark:to-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-floatSlow"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-rose-400 to-red-300 dark:from-rose-900 dark:to-red-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 section-container pt-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 dark:from-violet-800 dark:via-purple-800 dark:to-fuchsia-900 rounded-[40px] shadow-2xl overflow-hidden mb-12 animate-slideUp">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 md:py-16">
            <div className="flex-1 text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Star className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-bold">Share Your Knowledge</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                Upload & <span className="text-yellow-300">Inspire</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-2xl">
                Share your study materials and help thousands of students excel in their academic journey
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">10K+</div>
                    <div className="text-sm text-purple-200">Contributors</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">50K+</div>
                    <div className="text-sm text-purple-200">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 hidden md:block relative">
              <img 
                src="/student-4.png" 
                alt="Upload" 
                className="w-full max-w-[400px] mx-auto drop-shadow-2xl floating"
              />
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

        {/* Benefits Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full border border-violet-200 dark:border-violet-800 mb-6">
              <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-bold text-violet-700 dark:text-violet-400">Why Upload</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                Benefits of Contributing
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Build Reputation',
                description: 'Earn recognition and become a top contributor',
                gradient: 'from-violet-500 to-purple-500',
                delay: '0ms'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Help Community',
                description: 'Support fellow students in their learning journey',
                gradient: 'from-fuchsia-500 to-pink-500',
                delay: '100ms'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Track Impact',
                description: 'See how many students benefit from your notes',
                gradient: 'from-rose-500 to-red-500',
                delay: '200ms'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fadeInUp border border-gray-200/50 dark:border-gray-700/50"
                style={{ animationDelay: benefit.delay }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="relative bg-gradient-to-br from-purple-100 via-fuchsia-50 to-pink-100 dark:from-purple-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12 mb-12 border border-purple-200/50 dark:border-purple-800/50">
          <div className="absolute inset-0 bg-dots opacity-10"></div>
          
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-black mb-6">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                📝 Quick Tips for Better Notes
              </span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Use clear and descriptive titles',
                'Add relevant tags for easy discovery',
                'Ensure content is well-organized',
                'Check file format compatibility',
                'Include key topics in description',
                'Update notes regularly'
              ].map((tip, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl hover:scale-105 transition-transform duration-300"
                >
                  <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Form Section */}
        <div className="mb-12">
          <UploadForm />
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-800 dark:via-purple-800 dark:to-fuchsia-900 rounded-[40px] p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold text-white">Start Contributing Today</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Ready to Make an Impact?
            </h2>
            
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Your notes can help thousands of students. Upload now and become part of our growing community!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/notes"
                className="px-10 py-4 bg-white text-violet-600 rounded-2xl font-black text-lg shadow-xl hover:scale-110 transition-all duration-300"
              >
                Browse Notes
              </a>
              <a
                href="/communities"
                className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-black text-lg hover:bg-white/20 transition-all duration-300"
              >
                Join Communities
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
