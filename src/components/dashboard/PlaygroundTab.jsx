import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, ExternalLink, Settings, ArrowRight } from 'lucide-react';
import config from '../../config';

export default function PlaygroundTab({ businessId, bot, onNavigate }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: bot?.welcome_message || 'Hi! I am your BeeBot. Test me by asking a question about your uploaded knowledge!' }
    ]);
    const [input, setInput]       = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef          = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch(`${config.API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ query: userMsg, business_id: businessId, visitor_id: 'dashboard-playground-user' })
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.ok ? data.response : `Error: ${data.error || data.message || 'Failed to get response'}`
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error while reaching the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetConversation = () => {
        setMessages([{ role: 'assistant', content: bot?.welcome_message || 'Hi! How can I help you today?' }]);
    };

    const primaryColor = bot?.primary_color || '#000000';

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: 'calc(100vh - 120px)', alignItems: 'start' }}>

            {/* ── Left Panel: Settings Sidebar ─────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>

                {/* Testing Mode badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FFFBDC', border: '1.5px solid #FDD017', borderRadius: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C8A000', flexShrink: 0, animation: 'pulse 2s ease infinite' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7a5c00' }}>Testing Mode — Sandbox</span>
                </div>

                {/* Bot Config Summary */}
                <div className="card p-5">
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bot Configuration</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                        {/* Color swatch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: primaryColor, border: '2px solid var(--color-border)', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Widget Color</div>
                                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)', fontWeight: 500 }}>{primaryColor}</div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Bot Name</div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text)' }}>{bot?.bot_name || 'BeeBot'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Tone</div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', textTransform: 'capitalize' }}>{bot?.bot_tone || 'Professional'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Welcome Message</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{bot?.welcome_message?.slice(0, 60) || 'Hi! How can I help you today?'}{bot?.welcome_message?.length > 60 ? '…' : ''}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate?.('settings')}
                        style={{ marginTop: '14px', width: '100%', padding: '9px', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-text-muted)', transition: 'all 0.15s' }}
                    >
                        <Settings size={13} /> Edit Bot Settings <ArrowRight size={12} />
                    </button>
                </div>

                {/* Guide */}
                <div style={{ padding: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                        What you see here is exactly what your visitors see. Try asking a question from your knowledge base.
                    </p>
                </div>
            </div>

            {/* ── Right Panel: Chat Window ──────────────────────────────────── */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', background: 'var(--color-white)', boxShadow: 'var(--shadow-md)' }}>

                {/* Mac-style browser chrome */}
                <div style={{ background: '#f0f0f0', padding: '10px 14px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                    </div>
                    <div style={{ flex: 1, background: '#e0e0e0', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                        yourwebsite.com
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={resetConversation}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 7px', borderRadius: '5px', fontFamily: 'inherit', transition: 'background 0.15s' }}
                            title="Reset conversation"
                        >
                            <Trash2 size={13} /> Reset
                        </button>
                        <a
                            href="/playground-preview"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 7px', borderRadius: '5px', textDecoration: 'none', transition: 'background 0.15s' }}
                            title="Open in new tab"
                        >
                            <ExternalLink size={13} /> New Tab
                        </a>
                    </div>
                </div>

                {/* Chat header */}
                <div style={{ padding: '13px 16px', background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src="/bee-chat.png" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', lineHeight: 1.2 }}>{bot?.bot_name || 'BeeBot'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} /> Online
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.85)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                        Testing Mode
                    </span>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', background: '#f7f8fa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '80%', padding: '9px 13px', fontSize: '0.88rem', lineHeight: 1.55, wordBreak: 'break-word',
                                background: msg.role === 'user' ? primaryColor : '#fff',
                                color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                                border: msg.role === 'assistant' ? '1px solid #e8e8e8' : 'none',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{ background: '#fff', border: '1px solid #e8e8e8', padding: '11px 15px', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {[0, 0.15, 0.3].map((delay, i) => (
                                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ccc', animation: `bounce3dot 1.2s ease infinite`, animationDelay: `${delay}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '10px 12px', borderTop: '1px solid #efefef', background: '#fff', flexShrink: 0 }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask a question from your knowledge base…"
                            disabled={isLoading}
                            style={{ flex: 1, padding: '9px 14px', background: '#f9fafb', border: '1.5px solid #e2e8f0', borderRadius: '20px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', color: '#1a1a1a', transition: 'border-color 0.15s' }}
                            onFocus={e => e.target.style.borderColor = primaryColor}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', background: input.trim() ? primaryColor : '#e2e8f0', color: input.trim() ? '#fff' : '#aaa', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                        >
                            <Send size={15} style={{ marginLeft: '-1px' }} />
                        </button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.65rem', color: '#bbb' }}>Powered by BeeBot</div>
                </div>
            </div>
        </div>
    );
}
