import React from 'react';
import type { AnalysisHistoryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { Spinner } from './Spinner';

interface AnalysisHistoryProps {
    history: AnalysisHistoryItem[];
    isLoading: boolean;
    onSelectItem: (item: AnalysisHistoryItem) => void;
    onClearHistory: () => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, isLoading, onSelectItem, onClearHistory }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Analysis History</h2>
                    <p className="text-slate-500">Review your past slide analyses.</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={onClearHistory}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-lg hover:bg-red-50"
                    >
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Clear History
                    </button>
                )}
            </div>

            {isLoading ? (
                 <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <Spinner />
                    <p className="ml-4 text-slate-500">Loading history...</p>
                 </div>
            ) : history.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <p className="text-slate-500 text-lg">You have no analysis history yet.</p>
                    <p className="text-slate-400 mt-2">Upload and analyze a slide to start building your history.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className="w-full text-left flex items-center p-4 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-sky-300 transition-all duration-300 group"
                        >
                            <img src={item.imageUrl} alt="Slide thumbnail" className="w-24 h-24 rounded-lg object-cover mr-6 border border-slate-100" />
                            <div className="flex-grow">
                                <p className="font-semibold text-lg text-slate-800">{item.result.differentialDiagnosis}</p>
                                <p className="text-sm text-slate-500 mt-1">{formatDate(item.date)}</p>
                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.result.overallImpression}</p>
                            </div>
                            <ChevronRightIcon className="h-6 w-6 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};