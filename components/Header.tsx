
import React from 'react';

const MicroscopeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l-3 3m0 0l-1-1m1 1l-3 3" />
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10 border-b border-slate-200">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <MicroscopeIcon className="w-8 h-8 text-sky-600 mr-3"/>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Liver Pathology Slide Analyzer
                </h1>
            </div>
        </header>
    );
};
