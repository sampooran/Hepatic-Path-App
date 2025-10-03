
import React from 'react';
import type { AnalysisResult } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { FlaskIcon } from './icons/FlaskIcon';

interface AnalysisResultDisplayProps {
    result: AnalysisResult;
}

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6">
        <div className="flex items-center mb-4">
            <div className="bg-sky-100 text-sky-600 rounded-full p-2 mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-700">{title}</h3>
        </div>
        <div className="pl-12 text-slate-600 space-y-3">
            {children}
        </div>
    </div>
);

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
    return (
        <div className="mt-8">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-slate-800">Pathology Analysis Report</h2>
            
            <Section icon={<DocumentTextIcon className="w-6 h-6" />} title="Overall Impression">
                <p>{result.overallImpression}</p>
            </Section>

            <Section icon={<ClipboardListIcon className="w-6 h-6" />} title="Key Findings">
                <ul className="space-y-4">
                    {result.keyFindings.map((finding, index) => (
                        <li key={index}>
                            <p className="font-semibold text-slate-800">{finding.finding}</p>
                            <p>{finding.description}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section icon={<CheckCircleIcon className="w-6 h-6" />} title="Potential Diagnosis">
                <p>{result.potentialDiagnosis}</p>
            </Section>

            <Section icon={<FlaskIcon className="w-6 h-6" />} title="Recommendations">
                <ul className="list-disc list-inside space-y-2">
                    {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </Section>
        </div>
    );
};
