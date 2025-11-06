import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Note from '../models/Note.js';

dotenv.config();

// Note templates with subject-specific content
const noteTemplates = {
  'Computer Science': [
    { title: 'Data Structures Complete Notes', subject: 'Data Structures', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs'] },
    { title: 'Algorithms - Sorting & Searching', subject: 'Algorithms', topics: ['Quick Sort', 'Merge Sort', 'Binary Search'] },
    { title: 'DBMS Complete Guide', subject: 'Database Management', topics: ['SQL', 'Normalization', 'Transactions'] },
    { title: 'Operating Systems Concepts', subject: 'Operating Systems', topics: ['Process', 'Threads', 'Memory Management'] },
    { title: 'Computer Networks Fundamentals', subject: 'Computer Networks', topics: ['TCP/IP', 'OSI Model', 'Routing'] },
    { title: 'Software Engineering Best Practices', subject: 'Software Engineering', topics: ['SDLC', 'Agile', 'Testing'] },
    { title: 'Machine Learning Introduction', subject: 'Machine Learning', topics: ['Supervised Learning', 'Neural Networks'] },
    { title: 'Web Development Full Stack', subject: 'Web Development', topics: ['HTML', 'CSS', 'JavaScript', 'React'] },
    { title: 'Object Oriented Programming in Java', subject: 'OOP', topics: ['Classes', 'Inheritance', 'Polymorphism'] },
    { title: 'Python Programming Complete Notes', subject: 'Programming', topics: ['Python Basics', 'Data Types', 'Functions'] }
  ],
  'Electronics': [
    { title: 'Digital Electronics Fundamentals', subject: 'Digital Electronics', topics: ['Logic Gates', 'Flip Flops', 'Counters'] },
    { title: 'Microprocessor 8086 Architecture', subject: 'Microprocessors', topics: ['8086', 'Assembly Language', 'Interrupts'] },
    { title: 'VLSI Design Complete Guide', subject: 'VLSI Design', topics: ['CMOS', 'Layout Design', 'Fabrication'] },
    { title: 'Communication Systems Notes', subject: 'Communication Systems', topics: ['Modulation', 'AM', 'FM', 'Digital Comm'] },
    { title: 'Signal Processing Fundamentals', subject: 'Signal Processing', topics: ['Fourier Transform', 'Filters', 'Sampling'] },
    { title: 'Embedded Systems Complete Notes', subject: 'Embedded Systems', topics: ['Microcontrollers', 'ARM', 'Real-time OS'] }
  ],
  'Mechanical': [
    { title: 'Thermodynamics Laws & Applications', subject: 'Thermodynamics', topics: ['Laws of Thermodynamics', 'Heat Transfer'] },
    { title: 'Fluid Mechanics Complete Guide', subject: 'Fluid Mechanics', topics: ['Flow Dynamics', 'Bernoulli', 'Viscosity'] },
    { title: 'Manufacturing Processes', subject: 'Manufacturing Processes', topics: ['Casting', 'Welding', 'Machining'] },
    { title: 'Machine Design Fundamentals', subject: 'Machine Design', topics: ['Design Process', 'Stress Analysis', 'Gears'] },
    { title: 'CAD/CAM Complete Notes', subject: 'CAD/CAM', topics: ['AutoCAD', 'CNC', 'Rapid Prototyping'] },
    { title: 'Automobile Engineering Basics', subject: 'Automobile Engineering', topics: ['Engine', 'Transmission', 'Chassis'] }
  ],
  'Civil': [
    { title: 'Structural Analysis Methods', subject: 'Structural Analysis', topics: ['Beams', 'Trusses', 'Frames'] },
    { title: 'Surveying Complete Guide', subject: 'Surveying', topics: ['Chain Survey', 'Levelling', 'Total Station'] },
    { title: 'Construction Management', subject: 'Construction Management', topics: ['Planning', 'Scheduling', 'Cost Estimation'] },
    { title: 'Geotechnical Engineering', subject: 'Geotechnical Engineering', topics: ['Soil Mechanics', 'Foundation Design'] },
    { title: 'Transportation Engineering', subject: 'Transportation Engineering', topics: ['Highway Design', 'Traffic Engineering'] },
    { title: 'Environmental Engineering', subject: 'Environmental Engineering', topics: ['Water Treatment', 'Pollution Control'] }
  ],
  'Mathematics': [
    { title: 'Calculus Complete Notes', subject: 'Calculus', topics: ['Differentiation', 'Integration', 'Limits'] },
    { title: 'Linear Algebra Fundamentals', subject: 'Linear Algebra', topics: ['Matrices', 'Vectors', 'Eigenvalues'] },
    { title: 'Differential Equations', subject: 'Differential Equations', topics: ['ODE', 'PDE', 'Laplace Transform'] },
    { title: 'Probability & Statistics', subject: 'Probability and Statistics', topics: ['Probability', 'Distributions', 'Hypothesis'] },
    { title: 'Discrete Mathematics', subject: 'Discrete Mathematics', topics: ['Set Theory', 'Graph Theory', 'Combinatorics'] },
    { title: 'Complex Analysis', subject: 'Complex Analysis', topics: ['Complex Numbers', 'Analytic Functions'] }
  ]
};

// File formats
const formats = ['PDF', 'DOCX', 'PPTX', 'PDF', 'PDF']; // More PDFs

// Semesters
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

// Sample file URLs (you can replace with actual uploaded files)
const sampleFileUrls = [
  'https://example.com/notes/sample1.pdf',
  'https://example.com/notes/sample2.pdf',
  'https://example.com/notes/sample3.pdf',
  'https://example.com/notes/sample4.pdf',
  'https://example.com/notes/sample5.pdf'
];

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Generate additional tags based on content
const generateTags = (subject, topics, semester) => {
  const baseTags = [subject.toLowerCase().replace(/\s+/g, '-'), 'teacher-notes'];
  const topicTags = topics.slice(0, 2).map(t => t.toLowerCase().replace(/\s+/g, '-'));
  const semesterTag = `semester-${semester}`;
  const additionalTags = ['notes', 'study-material', 'lecture-notes'];
  
  return [...new Set([...baseTags, ...topicTags, semesterTag, ...additionalTags])];
};

// Main seed function
const seedTeacherNotes = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all teachers
    console.log('👨‍🏫 Fetching teachers...');
    const teachers = await User.find({ role: 'teacher' });
    
    if (teachers.length === 0) {
      console.log('❌ No teachers found in database!');
      console.log('💡 Please run: npm run seed-teachers first.\n');
      process.exit(1);
    }

    console.log(`✅ Found ${teachers.length} teachers\n`);

    // Create notes for each teacher based on their specialization
    console.log('📚 Creating teacher notes...');
    let totalNotes = 0;
    const createdNotes = [];

    for (const teacher of teachers) {
      const specialization = teacher.specialization;
      const templates = noteTemplates[specialization] || noteTemplates['Computer Science'];
      
      // Each teacher uploads 3-6 notes
      const numNotes = getRandomNumber(3, 6);
      const selectedTemplates = [];
      
      // Select random templates
      for (let i = 0; i < numNotes && i < templates.length; i++) {
        selectedTemplates.push(templates[i]);
      }
      
      for (const template of selectedTemplates) {
        const semester = getRandomItem(semesters);
        const format = getRandomItem(formats);
        const likes = getRandomNumber(5, 150);
        const tags = generateTags(template.subject, template.topics, semester);
        
        const note = new Note({
          title: template.title,
          subject: template.subject,
          semester: semester,
          tags: tags,
          fileUrl: getRandomItem(sampleFileUrls),
          format: format,
          uploader: teacher._id,
          uploaderRole: 'teacher',
          likes: likes,
          date: getRandomDate(90) // Random date within last 90 days
        });

        await note.save();
        totalNotes++;
        
        createdNotes.push({
          title: template.title,
          teacher: teacher.name,
          subject: template.subject,
          semester: semester,
          likes: likes
        });
        
        console.log(`   ✅ ${template.title} (by ${teacher.name}) - ${likes} likes`);
      }
    }

    console.log(`\n✅ Created ${totalNotes} notes from teachers\n`);

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Teachers Contributing: ${teachers.length}`);
    console.log(`✅ Total Notes Uploaded: ${totalNotes}`);
    console.log(`📚 Available in Explore Page: Yes`);
    console.log(`👨‍🏫 All uploaded by Teachers`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show top notes by likes
    console.log('⭐ Top Notes by Likes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const topNotes = createdNotes.sort((a, b) => b.likes - a.likes).slice(0, 10);
    topNotes.forEach((note, idx) => {
      console.log(`${idx + 1}. ${note.title}`);
      console.log(`   👨‍🏫 ${note.teacher} | 📚 ${note.subject} | Sem ${note.semester} | ❤️ ${note.likes} likes`);
      console.log('   ─────────────────────────────────');
    });

    // Subject distribution
    const subjectCount = {};
    createdNotes.forEach(note => {
      subjectCount[note.subject] = (subjectCount[note.subject] || 0) + 1;
    });

    console.log('\n📊 Notes by Subject:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(subjectCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([subject, count]) => {
        console.log(`   ${subject}: ${count} notes`);
      });

    console.log('\n✨ Teacher notes seeding completed successfully!');
    console.log('💡 Notes are now visible in the Explore page!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seed script
seedTeacherNotes();
