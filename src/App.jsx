import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';

// Requires login. If logged in but no business profile → /onboarding. Otherwise → children.
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, hasBusinessProfile } = useAuth();

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="animate-spin" style={{ color: 'var(--color-primary-deep)' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/auth" />;

    // hasBusinessProfile is null means still loading, false means not set up
    if (hasBusinessProfile === false) return <Navigate to="/onboarding" />;

    return children;
};

// Onboarding route — only accessible to logged-in users without a business
const OnboardingRoute = ({ children }) => {
    const { isAuthenticated, isLoading, hasBusinessProfile } = useAuth();

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="animate-spin" style={{ color: 'var(--color-primary-deep)' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/auth" />;
    if (hasBusinessProfile === true) return <Navigate to="/dashboard" />;

    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={
                <OnboardingRoute>
                    <Onboarding />
                </OnboardingRoute>
            } />
            <Route path="/dashboard/*" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
