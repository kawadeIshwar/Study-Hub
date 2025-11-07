import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = new PDFDocument({ size: 'A4', margin: 50 });
const outputPath = path.join(__dirname, 'StudyHub_Complete_Report.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Helper functions
function addHeader(title) {
  doc.fontSize(20).fillColor('#1e40af').text(title, { align: 'center' });
  doc.moveDown(1.5);
}

function addSubHeader(title) {
  doc.fontSize(16).fillColor('#3b82f6').text(title);
  doc.moveDown(0.8);
}

function addSubSection(title) {
  doc.fontSize(14).fillColor('#60a5fa').text(title);
  doc.moveDown(0.5);
}

function addText(text) {
  doc.fontSize(12).fillColor('#000000').text(text);
  doc.moveDown(0.5);
}

function addBullet(text) {
  doc.fontSize(11).fillColor('#000000')
    .text('• ', { continued: true })
    .text(text);
  doc.moveDown(0.3);
}

function addPageBreak() {
  doc.addPage();
}

function addImage(imagePath, caption, options = {}) {
  const defaultOptions = {
    fit: [500, 350],
    align: 'center',
    valign: 'top'
  };
  
  const imgOptions = { ...defaultOptions, ...options };
  
  try {
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, {
        fit: imgOptions.fit,
        align: imgOptions.align
      });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666666')
        .text(caption, { align: 'center', italics: true });
      doc.moveDown(1);
    } else {
      doc.fontSize(10).fillColor('#999999')
        .text(`[Screenshot: ${caption}]`, { align: 'center', italics: true });
      doc.moveDown(1);
    }
  } catch (error) {
    doc.fontSize(10).fillColor('#999999')
      .text(`[Screenshot: ${caption}]`, { align: 'center', italics: true });
    doc.moveDown(1);
  }
}

// Cover Page
doc.fontSize(30).fillColor('#1e40af').text('StudyHub', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(24).fillColor('#3b82f6').text('Project Documentation Report', { align: 'center' });
doc.moveDown(2);
doc.fontSize(14).fillColor('#000000').text('A MERN-based Educational Platform', { align: 'center' });
doc.text('for Notes Sharing and Student Collaboration', { align: 'center' });
doc.moveDown(3);
doc.fontSize(12).text('Submitted by:', { align: 'center' });
doc.fontSize(14).fillColor('#1e40af').text('Ishwar Kawade', { align: 'center' });
doc.moveDown(2);
doc.fontSize(12).fillColor('#000000').text(new Date().toLocaleDateString('en-US', { 
  year: 'numeric', month: 'long', day: 'numeric' 
}), { align: 'center' });

addPageBreak();

// Table of Contents
addHeader('Table of Contents');
doc.fontSize(12).fillColor('#000000');
const toc = [
  { no: '1', title: 'Introduction', page: '4' },
  { no: '1.1', title: 'Existing System and Need for System', page: '4' },
  { no: '1.2', title: 'Scope of System', page: '4' },
  { no: '1.3', title: 'Operating Environment', page: '4' },
  { no: '2', title: 'Proposed System', page: '5' },
  { no: '2.1', title: 'Feasibility Study', page: '5' },
  { no: '2.2', title: 'Objectives', page: '5' },
  { no: '2.3', title: 'Users of System', page: '5' },
  { no: '3', title: 'Analysis and Design', page: '6' },
  { no: '3.1', title: 'System Requirements', page: '6' },
  { no: '3.2', title: 'Module Hierarchy Diagram', page: '7' },
  { no: '3.3', title: 'Sample Screens', page: '8' },
  { no: '4', title: 'Coding', page: '9' },
  { no: '5', title: 'Limitations', page: '10' },
  { no: '6', title: 'Enhancements', page: '10' },
  { no: '7', title: 'Conclusion', page: '11' }
];

toc.forEach(item => {
  doc.text(`${item.no}  ${item.title}`, 70, doc.y, { continued: true, width: 400 });
  doc.text(item.page, { align: 'right' });
  doc.moveDown(0.3);
});

addPageBreak();

// Section 1
addHeader('1. Introduction');
addText('StudyHub is a MERN stack web application for educational content sharing and collaboration.');
addSubSection('1.1 Existing System and Need for System');
addText('Traditional systems lack:');
addBullet('Centralized note sharing platforms');
addBullet('Real-time collaboration features');
addBullet('Community-driven learning');
addSubSection('1.2 Scope of System');
addBullet('User authentication and authorization');
addBullet('Notes upload/download system');
addBullet('Community forums with real-time chat');
addBullet('Poll and notification systems');
addSubSection('1.3 Operating Environment');
doc.fontSize(12).fillColor('#1e40af').text('Hardware:');
addBullet('Processor: Intel Core i3+');
addBullet('RAM: 4GB minimum');
addBullet('Storage: 500MB+');
doc.fontSize(12).fillColor('#1e40af').text('Software:');
addBullet('Node.js v14+');
addBullet('MongoDB v4.4+');
addBullet('Modern web browser');

addPageBreak();

// Section 2
addHeader('2. Proposed System');
addSubSection('2.1 Feasibility Study');
addText('Technical: MERN stack provides robust framework');
addText('Economic: Open-source technologies reduce costs');
addText('Operational: Intuitive UI ensures easy adoption');
addSubSection('2.2 Objectives');
addBullet('Centralized educational content platform');
addBullet('Real-time student-teacher collaboration');
addBullet('Organized subject-specific communities');
addBullet('Secure authentication system');
addSubSection('2.3 Users of System');
addBullet('Students: Upload/download notes, join communities');
addBullet('Teachers: Share content, manage materials');

addPageBreak();

// Section 3
addHeader('3. Analysis and Design');
addSubSection('3.1 System Requirements');
doc.fontSize(12).fillColor('#1e40af').text('Functional:');
addBullet('User registration and authentication');
addBullet('Notes upload with metadata');
addBullet('Search and filter functionality');
addBullet('Community forums and messaging');
addBullet('Poll creation and voting');
doc.fontSize(12).fillColor('#1e40af').text('Non-Functional:');
addBullet('Performance: <3s page load');
addBullet('Scalability: 10,000+ users');
addBullet('Security: Encrypted data');
addBullet('99.5% uptime');

addPageBreak();

addSubSection('3.2 Module Hierarchy');
doc.fontSize(12).fillColor('#1e40af').text('Frontend:');
addBullet('Authentication, Home, Notes, Communities, Profile');
doc.fontSize(12).fillColor('#1e40af').text('Backend:');
addBullet('Auth Service, Notes Management, Community Service');
addBullet('Messaging, Notifications, Polls');

addPageBreak();

// Section 3.3 with Screenshots
addSubSection('3.3 Sample Input and Output Screens');

// Check for screenshots
const screenshotsDir = path.join(__dirname, 'screenshots');
const screenshots = [
  { file: 'home.png', caption: 'Home Page - Landing page with features' },
  { file: 'login.png', caption: 'Login Page - User authentication' },
  { file: 'notes.png', caption: 'Notes Page - Browse and search notes' },
  { file: 'upload.png', caption: 'Upload Page - Upload study materials' },
  { file: 'communities.png', caption: 'Communities - Available forums' },
  { file: 'community-detail.png', caption: 'Community Detail - Real-time chat' },
  { file: 'profile.png', caption: 'User Profile - Statistics and content' },
  { file: 'teacher-dashboard.png', caption: 'Teacher Dashboard - Content management' }
];

screenshots.forEach((screenshot, index) => {
  const imagePath = path.join(screenshotsDir, screenshot.file);
  
  if (index > 0 && index % 2 === 0) {
    addPageBreak();
  }
  
  doc.fontSize(11).fillColor('#1e40af').text(`Figure ${index + 1}: ${screenshot.caption}`);
  doc.moveDown(0.3);
  addImage(imagePath, screenshot.caption);
  doc.moveDown(0.5);
});

addPageBreak();

// Section 4
addHeader('4. Coding');
addSubSection('4.1 Technology Stack');
addBullet('Frontend: React 19, TailwindCSS, Material-UI');
addBullet('Backend: Node.js, Express 5, MongoDB');
addBullet('Real-time: Socket.IO 4.8');
addBullet('Auth: JWT, Bcrypt');
addBullet('Storage: Cloudinary');

doc.moveDown(0.5);
doc.fontSize(11).fillColor('#000000').text('Key Features:');
doc.font('Courier').fontSize(9);
doc.text(`
// Server Setup
import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(compression());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
`, { indent: 20 });
doc.font('Helvetica');

addPageBreak();

// Section 5
addHeader('5. Limitations');
addBullet('Limited to PDFs (no video support)');
addBullet('Requires stable internet');
addBullet('50MB file size limit');
addBullet('Basic search functionality');
addBullet('No offline access');

addPageBreak();

// Section 6
addHeader('6. Proposed Enhancements');
addBullet('Video lecture support');
addBullet('AI-powered recommendations');
addBullet('Mobile applications');
addBullet('Offline PWA mode');
addBullet('Advanced analytics');
addBullet('Gamification features');
addBullet('Multi-language support');

addPageBreak();

// Section 7
addHeader('7. Conclusion');
addText('StudyHub successfully provides a comprehensive educational platform with:');
addBullet('Seamless user experience');
addBullet('Real-time collaboration');
addBullet('Scalable architecture');
addBullet('Secure content management');
doc.moveDown(1);
addText('The platform demonstrates strong potential for growth and has successfully met its core objectives.');
doc.moveDown(1.5);
doc.fontSize(11).fillColor('#1e40af').text('Deployed at: ', { continued: true });
doc.fillColor('#0000FF').text('https://studyhub4all.netlify.app', { link: 'https://studyhub4all.netlify.app' });

doc.moveDown(2);
doc.fontSize(10).fillColor('#666666').text('--- End of Report ---', { align: 'center' });

doc.end();

console.log('✅ Complete PDF Report with screenshots generated!');
console.log(`📄 Location: ${outputPath}`);
console.log('\nNote: If screenshots are missing, place them in the screenshots/ folder and run again.');
