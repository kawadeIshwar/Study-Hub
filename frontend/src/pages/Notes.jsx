import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import { toast } from 'react-toastify';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // ✅ Fetch all notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/upload/all');
        setNotes(res.data); // Save notes in state
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        toast.error("Couldn't load notes");
      }
    };

    fetchNotes();
  }, []);

  // ✅ Remove note from UI after delete
  const handleDeleteNote = (deletedId) => {
    setNotes(notes.filter((note) => note._id !== deletedId));
  };

  // ✅ Get unique subjects for dropdown filter
  const subjects = [...new Set(notes.map((note) => note.subject))];

  // ✅ Filter notes based on subject + search
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
    <div className="p-6 rounded-[30px] animate-slideUp min-h-screen z-0">
      {/* ✅ Centered Search + Dropdown on Same Line */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchBar onSearch={(query) => setSearchQuery(query)} />

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg bg-gray-950 text-gray-100 hover:bg-gray-800 transition-all duration-300 p-2 w-full sm:w-auto h-12 border border-gray-600 focus:outline-1"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub, i) => (
              <option key={i} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*  Notes Grid */}
      <div className="flex flex-wrap gap-9 justify-center ">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              id={note._id}
              title={note.title}
              subject={note.subject}
              uploader={note.uploader} // should be user ID
              uploaderName={note.uploader?.name}
              date={new Date(note.date).toLocaleDateString()}
              likes={note.likes}
              fileUrl={note.fileUrl}
              format={note.format}
              onDelete={handleDeleteNote} //  Call this after deleting
            />
          ))
        ) : (
          <p className="text-gray-500 text-lg mt-10">No notes found.</p>
        )}
      </div>
    </div>
  );
};

export default Notes;






