import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import config from '../../config';

export default function PlaygroundTab({ businessId, bot }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: bot?.welcome_message || 'Hi! I am your BeeBot. Test me by asking a question about your uploaded knowledge!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                body: JSON.stringify({
                    query: userMsg,
                    business_id: businessId,
                    visitor_id: 'dashboard-playground-user'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || data.message || 'Failed to get response'}` }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error while reaching the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">

            {/* Warning Banner */}
            <div className="alert alert-warning">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>
                    <strong>Playground Sandbox:</strong> Test your chatbot configuration and knowledge base here.
                    Messages sent in this playground do not count towards your monthly billing limits.
                </span>
            </div>

            {/* Chat Interface */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Bot size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{bot?.bot_name || 'BeeBot'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }}></div> Online
                        </div>
                    </div>
                </div>

                {/* Chat History */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-surface-2)' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex', gap: '12px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'assistant' ? 'var(--color-primary)' : 'var(--color-white)',
                                border: msg.role === 'user' ? '1px solid var(--color-border)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: msg.role === 'assistant' ? 'white' : 'var(--color-text-muted)',
                                boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(201,139,10,0.3)' : 'var(--shadow-xs)'
                            }}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>

                            {/* Bubble */}
                            <div style={{
                                background: msg.role === 'assistant' ? 'var(--color-white)' : 'var(--color-text)',
                                color: msg.role === 'assistant' ? 'var(--color-text)' : 'var(--color-white)',
                                border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                                padding: '14px 18px',
                                borderRadius: msg.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                <Bot size={16} />
                            </div>
                            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', padding: '14px 18px', borderRadius: '4px 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}>
                                <span className="animate-pulse" style={{ display: 'flex', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', background: 'var(--color-border-strong)', borderRadius: '50%' }}></div>
                                    <div style={{ width: '6px', height: '6px', background: 'var(--color-border-strong)', borderRadius: '50%' }}></div>
                                    <div style={{ width: '6px', height: '6px', background: 'var(--color-border-strong)', borderRadius: '50%' }}></div>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-white)' }}>
                    <form onSubmit={handleSend} className="playground-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask BeeBot a question..."
                            disabled={isLoading}
                            style={{
                                flexGrow: 1, background: 'transparent', border: 'none', color: 'var(--color-text)',
                                fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                                color: input.trim() ? 'white' : 'var(--color-text-faint)',
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={18} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>BeeBot can make mistakes. Consider verifying important information.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
