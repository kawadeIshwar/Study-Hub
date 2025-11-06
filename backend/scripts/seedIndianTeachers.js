import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';

dotenv.config();

// Indian teacher names
const indianTeacherNames = [
  'Dr. Rajesh Kumar',
  'Prof. Priya Sharma',
  'Dr. Amit Patel',
  'Prof. Sneha Reddy',
  'Dr. Vikram Singh',
  'Prof. Anjali Mehta',
  'Dr. Arjun Nair',
  'Prof. Kavita Desai',
  'Dr. Sanjay Gupta',
  'Prof. Meera Iyer',
  'Dr. Rahul Verma',
  'Prof. Pooja Joshi',
  'Dr. Karthik Rao',
  'Prof. Divya Pillai',
  'Dr. Arun Kumar',
  'Prof. Neha Agarwal',
  'Dr. Suresh Menon',
  'Prof. Ritu Malhotra',
  'Dr. Naveen Reddy',
  'Prof. Shalini Shah'
];

// Indian institutions
const indianInstitutions = [
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'BITS Pilani',
  'NIT Trichy',
  'IIIT Hyderabad',
  'Delhi University',
  'Mumbai University',
  'Pune University',
  'Anna University',
  'VIT Vellore',
  'Manipal Institute of Technology',
  'SRM University',
  'Amity University',
  'Bangalore University'
];

// Subjects for different departments
const subjects = {
  'Computer Science': [
    'Data Structures',
    'Algorithms',
    'Database Management',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Machine Learning',
    'Artificial Intelligence',
    'Web Development',
    'Cloud Computing'
  ],
  'Electronics': [
    'Digital Electronics',
    'Microprocessors',
    'VLSI Design',
    'Communication Systems',
    'Signal Processing',
    'Embedded Systems'
  ],
  'Mechanical': [
    'Thermodynamics',
    'Fluid Mechanics',
    'Manufacturing Processes',
    'Machine Design',
    'CAD/CAM',
    'Automobile Engineering'
  ],
  'Civil': [
    'Structural Analysis',
    'Surveying',
    'Construction Management',
    'Geotechnical Engineering',
    'Transportation Engineering',
    'Environmental Engineering'
  ],
  'Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Differential Equations',
    'Probability and Statistics',
    'Discrete Mathematics',
    'Complex Analysis'
  ]
};

// Qualifications
const qualifications = ['M.Tech', 'PhD', 'M.Sc', 'ME'];

// Specializations
const specializations = Object.keys(subjects);

// Community names and descriptions
const communityTemplates = [
  {
    nameTemplate: '{dept} Study Group',
    descTemplate: 'A collaborative space for {dept} students to share resources, discuss concepts, and help each other succeed in their courses.'
  },
  {
    nameTemplate: '{subject} Mastery',
    descTemplate: 'Master {subject} with comprehensive notes, practice problems, and expert guidance from experienced faculty.'
  },
  {
    nameTemplate: 'Advanced {subject}',
    descTemplate: 'Deep dive into advanced topics in {subject}. Perfect for students who want to go beyond the curriculum.'
  },
  {
    nameTemplate: '{dept} Project Hub',
    descTemplate: 'Share and collaborate on {dept} projects. Get feedback from peers and mentors.'
  },
  {
    nameTemplate: '{subject} Workshop',
    descTemplate: 'Interactive sessions and hands-on practice for {subject}. Learn by doing!'
  }
];

// Tags for communities
const communityTags = {
  'Computer Science': ['programming', 'coding', 'software', 'tech', 'cs'],
  'Electronics': ['circuits', 'hardware', 'ece', 'electronics', 'embedded'],
  'Mechanical': ['engineering', 'design', 'manufacturing', 'mech', 'cad'],
  'Civil': ['construction', 'structures', 'civil', 'infrastructure', 'surveying'],
  'Mathematics': ['math', 'calculus', 'algebra', 'statistics', 'numerical']
};

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateEmail = (name, institution) => {
  const namePart = name.toLowerCase()
    .replace('dr. ', '')
    .replace('prof. ', '')
    .split(' ')
    .join('.');
  const instPart = institution.toLowerCase()
    .replace(/\s+/g, '')
    .replace('university', 'univ')
    .replace('institute', 'inst')
    .replace('of', '')
    .replace('technology', 'tech')
    .slice(0, 8);
  return `${namePart}@${instPart}.edu.in`;
};

const generatePhone = () => {
  const prefix = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
  const randomPrefix = getRandomItem(prefix);
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  return `${randomPrefix}${randomNumber}`;
};

const generateBio = (name, specialization, experience, institution) => {
  const titles = [
    `${name.split(' ')[0]} is a dedicated educator`,
    `With ${experience} years of teaching experience`,
    `An experienced faculty member`,
    `A passionate teacher and researcher`
  ];
  
  return `${getRandomItem(titles)} specializing in ${specialization} at ${institution}. Committed to fostering student success through innovative teaching methods and collaborative learning.`;
};

const createCommunityName = (template, specialization, subject) => {
  return template.nameTemplate
    .replace('{dept}', specialization)
    .replace('{subject}', subject || getRandomItem(subjects[specialization]));
};

const createCommunityDescription = (template, specialization, subject) => {
  return template.descTemplate
    .replace('{dept}', specialization)
    .replace('{subject}', subject || getRandomItem(subjects[specialization]));
};

// Main seed function
const seedIndianTeachers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Delete existing teachers and their communities
    console.log('🗑️  Deleting existing teachers...');
    const existingTeachers = await User.find({ role: 'teacher' });
    const teacherIds = existingTeachers.map(t => t._id);
    
    if (teacherIds.length > 0) {
      // Delete communities created by teachers
      const deletedCommunities = await Community.deleteMany({ createdBy: { $in: teacherIds } });
      console.log(`   Deleted ${deletedCommunities.deletedCount} communities`);
      
      // Delete community memberships
      const deletedMemberships = await CommunityMember.deleteMany({ 
        $or: [
          { user: { $in: teacherIds } },
          { community: { $in: existingTeachers.flatMap(t => t.communities || []) } }
        ]
      });
      console.log(`   Deleted ${deletedMemberships.deletedCount} community memberships`);
      
      // Delete teachers
      const deletedTeachers = await User.deleteMany({ role: 'teacher' });
      console.log(`   Deleted ${deletedTeachers.deletedCount} teachers\n`);
    } else {
      console.log('   No existing teachers found\n');
    }

    // Step 2: Create new Indian teachers
    console.log('👨‍🏫 Creating Indian teachers...');
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const teachers = [];

    for (let i = 0; i < indianTeacherNames.length; i++) {
      const name = indianTeacherNames[i];
      const institution = getRandomItem(indianInstitutions);
      const specialization = getRandomItem(specializations);
      const qualification = getRandomItem(qualifications);
      const experience = Math.floor(Math.random() * 20) + 5; // 5-25 years
      const teacherSubjects = getRandomItems(subjects[specialization], Math.floor(Math.random() * 3) + 2); // 2-4 subjects
      
      const teacher = new User({
        name,
        email: generateEmail(name, institution),
        password: hashedPassword,
        role: 'teacher',
        qualification,
        specialization,
        institution,
        experience,
        subjects: teacherSubjects,
        phone: generatePhone(),
        bio: generateBio(name, specialization, experience, institution)
      });

      await teacher.save();
      teachers.push(teacher);
      console.log(`   ✅ ${name} - ${institution}`);
    }

    console.log(`\n✅ Created ${teachers.length} teachers\n`);

    // Step 3: Create communities for each teacher
    console.log('🏘️  Creating communities...');
    let totalCommunities = 0;

    for (const teacher of teachers) {
      const numCommunities = Math.floor(Math.random() * 3) + 2; // 2-4 communities per teacher
      
      for (let i = 0; i < numCommunities; i++) {
        const template = getRandomItem(communityTemplates);
        const subject = teacher.subjects.length > i ? teacher.subjects[i] : getRandomItem(teacher.subjects);
        
        const community = new Community({
          name: createCommunityName(template, teacher.specialization, subject),
          description: createCommunityDescription(template, teacher.specialization, subject),
          tags: getRandomItems(communityTags[teacher.specialization], 3),
          createdBy: teacher._id,
          isPrivate: Math.random() > 0.7, // 30% chance of private
          settings: {
            allowFileSharing: true,
            allowPolls: true,
            requireApproval: true, // Always true for teacher communities
            profanityFilter: true
          },
          stats: {
            totalMembers: 0,
            totalMessages: 0,
            lastActivity: new Date()
          }
        });

        await community.save();
        
        // Add teacher as admin member
        const membership = new CommunityMember({
          community: community._id,
          user: teacher._id,
          role: 'admin',
          status: 'active'
        });
        await membership.save();
        
        totalCommunities++;
      }
    }

    console.log(`✅ Created ${totalCommunities} communities\n`);

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Teachers Created: ${teachers.length}`);
    console.log(`✅ Communities Created: ${totalCommunities}`);
    console.log(`📧 All teacher passwords: teacher123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display sample login credentials
    console.log('🔐 Sample Teacher Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (let i = 0; i < Math.min(5, teachers.length); i++) {
      console.log(`   📧 Email: ${teachers[i].email}`);
      console.log(`   🔑 Password: teacher123`);
      console.log(`   👤 Name: ${teachers[i].name}`);
      console.log(`   🏫 Institution: ${teachers[i].institution}`);
      console.log(`   📚 Specialization: ${teachers[i].specialization}`);
      console.log('   ─────────────────────────────────');
    }

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seed script
seedIndianTeachers();
