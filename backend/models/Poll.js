import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxlength: 100
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    voteCount: {
      type: Number,
      default: 0
    }
  }],
  type: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

pollSchema.index({ community: 1, createdAt: -1 });
pollSchema.index({ community: 1, isActive: 1 });
pollSchema.index({ expiresAt: 1 });

export default mongoose.model('Poll', pollSchema);