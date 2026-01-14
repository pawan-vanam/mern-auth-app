import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, name, type = 'text', placeholder, value, onChange, required = false, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-500 pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
