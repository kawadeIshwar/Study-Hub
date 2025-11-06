import express from 'express';        // To create routes (register, login)
import bcrypt from 'bcryptjs';        // For hashing (encrypting) passwords
import jwt from 'jsonwebtoken';       // To create login tokens (JWT)
import User from '../models/User.js'; // Import User model (MongoDB schema)

const router = express.Router();      // Create a router object

// ✅ SIGNUP API (Student)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body; // Get data from request body

    const exists = await User.findOne({ email }); // Check if user already exists
    if (exists) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10); // Hash the password

    const user = new User({ name, email, password: hashed, role: 'student' }); // Create user
    await user.save(); // Save user to DB

    res.status(201).json({ msg: 'Registered successfully' }); // Send success response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

// ✅ TEACHER SIGNUP API
router.post('/signup/teacher', async (req, res) => {
  try {
    const { name, email, password, qualification, specialization, experience, institution, subjects } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ 
      name, 
      email, 
      password: hashed, 
      role: 'teacher',
      qualification,
      specialization,
      experience,
      institution,
      subjects
    });
    await user.save();

    res.status(201).json({ msg: 'Teacher registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Get data from request body

    const user = await User.findOne({ email }); // Find user by email
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const match = await bcrypt.compare(password, user.password); // Check password
    if (!match) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Create token that expires in 1 day

    res.json({ 
      token, // Return token
      user: { id: user._id, name: user.name, email: user.email, role: user.role } // Return user info
    });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

export default router; // Export the router so it can be used in server.js

// This code defines authentication routes for user signup and login.
// The signup route creates a new user after checking if they already exist and hashing their password.
// The login route checks if the user exists, verifies the password, and generates a JWT token for authenticated access.
// If any errors occur, appropriate error messages are returned.  
