import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Strict role check
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};

export default AdminRoute;
