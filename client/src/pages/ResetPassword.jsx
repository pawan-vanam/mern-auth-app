import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resetPassword, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const code = location.state?.code;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !code) {
             toast.error('Missing verification info. Please start over.');
             navigate('/forgot-password');
             return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const { success } = await resetPassword(email, code, password);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create a new strong password for your account.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Save Changes
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
