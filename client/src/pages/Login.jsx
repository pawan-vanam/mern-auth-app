import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success } = await login(email, password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            create a new account
                        </Link>
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
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500">
                            Forgot your password?
                        </Link>
                    </div>
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Sign in
                    </Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center w-full">
                         <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const { success } = await googleLogin(credentialResponse.credential);
                                if (success) {
                                    navigate('/dashboard');
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            useOneTap
                            containerProps={{
                                style: {
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
