import React, { useState, FormEvent } from 'react';

interface LoginProps {
    onLogin: (email: string) => Promise<void>;
}

type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => {
    const strengthConfig = {
        none:   { width: '0%',   color: 'bg-slate-200',  text: '' },
        weak:   { width: '33%',  color: 'bg-red-500',    text: 'Weak' },
        medium: { width: '66%',  color: 'bg-orange-500', text: 'Medium' },
        strong: { width: '100%', color: 'bg-green-500',  text: 'Strong' },
    };

    const { width, color, text } = strengthConfig[strength];
    const textColor = {
        none: 'text-slate-500',
        weak: 'text-red-500',
        medium: 'text-orange-500',
        strong: 'text-green-500',
    }[strength];

    return (
        <div className="mt-2" aria-live="polite">
            <div className="flex justify-end">
                 <p className={`text-xs font-medium ${textColor}`}>{text}</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
                    style={{ width }}
                />
            </div>
        </div>
    );
};


export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('none');

    const isPasswordStrong = (pw: string) => {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");
        return strongRegex.test(pw);
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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(getPasswordStrength(newPassword));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        if (!isPasswordStrong(password)) {
            setError('Password is not strong enough. Please follow the guidelines below.');
            return;
        }
        setIsLoggingIn(true);
        try {
            await onLogin(email);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-center text-slate-500 mb-8">Login to access the analyzer.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="you@example.com"
                        required
                        disabled={isLoggingIn}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="••••••••"
                        required
                        aria-describedby="password-strength-indicator"
                        disabled={isLoggingIn}
                    />
                    {password.length > 0 && (
                        <div id="password-strength-indicator">
                            <PasswordStrengthIndicator strength={passwordStrength} />
                        </div>
                    )}
                     <p className="mt-2 text-xs text-slate-500">
                        Must be 8+ characters with uppercase, lowercase, number, and a special character (!@#$%^&*).
                     </p>
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
}