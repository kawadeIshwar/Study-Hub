import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Community from './models/Community.js';
import CommunityMember from './models/CommunityMember.js';
import Message from './models/Message.js';

dotenv.config();

// Sample users to create
const sampleUsers = [
  { name: 'Rahul Sharma', email: 'rahul@studyhub.com', password: 'password123' },
  { name: 'Priya Patel', email: 'priya@studyhub.com', password: 'password123' },
  { name: 'Amit Kumar', email: 'amit@studyhub.com', password: 'password123' },
  { name: 'Sneha Reddy', email: 'sneha@studyhub.com', password: 'password123' },
  { name: 'Vikram Singh', email: 'vikram@studyhub.com', password: 'password123' },
  { name: 'Anjali Verma', email: 'anjali@studyhub.com', password: 'password123' },
  { name: 'Rohan Gupta', email: 'rohan@studyhub.com', password: 'password123' },
  { name: 'Kavya Iyer', email: 'kavya@studyhub.com', password: 'password123' },
  { name: 'Arjun Mehta', email: 'arjun@studyhub.com', password: 'password123' },
  { name: 'Divya Nair', email: 'divya@studyhub.com', password: 'password123' }
];

// Sample messages for different communities
const messageTemplates = {
  'Computer Science Hub': [
    'Hey everyone! Can someone help me understand dynamic programming?',
    'Just solved the two-sum problem! Feeling great 🚀',
    'Does anyone have notes on data structures? Would really appreciate it!',
    'What are your favorite coding resources for beginners?',
    'I\'m working on a project using React. Any tips?',
    'Can we discuss the time complexity of merge sort?'
  ],
  'Mathematics & Statistics': [
    'Need help with calculus derivatives. Anyone free?',
    'Just aced my linear algebra exam! 📊',
    'Statistics assignment is killing me. Study group anyone?',
    'What\'s the best way to memorize formulas?',
    'Can someone explain Bayes theorem simply?',
    'Probability question: What are the chances of... 🎲'
  ],
  'Web Development': [
    'Just deployed my first website! Check it out 🌐',
    'React vs Vue - which one should I learn?',
    'Need help debugging this JavaScript error',
    'Best practices for responsive design?',
    'Anyone working with Next.js? Love it!',
    'CSS Grid or Flexbox? What do you prefer?'
  ],
  'Data Science & AI': [
    'Just finished my first ML model! 🤖',
    'Python libraries for data visualization?',
    'How do I start with neural networks?',
    'Kaggle competition anyone?',
    'TensorFlow vs PyTorch - your thoughts?',
    'Data preprocessing tips needed!'
  ],
  'Competitive Exams': [
    'JEE Mains in 2 months. Study plan advice?',
    'Best books for NEET preparation? 📚',
    'Mock test scores improving! Keep going everyone 💪',
    'Previous year papers - where to find?',
    'Time management tips for exams?',
    'Anyone joining coaching classes?'
  ],
  'default': [
    'Hey everyone! New here 👋',
    'This community is so helpful!',
    'Anyone online?',
    'Thanks for all the support!',
    'Let\'s study together! 📖',
    'Great discussion today!'
  ]
};

async function seedUsersAndChats() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if users already exist
    const existingUserCount = await User.countDocuments({
      email: { $in: sampleUsers.map(u => u.email) }
    });

    let createdUsers = [];

    if (existingUserCount > 0) {
      console.log(`⚠️  Found ${existingUserCount} existing sample users`);
      console.log('📋 Using existing users...\n');
      createdUsers = await User.find({
        email: { $in: sampleUsers.map(u => u.email) }
      });
    } else {
      console.log('👥 Creating 10 sample users...\n');
      
      for (let i = 0; i < sampleUsers.length; i++) {
        const userData = sampleUsers[i];
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword
        });
        
        await user.save();
        createdUsers.push(user);
        console.log(`   ✅ Created: ${userData.name} (${userData.email})`);
      }
      console.log('\n');
    }

    // Get all communities
    const communities = await Community.find();
    console.log(`📌 Found ${communities.length} communities\n`);

    let totalMembersAdded = 0;
    let totalMessagesAdded = 0;

    // Add users to communities and create messages
    for (const community of communities) {
      console.log(`🏘️  Processing: ${community.name}`);
      
      // Randomly select 5-8 users for each community
      const numMembers = Math.floor(Math.random() * 4) + 5; // 5-8 members
      const shuffledUsers = [...createdUsers].sort(() => Math.random() - 0.5);
      const selectedUsers = shuffledUsers.slice(0, numMembers);

      // Add members to community
      let membersAdded = 0;
      for (const user of selectedUsers) {
        // Check if already a member
        const existingMember = await CommunityMember.findOne({
          community: community._id,
          user: user._id
        });

        if (!existingMember) {
          const member = new CommunityMember({
            community: community._id,
            user: user._id,
            role: 'member',
            status: 'active'
          });
          await member.save();
          membersAdded++;
        }
      }

      // Update member count
      await Community.findByIdAndUpdate(community._id, {
        $inc: { 'stats.totalMembers': membersAdded }
      });

      totalMembersAdded += membersAdded;

      // Get message templates for this community
      const templates = messageTemplates[community.name] || messageTemplates['default'];
      
      // Create 4-6 messages for each community
      const numMessages = Math.floor(Math.random() * 3) + 4; // 4-6 messages
      let messagesCreated = 0;

      for (let i = 0; i < numMessages && i < selectedUsers.length; i++) {
        const sender = selectedUsers[i];
        const messageContent = templates[Math.floor(Math.random() * templates.length)];
        
        const message = new Message({
          community: community._id,
          sender: sender._id,
          content: messageContent,
          type: 'text',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last 7 days
        });

        await message.save();
        messagesCreated++;
      }

      // Update message count and last activity
      await Community.findByIdAndUpdate(community._id, {
        $inc: { 'stats.totalMessages': messagesCreated },
        $set: { 'stats.lastActivity': new Date() }
      });

      totalMessagesAdded += messagesCreated;

      console.log(`   👥 Added ${membersAdded} members`);
      console.log(`   💬 Created ${messagesCreated} messages\n`);
    }

    console.log('\n🎉 Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Users created/used: ${createdUsers.length}`);
    console.log(`   - Total members added: ${totalMembersAdded}`);
    console.log(`   - Total messages created: ${totalMessagesAdded}`);
    console.log(`   - Communities populated: ${communities.length}\n`);

    console.log('👤 Sample User Credentials:');
    console.log('   Email: rahul@studyhub.com');
    console.log('   Password: password123\n');
    console.log('   (All sample users have the same password: password123)\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedUsersAndChats();
