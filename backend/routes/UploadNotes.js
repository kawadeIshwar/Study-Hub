import multer from 'multer'; // Importing multer for handling file uploads
import cloudinary from '../utils/cloudinary.js'; // Importing cloudinary for image/file storage
import Note from '../models/Note.js';
import { Router } from 'express';
import fs from 'fs'; // Importing Node.js file system module for deleting files
import auth from '../middleware/auth.js'; // Importing authentication middleware to protect routes
import { cacheMiddleware, invalidateCache, CACHE_DURATION } from '../middleware/cache.js';

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});
const router = Router();

router.post('/', auth, invalidateCache('cache:/api/upload/all'), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size cannot exceed 50MB!' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required!" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      use_filename: true,              // ✅ Keep original filename
      unique_filename: false,          // ✅ Don't add random text
    });

    const note = new Note({
      title: req.body.title,
      subject: req.body.subject,
      semester: req.body.semester,
      tags: req.body.tags?.split(',') || [],
      fileUrl: result.secure_url,
      format: req.file.mimetype.split('/')[1], // Extracting file format from MIME type
      uploader: req.user.id, // ✅ save uploader's ID
      uploaderRole: req.user.role || 'student', // ✅ save uploader's role
    });

    await note.save();
    fs.unlink(req.file.path, () => { }); // async delete

    res.status(200).json({ message: 'Note uploaded!', note });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', cacheMiddleware(CACHE_DURATION.long), async (req, res) => {
  try {
    const notes = await Note.find().sort({ date: -1 }).populate('uploader', 'name email role');
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notes by uploader role (teacher/student)
router.get('/by-role/:role', cacheMiddleware(CACHE_DURATION.long), async (req, res) => {
  try {
    const { role } = req.params;
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Use teacher or student.' });
    }
    
    const notes = await Note.find({ uploaderRole: role })
      .sort({ date: -1 })
      .populate('uploader', 'name email role institution specialization');
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
// This code defines an Express.js route for uploading notes
// It uses multer for file handling and Cloudinary for storage
// The route is protected by an authentication middleware
// It saves the note details in a MongoDB database and returns the uploaded note information