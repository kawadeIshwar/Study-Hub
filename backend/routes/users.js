import express from 'express';
import User from '../models/User.js';
import Note from '../models/Note.js';
import CommunityMember from '../models/CommunityMember.js';
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

    // Get user statistics
    const [notesCount, communitiesCount] = await Promise.all([
      Note.countDocuments({ uploader: req.user.id }),
      CommunityMember.countDocuments({ user: req.user.id, status: 'active' })
    ]);

    res.json({
      user,
      stats: {
        notesUploaded: notesCount,
        communitiesJoined: communitiesCount
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update name and email if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already in use
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      user.email = email;
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
    res.json({ msg: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email } });
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
