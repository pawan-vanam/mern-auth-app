import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import ResetPassword from './pages/ResetPassword';
import Loader from './components/Loader';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect Authenticated Users Component (e.g. dont show login if already logged in)
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated && user?.isVerified) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position='top-center' reverseOrder={false} />
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/login" element={
                <RedirectAuthenticatedUser>
                    <Login />
                </RedirectAuthenticatedUser>
            } />
            
            <Route path="/signup" element={
                <RedirectAuthenticatedUser>
                    <Signup />
                </RedirectAuthenticatedUser>
            } />
            
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route path="/forgot-password" element={
                <RedirectAuthenticatedUser>
                    <ForgotPassword />
                </RedirectAuthenticatedUser>
            } />
            
            <Route path="/verify-reset-code" element={
                <RedirectAuthenticatedUser>
                    <VerifyResetCode />
                </RedirectAuthenticatedUser>
            } />
             
            <Route path="/reset-password" element={
                <RedirectAuthenticatedUser>
                    <ResetPassword />
                </RedirectAuthenticatedUser>
            } />
            
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
