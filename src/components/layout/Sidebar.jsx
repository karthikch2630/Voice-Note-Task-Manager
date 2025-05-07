import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiCheckSquare, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };
  
  return (
    <motion.aside
      className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
    >
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiHome />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiFileText />
          <span>Notes</span>
        </NavLink>
        
        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiCheckSquare />
          <span>Tasks</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="app-info">
          <p>Voice Notes & Tasks</p>
          <p className="app-version">Version 1.0.0</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;