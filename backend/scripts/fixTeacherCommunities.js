import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from '../models/Community.js';
import User from '../models/User.js';

dotenv.config();

const fixTeacherCommunities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all communities
    const communities = await Community.find().populate('createdBy');
    let updated = 0;

    for (const community of communities) {
      if (community.createdBy && community.createdBy.role === 'teacher') {
        if (!community.settings.requireApproval) {
          community.settings.requireApproval = true;
          await community.save();
          updated++;
          console.log(`✅ Updated community: ${community.name}`);
        }
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} communities.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

fixTeacherCommunities();
