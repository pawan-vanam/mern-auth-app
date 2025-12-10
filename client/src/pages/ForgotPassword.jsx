import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { forgotPassword, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success } = await forgotPassword(email);
        if (success) {
            navigate('/verify-reset-code', { state: { email } });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Forgot Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Send Reset Code
                    </Button>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Back to Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
