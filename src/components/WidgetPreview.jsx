import React, { useState } from 'react';
import { Send, Bot, X } from 'lucide-react';

export default function WidgetPreview({ config }) {
    const [messages, setMessages] = useState([
        { role: 'bot', text: `Hi! I'm ${config.botName}. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');

    const primary = config.primaryColor || '#45f3ff';

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const newMsgs = [...messages, { role: 'user', text: input }];
        setMessages(newMsgs);
        setInput('');

        // Simulate bot thinking
        setTimeout(() => {
            setMessages([...newMsgs, { role: 'bot', text: 'This is a preview response. Once deployed, I will answers based on your knowledge base!' }]);
        }, 1000);
    };

    return (
        <div className="phone-mockup">
            <div className="phone-notch"></div>

            <div className="phone-screen" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Mock Website Background */}
                <div style={{ flex: 1, padding: '2rem 1rem', background: '#fff' }}>
                    <div style={{ height: '20px', background: '#e0e0e0', width: '60%', borderRadius: '4px', marginBottom: '1rem' }}></div>
                    <div style={{ height: '100px', background: '#f5f5f5', width: '100%', borderRadius: '8px', marginBottom: '1rem' }}></div>
                    <div style={{ height: '40px', background: '#f5f5f5', width: '80%', borderRadius: '8px' }}></div>
                </div>

                {/* Floating Chat Widget UI */}
                <div style={{
                    position: 'absolute', bottom: '20px', right: '20px', left: '20px',
                    background: '#fff', borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column',
                    height: '400px',
                    overflow: 'hidden'
                }}>

                    {/* Widget Header */}
                    <div style={{
                        background: primary,
                        padding: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#fff' // Assuming dark text on light primary, or vice versa
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '50%' }}>
                                <Bot size={20} color="#fff" />
                            </div>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{config.botName}</span>
                        </div>
                        <X size={20} color="#fff" />
                    </div>

                    {/* Widget Body */}
                    <div style={{
                        flex: 1, padding: '1rem', overflowY: 'auto',
                        background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                    }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                background: m.role === 'user' ? primary : '#fff',
                                color: m.role === 'user' ? '#fff' : '#333',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: m.role === 'user' ? '4px' : '12px',
                                borderBottomLeftRadius: m.role === 'bot' ? '4px' : '12px',
                                maxWidth: '85%',
                                fontSize: '0.9rem',
                                boxShadow: m.role === 'bot' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                                border: m.role === 'bot' ? '1px solid #eee' : 'none'
                            }}>
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {/* Widget Input */}
                    <form style={{
                        padding: '0.75rem',
                        borderTop: '1px solid #eee',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: '#fff'
                    }} onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            style={{
                                flex: 1, border: 'none', background: '#f5f5f5',
                                padding: '0.75rem 1rem', borderRadius: '20px',
                                outline: 'none', fontSize: '0.9rem'
                            }}
                        />
                        <button type="submit" style={{
                            background: primary, color: '#fff', border: 'none',
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <Send size={16} />
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
