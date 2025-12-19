import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      toast.success(res.data.message);
      return { success: true, message: res.data.message };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Logged in successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/google', { token: credential });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Logged in with Google successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google Login failed');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email, code) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/verify-email', { email, code });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.get('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      return { success: true, message: res.data.message };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email, code) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/verify-reset-code', { email, code });
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email, code, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/reset-password', { email, code, password });
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      return { success: false, message: error.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    googleLogin,
    verifyEmail,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
