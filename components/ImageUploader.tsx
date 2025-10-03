

import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    imageUrl: string | null;
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageUpload(event.target.files[0]);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            onImageUpload(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    return (
        <div className="w-full">
            {imageUrl ? (
                <div className="text-center">
                    <img src={imageUrl} alt="Slide Preview" className="max-w-full max-h-96 mx-auto rounded-lg shadow-md" />
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                    >
                        Or select a different image
                    </button>
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 hover:border-sky-400 dark:border-slate-600 dark:hover:border-sky-500'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <UploadIcon className="w-12 h-12 mb-4" />
                        <p className="font-semibold">Click to upload or drag and drop</p>
                        <p className="text-sm">PNG, JPG, or WEBP</p>
                    </div>
                </div>
            )}
        </div>
    );
};