import { useState } from 'react';       // To manage form state
import { toast, ToastContainer } from 'react-toastify';  // Toast notifications
import 'react-toastify/dist/ReactToastify.css';
import { notesAPI } from '../utils/api';

const UploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: '',
    tags: '',
    file: null,
  });

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,  // If file input, take file
    });
  };

  // ✅ Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');  // Get token from storage
    if (!token) {
      toast.info("Please login first to upload notes.");
      setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`; // Redirect to login
      }, 1500);
      return;
    }

    const data = new FormData();  // Create FormData for file upload
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('semester', formData.semester);
    data.append('tags', formData.tags);
    data.append('file', formData.file);

    try {
      await toast.promise(
        notesAPI.upload(data),
        {
          pending: 'Uploading note...',  // Show toast while uploading
          success: 'Note uploaded successfully!',
          error: 'Upload failed!',
        }
      );

      // ✅ Reset form after upload
      setFormData({
        title: '',
        subject: '',
        semester: '',
        tags: '',
        file: null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-floatSlow"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="flex flex-col custom-lg:flex-row">
          {/* Form Section */}
          <div className="flex-1 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                Upload Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
              {/* Title Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📝 Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter note title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Subject Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📚 Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g., Mathematics, Physics"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Semester Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  🎓 Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  placeholder="e.g., 1st, 2nd, 3rd"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Tags Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  🏷️ Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g., algebra, calculus, geometry"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* File Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📎 File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer transition-all duration-300"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Supported formats: PDF, DOCX, TXT</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
              >
                Upload Notes 🚀
              </button>
            </form>
          </div>

          {/* Image Section */}
          <div className="hidden custom-lg:flex flex-1 relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12 items-center justify-center">
            <div className="absolute inset-0 bg-dots opacity-20"></div>
            <img
              src="student-12.png"
              alt="student"
              className="relative z-10 w-full max-w-md h-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
