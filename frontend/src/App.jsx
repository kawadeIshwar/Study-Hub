import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CommunitiesProvider } from './contexts/CommunitiesContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
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
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:communityId" element={<CommunityDetail />} />
        </Routes>
        <Footer />
      </CommunitiesProvider>
    </BrowserRouter>
  );
}
export default App;
