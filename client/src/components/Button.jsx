import { Loader2 } from "lucide-react";

const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, disabled = false, className = '' }) => {
  const baseStyles = "w-full py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
    </button>
  );
};

export default Button;
