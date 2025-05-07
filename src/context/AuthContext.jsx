import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          // Set default headers for all axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const res = await axios.get('http://localhost:5000/api/users/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Error loading user:', error);
          // Clear token if invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          axios.defaults.headers.common['Authorization'] = null;
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/users/register', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred during registration';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/users/login', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        toast.success('Login successful!');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    axios.defaults.headers.common['Authorization'] = null;
    toast.info('You have been logged out');
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};