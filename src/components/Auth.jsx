import React, { useState } from 'react';
import { Bot, ArrowRight, UserPlus, LogIn, Mail, Lock, User, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${config.API_BASE_URL}/auth/google`, { credential: credentialResponse.credential }, { withCredentials: true });
            if (res.data.success) {
                login(res.data.user);
                navigate('/dashboard');
            } else {
                setError(res.data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => setError('Google Sign-In was unsuccessful.');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { name, email, password };

            const res = await axios.post(`${config.API_BASE_URL}${endpoint}`, payload, { withCredentials: true });
            if (res.data.success) {
                // The AuthContext will fetch the user and App.jsx routing logic will
                // automatically redirect them to /onboarding or /dashboard based on business profile status
                await login(res.data.user);
            } else {
                setError(res.data.message || 'Authentication failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-surface)' }}>

            {/* Left Panel: Brand / Value Prop (Hidden on mobile) */}
            <div style={{
                flex: 1,
                background: 'var(--color-primary-light)',
                display: window.innerWidth > 768 ? 'flex' : 'none',
                flexDirection: 'column',
                padding: '4rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Pattern */}
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity: 0.1, zIndex: 0 }}>
                    <defs>
                        <pattern id="hexGrid" width="60" height="103.923" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <path d="M30 0L60 17.3205v34.641L30 69.282L0 51.9615V17.3205L30 0zm0 103.923L0 86.6025V51.9615l30-17.3205l30 17.3205v34.641L30 103.923z" fill="none" stroke="var(--color-primary-deep)" strokeWidth="2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexGrid)" />
                </svg>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="flex items-center gap-3 cursor-pointer mb-auto" onClick={() => navigate('/')}>
                        <img src="/bee-yellow.jpg" alt="BeeBot Logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-text)' }}>BeeBot.</span>
                    </div>

                    <div style={{ padding: '0 2rem' }}>
                        <h1 className="title mb-6" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.1, color: 'var(--color-primary-deep)' }}>
                            Scale your support <br />without scaling your team.
                        </h1>
                        <p className="text-muted mb-8" style={{ fontSize: '1.25rem', maxWidth: '440px', lineHeight: 1.6 }}>
                            Join hundreds of smart businesses using BeeBot to answer customer questions 24/7.
                        </p>

                        <div className="flex-col gap-4">
                            {[
                                { icon: <Bot size={20} />, text: "Instantly train on your PDFs and URLs" },
                                { icon: <Hexagon size={20} />, text: "Human-like, customizable personality" },
                                { icon: <ArrowRight size={20} />, text: "Deploy with a single line of code" }
                            ].map((feature, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--color-white)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-deep)', boxShadow: 'var(--shadow-sm)' }}>
                                        {feature.icon}
                                    </div>
                                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto" style={{ padding: '0 2rem' }}>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>© {new Date().getFullYear()} BeeBot AI. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div style={{
                flex: window.innerWidth > 768 ? '0 0 560px' : '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }}>
                <div className="animate-fade-in w-full" style={{ maxWidth: '400px' }}>

                    {/* Mobile Logo */}
                    <div className="flex items-center gap-3 cursor-pointer mb-12 justify-center" style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }} onClick={() => navigate('/')}>
                        <img src="/bee-yellow.jpg" alt="BeeBot Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-text)' }}>BeeBot.</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="title mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                        <p className="text-muted">{isLogin ? 'Enter your details to access your dashboard.' : 'Start your 14-day free trial today.'}</p>
                    </div>

                    {/* Login/Signup Toggle */}
                    <div style={{ display: 'flex', background: 'var(--color-surface-2)', borderRadius: '10px', padding: '4px', marginBottom: '2rem' }}>
                        <button style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: isLogin ? 'var(--color-white)' : 'transparent',
                            color: isLogin ? 'var(--color-text)' : 'var(--color-text-muted)',
                            fontWeight: isLogin ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: isLogin ? 'var(--shadow-sm)' : 'none'
                        }} onClick={() => { setIsLogin(true); setError(''); }}>
                            Log In
                        </button>
                        <button style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: !isLogin ? 'var(--color-white)' : 'transparent',
                            color: !isLogin ? 'var(--color-text)' : 'var(--color-text-muted)',
                            fontWeight: !isLogin ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none'
                        }} onClick={() => { setIsLogin(false); setError(''); }}>
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Google Auth */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            shape="rectangular"
                            text={isLogin ? "signin_with" : "signup_with"}
                            size="large"
                            width="400px" // Using 100% width trick with custom container max-width above
                            useOneTap
                            auto_select
                        />
                    </div>

                    <div className="divider mb-6">or continue with email</div>

                    {/* Traditional Form */}
                    <form onSubmit={handleSubmit} className="flex-col gap-5">
                        {!isLogin && (
                            <div>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--color-text-faint)' }} />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" style={{ paddingLeft: '42px' }} placeholder="Jane Doe" required={!isLogin} disabled={loading} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--color-text-faint)' }} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" style={{ paddingLeft: '42px' }} placeholder="jane@company.com" required disabled={loading} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label className="form-label" style={{ margin: 0 }}>Password</label>
                                {isLogin && <a href="#" className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500, textDecoration: 'underline' }}>Forgot?</a>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--color-text-faint)' }} />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={{ paddingLeft: '42px' }} placeholder="••••••••" required disabled={loading} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading} style={{ padding: '14px', fontSize: '1rem' }}>
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : isLogin ? (
                                <>Log In <ArrowRight size={18} /></>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}

