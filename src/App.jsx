import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import NoteDetail from './pages/NoteDetail';
import TaskDetail from './pages/TaskDetail';
import NotFound from './pages/NotFound';
import './App.css';

const App = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        {user && <Sidebar isOpen={sidebarOpen} />}
        
        <div className={`content ${user && sidebarOpen ? 'with-sidebar' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            {/* Protected routes */}
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" />} />
            <Route path="/notes/:id" element={user ? <NoteDetail /> : <Navigate to="/login" />} />
            <Route path="/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
            <Route path="/tasks/:id" element={user ? <TaskDetail /> : <Navigate to="/login" />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;