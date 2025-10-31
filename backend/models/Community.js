import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  coverImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  settings: {
    allowFileSharing: { type: Boolean, default: true },
    allowPolls: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    profanityFilter: { type: Boolean, default: true }
  },
  stats: {
    totalMembers: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  }
}, { timestamps: true });

communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ tags: 1 });
communitySchema.index({ createdAt: -1 });

export default mongoose.model('Community', communitySchema);