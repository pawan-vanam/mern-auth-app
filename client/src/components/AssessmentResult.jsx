import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const AssessmentResult = ({ open, onClose, result, isLoading }) => {
    
    if (isLoading) {
        return (
             <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                           <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg p-6 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">AI Assessment in Progress...</h3>
                                <p className="mt-2 text-sm text-gray-500">Analyzing your code and screenshots. This may take a few moments.</p>
                           </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        )
    }

    if (!result) return null;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('good') || s.includes('excellent')) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        if (s.includes('improve')) return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white flex items-center gap-2">
                                            <ShieldCheckIcon className="h-6 w-6" />
                                            AI Assessment Report
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="rounded-md bg-white/20 text-white hover:bg-white/30 focus:outline-none p-1"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="mt-2 text-indigo-100">
                                        Course: {result.courseName}
                                    </p>
                                </div>
                                
                                <div className="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
                                    {/* Overall Score Section */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Overall Performance</h4>
                                            <p className="text-gray-600">{result.summary}</p>
                                        </div>
                                        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-center justify-center min-w-[120px]">
                                            <div className={`text-4xl font-extrabold ${getScoreColor(result.overallScore)}`}>
                                                {result.overallScore}%
                                            </div>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Total Score</span>
                                        </div>
                                    </div>

                                    {/* Detailed Sections */}
                                    <div className="space-y-6">
                                        <h4 className="text-md font-bold text-gray-900 border-b pb-2">Section Analysis</h4>
                                        
                                        {result.sections && result.sections.map((section, idx) => (
                                            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(section.status)}
                                                        <h5 className="font-semibold text-gray-800">{section.name}</h5>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                     <p className="text-sm text-gray-600 leading-relaxed">
                                                        <span className="font-medium text-gray-900">Feedback: </span>
                                                        {section.feedback}
                                                     </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto transition-all"
                                        onClick={onClose}
                                    >
                                        Close Report
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default AssessmentResult;
