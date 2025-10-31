import express from 'express';
import Notification from '../models/Notification.js';
import CommunityMember from '../models/CommunityMember.js';
import { sendEmailNotification, generateEmailTemplate } from '../utils/emailService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user.id };
    if (unread === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasMore: skip + notifications.length < total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const member = await CommunityMember.findOne({
      user: req.user.id
    }).select('notificationPreferences');

    res.json({
      preferences: member?.notificationPreferences || {
        email: true,
        push: true,
        newMessage: true,
        meetingLink: true,
        pollCreated: true,
        dailyDigest: true,
        weeklyDigest: false
      }
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    const preferences = req.body;
    
    await CommunityMember.updateMany(
      { user: req.user.id },
      { notificationPreferences: preferences }
    );

    res.json({ message: 'Notification preferences updated', preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test email notification
router.post('/test-email', auth, async (req, res) => {
  try {
    const { type = 'new_message' } = req.body;
    
    const testData = {
      communityName: 'Test Community',
      senderName: 'Test User',
      messageContent: 'This is a test notification from StudyHub!',
      communityId: 'test123',
      timestamp: new Date()
    };

    const htmlContent = generateEmailTemplate(type, testData);
    
    const result = await sendEmailNotification(
      req.user.email,
      'StudyHub Test Notification',
      htmlContent
    );

    if (result.success) {
      res.json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Notification.countDocuments({ recipient: req.user.id });
    const unread = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    const read = await Notification.countDocuments({ recipient: req.user.id, isRead: true });
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await Notification.countDocuments({
      recipient: req.user.id,
      createdAt: { $gte: last24Hours }
    });

    res.json({
      total,
      unread,
      read,
      recent,
      unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;