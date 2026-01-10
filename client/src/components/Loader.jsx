import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-500 animate-spin" />
    </div>
  );
};

export default Loader;
