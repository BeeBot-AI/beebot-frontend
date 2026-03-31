import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [hasBusinessProfile, setHasBusinessProfile] = useState(null); // null = unknown
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/auth/me`, { withCredentials: true });
            if (res.data.success) {
                setUser(res.data.user);
                // After confirming user, check if they have a business profile
                await checkBusinessProfile();
            } else {
                setUser(null);
                setHasBusinessProfile(null);
            }
        } catch (error) {
            // 401 is expected when not logged in
            setUser(null);
            setHasBusinessProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const checkBusinessProfile = async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/business/me`, { withCredentials: true });
            setHasBusinessProfile(res.data.hasBusinessProfile);
        } catch {
            setHasBusinessProfile(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        // After login, check business profile
        checkBusinessProfile();
    };

    const logout = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
            setUser(null);
            setHasBusinessProfile(null);
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    const setBusinessProfile = (val) => setHasBusinessProfile(val);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            hasBusinessProfile,
            login,
            logout,
            checkAuth,
            refetchUser: checkAuth,
            setBusinessProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
