import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from './models/Community.js';
import User from './models/User.js';
import CommunityMember from './models/CommunityMember.js';

dotenv.config();

const defaultCommunities = [
  {
    name: 'Computer Science Hub',
    description: 'Discuss programming, algorithms, data structures, and computer science fundamentals. Share coding projects and get help with assignments.',
    tags: ['computer-science', 'programming', 'coding', 'algorithms'],
    isPrivate: false
  },
  {
    name: 'Mathematics & Statistics',
    description: 'Explore mathematical concepts, solve problems, and discuss statistics. Perfect for calculus, algebra, geometry, and data analysis.',
    tags: ['mathematics', 'statistics', 'calculus', 'algebra'],
    isPrivate: false
  },
  {
    name: 'Engineering Students',
    description: 'Connect with fellow engineering students. Share notes, discuss projects, and collaborate on technical challenges across all branches.',
    tags: ['engineering', 'technology', 'projects', 'technical'],
    isPrivate: false
  },
  {
    name: 'Medical & Health Sciences',
    description: 'Community for medical students and health science enthusiasts. Discuss anatomy, physiology, medicine, and healthcare topics.',
    tags: ['medical', 'health', 'medicine', 'biology'],
    isPrivate: false
  },
  {
    name: 'Business & Management',
    description: 'Learn about business strategies, management principles, entrepreneurship, and finance. Network with future business leaders.',
    tags: ['business', 'management', 'finance', 'entrepreneurship'],
    isPrivate: false
  },
  {
    name: 'Data Science & AI',
    description: 'Dive into machine learning, artificial intelligence, data analysis, and big data. Share projects and discuss latest AI trends.',
    tags: ['data-science', 'ai', 'machine-learning', 'analytics'],
    isPrivate: false
  },
  {
    name: 'Web Development',
    description: 'Everything about web development - HTML, CSS, JavaScript, React, Node.js, and more. Share projects and get coding help.',
    tags: ['web-development', 'javascript', 'react', 'nodejs'],
    isPrivate: false
  },
  {
    name: 'Physics & Chemistry',
    description: 'Explore the wonders of physics and chemistry. Discuss experiments, theories, and solve problems together.',
    tags: ['physics', 'chemistry', 'science', 'experiments'],
    isPrivate: false
  },
  {
    name: 'English & Literature',
    description: 'Discuss literature, improve writing skills, analyze texts, and share creative writing. Perfect for language learners.',
    tags: ['english', 'literature', 'writing', 'language'],
    isPrivate: false
  },
  {
    name: 'Competitive Exams',
    description: 'Prepare for competitive exams like JEE, NEET, GATE, CAT, GRE, and more. Share study materials and exam strategies.',
    tags: ['competitive-exams', 'jee', 'neet', 'gate', 'preparation'],
    isPrivate: false
  },
  {
    name: 'Psychology & Social Sciences',
    description: 'Explore human behavior, sociology, psychology, and social phenomena. Discuss theories and research findings.',
    tags: ['psychology', 'sociology', 'social-science', 'behavior'],
    isPrivate: false
  },
  {
    name: 'Mobile App Development',
    description: 'Learn mobile app development for Android and iOS. Discuss Flutter, React Native, Swift, Kotlin, and app design.',
    tags: ['mobile-development', 'android', 'ios', 'flutter'],
    isPrivate: false
  },
  {
    name: 'Graphic Design & UI/UX',
    description: 'Share designs, learn design principles, discuss UI/UX best practices. Tools: Figma, Adobe XD, Photoshop, Illustrator.',
    tags: ['design', 'ui-ux', 'graphics', 'creative'],
    isPrivate: false
  },
  {
    name: 'Career Guidance & Jobs',
    description: 'Get career advice, discuss job opportunities, prepare for interviews, and share resume tips. Build your professional network.',
    tags: ['career', 'jobs', 'interview', 'professional'],
    isPrivate: false
  },
  {
    name: 'Study Tips & Motivation',
    description: 'Share study techniques, time management tips, and motivational content. Support each other in academic journey.',
    tags: ['study-tips', 'motivation', 'productivity', 'learning'],
    isPrivate: false
  }
];

async function seedCommunities() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a system admin user
    let adminUser = await User.findOne({ email: 'admin@studyhub.com' });
    
    if (!adminUser) {
      console.log('📝 Creating system admin user...');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Admin@123', 10);
      
      adminUser = new User({
        name: 'StudyHub Admin',
        email: 'admin@studyhub.com',
        password: hashedPassword
      });
      await adminUser.save();
      console.log('✅ System admin user created');
    } else {
      console.log('✅ System admin user found');
    }

    // Check if communities already exist
    const existingCount = await Community.countDocuments({
      name: { $in: defaultCommunities.map(c => c.name) }
    });

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing communities. Do you want to:`);
      console.log('   1. Skip seeding (communities already exist)');
      console.log('   2. Delete existing and recreate');
      console.log('\n💡 To recreate, delete communities manually and run this script again.');
      console.log('   To continue with existing communities, this is fine!\n');
      
      // Just report what exists
      const existing = await Community.find({
        name: { $in: defaultCommunities.map(c => c.name) }
      }).select('name');
      console.log('📋 Existing communities:');
      existing.forEach((c, i) => console.log(`   ${i + 1}. ${c.name}`));
      
      await mongoose.connection.close();
      console.log('\n✅ Done! Communities are ready.');
      return;
    }

    console.log('🌱 Seeding 15 default communities...\n');

    const createdCommunities = [];

    for (let i = 0; i < defaultCommunities.length; i++) {
      const communityData = defaultCommunities[i];
      
      console.log(`📌 Creating ${i + 1}/15: ${communityData.name}`);
      
      const community = new Community({
        ...communityData,
        createdBy: adminUser._id,
        stats: {
          totalMembers: 1,
          totalMessages: 0,
          lastActivity: new Date()
        }
      });

      await community.save();

      // Add admin as member
      const membership = new CommunityMember({
        community: community._id,
        user: adminUser._id,
        role: 'admin',
        status: 'active'
      });

      await membership.save();
      
      createdCommunities.push(community);
      console.log(`   ✅ Created with ${communityData.tags.length} tags`);
    }

    console.log('\n🎉 Successfully created 15 default communities!\n');
    console.log('📊 Summary:');
    console.log(`   - Total communities: ${createdCommunities.length}`);
    console.log(`   - All communities are PUBLIC (visible to everyone)`);
    console.log(`   - Admin user: ${adminUser.email}`);
    console.log(`   - All communities have tags for easy discovery\n`);

    console.log('📋 Created Communities:');
    createdCommunities.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}`);
      console.log(`      Tags: ${c.tags.join(', ')}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed. Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding communities:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedCommunities();
