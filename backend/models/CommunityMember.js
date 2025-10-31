import mongoose from 'mongoose';

const communityMemberSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned', 'pending'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' }
  }
}, { timestamps: true });

communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });
communityMemberSchema.index({ community: 1, role: 1 });
communityMemberSchema.index({ community: 1, status: 1 });

export default mongoose.model('CommunityMember', communityMemberSchema);