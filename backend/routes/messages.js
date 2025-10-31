import express from 'express';
import Message from '../models/Message.js';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';
import auth from '../middleware/auth.js';
import { Filter } from 'bad-words';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import { moderateMessage } from '../utils/profanityFilter.js';

const router = express.Router();
const filter = new Filter();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get messages for a community
router.get('/:communityId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to view messages' });
    }

    let query = { community: req.params.communityId };
    if (type !== 'all') {
      query.type = type;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('replies')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a message
router.post('/:communityId', auth, upload.single('file'), async (req, res) => {
  try {
    const { content, type = 'text', parentMessage } = req.body;

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to send messages' });
    }

    let messageContent = content;
    let originalContent = content;
    let isProfanityFiltered = false;
    let moderationResult = null;
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Upload file to Cloudinary if provided
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        fileUrl = result.secure_url;
        fileName = req.file.originalname;
        fileSize = req.file.size;
      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return res.status(500).json({ msg: 'Error uploading file' });
      }
    }

    // Apply profanity filter if community has it enabled
    const community = await Community.findById(req.params.communityId);
    if (community.settings.profanityFilter) {
      moderationResult = moderateMessage(content, membership.role);
      messageContent = moderationResult.text;
      isProfanityFiltered = moderationResult.moderated || moderationResult.flagged;
      
      if (moderationResult.moderated && membership.role === 'member') {
        return res.status(400).json({ 
          msg: 'Message contains inappropriate content and has been filtered',
          filteredContent: messageContent
        });
      }
    }

    // Detect meeting links
    let meetingLink = '';
    const meetRegex = /https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/g;
    const zoomRegex = /https?:\/\/zoom\.us\/[a-zA-Z0-9/?=.-]+/g;
    
    const meetMatch = content.match(meetRegex);
    const zoomMatch = content.match(zoomRegex);
    
    if (meetMatch) {
      meetingLink = meetMatch[0];
    } else if (zoomMatch) {
      meetingLink = zoomMatch[0];
    }

    const message = new Message({
      community: req.params.communityId,
      sender: req.user.id,
      content: messageContent,
      originalContent,
      isProfanityFiltered,
      type: req.file ? 'file' : type,
      fileUrl,
      fileName,
      fileSize,
      parentMessage: parentMessage || null,
      meetingLink
    });

    await message.save();

    // Update community stats
    await Community.findByIdAndUpdate(req.params.communityId, {
      $inc: { 'stats.totalMessages': 1 },
      'stats.lastActivity': new Date()
    });

    // If this is a reply, update parent message
    if (parentMessage) {
      await Message.findByIdAndUpdate(parentMessage, {
        $push: { replies: message._id }
      });
    }

    // Populate the message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name')
      .populate('replies');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Pin/unpin message (admin/moderator only)
router.put('/:messageId/pin', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if user is admin or moderator
    const membership = await CommunityMember.findOne({
      community: message.community,
      user: req.user.id,
      role: { $in: ['admin', 'moderator'] },
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'Only admins and moderators can pin messages' });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    res.json({ 
      msg: message.isPinned ? 'Message pinned' : 'Message unpinned',
      message 
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete message (admin/moderator or message sender)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check permissions
    const membership = await CommunityMember.findOne({
      community: message.community,
      user: req.user.id,
      status: 'active'
    });

    const canDelete = membership && (
      membership.role === 'admin' || 
      membership.role === 'moderator' || 
      message.sender.toString() === req.user.id
    );

    if (!canDelete) {
      return res.status(403).json({ msg: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    // Update community stats
    await Community.findByIdAndUpdate(message.community, {
      $inc: { 'stats.totalMessages': -1 }
    });

    res.json({ msg: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add reaction to message
router.post('/:messageId/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: message.community,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to react to messages' });
    }

    // Find existing reaction
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      // Toggle reaction
      const userIndex = existingReaction.users.indexOf(req.user.id);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user.id);
      }
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        users: [req.user.id]
      });
    }

    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get pinned messages
router.get('/:communityId/pinned', auth, async (req, res) => {
  try {
    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to view pinned messages' });
    }

    const pinnedMessages = await Message.find({
      community: req.params.communityId,
      isPinned: true
    })
    .populate('sender', 'name')
    .sort({ createdAt: -1 });

    res.json(pinnedMessages);
  } catch (error) {
    console.error('Error fetching pinned messages:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;