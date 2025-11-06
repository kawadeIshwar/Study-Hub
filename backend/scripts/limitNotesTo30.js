import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from '../models/Note.js';
import User from '../models/User.js';

dotenv.config();

const limitNotesTo30 = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get total count
    const totalNotes = await Note.countDocuments();
    console.log(`📊 Current total notes: ${totalNotes}\n`);

    if (totalNotes <= 30) {
      console.log('✅ Already have 30 or fewer notes. No action needed.\n');
      process.exit(0);
    }

    // Get top 30 notes by likes (most popular)
    console.log('🔍 Finding top 30 notes by likes...');
    const top30Notes = await Note.find()
      .sort({ likes: -1 }) // Sort by likes descending
      .limit(30)
      .select('_id title likes uploader');

    console.log(`✅ Found top 30 notes\n`);

    // Get the IDs of notes to keep
    const keepIds = top30Notes.map(note => note._id);

    // Delete all notes NOT in the keep list
    console.log('🗑️  Deleting notes outside top 30...');
    const deleteResult = await Note.deleteMany({
      _id: { $nin: keepIds }
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} notes\n`);

    // Verify final count
    const finalCount = await Note.countDocuments();
    console.log('📊 FINAL SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Total notes remaining: ${finalCount}`);
    console.log(`🗑️  Notes deleted: ${deleteResult.deletedCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show the top 30 notes that were kept
    console.log('⭐ Top 30 Notes Kept (by likes):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Populate uploader info
    const keptNotes = await Note.find({ _id: { $in: keepIds } })
      .populate('uploader', 'name')
      .sort({ likes: -1 });

    keptNotes.forEach((note, idx) => {
      console.log(`${idx + 1}. ${note.title}`);
      console.log(`   👨‍🏫 ${note.uploader?.name || 'Unknown'} | ❤️ ${note.likes} likes`);
      if ((idx + 1) % 10 === 0) console.log('   ─────────────────────────────────');
    });

    console.log('\n✨ Successfully limited notes to top 30!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
limitNotesTo30();
