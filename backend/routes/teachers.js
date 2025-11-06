import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';

const router = express.Router();

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ msg: 'Access denied. Teachers only.' });
  }
  next();
};

// Get teacher dashboard stats
router.get('/dashboard/stats', auth, isTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get total notes uploaded
    const totalNotes = await Note.countDocuments({ uploader: teacherId });
    
    // Get communities created by teacher
    const communities = await Community.find({ createdBy: teacherId });
    const totalCommunities = communities.length;
    
    // Get total students in all teacher's communities
    let totalStudents = 0;
    for (const community of communities) {
      const memberCount = await CommunityMember.countDocuments({ 
        community: community._id,
        role: 'member',
        status: 'active'
      });
      totalStudents += memberCount;
    }
    
    // Get pending join requests across all communities
    let pendingRequests = 0;
    for (const community of communities) {
      const requests = await CommunityMember.countDocuments({
        community: community._id,
        status: 'pending'
      });
      pendingRequests += requests;
    }
    
    res.json({
      totalNotes,
      totalCommunities,
      totalStudents,
      pendingRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher's notes
router.get('/notes', auth, isTeacher, async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user.id })
      .sort({ date: -1 })
      .populate('uploader', 'name email institution');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher's communities
router.get('/communities', auth, isTeacher, async (req, res) => {
  try {
    const communities = await Community.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    
    // Add member count to each community
    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        const memberCount = await CommunityMember.countDocuments({
          community: community._id,
          status: { $in: ['active', 'pending'] }
        });
        return {
          ...community.toObject(),
          memberCount
        };
      })
    );
    
    res.json(communitiesWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending join requests for a specific community
router.get('/communities/:communityId/pending-requests', auth, isTeacher, async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Verify teacher owns this community
    const community = await Community.findOne({
      _id: communityId,
      createdBy: req.user.id
    });
    
    if (!community) {
      return res.status(404).json({ msg: 'Community not found or you do not have access' });
    }
    
    // Get pending requests
    const requests = await CommunityMember.find({
      community: communityId,
      status: 'pending'
    })
    .populate('user', 'name email college course department year')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject join request
router.put('/communities/:communityId/requests/:requestId', auth, isTeacher, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    // Verify teacher owns this community
    const community = await Community.findOne({
      _id: communityId,
      createdBy: req.user.id
    });
    
    if (!community) {
      return res.status(404).json({ msg: 'Community not found or you do not have access' });
    }
    
    const request = await CommunityMember.findById(requestId);
    
    if (!request || request.community.toString() !== communityId) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    if (action === 'approve') {
      request.status = 'active';
      await request.save();
      
      // Update community stats
      community.stats.totalMembers += 1;
      await community.save();
      
      res.json({ msg: 'Request approved', request });
    } else if (action === 'reject') {
      await CommunityMember.findByIdAndDelete(requestId);
      res.json({ msg: 'Request rejected' });
    } else {
      res.status(400).json({ msg: 'Invalid action. Use approve or reject.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students in a teacher's community
router.get('/communities/:communityId/students', auth, isTeacher, async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Verify teacher owns this community
    const community = await Community.findOne({
      _id: communityId,
      createdBy: req.user.id
    });
    
    if (!community) {
      return res.status(404).json({ msg: 'Community not found or you do not have access' });
    }
    
    const students = await CommunityMember.find({
      community: communityId,
      status: 'active',
      role: 'member'
    })
    .populate('user', 'name email college course department year')
    .sort({ joinedAt: -1 });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher profile
router.get('/profile', auth, isTeacher, async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id).select('-password');
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update teacher profile
router.put('/profile', auth, isTeacher, async (req, res) => {
  try {
    const { name, qualification, specialization, experience, institution, subjects, bio, phone } = req.body;
    
    const teacher = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        qualification,
        specialization,
        experience,
        institution,
        subjects,
        bio,
        phone
      },
      { new: true }
    ).select('-password');
    
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
