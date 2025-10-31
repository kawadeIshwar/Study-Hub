# StudyHub - Quick Start Guide

Get your StudyHub full-stack application running in 5 minutes!

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

---

## 🚀 Quick Setup

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Or create manually with:
```

**Minimal `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyhub
JWT_SECRET=your-secret-key-change-this
```

**Optional (for full features):**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

```bash
# Start backend server
npm run server
```

✅ Backend running on `http://localhost:5000`

---

### 2. Frontend Setup (2 minutes)

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
```

**`.env` file:**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

```bash
# Start frontend
npm run dev
```

✅ Frontend running on `http://localhost:5173`

---

## 🎉 You're Ready!

Open your browser to `http://localhost:5173` and:

1. **Sign Up** - Create a new account
2. **Upload Notes** - Share study materials
3. **Join Communities** - Connect with other students
4. **Chat in Real-Time** - Message community members instantly!

---

## 🧪 Quick Test

### Test Authentication
1. Go to `http://localhost:5173/signup`
2. Create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123

### Test Notes
1. Go to Upload page
2. Fill in note details
3. Upload a PDF or document
4. View all notes on Notes page

### Test Chat
1. Go to Communities page
2. Create a new community or join existing one
3. Click on community to open chat
4. Send a message - it appears instantly!
5. Try typing - see the typing indicator
6. View online members in the sidebar

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` (for local MongoDB)
- Verify `.env` file exists in backend folder
- Check port 5000 is not in use

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check `.env` file exists in frontend folder
- Verify port 5173 is not in use

### Chat not working
- Ensure backend is running (Socket.io needs backend)
- Check browser console for Socket connection errors
- Verify `VITE_SOCKET_URL` in frontend `.env`

---

## 📖 Next Steps

- Read **README.md** for full project overview
- Check **API_DOCUMENTATION.md** for API endpoints
- See **CHAT_FEATURE_GUIDE.md** for chat features
- Review **DEPLOYMENT_GUIDE.md** for production setup
- Read **FULL_STACK_SUMMARY.md** for technical details

---

## 🆘 Need Help?

1. Check the documentation files
2. Review browser console for errors
3. Check backend server logs
4. Verify all environment variables are set

---

**Happy Coding! 🎓**
