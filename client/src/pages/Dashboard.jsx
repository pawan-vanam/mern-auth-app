import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AssessmentResult from '../components/AssessmentResult';
import { 
    UserCircleIcon, 
    CheckBadgeIcon, 
    ExclamationTriangleIcon,
    AcademicCapIcon, 
    ArrowRightOnRectangleIcon,
    PencilSquareIcon,
    BookOpenIcon,
    ClockIcon,
    VideoCameraIcon,
    SparklesIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'; 

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [showAssessment, setShowAssessment] = useState(false);
    const [assessmentData, setAssessmentData] = useState(null);
    const [isAssessing, setIsAssessing] = useState(false);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            const code = searchParams.get('code');
            const transactionId = searchParams.get('merchantOrderId');

            if ((code === 'PAYMENT_SUCCESS' || code === 'VERIFY') && transactionId) {
                setPaymentStatus('loading');
                try {
                    const { data } = await axios.post('/payment/status', {
                        merchantTransactionId: transactionId
                    });

                    if (data.success) {
                        setPaymentStatus('success');
                        toast.success('Enrollment successful! Welcome to the course.');
                    } else {
                        setPaymentStatus('failed');
                        toast.error(data.message || 'Payment verification failed');
                    }
                } catch (error) {
                    setPaymentStatus('failed');
                    toast.error('Could not verify payment status');
                }
                window.history.replaceState({}, '', '/dashboard');
            } else if (code === 'PAYMENT_ERROR') {
                setPaymentStatus('failed');
                toast.error('Payment failed');
            }
        };

        const fetchUserStatus = async () => {
            try {
                const { data } = await axios.get('/payment/user-status');
                if (data.isPaid) {
                    setPaymentStatus('success');
                }
            } catch (error) {
                console.error("Failed to fetch user payment status", error);
            }
        };

        const fetchAssessmentStatus = async () => {
            try {
                // Remove /api prefix if base URL has it, otherwise keep it. 
                // Based on previous fix, we removed /api. checking if retrieval needs it too.
                // assessmentRoutes is mounted at /api/assessment.
                // previous fix removed /api prefix from POST request because axios baseURL likely includes /api.
                // So GET should also match: /assessment/Full%20Stack%20Web%20Development
                const { data } = await axios.get('/assessment/Full%20Stack%20Web%20Development');
                if (data.success && data.data) {
                    setAssessmentData(data.data);
                }
            } catch (error) {
                // If 404, it just means no assessment yet. silent fail.
                console.log("No existing assessment found or error fetching.");
            }
        };

        checkPaymentStatus();
        fetchUserStatus();
        fetchAssessmentStatus();
    }, [searchParams]);

    const handleDataAssessment = async () => {
        setIsAssessing(true);
        setShowAssessment(true);
        try {
            const { data } = await axios.post('/assessment', { 
                courseName: 'Full Stack Web Development' 
            });
            if (data.success) {
                setAssessmentData(data.data);
                toast.success('Assessment Completed!');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Assessment Failed');
            setShowAssessment(false);
        } finally {
            setIsAssessing(false);
        }
    };

    const handlePayment = async () => {
        try {
            const { data } = await axios.post('/payment/pay', { amount: 199 });
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || 'Payment initiation failed');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

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
                    <div className="lg:col-span-2 space-y-6">
                        
                         {/* Active Course / Enrollment Card */}
                         <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-2xl border border-gray-100 dark:border-slate-700 transition-all hover:shadow-xl duration-200">
                             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-3">
                                            <AcademicCapIcon className="w-3 h-3 mr-1" />
                                            Active Batch 2024
                                        </span>
                                        <h3 className="text-2xl font-bold mb-1">Full Stack Web Development</h3>
                                        <p className="text-blue-100 text-sm">Valid for 6 Months • 100% Online</p>
                                    </div>
                                    <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <BookOpenIcon className="h-7 w-7 text-white" />
                                    </div>
                                </div>
                             </div>
                             
                             <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg transition-colors">
                                        <VideoCameraIcon className="h-5 w-5 text-indigo-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Lectures</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">45+ Hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg transition-colors">
                                        <ClockIcon className="h-5 w-5 text-indigo-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Validation</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">Lifetime Access</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between border-t border-gray-100 dark:border-slate-700 pt-6 transition-colors">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Enrollment Status</p>
                                        {paymentStatus === 'success' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-3 w-3 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                </span>
                                                <span className="text-green-700 dark:text-green-400 font-bold transition-colors">Enrolled Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                 <span className="flex h-3 w-3 relative">
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300 dark:bg-slate-600"></span>
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400 font-semibold transition-colors">Not Enrolled</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        {paymentStatus === 'success' ? (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                {assessmentData && (
                                                    <button 
                                                        onClick={() => setShowAssessment(true)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-green-200 dark:border-green-800 text-sm font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 shadow-sm transition-all group"
                                                    >
                                                        <DocumentTextIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                                                        View Report
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={handleDataAssessment}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 shadow-sm transition-all group"
                                                >
                                                    <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                                    {assessmentData ? 'Re-Assess AI' : 'AI Assessment'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        console.log("Navigating to Course page...");
                                                        navigate('/course');
                                                    }}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                                                >
                                                    Go to Course <span className="ml-2">→</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handlePayment} 
                                                disabled={paymentStatus === 'loading'}
                                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md transform hover:-translate-y-0.5 transition-all"
                                            >
                                                {paymentStatus === 'loading' ? 'Processing...' : 'Enroll Now @ ₹199'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                             </div>
                         </div>
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
