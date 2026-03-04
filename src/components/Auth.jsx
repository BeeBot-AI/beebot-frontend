import React, { useState } from 'react';
import { Bot, ArrowRight, UserPlus, LogIn, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            const data = await res.json();

            if (data.success) {
                login(data.token, data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In was unsuccessful.');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('Email/password auth coming soon. Please use Google Sign-in.');
    };

    return (
        <div className="container animate-fade-in flex items-center justify-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>

            {/* Back to Home Logo */}
            <div
                className="flex items-center gap-3 mb-8 cursor-pointer"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
                <img src="/bee-yellow.jpg" alt="BeeBots" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                <h1 className="title" style={{ color: '#FFD700', fontSize: '1.5rem' }}>BeeBots</h1>
            </div>

            <div className="glass-panel p-8" style={{ width: '100%', maxWidth: '420px', borderRadius: '20px' }}>

                {/* Header Slider */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px', marginBottom: '2rem' }}>
                    <button
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isLogin ? 'rgba(255,215,0,0.1)' : 'transparent',
                            color: isLogin ? '#FFD700' : 'var(--text-muted)',
                            fontWeight: isLogin ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: !isLogin ? 'rgba(255,215,0,0.1)' : 'transparent',
                            color: !isLogin ? '#FFD700' : 'var(--text-muted)',
                            fontWeight: !isLogin ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="text-center mb-6">
                    <h2 className="section-title mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                    <p className="text-muted">{isLogin ? 'Log in to continue to BeeBot' : 'Get started with your free account'}</p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff6b6b', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {/* Google OAuth Block */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="rectangular"
                        text={isLogin ? "signin_with" : "signup_with"}
                        size="large"
                        width="100%"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
                    <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
                </div>

                {/* Traditional Form */}
                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                <input type="text" className="input-field" placeholder="John Doe" style={{ paddingLeft: '40px' }} required />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input type="email" className="input-field" placeholder="john@example.com" style={{ paddingLeft: '40px' }} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input type="password" className="input-field" placeholder="••••••••" style={{ paddingLeft: '40px' }} required />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-2" style={{ justifyContent: 'center' }}>
                        {isLogin ? (
                            <><LogIn size={18} style={{ marginRight: '8px' }} /> Log In</>
                        ) : (
                            <><UserPlus size={18} style={{ marginRight: '8px' }} /> Sign Up</>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default Auth;
