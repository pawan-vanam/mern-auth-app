import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    ArrowLeftIcon, 
    CodeBracketIcon, 
    PhotoIcon,
    CheckCircleIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    SparklesIcon,
    DocumentTextIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ThemeToggle';
import AssessmentResult from '../components/AssessmentResult';
import Loader from '../components/Loader';

const Course = () => {
    const navigate = useNavigate();
    const { courseId } = useParams(); // This is the Slug actually
    
    // State
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [showAssessment, setShowAssessment] = useState(false);
    const [assessmentData, setAssessmentData] = useState(null);
    const [isAssessing, setIsAssessing] = useState(false);
    
    const fileInputRefs = useRef({});

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const { data } = await axios.get(`/courses/slug/${courseId}`);
                if (data.success) {
                    setCourseData(data.data);
                } else {
                    toast.error("Course not found");
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
                toast.error("Failed to load course details");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId, navigate]);

    useEffect(() => {
        if (!courseData) return;
        
        const fetchUserStatus = async () => {
            try {
                // Pass courseData._id (which is the actual DB ID) not courseId (which is slug)
                const { data } = await axios.get('/payment/user-status', {
                    params: { courseId: courseData._id }
                });
                if (data.isPaid) {
                    setPaymentStatus('success');
                }
            } catch (error) {
                console.error("Failed to fetch user payment status", error);
            }
        };

         const fetchAssessmentStatus = async () => {
            try {
                const { data } = await axios.get(`/assessment/${encodeURIComponent(courseData.title)}`);
                if (data.success && data.data) {
                    setAssessmentData(data.data);
                }
            } catch (error) {
                // Silent fail
            }
        };

        fetchUserStatus();
        fetchAssessmentStatus();
    }, [courseData]);

    const handlePayment = async () => {
        try {
            setPaymentStatus('loading');
            const { data } = await axios.post('/payment/pay', { 
                amount: courseData.price,
                courseId: courseData._id 
            });
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || 'Payment initiation failed');
                setPaymentStatus('failed');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
            setPaymentStatus('failed');
        }
    };

    const handleDataAssessment = async () => {
        setIsAssessing(true);
        setShowAssessment(true);
        try {
            const { data } = await axios.post('/assessment', { 
                courseName: courseData.title 
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

    // File Handling
    const handleFileSelect = (module, type) => {
        const key = `${module}-${type}`;
        fileInputRefs.current[key]?.click();
    };

    const onFileChange = (e, module, type) => {
        const file = e.target.files[0];
        if (file) {
            const key = `${module}-${type}`;
            setSelectedFiles(prev => ({ ...prev, [key]: file }));
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
        }
        e.target.value = null;
    };

    const removeFile = (module, type) => {
        const key = `${module}-${type}`;
        setSelectedFiles(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
        setUploadStatus(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    const uploadFile = async (module, type) => {
        const key = `${module}-${type}`;
        const file = selectedFiles[key];
        
        if (!file) {
            toast.error("No file selected!");
            return;
        }

        setUploadStatus(prev => ({ ...prev, [key]: 'uploading' }));
        const toastId = toast.loading(`Uploading ${type}...`);

        const formData = new FormData();
        formData.append('courseName', courseData.title);
        formData.append('step', module);
        formData.append('type', type);
        formData.append('file', file);

        try {
            const { data } = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success('Upload complete!', { id: toastId });
                setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
                setSelectedFiles(prev => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || 'Upload failed';
            toast.error(msg, { id: toastId });
            setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        }
    };

    if (loading) return <Loader />;
    if (!courseData) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 transition-colors"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
                                    {courseData.title}
                                </h1>
                                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl transition-colors">
                                    {courseData.description}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ThemeToggle />
                            </div>
                        </div>

                         {/* Action Bar */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-gray-100 dark:border-slate-700 pt-6">
                            {paymentStatus === 'success' ? (
                                <>
                                    <div className="flex-1 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => navigate(`/uploaded-files/${courseId}`)}
                                            className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                        >
                                            <CloudArrowUpIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-400 group-hover:text-indigo-500" />
                                            Uploaded Files
                                        </button>

                                        <button 
                                            onClick={handleDataAssessment}
                                            className="inline-flex items-center px-4 py-2 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 shadow-sm transition-all group"
                                        >
                                            <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                            {assessmentData ? 'Re-Assess AI' : 'AI Assessment'}
                                        </button>
                                        
                                        {assessmentData && (
                                            <button 
                                                onClick={() => setShowAssessment(true)}
                                                className="inline-flex items-center px-4 py-2 border border-green-200 dark:border-green-800 text-sm font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 shadow-sm transition-all group"
                                            >
                                                <DocumentTextIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                                                View Report
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm">
                                        <CheckCircleIcon className="w-5 h-5" /> Enrolled
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex justify-between items-center bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <div className="text-orange-800 dark:text-orange-200">
                                        <span className="font-bold block">Enroll to access course content</span>
                                        <span className="text-sm opacity-80">Get full access to lectures, assignments, and AI assessment.</span>
                                    </div>
                                    <button 
                                        onClick={handlePayment} 
                                        disabled={paymentStatus === 'loading'}
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {paymentStatus === 'loading' ? 'Processing...' : `Enroll Now @ ₹${courseData.price}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {paymentStatus === 'success' ? (
                     <div className="space-y-3">
                        {courseData.modules.map((module) => (
                            <div 
                                key={module.id || module._id} 
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {module.id}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        {['code', 'screenshot'].map(type => {
                                            const key = `${module.id || module._id}-${type}`;
                                            const selectedFile = selectedFiles[key];
                                            const status = uploadStatus[key];
                                            const isCode = type === 'code';
                                            
                                            return (
                                                <div key={type} className={`
                                                    relative group transition-all duration-200 rounded-lg border h-10 flex items-center px-3
                                                    ${!selectedFile 
                                                        ? 'bg-gray-50/50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700 cursor-pointer w-auto' 
                                                        : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600'}
                                                `}>
                                                    {!selectedFile ? (
                                                        <div 
                                                            className="flex items-center gap-3 cursor-pointer"
                                                            onClick={() => handleFileSelect(module.id || module._id, type)}
                                                        >
                                                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {isCode ? <CodeBracketIcon className="w-4 h-4" /> : <PhotoIcon className="w-4 h-4" />}
                                                                {type}
                                                            </span>
                                                            <div className="w-px h-4 bg-gray-200 dark:bg-slate-600 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors"></div>
                                                            <div className="flex items-center">
                                                                <input 
                                                                    type="file" 
                                                                    ref={el => fileInputRefs.current[key] = el} 
                                                                    className="hidden" 
                                                                    accept={isCode ? "*" : "image/*"}
                                                                    onChange={(e) => onFileChange(e, module.id || module._id, type)}
                                                                    onClick={(e) => e.stopPropagation()} 
                                                                />
                                                                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                                                    + Select
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[250px]">
                                                            <button
                                                                onClick={() => removeFile(module.id || module._id, type)}
                                                                className="flex items-center gap-2 min-w-0 flex-1 text-left focus:outline-none group/file overflow-hidden"
                                                                title="Remove file"
                                                                disabled={status === 'uploading'}
                                                            >
                                                                {isCode ? (
                                                                    <DocumentIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/file:text-red-500 transition-colors flex-shrink-0" />
                                                                ) : (
                                                                    <PhotoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/file:text-red-500 transition-colors flex-shrink-0" />
                                                                )}
                                                                <span className="text-xs text-gray-700 dark:text-gray-200 font-medium truncate group-hover/file:text-red-600 dark:group-hover/file:text-red-400 transition-colors">
                                                                    {selectedFile.name}
                                                                </span>
                                                                <XMarkIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover/file:text-red-500 opacity-0 group-hover/file:opacity-100 transition-all flex-shrink-0" />
                                                            </button>
                                                            <div className="flex-shrink-0 ml-1">
                                                                {status === 'success' ? (
                                                                    <span className="text-green-500 flex items-center justify-center">
                                                                        <CheckCircleIcon className="w-5 h-5" />
                                                                    </span>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => uploadFile(module.id || module._id, type)}
                                                                        disabled={status === 'uploading'}
                                                                        className="h-7 w-7 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                                                                        title="Upload"
                                                                    >
                                                                        {status === 'uploading' ? (
                                                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        ) : (
                                                                            <CloudArrowUpIcon className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                            <BookOpenIcon className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Content Locked</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Enroll in this course to gain access to all {courseData.modules.length} modules, assignments, and AI-powered assessments.
                        </p>
                    </div>
                )}
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

export default Course;
