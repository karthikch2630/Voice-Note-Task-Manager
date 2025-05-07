import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          {user && (
            <button className="menu-button" onClick={toggleSidebar}>
              <FiMenu size={24} />
            </button>
          )}
          
          <Link to="/" className="logo">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              🎙️
            </motion.div>
            <span>VoiceNotes</span>
          </Link>
        </div>
        
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <FiUser />
                <span>{user.name}</span>
              </div>
              
              <button className="logout-button" onClick={logout}>
                <FiLogOut />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">Sign In</Link>
              <Link to="/register" className="register-link btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;