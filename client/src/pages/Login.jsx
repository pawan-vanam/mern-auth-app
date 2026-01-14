import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, isLoading } = useAuth();
    const navigate = useNavigate();

    const startGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const { success, role } = await googleLogin(tokenResponse.access_token);
            if (success) {
                if (role === 'admin') navigate('/admin/dashboard');
                else navigate('/dashboard');
            }
        },
        onError: () => {
            console.log('Login Failed');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success, role } = await login(email, password);
        if (success) {
            if (role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg transition-colors duration-200">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        Or{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
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
                        <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
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
                            <div className="w-full border-t border-gray-300 dark:border-gray-600 transition-colors"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center w-full">
                        <button
                            onClick={() => startGoogleLogin()}
                            className="group flex items-center gap-2 rounded-full bg-[#1877F2] p-1 pr-4 text-sm font-semibold text-white shadow-md hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                                <GoogleIcon />
                            </div>
                            <span>Sign in with Google</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
