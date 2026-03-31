import React, { useState } from 'react';
import { Bot, ArrowRight, CheckCircle, Store, MessageSquare, Hexagon, Settings, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import axios from 'axios';
import config from '../config';

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { refetchUser } = useAuth();
    const { startTour } = useTour();
    const navigate = useNavigate();

    // Step 0: Business Info
    const [businessForm, setBusinessForm] = useState({ name: '', website: '' });

    // Step 1: Chatbot Form (live preview)
    const [chatbotForm, setChatbotForm] = useState({
        bot_name: 'Support Bee',
        tone: 'professional',
        welcome_message: 'Hi there! How can I help you today?',
        fallback_message: "I couldn't find an answer to that. Please contact our human support."
    });

    const STEPS = [
        { title: 'Business Profile', icon: <Store size={18} /> },
        { title: 'AI Configuration', icon: <Bot size={18} /> },
        { title: 'Launch Sequence', icon: <CheckCircle size={18} /> }
    ];

    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.post(`${config.API_BASE_URL}/business`, {
                business_name: businessForm.name,
                website_url: businessForm.website
            }, { withCredentials: true });
            setStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save business info');
        } finally {
            setLoading(false);
        }
    };

    const handleChatbotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.post(`${config.API_BASE_URL}/chatbot`, {
                bot_name: chatbotForm.bot_name,
                bot_tone: chatbotForm.tone, // Maps state to backend schema
                welcome_message: chatbotForm.welcome_message,
                fallback_message: chatbotForm.fallback_message
            }, { withCredentials: true });
            await refetchUser();
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save chatbot settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', position: 'relative', overflow: 'hidden' }}>

            {/* ─── LEFT SIDEBAR (Progress & Context) 30% ─── */}
            <div className="hidden-mobile" style={{ width: '30%', minWidth: '320px', maxWidth: '400px', background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Abstract corner SVG texture */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }}>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle fill="var(--color-text)" cx="2" cy="2" r="1.5"></circle></pattern></defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
                    </svg>
                </div>

                <div className="flex items-center gap-3 mb-16 relative z-10">
                    <img src="/bee-yellow.jpg" alt="BeeBot Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-text)' }}>BeeBot Setup.</span>
                </div>

                <div style={{ flex: 1, position: 'relative', zIndex: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '2.5rem', color: 'var(--color-text)' }}>Your Launch Path</h3>

                    <div style={{ position: 'relative' }}>
                        {/* Hand-drawn vertical track line */}
                        <svg width="4" height="100%" style={{ position: 'absolute', left: '18px', top: '10px', zIndex: 0, overflow: 'visible' }}>
                            <path d="M2,0 Q-2,50 3,100 T1,200" fill="none" stroke="var(--color-border-strong)" strokeWidth="2" strokeDasharray="6 4" />
                            <path d="M2,0 Q-2,50 3,100" fill="none" stroke="var(--color-primary-deep)" strokeWidth="3" strokeDasharray="1000" strokeDashoffset={step === 0 ? 1000 : step === 1 ? 50 : 0} style={{ transition: 'stroke-dashoffset 1s var(--ease-out-expo)' }} />
                        </svg>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 1 }}>
                            {STEPS.map((s, i) => {
                                const isActive = step === i;
                                const isPast = step > i;
                                const isFuture = step < i;

                                return (
                                    <div key={i} style={{ display: 'flex', gap: '16px', opacity: isFuture ? 0.5 : 1, transition: 'all 0.3s' }}>
                                        {/* Status Node */}
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                            background: isPast ? 'var(--color-primary-deep)' : isActive ? 'var(--color-white)' : 'var(--color-surface)',
                                            color: isPast ? 'var(--color-white)' : isActive ? 'var(--color-primary-deep)' : 'var(--color-text-faint)',
                                            border: `2px solid ${isPast ? 'var(--color-primary-deep)' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isActive ? '0 0 0 4px rgba(201,139,10,0.1)' : 'none',
                                            transition: 'all 0.3s var(--ease-out-expo)'
                                        }}>
                                            {isPast ? <CheckCircle size={18} /> : s.icon}
                                        </div>
                                        {/* Content */}
                                        <div style={{ paddingTop: '8px' }}>
                                            <h4 style={{ fontWeight: isActive ? 700 : 500, fontSize: '1.05rem', color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)', marginBottom: '4px' }}>{s.title}</h4>
                                            {isActive && (
                                                <p className="animate-fade-in text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                    {i === 0 && "Let's align the AI to your specific brand and domain."}
                                                    {i === 1 && "Shape the personality that your customers will interact with."}
                                                    {i === 2 && "Everything is wired up. Ready for the final launch."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="text-faint" style={{ fontSize: '0.85rem', marginTop: 'auto', paddingTop: '2rem' }}>
                    Need help? <a href="#" className="text-primary font-semibold">Chat with support</a>
                </div>
            </div>

            {/* ─── RIGHT CONTENT AREA (Forms) 70% ─── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>

                {/* Mobile Header (Hidden on Desktop) */}
                <header className="show-mobile" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                    <div className="flex items-center gap-3">
                        <img src="/bee-yellow.jpg" alt="BeeBot Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>BeeBot Setup.</span>
                    </div>
                </header>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
                    <div className="card-asymmetric animate-fade-in" style={{ width: '100%', maxWidth: step === 1 ? '850px' : '520px', padding: '3.5rem', background: 'var(--color-white)', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 10 }}>

                        {error && <div className="alert alert-error mb-6">{error}</div>}

                        {step === 0 && (
                            <div>
                                <div className="mb-8 relative" style={{ zIndex: 1 }}>
                                    <h1 className="title mb-3" style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>Step into the future.</h1>
                                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>First, tell us about your business so we can tailor the AI's core behavior.</p>

                                    {/* Abstract Organic Bot Illustration */}
                                    <svg width="80" height="80" viewBox="0 0 100 100" style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, zIndex: -1 }}>
                                        <path d="M50 0 C77 0 100 23 100 50 C100 77 77 100 50 100 C23 100 0 77 0 50 C0 23 23 0 50 0 Z" fill="var(--color-primary-deep)"></path>
                                    </svg>
                                </div>

                                <form onSubmit={handleBusinessSubmit} className="flex-col gap-5">
                                    <div>
                                        <label className="form-label">Company Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <Store size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-faint)' }} />
                                            <input type="text" value={businessForm.name} onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })} className="input-field" style={{ paddingLeft: '44px', padding: '12px 12px 12px 44px', fontSize: '1.05rem', background: 'var(--color-surface)' }} placeholder="Acme Corp" required disabled={loading} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Website URL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Link size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-faint)' }} />
                                            <input type="url" value={businessForm.website} onChange={e => setBusinessForm({ ...businessForm, website: e.target.value })} className="input-field" style={{ paddingLeft: '44px', padding: '12px 12px 12px 44px', fontSize: '1.05rem', background: 'var(--color-surface)' }} placeholder="https://acme.com" required disabled={loading} />
                                        </div>
                                        <p className="text-faint mt-2" style={{ fontSize: '0.85rem' }}>We use this to verify your domain and auto-sync pages.</p>
                                    </div>

                                    <button type="submit" className="btn-primary w-full mt-6" disabled={loading} style={{ padding: '16px', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)', boxShadow: '0 4px 15px rgba(201,139,10,0.3)' }}>
                                        {loading ? 'Saving...' : <>Continue to AI Setup <ArrowRight size={20} className="inline ml-2" /></>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1.2fr 1fr' : '1fr', gap: '3rem' }}>
                                <div>
                                    <div className="mb-6">
                                        <h1 className="title mb-2" style={{ fontSize: '2rem' }}>Configure your AI</h1>
                                        <p className="text-muted" style={{ fontSize: '1rem' }}>Shape the personality your customers will talk to.</p>
                                    </div>

                                    <form onSubmit={handleChatbotSubmit} className="flex-col gap-4">
                                        <div>
                                            <label className="form-label">Bot Name</label>
                                            <div style={{ position: 'relative' }}>
                                                <Bot size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-faint)' }} />
                                                <input type="text" value={chatbotForm.bot_name} onChange={e => setChatbotForm({ ...chatbotForm, bot_name: e.target.value })} className="input-field" style={{ paddingLeft: '44px', padding: '12px 12px 12px 44px', background: 'var(--color-surface)' }} required disabled={loading} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label">Tone of Voice</label>
                                            <select value={chatbotForm.tone} onChange={e => setChatbotForm({ ...chatbotForm, tone: e.target.value })} className="input-field" style={{ padding: '12px', background: 'var(--color-surface)' }} disabled={loading}>
                                                <option value="professional">Professional & Direct</option>
                                                <option value="friendly">Friendly & Casual</option>
                                                <option value="persuasive">Persuasive (Sales-focused)</option>
                                                <option value="empathetic">Empathetic & Warm</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="form-label">Welcome Message</label>
                                            <textarea value={chatbotForm.welcome_message} onChange={e => setChatbotForm({ ...chatbotForm, welcome_message: e.target.value })} className="input-field" rows="3" style={{ padding: '12px', background: 'var(--color-surface)' }} required disabled={loading}></textarea>
                                        </div>

                                        <button type="submit" className="btn-primary w-full mt-4" disabled={loading} style={{ padding: '16px', fontSize: '1.05rem', borderRadius: 'var(--radius-pill)' }}>
                                            {loading ? 'Deploying Bot...' : <>Deploy Intelligence <CheckCircle size={20} className="inline ml-2" /></>}
                                        </button>
                                    </form>
                                </div>

                                {/* Live Preview Panel */}
                                <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)', position: 'relative' }}>

                                    <div style={{ position: 'absolute', top: '-15px', right: '15px', background: 'var(--color-white)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-deep)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', zIndex: 10 }}>LIVE PREVIEW</div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src="/bee-chat.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{chatbotForm.bot_name || 'Bot Name'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }}></div> Online
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="animate-fade-in" style={{ alignSelf: 'flex-start', background: 'var(--color-white)', padding: '16px', borderRadius: '16px 16px 16px 4px', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)', maxWidth: '90%', border: '1px solid var(--color-border)' }}>
                                            {chatbotForm.welcome_message || 'Type a welcome message...'}
                                        </div>
                                        <div className="animate-fade-in" style={{ alignSelf: 'flex-end', background: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: '16px 16px 4px 16px', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(201,139,10,0.3)', maxWidth: '90%', animationDelay: '0.5s', animationFillMode: 'both' }}>
                                            How does your pricing work?
                                        </div>
                                        <div className="animate-fade-in" style={{ alignSelf: 'flex-start', background: 'var(--color-white)', padding: '16px', borderRadius: '16px 16px 16px 4px', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)', maxWidth: '90%', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', animationDelay: '1s', animationFillMode: 'both' }}>
                                            <span className="animate-pulse" style={{ display: 'flex', gap: '4px' }}>
                                                <div style={{ width: '6px', height: '6px', background: 'var(--color-text-faint)', borderRadius: '50%' }}></div>
                                                <div style={{ width: '6px', height: '6px', background: 'var(--color-text-faint)', borderRadius: '50%' }}></div>
                                                <div style={{ width: '6px', height: '6px', background: 'var(--color-text-faint)', borderRadius: '50%' }}></div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center animate-fade-in" style={{ padding: '3rem 0' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-success-light)', margin: '0 auto 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: -10, border: '2px dashed var(--color-success)', borderRadius: '50%', opacity: 0.3, animation: 'spin 10s linear infinite' }}></div>
                                    <Hexagon size={50} color="var(--color-success)" style={{ transform: 'rotate(90deg)' }} />
                                    <CheckCircle size={24} color="var(--color-white)" style={{ position: 'absolute', fill: 'var(--color-success)' }} />
                                </div>
                                <h1 className="title mb-4" style={{ fontSize: '2.5rem' }}>You're ready to launch!</h1>
                                <p className="text-muted mb-8" style={{ fontSize: '1.15rem', maxWidth: '400px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                    Your business profile is set and your AI is deployed. Next, let's take a quick 2-minute tour of your new command center.
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        startTour();
                                        navigate('/dashboard');
                                    }}
                                    style={{ padding: '18px 40px', fontSize: '1.15rem', borderRadius: 'var(--radius-pill)', boxShadow: '0 8px 30px rgba(201,139,10,0.4)', position: 'relative' }}
                                >
                                    Enter Dashboard <ArrowRight size={20} className="inline ml-2" />
                                    {/* Hand-drawn pointer connecting to CTA */}
                                    <svg width="60" height="60" style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'var(--color-primary-deep)', transform: 'rotate(-20deg)', pointerEvents: 'none' }}>
                                        <path d="M10,50 Q30,-10 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <polygon points="45,5 50,10 55,15" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative Blob in Right Content Background */}
                <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', width: '500px', height: '500px', background: 'var(--color-primary-light)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, zIndex: 0, pointerEvents: 'none' }}></div>

            </main>
        </div>
    );
}
