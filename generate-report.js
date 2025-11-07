import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new PDF document
const doc = new PDFDocument({ size: 'A4', margin: 50 });

// Output path
const outputPath = path.join(__dirname, 'StudyHub_Project_Report.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Helper functions
function addPageNumber(doc) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(10).fillColor('#666666')
      .text(`Page ${i + 1}`, 50, doc.page.height - 50, { align: 'center' });
  }
}

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

function addText(text, options = {}) {
  doc.fontSize(12).fillColor('#000000').text(text, options);
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
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}), { align: 'center' });

addPageBreak();

// Table of Contents
addHeader('Table of Contents');
doc.fontSize(12).fillColor('#000000');

const toc = [
  { no: '1', title: 'Introduction', page: '4' },
  { no: '1.1', title: 'Existing System and Need for System', page: '4' },
  { no: '1.2', title: 'Scope of System', page: '4' },
  { no: '1.3', title: 'Operating Environment – Hardware and Software', page: '4' },
  { no: '2', title: 'Proposed System', page: '5' },
  { no: '2.1', title: 'Feasibility Study', page: '5' },
  { no: '2.2', title: 'Objectives of Proposed System', page: '5' },
  { no: '2.3', title: 'Users of System', page: '5' },
  { no: '3', title: 'Analysis and Design', page: '6' },
  { no: '3.1', title: 'System Requirements (Functional and Non-Functional)', page: '6' },
  { no: '3.2', title: 'Module Hierarchy Diagram', page: '6-7' },
  { no: '3.3', title: 'Sample Input and Output Screens', page: '7-8' },
  { no: '4', title: 'Coding', page: '9' },
  { no: '4.1', title: 'Code Snippets', page: '9' },
  { no: '5', title: 'Limitations of Proposed System', page: '10' },
  { no: '6', title: 'Proposed Enhancements', page: '10' },
  { no: '7', title: 'Conclusion', page: '10' }
];

toc.forEach(item => {
  doc.text(`${item.no}  ${item.title}`, 70, doc.y, { 
    continued: true,
    width: 400 
  });
  doc.text(item.page, { align: 'right' });
  doc.moveDown(0.3);
});

addPageBreak();

// Section 1: Introduction
addHeader('1. Introduction');
addText('StudyHub is a comprehensive MERN (MongoDB, Express.js, React, Node.js) stack web application designed to facilitate educational content sharing and collaboration among students and teachers. The platform enables seamless sharing of study materials, real-time communication, and community-driven learning.');

addSubSection('1.1 Existing System and Need for System');
addText('Traditional educational systems face several challenges:');
addBullet('Limited accessibility to quality study materials');
addBullet('Lack of centralized platforms for note sharing');
addBullet('Inefficient communication between students and teachers');
addBullet('No organized community-driven learning environment');
addBullet('Difficulty in finding subject-specific resources');
doc.moveDown(0.5);
addText('StudyHub addresses these challenges by providing a unified platform for educational resource sharing and collaboration.');

addSubSection('1.2 Scope of System');
addText('The StudyHub system encompasses the following features:');
addBullet('User authentication and role-based access (Students and Teachers)');
addBullet('Upload and download study materials (notes, PDFs, documents)');
addBullet('Community-based discussion forums');
addBullet('Real-time messaging using Socket.IO');
addBullet('Poll creation and voting system');
addBullet('Notification system for community activities');
addBullet('Teacher dashboard for content management');
addBullet('User profile management');
addBullet('Search and filter functionality for notes');

addSubSection('1.3 Operating Environment – Hardware and Software');
doc.fontSize(13).fillColor('#1e40af').text('Hardware Requirements:');
doc.fontSize(11).fillColor('#000000');
addBullet('Processor: Intel Core i3 or higher');
addBullet('RAM: Minimum 4GB (8GB recommended)');
addBullet('Storage: Minimum 500MB free space');
addBullet('Internet connection: Broadband (minimum 2 Mbps)');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Software Requirements:');
doc.fontSize(11).fillColor('#000000');
addBullet('Operating System: Windows 10/11, macOS, or Linux');
addBullet('Node.js: v14.0.0 or higher');
addBullet('MongoDB: v4.4 or higher');
addBullet('Web Browser: Chrome, Firefox, Safari, or Edge (latest versions)');
addBullet('Code Editor: VS Code, Sublime Text, or similar');

addPageBreak();

// Section 2: Proposed System
addHeader('2. Proposed System');
addText('StudyHub is proposed as a modern, scalable, and user-friendly educational platform that leverages the MERN stack to provide a seamless experience for students and teachers.');

addSubSection('2.1 Feasibility Study');
doc.fontSize(13).fillColor('#1e40af').text('Technical Feasibility:');
doc.fontSize(11).fillColor('#000000');
addBullet('MERN stack provides robust and proven technologies');
addBullet('Cloud deployment ensures scalability and accessibility');
addBullet('Real-time features achievable with Socket.IO');
addBullet('Cloudinary integration for efficient file management');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Economic Feasibility:');
doc.fontSize(11).fillColor('#000000');
addBullet('Open-source technologies reduce development costs');
addBullet('Cloud hosting provides cost-effective scaling');
addBullet('Minimal maintenance overhead with modern frameworks');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Operational Feasibility:');
doc.fontSize(11).fillColor('#000000');
addBullet('Intuitive user interface ensures easy adoption');
addBullet('Responsive design works across all devices');
addBullet('Minimal training required for end users');

addSubSection('2.2 Objectives of Proposed System');
addBullet('Create a centralized platform for educational content sharing');
addBullet('Enable real-time collaboration between students and teachers');
addBullet('Provide organized community forums for subject-specific discussions');
addBullet('Facilitate easy upload, search, and download of study materials');
addBullet('Implement secure authentication and authorization');
addBullet('Deliver responsive and accessible user experience');
addBullet('Enable teachers to manage and share educational content');

addSubSection('2.3 Users of System');
doc.fontSize(13).fillColor('#1e40af').text('Primary Users:');
doc.fontSize(11).fillColor('#000000');
addBullet('Students: Upload/download notes, participate in communities, chat with peers');
addBullet('Teachers: Share educational content, manage notes, interact with students');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Secondary Users:');
doc.fontSize(11).fillColor('#000000');
addBullet('Educational Institutions: Monitor and promote academic collaboration');
addBullet('Administrators: Manage platform content and user activities');

addPageBreak();

// Section 3: Analysis and Design
addHeader('3. Analysis and Design');

addSubSection('3.1 System Requirements');
doc.fontSize(13).fillColor('#1e40af').text('Functional Requirements:');
doc.fontSize(11).fillColor('#000000');
addBullet('User Registration and Authentication (JWT-based)');
addBullet('Role-based access control (Student/Teacher)');
addBullet('Upload notes with metadata (subject, semester, branch)');
addBullet('Search and filter notes by various parameters');
addBullet('Download notes in multiple formats');
addBullet('Create and join community forums');
addBullet('Real-time messaging within communities');
addBullet('Create polls and vote on community topics');
addBullet('Notification system for updates');
addBullet('User profile management with statistics');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Non-Functional Requirements:');
doc.fontSize(11).fillColor('#000000');
addBullet('Performance: Page load time < 3 seconds');
addBullet('Scalability: Support for 10,000+ concurrent users');
addBullet('Security: Encrypted passwords, secure token management');
addBullet('Reliability: 99.5% uptime');
addBullet('Usability: Intuitive UI with minimal learning curve');
addBullet('Compatibility: Cross-browser and cross-device support');
addBullet('Maintainability: Modular code architecture');

addSubSection('3.2 Module Hierarchy Diagram');
doc.fontSize(11).fillColor('#000000');
addText('The system is organized into the following modules:');

doc.fontSize(13).fillColor('#1e40af').text('Frontend Modules:');
doc.fontSize(11).fillColor('#000000');
addBullet('Authentication Module (Login, Signup, Teacher Signup)');
addBullet('Home Module (Landing page, Features showcase)');
addBullet('Notes Module (Upload, Browse, Search, Download)');
addBullet('Communities Module (Browse, Join, Create, Discussion)');
addBullet('Profile Module (User stats, Settings, Activity)');
addBullet('Teacher Dashboard Module (Content management)');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Backend Modules:');
doc.fontSize(11).fillColor('#000000');
addBullet('Authentication Service (JWT, Bcrypt)');
addBullet('User Management Service');
addBullet('Notes Management Service (Upload, Delete, Retrieve)');
addBullet('Community Service (CRUD operations)');
addBullet('Messaging Service (Socket.IO)');
addBullet('Notification Service');
addBullet('Poll Service');
addBullet('Teacher Service');

doc.moveDown(0.5);
doc.fontSize(13).fillColor('#1e40af').text('Database Schema:');
doc.fontSize(11).fillColor('#000000');
addBullet('Users Collection (authentication, profile data)');
addBullet('Notes Collection (study materials metadata)');
addBullet('Communities Collection (forum data)');
addBullet('Messages Collection (chat history)');
addBullet('Polls Collection (voting data)');
addBullet('Notifications Collection (user alerts)');

addPageBreak();

addSubSection('3.3 Sample Input and Output Screens');
addText('Note: Screenshots of the application would be inserted here showing:');
doc.moveDown(0.3);
addBullet('Home Page - Landing page with features and call-to-action');
addBullet('Login/Signup Page - User authentication interface');
addBullet('Notes Page - Browse and search notes with filters');
addBullet('Upload Page - Form for uploading study materials');
addBullet('Communities Page - List of available communities');
addBullet('Community Detail Page - Discussion forum with real-time chat');
addBullet('Profile Page - User statistics and uploaded content');
addBullet('Teacher Dashboard - Content management interface');

doc.moveDown(1);
doc.fontSize(11).fillColor('#666666').text('[Screenshots would be placed in this section showing the actual UI of the application]', { 
  align: 'center', 
  italics: true 
});

addPageBreak();

// Section 4: Coding
addHeader('4. Coding');
addText('StudyHub is built using modern web technologies with clean, maintainable code architecture.');

addSubSection('4.1 Code Snippets');

doc.fontSize(13).fillColor('#1e40af').text('Technology Stack:');
doc.fontSize(11).fillColor('#000000');
addBullet('Frontend: React 19.1.0, React Router, Material-UI, TailwindCSS');
addBullet('Backend: Node.js, Express 5.1.0, MongoDB, Mongoose');
addBullet('Real-time: Socket.IO 4.8.1');
addBullet('Authentication: JWT, Bcrypt');
addBullet('File Storage: Cloudinary');
addBullet('Additional: Compression, CORS, Multer, Nodemailer');

doc.moveDown(0.8);
doc.fontSize(13).fillColor('#1e40af').text('Key Code Implementations:');
doc.fontSize(10).fillColor('#000000');

addText('Server Configuration (server.js):');
doc.font('Courier').fontSize(9).fillColor('#333333');
doc.text(`
import express from 'express';
import mongoose from 'mongoose';
import socketIO from 'socket.io';
import compression from 'compression';

const app = express();
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/communities', communityRoutes);
`, { indent: 20 });

doc.font('Helvetica').fontSize(11);
doc.moveDown(0.8);

addText('Frontend Routing (App.jsx):');
doc.font('Courier').fontSize(9).fillColor('#333333');
doc.text(`
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/communities" element={<Communities />} />
      </Routes>
    </BrowserRouter>
  );
}
`, { indent: 20 });

doc.font('Helvetica').fontSize(11);
addPageBreak();

// Section 5: Limitations
addHeader('5. Limitations of Proposed System');
addBullet('Limited to text-based notes and PDFs (no video support currently)');
addBullet('Requires stable internet connection for real-time features');
addBullet('File upload size restricted to 50MB');
addBullet('Search functionality limited to metadata (not full-text search)');
addBullet('No offline access to downloaded notes');
addBullet('Community moderation features are basic');
addBullet('No built-in plagiarism detection for uploaded content');

addPageBreak();

// Section 6: Proposed Enhancements
addHeader('6. Proposed Enhancements');
addBullet('Video lecture upload and streaming capabilities');
addBullet('AI-powered content recommendation system');
addBullet('Advanced search with full-text indexing');
addBullet('Mobile applications (iOS and Android)');
addBullet('Offline mode with progressive web app (PWA)');
addBullet('Integration with popular LMS platforms');
addBullet('Advanced analytics and progress tracking');
addBullet('Gamification features (badges, leaderboards)');
addBullet('Multi-language support');
addBullet('Content versioning and collaboration features');
addBullet('Integration with citation management tools');
addBullet('Automated content quality assessment');

addPageBreak();

// Section 7: Conclusion
addHeader('7. Conclusion');
addText('StudyHub successfully addresses the need for a centralized, collaborative educational platform. By leveraging modern web technologies (MERN stack), the system provides:');
doc.moveDown(0.3);
addBullet('Seamless user experience across devices');
addBullet('Real-time collaboration features');
addBullet('Scalable architecture for future growth');
addBullet('Secure and efficient content management');
doc.moveDown(0.5);

addText('The platform has demonstrated its capability to facilitate knowledge sharing among students and teachers, creating a vibrant learning community. With planned enhancements, StudyHub has the potential to become a comprehensive educational ecosystem.');

doc.moveDown(1);
addText('The project successfully meets its core objectives of providing an accessible, user-friendly platform for educational content sharing while maintaining high standards of code quality, security, and performance.');

doc.moveDown(1.5);
doc.fontSize(12).fillColor('#1e40af').text('Project URL:', { continued: true });
doc.fillColor('#000000').text(' https://studyhub4all.netlify.app');

doc.moveDown(0.5);
doc.fontSize(12).fillColor('#1e40af').text('Repository:', { continued: true });
doc.fillColor('#000000').text(' StudyHub GitHub Repository');

doc.moveDown(2);
doc.fontSize(10).fillColor('#666666').text('--- End of Report ---', { align: 'center' });

// Finalize PDF
doc.end();

console.log('✅ PDF Report generated successfully!');
console.log(`📄 Location: ${outputPath}`);
