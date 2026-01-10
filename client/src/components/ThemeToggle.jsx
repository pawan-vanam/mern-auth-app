import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${theme === 'dark' ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}
            `}
            aria-label="Toggle Dark Mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className="relative w-6 h-6">
                 {/* Sun Icon */}
                <SunIcon 
                    className={`
                        absolute inset-0 w-6 h-6 transform transition-transform duration-500 rotate-0
                        ${theme === 'dark' ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
                    `} 
                />
                {/* Moon Icon */}
                <MoonIcon 
                     className={`
                        absolute inset-0 w-6 h-6 transform transition-transform duration-500 rotate-0
                        ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
                    `}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
