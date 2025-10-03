

import React, { useState, FormEvent, useRef } from 'react';
import type { UserProfile } from '../types';
import { EditIcon } from './icons/EditIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { OfficeBuildingIcon } from './icons/OfficeBuildingIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';


interface ProfileProps {
    userProfile: UserProfile;
    onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const Profile: React.FC<ProfileProps> = ({ userProfile, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, avatar: base64 }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onProfileUpdate(formData);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your professional information.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        <EditIcon className="w-5 h-5 mr-2" />
                        Edit Profile
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center">
                        <img src={formData.avatar} alt="Profile Avatar" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-200 dark:border-slate-600" />
                        {isEditing && (
                             <>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                                >
                                    Change Picture
                                </button>
                            </>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <ProfileField icon={<IdentificationIcon className="w-6 h-6 text-slate-400" />} label="Full Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                        <ProfileField icon={<IdentificationIcon className="w-6 h-6 text-slate-400" />} label="Title" name="title" value={formData.title} isEditing={isEditing} onChange={handleInputChange} />
                        <ProfileField icon={<OfficeBuildingIcon className="w-6 h-6 text-slate-400" />} label="Hospital / Clinic Address" name="hospital" value={formData.hospital} isEditing={isEditing} onChange={handleInputChange} />
                        <ProfileField icon={<AcademicCapIcon className="w-6 h-6 text-slate-400" />} label="Qualifications" name="qualifications" value={formData.qualifications} isEditing={isEditing} onChange={handleInputChange} />
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-8 flex justify-end space-x-3">
                         <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData(userProfile); // Reset changes
                            }}
                            className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-sky-600 border border-sky-600 rounded-lg hover:bg-sky-700"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

interface ProfileFieldProps {
    icon: React.ReactNode;
    label: string;
    name: string;
    value: string;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, name, value, isEditing, onChange }) => (
    <div className="flex items-start">
        <div className="mr-4 mt-1">{icon}</div>
        <div className="flex-grow">
            <label htmlFor={name} className="block text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
            {isEditing ? (
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
            ) : (
                <p className="text-slate-800 dark:text-slate-100 text-lg">{value}</p>
            )}
        </div>
    </div>
);