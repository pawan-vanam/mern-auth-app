import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
    </div>
  );
};

export default Loader;
