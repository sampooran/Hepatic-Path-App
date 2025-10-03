import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface HeaderProps {
    userProfile: UserProfile;
    onLogout: () => void;
    setView: (view: 'analyzer' | 'profile' | 'history') => void;
}

const MicroscopeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l-3 3m0 0l-1-1m1 1l-3 3" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ userProfile, onLogout, setView }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (view: 'analyzer' | 'profile' | 'history') => {
        setView(view);
        setDropdownOpen(false);
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-10 border-b border-slate-200">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleNavigate('analyzer')}
                >
                    <MicroscopeIcon className="w-8 h-8 text-sky-600 mr-3"/>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight hidden sm:block">
                        Liver Pathology Slide Analyzer
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleNavigate('history')}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="View analysis history"
                    >
                        <HistoryIcon className="w-6 h-6 text-slate-600" />
                        <span className="font-semibold text-slate-700 hidden sm:block">History</span>
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)} 
                            className="flex items-center space-x-2 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <img src={userProfile.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-slate-200" />
                            <span className="font-semibold text-slate-700 hidden md:block">{userProfile.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-slate-200">
                                <button
                                    onClick={() => handleNavigate('profile')}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                >
                                    <UserCircleIcon className="w-5 h-5 mr-3" />
                                    My Profile
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                >
                                    <LogoutIcon className="w-5 h-5 mr-3" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};