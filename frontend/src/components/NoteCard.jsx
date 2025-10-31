import { Download, Calendar, User, FileText, Trash2, Sparkles } from "lucide-react";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NoteCard = ({ id, title, subject, uploader, uploaderName, date, likes, fileUrl, format, onDelete }) => {
  const token = localStorage.getItem("token");
  let isOwner = false;

  if (token) {
    const decoded = jwtDecode(token);
    const decodedUserId = decoded.id;
    isOwner = decodedUserId === uploader?._id;
  }

  const handleDownload = async () => {
    try {
      const res = await axios.get(fileUrl, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Note Downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Download failed!");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://studyhub-backend-kxxh.onrender.com/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Note deleted");
      onDelete(id);
    } catch (error) {
      toast.error("Failed to delete note");
      console.error("Delete Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 w-[360px] h-[480px] flex flex-col">
      {/* Gradient Header */}
      <div className="relative h-32 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-800 overflow-hidden">
        {/* Animated Pattern */}
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Floating Sparkles */}
        <div className="absolute top-4 right-4">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
        
        {/* Icon Badge */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 group-hover:rotate-6 transition-transform duration-500">
              <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Format Badge */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full border border-white/50 dark:border-gray-700/50">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">{format}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col pt-12 p-6">
        <div className="flex-1 space-y-4">
          {/* Subject Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full border border-emerald-200 dark:border-emerald-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{subject}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            {title}
          </h3>

          {/* Meta Information */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Uploaded by</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{uploaderName || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex-shrink-0">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-4"></div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="group/btn w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
          <span>Download Note</span>
        </button>
      </div>

      {/* Delete Button (Owner Only) */}
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl z-10"
          title="Delete this note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:via-teal-500/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none rounded-3xl"></div>
      
      {/* Corner Accent */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-500/10 via-teal-500/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default NoteCard;
// This component displays a note card with details like title, subject, uploader, and date
// It includes a download button to fetch the note file and a delete button for the owner
// The delete button sends a request to the server to remove the note and updates the UI accordingly
// It uses JWT decoding to check if the current user is the owner of the note