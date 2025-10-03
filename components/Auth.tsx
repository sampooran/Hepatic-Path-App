
import React, { useState, FormEvent } from 'react';
import type { UserProfile } from '../types';
import { defaultAvatar } from '../services/apiService';

type AuthView = 'login' | 'register' | 'forgotPassword';
type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

interface AuthProps {
    onLogin: (email: string, password: string) => Promise<UserProfile | null>;
    onSignUp: (userData: Omit<UserProfile, 'email' | 'avatar'>, email: string, password: string) => Promise<UserProfile | null>;
}

const getPasswordStrength = (pw: string): PasswordStrength => {
    if (!pw) return 'none';
    const checks = [
        /[a-z]/.test(pw),
        /[A-Z]/.test(pw),
        /[0-9]/.test(pw),
        /[!@#$%^&*]/.test(pw),
        pw.length >= 8,
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
};

const isPasswordStrong = (pw: string): boolean => {
    return getPasswordStrength(pw) === 'strong';
};


const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => {
    const config = {
        none:   { width: '0%',   color: 'bg-slate-200',  text: '' },
        weak:   { width: '33%',  color: 'bg-red-500',    text: 'Weak' },
        medium: { width: '66%',  color: 'bg-orange-500', text: 'Medium' },
        strong: { width: '100%', color: 'bg-green-500',  text: 'Strong' },
    };
    const { width, color, text } = config[strength];
    const textColor = { none: 'text-slate-500', weak: 'text-red-500', medium: 'text-orange-500', strong: 'text-green-500' }[strength];

    return (
        <div className="mt-2" aria-live="polite">
            <div className="flex justify-end">
                 <p className={`text-xs font-medium ${textColor}`}>{text}</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width }} />
            </div>
        </div>
    );
};

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignUp }) => {
    const [view, setView] = useState<AuthView>('login');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [hospital, setHospital] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('none');

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(getPasswordStrength(newPassword));
    };
    
    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const user = await onLogin(email, password);
            if (!user) {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isPasswordStrong(password)) {
            setError('Password is not strong enough. Please follow the guidelines.');
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const user = await onSignUp({ name, title, hospital, qualifications }, email, password);
            if (!user) {
                setError('An account with this email already exists.');
            }
        } catch (err) {
            setError('An unexpected error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 1000)); // Simulate API call
        setMessage('If an account exists for this email, a password reset link has been sent.');
        setIsLoading(false);
    };

    const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-300";
    const inputStyles = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400";
    const linkStyles = "font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300";

    const renderLogin = () => (
        <>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Welcome Back</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Login to access the analyzer.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email-login" className={labelStyles}>Email Address</label>
                    <input type="email" id="email-login" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} required disabled={isLoading} />
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="password-login" className={labelStyles}>Password</label>
                        <button type="button" onClick={() => setView('forgotPassword')} className={`text-xs ${linkStyles}`}>Forgot password?</button>
                    </div>
                    <input type="password" id="password-login" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} required disabled={isLoading} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account? <button type="button" onClick={() => setView('register')} className={linkStyles}>Create one</button>
            </p>
        </>
    );

    const renderRegister = () => (
        <>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Create Profile</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Enter your details to get started.</p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="name-register" className={labelStyles}>Full Name</label>
                        <input type="text" id="name-register" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="email-register" className={labelStyles}>Email Address</label>
                        <input type="email" id="email-register" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} required disabled={isLoading} />
                    </div>
                     <div>
                        <label htmlFor="title-register" className={labelStyles}>Title</label>
                        <input type="text" id="title-register" value={title} onChange={e => setTitle(e.target.value)} className={inputStyles} placeholder="e.g., Pathologist" required disabled={isLoading} />
                    </div>
                     <div>
                        <label htmlFor="qualifications-register" className={labelStyles}>Qualifications</label>
                        <input type="text" id="qualifications-register" value={qualifications} onChange={e => setQualifications(e.target.value)} className={inputStyles} placeholder="e.g., MD, FRCPath" required disabled={isLoading} />
                    </div>
                 </div>
                 <div>
                    <label htmlFor="hospital-register" className={labelStyles}>Hospital / Clinic</label>
                    <input type="text" id="hospital-register" value={hospital} onChange={e => setHospital(e.target.value)} className={inputStyles} required disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="password-register" className={labelStyles}>Password</label>
                    <input type="password" id="password-register" value={password} onChange={handlePasswordChange} className={inputStyles} required disabled={isLoading} />
                    {password.length > 0 && <PasswordStrengthIndicator strength={passwordStrength} />}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Must be 8+ characters with uppercase, lowercase, number, and a special character (!@#$%^&*).</p>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account? <button type="button" onClick={() => setView('login')} className={linkStyles}>Log in</button>
            </p>
        </>
    );

    const renderForgotPassword = () => (
        <>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Forgot Password</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Enter your email to receive a reset link.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="email-forgot" className={labelStyles}>Email Address</label>
                    <input type="email" id="email-forgot" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} required disabled={isLoading} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Remember your password? <button type="button" onClick={() => setView('login')} className={linkStyles}>Back to Login</button>
            </p>
        </>
    );


    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-slide-in-bottom">
            {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
            {message && <p className="mb-4 text-sm text-green-600 text-center">{message}</p>}

            {view === 'login' && renderLogin()}
            {view === 'register' && renderRegister()}
            {view === 'forgotPassword' && renderForgotPassword()}
        </div>
    );
};