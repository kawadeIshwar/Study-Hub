# Profile Page - Complete Guide

## Overview
A comprehensive, role-based profile page with editable fields, user statistics, and a modern, responsive design.

---

## ✨ Features

### **1. Profile Header**
- **Gradient cover banner** with animated background
- **Large avatar circle** with first letter of name
- **Camera button** for future profile picture upload
- **User role badge** (Teacher 👨‍🏫 / Student 👨‍🎓)
- **Join date** display
- **Editable bio** section
- **Edit/Save/Cancel** controls

### **2. Statistics Cards**
Four animated stat cards showing:
- 📄 **Notes Uploaded** - Total notes contributed
- 👥 **Communities** - Communities joined
- 💬 **Messages** - Total messages sent
- 🏆 **Contributions** - Combined notes + messages

### **3. Personal Information Section**
**Common fields for all users:**
- ✅ Full Name (editable, required)
- ✉️ Email Address (read-only)
- 📞 Phone Number (editable, required, 10 digits)
- 📝 Bio (editable, max 500 characters)

### **4. Academic/Professional Information**

#### **For Students:**
- 🏫 College/University
- 📚 Course (e.g., B.Tech, B.Sc)
- 🎓 Department (e.g., Computer Science)
- 📅 Year (dropdown: 1st-4th Year, Graduate)
- #️⃣ Semester
- 🎫 Roll Number

#### **For Teachers:**
- 🏛️ Institution
- 🏅 Qualification (e.g., M.Tech, PhD)
- 📖 Specialization (e.g., Computer Science)
- 💼 Experience (years)
- 📚 Subjects (comma-separated list)

---

## 🎨 Design Features

### **Visual Elements:**
- ✅ **Gradient backgrounds** - Indigo to purple theme
- ✅ **Hover animations** - Scale effects on cards
- ✅ **Dark mode support** - All components adapt
- ✅ **Responsive design** - Mobile, tablet, desktop
- ✅ **Loading states** - Spinner during data fetch
- ✅ **Form validation** - Real-time error messages
- ✅ **Icons** - Lucide React icons throughout

### **Color Scheme:**
- **Primary**: Indigo-Purple gradient
- **Secondary**: Blue, Green, Orange for stats
- **Success**: Green for save button
- **Error**: Red for validation messages
- **Neutral**: Gray scales for text

---

## 🔧 Technical Implementation

### **Frontend Components**

#### **Main Component:** `frontend/src/pages/Profile.jsx`

**Key Features:**
```javascript
// State management
const [user, setUser] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({...});
const [stats, setStats] = useState(null);

// Validation
const validateForm = () => {
  // Name: required, min 2 chars
  // Phone: required, 10 digits
  // All other fields validated for trim/blank spaces
};
```

**Sub-Components:**
1. **InputField** - Reusable input with icon
2. **StatCard** - Animated statistic display
3. **Profile Header** - Avatar, cover, controls
4. **Form Sections** - Personal & Academic/Professional

---

### **Backend Routes**

#### **File:** `backend/routes/users.js`

**Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | ✅ | Get current user profile |
| GET | `/api/users/stats` | ✅ | Get user statistics |
| PUT | `/api/users/profile` | ✅ | Update profile |
| GET | `/api/users/:userId` | ✅ | Get public user info |
| GET | `/api/users/:userId/notes` | ✅ | Get user's notes |
| GET | `/api/users/:userId/communities` | ✅ | Get user's communities |

---

### **API Details**

#### **1. GET /api/users/profile**
**Description:** Fetch current logged-in user's complete profile

**Headers:**
```javascript
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "userId",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "phone": "1234567890",
  "bio": "Computer Science student...",
  "college": "XYZ University",
  "course": "B.Tech",
  "department": "Computer Science",
  "year": "3rd Year",
  "semester": "6",
  "rollNumber": "CS2021001",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### **2. GET /api/users/stats**
**Description:** Get user's contribution statistics

**Response:**
```json
{
  "notesUploaded": 15,
  "communitiesJoined": 5,
  "messagesSent": 234,
  "totalContributions": 249
}
```

---

#### **3. PUT /api/users/profile**
**Description:** Update user profile information

**Request Body (Student):**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "bio": "Updated bio...",
  "college": "ABC University",
  "course": "B.Tech",
  "department": "CSE",
  "year": "3rd Year",
  "semester": "6",
  "rollNumber": "CS2021001"
}
```

**Request Body (Teacher):**
```json
{
  "name": "Dr. Smith",
  "phone": "9876543210",
  "bio": "Professor of Computer Science...",
  "qualification": "PhD",
  "specialization": "Machine Learning",
  "institution": "MIT",
  "experience": 10,
  "subjects": ["Data Structures", "Algorithms", "ML"]
}
```

**Response:**
```json
{
  "_id": "userId",
  "name": "John Doe",
  // ... updated user object (no password)
}
```

---

## 🔐 Validation Rules

### **Frontend Validation:**

1. **Name**
   - ✅ Required
   - ✅ Minimum 2 characters
   - ✅ Cannot be blank spaces only

2. **Phone**
   - ✅ Required
   - ✅ Must be exactly 10 digits
   - ✅ Numbers only
   - ✅ Spaces and dashes removed automatically

3. **Bio**
   - ✅ Optional
   - ✅ Maximum 500 characters
   - ✅ Trimmed of leading/trailing spaces

4. **All Other Fields**
   - ✅ Trimmed of whitespace
   - ✅ Cannot be blank spaces only

### **Backend Validation:**
- All fields are trimmed before saving
- Email uniqueness is not checked (read-only)
- Role-specific fields are validated based on user role

---

## 🚀 Usage Guide

### **For Users:**

#### **Accessing Profile:**
1. **Login** to your account
2. Click **"Profile"** in navbar (with user icon 👤)
3. View your profile information and stats

#### **Editing Profile:**
1. Click **"Edit Profile"** button (top-right)
2. **Modify** any editable fields
3. Click **"Save Changes"** to save
4. Click **"Cancel"** to discard changes

#### **What You Can Edit:**
- ✏️ Name
- ✏️ Phone number
- ✏️ Bio
- ✏️ All academic/professional fields
- ❌ Email (cannot be changed)
- ❌ Role (cannot be changed)

---

### **For Developers:**

#### **Setup Steps:**

1. **Backend is ready** - Routes already exist in `backend/routes/users.js`

2. **Frontend route added** - Profile page accessible at `/profile`

3. **Navbar updated** - Profile link shows for logged-in users

4. **Start the app:**
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend
   cd frontend
   npm run dev
   ```

5. **Access profile:**
   - Login with any account
   - Click "Profile" in navbar
   - URL: `http://localhost:5173/profile`

---

## 📱 Responsive Breakpoints

### **Desktop (lg: 1024px+)**
- 2-column layout for profile sections
- 4-column stat cards
- Full sidebar and details

### **Tablet (md: 768px+)**
- 2-column layout maintained
- Stat cards stack to 2 columns
- Optimized spacing

### **Mobile (< 768px)**
- Single column layout
- Stat cards stack vertically
- Full-width form fields
- Hamburger menu with profile link

---

## 🎯 Key Components Breakdown

### **1. Profile Header**
```jsx
<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl">
  {/* Gradient cover */}
  <div className="h-48 bg-gradient-to-r from-indigo-500..." />
  
  {/* Avatar with camera button */}
  <div className="w-40 h-40 rounded-full...">
    <span>{user.name.charAt(0)}</span>
    <button><Camera /></button>
  </div>
  
  {/* Name, role, bio */}
  {/* Edit/Save/Cancel buttons */}
</div>
```

### **2. Stats Section**
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard icon={<FileText />} label="Notes" value={15} color="blue" />
  <StatCard icon={<Users />} label="Communities" value={5} color="purple" />
  <StatCard icon={<MessageCircle />} label="Messages" value={234} color="green" />
  <StatCard icon={<Award />} label="Contributions" value={249} color="orange" />
</div>
```

### **3. Information Sections**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Personal Information */}
  <div className="bg-white...">
    <h2>Personal Information</h2>
    <InputField label="Name" icon={<User />} required />
    <InputField label="Email" disabled />
    <InputField label="Phone" required />
    <textarea name="bio" />
  </div>

  {/* Academic/Professional */}
  <div className="bg-white...">
    <h2>{role === 'teacher' ? 'Professional' : 'Academic'} Information</h2>
    {/* Role-specific fields */}
  </div>
</div>
```

---

## 🐛 Error Handling

### **Frontend Errors:**
- ❌ **Network errors** - Toast notification
- ❌ **Validation errors** - Toast with specific message
- ❌ **401 Unauthorized** - Redirect to login
- ❌ **404 Not Found** - "User not found" message

### **Backend Errors:**
- ❌ **Server error (500)** - Generic error response
- ❌ **Validation failed** - Specific field error
- ❌ **User not found (404)** - Clear message

---

## 🎨 Styling Classes

### **Key Tailwind Classes Used:**

**Gradients:**
```css
bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
bg-gradient-to-br from-blue-500 to-cyan-500
```

**Shadows:**
```css
shadow-2xl hover:shadow-xl
```

**Animations:**
```css
hover:scale-105 transition-all duration-300
animate-spin (for loading)
```

**Dark Mode:**
```css
dark:bg-gray-800 dark:text-white
```

---

## 📊 Database Schema

### **User Model Fields:**

```javascript
{
  // Common
  name: String (required, trimmed),
  email: String (unique, required, lowercase),
  password: String (required, hashed),
  role: String (enum: ['student', 'teacher']),
  phone: String (trimmed),
  bio: String (max 500 chars),
  createdAt: Date,
  updatedAt: Date,

  // Student-specific
  college: String,
  course: String,
  department: String,
  year: String (enum),
  semester: String,
  rollNumber: String,

  // Teacher-specific
  qualification: String,
  specialization: String,
  experience: Number,
  institution: String,
  subjects: [String]
}
```

---

## ✅ Testing Checklist

### **Functionality Tests:**
- [ ] Profile loads correctly
- [ ] Stats display accurate numbers
- [ ] Edit mode toggles properly
- [ ] Form validation works
- [ ] Save updates profile
- [ ] Cancel discards changes
- [ ] Phone validation (10 digits)
- [ ] Name validation (min 2 chars)
- [ ] Bio character limit (500)
- [ ] Role-specific fields show correctly
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Loading states show
- [ ] Error messages display

### **UI/UX Tests:**
- [ ] Animations smooth
- [ ] Hover effects work
- [ ] Icons display correctly
- [ ] Colors contrast properly
- [ ] Text readable
- [ ] Buttons accessible
- [ ] Form inputs styled consistently

---

## 🚀 Future Enhancements

### **Planned Features:**
1. 📸 **Profile picture upload** - Camera button functionality
2. 🖼️ **Cover image customization** - User-selected banners
3. 🔒 **Password change** - Secure password update form
4. 📧 **Email verification** - Verify email addresses
5. 🏆 **Achievements/Badges** - Gamification elements
6. 📊 **Activity timeline** - Recent actions display
7. 👥 **Following system** - Follow other users
8. 🔗 **Social links** - LinkedIn, GitHub, etc.
9. 📱 **QR code** - Shareable profile QR
10. 🌐 **Public profile toggle** - Privacy controls

---

## 📝 Code Examples

### **Using in Your Component:**

```javascript
// Navigate to profile
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/profile');

// Fetch profile data
const token = localStorage.getItem('token');
const res = await axios.get(`${API_URL}/api/users/profile`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Update profile
const updateData = { name: 'New Name', phone: '1234567890' };
await axios.put(`${API_URL}/api/users/profile`, updateData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🎉 Summary

The Profile Page is a **complete, production-ready feature** with:
- ✅ Beautiful, modern UI
- ✅ Role-based information display
- ✅ Real-time validation
- ✅ Comprehensive stats
- ✅ Full CRUD operations
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Error handling
- ✅ Loading states

**Last Updated:** November 7, 2025  
**Status:** ✅ Fully Implemented and Ready to Use
