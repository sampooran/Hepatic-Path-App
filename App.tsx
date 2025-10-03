
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Spinner } from './components/Spinner';
import { analyzeLiverSlide } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (file: File) => {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setError(null);
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = error => reject(error);
        });
    }

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const base64ImageData = await fileToBase64(imageFile);
            const result = await analyzeLiverSlide(base64ImageData, imageFile.type);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError("An error occurred during analysis. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-center text-slate-600 mb-8 text-lg">
                        Upload a liver tissue slide image to receive an AI-powered pathological analysis.
                    </p>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
                        <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
                         {imageUrl && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={handleAnalyzeClick}
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
                                >
                                    {isLoading && <Spinner />}
                                    {isLoading ? 'Analyzing...' : 'Analyze Slide'}
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {analysisResult && (
                       <div className="animate-slide-in-bottom">
                         <AnalysisResultDisplay result={analysisResult} />
                       </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
