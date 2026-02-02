import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';

import axios from 'axios'; // Ensure axios is imported or use a configured instance

const VerifyEmail = () => {
    const [code, setCode] = useState('');
    const { verifyEmail, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email not found. Please sign up again.');
            return;
        }
        const { success } = await verifyEmail(email, code);
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleResend = async () => {
        if (!email) return;
        try {
            toast.loading('Sending new code...');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${API_URL}/auth/resend-verification`, { email });
            toast.dismiss();
            toast.success('Verification code resent! Check your email.');
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to resend code');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg transition-colors duration-200">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">Verify your email</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        We sent a verification code to <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Verify Email
                    </Button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                            Didn't receive code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
