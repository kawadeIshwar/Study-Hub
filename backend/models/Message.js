import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'poll', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    enum: ['doubt', 'solution', 'resource', 'important', 'meeting']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  meetingLink: {
    type: String,
    default: ''
  },
  isProfanityFiltered: {
    type: Boolean,
    default: false
  },
  originalContent: {
    type: String,
    default: ''
  }
}, { timestamps: true });

messageSchema.index({ community: 1, createdAt: -1 });
messageSchema.index({ community: 1, isPinned: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ parentMessage: 1 });
messageSchema.index({ 'tags': 1 });

export default mongoose.model('Message', messageSchema);