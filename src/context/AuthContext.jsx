import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('beebot_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a full production app, you might want to hit a /api/auth/me route here
        // to validate the token and get fresh user details.
        // For now, if we have a token, we parse the basic info if available or just assume logged in.
        const storedUser = localStorage.getItem('beebot_user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setToken(null);
            localStorage.removeItem('beebot_token');
        }
        setIsLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('beebot_token', newToken);
        localStorage.setItem('beebot_user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('beebot_token');
        localStorage.removeItem('beebot_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
