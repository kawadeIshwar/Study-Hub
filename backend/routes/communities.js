import express from 'express';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';
import Message from '../models/Message.js';
import Poll from '../models/Poll.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import { cacheMiddleware, invalidateCache, CACHE_DURATION } from '../middleware/cache.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all communities with search and filter (accessible to all users)
router.get('/', optionalAuth, cacheMiddleware(CACHE_DURATION.medium), async (req, res) => {
  try {
    const { search, tags, page = 1, limit = 12, creatorRole } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // If filtering by creator role, first get users with that role
    if (creatorRole && ['teacher', 'student'].includes(creatorRole)) {
      const creators = await User.find({ role: creatorRole }).select('_id');
      const creatorIds = creators.map(c => c._id);
      query.createdBy = { $in: creatorIds };
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name role institution specialization')
      .sort({ 'stats.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(query);

    // Get user's joined communities if user is logged in
    let joinedCommunityIds = [];
    if (req.user && req.user.id) {
      const userCommunities = await CommunityMember.find({ 
        user: req.user.id, 
        status: 'active' 
      }).select('community');
      
      joinedCommunityIds = userCommunities.map(cm => cm.community.toString());
    }

    const communitiesWithMembership = communities.map(community => ({
      ...community.toObject(),
      isJoined: joinedCommunityIds.includes(community._id.toString())
    }));

    res.json({
      communities: communitiesWithMembership,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single community details (accessible to all users)
router.get('/:id', optionalAuth, cacheMiddleware(CACHE_DURATION.medium), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'name role');

    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // Ensure teacher communities always require approval
    if (community.createdBy.role === 'teacher' && !community.settings.requireApproval) {
      community.settings.requireApproval = true;
      await community.save();
    }

    // Check if user is a member (only if logged in)
    let membership = null;
    let isPending = false;
    if (req.user && req.user.id) {
      membership = await CommunityMember.findOne({
        community: req.params.id,
        user: req.user.id
      });
      
      // Check if membership is pending
      isPending = membership?.status === 'pending';
    }

    res.json({
      ...community.toObject(),
      isMember: membership?.status === 'active',
      isPending: isPending,
      userRole: membership?.role || null,
      requiresApproval: community.settings.requireApproval
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Create new community
router.post('/', auth, invalidateCache('cache:/api/communities'), upload.single('coverImage'), async (req, res) => {
  try {
    const { name, description, tags, isPrivate } = req.body;
    
    // Validate input
    if (!name || !description) {
      return res.status(400).json({ msg: 'Name and description are required' });
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name: name.trim() });
    if (existingCommunity) {
      return res.status(400).json({ msg: 'Community with this name already exists' });
    }

    let coverImageUrl = '';
    
    // Upload cover image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        coverImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({ msg: 'Error uploading cover image' });
      }
    }

    // Handle tags as array or string
    let tagArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagArray = tags.map(tag => tag.trim().toLowerCase());
      } else if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      }
    }

    // Get user's role to determine if approval is required
    const creator = await User.findById(req.user.id);
    const requiresApproval = creator && creator.role === 'teacher';

    const community = new Community({
      name: name.trim(),
      description: description.trim(),
      tags: tagArray,
      coverImage: coverImageUrl,
      createdBy: req.user.id,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      settings: {
        allowFileSharing: true,
        allowPolls: true,
        requireApproval: requiresApproval, // Auto-enable for teachers
        profanityFilter: true
      }
    });

    await community.save();

    // Auto-add creator as admin
    const membership = new CommunityMember({
      community: community._id,
      user: req.user.id,
      role: 'admin',
      status: 'active'
    });

    await membership.save();

    // Update community stats
    await Community.findByIdAndUpdate(community._id, {
      $inc: { 'stats.totalMembers': 1 }
    });

    res.status(201).json({
      msg: 'Community created successfully',
      community: await community.populate('createdBy', 'name')
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join community
router.post('/:id/join', auth, invalidateCache('cache:/api/communities'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('createdBy', 'role');
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // Check if community creator is a teacher - if so, enforce approval requirement
    const requiresApproval = community.createdBy.role === 'teacher' || community.settings.requireApproval;
    
    // Update community settings if needed to ensure teacher communities always require approval
    if (community.createdBy.role === 'teacher' && !community.settings.requireApproval) {
      community.settings.requireApproval = true;
      await community.save();
      console.log(`✅ Auto-fixed requireApproval for community: ${community.name}`);
    }
    
    console.log(`Join attempt - Community: ${community.name}, Creator Role: ${community.createdBy.role}, Requires Approval: ${requiresApproval}`);

    // Check if already a member
    const existingMembership = await CommunityMember.findOne({
      community: req.params.id,
      user: req.user.id
    });

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return res.status(400).json({ msg: 'Already a member of this community' });
      }
      if (existingMembership.status === 'pending') {
        return res.status(400).json({ msg: 'Your request is pending approval', requiresApproval: true });
      }
      // Reactivate if previously left
      existingMembership.status = requiresApproval ? 'pending' : 'active';
      await existingMembership.save();
    } else {
      // Create new membership
      const membership = new CommunityMember({
        community: req.params.id,
        user: req.user.id,
        role: 'member',
        status: requiresApproval ? 'pending' : 'active'
      });
      await membership.save();
    }

    // Update community stats only if immediately active
    if (!requiresApproval) {
      await Community.findByIdAndUpdate(req.params.id, {
        $inc: { 'stats.totalMembers': 1 }
      });
    }

    const message = requiresApproval 
      ? 'Join request sent. Waiting for teacher approval.' 
      : 'Successfully joined community';
    
    res.json({ msg: message, requiresApproval });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Leave community
router.post('/:id/leave', auth, invalidateCache('cache:/api/communities'), async (req, res) => {
  try {
    const membership = await CommunityMember.findOne({
      community: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(400).json({ msg: 'Not a member of this community' });
    }

    // Don't allow admin to leave if they're the only admin
    if (membership.role === 'admin') {
      const adminCount = await CommunityMember.countDocuments({
        community: req.params.id,
        role: 'admin',
        status: 'active'
      });
      if (adminCount === 1) {
        return res.status(400).json({ msg: 'Cannot leave as you are the only admin' });
      }
    }

    membership.status = 'inactive';
    await membership.save();

    // Update community stats
    await Community.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.totalMembers': -1 }
    });

    res.json({ msg: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get community members
router.get('/:id/members', auth, cacheMiddleware(CACHE_DURATION.short), async (req, res) => {
  try {
    const { role, status = 'active', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { community: req.params.id, status };
    if (role) {
      query.role = role;
    }

    const members = await CommunityMember.find(query)
      .populate('user', 'name email')
      .sort({ role: 1, joinedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityMember.countDocuments(query);

    res.json({
      members: members.map(m => ({
        _id: m._id,
        user: m.user,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        lastSeen: m.lastSeen,
        isOnline: m.isOnline
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get community stats
router.get('/:id/stats', auth, cacheMiddleware(CACHE_DURATION.short), async (req, res) => {
  try {
    const [totalMembers, onlineMembers, totalMessages, recentMessages] = await Promise.all([
      CommunityMember.countDocuments({ community: req.params.id, status: 'active' }),
      CommunityMember.countDocuments({ community: req.params.id, status: 'active', isOnline: true }),
      Message.countDocuments({ community: req.params.id }),
      Message.countDocuments({ 
        community: req.params.id, 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      totalMembers,
      onlineMembers,
      totalMessages,
      messagesToday: recentMessages
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update member role (admin only)
router.put('/:communityId/members/:userId/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    // Check if requester is admin
    const requesterMembership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      role: 'admin',
      status: 'active'
    });

    if (!requesterMembership) {
      return res.status(403).json({ msg: 'Only admins can change member roles' });
    }

    // Update member role
    const membership = await CommunityMember.findOneAndUpdate(
      { community: req.params.communityId, user: req.params.userId },
      { role },
      { new: true }
    ).populate('user', 'name email');

    if (!membership) {
      return res.status(404).json({ msg: 'Member not found' });
    }

    res.json({
      msg: 'Role updated successfully',
      member: membership
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete community (creator only)
router.delete('/:id', auth, invalidateCache('cache:/api/communities'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // Check if the user is the creator of the community
    if (community.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the community creator can delete this community' });
    }

    // Delete all related data
    await Promise.all([
      // Delete all community members
      CommunityMember.deleteMany({ community: req.params.id }),
      // Delete all messages in this community
      Message.deleteMany({ community: req.params.id }),
      // Delete all polls in this community
      Poll.deleteMany({ community: req.params.id })
    ]);

    // Delete the community
    await Community.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;