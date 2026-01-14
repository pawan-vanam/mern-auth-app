import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import { 
    HomeIcon, 
    BookOpenIcon, 
    UsersIcon, 
    ArrowRightOnRectangleIcon, 
    Bars3Icon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
        { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
        // { name: 'Users', href: '/admin/users', icon: UsersIcon }, // Placeholder for now
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors duration-200">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-700">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
