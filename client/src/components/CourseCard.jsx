import React from 'react';
import { ClockIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import * as LucideIcons from 'lucide-react';

const getIcon = (iconName) => {
    // Dynamic Icon Rendering from Lucide
    // Capitalize first letter if needed, though Lucide exports are PascalCase
    // We assume backend stores "Globe", "Code" etc or lowercase "globe" -> "Globe"
    
    // Normalize name to PascalCase for lookup
    const normalize = (str) => {
        if (!str) return 'Globe';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const normalizedName = normalize(iconName);
    const IconComponent = LucideIcons[normalizedName] || LucideIcons[iconName] || LucideIcons.Globe;
    
    return <IconComponent className="w-12 h-12 text-white" />;
};

const getThemeColor = (theme) => {
    switch (theme) {
        case 'green': return 'bg-[#00C985]'; // Custom green from image
        case 'blue': return 'bg-[#0091FF]'; // Custom blue from image
        case 'orange': return 'bg-[#FF9900]'; // Custom orange from image
        default: return 'bg-indigo-600';
    }
};

const CourseCard = ({ course, onClick }) => {
    const { 
        category, 
        categoryCode,
        title, 
        description, 
        duration, 
        tags, 
        theme, 
        icon 
    } = course;

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col h-full group cursor-pointer"
        >
            {/* Header Section */}
            <div className={`${getThemeColor(theme)} p-6 relative h-48 flex flex-col justify-between transition-colors`}>
                <div className="flex justify-end">
                     <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm uppercase tracking-wide">
                        {categoryCode}
                    </span>
                </div>
                <div className="flex justify-center items-center flex-grow">
                     {getIcon(icon)}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className={`text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider ${
                                tag.type === 'primary' 
                                    ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300' 
                                    : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            }`}
                        >
                            {tag.label}
                        </span>
                    ))}
                </div>

                {/* Title & Description */}
                <div className="mb-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                        {description}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        {duration}
                    </div>
                    <button className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center hover:underline bg-transparent p-0 group-hover:translate-x-1 transition-transform">
                        View Details
                        <ArrowLongRightIcon className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
