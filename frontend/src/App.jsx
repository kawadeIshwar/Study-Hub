import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { CommunitiesProvider } from './contexts/CommunitiesContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherSignup from './pages/TeacherSignup';
import TeacherDashboard from './pages/TeacherDashboard';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackendStatus from './components/BackendStatus';
import keepAliveService from './services/keepAlive';
import cacheService from './services/cacheService';

function App() {
  useEffect(() => {
    // Start keep-alive service to prevent backend cold starts
    keepAliveService.start();
    
    // Clean up old cache on app start
    cacheService.clearOldCache();
    
    // Log cache stats
    const stats = cacheService.getCacheStats();
    console.log('📊 Cache stats:', stats);
    
    // Cleanup on unmount
    return () => {
      keepAliveService.stop();
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <CommunitiesProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/teacher" element={<TeacherSignup />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:communityId" element={<CommunityDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
        <BackendStatus />
      </CommunitiesProvider>
    </BrowserRouter>
  );
}
export default App;
