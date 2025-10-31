import express from 'express';
import Poll from '../models/Poll.js';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get polls for a community
router.get('/:communityId', auth, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to view polls' });
    }

    let query = { community: req.params.communityId };
    if (status === 'active') {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { expiresAt: { $lte: new Date() } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add user's vote information
    const pollsWithUserVote = polls.map(poll => {
      const pollObj = poll.toObject();
      pollObj.hasVoted = poll.options.some(option => 
        option.votes.some(vote => vote.user.toString() === req.user.id)
      );
      pollObj.userVotes = poll.options.map(option => ({
        optionId: option._id,
        hasVoted: option.votes.some(vote => vote.user.toString() === req.user.id)
      }));
      return pollObj;
    });

    const total = await Poll.countDocuments(query);

    res.json({
      polls: pollsWithUserVote,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create new poll
router.post('/:communityId', auth, async (req, res) => {
  try {
    const { question, description, options, type, isAnonymous, allowMultipleVotes, expiresAt } = req.body;

    // Validate input
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ msg: 'Question and at least 2 options are required' });
    }

    // Check if user is a member and polls are allowed
    const membership = await CommunityMember.findOne({
      community: req.params.communityId,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to create polls' });
    }

    const community = await Community.findById(req.params.communityId);
    if (!community.settings.allowPolls) {
      return res.status(403).json({ msg: 'Polls are not allowed in this community' });
    }

    const poll = new Poll({
      community: req.params.communityId,
      createdBy: req.user.id,
      question,
      description,
      options: options.map(option => ({ text: option })),
      type: type || 'single',
      isAnonymous: isAnonymous || false,
      allowMultipleVotes: allowMultipleVotes || false,
      expiresAt: new Date(expiresAt)
    });

    await poll.save();
    await poll.populate('createdBy', 'name');

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Vote on poll
router.post('/:pollId/vote', auth, async (req, res) => {
  try {
    const { optionIds } = req.body; // Can be array for multiple choice
    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Check if poll is active
    if (!poll.isActive || new Date() > poll.expiresAt) {
      return res.status(400).json({ msg: 'Poll has expired' });
    }

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: poll.community,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to vote' });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user.id)
    );

    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ msg: 'You have already voted in this poll' });
    }

    // Validate option IDs
    const validOptionIds = poll.options.map(opt => opt._id.toString());
    const voteOptionIds = Array.isArray(optionIds) ? optionIds : [optionIds];
    
    if (!voteOptionIds.every(id => validOptionIds.includes(id))) {
      return res.status(400).json({ msg: 'Invalid option IDs' });
    }

    if (poll.type === 'single' && voteOptionIds.length > 1) {
      return res.status(400).json({ msg: 'This poll only allows single choice' });
    }

    // Add votes
    voteOptionIds.forEach(optionId => {
      const option = poll.options.id(optionId);
      if (option) {
        if (poll.isAnonymous) {
          option.votes.push({ user: null });
        } else {
          option.votes.push({ user: req.user.id });
        }
        option.voteCount = option.votes.length;
      }
    });

    poll.totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
    await poll.save();

    res.json({ msg: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get poll results
router.get('/:pollId/results', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId)
      .populate('createdBy', 'name')
      .populate('options.votes.user', 'name');

    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Check if user is a member
    const membership = await CommunityMember.findOne({
      community: poll.community,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'You must be a member to view poll results' });
    }

    // Calculate percentages
    const results = poll.options.map(option => ({
      _id: option._id,
      text: option.text,
      voteCount: option.voteCount,
      percentage: poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0,
      voters: poll.isAnonymous ? [] : option.votes.filter(vote => vote.user).map(vote => vote.user)
    }));

    res.json({
      poll: {
        _id: poll._id,
        question: poll.question,
        description: poll.description,
        type: poll.type,
        isAnonymous: poll.isAnonymous,
        totalVotes: poll.totalVotes,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        createdBy: poll.createdBy
      },
      results
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete poll (admin/moderator only)
router.delete('/:pollId', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Check permissions
    const membership = await CommunityMember.findOne({
      community: poll.community,
      user: req.user.id,
      role: { $in: ['admin', 'moderator'] },
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({ msg: 'Only admins and moderators can delete polls' });
    }

    await Poll.findByIdAndDelete(req.params.pollId);
    res.json({ msg: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;