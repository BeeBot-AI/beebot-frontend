import React, { useState } from 'react';
import {
    Bot, ArrowRight, Mail, Lock, User, Zap, Layers, Code2,
    Eye, EyeOff, LogIn, UserPlus, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';

/*
  HOW THE DESKTOP ANIMATION WORKS
  ─────────────────────────────────────────────────────────────────────────
  The auth-box is 1200px wide. It has two logical halves:

  1. .forms-container  — 50% wide, position:absolute, left:0
     Contains BOTH form panels stacked (login on top by default).
     When signup-active → translateX(+100%) so it moves to the RIGHT half.

  2. .overlay-wrapper  — 50% wide, position:absolute, left:50% (starts right)
     Has a 200%-wide inner strip with two branded panels side-by-side.
     When signup-active → translateX(-100%) so it moves to cover the LEFT half.
     Simultaneously the inner strip translateX(-50%) to reveal panel B.

  Result: full-screen split swap. Form moves right, overlay moves left.
  ─────────────────────────────────────────────────────────────────────────
*/

const DUR  = '0.62s';
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

export default function Auth() {
    const [isLogin,      setIsLogin]      = useState(true);
    const [name,         setName]         = useState('');
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    /* ── backend handlers (untouched) ── */
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true); setError('');
        try {
            const res = await axios.post(
                `${config.API_BASE_URL}/auth/google`,
                { credential: credentialResponse.credential },
                { withCredentials: true }
            );
            if (res.data.success) { login(res.data.user); navigate('/dashboard'); }
            else setError(res.data.message || 'Authentication failed');
        } catch { setError('Network error. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleGoogleError = () => setError('Google Sign-In was unsuccessful.');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload  = isLogin ? { email, password } : { name, email, password };
            const res = await axios.post(
                `${config.API_BASE_URL}${endpoint}`, payload, { withCredentials: true }
            );
            if (res.data.success) await login(res.data.user);
            else setError(res.data.message || 'Authentication failed');
        } catch (err) {
            setError(err.response?.data?.message || 'Network error. Please try again.');
        } finally { setLoading(false); }
    };

    const switchToSignup = () => { setIsLogin(false); setError(''); setShowPassword(false); };
    const switchToLogin  = () => { setIsLogin(true);  setError(''); setShowPassword(false); };

    const features = [
        { icon: <Zap    size={14} />, text: 'Instantly train on your PDFs and URLs' },
        { icon: <Layers size={14} />, text: 'Human-like, customizable personality'  },
        { icon: <Code2  size={14} />, text: 'Deploy with a single line of code'     },
    ];

    const cls = isLogin ? 'auth-box' : 'auth-box signup-active';

    return (
        <>
        <style>{`
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            /* ══════════════════════════════════════════════
               PAGE
               ══════════════════════════════════════════════ */
            .auth-page {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-surface, #f3f4f6);
                font-family: var(--font-body, sans-serif);
                padding: 2rem 1.5rem;
            }

            /* ══════════════════════════════════════════════
               DESKTOP CONTAINER
               ══════════════════════════════════════════════ */
            .auth-box {
                position: relative;
                width: 1300px;
                max-width: 100%;
                height: 820px;
                overflow: hidden;
                border-radius: 24px;
                box-shadow: 0 40px 100px rgba(0,0,0,0.16);
                background: #fff;
                /* keeps both children positioned absolutely */
            }

            /* ──────────────────────────────────────────────
               FORMS CONTAINER
               Left 50% by default. Slides to right on signup.
               ────────────────────────────────────────────── */
            .forms-container {
                position: absolute;
                top: 0; left: 0;
                width: 50%; height: 100%;
                z-index: 2;
                transition: transform ${DUR} ${EASE};
            }
            .auth-box.signup-active .forms-container {
                transform: translateX(100%);
            }

            /* Individual form panels inside forms-container */
            .form-panel {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4rem 4rem;
                background: #fff;
                transition:
                    opacity  ${DUR} ${EASE},
                    transform ${DUR} ${EASE};
            }

            /* LOGIN — visible by default */
            .form-panel--login {
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
                z-index: 2;
            }
            .auth-box.signup-active .form-panel--login {
                opacity: 0;
                transform: translateX(-40px);
                pointer-events: none;
                z-index: 1;
            }

            /* SIGNUP — hidden by default */
            .form-panel--signup {
                opacity: 0;
                transform: translateX(40px);
                pointer-events: none;
                z-index: 1;
            }
            .auth-box.signup-active .form-panel--signup {
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
                z-index: 2;
            }

            /* ──────────────────────────────────────────────
               OVERLAY WRAPPER
               Right 50% by default. Slides left on signup.
               ────────────────────────────────────────────── */
            .overlay-wrapper {
                position: absolute;
                top: 0;
                left: 50%;           /* anchored at center — covers right half */
                width: 50%;
                height: 100%;
                overflow: hidden;
                z-index: 10;
                transition: transform ${DUR} ${EASE};
            }
            .auth-box.signup-active .overlay-wrapper {
                transform: translateX(-100%);   /* slides to cover left half */
            }

            /* 200%-wide inner: panel A | panel B */
            .overlay-inner {
                display: flex;
                width: 200%;
                height: 100%;
                transition: transform ${DUR} ${EASE};
            }
            .auth-box.signup-active .overlay-inner {
                transform: translateX(-50%);    /* reveal panel B */
            }

            /* Each panel = half of overlay-inner = full width of wrapper */
            .overlay-panel {
                position: relative;
                width: 50%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 3.5rem;
                background: var(--color-primary-light, #fef9c3);
                overflow: hidden;
                text-align: center;
            }

            .hex-bg {
                position: absolute;
                inset: 0;
                width: 100%; height: 100%;
                opacity: 0.1;
                pointer-events: none;
            }

            .ov-content {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                gap: 0;
            }

            .ov-logo {
                display: flex;
                align-items: center;
                gap: 14px;
                cursor: pointer;
                margin-bottom: 2rem;
            }
            .ov-logo img { width: 48px; height: 48px; border-radius: 12px; }
            .ov-logo-text {
                font-family: var(--font-display, sans-serif);
                font-weight: 800;
                font-size: 1.7rem;
                color: var(--color-primary-deep, #713f12);
            }

            .ov-headline {
                font-family: var(--font-display, sans-serif);
                font-size: 2.2rem;
                font-weight: 800;
                line-height: 1.25;
                color: var(--color-primary-deep, #713f12);
                margin-bottom: 0.85rem;
            }

            .ov-sub {
                font-size: 1.15rem;
                color: var(--color-text-muted, #6b7280);
                line-height: 1.6;
                max-width: 380px;
                margin-bottom: 2rem;
            }

            .ov-features {
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
                max-width: 360px;
                margin-bottom: 2.4rem;
            }

            .ov-feat-row {
                display: flex;
                align-items: center;
                gap: 16px;
                background: rgba(255,255,255,0.52);
                padding: 14px 18px;
                border-radius: 12px;
                text-align: left;
            }

            .ov-feat-icon {
                width: 34px; height: 34px;
                background: var(--color-white, #fff);
                border-radius: 9px;
                display: flex; align-items: center; justify-content: center;
                color: var(--color-primary-deep, #713f12);
                flex-shrink: 0;
                box-shadow: 0 1px 4px rgba(0,0,0,0.09);
            }

            .ov-feat-text {
                font-size: 1.05rem;
                font-weight: 500;
                color: var(--color-text, #1a1a1a);
                line-height: 1.35;
            }

            .ov-switch-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 14px 32px;
                border-radius: 50px;
                border: 2px solid var(--color-primary-deep, #713f12);
                background: transparent;
                color: var(--color-primary-deep, #713f12);
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                font-family: inherit;
                letter-spacing: 0.02em;
                transition: background 0.2s, color 0.2s, transform 0.15s;
                margin-bottom: 1.1rem;
            }
            .ov-switch-btn:hover {
                background: var(--color-primary-deep, #fbb622ff);
                color: #fff;
                transform: translateY(-1px);
            }

            .ov-copy {
                font-size: 0.9rem;
                color: var(--color-text-muted, #6b7280);
            }

            /* ══════════════════════════════════════════════
               SHARED FORM STYLES
               ══════════════════════════════════════════════ */
            .form-inner {
                width: 100%;
                max-width: 480px;
                display: flex;
                flex-direction: column;
            }

            .form-heading {
                font-family: var(--font-display, sans-serif);
                font-size: 2.1rem;
                font-weight: 800;
                color: var(--color-text, #1a1a1a);
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .form-heading svg { color: var(--color-primary, #eab308); }

            .form-sub {
                font-size: 1.05rem;
                color: var(--color-text-muted, #6b7280);
                line-height: 1.55;
                margin-bottom: 1.8rem;
            }

            /* Google button */
            /* Google button container */
            .g-wrap {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1.5rem;
                padding: 0.5rem 0;
                transition: transform 0.2s ease, opacity 0.3s ease;
            }

            /* Enhancing the inner iframe container */
            .g-wrap > div {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Professional soft shadow */
                overflow: hidden;
                transition: box-shadow 0.2s ease;
            }

            .g-wrap:hover {
                transform: translateY(-1px); /* Slight lift on hover */
            }

            .g-wrap > div:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
            }


            /* OR divider */
            .or-divider {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 1.4rem;
                color: var(--color-text-faint, #9ca3af);
                font-size: 0.85rem;
                font-weight: 600;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }
            .or-divider::before, .or-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: var(--color-border, #e5e7eb);
            }

            .fields-stack {
                display: flex;
                flex-direction: column;
                gap: 18px;
                margin-bottom: 0;
            }

            .field-label {
                display: block;
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--color-text, #1a1a1a);
                margin-bottom: 8px;
            }

            .field-row-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .field-row-top .field-label { margin-bottom: 0; }

            .forgot-btn {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--color-text-muted, #6b7280);
                text-decoration: underline;
                background: none; border: none;
                cursor: pointer; padding: 0;
                font-family: inherit;
            }

            .input-wrap { position: relative; }

            .input-wrap input {
                width: 100%;
                padding: 14px 18px 14px 44px;
                border: 1.5px solid var(--color-border, #e5e7eb);
                border-radius: 12px;
                font-size: 1.05rem;
                color: var(--color-text, #1a1a1a);
                background: var(--color-surface, #f9fafb);
                outline: none;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            }
            .input-wrap input:focus {
                border-color: var(--color-primary, #eab308);
                box-shadow: 0 0 0 3px rgba(234,179,8,0.14);
                background: #fff;
            }
            .input-wrap input::placeholder { color: var(--color-text-faint, #9ca3af); }
            .input-wrap input:disabled { opacity: 0.6; cursor: not-allowed; }

            .iicon-l {
                position: absolute;
                left: 16px; top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-faint, #9ca3af);
                pointer-events: none;
                display: flex; line-height: 1;
            }
            .iicon-r {
                position: absolute;
                right: 16px; top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-faint, #9ca3af);
                background: none; border: none; cursor: pointer;
                padding: 2px; display: flex; line-height: 1;
                border-radius: 4px;
                transition: color 0.15s, background 0.15s;
            }
            .iicon-r:hover { color: var(--color-text, #1a1a1a); background: rgba(0,0,0,0.04); }

            .input-wrap--pw input { padding-right: 38px; }

            .submit-btn {
                width: 100%;
                padding: 16px;
                margin-top: 8px;
                border-radius: 12px;
                border: none;
                background: var(--color-primary, #eab308);
                color: #fff;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-family: inherit;
                letter-spacing: 0.02em;
                transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
                box-shadow: 0 4px 14px rgba(234,179,8,0.28);
            }
            .submit-btn:hover:not(:disabled) {
                background: var(--color-primary-dark, #e9b71fff);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(234,179,8,0.36);
            }
            .submit-btn:active:not(:disabled) { transform: translateY(0); }
            .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

            .alert-error {
                padding: 12px 16px;
                border-radius: 10px;
                background: #fef2f2;
                border: 1px solid #fca5a5;
                color: #dc2626;
                font-size: 0.95rem;
                margin-bottom: 1.4rem;
                animation: fadeUp 0.25s ease;
            }
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(-4px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .terms-note {
                font-size: 0.9rem;
                color: var(--color-text-faint, #9ca3af);
                text-align: center;
                margin-top: 16px;
            }

            /* ══════════════════════════════════════════════
               MOBILE  (≤ 680px)
               ══════════════════════════════════════════════ */
            @media (max-width: 680px) {
                .auth-page {
                    padding: 0;
                    align-items: flex-start;
                    background: #fff;
                }

                .auth-box { display: none !important; }

                .mob-shell {
                    display: flex !important;
                    flex-direction: column;
                    min-height: 100vh;
                    width: 100%;
                    background: #fff;
                }

                /* Branded top strip */
                .mob-top {
                    background: var(--color-primary-light, #fef9c3);
                    padding: 1.75rem 1.5rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    text-align: center;
                }
                .mob-logo {
                    display: flex; align-items: center; gap: 9px; cursor: pointer;
                }
                .mob-logo img { width: 33px; height: 33px; border-radius: 8px; }
                .mob-logo-text {
                    font-family: var(--font-display, sans-serif);
                    font-weight: 800; font-size: 1.25rem;
                    color: var(--color-primary-deep, #713f12);
                }
                .mob-tagline {
                    font-size: 0.8rem;
                    color: var(--color-text-muted, #6b7280);
                    line-height: 1.5; max-width: 260px;
                }

                /* Tabs */
                .mob-tabs {
                    display: flex;
                    margin: 1.25rem 1.25rem 0;
                    border-radius: 10px 10px 0 0;
                    overflow: hidden;
                    border: 1.5px solid var(--color-border, #e5e7eb);
                    border-bottom: none;
                }
                .mob-tab {
                    flex: 1; padding: 11px;
                    border: none;
                    font-size: 0.875rem; font-weight: 600;
                    cursor: pointer; font-family: inherit;
                    background: var(--color-surface, #f9fafb);
                    color: var(--color-text-muted, #6b7280);
                    transition: background 0.2s, color 0.2s;
                }
                .mob-tab.active {
                    background: #fff;
                    color: var(--color-primary-deep, #713f12);
                }

                .mob-card {
                    margin: 0 1.25rem 2rem;
                    padding: 1.6rem 1.4rem;
                    border: 1.5px solid var(--color-border, #e5e7eb);
                    border-radius: 0 0 14px 14px;
                    background: #fff;
                }

                .mob-footer {
                    margin-top: auto;
                    padding: 1.25rem;
                    text-align: center;
                    font-size: 0.7rem;
                    color: var(--color-text-faint, #9ca3af);
                }

                .form-heading { font-size: 1.25rem; }
                .form-sub { margin-bottom: 1.1rem; }
            }

            /* ══════════════════════════════════════════════
               MEDIUM  (681 – 900px)
               ══════════════════════════════════════════════ */
            @media (min-width: 681px) {
                .mob-shell { display: none !important; }
            }

            @media (min-width: 681px) and (max-width: 900px) {
                .auth-page { padding: 1rem; align-items: flex-start; padding-top: 2rem; }
                .auth-box { height: auto; min-height: 580px; }
                .form-panel { padding: 2rem 1.75rem; }
                .overlay-panel { padding: 2rem 1.5rem; }
                .ov-headline { font-size: 1.25rem; }
                .ov-features { display: none; }
            }
        `}</style>

        {/* ════════════════════════════════════════════
            PAGE WRAPPER — both desktop & mobile live here
            ════════════════════════════════════════════ */}
        <div className="auth-page">

            {/* ── DESKTOP / TABLET ── */}
            <div className={cls}>

                {/* FORMS CONTAINER */}
                <div className="forms-container">

                    {/* LOGIN */}
                    <div className="form-panel form-panel--login">
                        <div className="form-inner">
                            <h2 className="form-heading">Welcome back</h2>
                            <p className="form-sub">Log in to your BeeBot dashboard and pick up right where you left off.</p>

                            {error && <div className="alert-error">{error}</div>}

                        <div 
                        className="g-wrap" 
                        style={{ 
                            opacity: loading ? 0.7 : 1, 
                            pointerEvents: loading ? 'none' : 'auto',
                            filter: loading ? 'grayscale(20%)' : 'none' 
                        }}
                    >
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline" 
                            shape="rectangular" // "pill" is also an option for a more modern 'Apple-style' look
                            text="signin_with" 
                            size="large" 
                            width="340" // Increased slightly for better visual balance on desktop/mobile
                            logo_alignment="left"
                            useOneTap 
                            auto_select
                        />
                    </div>

                            <div className="or-divider">or continue with email</div>

                            <form onSubmit={handleSubmit} className="fields-stack">
                                <div>
                                    <label className="field-label">Email Address</label>
                                    <div className="input-wrap">
                                        <span className="iicon-l"><Mail size={15} /></span>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" required disabled={loading} />
                                    </div>
                                </div>

                                <div>
                                    <div className="field-row-top">
                                        <label className="field-label">Password</label>
                                        <button type="button" className="forgot-btn">Forgot password?</button>
                                    </div>
                                    <div className="input-wrap input-wrap--pw">
                                        <span className="iicon-l"><Lock size={15} /></span>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
                                        <button type="button" className="iicon-r" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing…' : <><span>Log In</span><ArrowRight size={15} /></>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* SIGNUP */}
                    <div className="form-panel form-panel--signup">
                        <div className="form-inner">
                            <h2 className="form-heading"><UserPlus size={20} /> Create account</h2>
                            <p className="form-sub">Start your 14-day free trial. Join hundreds of businesses using BeeBot 24/7.</p>

                            {error && <div className="alert-error">{error}</div>}

                            <div 
                            className="g-wrap" 
                            style={{ 
                                opacity: loading ? 0.7 : 1, 
                                pointerEvents: loading ? 'none' : 'auto',
                                filter: loading ? 'grayscale(20%)' : 'none' 
                            }}
                        >
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline" 
                                shape="rectangular" // "pill" is also an option for a more modern 'Apple-style' look
                                text="signin_with" 
                                size="large" 
                                width="340" // Increased slightly for better visual balance on desktop/mobile
                                logo_alignment="left"
                                useOneTap 
                                auto_select
                            />
                        </div>

                            <div className="or-divider">or continue with email</div>

                            <form onSubmit={handleSubmit} className="fields-stack">
                                <div>
                                    <label className="field-label">Full Name</label>
                                    <div className="input-wrap">
                                        <span className="iicon-l"><User size={15} /></span>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required disabled={loading} />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Email Address</label>
                                    <div className="input-wrap">
                                        <span className="iicon-l"><Mail size={15} /></span>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" required disabled={loading} />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Password</label>
                                    <div className="input-wrap input-wrap--pw">
                                        <span className="iicon-l"><Lock size={15} /></span>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
                                        <button type="button" className="iicon-r" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing…' : <><span>Create Account</span><ArrowRight size={15} /></>}
                                </button>
                            </form>

                            <p className="terms-note">By signing up you agree to our Terms &amp; Privacy Policy.</p>
                        </div>
                    </div>
                </div>

                {/* OVERLAY */}
                <div className="overlay-wrapper">
                    <div className="overlay-inner">

                        {/* Panel A — shown on login state (overlay on right) */}
                        <div className="overlay-panel">
                            <HexBg />
                            <div className="ov-content">
                                <div className="ov-logo" onClick={() => navigate('/')}>
                                    <img src="/bee-yellow.jpg" alt="BeeBot" />
                                    <span className="ov-logo-text">BeeBot.</span>
                                </div>
                                <h2 className="ov-headline">Scale your support<br />without scaling<br />your team.</h2>
                                <p className="ov-sub">Join hundreds of smart businesses using BeeBot to answer customer questions 24/7.</p>
                                <div className="ov-features">
                                    {features.map((f, i) => (
                                        <div className="ov-feat-row" key={i}>
                                            <div className="ov-feat-icon">{f.icon}</div>
                                            <span className="ov-feat-text">{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="ov-switch-btn" onClick={switchToSignup}>
                                    New here? Sign Up <ChevronRight size={14} />
                                </button>
                                <span className="ov-copy">© {new Date().getFullYear()} BeeBot AI. All rights reserved.</span>
                            </div>
                        </div>

                        {/* Panel B — shown on signup state (overlay on left) */}
                        <div className="overlay-panel">
                            <HexBg />
                            <div className="ov-content">
                                <div className="ov-logo" onClick={() => navigate('/')}>
                                    <img src="/bee-yellow.jpg" alt="BeeBot" />
                                    <span className="ov-logo-text">BeeBot.</span>
                                </div>
                                <h2 className="ov-headline">Already part<br />of the hive?</h2>
                                <p className="ov-sub">Log back in and keep building the support experience your customers love — 24/7.</p>
                                <div className="ov-features">
                                    {features.map((f, i) => (
                                        <div className="ov-feat-row" key={i}>
                                            <div className="ov-feat-icon">{f.icon}</div>
                                            <span className="ov-feat-text">{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="ov-switch-btn" onClick={switchToLogin}>
                                    Back to Log In <ChevronRight size={14} />
                                </button>
                                <span className="ov-copy">© {new Date().getFullYear()} BeeBot AI. All rights reserved.</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>{/* end .auth-box */}

            {/* ── MOBILE (≤ 680px) ── */}
            <div className="mob-shell" style={{ display: 'none' }}>
                <div className="mob-top">
                    <div className="mob-logo" onClick={() => navigate('/')}>
                        <img src="/bee-yellow.jpg" alt="BeeBot" />
                        <span className="mob-logo-text">BeeBot.</span>
                    </div>
                    <p className="mob-tagline">Scale your support without scaling your team.</p>
                </div>

                <div className="mob-tabs">
                    <button className={`mob-tab${isLogin ? ' active' : ''}`} onClick={switchToLogin}>Log In</button>
                    <button className={`mob-tab${!isLogin ? ' active' : ''}`} onClick={switchToSignup}>Sign Up</button>
                </div>

                <div className="mob-card">
                    <h2 className="form-heading" style={{ marginBottom: 4 }}>
                        {isLogin ? <><LogIn size={18} /> Welcome back</> : <><UserPlus size={18} /> Create account</>}
                    </h2>
                    <p className="form-sub">
                        {isLogin ? 'Log in to access your BeeBot dashboard.' : 'Start your 14-day free trial today.'}
                    </p>

                    {error && <div className="alert-error">{error}</div>}

                    <div 
                        className="g-wrap" 
                        style={{ 
                            opacity: loading ? 0.7 : 1, 
                            pointerEvents: loading ? 'none' : 'auto',
                            filter: loading ? 'grayscale(20%)' : 'none' 
                        }}
                    >
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline" 
                            shape="rectangular" // "pill" is also an option for a more modern 'Apple-style' look
                            text="signin_with" 
                            size="large" 
                            width="340" // Increased slightly for better visual balance on desktop/mobile
                            logo_alignment="left"
                            useOneTap 
                            auto_select
                        />
                    </div>

                    <div className="or-divider">or continue with email</div>

                    <form onSubmit={handleSubmit} className="fields-stack">
                        {!isLogin && (
                            <div>
                                <label className="field-label">Full Name</label>
                                <div className="input-wrap">
                                    <span className="iicon-l"><User size={15} /></span>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required={!isLogin} disabled={loading} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="field-label">Email Address</label>
                            <div className="input-wrap">
                                <span className="iicon-l"><Mail size={15} /></span>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" required disabled={loading} />
                            </div>
                        </div>

                        <div>
                            <div className="field-row-top">
                                <label className="field-label">Password</label>
                                {isLogin && <button type="button" className="forgot-btn">Forgot?</button>}
                            </div>
                            <div className="input-wrap input-wrap--pw">
                                <span className="iicon-l"><Lock size={15} /></span>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
                                <button type="button" className="iicon-r" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing…' : isLogin
                                ? <><span>Log In</span><ArrowRight size={15} /></>
                                : <><span>Create Account</span><ArrowRight size={15} /></>
                            }
                        </button>
                    </form>

                    {!isLogin && <p className="terms-note">By signing up you agree to our Terms &amp; Privacy Policy.</p>}
                </div>

                <div className="mob-footer">© {new Date().getFullYear()} BeeBot AI. All rights reserved.</div>
            </div>

        </div>{/* end .auth-page */}
        </>
    );
}

function HexBg() {
    return (
        <svg className="hex-bg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="hxp" width="60" height="103.923" patternUnits="userSpaceOnUse" patternTransform="scale(0.55)">
                    <path
                        d="M30 0L60 17.32v34.64L30 69.28L0 51.96V17.32L30 0zm0 103.92L0 86.6V51.96l30-17.32 30 17.32v34.64L30 103.92z"
                        fill="none"
                        stroke="var(--color-primary-deep, #ffae23ff)"
                        strokeWidth="1.8"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hxp)" />
        </svg>
    );
}