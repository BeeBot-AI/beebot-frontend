import React, { useState } from 'react';
import { Bot, CheckCircle, Save, Plus, X, Palette } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

export default function BotSettingsTab({ bot }) {
    const [chatbotForm, setChatbotForm] = useState(bot || {
        bot_name: 'BeeBot',
        bot_tone: 'friendly',
        welcome_message: 'Hi there! How can I help you today?',
        fallback_message: "I couldn't find an answer to that. Please contact support.",
        primary_color: '#000000',
        conversation_starters: [],
    });

    const [newStarter, setNewStarter] = useState('');
    const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error

    const handleSaveChatbot = async () => {
        setSaveState('saving');
        try {
            await axios.post(`${config.API_BASE_URL}/chatbot`, chatbotForm, { withCredentials: true });
            setSaveState('success');
            setTimeout(() => setSaveState('idle'), 3000);
        } catch (err) {
            console.error(err);
            setSaveState('error');
            setTimeout(() => setSaveState('idle'), 4000);
        }
    };

    const addStarter = () => {
        const trimmed = newStarter.trim();
        if (!trimmed || chatbotForm.conversation_starters.length >= 5) return;
        setChatbotForm(prev => ({ ...prev, conversation_starters: [...prev.conversation_starters, trimmed] }));
        setNewStarter('');
    };

    const removeStarter = (idx) => {
        setChatbotForm(prev => ({
            ...prev,
            conversation_starters: prev.conversation_starters.filter((_, i) => i !== idx)
        }));
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'min(100%, 600px) 1fr', gap: '3rem', alignItems: 'start' }} className="animate-fade-in bot-settings-grid">

            {/* Left Column: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Core Settings */}
                <div className="card p-6">
                    <h3 className="section-title mb-1">Bot Personality</h3>
                    <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>Customize how your bot presents itself to visitors.</p>

                    <div className="flex-col gap-5">
                        <div>
                            <label className="form-label">Bot Name</label>
                            <input
                                className="input-field"
                                type="text"
                                value={chatbotForm.bot_name}
                                onChange={e => setChatbotForm({ ...chatbotForm, bot_name: e.target.value })}
                            />
                            <p className="text-faint mt-2" style={{ fontSize: '0.8rem' }}>Shown in the chat widget header.</p>
                        </div>

                        <div>
                            <label className="form-label">Tone of Voice</label>
                            <select
                                className="input-field"
                                value={chatbotForm.bot_tone}
                                onChange={e => setChatbotForm({ ...chatbotForm, bot_tone: e.target.value })}
                            >
                                <option value="friendly">Friendly & Casual</option>
                                <option value="professional">Professional & Direct</option>
                                <option value="concise">Concise (Short answers)</option>
                                <option value="persuasive">Persuasive (Sales-focused)</option>
                                <option value="empathetic">Empathetic & Warm</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Welcome Message</label>
                            <textarea
                                className="input-field"
                                style={{ resize: 'vertical', minHeight: '80px' }}
                                value={chatbotForm.welcome_message}
                                onChange={e => setChatbotForm({ ...chatbotForm, welcome_message: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="form-label">Fallback Message</label>
                            <textarea
                                className="input-field"
                                style={{ resize: 'vertical', minHeight: '80px' }}
                                value={chatbotForm.fallback_message}
                                onChange={e => setChatbotForm({ ...chatbotForm, fallback_message: e.target.value })}
                            />
                            <p className="text-faint mt-2" style={{ fontSize: '0.8rem' }}>Shown when the bot cannot find an answer.</p>
                        </div>
                    </div>
                </div>

                {/* Brand Color */}
                <div className="card p-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <Palette size={18} color="var(--color-text-muted)" />
                        <h3 className="section-title">Widget Color</h3>
                    </div>
                    <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>Set the primary color of your chat widget (bubble, header, user messages).</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="color"
                                value={chatbotForm.primary_color || '#000000'}
                                onChange={e => setChatbotForm({ ...chatbotForm, primary_color: e.target.value })}
                                style={{
                                    width: '52px', height: '52px', border: '2px solid var(--color-border)',
                                    borderRadius: '10px', cursor: 'pointer', padding: '2px', background: 'none'
                                }}
                                title="Pick widget color"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                className="input-field"
                                value={chatbotForm.primary_color || '#000000'}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                        setChatbotForm({ ...chatbotForm, primary_color: val });
                                    }
                                }}
                                style={{ width: '120px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
                                maxLength={7}
                                placeholder="#000000"
                            />
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: chatbotForm.primary_color || '#000000', border: '2px solid var(--color-border)' }} />
                    </div>

                    {/* Quick presets */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {['#000000', '#1d4ed8', '#7c3aed', '#be185d', '#047857', '#b45309', '#0891b2', '#dc2626'].map(c => (
                            <button
                                key={c}
                                onClick={() => setChatbotForm({ ...chatbotForm, primary_color: c })}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%', background: c, border: `3px solid ${chatbotForm.primary_color === c ? 'var(--color-accent)' : 'transparent'}`,
                                    cursor: 'pointer', outline: chatbotForm.primary_color === c ? '2px solid var(--color-accent)' : 'none', outlineOffset: '2px'
                                }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>

                {/* Conversation Starters */}
                <div className="card p-6">
                    <h3 className="section-title mb-1">Conversation Starters</h3>
                    <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>
                        Quick-reply buttons shown in the widget when chat opens. Up to 5 prompts.
                    </p>

                    <div className="flex-col gap-3">
                        {chatbotForm.conversation_starters.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ flex: 1, padding: '9px 14px', background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                    {s}
                                </div>
                                <button
                                    onClick={() => removeStarter(i)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: '4px', borderRadius: '4px' }}
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {chatbotForm.conversation_starters.length < 5 && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newStarter}
                                    onChange={e => setNewStarter(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStarter())}
                                    placeholder="e.g. What are your pricing plans?"
                                    maxLength={80}
                                />
                                <button
                                    onClick={addStarter}
                                    disabled={!newStarter.trim()}
                                    className="btn-primary"
                                    style={{ padding: '10px 14px', flexShrink: 0 }}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        )}

                        {chatbotForm.conversation_starters.length === 0 && (
                            <p className="text-faint" style={{ fontSize: '0.82rem' }}>No starters yet. Add prompts to help visitors get started quickly.</p>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="btn-primary"
                        onClick={handleSaveChatbot}
                        disabled={saveState === 'saving'}
                        style={{ minWidth: '160px' }}
                    >
                        {saveState === 'saving' ? (
                            <span className="animate-pulse">Saving...</span>
                        ) : saveState === 'success' ? (
                            <><CheckCircle size={16} /> Saved Successfully</>
                        ) : (
                            <><Save size={16} /> Save Changes</>
                        )}
                    </button>

                    {saveState === 'error' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-error)' }}>Failed to save. Please try again.</span>
                    )}
                </div>
            </div>

            {/* Right Column: Live Widget Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ width: '100%', maxWidth: '340px', position: 'sticky', top: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 className="section-title" style={{ fontSize: '1rem' }}>Live Preview</h4>
                        <span className="badge badge-success">Widget UI</span>
                    </div>

                    {/* Simulated Widget */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '460px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', borderRadius: '16px' }}>

                        {/* Header */}
                        <div style={{ padding: '14px 16px', background: chatbotForm.primary_color || '#000000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="/bee-chat.png" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.15)' }} onError={e => e.target.style.display = 'none'} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>{chatbotForm.bot_name || 'BeeBot'}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} /> Online
                                    </div>
                                </div>
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', cursor: 'pointer' }}>×</span>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, background: '#f7f8fa', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            {/* Welcome message */}
                            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', maxWidth: '88%' }}>
                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: chatbotForm.primary_color || '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                                    <Bot size={13} color="#fff" />
                                </div>
                                <div style={{ background: '#fff', color: '#1a1a1a', padding: '10px 13px', borderRadius: '4px 13px 13px 13px', fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #ebebeb', lineHeight: 1.5 }}>
                                    {chatbotForm.welcome_message || 'Welcome! How can I help?'}
                                </div>
                            </div>

                            {/* Conversation starters */}
                            {chatbotForm.conversation_starters.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                    {chatbotForm.conversation_starters.slice(0, 3).map((s, i) => (
                                        <div key={i} style={{
                                            padding: '8px 12px', background: '#fff', border: `1.5px solid ${chatbotForm.primary_color || '#000'}`,
                                            borderRadius: '8px', fontSize: '0.8rem', color: chatbotForm.primary_color || '#000',
                                            fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #efefef', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ flex: 1, padding: '8px 14px', background: '#f9fafb', border: '1.5px solid #e2e8f0', borderRadius: '20px', fontSize: '0.82rem', color: '#aaa' }}>Ask a question…</div>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: chatbotForm.primary_color || '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', padding: '5px 0 7px', fontSize: '0.65rem', color: '#bbb', borderTop: '1px solid #f0f0f0', background: '#fff', flexShrink: 0 }}>
                            Powered by BeeBot
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
