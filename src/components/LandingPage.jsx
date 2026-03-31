import React, { useEffect, useState } from 'react';
import { Bot, ArrowRight, ShieldCheck, Zap, Globe, MessageSquareDiff, LayoutDashboard, LogIn, Code, Database, Settings, FileText, HelpCircle, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import custom SVGs from our handcrafted DesignSystem
import {
    ArrowCurved, ArrowScribble, WaveDivider, TornPaperDivider,
    TextureDotGrid, TextureCrosshatch, HandDrawnCheck, HandDrawnUnderline, BotLaunchIllustration
} from './ui/DesignSystem';

function LandingPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const [isScrolled, setIsScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{ background: 'var(--color-surface)' }}>
            {/* ─── STICKY NAV ────────────────────────────────────────────── */}
            <nav style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                background: isScrolled ? 'rgba(250, 250, 247, 0.95)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                borderBottom: isScrolled ? '1px solid var(--color-border)' : '1px solid transparent',
                transition: 'all var(--duration-base)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transform: 'rotate(-5deg)' }}>
                            <Bot size={24} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                            BeeBot.
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2.5rem' }} className="hidden-mobile">
                        <a href="#features" className="text-muted nav-link" style={{ fontWeight: 600 }}>Features</a>
                        <a href="#how-it-works" className="text-muted nav-link" style={{ fontWeight: 600 }}>How It Works</a>
                        <a href="#pricing" className="text-muted nav-link" style={{ fontWeight: 600 }}>Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Dashboard <LayoutDashboard size={16} />
                            </button>
                        ) : (
                            <>
                                <button className="btn-ghost hidden-mobile" onClick={() => navigate('/auth')} style={{ fontWeight: 600 }}>
                                    Sign In
                                </button>
                                <button className="btn-primary" onClick={() => navigate('/auth')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
                                    Start Free
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── HANDCRAFTED ASYMMETRIC HERO SECTION ──────────────────────── */}
            <header style={{
                paddingTop: '180px', paddingBottom: '120px',
                background: 'var(--color-surface)',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Organic Background Texture & Shapes */}
                <TextureDotGrid color="var(--color-primary-deep)" opacity={0.05} />
                <div className="animate-float" style={{ position: 'absolute', top: '20%', right: '-5%', width: '600px', height: '600px', background: 'var(--color-primary-light)', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(80px)', opacity: 0.6, zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '400px', height: '400px', background: '#F5DFA0', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)', opacity: 0.4, zIndex: 0 }}></div>

                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 500px)', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>

                    {/* Left: Editorial Content */}
                    <div className="reveal flex-col items-start" style={{ position: 'relative' }}>
                        <div className="badge badge-amber mb-6" style={{ padding: '6px 16px', fontSize: '0.85rem', transform: 'rotate(-2deg)', boxShadow: 'var(--shadow-sm)' }}>
                            <Zap size={14} /> Driven by RAG + Pinecone
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-6xl)', fontWeight: 800, lineHeight: 1.05, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '1.5rem', maxWidth: '100%' }}>
                            Build an expert<br />
                            AI support agent <br />
                            <span style={{ position: 'relative', color: 'var(--color-primary-deep)' }}>
                                in 10 minutes.
                                <HandDrawnUnderline color="var(--color-primary)" height="12px" />
                            </span>
                        </h1>

                        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '540px', marginBottom: '2.5rem' }}>
                            Upload your documentation, paste your website URL, and deploy a flawless customer support agent. No tedious prompt engineering required.
                        </p>

                        <div className="flex gap-4" style={{ position: 'relative' }}>
                            <button className="btn-primary" style={{ padding: '18px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}>
                                Get Started Free <ArrowRight size={18} />
                            </button>
                            <button className="btn-ghost" style={{ padding: '18px 24px', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)', fontWeight: 600, border: '2px solid var(--color-border)' }} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                                See it in action
                            </button>

                            {/* Hand-drawn arrow pointing to CTA */}
                            <div className="hidden-mobile animate-float" style={{ position: 'absolute', right: '-80px', top: '-40px', color: 'var(--color-text-muted)' }}>
                                <ArrowCurved size={60} strokeWidth={2.5} />
                                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', position: 'absolute', right: '-60px', top: '10px', fontSize: '1rem', whiteSpace: 'nowrap' }}>Easy setup</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-surface-3)', border: '2px solid var(--color-surface)', marginLeft: i > 1 ? '-10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="var(--color-text-faint)" /></div>)}
                            </div>
                            <span>Used by <strong>3,000+</strong> course creators</span>
                        </div>
                    </div>

                    {/* Hero Graphic - Phone Mockup Asymmetric Layout */}
                    <div className="reveal reveal-delay-2" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', paddingRight: '2rem' }}>
                        {/* Custom Bot Launch SVG floating near the phone */}
                        <BotLaunchIllustration size={160} className="animate-float" style={{ position: 'absolute', top: '-15%', left: '-10%', zIndex: 10, animationDelay: '-1s' }} />

                        <div className="phone-mockup" style={{ zIndex: 1, transform: 'rotate(2.5deg) translateY(-10px)', boxShadow: 'var(--shadow-hover)' }}>
                            <div className="phone-notch"></div>
                            <div className="phone-screen" style={{ display: 'flex', flexDirection: 'column', padding: '40px 16px 16px' }}>
                                {/* Fake Chat UI inside phone */}
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ alignSelf: 'flex-start', background: '#F3F1EB', padding: '12px', borderRadius: '12px 12px 12px 2px', fontSize: '0.85rem', maxWidth: '85%' }}>
                                        Hi! I'm BeeBot. How can I help you regarding Acne Courses today?
                                    </div>
                                    <div style={{ alignSelf: 'flex-end', background: 'var(--color-primary)', color: 'white', padding: '12px', borderRadius: '12px 12px 2px 12px', fontSize: '0.85rem', maxWidth: '85%', boxShadow: '0 2px 8px rgba(201,139,10,0.3)' }}>
                                        Do you offer refunds if I don't like the course?
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Bot size={14} color="#A6720A" />
                                        </div>
                                        <div style={{ alignSelf: 'flex-start', background: '#F3F1EB', padding: '12px', borderRadius: '12px 12px 12px 2px', fontSize: '0.85rem', maxWidth: '85%' }}>
                                            Yes! We have a 30-day money-back guarantee. No questions asked.
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '44px', background: '#E8E4DC', borderRadius: '22px', marginTop: '16px', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#A8A29E', fontSize: '0.8rem' }}>
                                    Type a message...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── HANDCRAFTED SOCIAL PROOF BAR ─────────────────────────────────────── */}
            <div style={{ padding: '4rem 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
                <div className="container text-center reveal">
                    <p className="text-muted mb-8" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        <span style={{ position: 'relative', display: 'inline-block' }}>
                            Trusted by 3,000+ course creators
                            <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%' }}>
                                <HandDrawnUnderline color="var(--color-primary-mid)" height="8px" />
                            </div>
                        </span>
                    </p>

                    {/* Trust badges gallery */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.8, filter: 'grayscale(100%)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="badge badge-amber" style={{ transform: 'rotate(-3deg)' }}>99.9% Uptime</div>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>CreatorOS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="badge badge-success" style={{ transform: 'rotate(2deg)' }}>+40% Conversion</div>
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px' }}>LUMINA</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="badge badge-muted" style={{ transform: 'rotate(-1deg)' }}>24/7 Support</div>
                            <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem' }}>Aura Learning</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── PROBLEM -> SOLUTION EDITORIAL ────────────────────────────── */}
            <section id="problem-solution" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', background: 'var(--color-surface)' }}>
                {/* Left: The Problem (Dark Wash) */}
                <div style={{ background: 'var(--color-surface-2)', padding: '8rem 10%', position: 'relative', overflow: 'hidden' }}>
                    <TextureCrosshatch color="var(--color-border-strong)" opacity={0.6} />
                    <div className="reveal flex-col items-start" style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '2.5rem' }}>
                            Customer support is drowning your team.
                        </h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '2rem', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ color: 'var(--color-text-faint)', marginTop: '4px' }}><HelpCircle size={28} /></div>
                                "Where's my refund?" "How do I log in?" - spending hours answering the exact same 5 questions.
                            </li>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ color: 'var(--color-text-faint)', marginTop: '4px' }}><ShieldCheck size={28} /></div>
                                Hiring a 24/7 global support team is simply too expensive for a growing course business.
                            </li>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ color: 'var(--color-text-faint)', marginTop: '4px' }}><Settings size={28} /></div>
                                Standard chatbots are rigid, frustrating, and require complex decision-tree coding that constantly breaks.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: The Solution (Light Wash) */}
                <div style={{ background: 'var(--color-primary-light)', padding: '8rem 10%', position: 'relative', overflow: 'hidden' }}>

                    {/* Organic divider from Left to Right */}
                    <div className="hidden-mobile" style={{ position: 'absolute', left: '-30px', top: '-10%', bottom: '-10%', width: '80px', zIndex: 0 }}>
                        <svg viewBox="0 0 100 1000" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <path d="M50,0 Q90,250 30,500 T60,1000 L0,1000 L0,0 Z" fill="var(--color-surface-2)" />
                        </svg>
                    </div>

                    <div className="reveal reveal-delay-2 flex-col items-start" style={{ position: 'relative', zIndex: 10, maxWidth: '500px', marginLeft: 'auto' }}>
                        <div className="badge badge-amber mb-6" style={{ background: 'var(--color-white)', boxShadow: 'var(--shadow-sm)', padding: '6px 16px' }}><Bot size={14} /> The BeeBot Solution</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-primary-deep)', lineHeight: 1.1, marginBottom: '2.5rem' }}>
                            Upload knowledge. <br /> Get an expert agent.
                        </h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '2rem', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                                <div style={{ color: 'var(--color-primary-deep)', marginTop: '4px', flexShrink: 0 }}><HandDrawnCheck size={32} /></div>
                                <strong>Instant Indexing.</strong> BeeBot reads your course PDFs, website URLs, and existing FAQs in seconds.
                            </li>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                                <div style={{ color: 'var(--color-primary-deep)', marginTop: '4px', flexShrink: 0 }}><HandDrawnCheck size={32} /></div>
                                <strong>Perfect Context.</strong> Uses advanced RAG to provide flawless, context-aware answers to your students 24/7.
                            </li>
                            <li style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                                <div style={{ color: 'var(--color-primary-deep)', marginTop: '4px', flexShrink: 0 }}><HandDrawnCheck size={32} /></div>
                                <strong>Zero coding.</strong> Just copy and paste one line of script to deploy the widget anywhere on your site.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <WaveDivider fill="var(--color-surface-2)" />

            {/* ─── HOW IT WORKS (Handcrafted Asymmetric Layout) ───────────────── */}
            <section id="how-it-works" style={{ padding: '8rem 0', background: 'var(--color-surface)' }}>
                <div className="container relative">
                    <div className="text-center mb-16 reveal">
                        <div className="badge badge-amber mb-4" style={{ transform: 'rotate(-2deg)', display: 'inline-block' }}>Speed</div>
                        <h2 className="title mb-4" style={{ fontSize: 'var(--text-5xl)' }}>From zero to live<br /><span style={{ color: 'var(--color-primary-deep)' }}>in 10 minutes.</span></h2>
                        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            We eliminated all the tedious prompt engineering and coding.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '4rem', alignItems: 'center' }}>

                        {/* Left: Step Navigation */}
                        <div className="reveal flex-col" style={{ position: 'relative' }}>
                            {/* Hand-drawn vertical dashed connector */}
                            <svg className="hidden-mobile" width="20" height="100%" viewBox="0 0 20 400" preserveAspectRatio="none" style={{ position: 'absolute', left: '20px', top: '40px', bottom: '0', zIndex: 0, opacity: 0.2 }}>
                                <line x1="10" y1="0" x2="10" y2="400" stroke="var(--color-text)" strokeWidth="2" strokeDasharray="8 8" />
                            </svg>

                            {[
                                { id: 1, icon: <Database size={20} />, title: 'Set Knowledge Base', desc: 'Drag & drop PDFs or paste URLs.' },
                                { id: 2, icon: <Settings size={20} />, title: 'Tune Personality', desc: 'Slider adjustments for brand tone.' },
                                { id: 3, icon: <Code size={20} />, title: 'Copy Snippet', desc: 'One line of code for your site.' },
                                { id: 4, icon: <Zap size={20} />, title: 'Deploy & Relax', desc: 'Bot starts answering instantly.' }
                            ].map((step, index) => (
                                <div key={step.id}
                                    onClick={() => setActiveStep(step.id)}
                                    style={{
                                        position: 'relative', zIndex: 1,
                                        padding: '1.5rem 1.5rem',
                                        cursor: 'pointer',
                                        background: activeStep === step.id ? 'var(--color-white)' : 'transparent',
                                        border: activeStep === step.id ? '2px solid var(--color-border-strong)' : '2px solid transparent',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: activeStep === step.id ? 'var(--shadow-md)' : 'none',
                                        transform: activeStep === step.id ? (index % 2 === 0 ? 'rotate(-1deg) scale(1.02)' : 'rotate(1deg) scale(1.02)') : 'none',
                                        display: 'flex', gap: '16px', alignItems: 'center',
                                        transition: 'all var(--duration-base) var(--ease-out-expo)',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                        background: activeStep === step.id ? 'var(--color-primary)' : 'var(--color-surface-2)',
                                        color: activeStep === step.id ? 'white' : 'var(--color-text-faint)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: activeStep === step.id ? '2px solid var(--color-border-strong)' : '2px solid var(--color-border)',
                                        transition: 'all 0.3s'
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: activeStep === step.id ? 'var(--color-text)' : 'var(--color-text-muted)', marginBottom: '4px' }}>
                                            Step {step.id}: {step.title}
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: activeStep === step.id ? 'var(--color-text-muted)' : 'var(--color-text-faint)', lineHeight: 1.4 }}>{step.desc}</p>
                                    </div>
                                    {/* Arrow for active state */}
                                    {activeStep === step.id && (
                                        <div className="hidden-mobile animate-float" style={{ position: 'absolute', right: '-80px', top: '30%', color: 'var(--color-primary)' }}>
                                            <ArrowCurved size={50} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right: Dynamic Interactive Panel (Editorial Style) */}
                        <div className="reveal reveal-delay-2" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
                            <TextureDotGrid color="var(--color-border-strong)" opacity={0.1} />

                            {/* Panel Background with subtle rotation */}
                            <div className="card-asymmetric" style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--color-white)', padding: '3rem 2rem', transform: 'rotate(1deg)', zIndex: 10, border: '2px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>

                                {activeStep === 1 && (
                                    <div className="animate-fade-in text-center flex-col items-center">
                                        <div className="drag-drop-area" style={{ width: '100%', background: 'var(--color-surface-2)', border: '2px dashed var(--color-border-strong)', padding: '3rem 2rem' }}>
                                            <div style={{ width: '64px', height: '64px', background: 'var(--color-white)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                                                <Database size={32} color="var(--color-primary-deep)" />
                                            </div>
                                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Drop your knowledge here</h4>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>We support PDFs, Docs, TXT, and Web URLs.</p>
                                        </div>
                                    </div>
                                )}

                                {activeStep === 2 && (
                                    <div className="animate-fade-in flex-col" style={{ width: '100%' }}>
                                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Bot Calibration</h4>
                                        <div className="mb-6">
                                            <label className="form-label">Agent Handle</label>
                                            <input type="text" className="input-field" value="Support Bee" readOnly style={{ background: 'var(--color-surface)', pointerEvents: 'none', border: '2px solid var(--color-border)' }} />
                                        </div>
                                        <div className="mb-6">
                                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Tone Slider</span>
                                                <span className="text-muted">Friendly</span>
                                            </label>
                                            <div style={{ height: '8px', background: 'var(--color-surface-2)', borderRadius: '4px', position: 'relative', marginTop: '12px' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '70%', background: 'var(--color-primary)', borderRadius: '4px' }}></div>
                                                <div style={{ position: 'absolute', left: '70%', top: '-6px', width: '20px', height: '20px', background: 'var(--color-white)', border: '4px solid var(--color-primary-deep)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}></div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--color-primary-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-primary)' }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-primary-deep)', fontWeight: 500 }}>"Hi there! How can I help you today? 😊"</p>
                                        </div>
                                    </div>
                                )}

                                {activeStep === 3 && (
                                    <div className="animate-fade-in w-full text-center">
                                        <div style={{ background: '#1c1917', color: '#f5f5f4', padding: '24px', borderRadius: '12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', overflowX: 'auto', marginBottom: '2rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                                            <span style={{ color: '#fbbf24' }}>&lt;script</span> src="https://beebot.ai/widget.js"<span style={{ color: '#fbbf24' }}>&gt;&lt;/script&gt;</span>{'\n'}
                                            <br />
                                            <span style={{ color: '#fbbf24' }}>&lt;script&gt;</span>{'\n'}
                                            <br />
                                            &nbsp;&nbsp;BeeBot.init({'{'}{'\n'}
                                            <br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;apiKey: <span style={{ color: '#a7f3d0' }}>"sk_live_abc123"</span>{'\n'}
                                            <br />
                                            &nbsp;&nbsp;{'}'});{'\n'}
                                            <br />
                                            <span style={{ color: '#fbbf24' }}>&lt;/script&gt;</span>
                                        </div>
                                        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>Copy to Clipboard <CheckCircle size={16} /></button>
                                    </div>
                                )}

                                {activeStep === 4 && (
                                    <div className="animate-fade-in text-center flex-col items-center">
                                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'var(--color-success)', opacity: 0.1, borderRadius: '50%', animation: 'pulseRipple 2s infinite' }}></div>
                                            <div style={{ position: 'absolute', inset: '20px', background: 'var(--color-success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(16,185,129,0.3)' }}>
                                                <Zap size={40} />
                                            </div>
                                        </div>
                                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Deployed!</h3>
                                        <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>Your BeeBot widget is now live and intercepting customer support queries automatically.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURE DEEP-DIVES (Alternating Layouts) ──────────────────── */}

            {/* Deep Dive 1: Left Image, Right Text */}
            <section id="features" style={{ padding: '8rem 0', background: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
                {/* Organic wave separating from previous section */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
                    <WaveDivider fill="var(--color-surface)" />
                </div>

                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                    <div className="reveal" style={{ position: 'relative' }}>
                        {/* Custom Blob Background */}
                        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'var(--color-surface-2)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', zIndex: 0 }}></div>

                        <div className="card-asymmetric" style={{ position: 'relative', padding: '2rem', background: 'var(--color-white)', minHeight: '360px', display: 'flex', flexDirection: 'column', zIndex: 1, boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="badge badge-amber" style={{ transform: 'rotate(-2deg)' }}><FileText size={12} /> Syllabus.pdf</span>
                                <span className="badge badge-success" style={{ transform: 'rotate(1deg)' }}><Globe size={12} /> mycourse.com/faq</span>
                                <span className="badge badge-muted" style={{ transform: 'rotate(-1deg)' }}><MessageSquareDiff size={12} /> Help Desk Logs</span>
                            </div>
                            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--color-border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton" style={{ height: '8px', width: '60%', marginBottom: '8px', background: 'var(--color-border-strong)' }}></div>
                                        <div className="skeleton" style={{ height: '8px', width: '40%', background: 'var(--color-border-strong)' }}></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton" style={{ height: '8px', width: '80%', marginBottom: '8px', background: 'var(--color-border)' }}></div>
                                        <div className="skeleton" style={{ height: '8px', width: '50%', background: 'var(--color-border)' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.9rem', boxShadow: 'var(--shadow-lg)', transform: 'rotate(-3deg)' }}>
                                <CheckCircle size={16} className="inline mr-2" /> 98% Accuracy
                            </div>
                        </div>
                    </div>

                    <div className="reveal reveal-delay-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--color-surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
                                <Database size={24} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vector Intelligence</span>
                        </div>
                        <h2 className="title mb-4" style={{ fontSize: 'var(--text-4xl)', lineHeight: 1.1 }}>It knows your course better than you do.</h2>
                        <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            BeeBot doesn't guess. It uses enterprise-grade RAG (Retrieval-Augmented Generation) to search your uploaded documents and website in milliseconds. If the answer is in your syllabus, BeeBot will find it.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text)' }}>
                                <ArrowCurved size={20} color="var(--color-primary-deep)" /> No hallucinations. Answers only from your data.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text)' }}>
                                <ArrowCurved size={20} color="var(--color-primary-deep)" /> Auto-syncs with your website URLs every 24 hours.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Deep Dive 2: Right Image, Left Text (Darker Wash) */}
            <section style={{ padding: '8rem 0', background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
                <TextureCrosshatch color="var(--color-border-strong)" opacity={0.3} />
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div className="reveal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--color-white)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                                <Zap size={24} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seamless Handoff</span>
                        </div>
                        <h2 className="title mb-4" style={{ fontSize: 'var(--text-4xl)', lineHeight: 1.1 }}>When it's too complex, a human steps in.</h2>
                        <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            BeeBot handles 80% of routine questions. For the 20% that require a human touch (like refund negotiations or complex tech support), it smoothly hands the conversation over to your email or helpdesk.
                        </p>
                    </div>

                    <div className="reveal reveal-delay-2" style={{ position: 'relative' }}>
                        <div className="card-asymmetric" style={{ padding: '2rem', background: 'var(--color-white)', borderRadius: '24px 8px 24px 8px', boxShadow: 'var(--shadow-lg)' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Live Conversation</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ alignSelf: 'flex-start', background: 'var(--color-surface-2)', padding: '12px 16px', borderRadius: '12px 12px 12px 2px', fontSize: '0.9rem', maxWidth: '85%' }}>
                                    I need a refund for the Masterclass, but it's past 30 days because I was in the hospital.
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-end', maxWidth: '85%' }}>
                                    <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-text)', padding: '12px 16px', borderRadius: '12px 12px 2px 12px', fontSize: '0.9rem', border: '1px solid var(--color-primary)' }}>
                                        I'm so sorry to hear that. My policy strictness prevents me from processing this automatically. Let me connect you with a human manager who can help.
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', alignSelf: 'flex-end' }}>
                                        <Zap size={10} className="inline mr-1" /> Escalating to Support Inbox...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── MASONRY TESTIMONIALS (Handcrafted Quotes) ───────────────── */}
            <section style={{ padding: '8rem 0', background: 'var(--color-surface)', position: 'relative' }}>
                <div className="container">
                    <div className="text-center mb-16 reveal">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => <Zap key={i} size={16} color="var(--color-primary-deep)" fill="var(--color-primary-deep)" />)}
                        </div>
                        <h2 className="title" style={{ fontSize: 'var(--text-4xl)' }}>Loved by course creators.</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                        {/* Testimonial 1 */}
                        <div className="reveal card-asymmetric" style={{ background: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', borderTopRightRadius: '80px', position: 'relative', marginTop: '2rem' }}>
                            <div style={{ position: 'absolute', top: '10px', right: '20px', opacity: 0.1, fontFamily: 'serif', fontSize: '100px', lineHeight: 1 }}>"</div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                                "BeeBot replaced our bloated Zendesk setup in one afternoon. Our customers get instant answers, and our ticket volume dropped by 60% literally overnight."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary-light)', border: '2px solid var(--color-border)' }}></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>Sarah Jenkins</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Founder, Digital Course Academy</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 (Elevated and different bg) */}
                        <div className="reveal reveal-delay-1 card-asymmetric" style={{ background: 'var(--color-primary-deep)', color: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', borderBottomLeftRadius: '60px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '10px', left: '20px', opacity: 0.1, fontFamily: 'serif', fontSize: '100px', lineHeight: 1, transform: 'scaleX(-1)' }}>"</div>
                            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                                "I was skeptical about AI support sounding robotic. But after tweaking the personality slider to 'Empathetic', my students literally think they are talking to my lead assistant."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', opacity: 0.2 }}></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Marcus Thorne</p>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Fitness Coach & Educator</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="reveal reveal-delay-2 card-asymmetric" style={{ background: 'var(--color-surface-2)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', borderBottomRightRadius: '60px', position: 'relative', marginTop: '4rem' }}>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                                "The setup took exactly 4 minutes. I uploaded our massive 50-page course FAQ PDF, and BeeBot parsed it instantly. It's magic."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-border)', border: '2px solid var(--color-surface)' }}></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>Elena Rodriguez</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tech Skills Bootcamp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── METRICS & TRUST (Wave Divided) ─────────────────────────────── */}
            <section style={{ padding: '8rem 0', background: 'var(--color-primary-deep)', position: 'relative', overflow: 'hidden', color: 'white' }}>
                <div style={{ position: 'absolute', top: '-2px', left: 0, width: '100%', overflow: 'hidden', lineHeight: 0, transform: 'rotate(180deg)' }}>
                    <WaveDivider fill="var(--color-surface)" />
                </div>

                <TextureDotGrid color="var(--color-white)" opacity={0.05} />

                <div className="container relative z-10">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
                        <div className="reveal">
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary-light)' }}>
                                3.2M+
                            </h3>
                            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Questions Answered</p>
                            <HandDrawnUnderline color="var(--color-primary)" height="8px" style={{ width: '80px', margin: '1rem auto 0' }} />
                        </div>
                        <div className="reveal reveal-delay-1">
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary-light)' }}>
                                $4.5M
                            </h3>
                            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Support Costs Saved</p>
                            <HandDrawnUnderline color="var(--color-success)" height="8px" style={{ width: '80px', margin: '1rem auto 0' }} />
                        </div>
                        <div className="reveal reveal-delay-2">
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary-light)' }}>
                                &lt;1s
                            </h3>
                            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Average Response Time</p>
                            <HandDrawnUnderline color="var(--color-accent)" height="8px" style={{ width: '80px', margin: '1rem auto 0' }} />
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '-2px', left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
                    <WaveDivider fill="var(--color-surface)" />
                </div>
            </section>

            {/* ─── ASYMMETRIC PRICING ────────────────────────────────────────── */}
            <section id="pricing" style={{ padding: '8rem 0', background: 'var(--color-surface)', position: 'relative' }}>
                <div className="container">
                    <div className="text-center mb-16 reveal">
                        <h2 className="title mb-4" style={{ fontSize: 'var(--text-4xl)' }}>Simple, transparent pricing.</h2>
                        <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
                            Start for free. Upgrade when your course blows up. No hidden fees.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) minmax(300px, 450px)', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>

                        {/* Free Tier */}
                        <div className="reveal card-asymmetric" style={{ padding: '3rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '2px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Starter</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}>$0</span>
                                <span className="text-muted">/mo</span>
                            </div>
                            <p className="text-muted mb-6" style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>Perfect for new course creators validating their offer.</p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                {[
                                    '1 Bot Widget',
                                    'Up to 500 messages/mo',
                                    '10 Document Uploads',
                                    'Basic Analytics'
                                ].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                                        <HandDrawnCheck size={20} color="var(--color-text-faint)" /> {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className="btn-ghost" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)', border: '2px solid var(--color-border)' }} onClick={() => navigate('/auth')}>
                                Get Started Free
                            </button>
                        </div>

                        {/* Pro Tier (Elevated & Recommended) */}
                        <div className="reveal reveal-delay-2 card-asymmetric" style={{ padding: '3.5rem 3rem', background: 'var(--color-primary-deep)', color: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', transform: 'rotate(1deg) scale(1.05)', position: 'relative', zIndex: 10 }}>
                            <div style={{ position: 'absolute', top: '-15px', right: '2rem', background: 'var(--color-accent)', color: 'white', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', transform: 'rotate(5deg)', boxShadow: 'var(--shadow-md)' }}>
                                Most Popular
                            </div>

                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary-light)' }}>Pro</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}>$49</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>/mo</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.5 }}>Everything you need to scale customer support fully automatically.</p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                {[
                                    'Unlimited Bot Widgets',
                                    '10,000 messages/mo',
                                    'Unlimited Document Uploads',
                                    'Custom Bot Personality',
                                    'URL Auto-syncing',
                                    'Human Handoff Integration'
                                ].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 500 }}>
                                        <div style={{ color: 'var(--color-primary-light)' }}><HandDrawnCheck size={24} /></div> {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-pill)', background: 'var(--color-white)', color: 'var(--color-primary-deep)', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} onClick={() => navigate('/auth')}>
                                Start 14-Day Free Trial
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ACCORDION (Editorial Style) ───────────────────────────── */}
            <section style={{ padding: '8rem 0', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'flex-start' }}>
                        <div className="reveal" style={{ position: 'sticky', top: '120px' }}>
                            <div className="badge badge-amber mb-4">Questions?</div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                                Frequently asked questions.
                            </h2>
                            <p className="text-muted mb-6" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                                Can't find the answer you're looking for? Reach out to our 100% human support team at help@beebot.ai.
                            </p>
                            <HandDrawnUnderline color="var(--color-primary)" height="8px" style={{ width: '120px' }} />
                        </div>

                        <div className="reveal reveal-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { q: "Do I need to know how to code?", a: "Not at all. If you can copy and paste a single line of text into your website platform (like Kajabi, Teachable, WordPress, or Webflow), you can install BeeBot." },
                                { q: "How accurate is the AI really?", a: "Because BeeBot uses strict RAG indexing, it only answers based on the PDFs and URLs you provide. It is heavily prompted to refuse answering questions outside of its knowledge base to prevent hallucinations." },
                                { q: "What happens if a customer asks something complex?", a: "BeeBot detects frustration and highly complex queries. When this happens, it gracefully offers to collect the user's email address and forwards the transcript to your support inbox." },
                                { q: "Can I use BeeBot on multiple websites?", a: "Yes. The Pro plan allows you to create multiple different bots with separate knowledge bases and embed them across different domains." }
                            ].map((faq, index) => (
                                <details key={index} style={{ background: 'var(--color-white)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-primary)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                                    <summary style={{ listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, outline: 'none' }}>
                                        {faq.q}
                                        <div style={{ color: 'var(--color-primary-deep)' }}><ArrowRight size={20} /></div>
                                    </summary>
                                    <p className="text-muted" style={{ marginTop: '1.5rem', fontSize: '1.05rem', lineHeight: 1.6, paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─────────────────────────────────────────────────── */}
            <section style={{ padding: '8rem 0', background: 'var(--color-accent)', color: 'var(--color-white)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
                    <WaveDivider fill="var(--color-surface-2)" />
                </div>

                <TextureDotGrid color="var(--color-white)" opacity={0.1} />
                <div className="animate-float" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'var(--color-primary-deep)', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(100px)', opacity: 0.8, zIndex: 0 }}></div>

                <div className="container reveal text-center" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="title" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--color-white)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Stop answering tickets.<br />Start scaling.
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.5 }}>
                        Deploy your expert AI agent in 10 minutes. 14-day free trial. Cancel anytime.
                    </p>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="btn-primary" style={{ padding: '20px 48px', fontSize: '1.25rem', borderRadius: 'var(--radius-pill)', background: 'var(--color-white)', color: 'var(--color-accent)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}>
                            Get Started Free <ArrowRight size={24} style={{ marginLeft: '8px' }} />
                        </button>
                        {/* Wobbly Custom Arrow Pointing to CTA */}
                        <div className="hidden-mobile animate-float" style={{ position: 'absolute', left: '-120px', bottom: '-20px', color: 'var(--color-primary-light)', transform: 'scaleX(-1) rotate(45deg)' }}>
                            <ArrowCurved size={80} strokeWidth={2} />
                            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', position: 'absolute', left: '60px', bottom: '-20px', fontSize: '1.2rem', color: 'white', whiteSpace: 'nowrap', transform: 'scaleX(-1) rotate(-45deg)' }}>No credit card required</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── EDITORIAL FOOTER ────────────────────────────────────────────── */}
            <footer style={{ padding: '6rem 0 2rem', background: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', fontSize: '15rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-border)', opacity: 0.3, zIndex: 0, userSelect: 'none' }}>
                    Bee.
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 1fr 1fr', gap: '4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '4rem', marginBottom: '2rem' }}>
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transform: 'rotate(-5deg)' }}>
                                    <Bot size={24} />
                                </div>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                                    BeeBot.
                                </span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '300px' }}>
                                The handcrafted AI customer support platform designed specifically for course creators and educators.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Product</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                                <li><a href="#features" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a></li>
                                <li><a href="#how-it-works" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>How it Works</a></li>
                                <li><a href="#pricing" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a></li>
                                <li><a href="#" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard Login</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Legal & Contact</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                                <li><a href="#" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</a></li>
                                <li><a href="#" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</a></li>
                                <li><a href="mailto:hello@beebot.ai" className="text-muted footer-link" style={{ fontSize: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}>hello@beebot.ai</a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--color-text-faint)' }}>
                        <p>© {new Date().getFullYear()} BeeBot AI Inc. Handcrafted in San Francisco.</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Systems Operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
