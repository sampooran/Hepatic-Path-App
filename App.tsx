
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Spinner } from './components/Spinner';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { AnalysisHistory } from './components/AnalysisHistory';
import { analyzeLiverSlide } from './services/geminiService';
import * as apiService from './services/apiService';
import type { AnalysisResult, UserProfile, AnalysisHistoryItem, Theme } from './types';
import { XCircleIcon } from './components/icons/XCircleIcon';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentView, setCurrentView] = useState<'analyzer' | 'profile' | 'history'>('analyzer');
    
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);

    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        const checkSession = async () => {
            const profile = await apiService.checkSession();
            if (profile) {
                setUserProfile(profile);
                setIsLoggedIn(true);
            }
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (isLoggedIn && userProfile) {
            const fetchHistory = async () => {
                setIsHistoryLoading(true);
                const history = await apiService.getAnalysisHistory(userProfile.email);
                setAnalysisHistory(history);
                setIsHistoryLoading(false);
            };
            fetchHistory();
        }
    }, [isLoggedIn, userProfile]);


    const handleLogin = async (email: string, password: string): Promise<UserProfile | null> => {
        const profile = await apiService.login(email, password);
        if (profile) {
            setUserProfile(profile);
            setIsLoggedIn(true);
            setCurrentView('analyzer');
            return profile;
        }
        return null;
    };

    const handleSignUp = async (userData: Omit<UserProfile, 'email' | 'avatar'>, email: string, password: string): Promise<UserProfile | null> => {
        // FIX: The `createProfile` service requires a password property, which was missing in the call.
        const newProfile = await apiService.createProfile({ ...userData, email, password });
        if (newProfile) {
            // Automatically log in after successful registration
            return await handleLogin(email, password);
        }
        return null;
    };


    const handleLogout = async () => {
        await apiService.logout();
        setUserProfile(null);
        setIsLoggedIn(false);
        // Reset app state on logout
        handleClearAnalysis();
        setAnalysisHistory([]);
    };

    const handleProfileUpdate = async (updatedProfile: UserProfile) => {
        const profile = await apiService.updateProfile(updatedProfile);
        setUserProfile(profile);
        setCurrentView('analyzer');
    };

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = async (file: File) => {
        setImageFile(file);
        const dataUrl = await fileToDataUrl(file);
        setImageUrl(dataUrl);
        setCurrentAnalysis(null);
        setError(null);
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile || !imageUrl || !userProfile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentAnalysis(null);

        try {
            const base64ImageData = imageUrl.substring(imageUrl.indexOf(',') + 1);
            const result = await analyzeLiverSlide(base64ImageData, imageFile.type);
            
            const newHistoryItem: AnalysisHistoryItem = {
                id: new Date().toISOString(),
                date: new Date().toISOString(),
                imageUrl: imageUrl,
                result: result,
            };
            setCurrentAnalysis(newHistoryItem);

            // Save to "database" and update local state
            const updatedHistory = await apiService.saveAnalysis(userProfile.email, newHistoryItem);
            setAnalysisHistory(updatedHistory);

        } catch (err) {
            console.error(err);
            setError("An error occurred during analysis. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, imageUrl, userProfile]);
    
    const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
        setImageFile(null);
        setImageUrl(item.imageUrl);
        setCurrentAnalysis(item);
        setCurrentView('analyzer');
    };

    const handleClearHistory = async () => {
        if (!userProfile) return;
        await apiService.clearAnalysisHistory(userProfile.email);
        setAnalysisHistory([]);
    };

    const handleClearAnalysis = () => {
        setImageFile(null);
        setImageUrl(null);
        setCurrentAnalysis(null);
        setError(null);
    };

    const handleResultUpdate = async (updatedItem: AnalysisHistoryItem) => {
        if (!userProfile) return;
        setCurrentAnalysis(updatedItem);
        const updatedHistory = await apiService.updateAnalysis(userProfile.email, updatedItem);
        setAnalysisHistory(updatedHistory);
    };

    if (!isLoggedIn || !userProfile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <Auth onLogin={handleLogin} onSignUp={handleSignUp} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <Header userProfile={userProfile} onLogout={handleLogout} setView={setCurrentView} theme={theme} setTheme={setTheme} />
            <main className="container mx-auto p-4 md:p-8">
                {currentView === 'analyzer' && (
                    <div className="max-w-4xl mx-auto">
                        <p className="text-center text-slate-600 dark:text-slate-400 mb-8 text-lg">
                            Upload a liver tissue slide image to receive an AI-powered pathological analysis.
                        </p>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                            <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
                            {imageUrl && (
                                <div className="mt-6 flex justify-center items-center space-x-4">
                                    {imageFile && !currentAnalysis && (
                                        <button
                                            onClick={handleAnalyzeClick}
                                            disabled={isLoading}
                                            className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
                                        >
                                            {isLoading && <Spinner className="-ml-1 mr-3 text-white" />}
                                            {isLoading ? 'Analyzing...' : 'Analyze Slide'}
                                        </button>
                                    )}
                                     <button
                                        onClick={handleClearAnalysis}
                                        className="px-8 py-3 bg-white dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 text-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-100 border border-slate-300 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
                                    >
                                        <XCircleIcon className="w-5 h-5 mr-2" />
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {currentAnalysis && (
                           <div className="animate-slide-in-bottom">
                             <AnalysisResultDisplay 
                                analysisItem={currentAnalysis} 
                                userProfile={userProfile} 
                                onUpdate={handleResultUpdate}
                             />
                           </div>
                        )}
                    </div>
                )}
                {currentView === 'profile' && (
                    <Profile userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />
                )}
                 {currentView === 'history' && (
                    <AnalysisHistory 
                        history={analysisHistory}
                        isLoading={isHistoryLoading} 
                        onSelectItem={handleSelectHistoryItem} 
                        onClearHistory={handleClearHistory} 
                    />
                )}
            </main>
        </div>
    );
};

export default App;