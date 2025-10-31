# StudyHub Backend API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: Update in .env file

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Signup
**POST** `/api/auth/signup`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "msg": "Registered successfully"
}
```

### 2. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## User Endpoints

### 1. Get Current User Profile
**GET** `/api/users/profile`

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "notesUploaded": 5,
    "communitiesJoined": 3
  }
}
```

### 2. Update User Profile
**PUT** `/api/users/profile`

**Headers:** Authorization required

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### 3. Get User by ID
**GET** `/api/users/:userId`

**Headers:** Authorization required

### 4. Get User's Notes
**GET** `/api/users/:userId/notes?page=1&limit=10`

**Headers:** Authorization required

### 5. Get User's Communities
**GET** `/api/users/:userId/communities`

**Headers:** Authorization required

---

## Notes Endpoints

### 1. Upload Note
**POST** `/api/upload`

**Headers:** Authorization required

**Body:** (multipart/form-data)
```
title: "Introduction to React"
subject: "Web Development"
semester: "5"
tags: "react,javascript,frontend"
file: <binary file>
```

**Response:**
```json
{
  "message": "Note uploaded!",
  "note": {
    "_id": "note_id",
    "title": "Introduction to React",
    "subject": "Web Development",
    ...
  }
}
```

### 2. Get All Notes
**GET** `/api/upload/all`

**Response:**
```json
[
  {
    "_id": "note_id",
    "title": "Note Title",
    "subject": "Subject",
    "uploader": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
]
```

### 3. Delete Note
**DELETE** `/api/notes/:noteId`

**Headers:** Authorization required

---

## Communities Endpoints

### 1. Get All Communities
**GET** `/api/communities?search=&tags=&page=1&limit=12`

**Headers:** Authorization required

**Query Parameters:**
- `search`: Search term for name/description
- `tags`: Comma-separated tags
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

### 2. Get Community Details
**GET** `/api/communities/:id`

**Headers:** Authorization required

**Response:**
```json
{
  "name": "Web Development Community",
  "description": "Learn web development together",
  "tags": ["web", "javascript"],
  "coverImage": "url",
  "createdBy": {...},
  "isMember": true,
  "userRole": "member",
  "stats": {...}
}
```

### 3. Create Community
**POST** `/api/communities`

**Headers:** Authorization required

**Body:** (multipart/form-data)
```
name: "Community Name"
description: "Community Description"
tags: "tag1,tag2"
isPrivate: false
coverImage: <binary file>
```

### 4. Join Community
**POST** `/api/communities/:id/join`

**Headers:** Authorization required

### 5. Leave Community
**POST** `/api/communities/:id/leave`

**Headers:** Authorization required

### 6. Get Community Members
**GET** `/api/communities/:id/members?role=&status=active&page=1&limit=20`

**Headers:** Authorization required

### 7. Get Community Stats
**GET** `/api/communities/:id/stats`

**Headers:** Authorization required

### 8. Update Member Role (Admin only)
**PUT** `/api/communities/:communityId/members/:userId/role`

**Headers:** Authorization required

**Body:**
```json
{
  "role": "admin" | "moderator" | "member"
}
```

---

## Messages Endpoints

### 1. Get Messages
**GET** `/api/messages/:communityId?page=1&limit=50&type=all`

**Headers:** Authorization required

**Response:**
```json
{
  "messages": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### 2. Send Message
**POST** `/api/messages/:communityId`

**Headers:** Authorization required

**Body:** (multipart/form-data)
```
content: "Message text"
type: "text" | "file"
parentMessage: "parent_message_id" (optional)
file: <binary file> (optional)
```

### 3. Pin/Unpin Message (Admin/Moderator only)
**PUT** `/api/messages/:messageId/pin`

**Headers:** Authorization required

### 4. Delete Message
**DELETE** `/api/messages/:messageId`

**Headers:** Authorization required

### 5. Add Reaction
**POST** `/api/messages/:messageId/react`

**Headers:** Authorization required

**Body:**
```json
{
  "emoji": "👍"
}
```

### 6. Get Pinned Messages
**GET** `/api/messages/:communityId/pinned`

**Headers:** Authorization required

---

## Polls Endpoints

### 1. Get Polls
**GET** `/api/polls/:communityId?status=active&page=1&limit=10`

**Headers:** Authorization required

### 2. Create Poll
**POST** `/api/polls/:communityId`

**Headers:** Authorization required

**Body:**
```json
{
  "question": "What framework should we learn next?",
  "description": "Vote for the next topic",
  "options": ["React", "Vue", "Angular"],
  "type": "single" | "multiple",
  "isAnonymous": false,
  "allowMultipleVotes": false,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### 3. Vote on Poll
**POST** `/api/polls/:pollId/vote`

**Headers:** Authorization required

**Body:**
```json
{
  "optionIds": ["option_id_1"] // or ["option_id_1", "option_id_2"] for multiple choice
}
```

### 4. Get Poll Results
**GET** `/api/polls/:pollId/results`

**Headers:** Authorization required

### 5. Delete Poll (Admin/Moderator only)
**DELETE** `/api/polls/:pollId`

**Headers:** Authorization required

---

## Notifications Endpoints

### 1. Get User Notifications
**GET** `/api/notifications?page=1&limit=20&unreadOnly=false`

**Headers:** Authorization required

### 2. Mark Notification as Read
**PUT** `/api/notifications/:notificationId/read`

**Headers:** Authorization required

### 3. Mark All as Read
**PUT** `/api/notifications/read-all`

**Headers:** Authorization required

### 4. Delete Notification
**DELETE** `/api/notifications/:notificationId`

**Headers:** Authorization required

---

## Socket.io Events

### Connection
Connect to the Socket.io server with authentication:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### Client Events (Emit)

#### 1. Join Community
```javascript
socket.emit('join-community', communityId);
```

#### 2. Leave Community
```javascript
socket.emit('leave-community', communityId);
```

#### 3. Send Message
```javascript
socket.emit('send-message', {
  communityId: 'community_id',
  content: 'Message text',
  type: 'text',
  parentMessage: 'parent_id' // optional
});
```

#### 4. Typing Indicator
```javascript
socket.emit('typing', {
  communityId: 'community_id',
  isTyping: true
});
```

#### 5. Pin Message
```javascript
socket.emit('pin-message', {
  messageId: 'message_id'
});
```

#### 6. Delete Message
```javascript
socket.emit('delete-message', {
  messageId: 'message_id'
});
```

### Server Events (Listen)

#### 1. Connection Confirmed
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### 2. Joined Community
```javascript
socket.on('joined-community', (data) => {
  console.log('Joined community:', data.communityId);
});
```

#### 3. New Message
```javascript
socket.on('new-message', (message) => {
  // Handle new message
  console.log('New message:', message);
});
```

#### 4. User Online
```javascript
socket.on('user-online', (data) => {
  console.log('User online:', data.userId, data.userName);
});
```

#### 5. User Offline
```javascript
socket.on('user-offline', (data) => {
  console.log('User offline:', data.userId, data.userName);
});
```

#### 6. User Typing
```javascript
socket.on('user-typing', (data) => {
  console.log('User typing:', data.userName, data.isTyping);
});
```

#### 7. Message Deleted
```javascript
socket.on('message-deleted', (data) => {
  console.log('Message deleted:', data.messageId);
});
```

#### 8. Message Pinned
```javascript
socket.on('message-pinned', (data) => {
  console.log('Message pinned:', data.messageId, data.isPinned);
});
```

#### 9. Error
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "msg": "Error message describing what went wrong"
}
```

**401 Unauthorized:**
```json
{
  "msg": "No token, authorization denied"
}
```

**403 Forbidden:**
```json
{
  "msg": "You don't have permission to perform this action"
}
```

**404 Not Found:**
```json
{
  "msg": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "msg": "Server error",
  "error": "Error details (in development mode)"
}
```

---

## Rate Limiting

- No rate limiting currently implemented
- Recommended to add rate limiting in production

## CORS

Allowed origins:
- https://studyhub4all.netlify.app
- http://localhost:3000
- http://localhost:5173

Update in `server.js` for additional origins.
