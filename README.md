# StudyHub - Full-Stack Student Collaboration Platform

A comprehensive MERN-based platform for students to share notes, collaborate in communities, and engage in real-time chat. Features include community management, file sharing, real-time messaging, polls, and AI-powered doubt solving.

## Features

### 🏘️ Community Management
- **Community Discovery**: Browse and search communities by subject/tags
- **Create Communities**: Set up new study groups with custom names, descriptions, and tags
- **Membership System**: Join/leave communities with role-based permissions (Admin, Moderator, Member)
- **Online Status**: See who's currently online in each community

### 💬 Real-time Chat (NEW!)
- **Live Messaging**: Real-time chat using Socket.io in every community
- **File Sharing**: Share PDFs, images, and documents
- **Meeting Links**: Auto-detect Google Meet/Zoom links with "Join Meeting" buttons
- **Rich Text**: Emoji support and message formatting
- **Threaded Replies**: Reply to specific messages to keep conversations organized
- **Typing Indicators**: See when members are typing in real-time
- **Online Status**: View which community members are currently online
- **Message Actions**: Delete, pin, and reply to messages with appropriate permissions

### 🤖 Smart Features
- **AI Doubt Solver**: Automatically summarizes doubts from chat and suggests solutions
- **Message Tagging**: Tag messages as "Doubt", "Solution", or "Resource"
- **Pinned Messages**: Pin important notes and meeting links
- **Polls & Q&A**: Create polls for group decisions and Q&A sessions

### 📚 Notes Sharing
- **Upload Notes**: Share study materials with the community (PDF, DOCX, images)
- **Browse Notes**: Search and filter notes by subject, semester, and tags
- **Download**: Access notes uploaded by other students
- **User Profiles**: View notes uploaded by specific users

### 👤 User Management (NEW!)
- **User Profiles**: View and edit personal profile information
- **Statistics**: Track notes uploaded and communities joined
- **Password Management**: Secure password updates
- **Activity Tracking**: View user's notes and community memberships

### 🔔 Notifications
- **Real-time Push**: Get notified about new messages and pinned content
- **Email Digests**: Daily/weekly email summaries of community highlights
- **Smart Filtering**: Filter notifications by type (mentions, polls, meetings)
- **Mark as Read**: Manage notification states efficiently

### 🎨 UI/UX
- **Modern Design**: Clean, student-friendly interface with Tailwind CSS
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Community Cards**: Beautiful grid layout with cover images

### 🔒 Security & Moderation
- **Profanity Filter**: Automatic content filtering with role-based permissions
- **Admin Controls**: Remove inappropriate messages and manage members
- **Authentication**: Secure JWT-based authentication
- **Role-based Access**: Different permissions for admins, moderators, and members

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Cloudinary** for file storage
- **Nodemailer** for email notifications
- **Bad-words** for profanity filtering

### Frontend
- **React** with functional components and hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Context API** for state management
- **Socket.io Client** for real-time features

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyhub
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/studyhub
   JWT_SECRET=your-jwt-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Users (NEW!)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/:userId/notes` - Get user's notes
- `GET /api/users/:userId/communities` - Get user's communities

### Notes
- `POST /api/upload` - Upload a note
- `GET /api/upload/all` - Get all notes
- `DELETE /api/notes/:noteId` - Delete a note

### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create new community
- `GET /api/communities/:id` - Get community details
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

### Messages
- `GET /api/messages/:communityId` - Get community messages
- `POST /api/messages/:communityId` - Send message
- `PUT /api/messages/:messageId/pin` - Pin/unpin message
- `DELETE /api/messages/:messageId` - Delete message

### Polls
- `GET /api/polls/:communityId` - Get community polls
- `POST /api/polls/:communityId` - Create poll
- `POST /api/polls/:pollId/vote` - Vote on poll

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Models

### User
- Authentication and profile information
- Notification preferences
- Community memberships

### Community
- Community details and settings
- Member statistics
- Content moderation settings

### Message
- Chat messages with metadata
- File attachments and meeting links
- Threaded replies and pins

### Poll
- Poll questions and options
- Voting results and analytics
- Expiration settings

### Notification
- User notifications with types
- Read/unread status
- Email delivery tracking

## Real-time Events

### Socket.io Events
- `join-community` - Join community room
- `leave-community` - Leave community room
- `send-message` - Send new message
- `typing` - Show typing indicator
- `message-pinned` - Message pinned/unpinned
- `poll-created` - New poll created
- `member-joined` - New member joined
- `member-left` - Member left community

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Chat Feature Implementation

The real-time chat feature is fully integrated into every community. For detailed documentation on the chat system:

- **Backend Implementation**: See `backend/socket.js` for Socket.io server setup
- **Frontend Implementation**: See `frontend/src/components/CommunityChat.jsx` for the chat UI
- **Socket Service**: See `frontend/src/services/socket.js` for the client-side Socket.io wrapper
- **Complete Guide**: See `CHAT_FEATURE_GUIDE.md` for detailed usage and API documentation

### Chat Features
- Real-time message delivery
- Typing indicators
- Online/offline status
- Message threading (replies)
- Pin/unpin messages (Admin/Moderator)
- Delete messages (Admin/Moderator or message author)
- File attachments
- Date-based message grouping
- Automatic scroll to latest messages

## Documentation

- **API Documentation**: See `backend/API_DOCUMENTATION.md` for complete REST API reference
- **Chat Guide**: See `CHAT_FEATURE_GUIDE.md` for chat feature documentation
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md` for technical overview

## Support

For support or questions:
- Check the documentation files in the repository
- Review the API documentation
- Check browser console and server logs for debugging
- Verify all environment variables are properly set

## Acknowledgments

- Built with love for the student community
- Special thanks to all contributors and beta testers
- Powered by modern web technologies and the MERN stack