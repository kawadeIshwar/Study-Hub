import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';

dotenv.config();

// Student community ideas - casual, peer-led, open communities
const studentCommunityTemplates = [
  {
    name: 'Study Buddies - {subject}',
    description: 'A friendly group for students studying {subject}. Share notes, discuss doubts, and help each other succeed! Everyone is welcome to join.',
    tags: ['study', 'peer-learning', 'students']
  },
  {
    name: '{college} - {year} Students',
    description: 'Connect with fellow {year} students! Share resources, plan study sessions, discuss assignments, and make friends.',
    tags: ['college', 'peer-group', 'networking']
  },
  {
    name: 'Exam Prep - {subject}',
    description: 'Preparing for {subject} exams? Join us for group study sessions, previous year papers, quick revision notes, and last-minute tips!',
    tags: ['exam', 'preparation', 'revision']
  },
  {
    name: 'Project Collaboration - {dept}',
    description: 'Looking for project partners in {dept}? Share ideas, find teammates, get feedback, and showcase your projects here.',
    tags: ['projects', 'collaboration', 'teamwork']
  },
  {
    name: 'Placement Prep Corner',
    description: 'Get ready for placements! Share interview experiences, coding problems, aptitude questions, resume tips, and company insights.',
    tags: ['placement', 'interview', 'career']
  },
  {
    name: 'Assignment Help Hub',
    description: 'Stuck on an assignment? Need help understanding a concept? This is a judgment-free zone where students help students.',
    tags: ['assignment', 'help', 'doubt-solving']
  },
  {
    name: 'Notes Sharing - {dept}',
    description: 'A central hub for sharing and accessing quality notes for {dept}. Upload your notes and benefit from others. Open to all!',
    tags: ['notes', 'resources', 'sharing']
  },
  {
    name: 'Late Night Study Sessions',
    description: 'For all the night owls! Study together virtually during late hours. Share what you are working on and stay motivated.',
    tags: ['study', 'night', 'motivation']
  },
  {
    name: 'Doubt Clearing Forum',
    description: 'Got a doubt? Ask here! Students helping students with quick explanations, resources, and solutions. No question is too small!',
    tags: ['doubts', 'help', 'forum']
  },
  {
    name: 'Campus Life & Fun',
    description: 'Not just academics! Share campus events, memes, food spots, movie recommendations, and everything fun about college life.',
    tags: ['campus', 'fun', 'social']
  },
  {
    name: 'Coding Club - Open to All',
    description: 'Learn coding together! Share code, discuss algorithms, participate in coding challenges, and grow your programming skills.',
    tags: ['coding', 'programming', 'learning']
  },
  {
    name: 'First Year Survival Guide',
    description: 'New to college? Join fellow freshers! Get tips, make friends, understand subjects, and navigate your first year successfully.',
    tags: ['firstyear', 'freshers', 'guide']
  },
  {
    name: 'Lab Reports & Practicals',
    description: 'Share lab manuals, discuss experiments, clarify practical doubts, and help each other with lab reports and viva preparation.',
    tags: ['lab', 'practical', 'experiments']
  },
  {
    name: 'Semester Exchange Hub',
    description: 'Share resources, notes, and books for this semester. Upload what you have and download what you need. Everyone contributes!',
    tags: ['semester', 'exchange', 'resources']
  },
  {
    name: 'Group Study Sessions',
    description: 'Organize and join group study sessions. Better together than alone! Share schedules, topics, and study together virtually or in-person.',
    tags: ['group-study', 'sessions', 'collaborative']
  },
  {
    name: 'Quick Revision Notes',
    description: 'Short on time? Find concise revision notes, formulas, key points, and quick summaries for all subjects. Perfect for exam week!',
    tags: ['revision', 'quick-notes', 'exam']
  },
  {
    name: 'Internship & Opportunities',
    description: 'Share internship openings, hackathons, competitions, scholarships, and other opportunities. Help each other grow!',
    tags: ['internship', 'opportunities', 'career']
  },
  {
    name: 'Previous Year Papers Collection',
    description: 'Collection of previous year question papers for all subjects and semesters. Upload and download freely!',
    tags: ['pyq', 'previous-papers', 'exams']
  },
  {
    name: 'Hostel Students Community',
    description: 'For all hostelites! Discuss hostel life, share room tips, organize events, find study partners in your hostel.',
    tags: ['hostel', 'campus', 'community']
  },
  {
    name: 'Final Year Project Ideas',
    description: 'Brainstorm final year project ideas, share resources, find guides, discuss implementations, and showcase completed projects.',
    tags: ['final-year', 'projects', 'ideas']
  }
];

// Subjects for communities
const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Programming',
  'Data Structures', 'Database Systems', 'Web Development',
  'Machine Learning', 'Digital Electronics', 'Mechanics',
  'Thermodynamics', 'Communication Skills', 'Engineering Graphics'
];

// Departments
const departments = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil',
  'Information Technology', 'Electrical', 'Chemical'
];

// Colleges
const colleges = [
  'IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT',
  'Anna University', 'Delhi University', 'Pune University'
];

// Years
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Helper function
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const replacePlaceholders = (text, subject, dept, college, year) => {
  return text
    .replace('{subject}', subject || getRandomItem(subjects))
    .replace('{dept}', dept || getRandomItem(departments))
    .replace('{college}', college || getRandomItem(colleges))
    .replace('{year}', year || getRandomItem(years));
};

// Main seed function
const seedStudentCommunities = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    console.log('👨‍🎓 Fetching students...');
    const students = await User.find({ role: 'student' }).limit(10);
    
    if (students.length === 0) {
      console.log('❌ No students found in database!');
      console.log('💡 Please create some student accounts first.\n');
      process.exit(1);
    }

    console.log(`✅ Found ${students.length} students\n`);

    // Create communities
    console.log('🏘️  Creating student communities...');
    const createdCommunities = [];
    let totalCreated = 0;

    // Ensure we create at least 20 communities
    const numberOfCommunities = Math.max(20, studentCommunityTemplates.length);
    
    for (let i = 0; i < numberOfCommunities; i++) {
      // Pick a template (cycle through them)
      const template = studentCommunityTemplates[i % studentCommunityTemplates.length];
      
      // Pick a random student as creator
      const creator = getRandomItem(students);
      
      // Generate community details
      const subject = getRandomItem(subjects);
      const dept = getRandomItem(departments);
      const college = getRandomItem(colleges);
      const year = getRandomItem(years);
      
      const communityName = replacePlaceholders(template.name, subject, dept, college, year);
      const communityDesc = replacePlaceholders(template.description, subject, dept, college, year);
      
      // Check if community with this name already exists
      const existing = await Community.findOne({ name: communityName });
      if (existing) {
        continue; // Skip if already exists
      }
      
      // Additional tags based on content
      const additionalTags = [];
      if (communityName.includes('Coding') || communityName.includes('Programming')) {
        additionalTags.push('coding', 'tech');
      }
      if (communityName.includes('Exam') || communityName.includes('Revision')) {
        additionalTags.push('exam', 'test');
      }
      if (communityName.includes('Fun') || communityName.includes('Campus')) {
        additionalTags.push('fun', 'social');
      }
      
      // Create community
      const community = new Community({
        name: communityName,
        description: communityDesc,
        tags: [...template.tags, ...additionalTags, 'open', 'student-led'],
        createdBy: creator._id,
        isPrivate: false, // All student communities are public
        settings: {
          allowFileSharing: true,
          allowPolls: true,
          requireApproval: false, // ⭐ KEY: No approval needed - direct join
          profanityFilter: true
        },
        stats: {
          totalMembers: 1, // Creator is first member
          totalMessages: 0,
          lastActivity: new Date()
        }
      });

      await community.save();
      
      // Add creator as admin member
      const membership = new CommunityMember({
        community: community._id,
        user: creator._id,
        role: 'admin',
        status: 'active'
      });
      await membership.save();
      
      createdCommunities.push({
        name: communityName,
        creator: creator.name,
        requiresApproval: false
      });
      
      totalCreated++;
      console.log(`   ✅ ${communityName} (by ${creator.name}) - 🔓 Open to all`);
    }

    console.log(`\n✅ Created ${totalCreated} student communities\n`);

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Student Communities Created: ${totalCreated}`);
    console.log(`🔓 All are OPEN - No approval required`);
    console.log(`👥 Students can join directly`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show sample communities
    console.log('📋 Sample Communities Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    createdCommunities.slice(0, 10).forEach((comm, idx) => {
      console.log(`${idx + 1}. ${comm.name}`);
      console.log(`   👤 Created by: ${comm.creator}`);
      console.log(`   🔓 Status: Open (No approval needed)`);
      console.log('   ─────────────────────────────────');
    });

    console.log('\n✨ Student communities seeding completed successfully!');
    console.log('💡 Students can now join these communities without waiting for approval!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seed script
seedStudentCommunities();
