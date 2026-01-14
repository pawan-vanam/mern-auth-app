import { useState, useEffect } from 'react';
import axios from 'axios';
import { UsersIcon, BookOpenIcon, AcademicCapIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalUsers: 0, // Placeholder
        revenue: 0 // Placeholder
    });
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // For now, just count courses. We could add dedicated stats endpoints later.
                const { data } = await axios.get('/courses');
                if (data.success) {
                    setStats(prev => ({ ...prev, totalCourses: data.count }));
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { name: 'Total Courses', value: stats.totalCourses, icon: BookOpenIcon, color: 'bg-blue-500' },
        { name: 'Active Students', value: '120+', icon: UsersIcon, color: 'bg-green-500' }, 
        { name: 'Total Revenue', value: '₹24,500', icon: CurrencyRupeeIcon, color: 'bg-purple-500' },
        { name: 'Completions', value: '15', icon: AcademicCapIcon, color: 'bg-orange-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((item) => (
                    <div key={item.name} className="relative bg-white dark:bg-slate-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color} text-white`}>
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-1 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No recent activity log implemented yet.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
