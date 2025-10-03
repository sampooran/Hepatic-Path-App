
import React, { useState, useEffect } from 'react';
import type { AnalysisResult, UserProfile, AnalysisHistoryItem } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { FlaskIcon } from './icons/FlaskIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { EditIcon } from './icons/EditIcon';
import { SaveIcon } from './icons/SaveIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { Spinner } from './Spinner';

declare const html2canvas: any;

declare global {
    interface Window {
        jspdf: any;
    }
}

interface AnalysisResultDisplayProps {
    analysisItem: AnalysisHistoryItem;
    userProfile: UserProfile;
    onUpdate: (updatedItem: AnalysisHistoryItem) => Promise<void>;
}

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-center mb-4">
            <div className="bg-sky-100 text-sky-600 dark:bg-sky-900/70 dark:text-sky-400 rounded-full p-2 mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        </div>
        <div className="pl-12 text-slate-600 dark:text-slate-300 space-y-3 prose dark:prose-invert max-w-none">
            {children}
        </div>
    </div>
);

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ analysisItem, userProfile, onUpdate }) => {
    const [isCopying, setIsCopying] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableResult, setEditableResult] = useState<AnalysisResult>(analysisItem.result);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    useEffect(() => {
        setEditableResult(analysisItem.result);
        setIsEditing(false); // Exit edit mode when a new item is loaded
    }, [analysisItem]);

    const formatReportForCopy = (result: AnalysisResult, user: UserProfile): string => {
        let report = `Pathology Analysis Report\n`;
        report += `Prepared by: ${user.name}, ${user.qualifications}\n`;
        report += `${user.title}\n${user.hospital}\n\n`;
        report += `--- OVERALL IMPRESSION ---\n${result.overallImpression}\n\n`;
        report += `--- KEY FINDINGS ---\n`;
        result.keyFindings.forEach(f => {
            report += `- ${f.finding}:\n  ${f.description}\n`;
        });
        report += `\n--- DIFFERENTIAL DIAGNOSIS ---\n${result.differentialDiagnosis}\n\n`;
        report += `--- RECOMMENDATIONS ---\n`;
        result.recommendations.forEach(r => {
            report += `- ${r}\n`;
        });
        return report;
    };


    const handleExportPdf = async () => {
        setIsDownloading(true);
        // Temporarily set to view mode for PDF generation if editing
        const wasEditing = isEditing;
        if (wasEditing) setIsEditing(false);
        
        // Allow DOM to update
        await new Promise(resolve => setTimeout(resolve, 50));

        const reportElement = document.getElementById('analysis-report');
        if (reportElement) {
            const { jsPDF } = window.jspdf;
            const canvas = await html2canvas(reportElement, { 
                scale: 2,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff' // Use theme background
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('pathology-report.pdf');
        }
        
        if (wasEditing) setIsEditing(true); // Revert to editing mode
        setIsDownloading(false);
    };

    const handleShare = () => {
        const reportText = formatReportForCopy(editableResult, userProfile);
        navigator.clipboard.writeText(reportText).then(() => {
            setIsCopying(true);
            setTimeout(() => setIsCopying(false), 2000);
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({ ...analysisItem, result: editableResult });
            setIsEditing(false);
            setShowSaveConfirmation(true);
            setTimeout(() => setShowSaveConfirmation(false), 3000); // Hide after 3 seconds
        } catch (error) {
            console.error("Failed to save report:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditableResult(analysisItem.result); // Revert changes
        setIsEditing(false);
    };

    const handleFieldChange = (field: keyof AnalysisResult, value: any) => {
        setEditableResult(prev => ({ ...prev, [field]: value }));
    };

    const handleFindingChange = (index: number, field: 'finding' | 'description', value: string) => {
        const updatedKeyFindings = [...editableResult.keyFindings];
        updatedKeyFindings[index] = { ...updatedKeyFindings[index], [field]: value };
        handleFieldChange('keyFindings', updatedKeyFindings);
    };

    const handleRecommendationChange = (index: number, value: string) => {
        const updatedRecommendations = [...editableResult.recommendations];
        updatedRecommendations[index] = value;
        handleFieldChange('recommendations', updatedRecommendations);
    };
    
    const inputStyles = "w-full p-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100";

    return (
        <div className="mt-8 relative">
             {showSaveConfirmation && (
                <div 
                    className="absolute top-0 right-0 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center shadow-md animate-slide-in-bottom z-20"
                    role="alert"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Report saved successfully!
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Pathology Analysis Report</h2>
                 <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                             <button
                                 onClick={handleCancel}
                                 className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                                 disabled={isSaving}
                             >
                                <XCircleIcon className="w-5 h-5 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center w-36 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner className="text-white mr-2" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-5 h-5 mr-2" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
                                <EditIcon className="w-5 h-5 mr-2" />
                                Edit Report
                            </button>
                             <button onClick={handleShare} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50">
                                <ShareIcon className="w-5 h-5 mr-2" />
                                {isCopying ? 'Copied!' : 'Copy'}
                            </button>
                            <button onClick={handleExportPdf} disabled={isDownloading} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-400">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                {isDownloading ? 'Downloading...' : 'PDF'}
                            </button>
                        </>
                    )}
                 </div>
            </div>
            
            <div id="analysis-report" className="p-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                    <img src={userProfile.avatar} alt="Doctor's Avatar" className="w-16 h-16 rounded-full object-cover mr-6 border-2 border-slate-200 dark:border-slate-600" />
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Report prepared by:</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{userProfile.name}, {userProfile.qualifications}</p>
                        <p className="text-slate-600 dark:text-slate-300">{userProfile.title}</p>
                        <p className="text-slate-600 dark:text-slate-300">{userProfile.hospital}</p>
                    </div>
                </div>
                
                <Section icon={<DocumentTextIcon className="w-6 h-6" />} title="Overall Impression">
                    {isEditing ? (
                        <textarea value={editableResult.overallImpression} onChange={(e) => handleFieldChange('overallImpression', e.target.value)} className={inputStyles} rows={4}/>
                    ) : (
                        <p>{editableResult.overallImpression}</p>
                    )}
                </Section>

                <Section icon={<ClipboardListIcon className="w-6 h-6" />} title="Key Findings">
                     <ul className="space-y-4">
                        {editableResult.keyFindings.map((finding, index) => (
                            <li key={index}>
                                {isEditing ? (
                                    <div className='space-y-2'>
                                         <input type="text" value={finding.finding} onChange={(e) => handleFindingChange(index, 'finding', e.target.value)} className={`${inputStyles} font-semibold text-slate-800 dark:text-slate-100`}/>
                                         <textarea value={finding.description} onChange={(e) => handleFindingChange(index, 'description', e.target.value)} className={inputStyles} rows={3}/>
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{finding.finding}</p>
                                        <p>{finding.description}</p>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section icon={<CheckCircleIcon className="w-6 h-6" />} title="Differential Diagnosis">
                     {isEditing ? (
                        <textarea value={editableResult.differentialDiagnosis} onChange={(e) => handleFieldChange('differentialDiagnosis', e.target.value)} className={inputStyles} rows={3}/>
                    ) : (
                        <p>{editableResult.differentialDiagnosis}</p>
                    )}
                </Section>

                <Section icon={<FlaskIcon className="w-6 h-6" />} title="Recommendations">
                    <ul className="list-disc list-inside space-y-2">
                        {editableResult.recommendations.map((rec, index) => (
                            <li key={index}>
                                {isEditing ? (
                                    <input type="text" value={rec} onChange={(e) => handleRecommendationChange(index, e.target.value)} className={inputStyles} />
                                ) : (
                                    rec
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>
            </div>
        </div>
    );
};