import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeftIcon, 
    CodeBracketIcon, 
    PhotoIcon,
    DocumentTextIcon,
    FolderIcon,
    ArrowDownTrayIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import ThemeToggle from '../components/ThemeToggle';

const UploadedFiles = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    // Simple helper to convert slug to Title Case
    const courseName = courseId ? courseId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Full Stack Web Development';

    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const modules = [
        { id: 1, title: 'HTML', description: 'Structure of the web' },
        { id: 2, title: 'CSS', description: 'Styling and Responsive Design' },
        { id: 3, title: 'JavaScript', description: 'Interactive logic and DOM manipulation' },
        { id: 4, title: 'React JS', description: 'Building modern user interfaces' },
        { id: 5, title: 'Node.js', description: 'Server-side programming' },
        { id: 6, title: 'MongoDB', description: 'NoSQL Database integration' }
    ];

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                // Use the derived courseName for the API call
                const { data } = await axios.get(`/upload/${encodeURIComponent(courseName)}`);
                if (data.success) {
                    setFiles(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch files", err);
                setError("Could not load your uploaded files.");
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const getFilesForModule = (moduleId) => {
        return files.filter(f => f.step === moduleId);
    };

    const handleDelete = async (fileId, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;

        try {
            await axios.delete(`/upload/${fileId}`);
            setFiles(prev => prev.filter(f => f._id !== fileId));
            // toast.success("File deleted successfully"); // Removed toast import to minimize changes, but could add if needed.
        } catch (err) {
            console.error("Delete failed", err);
            setError("Failed to delete file");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                     <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="group flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Course
                        </button>
                         <div className="sm:hidden">
                             {/* Mobile Toggle optional placement */}
                         </div>
                     </div>
                   
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
                                Your Uploaded Files
                            </h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 transition-colors">
                                Browse all your submitted code assignments and screenshots.
                            </p>
                        </div>
                         <div className="flex items-center gap-4">
                             <ThemeToggle />
                            <div className="hidden sm:block">
                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors">
                                    <FolderIcon className="h-7 w-7" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-900/50 transition-colors">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {modules.map((module) => {
                        const moduleFiles = getFilesForModule(module.id);
                        if (moduleFiles.length === 0) return null; 
                        
                        return (
                            <div key={module.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
                                <div className="bg-gray-50/50 dark:bg-slate-700/30 px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                            {module.id}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{module.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{module.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full transition-colors">
                                        {moduleFiles.length} File{moduleFiles.length !== 1 && 's'}
                                    </span>
                                </div>
                                
                                <div className="p-6">
                                    {moduleFiles.length > 0 ? (
                                        <div className="flex flex-wrap gap-4">
                                            {moduleFiles.map((file) => (
                                                <div key={file._id} className="group flex items-center p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/50 transition-all w-full sm:w-auto max-w-full bg-white dark:bg-slate-700/20">
                                                    <div className="flex items-center min-w-0 flex-1 sm:flex-initial">
                                                        <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center mr-3 
                                                            ${file.type === 'code' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'} transition-colors`}>
                                                            {file.type === 'code' ? <CodeBracketIcon className="h-6 w-6" /> : <PhotoIcon className="h-6 w-6" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1 sm:flex-initial mr-2">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] transition-colors" title={file.originalName}>
                                                                {file.originalName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 transition-colors">
                                                                <span className="capitalize">{file.type}</span>
                                                                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                                <span>{(file.size / 1024).toFixed(1)} KB</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDelete(file._id, file.originalName)}
                                                        className="ml-2 p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Delete File"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm italic transition-colors">
                                            No files uploaded for this section yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UploadedFiles;
