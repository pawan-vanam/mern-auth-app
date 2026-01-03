import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    ArrowLeftIcon, 
    CodeBracketIcon, 
    PhotoIcon,
    CheckCircleIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const Course = () => {
    const navigate = useNavigate();

    const modules = [
        { id: 1, title: 'HTML', description: 'Structure of the web' },
        { id: 2, title: 'CSS', description: 'Styling and Responsive Design' },
        { id: 3, title: 'JavaScript', description: 'Interactive logic and DOM manipulation' },
        { id: 4, title: 'React JS', description: 'Building modern user interfaces' },
        { id: 5, title: 'Node.js', description: 'Server-side programming' },
        { id: 6, title: 'MongoDB', description: 'NoSQL Database integration' }
    ];

    const [uploading, setUploading] = useState(false);
    
    // Debug: Check if component mounts
    useState(() => {
        console.log("Course Component Mounted!");
    }, []);

    // Refs to trigger hidden file inputs
    const fileInputRefs = useRef({});

    const handleFileSelect = (step, type) => {
        console.log(`Triggering file input for: ${step}-${type}`);
        const inputRef = fileInputRefs.current[`${step}-${type}`];
        if (inputRef) {
            inputRef.click();
        } else {
            console.error(`Ref not found for: ${step}-${type}`);
        }
    };

    const handleUpload = async (e, courseName, step, type) => {
        console.log("File selected:", e.target.files[0]);
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('courseName', courseName);
        formData.append('step', step);
        formData.append('type', type);
        formData.append('file', file);

        setUploading(true);
        const toastId = toast.loading('Uploading...');

        try {
            const { data } = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success('Upload successful!', { id: toastId });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || 'Upload failed';
            toast.error(msg, { id: toastId });
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Full Stack Web Development
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Complete the assignments for each module to progress.
                        </p>
                    </div>
                </div>

                {/* Modules List */}
                <div className="space-y-6">
                    {modules.map((module) => (
                        <div 
                            key={module.id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6 md:flex md:items-center md:justify-between gap-6">
                                
                                {/* Module Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100">
                                        {module.id}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {module.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                                    
                                    {/* Upload Code Button */}
                                    <input 
                                        type="file" 
                                        ref={el => fileInputRefs.current[`${module.id}-code`] = el} 
                                        className="hidden" 
                                        onChange={(e) => handleUpload(e, 'Full Stack Web Development', module.id, 'code')}
                                    />
                                    <button 
                                        onClick={() => handleFileSelect(module.id, 'code')}
                                        disabled={uploading}
                                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        <CodeBracketIcon className="h-4 w-4 mr-2 text-blue-500" />
                                        Upload Code
                                    </button>

                                    {/* Upload Screenshot Button */}
                                    <input 
                                        type="file" 
                                        ref={el => fileInputRefs.current[`${module.id}-screenshot`] = el} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e, 'Full Stack Web Development', module.id, 'screenshot')}
                                    />
                                    <button 
                                        onClick={() => handleFileSelect(module.id, 'screenshot')}
                                        disabled={uploading}
                                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        <PhotoIcon className="h-4 w-4 mr-2 text-purple-500" />
                                        Upload Screenshot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Course;
