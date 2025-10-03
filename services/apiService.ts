import type { UserProfile, AnalysisHistoryItem, StoredUser } from '../types';

export const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk0YTNiOCI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAwMjEuNzUgMTJjMC01LjM4NS00LjM2NS05Ljc1LTkuNzUtOS43NVMyLjI1IDYuNjE1IDIuMjUgMTJhOS43MjMgOS43MjMgMCAwMDMuMDY1IDcuMDk3QTkuNzE2IDkuNzE2IDAgMDAxMiAyMS43NWE5LjcxNiA5LjcxNiAwIDAwNi42ODUtMi42NTN6bS0xMi41NC0xLjI4NUE3LjQ4NiA3LjQ4NiAwIDAxMTIgMTVhNy40ODYgNy40ODYgMCAwMTUuODU1IDIuODEyQTguMjI0IDguMjI0IDAgMDExMiAyMC4yNWE4LjIyNCA4LjIyNCAwIDAxLTUuODU1LTIuNDM4ek0xNTu3NSA5YTMuNzUgMy43NSAwIDExLTcuNSAwIDMuNzUgMy43NSAwIDAxNy41IDB6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIC8+Cjwvc3ZnPgo=';
const LATENCY = 500; // ms
const USERS_DB_KEY = 'users_database';
const SESSION_KEY = 'session_token';


// --- Helper Functions to simulate database ---

const simulateNetworkRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, LATENCY);
    });
};

const getUsersDb = (): Record<string, StoredUser> => {
    const db = localStorage.getItem(USERS_DB_KEY);
    return db ? JSON.parse(db) : {};
};

const saveUsersDb = (db: Record<string, StoredUser>): void => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

const stripPassword = (user: StoredUser): UserProfile => {
    const { password, ...profile } = user;
    return profile;
};


// --- Mock API Functions ---

export const createProfile = (userData: Omit<UserProfile, 'avatar'> & { password: string }): Promise<UserProfile | null> => {
    const db = getUsersDb();
    if (db[userData.email]) {
        // User already exists
        return simulateNetworkRequest(null);
    }
    const newUser: StoredUser = {
        ...userData,
        avatar: defaultAvatar,
    };
    db[userData.email] = newUser;
    saveUsersDb(db);
    return simulateNetworkRequest(stripPassword(newUser));
};


export const login = (email: string, password_unused: string): Promise<UserProfile | null> => {
    const db = getUsersDb();
    const user = db[email];

    // For mock purposes, if user doesn't exist, create one.
    if (!user) {
        const defaultUser: StoredUser = {
            email,
            password: 'password', // In a real app, this would be hashed
            name: 'Dr. Alex Doe',
            title: 'Pathologist',
            hospital: 'General Hospital',
            qualifications: 'MD, FRCPath',
            avatar: defaultAvatar,
        };
        db[email] = defaultUser;
        saveUsersDb(db);
        localStorage.setItem(SESSION_KEY, email);
        return simulateNetworkRequest(stripPassword(defaultUser));
    }

    if (user.password === password_unused) {
        localStorage.setItem(SESSION_KEY, email);
        return simulateNetworkRequest(stripPassword(user));
    }
    
    return simulateNetworkRequest(null); // Invalid password
};


export const checkSession = (): Promise<UserProfile | null> => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (userId) {
        const db = getUsersDb();
        const user = db[userId];
        if (user) {
            return simulateNetworkRequest(stripPassword(user));
        }
    }
    return simulateNetworkRequest(null);
};


export const logout = (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    return simulateNetworkRequest(undefined);
};


export const updateProfile = (profile: UserProfile): Promise<UserProfile> => {
    const db = getUsersDb();
    const user = db[profile.email];
    if (user) {
        db[profile.email] = { ...user, ...profile };
        saveUsersDb(db);
        return simulateNetworkRequest(profile);
    }
    // This should ideally not happen if user is logged in
    throw new Error("User not found for profile update.");
};


export const getAnalysisHistory = (userId: string): Promise<AnalysisHistoryItem[]> => {
    const storedHistory = localStorage.getItem(`analysisHistory_${userId}`);
    let history = storedHistory ? JSON.parse(storedHistory) : [];

    // Migration logic
    let needsUpdate = false;
    history.forEach((item: any) => { 
        if (item.result && item.result.potentialDiagnosis && typeof item.result.differentialDiagnosis === 'undefined') {
            item.result.differentialDiagnosis = item.result.potentialDiagnosis;
            delete item.result.potentialDiagnosis;
            needsUpdate = true;
        }
    });

    if (needsUpdate) {
        localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(history));
    }

    history.sort((a: AnalysisHistoryItem, b: AnalysisHistoryItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return simulateNetworkRequest(history);
};


export const saveAnalysis = async (userId: string, item: AnalysisHistoryItem): Promise<AnalysisHistoryItem[]> => {
    const history = await getAnalysisHistory(userId);
    const updatedHistory = [item, ...history];
    localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(updatedHistory));
    return simulateNetworkRequest(updatedHistory);
};


export const updateAnalysis = async (userId: string, updatedItem: AnalysisHistoryItem): Promise<AnalysisHistoryItem[]> => {
    const history = await getAnalysisHistory(userId);
    const itemIndex = history.findIndex(item => item.id === updatedItem.id);
    if (itemIndex > -1) {
        history[itemIndex] = updatedItem;
    }
    localStorage.setItem(`analysisHistory_${userId}`, JSON.stringify(history));
    return simulateNetworkRequest(history);
};


export const clearAnalysisHistory = (userId: string): Promise<void> => {
    localStorage.removeItem(`analysisHistory_${userId}`);
    return simulateNetworkRequest(undefined);
};
