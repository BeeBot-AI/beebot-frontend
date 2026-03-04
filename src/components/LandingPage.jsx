import React from 'react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                    <img src="/bee-yellow.jpg" alt="BeeBots" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                        <h1 className="title" style={{ color: '#FFD700' }}>BeeBots</h1>
                        <p className="subtitle">AI Customer Support SaaS</p>
                    </div>
                </div>

                <button
                    className="btn-primary gap-2"
                    onClick={() => navigate('/auth')}
                >
                    Get Started
                </button>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '4rem 0' }}>
                <div className="mb-6" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '100px', color: '#FFD700', fontWeight: '500' }}>
                    <Sparkles size={16} /> Now with Google SSO
                </div>

                <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
                    Automate Your Support with <span style={{ color: '#FFD700' }}>BeeBot AI</span>
                </h1>

                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
                    A plug-and-play AI customer support agent for your website. Grounded in your knowledge base, ready in minutes.
                </p>

                <div className="flex gap-4">
                    <button
                        className="btn-primary"
                        style={{ fontSize: '1.1rem', padding: '16px 32px' }}
                        onClick={() => navigate('/auth')}
                    >
                        Start for Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                    </button>
                    <button
                        className="glass-panel"
                        style={{ padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, border: '1px solid rgba(255, 215, 0, 0.3)', color: '#FFD700', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        View Features
                    </button>
                </div>
            </main>

            {/* Basic Features Section */}
            <section id="features" className="grid-layout gap-8 mt-12 mb-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="glass-panel p-8 text-center" style={{ borderRadius: '16px' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
                        <Bot size={24} />
                    </div>
                    <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Smart Responses</h3>
                    <p className="text-muted">Upload your PDFs and docs to train BeeBot securely.</p>
                </div>

                <div className="glass-panel p-8 text-center" style={{ borderRadius: '16px' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
                        <Sparkles size={24} />
                    </div>
                    <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Custom Personalities</h3>
                    <p className="text-muted">Choose your agent's tone. Friendly, professional, or persuasive.</p>
                </div>

                <div className="glass-panel p-8 text-center" style={{ borderRadius: '16px' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
                        <ArrowRight size={24} />
                    </div>
                    <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Easy Deployment</h3>
                    <p className="text-muted">Just copy and paste one line of code into your website.</p>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
