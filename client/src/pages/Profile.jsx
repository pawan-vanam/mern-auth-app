import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { 
    UserIcon, 
    PhoneIcon, 
    CalendarIcon, 
    UsersIcon, 
    ArrowLeftIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'; // Using outline icons

const Profile = () => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // ... same state ...
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: 'Male'
    });

    // ... same useEffect ...
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/profile');
                if (data.success && data.data) {
                    const profile = data.data;
                    setFormData({
                        name: profile.name || '',
                        phoneNumber: profile.phoneNumber || '',
                        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '', 
                        gender: profile.gender || 'Male'
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response?.status !== 404) {
                    toast.error('Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.post('/profile', formData);
            if (data.success) {
                await refreshUser(); // Update global user context immediately
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                
                {/* Header with Back Button */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            Edit Profile
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your personal information and preferences.
                        </p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-purple-600 h-2 w-full"></div> {/* Accent Bar */}
                    
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section: Personal Details */}
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 mb-6 border-b pb-2">
                                <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                                Personal Details
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                
                                {/* Full Name */}
                                <div className="sm:col-span-6">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5 border transition-shadow"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="sm:col-span-3">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                           <span className="text-gray-500 sm:text-sm font-medium pr-1 border-r border-gray-300 mr-2">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            pattern="[0-9]{10}"
                                            placeholder="98765 43210"
                                            title="Please enter a valid 10-digit phone number"
                                            className="block w-full pl-16 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5 border transition-shadow"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="sm:col-span-3">
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                        Date of Birth
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            id="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="block w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5 border transition-shadow"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="sm:col-span-3">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        Gender
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <select
                                            name="gender"
                                            id="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5 border transition-shadow bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Transgender">Transgender</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-5 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button 
                                type="submit" 
                                disabled={saving}
                                className="w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
