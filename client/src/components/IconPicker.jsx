import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';

const IconPicker = ({ selectedIcon, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Get all icon names
    const iconNames = useMemo(() => Object.keys(LucideIcons), []);

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!searchTerm) return iconNames.slice(0, 100); // Limit initial view for performance
        return iconNames.filter(name => 
            name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 100); // Limit results for performance
    }, [searchTerm, iconNames]);

    const SelectedIconComponent = selectedIcon && LucideIcons[selectedIcon] ? LucideIcons[selectedIcon] : LucideIcons.HelpCircle;

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Icon
            </label>
            
            <div className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-indigo-100 dark:bg-slate-600 rounded">
                            <SelectedIconComponent size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span>{selectedIcon || 'Select an icon...'}</span>
                    </div>
                    <LucideIcons.ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl max-h-96 flex flex-col">
                        {/* Search Bar */}
                        <div className="p-3 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search icons..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Icon Grid */}
                        <div className="overflow-y-auto p-2 flex-1">
                            {filteredIcons.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No icons found</div>
                            ) : (
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {filteredIcons.map((iconName) => {
                                        const Icon = LucideIcons[iconName];
                                        if (!Icon) return null;
                                        
                                        const isSelected = selectedIcon === iconName;
                                        
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => {
                                                    onSelect(iconName);
                                                    setIsOpen(false);
                                                }}
                                                className={`p-2 rounded-md flex flex-col items-center justify-center gap-1 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors ${
                                                    isSelected ? 'bg-indigo-100 dark:bg-slate-600 ring-2 ring-indigo-500' : ''
                                                }`}
                                                title={iconName}
                                            >
                                                <Icon size={24} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default IconPicker;
