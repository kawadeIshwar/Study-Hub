import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import CommunityMember from './models/CommunityMember.js';
import Community from './models/Community.js';
import Notification from './models/Notification.js';

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://studyhub4all.netlify.app", "http://localhost:3000", "http://localhost:5173"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      // Store user info in socket
      socket.userId = userId;
      socket.userName = decoded.name;
      
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userName} connected`);

    // Join community room
    socket.on('join-community', async (communityId) => {
      try {
        // Verify user is member of community
        const membership = await CommunityMember.findOne({
          community: communityId,
          user: socket.userId,
          status: 'active'
        });

        if (!membership) {
          socket.emit('error', { message: 'Not a member of this community' });
          return;
        }

        // Leave any existing rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join new room
        socket.join(`community-${communityId}`);
        socket.currentCommunity = communityId;

        // Update user online status
        membership.isOnline = true;
        membership.lastSeen = new Date();
        await membership.save();

        // Notify other members
        socket.to(`community-${communityId}`).emit('user-online', {
          userId: socket.userId,
          userName: socket.userName
        });

        socket.emit('joined-community', { communityId });
      } catch (error) {
        console.error('Error joining community:', error);
        socket.emit('error', { message: 'Failed to join community' });
      }
    });

    // Leave community room
    socket.on('leave-community', async (communityId) => {
      try {
        socket.leave(`community-${communityId}`);
        delete socket.currentCommunity;

        // Update user offline status
        await CommunityMember.findOneAndUpdate(
          { community: communityId, user: socket.userId },
          { isOnline: false, lastSeen: new Date() }
        );

        // Notify other members
        socket.to(`community-${communityId}`).emit('user-offline', {
          userId: socket.userId,
          userName: socket.userName
        });
      } catch (error) {
        console.error('Error leaving community:', error);
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { communityId, content, type = 'text', parentMessage, fileUrl, fileName, fileSize } = data;

        // Verify user is member of community
        const membership = await CommunityMember.findOne({
          community: communityId,
          user: socket.userId,
          status: 'active'
        });

        if (!membership) {
          socket.emit('error', { message: 'Not authorized to send messages' });
          return;
        }

        // Create message
        const message = new Message({
          community: communityId,
          sender: socket.userId,
          content,
          type,
          parentMessage: parentMessage || null,
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          fileSize: fileSize || 0
        });

        await message.save();
        await message.populate('sender', 'name');

        // Update community stats
        await Community.findByIdAndUpdate(communityId, {
          $inc: { 'stats.totalMessages': 1 },
          'stats.lastActivity': new Date()
        });

        // If this is a reply, update parent message
        if (parentMessage) {
          await Message.findByIdAndUpdate(parentMessage, {
            $push: { replies: message._id }
          });
        }

        // Broadcast message to all members in the community
        io.to(`community-${communityId}`).emit('new-message', message);

        // Send notifications to mentioned users or all members (excluding sender)
        if (content.includes('@')) {
          // Extract mentioned users (simplified implementation)
          const mentionedUsers = await extractMentionedUsers(content, communityId);
          mentionedUsers.forEach(userId => {
            if (userId !== socket.userId) {
              createNotification(userId, 'mention', {
                communityId,
                messageId: message._id,
                senderName: socket.userName
              });
            }
          });
        } else {
          // Notify all online members except sender
          const members = await CommunityMember.find({
            community: communityId,
            user: { $ne: socket.userId },
            status: 'active',
            isOnline: true
          }).populate('user', 'name');

          members.forEach(member => {
            createNotification(member.user._id, 'message', {
              communityId,
              messageId: message._id,
              senderName: socket.userName
            });
          });
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Pin message
    socket.on('pin-message', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check permissions
        const membership = await CommunityMember.findOne({
          community: message.community,
          user: socket.userId,
          role: { $in: ['admin', 'moderator'] },
          status: 'active'
        });

        if (!membership) {
          socket.emit('error', { message: 'Not authorized to pin messages' });
          return;
        }

        message.isPinned = !message.isPinned;
        await message.save();

        // Notify all members about pinned message
        io.to(`community-${message.community}`).emit('message-pinned', {
          messageId,
          isPinned: message.isPinned,
          pinnedBy: socket.userName
        });

      } catch (error) {
        console.error('Error pinning message:', error);
        socket.emit('error', { message: 'Failed to pin message' });
      }
    });

    // Delete message
    socket.on('delete-message', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check permissions
        const membership = await CommunityMember.findOne({
          community: message.community,
          user: socket.userId,
          status: 'active'
        });

        const canDelete = membership && (
          membership.role === 'admin' || 
          membership.role === 'moderator' || 
          message.sender.toString() === socket.userId
        );

        if (!canDelete) {
          socket.emit('error', { message: 'Not authorized to delete this message' });
          return;
        }

        await Message.findByIdAndDelete(messageId);

        // Update community stats
        await Community.findByIdAndUpdate(message.community, {
          $inc: { 'stats.totalMessages': -1 }
        });

        // Notify all members about deleted message
        io.to(`community-${message.community}`).emit('message-deleted', { messageId });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { communityId, isTyping } = data;
      socket.to(`community-${communityId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userName} disconnected`);
      
      if (socket.currentCommunity) {
        try {
          // Update user offline status
          await CommunityMember.findOneAndUpdate(
            { community: socket.currentCommunity, user: socket.userId },
            { isOnline: false, lastSeen: new Date() }
          );

          // Notify other members
          socket.to(`community-${socket.currentCommunity}`).emit('user-offline', {
            userId: socket.userId,
            userName: socket.userName
          });
        } catch (error) {
          console.error('Error updating offline status:', error);
        }
      }
    });
  });

  return io;
};

// Helper function to extract mentioned users
async function extractMentionedUsers(content, communityId) {
  // Simple implementation - in a real app, you'd parse @username mentions
  // and match them to actual users in the community
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex) || [];
  
  // For now, return empty array - implement proper mention parsing later
  return [];
}

// Helper function to create notifications
async function createNotification(userId, type, data) {
  try {
    const notification = new Notification({
      recipient: userId,
      type,
      title: getNotificationTitle(type, data),
      content: getNotificationContent(type, data),
      data
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

function getNotificationTitle(type, data) {
  switch (type) {
    case 'message':
      return `New message from ${data.senderName}`;
    case 'mention':
      return `You were mentioned by ${data.senderName}`;
    case 'pin':
      return 'Message pinned';
    default:
      return 'New notification';
  }
}

function getNotificationContent(type, data) {
  switch (type) {
    case 'message':
      return `${data.senderName} sent a message in the community`;
    case 'mention':
      return `${data.senderName} mentioned you in a message`;
    case 'pin':
      return 'A message has been pinned in the community';
    default:
      return 'You have a new notification';
  }
}

export default setupSocket;