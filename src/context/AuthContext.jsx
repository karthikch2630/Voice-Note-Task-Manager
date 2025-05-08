import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // ✅ use centralized axios
import { toast } from 'react-toastify';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await axiosInstance.get('/users/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/users/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
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

  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/users/login', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
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

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
