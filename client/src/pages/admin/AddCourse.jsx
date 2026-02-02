import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Input from '../../components/Input';
import Button from '../../components/Button';
import IconPicker from '../../components/IconPicker';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AddCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        category: 'IT',
        categoryCode: 'IT',
        instructor: '',
        instructor: '',
        duration: '',
        price: 199,
        icon: 'Globe' // Default icon
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await axios.get(`/courses/${id}`);
            if (data.success) {
                const c = data.data;
                setFormData({
                    title: c.title,
                    shortDescription: c.shortDescription,
                    description: c.description,
                    category: c.category,
                    categoryCode: c.categoryCode,
                    instructor: c.instructor,
                    instructor: c.instructor,
                    duration: c.duration,
                    price: c.price,
                    icon: c.icon || 'Globe'
                });
            }
        } catch (error) {
            toast.error('Failed to load course details');
            navigate('/admin/courses');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditMode) {
                await axios.put(`/courses/${id}`, formData);
                toast.success('Course updated successfully');
            } else {
                await axios.post('/courses', formData);
                toast.success('Course created successfully');
            }
            navigate('/admin/courses');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
             <button
                onClick={() => navigate('/admin/courses')}
                className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Courses
            </button>
            
            <div className="bg-white dark:bg-slate-800 shadow sm:rounded-lg border border-gray-100 dark:border-slate-700 p-6">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Fill in the details below. Icons and themes will be auto-assigned based on the title.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label="Course Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Full Stack Web Development"
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            >
                                <option value="IT">IT & Software</option>
                                <option value="Data Science (DS)">Data Science (DS)</option>
                                <option value="CS">Computer Science (CS)</option>
                                <option value="Management">Management</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                         <div className="sm:col-span-1">
                            <Input
                                label="Category Code (Badge)"
                                name="categoryCode"
                                value={formData.categoryCode}
                                onChange={handleChange}
                                placeholder="e.g. IT, DS, PG"
                                required
                            />
                        </div>

                        {/* Icon Picker */}
                        <div className="sm:col-span-2">
                            <IconPicker
                                selectedIcon={formData.icon}
                                onSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
                            />
                        </div>

                        <div className="sm:col-span-2">
                             <Input
                                label="Short Description (Card)"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                placeholder="Brief summary for the dashboard card..."
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Description
                            </label>
                             <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Detailed description for the course page..."
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <Input
                                label="Instructor Name"
                                name="instructor"
                                value={formData.instructor}
                                onChange={handleChange}
                                placeholder="e.g. Dr. John Doe"
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <Input
                                label="Duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 6 Months"
                                required
                            />
                        </div>
                        
                         <div className="sm:col-span-1">
                            <Input
                                label="Price (₹)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-5">
                        <Button type="button" onClick={() => navigate('/admin/courses')} className="mr-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {isEditMode ? 'Update Course' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCourse;
