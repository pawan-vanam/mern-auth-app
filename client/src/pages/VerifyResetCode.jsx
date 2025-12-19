import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const VerifyResetCode = () => {
    const [code, setCode] = useState('');
    const { verifyResetCode, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email not found. Please start over.');
            navigate('/forgot-password');
            return;
        }
        const { success } = await verifyResetCode(email, code);
        if (success) {
            navigate('/reset-password', { state: { email, code } });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify Code</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the code sent to <span className="font-bold">{email}</span>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Reset Code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Verify Code
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default VerifyResetCode;
