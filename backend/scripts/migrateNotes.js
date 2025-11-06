import mongoose from 'mongoose';
import Note from '../models/Note.js';
import dotenv from 'dotenv';

dotenv.config();

// Migration script to set uploaderRole for existing notes
async function migrateNotes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all notes without uploaderRole or with null uploaderRole
    const notesWithoutRole = await Note.find({
      $or: [
        { uploaderRole: { $exists: false } },
        { uploaderRole: null }
      ]
    });

    console.log(`📝 Found ${notesWithoutRole.length} notes without uploaderRole`);

    if (notesWithoutRole.length > 0) {
      // Update all notes to have uploaderRole as 'student'
      const result = await Note.updateMany(
        {
          $or: [
            { uploaderRole: { $exists: false } },
            { uploaderRole: null }
          ]
        },
        {
          $set: { uploaderRole: 'student' }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} notes to uploaderRole: 'student'`);
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('✅ All notes already have uploaderRole set!');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateNotes();
