import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student', required: true },
  
  // Student-specific fields
  college: { type: String, trim: true },
  course: { type: String, trim: true },
  department: { type: String, trim: true },
  year: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'], default: '1st Year' },
  semester: { type: String, trim: true },
  rollNumber: { type: String, trim: true },
  phone: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 500 },
  
  // Teacher-specific fields
  qualification: { type: String, trim: true },
  specialization: { type: String, trim: true },
  experience: { type: Number }, // years of experience
  institution: { type: String, trim: true },
  subjects: [{ type: String, trim: true }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
// This code defines a User model for MongoDB using Mongoose.
