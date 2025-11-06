import express from 'express';
import User from '../models/User.js';
import Note from '../models/Note.js';
import CommunityMember from '../models/CommunityMember.js';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [notesCount, communitiesCount, messagesCount] = await Promise.all([
      Note.countDocuments({ uploader: req.user.id }),
      CommunityMember.countDocuments({ user: req.user.id, status: 'active' }),
      Message.countDocuments({ sender: req.user.id })
    ]);

    const totalContributions = notesCount + messagesCount;

    res.json({
      notesUploaded: notesCount,
      communitiesJoined: communitiesCount,
      messagesSent: messagesCount,
      totalContributions
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Common fields for all users
    const { name, phone, bio, currentPassword, newPassword } = req.body;
    
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Student-specific fields
    if (user.role === 'student') {
      const { college, course, department, year, semester, rollNumber } = req.body;
      
      if (college !== undefined) user.college = college.trim();
      if (course !== undefined) user.course = course.trim();
      if (department !== undefined) user.department = department.trim();
      if (year !== undefined) user.year = year;
      if (semester !== undefined) user.semester = semester.trim();
      if (rollNumber !== undefined) user.rollNumber = rollNumber.trim();
    }

    // Teacher-specific fields
    if (user.role === 'teacher') {
      const { qualification, specialization, institution, experience, subjects } = req.body;
      
      if (qualification !== undefined) user.qualification = qualification.trim();
      if (specialization !== undefined) user.specialization = specialization.trim();
      if (institution !== undefined) user.institution = institution.trim();
      if (experience !== undefined) user.experience = experience;
      if (subjects !== undefined) user.subjects = subjects;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Current password is required to change password' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user by ID (public info)
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email createdAt');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const [notesCount, communitiesCount] = await Promise.all([
      Note.countDocuments({ uploader: req.params.userId }),
      CommunityMember.countDocuments({ user: req.params.userId, status: 'active' })
    ]);

    res.json({
      user,
      stats: {
        notesUploaded: notesCount,
        communitiesJoined: communitiesCount
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's uploaded notes
router.get('/:userId/notes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ uploader: req.params.userId })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments({ uploader: req.params.userId });

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's communities
router.get('/:userId/communities', auth, async (req, res) => {
  try {
    const memberships = await CommunityMember.find({ 
      user: req.params.userId, 
      status: 'active' 
    })
      .populate({
        path: 'community',
        populate: { path: 'createdBy', select: 'name' }
      })
      .sort({ joinedAt: -1 });

    const communities = memberships.map(m => ({
      ...m.community.toObject(),
      role: m.role,
      joinedAt: m.joinedAt
    }));

    res.json({ communities });
  } catch (error) {
    console.error('Error fetching user communities:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
