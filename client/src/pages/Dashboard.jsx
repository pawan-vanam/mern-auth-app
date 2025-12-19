import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Name</label>
                            <p className="mt-1 text-lg text-gray-900">{user?.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user?.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <Button onClick={handleLogout} variant="danger" className="w-auto px-6">
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
