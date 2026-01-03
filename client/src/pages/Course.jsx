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
                <div className="space-y-6">
                    {modules.map((module) => (
                        <div 
                            key={module.id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="p-6 md:flex md:items-start md:justify-between gap-6">
                                
                                {/* Module Info */}
                                <div className="flex items-start gap-4 flex-1 mb-6 md:mb-0">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md md:h-12 md:w-12">
                                        {module.id}
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {module.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Container */}
                                <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[400px]">
                                    
                                    {/* Upload Rows */}
                                    {['code', 'screenshot'].map(type => {
                                        const key = `${module.id}-${type}`;
                                        const selectedFile = selectedFiles[key];
                                        const status = uploadStatus[key];
                                        const isCode = type === 'code';
                                        
                                        return (
                                            <div key={type} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                                        {isCode ? <CodeBracketIcon className="w-4 h-4" /> : <PhotoIcon className="w-4 h-4" />}
                                                        {type} Source
                                                    </span>
                                                    {status === 'success' && (
                                                        <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                                            <CheckCircleIcon className="w-3 h-3" /> Uploaded
                                                        </span>
                                                    )}
                                                </div>

                                                {!selectedFile ? (
                                                    // State: No File Selected
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="file" 
                                                            ref={el => fileInputRefs.current[key] = el} 
                                                            className="hidden" 
                                                            accept={isCode ? "*" : "image/*"}
                                                            onChange={(e) => onFileChange(e, module.id, type)}
                                                        />
                                                        <button 
                                                            onClick={() => handleFileSelect(module.id, type)}
                                                            className="w-full py-2 px-4 bg-white border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <DocumentIcon className="w-4 h-4" />
                                                            Select {type === 'code' ? 'File' : 'Image'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // State: File Selected
                                                    <div className="flex items-center gap-2 animate-fadeIn">
                                                        <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2 overflow-hidden">
                                                            <DocumentIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700 truncate font-medium">
                                                                {selectedFile.name}
                                                            </span>
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={() => removeFile(module.id, type)}
                                                            disabled={status === 'uploading'}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                            title="Remove file"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>

                                                        <button 
                                                            onClick={() => uploadFile(module.id, type)}
                                                            disabled={status === 'uploading'}
                                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                                                        >
                                                            {status === 'uploading' ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <CloudArrowUpIcon className="w-4 h-4" />
                                                            )}
                                                            Upload
                                                        </button>
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
