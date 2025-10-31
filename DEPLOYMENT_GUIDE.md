# StudyHub Deployment Guide

This guide covers deploying StudyHub to production environments.

## Prerequisites

- MongoDB Atlas account (or MongoDB hosting)
- Cloudinary account for file storage
- Email service (Gmail, SendGrid, etc.)
- Node.js hosting (Render, Railway, Heroku, etc.)
- Frontend hosting (Netlify, Vercel, etc.)

---

## Backend Deployment

### 1. Prepare Backend for Production

**Update Environment Variables:**

Create a `.env` file with production values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyhub?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (if using Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### 2. Deploy to Render (Recommended)

1. **Create account** at [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the `backend` directory
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**:
   - Go to Environment tab
   - Add all variables from your `.env` file

4. **Deploy**:
   - Render will automatically deploy your app
   - Note your backend URL (e.g., `https://studyhub-api.onrender.com`)

### 3. Alternative: Deploy to Railway

1. **Create account** at [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - Connect repository
   - Select backend folder
   - Add environment variables

3. **Configure**:
   - Railway auto-detects Node.js
   - Set start command to `npm start`

### 4. CORS Configuration

Update `server.js` to include your frontend URL:

```javascript
const allowedOrigins = [
  "https://your-frontend-url.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173"
];
```

---

## Frontend Deployment

### 1. Prepare Frontend for Production

**Update Environment Variables:**

Create a `.env.production` file:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

**Build for Production:**

```bash
cd frontend
npm run build
```

This creates an optimized `dist` folder.

### 2. Deploy to Netlify (Recommended)

1. **Create account** at [netlify.com](https://netlify.com)

2. **Deploy from Git**:
   - Connect GitHub repository
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**:
   - Go to Site settings > Build & deploy > Environment
   - Add `VITE_API_URL` and `VITE_SOCKET_URL`

4. **Configure Redirects**:
   Create `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

5. **Deploy**:
   - Netlify will build and deploy automatically
   - Note your frontend URL

### 3. Alternative: Deploy to Vercel

1. **Create account** at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect GitHub repository
   - Framework: Vite
   - Root Directory: `frontend`

3. **Environment Variables**:
   - Add `VITE_API_URL` and `VITE_SOCKET_URL`

4. **Deploy**:
   - Vercel handles the rest automatically

---

## Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**:
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Configure Database**:
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for development)
   - Get connection string

3. **Connection String Format**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/studyhub?retryWrites=true&w=majority
   ```

4. **Security**:
   - Use strong passwords
   - Enable IP whitelisting in production
   - Create separate users for different environments

---

## Cloudinary Setup

1. **Create Account**:
   - Visit [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**:
   - Dashboard > Settings > Access Keys
   - Copy Cloud Name, API Key, API Secret

3. **Configure Upload Presets** (optional):
   - Settings > Upload > Upload presets
   - Create preset for automatic transformations

---

## Email Service Setup

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google account

2. **Create App Password**:
   - Google Account > Security > App passwords
   - Generate password for "Mail"

3. **Use in Environment Variables**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=generated-app-password
   ```

### Using SendGrid (Alternative)

1. **Create account** at [sendgrid.com](https://sendgrid.com)

2. **Generate API Key**:
   - Settings > API Keys > Create API Key

3. **Update Code**:
   Replace Nodemailer with SendGrid SDK in `backend/utils/emailService.js`

---

## Post-Deployment Checklist

### Backend
- [ ] All environment variables set
- [ ] MongoDB connection working
- [ ] Cloudinary uploads working
- [ ] Email sending working
- [ ] CORS configured for frontend URL
- [ ] Socket.io connections working
- [ ] API endpoints responding correctly

### Frontend
- [ ] Environment variables set
- [ ] API URL pointing to production backend
- [ ] Socket.io connecting to backend
- [ ] All pages loading correctly
- [ ] File uploads working
- [ ] Authentication working
- [ ] Real-time chat working

### Security
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] API keys are not exposed in frontend
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS properly configured
- [ ] Rate limiting enabled (recommended)

---

## Testing Production Deployment

1. **Test Authentication**:
   - Sign up new user
   - Login with existing user
   - Verify JWT tokens

2. **Test Notes**:
   - Upload a note
   - View all notes
   - Delete a note

3. **Test Communities**:
   - Create a community
   - Join a community
   - Leave a community

4. **Test Chat**:
   - Send messages
   - Verify real-time delivery
   - Test typing indicators
   - Test online status
   - Pin/unpin messages (if admin)

5. **Test File Uploads**:
   - Upload files in chat
   - Upload notes
   - Verify Cloudinary storage

---

## Monitoring and Maintenance

### Logs

**Render Logs**:
- Dashboard > Logs tab
- Real-time log streaming

**Railway Logs**:
- Project > Deployments > View logs

### Performance Monitoring

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for user session replay
- **Google Analytics** for usage tracking

### Database Backups

**MongoDB Atlas**:
- Settings > Backup
- Enable automated backups
- Set backup schedule

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 2 seconds
- Memory usage > 80%
- CPU usage > 80%
- Database connections maxed out

### Scaling Options

1. **Vertical Scaling**:
   - Upgrade server instance size
   - Increase database tier

2. **Horizontal Scaling**:
   - Add more server instances
   - Use load balancer
   - Implement Redis for session management

3. **Database Optimization**:
   - Add database indexes
   - Enable caching
   - Optimize queries

---

## Common Issues and Solutions

### Issue: Socket.io Not Connecting

**Solution**:
- Check CORS configuration
- Verify Socket.io URL in frontend
- Check WebSocket support on hosting platform
- Review firewall settings

### Issue: File Uploads Failing

**Solution**:
- Verify Cloudinary credentials
- Check file size limits
- Review upload middleware configuration
- Check server memory limits

### Issue: Database Connection Timeout

**Solution**:
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Increase connection timeout
- Check database cluster health

### Issue: Slow Response Times

**Solution**:
- Enable database indexes
- Implement caching (Redis)
- Optimize database queries
- Use CDN for static assets

---

## Rollback Plan

If deployment fails:

1. **Frontend Rollback**:
   - Netlify/Vercel: Revert to previous deployment from dashboard
   - Or: Deploy from previous Git commit

2. **Backend Rollback**:
   - Render/Railway: Redeploy previous version
   - Or: Revert Git commit and redeploy

3. **Database Rollback**:
   - Restore from MongoDB Atlas backup
   - Or: Run migration scripts to revert schema changes

---

## Support and Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Socket.io**: [socket.io/docs](https://socket.io/docs)

---

## Estimated Costs (Monthly)

**Free Tier (Development/Small Projects)**:
- MongoDB Atlas: Free (512 MB storage)
- Cloudinary: Free (25 GB storage, 25 GB bandwidth)
- Render: Free (750 hours/month)
- Netlify: Free (100 GB bandwidth)
- **Total: $0/month**

**Production Tier (Growing Project)**:
- MongoDB Atlas: $9-57 (depends on data size)
- Cloudinary: $0-99 (depends on usage)
- Render: $7-25 per service
- Netlify: $0-19
- **Total: ~$16-200/month**

---

**Remember**: Always test thoroughly before deploying to production!
