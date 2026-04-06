import { useState, useRef } from 'react';
import { ArrowRight, CheckCircle, Store, Bot, Upload, Code, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import axios from 'axios';
import config from '../config';

const TONES = [
    { value: 'friendly',     label: 'Friendly',      emoji: '😊', desc: 'Casual & warm' },
    { value: 'professional', label: 'Professional',  emoji: '💼', desc: 'Direct & formal' },
    { value: 'concise',      label: 'Concise',       emoji: '⚡', desc: 'Short answers' },
    { value: 'persuasive',   label: 'Persuasive',    emoji: '🎯', desc: 'Sales-focused' },
    { value: 'empathetic',   label: 'Empathetic',    emoji: '🤝', desc: 'Caring & supportive' },
];

const STEPS = [
    { label: 'Welcome',       icon: <Store size={16} /> },
    { label: 'Bot Setup',     icon: <Bot size={16} /> },
    { label: 'Knowledge',     icon: <Upload size={16} /> },
    { label: 'Embed',         icon: <Code size={16} /> },
];

export default function Onboarding() {
    const [step, setStep]       = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const { refetchUser, setBusinessProfile } = useAuth();
    const { startTour }         = useTour();
    const navigate              = useNavigate();
    const fileInputRef          = useRef(null);

    const [businessForm, setBusinessForm] = useState({ name: '', industry: '' });
    const [chatbotForm, setChatbotForm]   = useState({
        bot_name: 'Support Bee',
        tone: 'professional',
        welcome_message: 'Hi there! How can I help you today?',
    });
    const [kbFile, setKbFile]             = useState(null);
    const [kbUploading, setKbUploading]   = useState(false);
    const [kbDone, setKbDone]             = useState(false);
    const [dragOver, setDragOver]         = useState(false);

    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.post(`${config.API_BASE_URL}/business`, {
                business_name: businessForm.name,
                website_url: businessForm.industry,
            }, { withCredentials: true });
            setStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save business info.');
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
                bot_tone: chatbotForm.tone,
                welcome_message: chatbotForm.welcome_message,
            }, { withCredentials: true });
            await refetchUser();
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save chatbot settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleKbSubmit = async (e) => {
        e.preventDefault();
        if (!kbFile) return;
        setKbUploading(true); setError('');
        try {
            const fd = new FormData();
            fd.append('file', kbFile);
            await axios.post(`${config.API_BASE_URL}/knowledge/upload`, fd, { withCredentials: true });
            setKbDone(true);
            setTimeout(() => setStep(3), 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. You can add knowledge later from the dashboard.');
        } finally {
            setKbUploading(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setKbFile(file);
    };


    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)' }}>

            {/* ── Left Panel (dark, branding + stepper) ──────────────────────── */}
            <div style={{
                width: '320px', minWidth: '320px', background: '#000000ff', color: '#fff',
                display: 'flex', flexDirection: 'column', padding: '2.5rem 2rem',
                position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
            }} className="hidden-mobile">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
                    <img src="/bee-yellow.jpg" alt="BeeBot" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FDD017', letterSpacing: '-0.02em' }}>BeeBot</span>
                </div>

                {/* Tagline */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, color: '#fff', marginBottom: '8px' }}>
                        Set up your AI chatbot in minutes.
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        Follow the steps to launch BeeBot on your website.
                    </p>
                </div>

                {/* Vertical stepper */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {STEPS.map((s, i) => {
                        const isPast    = step > i;
                        const isActive  = step === i;
                        return (
                            <div key={i} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: i < STEPS.length - 1 ? '2rem' : 0 }}>
                                {/* Connector line */}
                                {i < STEPS.length - 1 && (
                                    <div style={{
                                        position: 'absolute', left: '17px', top: '34px',
                                        width: '2px', height: 'calc(100% - 18px)',
                                        background: isPast ? '#FDD017' : 'rgba(255,255,255,0.1)',
                                        transition: 'background 0.4s'
                                    }} />
                                )}
                                {/* Circle */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isPast ? '#FDD017' : isActive ? 'transparent' : 'rgba(255,255,255,0.06)',
                                    border: isActive ? '2px solid #FDD017' : isPast ? '2px solid #FDD017' : '2px solid rgba(255,255,255,0.15)',
                                    color: isPast ? '#000' : isActive ? '#FDD017' : 'rgba(255,255,255,0.3)',
                                    transition: 'all 0.3s',
                                    zIndex: 1,
                                }}>
                                    {isPast ? <CheckCircle size={16} /> : s.icon}
                                </div>
                                {/* Label */}
                                <div style={{ paddingTop: '7px' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom help */}
                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
                    Need help? <a href="mailto:support@beebot.ai" style={{ color: '#FDD017', textDecoration: 'none' }}>Contact support</a>
                </div>
            </div>

            {/* ── Right Panel (white, form) ───────────────────────────────────── */}
            <main style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', minHeight: '100vh', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '520px' }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }} className="show-mobile">
                        <img src="/bee-yellow.jpg" alt="BeeBot" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>BeeBot</span>
                    </div>

                    {/* Step counter */}
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-accent-deep)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Step {step + 1} of {STEPS.length}
                    </div>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                            <X size={14} style={{ flexShrink: 0 }} />
                            {error}
                            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}><X size={14} /></button>
                        </div>
                    )}

                    {/* ─ Step 0: Welcome ─ */}
                    {step === 0 && (
                        <div className="animate-fade-in">
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', marginBottom: '8px', lineHeight: 1.15 }}>Welcome to BeeBot 👋</h1>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Tell us about your business so we can tailor your AI chatbot.</p>

                            <form onSubmit={handleBusinessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label">Company Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                                    <input
                                        type="text" className="input-field"
                                        style={{ padding: '12px 14px' }}
                                        placeholder="Acme Corp"
                                        value={businessForm.name}
                                        onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })}
                                        required disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Industry / Website URL</label>
                                    <input
                                        type="text" className="input-field"
                                        style={{ padding: '12px 14px' }}
                                        placeholder="e.g. E-commerce, SaaS, or https://acme.com"
                                        value={businessForm.industry}
                                        onChange={e => setBusinessForm({ ...businessForm, industry: e.target.value })}
                                        disabled={loading}
                                    />
                                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', marginTop: '6px' }}>Helps the AI understand your domain context.</p>
                                </div>

                                <button type="submit" disabled={loading || !businessForm.name} style={{ marginTop: '0.5rem', padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', opacity: loading || !businessForm.name ? 0.6 : 1 }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FDD017'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#000'}
                                >
                                    {loading ? 'Saving...' : <><span>Continue</span><ArrowRight size={16} /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ─ Step 1: Bot Personality ─ */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', marginBottom: '8px', lineHeight: 1.15 }}>Bot Personality</h1>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Shape the voice and style your visitors will interact with.</p>

                            <form onSubmit={handleChatbotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label">Bot Name</label>
                                    <input
                                        type="text" className="input-field"
                                        style={{ padding: '12px 14px' }}
                                        value={chatbotForm.bot_name}
                                        onChange={e => setChatbotForm({ ...chatbotForm, bot_name: e.target.value })}
                                        required disabled={loading}
                                        placeholder="Support Bee"
                                    />
                                </div>

                                <div>
                                    <label className="form-label" style={{ marginBottom: '10px' }}>Tone of Voice</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {TONES.map(t => (
                                            <button
                                                key={t.value} type="button"
                                                onClick={() => setChatbotForm({ ...chatbotForm, tone: t.value })}
                                                style={{
                                                    padding: '12px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                                                    border: chatbotForm.tone === t.value ? '2px solid #FDD017' : '2px solid var(--color-border)',
                                                    background: chatbotForm.tone === t.value ? '#FFFBDC' : '#fff',
                                                    fontFamily: 'inherit', transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{t.emoji}</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#000' }}>{t.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">Welcome Message</label>
                                    <textarea
                                        className="input-field"
                                        style={{ padding: '12px 14px', resize: 'vertical', minHeight: '80px' }}
                                        value={chatbotForm.welcome_message}
                                        onChange={e => setChatbotForm({ ...chatbotForm, welcome_message: e.target.value })}
                                        required disabled={loading}
                                        placeholder="Hi there! How can I help you today?"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setStep(0)} style={{ flex: 1, padding: '13px', background: '#fff', color: '#000', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '13px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.6 : 1, transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FDD017'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#000'}
                                    >
                                        {loading ? 'Saving...' : <><span>Continue</span><ArrowRight size={16} /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ─ Step 2: Knowledge Base ─ */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', marginBottom: '8px', lineHeight: 1.15 }}>Add Knowledge</h1>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Upload a document so your bot can answer questions about your business.</p>

                            <form onSubmit={handleKbSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: `2px dashed ${dragOver ? '#FDD017' : 'var(--color-border)'}`,
                                        borderRadius: '12px', padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                                        background: dragOver ? '#FFFBDC' : 'var(--color-surface)', transition: 'all 0.2s'
                                    }}
                                >
                                    <Upload size={28} color={dragOver ? '#C8A000' : 'var(--color-text-faint)'} style={{ margin: '0 auto 10px' }} />
                                    {kbFile ? (
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#000', marginBottom: '4px' }}>{kbFile.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>{(kbFile.size / 1024).toFixed(1)} KB · Click to change</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#000', marginBottom: '4px' }}>Drop your file here or click to browse</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>Supports PDF, DOCX, TXT, CSV (max 10MB)</div>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.docx,.txt,.csv" onChange={e => { if (e.target.files?.[0]) setKbFile(e.target.files[0]); }} />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', background: '#fff', color: '#000', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={kbUploading || !kbFile} style={{ flex: 2, padding: '13px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (kbUploading || !kbFile) ? 0.6 : 1 }}>
                                        {kbUploading ? 'Uploading...' : kbDone ? <><CheckCircle size={15} /> Done!</> : <><span>Upload & Continue</span><ArrowRight size={16} /></>}
                                    </button>
                                </div>

                                <button type="button" onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', marginTop: '4px' }}>
                                    Skip for now — I'll add knowledge later
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ─ Step 3: Embed ─ */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFFBDC', border: '2px solid #FDD017', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <CheckCircle size={26} color="#C8A000" />
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', marginBottom: '8px', lineHeight: 1.15 }}>You're all set!</h1>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Add this script to your website to go live. Your API key and config are already embedded.</p>

                            {/* Script tag preview */}
                            <div style={{ background: '#0d0d0d', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#666', fontFamily: 'var(--font-mono)' }}>HTML</span>
                                </div>
                                <pre style={{ margin: 0, padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#e0e0e0', lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'pre' }}>
                                    <span style={{ color: '#7dd3fc' }}>&lt;script</span>{'\n'}
                                    {'  '}<span style={{ color: '#a5f3fc' }}>src</span>=<span style={{ color: '#fde68a' }}>"https://beebot-ai.vercel.app/widget.js"</span>{'\n'}
                                    {'  '}<span style={{ color: '#a5f3fc' }}>data-api-key</span>=<span style={{ color: '#fde68a' }}>"YOUR_API_KEY"</span>{'\n'}
                                    {'  '}<span style={{ color: '#a5f3fc' }}>data-api-url</span>=<span style={{ color: '#fde68a' }}>"https://beebot-backend.onrender.com"</span>{'\n'}
                                    {'  '}<span style={{ color: '#a5f3fc' }}>defer</span><span style={{ color: '#7dd3fc' }}>&gt;&lt;/script&gt;</span>
                                </pre>
                            </div>

                            <div style={{ padding: '12px 16px', background: '#FFFBDC', border: '1.5px solid #FDD017', borderRadius: '10px', fontSize: '0.82rem', color: '#7a5c00', marginBottom: '1.5rem' }}>
                                Get your exact API key from <strong>Dashboard → Install</strong> tab after setup.
                            </div>

                            <button
                                onClick={() => { setBusinessProfile(true); startTour(); navigate('/dashboard'); }}
                                style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FDD017'}
                                onMouseLeave={e => e.currentTarget.style.background = '#000'}
                            >
                                Launch Dashboard <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
