# StudyHub Chat Feature - Implementation Guide

## Overview
The StudyHub platform now includes a fully functional real-time chat feature for community members. This allows enrolled students to communicate seamlessly within their communities.

## Features

### ✅ Real-Time Messaging
- Instant message delivery using Socket.io
- Live updates without page refresh
- Connection status indicators

### ✅ Rich Chat Features
- **Text Messages**: Send and receive text messages
- **File Sharing**: Upload and share files (images, documents, etc.)
- **Message Replies**: Reply to specific messages with threading
- **Message Reactions**: Add emoji reactions to messages
- **Pinned Messages**: Pin important messages (Admin/Moderator only)
- **Message Deletion**: Delete your own messages or moderate others (Admin/Moderator)

### ✅ User Experience
- **Typing Indicators**: See when other members are typing
- **Online Status**: View which members are currently online
- **Date Separators**: Messages grouped by date for better readability
- **Scroll to Bottom**: Auto-scroll to latest messages
- **Member List**: View all community members with their roles and online status

### ✅ Moderation Tools
- **Role-Based Permissions**: Admin and Moderator privileges
- **Pin/Unpin Messages**: Highlight important announcements
- **Delete Messages**: Remove inappropriate content
- **Profanity Filter**: Automatic content moderation (configurable per community)

## Architecture

### Backend
```
backend/
├── socket.js                 # Socket.io server configuration
├── models/
│   ├── Message.js           # Message schema
│   ├── Community.js         # Community schema
│   └── CommunityMember.js   # Membership schema
├── routes/
│   ├── messages.js          # Message REST API endpoints
│   ├── communities.js       # Community management
│   └── users.js             # User profile management
└── utils/
    └── profanityFilter.js   # Content moderation
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   └── CommunityChat.jsx     # Main chat component
│   ├── services/
│   │   └── socket.js             # Socket.io client service
│   └── pages/
│       └── CommunityDetail.jsx   # Community page with chat
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies** (already installed):
```bash
cd backend
npm install socket.io cors express mongoose jwt jsonwebtoken
```

2. **Environment Variables**:
Update your `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

3. **Start Backend Server**:
```bash
npm run server
```

The server will start on port 5000 with Socket.io enabled.

### Frontend Setup

1. **Install Dependencies** (already installed):
```bash
cd frontend
npm install socket.io-client axios react-toastify
```

2. **Environment Variables**:
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

3. **Start Frontend**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### For Students

1. **Join a Community**:
   - Navigate to Communities page
   - Click "Join" on any community
   - Access the community chat

2. **Send Messages**:
   - Type your message in the input box
   - Press Enter or click Send button
   - Messages appear instantly for all members

3. **Reply to Messages**:
   - Click the reply icon on any message
   - Your message will be linked to the original

4. **React to Messages**:
   - Hover over a message
   - Click the emoji icon (coming soon - UI update needed)

### For Admins/Moderators

1. **Pin Messages**:
   - Hover over important messages
   - Click the pin icon
   - Pinned messages stay at the top

2. **Delete Messages**:
   - Hover over any message
   - Click the trash icon
   - Confirm deletion

3. **Manage Members**:
   - View member list in sidebar
   - See online/offline status
   - Update member roles (Admin only)

## API Endpoints

### REST API

#### Get Messages
```
GET /api/messages/:communityId?page=1&limit=50
Authorization: Bearer <token>
```

#### Send Message
```
POST /api/messages/:communityId
Authorization: Bearer <token>
Body: {
  "content": "Message text",
  "type": "text",
  "parentMessage": "optional_message_id"
}
```

#### Pin Message
```
PUT /api/messages/:messageId/pin
Authorization: Bearer <token>
```

#### Delete Message
```
DELETE /api/messages/:messageId
Authorization: Bearer <token>
```

### Socket.io Events

#### Client → Server

- `join-community`: Join a community chat room
- `leave-community`: Leave a community chat room
- `send-message`: Send a new message
- `typing`: Send typing indicator
- `pin-message`: Pin/unpin a message
- `delete-message`: Delete a message

#### Server → Client

- `new-message`: Receive new message
- `user-online`: User came online
- `user-offline`: User went offline
- `user-typing`: User is typing
- `message-pinned`: Message was pinned/unpinned
- `message-deleted`: Message was deleted
- `joined-community`: Successfully joined community
- `error`: Error notification

## Code Examples

### Connect to Socket
```javascript
import socketService from './services/socket';

const token = localStorage.getItem('token');
socketService.connect(token);
socketService.joinCommunity(communityId);
```

### Send Message
```javascript
socketService.sendMessage({
  communityId: 'community-id',
  content: 'Hello everyone!',
  type: 'text'
});
```

### Listen for Messages
```javascript
socketService.onNewMessage((message) => {
  console.log('New message:', message);
  // Update UI with new message
});
```

### Typing Indicator
```javascript
// Start typing
socketService.sendTyping({
  communityId: 'community-id',
  isTyping: true
});

// Stop typing
socketService.sendTyping({
  communityId: 'community-id',
  isTyping: false
});
```

## Database Schema

### Message Model
```javascript
{
  community: ObjectId,         // Reference to Community
  sender: ObjectId,            // Reference to User
  content: String,             // Message text
  type: String,                // 'text', 'file', 'image', 'poll'
  fileUrl: String,             // URL for file attachments
  fileName: String,            // Original filename
  isPinned: Boolean,           // Pinned status
  parentMessage: ObjectId,     // Reply to message
  reactions: [{
    emoji: String,
    users: [ObjectId]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Authentication**: JWT token required for all operations
2. **Authorization**: Role-based access control (Admin, Moderator, Member)
3. **Membership Verification**: Only active community members can chat
4. **Content Moderation**: Optional profanity filter
5. **CORS**: Restricted to allowed origins

## Performance Optimizations

1. **Pagination**: Messages loaded in batches (50 per page)
2. **Socket Rooms**: Isolated chat rooms per community
3. **Efficient Queries**: Indexed database queries
4. **Connection Pooling**: MongoDB connection reuse
5. **Message Caching**: Recent messages cached client-side

## Troubleshooting

### Chat Not Loading
- Check if backend server is running
- Verify Socket.io connection in browser console
- Check JWT token validity
- Ensure user is a member of the community

### Messages Not Sending
- Verify internet connection
- Check Socket.io connection status
- Ensure proper authentication
- Check browser console for errors

### Typing Indicator Not Working
- Verify Socket.io events are firing
- Check debounce timeout (1 second)
- Ensure proper room joining

## Future Enhancements

- [ ] Voice/Video calling
- [ ] Screen sharing
- [ ] Message search
- [ ] @mentions with notifications
- [ ] Message editing
- [ ] Rich text formatting (bold, italic, etc.)
- [ ] Code snippet highlighting
- [ ] GIF support
- [ ] Message translation
- [ ] Chat export functionality
- [ ] Scheduled messages
- [ ] Bot integrations

## Support

For issues or questions:
1. Check the API documentation in `backend/API_DOCUMENTATION.md`
2. Review Socket.io logs in browser console
3. Check backend server logs
4. Verify environment variables are set correctly

## Contributing

When adding new chat features:
1. Update the Message model if schema changes
2. Add new Socket.io events to `socket.js`
3. Update frontend `CommunityChat.jsx` component
4. Test real-time functionality thoroughly
5. Update this documentation

---

**Built with**: Node.js, Express, Socket.io, MongoDB, React, TailwindCSS
