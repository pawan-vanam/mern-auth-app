import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    ArrowLeftIcon, 
    CodeBracketIcon, 
    PhotoIcon,
    CheckCircleIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon
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

    // State to store selected but not uploaded files
    // Format: { 'modId-type': FileObj }
    const [selectedFiles, setSelectedFiles] = useState({});
    
    // State to track upload progress/status
    // Format: { 'modId-type': 'idle' | 'uploading' | 'success' | 'error' }
    const [uploadStatus, setUploadStatus] = useState({});

    // Refs to trigger hidden file inputs
    const fileInputRefs = useRef({});

    const handleFileSelect = (module, type) => {
        const key = `${module}-${type}`;
        fileInputRefs.current[key]?.click();
    };

    const onFileChange = (e, module, type) => {
        const file = e.target.files[0];
        if (file) {
            const key = `${module}-${type}`;
            setSelectedFiles(prev => ({ ...prev, [key]: file }));
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' })); // Reset status on new selection
        }
        e.target.value = null; // Reset input to allow selecting same file again
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
        formData.append('courseName', 'Full Stack Web Development');
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
                
                // Optional: Clear selection after success or keep it to show "Done" state
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight relative z-10">
                            Full Stack Web Development
                        </h1>
                        <p className="mt-2 text-gray-500 max-w-2xl relative z-10">
                            Upload your assignments code and screenshots below. Your progress is tracked automatically.
                        </p>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="space-y-4">
                    {modules.map((module) => (
                        <div 
                            key={module.id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                            <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                                
                                {/* Module Info - Adaptive Width */}
                                <div className="flex items-center gap-4 lg:w-[280px] flex-shrink-0">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {module.id}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 truncate">
                                            {module.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Container - Compact Grid */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                    
                                    {/* Upload Rows */}
                                    {['code', 'screenshot'].map(type => {
                                        const key = `${module.id}-${type}`;
                                        const selectedFile = selectedFiles[key];
                                        const status = uploadStatus[key];
                                        const isCode = type === 'code';
                                        
                                        return (
                                            <div key={type} className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-50/80 rounded-lg border border-gray-100/50 hover:border-gray-200 transition-colors h-14">
                                                
                                                {!selectedFile ? (
                                                    // State: No File + Label
                                                    <>
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                            {isCode ? <CodeBracketIcon className="w-4 h-4" /> : <PhotoIcon className="w-4 h-4" />}
                                                            {type}
                                                        </span>
                                                        
                                                        <div className="relative">
                                                            <input 
                                                                type="file" 
                                                                ref={el => fileInputRefs.current[key] = el} 
                                                                className="hidden" 
                                                                accept={isCode ? "*" : "image/*"}
                                                                onChange={(e) => onFileChange(e, module.id, type)}
                                                            />
                                                            <button 
                                                                onClick={() => handleFileSelect(module.id, type)}
                                                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-white px-3 py-1.5 rounded-md transition-all shadow-sm bg-white/50 border border-gray-100 flex items-center gap-1.5"
                                                            >
                                                                + Select
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // State: File Selected
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        {/* File Name & Delete Interaction */}
                                                        <button
                                                            onClick={() => removeFile(module.id, type)}
                                                            className="flex items-center gap-2 min-w-0 flex-1 text-left focus:outline-none group"
                                                            title="Remove file"
                                                            disabled={status === 'uploading'}
                                                        >
                                                            {isCode ? <DocumentIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" /> : <PhotoIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />}
                                                            
                                                            <span className="text-xs text-gray-700 font-medium truncate group-hover:text-red-600 transition-colors">
                                                                {selectedFile.name}
                                                            </span>
                                                        </button>

                                                        {/* Upload Action */}
                                                        <div className="flex-shrink-0 ml-2">
                                                            {status === 'success' ? (
                                                                <span className="text-green-500 flex items-center justify-center p-1 bg-green-50 rounded-full">
                                                                    <CheckCircleIcon className="w-5 h-5" />
                                                                </span>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => uploadFile(module.id, type)}
                                                                    disabled={status === 'uploading'}
                                                                    className="h-8 w-8 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                                                                    title="Upload"
                                                                >
                                                                    {status === 'uploading' ? (
                                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <CloudArrowUpIcon className="w-4 h-4" />
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

            </div>
        </div>
    );
};

export default Course;
