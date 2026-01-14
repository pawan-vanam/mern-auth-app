import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AssessmentResult from '../components/AssessmentResult';
import CourseCard from '../components/CourseCard';
import { 
    CheckBadgeIcon, 
    ExclamationTriangleIcon,
    PencilSquareIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'; 

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [showAssessment, setShowAssessment] = useState(false);
    const [assessmentData, setAssessmentData] = useState(null);
    const [isAssessing, setIsAssessing] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get('/courses');
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
                toast.error("Failed to load courses");
            } finally {
                setLoadingCourses(false);
            }
        };

        const checkPaymentStatus = async () => {
             const code = searchParams.get('code');
            const transactionId = searchParams.get('merchantOrderId');

            if ((code === 'PAYMENT_SUCCESS' || code === 'VERIFY') && transactionId) {
                try {
                    const { data } = await axios.post('/payment/status', {
                        merchantTransactionId: transactionId
                    });

                    if (data.success) {
                        toast.success('Enrollment successful! Welcome to the course.');
                    } else {
                        toast.error(data.message || 'Payment verification failed');
                    }
                } catch (error) {
                    toast.error('Could not verify payment status');
                }
                window.history.replaceState({}, '', '/dashboard');
            } else if (code === 'PAYMENT_ERROR') {
                toast.error('Payment failed');
            }
        };

        fetchCourses();
        checkPaymentStatus();
    }, [searchParams]);

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.trim().split(/\s+/);
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:text-4xl sm:truncate transition-colors">
                            Student Dashboard
                        </h2>
                        <p className="mt-2 text-md text-gray-500 dark:text-gray-400 transition-colors">
                            Welcome back, <span className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{user?.name}</span>!
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                         <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            <ArrowRightOnRectangleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Course Card */}
                    <div className="lg:col-span-2">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Courses</h3>
                        {loadingCourses ? (
                            <div className="text-center py-10">Loading courses...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <CourseCard 
                                            key={course._id} 
                                            course={course} 
                                            onClick={() => navigate(`/course/${course.slug}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                        No courses available at the moment.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Profile Summary */}
                    <div className="lg:col-span-1 space-y-6">
                         <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-2xl border border-gray-100 dark:border-slate-700 p-0 transition-all hover:shadow-xl duration-200">
                            {/* Profile Header Gradient */}
                             <div className="h-24 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all shadow-sm group"
                                    title="Edit Profile"
                                >
                                    <PencilSquareIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </button>
                             </div>

                             <div className="px-6 pb-6 mt-[-40px] text-center relative z-10">
                                <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 p-1 mx-auto shadow-md transition-colors">
                                    <div className="h-full w-full rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border border-gray-100 dark:border-slate-600 transition-colors">
                                        {getInitials(user?.name)}
                                    </div>
                                </div>
                                <h4 className="mt-3 text-lg font-bold text-gray-900 dark:text-white transition-colors">{user?.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-4 transition-colors">{user?.email}</p>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700 transition-colors">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Verification</span>
                                        {user?.isVerified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors">
                                                <CheckBadgeIcon className="w-3 h-3 mr-1" /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 transition-colors">
                                                <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Joined</span>
                                        <span className="text-gray-900 dark:text-white font-medium transition-colors">
                                            {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            <AssessmentResult 
                open={showAssessment} 
                onClose={() => setShowAssessment(false)} 
                result={assessmentData}
                isLoading={isAssessing}
            />
        </div>
    );
};

export default Dashboard;
