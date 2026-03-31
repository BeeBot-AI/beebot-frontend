import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, Send, CheckCircle, Clock, Search, Headset, X, ChevronLeft, MoreHorizontal, ShieldCheck, ShieldOff } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

export default function ConversationsTab({ businessId, bot }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showThread, setShowThread] = useState(false); // mobile: show right pane

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const fetchConversations = async () => {
        if (!businessId) return;
        try {
            const res = await axios.get(`${config.API_BASE_URL}/conversations`, { withCredentials: true });
            if (res.data.success) setConversations(res.data.data || []);
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [businessId]);

    const fetchMessages = async (convId) => {
        setMessagesLoading(true);
        try {
            const res = await axios.get(`${config.API_BASE_URL}/conversations/${convId}/messages`, { withCredentials: true });
            if (res.data.success) setMessages(res.data.messages);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setMessagesLoading(false);
            scrollToBottom();
        }
    };

    const handleSelectConv = (id) => {
        setSelectedConvId(id);
        fetchMessages(id);
        setShowThread(true);
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    useEffect(() => {
        if (messages.length > 0) scrollToBottom();
    }, [messages]);

    const handleToggleTakeover = async () => {
        if (!selectedConvId) return;
        try {
            const res = await axios.put(`${config.API_BASE_URL}/conversations/${selectedConvId}/takeover`, {}, { withCredentials: true });
            if (res.data.success) {
                setConversations(prev => prev.map(c => c._id === selectedConvId ? res.data.conversation : c));
                if (res.data.conversation.human_takeover) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            }
        } catch (err) {
            console.error("Failed to toggle takeover", err);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedConvId) return;
        try {
            const res = await axios.put(`${config.API_BASE_URL}/conversations/${selectedConvId}/status`, { status }, { withCredentials: true });
            if (res.data.success) {
                setConversations(prev => prev.map(c => c._id === selectedConvId ? res.data.conversation : c));
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || sending || !selectedConvId) return;
        setSending(true);
        try {
            const res = await axios.post(`${config.API_BASE_URL}/conversations/${selectedConvId}/reply`, { content: replyText }, { withCredentials: true });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setReplyText('');
                scrollToBottom();
            }
        } catch (err) {
            console.error("Failed to send reply", err);
        } finally {
            setSending(false);
        }
    };

    const activeConv = conversations.find(c => c._id === selectedConvId);
    const filteredConversations = conversations.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.visitor_id?.toLowerCase().includes(q) ||
            c.visitor_context?.email?.toLowerCase().includes(q) ||
            c.last_message?.toLowerCase().includes(q)
        );
    });

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatMessageTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const StatusBadge = ({ status, human_takeover }) => {
        if (human_takeover) return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: '#FEF3C7', color: '#92400E' }}>
                <Headset size={9} /> Agent
            </span>
        );
        if (status === 'resolved') return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <CheckCircle size={9} /> Resolved
            </span>
        );
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--color-accent)', color: '#000' }}>
                <Clock size={9} /> Active
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '0', height: 'calc(100vh - 180px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <div className="skeleton" style={{ borderRadius: '0' }} />
                <div className="skeleton" style={{ borderRadius: '0' }} />
            </div>
        );
    }

    const botName = bot?.bot_name || 'BeeBot';

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>

            {/* ─── MAIN CHAT LAYOUT ─────────────────────────────── */}
            <div
                className="conversations-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '340px 1fr',
                    flex: 1,
                    minHeight: 0,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                    background: 'var(--color-white)',
                }}
            >

                {/* ═══════════════════════════════════════════════ */}
                {/* LEFT PANEL — Conversation List                  */}
                {/* ═══════════════════════════════════════════════ */}
                <div style={{
                    display: showThread ? 'none' : 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid var(--color-border)',
                    background: 'var(--color-white)',
                    minHeight: 0,
                }}
                    className="conversations-left-pane"
                >
                    {/* List Header */}
                    <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>Inbox</h3>
                            <span style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>
                                {conversations.length}
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search size={15} color="var(--color-text-faint)" style={{ position: 'absolute', left: '11px', top: '11px' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search conversations…"
                                style={{
                                    width: '100%', padding: '9px 9px 9px 34px', borderRadius: '8px',
                                    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                                    outline: 'none', fontSize: '0.875rem', color: 'var(--color-text)',
                                    fontFamily: 'var(--font-body)'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredConversations.length === 0 ? (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                <Headset size={36} color="var(--color-text-faint)" style={{ margin: '0 auto 12px' }} />
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                                    {searchQuery ? 'No results found' : 'No conversations yet'}
                                </p>
                                <p style={{ color: 'var(--color-text-faint)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    {!searchQuery && 'Conversations will appear here once visitors start chatting.'}
                                </p>
                            </div>
                        ) : filteredConversations.map(conv => {
                            const isSelected = conv._id === selectedConvId;
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => handleSelectConv(conv._id)}
                                    style={{
                                        padding: '14px 16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--color-border)',
                                        background: isSelected ? '#f9f9f9' : 'var(--color-white)',
                                        borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-surface)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-white)'; }}
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                            background: conv.human_takeover ? '#FEF3C7' : 'var(--color-surface-2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1.5px solid var(--color-border)',
                                        }}>
                                            {conv.human_takeover ? <Headset size={16} color="#92400E" /> : <User size={16} color="var(--color-text-muted)" />}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {conv.visitor_context?.name || conv.visitor_context?.email || `Visitor #${conv.visitor_id.substring(0, 6)}`}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', flexShrink: 0, marginLeft: '8px' }}>
                                                    {formatTime(conv.last_message_time || conv.started_at)}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                            <StatusBadge status={conv.status} human_takeover={conv.human_takeover} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* RIGHT PANEL — Thread View                       */}
                {/* ═══════════════════════════════════════════════ */}
                <div
                    className="conversations-right-pane"
                    style={{
                        display: (!showThread && window.innerWidth <= 768) ? 'none' : 'flex',
                        flexDirection: 'column',
                        background: '#FAFAFA',
                        minHeight: 0,
                    }}
                >
                    {!selectedConvId || !activeConv ? (
                        /* Empty State */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Headset size={28} color="#000" />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>Select a conversation</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '280px' }}>
                                Click any conversation from the inbox to view the full transcript and assist visitors.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ── Thread Header ── */}
                            <div style={{
                                padding: '14px 20px',
                                borderBottom: '1px solid var(--color-border)',
                                background: 'var(--color-white)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                {/* Back button (mobile) */}
                                <button
                                    onClick={() => { setShowThread(false); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '4px', borderRadius: '6px' }}
                                    title="Back to list"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {/* Visitor Avatar */}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    background: activeConv.human_takeover ? '#FEF3C7' : 'var(--color-surface-2)',
                                    border: '2px solid var(--color-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activeConv.human_takeover ? <Headset size={18} color="#92400E" /> : <User size={18} color="var(--color-text-muted)" />}
                                </div>

                                {/* Visitor Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activeConv.visitor_context?.name || activeConv.visitor_context?.email || `Visitor #${activeConv.visitor_id.substring(0, 8)}`}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeConv.visitor_context?.email && <span>{activeConv.visitor_context.email}</span>}
                                        {activeConv.visitor_context?.current_url && (
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                                • {activeConv.visitor_context.current_url}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {activeConv.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleUpdateStatus('resolved')}
                                            style={{
                                                padding: '7px 13px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                                background: 'var(--color-success-bg)', color: 'var(--color-success)',
                                                border: '1px solid rgba(21,128,61,0.2)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                        >
                                            <CheckCircle size={14} /> Resolve
                                        </button>
                                    )}
                                    <button
                                        onClick={handleToggleTakeover}
                                        style={{
                                            padding: '7px 13px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            background: activeConv.human_takeover ? '#000000' : 'var(--color-surface-2)',
                                            color: activeConv.human_takeover ? '#FFDE21' : 'var(--color-text)',
                                            border: `1px solid ${activeConv.human_takeover ? '#000' : 'var(--color-border)'}`,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '5px'
                                        }}
                                    >
                                        {activeConv.human_takeover ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                        {activeConv.human_takeover ? 'Resume AI' : 'Take Over'}
                                    </button>
                                </div>
                            </div>

                            {/* ── Human Takeover Banner ── */}
                            {activeConv.human_takeover && (
                                <div style={{
                                    padding: '10px 20px',
                                    background: '#000000',
                                    color: '#FFDE21',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <Headset size={15} />
                                    You are now in control. {botName} is paused.
                                </div>
                            )}

                            {/* ── Message Thread ── */}
                            <div style={{
                                flex: 1, overflowY: 'auto', padding: '24px 20px',
                                display: 'flex', flexDirection: 'column', gap: '4px',
                            }}>
                                {messagesLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div className="animate-pulse" style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>Loading messages…</div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
                                        No messages in this conversation yet.
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isUser = msg.role === 'user';
                                        const isAgent = msg.role === 'agent';
                                        const isBot = msg.role === 'assistant';

                                        // Group consecutive same-role messages
                                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                        const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
                                        const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
                                        const isLastInGroup = !nextMsg || nextMsg.role !== msg.role;

                                        return (
                                            <div key={msg._id || idx} style={{
                                                display: 'flex',
                                                flexDirection: isUser ? 'row-reverse' : 'row',
                                                alignItems: 'flex-end',
                                                gap: '8px',
                                                marginBottom: isLastInGroup ? '12px' : '2px',
                                            }}>
                                                {/* Avatar — only on last message in group */}
                                                <div style={{ width: '28px', flexShrink: 0 }}>
                                                    {isLastInGroup && (
                                                        <div style={{
                                                            width: '28px', height: '28px', borderRadius: '50%',
                                                            background: isUser ? 'var(--color-surface-3)' : isAgent ? 'var(--color-accent)' : 'var(--color-primary)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            border: '1.5px solid var(--color-border)',
                                                        }}>
                                                            {isUser ? <User size={14} color="var(--color-text-muted)" /> :
                                                             isAgent ? <Headset size={14} color="#000" /> :
                                                             <Bot size={14} color="#fff" />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bubble */}
                                                <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                                                    {/* Sender label — first in group */}
                                                    {isFirstInGroup && (
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginBottom: '4px', fontWeight: 500, paddingLeft: isUser ? 0 : '2px' }}>
                                                            {isUser ? 'Visitor' : isAgent ? 'You (Agent)' : botName}
                                                        </span>
                                                    )}

                                                    <div style={{
                                                        padding: '10px 14px',
                                                        borderRadius: isUser
                                                            ? (isFirstInGroup ? '18px 4px 18px 18px' : '18px 4px 4px 18px')
                                                            : (isFirstInGroup ? '4px 18px 18px 18px' : '4px 18px 18px 4px'),
                                                        background: isUser ? 'var(--color-primary)' :
                                                                    isAgent ? '#fffde7' : 'var(--color-white)',
                                                        color: isUser ? 'var(--color-white)' : 'var(--color-text)',
                                                        border: isUser ? 'none' : '1px solid var(--color-border)',
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.55',
                                                        boxShadow: 'var(--shadow-xs)',
                                                    }}>
                                                        {msg.content}
                                                    </div>

                                                    {/* Timestamp */}
                                                    {isLastInGroup && (
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-faint)', marginTop: '4px', paddingLeft: isUser ? 0 : '2px' }}>
                                                            {formatMessageTime(msg.timestamp)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* ── Input Area ── */}
                            <div style={{
                                padding: '14px 16px',
                                borderTop: '1px solid var(--color-border)',
                                background: 'var(--color-white)',
                            }}>
                                {activeConv.human_takeover ? (
                                    <form onSubmit={handleSendReply}>
                                        <div style={{
                                            display: 'flex', gap: '10px', alignItems: 'flex-end',
                                            background: 'var(--color-surface)',
                                            border: '1.5px solid var(--color-border)',
                                            borderRadius: '12px',
                                            padding: '10px 10px 10px 16px',
                                            transition: 'border-color 0.2s',
                                        }}
                                            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                        >
                                            <textarea
                                                ref={inputRef}
                                                value={replyText}
                                                onChange={e => {
                                                    setReplyText(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendReply(e);
                                                    }
                                                }}
                                                placeholder="Reply to visitor… (Enter to send, Shift+Enter for new line)"
                                                disabled={sending}
                                                rows={1}
                                                style={{
                                                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                                    color: 'var(--color-text)', fontSize: '0.9rem', resize: 'none',
                                                    fontFamily: 'var(--font-body)', lineHeight: '1.5', maxHeight: '120px',
                                                    overflowY: 'auto',
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !replyText.trim()}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                                    background: replyText.trim() ? 'var(--color-primary)' : 'var(--color-surface-3)',
                                                    color: replyText.trim() ? 'white' : 'var(--color-text-faint)',
                                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: (sending || !replyText.trim()) ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginTop: '6px', textAlign: 'center' }}>
                                            Replying as agent — {botName} is paused
                                        </p>
                                    </form>
                                ) : (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px', background: 'var(--color-surface)', borderRadius: '10px',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 2px rgba(21,128,61,0.2)' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                {botName} is handling this conversation
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleToggleTakeover}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                background: 'var(--color-primary)', color: 'var(--color-white)',
                                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                        >
                                            <Headset size={13} /> Take Over
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
