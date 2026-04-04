import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

/**
 * AuthProvider
 *
 * Token strategy:
 *  - Access token (15 min): stored in React state (memory only, never localStorage).
 *    Sent as  Authorization: Bearer <token>  on every protected request.
 *  - Refresh token (20 days): HTTP-only cookie set by the server.
 *    Used silently on mount and whenever a 401 TOKEN_EXPIRED arrives.
 *
 * On mount:
 *   → POST /auth/refresh  (sends cookie automatically via withCredentials)
 *   → If OK  → store accessToken + user in state
 *   → If 401 → stay logged out
 */
export const AuthProvider = ({ children }) => {
    const [user,               setUser]               = useState(null);
    const [accessToken,        setAccessToken]        = useState(null);
    const [hasBusinessProfile, setHasBusinessProfile] = useState(null);
    const [isLoading,          setIsLoading]          = useState(true);

    // Ref so the axios interceptor can always read the latest token
    const tokenRef = useRef(null);
    tokenRef.current = accessToken;

    /* ── silent refresh ─────────────────────────────────────────────── */
    const silentRefresh = useCallback(async () => {
        try {
            const res = await axios.post(
                `${config.API_BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setAccessToken(res.data.accessToken);
                setUser(res.data.user);
                return res.data.accessToken;
            }
        } catch {
            // Refresh token missing / expired — stay logged out
        }
        return null;
    }, []);

    /* ── check business profile ─────────────────────────────────────── */
    const checkBusinessProfile = useCallback(async (token) => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/business/me`, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setHasBusinessProfile(res.data.hasBusinessProfile);
        } catch {
            setHasBusinessProfile(false);
        }
    }, []);

    /* ── boot: try silent refresh ───────────────────────────────────── */
    useEffect(() => {
        const boot = async () => {
            const token = await silentRefresh();
            if (token) await checkBusinessProfile(token);
            else { setUser(null); setHasBusinessProfile(null); }
            setIsLoading(false);
        };
        boot();
    }, [silentRefresh, checkBusinessProfile]);

    /* ── axios interceptor: attach token + handle 401 ──────────────── */
    useEffect(() => {
        // Request interceptor — attach access token to every outgoing request
        const reqId = axios.interceptors.request.use((cfg) => {
            const tok = tokenRef.current;
            if (tok && !cfg.headers.Authorization) {
                cfg.headers.Authorization = `Bearer ${tok}`;
            }
            return cfg;
        });

        // Response interceptor — on TOKEN_EXPIRED, refresh and retry once
        let isRefreshing = false;
        let queue = [];

        const resId = axios.interceptors.response.use(
            (res) => res,
            async (err) => {
                const original = err.config;
                const isExpired = err.response?.status === 401 &&
                                  err.response?.data?.code === 'TOKEN_EXPIRED';

                if (isExpired && !original._retry) {
                    original._retry = true;

                    if (isRefreshing) {
                        // Queue this request until refresh completes
                        return new Promise((resolve, reject) => {
                            queue.push({ resolve, reject });
                        }).then((token) => {
                            original.headers.Authorization = `Bearer ${token}`;
                            return axios(original);
                        });
                    }

                    isRefreshing = true;
                    try {
                        const newToken = await silentRefresh();
                        if (!newToken) throw new Error('refresh failed');

                        // Drain queued requests
                        queue.forEach(({ resolve }) => resolve(newToken));
                        queue = [];

                        original.headers.Authorization = `Bearer ${newToken}`;
                        return axios(original);
                    } catch {
                        queue.forEach(({ reject }) => reject(err));
                        queue = [];
                        setUser(null); setAccessToken(null); setHasBusinessProfile(null);
                        return Promise.reject(err);
                    } finally {
                        isRefreshing = false;
                    }
                }
                return Promise.reject(err);
            }
        );

        return () => {
            axios.interceptors.request.eject(reqId);
            axios.interceptors.response.eject(resId);
        };
    }, [silentRefresh]);

    /* ── login — called right after a successful /auth/login|register ── */
    const login = useCallback(async (userData, token) => {
        setUser(userData);
        setAccessToken(token);
        tokenRef.current = token;
        await checkBusinessProfile(token);
    }, [checkBusinessProfile]);

    /* ── logout ─────────────────────────────────────────────────────── */
    const logout = useCallback(async () => {
        try {
            await axios.post(
                `${config.API_BASE_URL}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch { /* best-effort */ }
        setUser(null);
        setAccessToken(null);
        setHasBusinessProfile(null);
        tokenRef.current = null;
    }, []);

    const setBusinessProfile = useCallback((val) => setHasBusinessProfile(val), []);

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            isAuthenticated:    !!user,
            isLoading,
            hasBusinessProfile,
            login,
            logout,
            silentRefresh,
            refetchUser:        silentRefresh,
            setBusinessProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
