import { createTransport } from 'nodemailer';
import Notification from '../models/Notification.js';
import Community from '../models/Community.js';
import Message from '../models/Message.js';
import Poll from '../models/Poll.js';

// Create transporter
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
export const sendEmailNotification = async (to, subject, content, data = {}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, '') // Plain text version
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Mark notification as email sent
    if (data.notificationId) {
      await Notification.findByIdAndUpdate(data.notificationId, {
        isEmailSent: true,
        emailSentAt: new Date()
      });
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Generate daily digest email content
export const generateDailyDigest = async (userId) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get user's communities
    const userCommunities = await Community.find({
      members: userId
    }).select('_id name');

    const communityIds = userCommunities.map(c => c._id);

    // Get recent messages from user's communities
    const recentMessages = await Message.find({
      community: { $in: communityIds },
      createdAt: { $gte: yesterday },
      type: 'text'
    })
    .populate('sender', 'name')
    .populate('community', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get recent polls
    const recentPolls = await Poll.find({
      community: { $in: communityIds },
      createdAt: { $gte: yesterday }
    })
    .populate('community', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get pinned messages
    const pinnedMessages = await Message.find({
      community: { $in: communityIds },
      isPinned: true
    })
    .populate('sender', 'name')
    .populate('community', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    return {
      messages: recentMessages,
      polls: recentPolls,
      pinnedMessages,
      communities: userCommunities
    };
  } catch (error) {
    console.error('Error generating daily digest:', error);
    return { messages: [], polls: [], pinnedMessages: [], communities: [] };
  }
};

// Generate HTML email template
export const generateEmailTemplate = (type, data) => {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StudyHub Community Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
        .card { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .message { border-left: 4px solid #667eea; }
        .poll { border-left: 4px solid #28a745; }
        .pinned { border-left: 4px solid #ffc107; }
        .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>StudyHub Community Update</h1>
        <p>Stay connected with your learning communities</p>
      </div>
      <div class="content">
        {{CONTENT}}
      </div>
      <div class="footer">
        <p>You're receiving this because you're a member of StudyHub communities.</p>
        <p><a href="{{UNSUBSCRIBE_LINK}}">Unsubscribe</a> | <a href="{{SETTINGS_LINK}}">Email Settings</a></p>
      </div>
    </body>
    </html>
  `;

  let content = '';

  switch (type) {
    case 'daily_digest':
      content = generateDailyDigestContent(data);
      break;
    case 'new_message':
      content = generateNewMessageContent(data);
      break;
    case 'meeting_link':
      content = generateMeetingLinkContent(data);
      break;
    case 'poll_created':
      content = generatePollCreatedContent(data);
      break;
    default:
      content = generateGenericContent(data);
  }

  return baseTemplate
    .replace('{{CONTENT}}', content)
    .replace('{{UNSUBSCRIBE_LINK}}', process.env.FRONTEND_URL + '/settings/notifications')
    .replace('{{SETTINGS_LINK}}', process.env.FRONTEND_URL + '/settings/notifications');
};

function generateDailyDigestContent(data) {
  let content = '<h2>Your Daily Community Summary</h2>';
  
  if (data.messages.length > 0) {
    content += '<h3>Recent Messages</h3>';
    data.messages.forEach(msg => {
      content += `
        <div class="card message">
          <strong>${msg.sender.name}</strong> in <strong>${msg.community.name}</strong>
          <p>${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}</p>
          <small>${new Date(msg.createdAt).toLocaleString()}</small>
        </div>
      `;
    });
  }

  if (data.pinnedMessages.length > 0) {
    content += '<h3>📌 Pinned Messages</h3>';
    data.pinnedMessages.forEach(msg => {
      content += `
        <div class="card pinned">
          <strong>${msg.sender.name}</strong> in <strong>${msg.community.name}</strong>
          <p>${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}</p>
        </div>
      `;
    });
  }

  if (data.polls.length > 0) {
    content += '<h3>🗳️ New Polls</h3>';
    data.polls.forEach(poll => {
      content += `
        <div class="card poll">
          <strong>${poll.question}</strong> in <strong>${poll.community.name}</strong>
          <p>${poll.description || ''}</p>
          <small>Created by ${poll.createdBy.name}</small>
        </div>
      `;
    });
  }

  content += `<a href="${process.env.FRONTEND_URL}/communities" class="button">Visit Your Communities</a>`;
  return content;
}

function generateNewMessageContent(data) {
  return `
    <h2>New Message in ${data.communityName}</h2>
    <div class="card message">
      <strong>${data.senderName}</strong>
      <p>${data.messageContent}</p>
      <small>${new Date(data.timestamp).toLocaleString()}</small>
    </div>
    <a href="${process.env.FRONTEND_URL}/community/${data.communityId}" class="button">View Message</a>
  `;
}

function generateMeetingLinkContent(data) {
  return `
    <h2>📹 Meeting Link Shared</h2>
    <p>A meeting link has been shared in <strong>${data.communityName}</strong></p>
    <div class="card pinned">
      <strong>${data.senderName}</strong>
      <p>Join the meeting: <a href="${data.meetingLink}" target="_blank">${data.meetingLink}</a></p>
    </div>
    <a href="${data.meetingLink}" class="button">Join Meeting</a>
  `;
}

function generatePollCreatedContent(data) {
  return `
    <h2>🗳️ New Poll Created</h2>
    <p>A new poll has been created in <strong>${data.communityName}</strong></p>
    <div class="card poll">
      <strong>${data.pollQuestion}</strong>
      <p>${data.pollDescription || ''}</p>
      <small>Created by ${data.creatorName}</small>
    </div>
    <a href="${process.env.FRONTEND_URL}/community/${data.communityId}?tab=polls" class="button">Vote Now</a>
  `;
}

function generateGenericContent(data) {
  return `
    <h2>Community Update</h2>
    <p>${data.message || 'You have a new update from your StudyHub community.'}</p>
    <a href="${process.env.FRONTEND_URL}/communities" class="button">Visit Communities</a>
  `;
}

// Send bulk emails (for digest)
export const sendBulkEmails = async (emailData) => {
  const results = [];
  
  for (const email of emailData) {
    try {
      const result = await sendEmailNotification(email.to, email.subject, email.content);
      results.push({ email: email.to, success: result.success, error: result.error });
    } catch (error) {
      results.push({ email: email.to, success: false, error: error.message });
    }
  }
  
  return results;
};

export default {
  sendEmailNotification,
  generateDailyDigest,
  generateEmailTemplate,
  sendBulkEmails
};