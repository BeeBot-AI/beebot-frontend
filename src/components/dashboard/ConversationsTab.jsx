import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    User, Bot, Send, CheckCircle, Search, Headset, ChevronLeft,
    ShieldCheck, ShieldOff, AlertCircle, Wifi, WifiOff, Circle,
    MessageSquare, ArrowDown,
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import config from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SOCKET_URL = config.API_BASE_URL.replace(/\/api$/, '');

const STATUS_CONFIG = {
    active:       { label: 'AI Active',      bg: '#DCFCE7', color: '#166534', dot: '#22C55E', pulse: false },
    needs_human:  { label: 'Awaiting Agent', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', pulse: true  },
    human_active: { label: 'Agent Active',   bg: '#000',    color: '#FFDE21', dot: '#FFDE21', pulse: false },
    resolved:     { label: 'Resolved',       bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', pulse: false },
};

const TABS = [
    { key: 'live',         label: 'Live'     },  // default — all active (AI + Human + Awaiting)
    { key: 'needs_human',  label: 'Awaiting' },  // visitor requested human, not yet claimed
    { key: 'human_active', label: 'Agent'    },  // agent has taken over
    { key: 'active',       label: 'AI'       },  // AI handling only
    { key: 'resolved',     label: 'Resolved' },
];

const getStatusCfg = (conv) => {
    if (conv.human_takeover) return STATUS_CONFIG.human_active;
    return STATUS_CONFIG[conv.status] || STATUS_CONFIG.active;
};

const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMins = Math.floor((now - d) / 60000);
    if (diffMins < 1)    return 'Just now';
    if (diffMins < 60)   return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Coloured pill badge showing conversation status */
const StatusBadge = ({ conv }) => {
    const cfg = getStatusCfg(conv);
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 700,
            background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0,
                animation: cfg.pulse ? 'ctPulse 1.4s infinite' : 'none',
            }} />
            {cfg.label}
        </span>
    );
};

/** Skeleton loader for a single list row */
const SkeletonRow = () => (
    <div style={{ padding: '13px 15px', display: 'flex', gap: 11, borderBottom: '1px solid var(--color-border)' }}>
        <div className="ct-skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="ct-skeleton" style={{ height: 12, width: '60%', borderRadius: 6 }} />
            <div className="ct-skeleton" style={{ height: 10, width: '85%', borderRadius: 6 }} />
            <div className="ct-skeleton" style={{ height: 18, width: '35%', borderRadius: 100 }} />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ConversationsTab({ businessId, bot }) {

    // ── State ─────────────────────────────────────────────────────────────────
    const [conversations,    setConversations]    = useState([]);
    const [loading,          setLoading]          = useState(true);
    const [selectedConvId,   setSelectedConvId]   = useState(null);
    const [messages,         setMessages]         = useState([]);
    const [messagesLoading,  setMessagesLoading]  = useState(false);
    const [replyText,        setReplyText]        = useState('');
    const [sending,          setSending]          = useState(false);
    const [searchQuery,      setSearchQuery]      = useState('');
    const [activeTab,        setActiveTab]        = useState('live');
    const [showThread,       setShowThread]       = useState(false);   // mobile toggle
    const [socketConnected,  setSocketConnected]  = useState(false);
    const [unreadMap,        setUnreadMap]        = useState({});      // { convId: count }
    const [agentTyping]                           = useState(false);
    const [isTyping,         setIsTyping]         = useState(false);
    const [showScrollBtn,    setShowScrollBtn]    = useState(false);   // "↓ new messages" button

    // ── Refs ──────────────────────────────────────────────────────────────────
    const messagesEndRef    = useRef(null);
    const messagesAreaRef   = useRef(null);
    const inputRef          = useRef(null);
    const socketRef         = useRef(null);
    const selectedConvIdRef = useRef(null);
    const typingTimeoutRef  = useRef(null);

    // Keep ref in sync for socket callbacks (avoids stale closure)
    useEffect(() => { selectedConvIdRef.current = selectedConvId; }, [selectedConvId]);

    // ─────────────────────────────────────────────────────────────────────────
    // Data fetching
    // ─────────────────────────────────────────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        if (!businessId) return;
        try {
            const res = await axios.get(`${config.API_BASE_URL}/conversations`, { withCredentials: true });
            if (res.data.success) setConversations(res.data.data || []);
        } catch (err) {
            console.error('Failed to load conversations', err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    const fetchMessages = useCallback(async (convId) => {
        setMessagesLoading(true);
        try {
            const res = await axios.get(
                `${config.API_BASE_URL}/conversations/${convId}/messages`,
                { withCredentials: true }
            );
            if (res.data.success) setMessages(res.data.messages);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setMessagesLoading(false);
            scrollToBottom();
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Socket.io setup
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!businessId) return;

        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], autoConnect: true });
        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            socket.emit('dashboard:join', { businessId });
        });

        socket.on('disconnect', () => setSocketConnected(false));

        // Visitor requested a human agent
        socket.on('visitor:request_human', ({ conversationId }) => {
            setConversations(prev =>
                prev.map(c => c._id === conversationId ? { ...c, status: 'needs_human' } : c)
            );
            if (selectedConvIdRef.current !== conversationId) {
                setUnreadMap(prev => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
            }
        });

        // Visitor sent a message — shown in real-time regardless of AI or human mode
        socket.on('visitor:message', ({ message }) => {
            if (!message) return;
            const cid = message.conversationId || selectedConvIdRef.current;
            if (selectedConvIdRef.current === cid) {
                setMessages(prev => {
                    // Avoid duplicates (may already be present from optimistic update)
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();
            } else if (cid) {
                setUnreadMap(prev => ({ ...prev, [cid]: (prev[cid] || 0) + 1 }));
            }
            // Refresh list so last_message preview updates
            fetchConversations();
        });

        // AI responded — push assistant message to open thread in real-time
        socket.on('assistant:message', ({ conversationId, message }) => {
            if (!message) return;
            if (selectedConvIdRef.current === conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();
            } else {
                setUnreadMap(prev => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
            }
            fetchConversations();
        });

        // Takeover / resolve status changed
        socket.on('conversation:update', ({ conversationId, status, human_takeover }) => {
            setConversations(prev =>
                prev.map(c => c._id === conversationId ? { ...c, status, human_takeover } : c)
            );
        });

        // New activity on a conversation (refresh list + bump unread)
        socket.on('conversation:activity', ({ conversationId }) => {
            fetchConversations();
            if (selectedConvIdRef.current !== conversationId) {
                setUnreadMap(prev => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [businessId, fetchConversations]);

    // Join/leave per-conversation room when selection changes
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        if (selectedConvId) {
            socket.emit('dashboard:join_conv', { conversationId: selectedConvId });
            setUnreadMap(prev => { const next = { ...prev }; delete next[selectedConvId]; return next; });
        }
        return () => {
            if (selectedConvId && socket.connected) {
                socket.emit('dashboard:leave_conv', { conversationId: selectedConvId });
            }
        };
    }, [selectedConvId]);

    // Initial fetch + 30 s polling fallback
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Auto-scroll when new messages arrive
    useEffect(() => { if (messages.length > 0) scrollToBottom(); }, [messages]);

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleSelectConv = (id) => {
        setSelectedConvId(id);
        fetchMessages(id);
        setShowThread(true);
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    };

    /** Show the "scroll to bottom" button when user has scrolled up */
    const handleMessagesScroll = () => {
        const el = messagesAreaRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(distanceFromBottom > 120);
    };

    const handleToggleTakeover = async () => {
        if (!selectedConvId) return;
        try {
            const res = await axios.put(
                `${config.API_BASE_URL}/conversations/${selectedConvId}/takeover`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setConversations(prev =>
                    prev.map(c => c._id === selectedConvId ? res.data.conversation : c)
                );
                if (res.data.conversation.human_takeover) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            }
        } catch (err) {
            console.error('Failed to toggle takeover', err);
        }
    };

    const handleResolve = async () => {
        if (!selectedConvId) return;
        try {
            const res = await axios.put(
                `${config.API_BASE_URL}/conversations/${selectedConvId}/status`,
                { status: 'resolved' },
                { withCredentials: true }
            );
            if (res.data.success) {
                setConversations(prev =>
                    prev.map(c => c._id === selectedConvId ? res.data.conversation : c)
                );
            }
        } catch (err) {
            console.error('Failed to resolve', err);
        }
    };

    /** Auto-grow textarea + emit typing indicator */
    const handleReplyChange = (e) => {
        const val = e.target.value;
        setReplyText(val);

        // Auto-grow
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

        // Typing indicator
        const socket = socketRef.current;
        if (socket && selectedConvId) {
            if (!isTyping) {
                setIsTyping(true);
                socket.emit('agent:typing', { conversationId: selectedConvId, isTyping: true });
            }
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('agent:typing', { conversationId: selectedConvId, isTyping: false });
            }, 1500);
        }
    };

    const handleSendReply = async (e) => {
        e?.preventDefault();
        if (!replyText.trim() || sending || !selectedConvId) return;

        // Stop typing indicator
        setIsTyping(false);
        clearTimeout(typingTimeoutRef.current);
        const socket = socketRef.current;
        if (socket) socket.emit('agent:typing', { conversationId: selectedConvId, isTyping: false });

        setSending(true);

        // Optimistic message
        const optimisticMsg = {
            _id: `opt_${Date.now()}`,
            role: 'agent',
            content: replyText,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        const textSnapshot = replyText;
        setReplyText('');

        // Reset textarea height
        if (inputRef.current) { inputRef.current.style.height = 'auto'; }
        scrollToBottom();

        try {
            const res = await axios.post(
                `${config.API_BASE_URL}/conversations/${selectedConvId}/reply`,
                { content: textSnapshot },
                { withCredentials: true }
            );
            if (res.data.success) {
                setMessages(prev =>
                    prev.map(m => m._id === optimisticMsg._id ? res.data.message : m)
                );
            }
        } catch (err) {
            console.error('Failed to send reply', err);
            setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
            setReplyText(textSnapshot);
        } finally {
            setSending(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Derived data
    // ─────────────────────────────────────────────────────────────────────────

    const activeConv  = conversations.find(c => c._id === selectedConvId);
    const botName     = bot?.bot_name || 'BeeBot';
    const totalUnread = Object.values(unreadMap).reduce((s, v) => s + v, 0);

    const filteredConversations = conversations.filter(c => {
        // Tab filter
        if (activeTab === 'live')         { if (c.status === 'resolved') return false; }
        else if (activeTab === 'needs_human')  { if (c.status !== 'needs_human' || c.human_takeover) return false; }
        else if (activeTab === 'human_active') { if (!c.human_takeover) return false; }
        else if (activeTab === 'active')       { if (c.status !== 'active' || c.human_takeover) return false; }
        else if (activeTab === 'resolved')     { if (c.status !== 'resolved') return false; }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.visitor_id?.toLowerCase().includes(q) ||
            c.visitor_context?.email?.toLowerCase().includes(q) ||
            c.last_message?.toLowerCase().includes(q)
        );
    });

    const tabCounts = {
        live:         conversations.filter(c => c.status !== 'resolved').length,
        needs_human:  conversations.filter(c => c.status === 'needs_human' && !c.human_takeover).length,
        human_active: conversations.filter(c => c.human_takeover).length,
        active:       conversations.filter(c => c.status === 'active' && !c.human_takeover).length,
        resolved:     conversations.filter(c => c.status === 'resolved').length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Derived conversation state helpers
    // ─────────────────────────────────────────────────────────────────────────

    const isResolved  = activeConv?.status === 'resolved';
    const isTakenOver = activeConv?.human_takeover;
    const needsHuman  = activeConv?.status === 'needs_human' && !isTakenOver;

    /** Placeholder text for the reply input */
    const inputPlaceholder = isResolved
        ? 'Conversation resolved'
        : !isTakenOver
            ? 'Take over the conversation to reply…'
            : 'Type your message… (Enter to send, Shift+Enter for new line)';

    // ─────────────────────────────────────────────────────────────────────────
    // Loading skeleton
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={styles.grid}>
                <style>{CSS}</style>
                <div style={{ ...styles.leftPane, display: 'flex' }}>
                    <div style={styles.leftHeader}>
                        <div className="ct-skeleton" style={{ height: 18, width: 80, borderRadius: 6 }} />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                </div>
                <div style={{ ...styles.rightPane, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
                    <div className="ct-skeleton" style={{ width: 56, height: 56, borderRadius: 12 }} />
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            <style>{CSS}</style>

            <div style={styles.grid} className="ct-grid">

                {/* ════════════════════════════════════════════════════════════
                    LEFT PANEL — Conversation list
                ════════════════════════════════════════════════════════════ */}
                <div
                    className="ct-left-pane"
                    style={{
                        ...styles.leftPane,
                        /* On mobile hide the list when a thread is open */
                        display: showThread ? 'none' : 'flex',
                    }}
                >
                    {/* ── Left panel header ─────────────────────────────── */}
                    <div style={styles.leftHeader}>
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)', margin: 0 }}>
                                    Inbox
                                </h3>
                                {/* Total unread badge */}
                                {totalUnread > 0 && (
                                    <span style={styles.unreadBadge}>{totalUnread}</span>
                                )}
                            </div>

                            {/* Live connection indicator */}
                            <span
                                title={socketConnected ? 'Live updates active' : 'Connecting…'}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                {socketConnected
                                    ? <Wifi size={14} color="var(--color-success)" />
                                    : <WifiOff size={14} color="var(--color-text-faint)" />
                                }
                            </span>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <Search
                                size={14}
                                color="var(--color-text-faint)"
                                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search conversations…"
                                style={styles.searchInput}
                                onFocus={e  => (e.target.style.borderColor = 'var(--color-primary)')}
                                onBlur={e   => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

                        {/* Tab filter bar */}
                        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }} className="ct-hide-scrollbar">
                            {TABS.map(tab => {
                                const count    = tabCounts[tab.key];
                                const isActive = activeTab === tab.key;
                                const alert    = tab.key === 'needs_human' && count > 0;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        style={{
                                            flexShrink: 0, padding: '4px 10px', borderRadius: 6,
                                            fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                            background: isActive ? 'var(--color-primary)' : 'transparent',
                                            color: isActive ? '#fff' : alert ? '#92400E' : 'var(--color-text-muted)',
                                            display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                                        }}
                                    >
                                        {tab.label}
                                        {count > 0 && (
                                            <span style={{
                                                background: isActive ? 'rgba(255,255,255,0.25)' : alert ? '#F59E0B' : 'var(--color-surface-3)',
                                                color:      isActive ? '#fff'                   : alert ? '#fff'   : 'var(--color-text-muted)',
                                                padding: '0 5px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, lineHeight: '16px',
                                            }}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Conversation list ──────────────────────────────── */}
                    <div style={{ flex: 1, overflowY: 'auto' }} className="ct-hide-scrollbar">
                        {filteredConversations.length === 0 ? (
                            /* Empty state */
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                <Headset size={34} color="var(--color-text-faint)" style={{ margin: '0 auto 12px', display: 'block' }} />
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                                    {searchQuery ? 'No results found' : 'No conversations here'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const isSelected  = conv._id === selectedConvId;
                                const unread      = unreadMap[conv._id] || 0;
                                const cfg         = getStatusCfg(conv);
                                const awaitHuman  = conv.status === 'needs_human' && !conv.human_takeover;

                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => handleSelectConv(conv._id)}
                                        style={{
                                            width: '100%', textAlign: 'left', cursor: 'pointer',
                                            padding: '13px 15px',
                                            borderBottom: '1px solid var(--color-border)',
                                            borderLeft: isSelected
                                                ? '3px solid var(--color-primary)'
                                                : awaitHuman ? '3px solid #F59E0B' : '3px solid transparent',
                                            background: isSelected ? 'var(--color-surface)' : awaitHuman ? '#FFFBEB' : 'var(--color-white)',
                                            border: 'none',
                                            borderLeftWidth: 3,
                                            borderLeftStyle: 'solid',
                                            borderLeftColor: isSelected ? 'var(--color-primary)' : awaitHuman ? '#F59E0B' : 'transparent',
                                            transition: 'background 0.15s',
                                            display: 'block',
                                        }}
                                        className="ct-conv-item"
                                    >
                                        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                                            {/* Avatar */}
                                            <div style={{
                                                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                                background: cfg.bg,
                                                border: `1.5px solid ${cfg.dot}33`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {conv.human_takeover
                                                    ? <Headset    size={15} color={cfg.color} />
                                                    : awaitHuman
                                                        ? <AlertCircle size={15} color="#F59E0B" />
                                                        : <User       size={15} color="var(--color-text-muted)" />
                                                }
                                            </div>

                                            {/* Text */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                    <span style={{
                                                        fontWeight: unread > 0 ? 700 : 600,
                                                        fontSize: '0.875rem', color: 'var(--color-text)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {conv.visitor_context?.name
                                                            || conv.visitor_context?.email
                                                            || `Visitor #${conv.visitor_id.substring(0, 6)}`}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', flexShrink: 0, marginLeft: 6 }}>
                                                        {formatTime(conv.last_message_time || conv.started_at)}
                                                    </span>
                                                </div>

                                                <p style={{
                                                    fontSize: '0.78rem', color: 'var(--color-text-muted)',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    marginBottom: 6, margin: '0 0 6px',
                                                }}>
                                                    {conv.last_message || 'No messages yet'}
                                                </p>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <StatusBadge conv={conv} />
                                                    {/* Per-conversation unread count */}
                                                    {unread > 0 && (
                                                        <span style={styles.unreadBadge}>{unread}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                    RIGHT PANEL — Active thread
                ════════════════════════════════════════════════════════════ */}
                <div
                    className="ct-right-pane"
                    style={{
                        ...styles.rightPane,
                        /* On mobile show only when a thread is open */
                        display: (!showThread) ? 'none' : 'flex',
                    }}
                >
                    {/* ── Empty / no selection state ───────────────────────── */}
                    {!selectedConvId || !activeConv ? (
                        <div style={styles.emptyThread}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 16,
                                background: 'var(--color-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16,
                            }}>
                                <MessageSquare size={28} color="#000" />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)', margin: '0 0 6px' }}>
                                Select a conversation
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 280, textAlign: 'center', margin: 0 }}>
                                Click any conversation on the left to view the full transcript and assist the visitor.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ── Thread header ────────────────────────────── */}
                            <div style={styles.threadHeader}>
                                {/* Back arrow — visible on mobile */}
                                <button
                                    onClick={() => setShowThread(false)}
                                    style={styles.backBtn}
                                    className="ct-back-btn"
                                    aria-label="Back to conversations"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {/* Visitor avatar */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                    background: getStatusCfg(activeConv).bg,
                                    border: `2px solid ${getStatusCfg(activeConv).dot}33`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {isTakenOver
                                        ? <Headset size={17} color={getStatusCfg(activeConv).color} />
                                        : <User    size={17} color="var(--color-text-muted)" />
                                    }
                                </div>

                                {/* Visitor info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activeConv.visitor_context?.name
                                            || activeConv.visitor_context?.email
                                            || `Visitor #${activeConv.visitor_id.substring(0, 8)}`}
                                    </div>
                                    <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <StatusBadge conv={activeConv} />
                                        {activeConv.visitor_context?.current_url && (
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, opacity: 0.65 }}>
                                                • {activeConv.visitor_context.current_url}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons — top-right of header */}
                                <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
                                    {/* Resolve — shown when not yet resolved */}
                                    {!isResolved && (
                                        <button
                                            onClick={handleResolve}
                                            style={styles.resolveBtn}
                                            className="ct-btn-hover"
                                        >
                                            <CheckCircle size={13} />
                                            <span>Resolve</span>
                                        </button>
                                    )}

                                    {/* Resolved badge (replaces buttons after resolving) */}
                                    {isResolved && (
                                        <span style={styles.resolvedBadge}>
                                            <CheckCircle size={12} /> Resolved
                                        </span>
                                    )}

                                    {/* Take Over / Resume AI — shown when not resolved */}
                                    {!isResolved && (
                                        <button
                                            onClick={handleToggleTakeover}
                                            style={isTakenOver ? styles.resumeAiBtn : styles.takeOverBtn}
                                            className="ct-btn-hover"
                                        >
                                            {isTakenOver
                                                ? <><ShieldOff  size={13} /><span>Resume AI</span></>
                                                : <><ShieldCheck size={13} /><span>Take Over</span></>
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Status banners ───────────────────────────── */}
                            {isTakenOver && (
                                <div style={styles.bannerBlack}>
                                    <Headset size={14} />
                                    You are now in control — {botName} is paused. Replies go directly to the visitor.
                                </div>
                            )}
                            {needsHuman && (
                                <div style={styles.bannerAmber}>
                                    <AlertCircle size={14} />
                                    Visitor requested a human agent. Click "Take Over" to begin live chat.
                                </div>
                            )}

                            {/* ── Message thread (scrollable) ──────────────── */}
                            <div
                                ref={messagesAreaRef}
                                onScroll={handleMessagesScroll}
                                style={styles.messageArea}
                                className="ct-hide-scrollbar"
                            >
                                {messagesLoading ? (
                                    /* Messages loading skeleton */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', gap: 10 }}>
                                                {i % 2 === 0 && <div className="ct-skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />}
                                                <div className="ct-skeleton" style={{ height: 42, width: `${40 + (i * 7) % 30}%`, borderRadius: 14 }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
                                        No messages in this conversation yet.
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isUser  = msg.role === 'user';
                                        const isAgent = msg.role === 'agent';

                                        const prevMsg        = idx > 0 ? messages[idx - 1] : null;
                                        const nextMsg        = idx < messages.length - 1 ? messages[idx + 1] : null;
                                        const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
                                        const isLastInGroup  = !nextMsg || nextMsg.role !== msg.role;

                                        return (
                                            <div
                                                key={msg._id || idx}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: isUser ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-end', gap: 8,
                                                    marginBottom: isLastInGroup ? 12 : 3,
                                                }}
                                            >
                                                {/* Avatar — only on last bubble of a group */}
                                                <div style={{ width: 28, flexShrink: 0 }}>
                                                    {isLastInGroup && (
                                                        <div style={{
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            background: isUser ? 'var(--color-surface-3)' : isAgent ? '#000' : 'var(--color-primary)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            border: '1.5px solid var(--color-border)',
                                                        }}>
                                                            {isUser  ? <User    size={13} color="var(--color-text-muted)" />
                                                            : isAgent ? <Headset size={13} color="#FFDE21" />
                                                                      : <Bot    size={13} color="#fff" />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bubble column */}
                                                <div style={{
                                                    maxWidth: '68%', display: 'flex', flexDirection: 'column',
                                                    alignItems: isUser ? 'flex-end' : 'flex-start',
                                                }}>
                                                    {/* Sender label — first bubble in group only */}
                                                    {isFirstInGroup && (
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-faint)', marginBottom: 3, fontWeight: 600 }}>
                                                            {isUser ? 'Visitor' : isAgent ? 'You (Agent)' : botName}
                                                        </span>
                                                    )}

                                                    {/* Message bubble */}
                                                    {msg.content?.startsWith('__img__:') ? (
                                                        /* Image message */
                                                        <div style={{
                                                            borderRadius: isUser
                                                                ? (isFirstInGroup ? '16px 4px 16px 16px' : '16px 4px 4px 16px')
                                                                : (isFirstInGroup ? '4px 16px 16px 16px' : '4px 16px 16px 4px'),
                                                            overflow: 'hidden', boxShadow: 'var(--shadow-xs)',
                                                            border: isUser ? 'none' : '1px solid var(--color-border)',
                                                            maxWidth: 220,
                                                        }}>
                                                            <img
                                                                src={msg.content.slice(8)}
                                                                alt="Image"
                                                                style={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'cover' }}
                                                                onError={e => { e.target.alt = 'Image unavailable'; }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            padding: '9px 13px', lineHeight: '1.55', fontSize: '0.875rem',
                                                            borderRadius: isUser
                                                                ? (isFirstInGroup ? '16px 4px 16px 16px' : '16px 4px 4px 16px')
                                                                : (isFirstInGroup ? '4px 16px 16px 16px' : '4px 16px 16px 4px'),
                                                            background: isUser  ? 'var(--color-primary)'
                                                                      : isAgent ? '#FFFDE7'
                                                                                : 'var(--color-white)',
                                                            color: isUser ? '#fff' : 'var(--color-text)',
                                                            border: isUser ? 'none'
                                                                  : isAgent ? '1px solid #FDE68A'
                                                                            : '1px solid var(--color-border)',
                                                            boxShadow: 'var(--shadow-xs)',
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {msg.content}
                                                        </div>
                                                    )}

                                                    {/* Timestamp — last bubble in group only */}
                                                    {isLastInGroup && (
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)', marginTop: 3 }}>
                                                            {formatMessageTime(msg.timestamp)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Visitor typing indicator */}
                                {agentTyping && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'var(--color-surface-3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <User size={13} color="var(--color-text-muted)" />
                                        </div>
                                        <div style={{
                                            background: 'var(--color-white)', border: '1px solid var(--color-border)',
                                            borderRadius: '4px 16px 16px 16px', padding: '8px 14px',
                                            display: 'flex', gap: 4, alignItems: 'center',
                                        }}>
                                            {[0, 1, 2].map(i => (
                                                <span key={i} style={{
                                                    width: 5, height: 5, borderRadius: '50%',
                                                    background: 'var(--color-text-faint)', display: 'inline-block',
                                                    animation: `ctBounce 1s ${i * 0.2}s infinite`,
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* "Scroll to bottom" floating button */}
                            {showScrollBtn && (
                                <button
                                    onClick={() => { scrollToBottom(); setShowScrollBtn(false); }}
                                    style={styles.scrollToBottomBtn}
                                    aria-label="Scroll to latest message"
                                >
                                    <ArrowDown size={15} />
                                    New messages
                                </button>
                            )}

                            {/* ── Input area (pinned to bottom) ────────────── */}
                            <div style={styles.inputArea}>
                                {/* CASE 1: Agent has taken over — show active textarea */}
                                {isTakenOver && !isResolved && (
                                    <form onSubmit={handleSendReply}>
                                        <div
                                            style={styles.inputBox}
                                            onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                                            onBlurCapture={e  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                                        >
                                            <textarea
                                                ref={inputRef}
                                                value={replyText}
                                                onChange={handleReplyChange}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendReply(e);
                                                    }
                                                }}
                                                placeholder="Type your message…"
                                                disabled={sending}
                                                rows={1}
                                                style={styles.textarea}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !replyText.trim()}
                                                style={{
                                                    ...styles.sendBtn,
                                                    background: replyText.trim() ? 'var(--color-primary)' : 'var(--color-surface-3)',
                                                    color:      replyText.trim() ? '#fff'                 : 'var(--color-text-faint)',
                                                    cursor:     (sending || !replyText.trim()) ? 'not-allowed' : 'pointer',
                                                }}
                                                aria-label="Send message"
                                            >
                                                <Send size={15} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.68rem', color: 'var(--color-text-faint)', marginTop: 5, textAlign: 'center' }}>
                                            Replying as agent — {botName} is paused &nbsp;·&nbsp; Enter to send, Shift+Enter for new line
                                        </p>
                                    </form>
                                )}

                                {/* CASE 2: AI is still in control — locked bar with Take Over CTA */}
                                {!isTakenOver && !isResolved && (
                                    <div style={styles.lockedBar}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <Circle size={8} fill="var(--color-success)" color="var(--color-success)" style={{ opacity: 0.85 }} />
                                            <span style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                {botName} is handling this conversation
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleToggleTakeover}
                                            style={styles.takeOverCta}
                                        >
                                            <Headset size={12} /> Take Over
                                        </button>
                                    </div>
                                )}

                                {/* CASE 3: Resolved — locked bar */}
                                {isResolved && (
                                    <div style={{ ...styles.lockedBar, justifyContent: 'center' }}>
                                        <CheckCircle size={14} color="var(--color-success)" />
                                        <span style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                            Conversation resolved
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════════════
                    DESKTOP — show right pane even when no thread is open
                    (handled via CSS class; the mobile toggle logic above hides
                    the right pane on small screens only)
                ════════════════════════════════════════════════════════════ */}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline style objects  (no Tailwind dependency — matches existing codebase)
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
    /** Outer two-column grid */
    grid: {
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        flex: 1,
        minHeight: 0,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        background: 'var(--color-white)',
        height: '100%',
    },

    /** Left conversation-list panel */
    leftPane: {
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-white)',
        minHeight: 0,
        overflow: 'hidden',
    },

    /** Sticky header inside left panel */
    leftHeader: {
        padding: '16px 16px 10px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
    },

    /** Right thread panel */
    rightPane: {
        flexDirection: 'column',
        background: '#FAFAFA',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
    },

    /** Centered placeholder when no conversation is selected */
    emptyThread: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },

    /** Thread header bar */
    threadHeader: {
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-white)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },

    /** Back arrow button (always rendered; visible only on mobile via CSS) */
    backBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-muted)',
        padding: 4,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },

    /** Resolve action button in header */
    resolveBtn: {
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        border: '1px solid rgba(21,128,61,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
    },

    /** Green "Resolved" badge shown after resolving */
    resolvedBadge: {
        padding: '5px 11px',
        borderRadius: 8,
        fontSize: '0.78rem',
        fontWeight: 700,
        background: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        whiteSpace: 'nowrap',
    },

    /** Take Over button in header */
    takeOverBtn: {
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
    },

    /** Resume AI button in header (after takeover) */
    resumeAiBtn: {
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: '#000',
        color: '#FFDE21',
        border: '1px solid #000',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
    },

    /** Takeover active banner (black strip) */
    bannerBlack: {
        padding: '8px 18px',
        background: '#000',
        color: '#FFDE21',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },

    /** Needs-human banner (amber strip) */
    bannerAmber: {
        padding: '8px 18px',
        background: '#FFFBEB',
        color: '#92400E',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid #FDE68A',
        flexShrink: 0,
    },

    /** Scrollable message thread area */
    messageArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },

    /** "Scroll to bottom" floating pill button */
    scrollToBottomBtn: {
        position: 'absolute',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 100,
        padding: '6px 14px',
        fontSize: '0.78rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        whiteSpace: 'nowrap',
    },

    /** Bottom input container */
    inputArea: {
        padding: '12px 14px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-white)',
        flexShrink: 0,
    },

    /** Active textarea wrapper (rounded pill) */
    inputBox: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 12,
        padding: '8px 8px 8px 14px',
        transition: 'border-color 0.2s',
    },

    /** Raw textarea inside input box */
    textarea: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--color-text)',
        fontSize: '0.875rem',
        resize: 'none',
        fontFamily: 'var(--font-body)',
        lineHeight: '1.5',
        maxHeight: 120,
        overflowY: 'auto',
        minHeight: 22,
    },

    /** Send button */
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
    },

    /** Locked bar shown when AI is in control */
    lockedBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 13px',
        background: 'var(--color-surface)',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        gap: 8,
    },

    /** "Take Over" CTA inside locked bar */
    takeOverCta: {
        padding: '5px 11px',
        borderRadius: 6,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },

    /** Unread count badge (red pill) */
    unreadBadge: {
        background: '#EF4444',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 100,
        lineHeight: '16px',
    },

    /** Search input */
    searchInput: {
        width: '100%',
        padding: '8px 8px 8px 32px',
        borderRadius: 8,
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        outline: 'none',
        fontSize: '0.85rem',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Global CSS injected via <style> tag
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
/* ── Pulse animation for "Awaiting" status dots ── */
@keyframes ctPulse {
    0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.7); }
    70%  { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
    100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
}

/* ── Typing indicator bounce ── */
@keyframes ctBounce {
    0%, 80%, 100% { transform: translateY(0); }
    40%            { transform: translateY(-5px); }
}

/* ── Skeleton shimmer ── */
@keyframes ctShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
}
.ct-skeleton {
    background: linear-gradient(90deg, var(--color-surface-3) 25%, var(--color-surface-2) 50%, var(--color-surface-3) 75%);
    background-size: 800px 100%;
    animation: ctShimmer 1.4s infinite;
}

/* ── Hide native scrollbar but keep scroll behaviour ── */
.ct-hide-scrollbar { scrollbar-width: none; }
.ct-hide-scrollbar::-webkit-scrollbar { display: none; }

/* ── Conversation list item hover ── */
.ct-conv-item:hover { background: var(--color-surface) !important; }
.ct-conv-item:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

/* ── Button micro-interactions ── */
.ct-btn-hover:hover { filter: brightness(0.92); transform: translateY(-1px); }
.ct-btn-hover:active { transform: translateY(0); }

/* ════════════════════════════════════════════════════════════
   RESPONSIVE LAYOUT
════════════════════════════════════════════════════════════ */

/* ── Desktop (>= 769 px): side-by-side, back button hidden ── */
@media (min-width: 769px) {
    .ct-grid {
        grid-template-columns: 320px 1fr !important;
    }
    /* Always show both panels */
    .ct-left-pane  { display: flex !important; }
    .ct-right-pane { display: flex !important; }
    /* Hide mobile back arrow on desktop */
    .ct-back-btn { display: none !important; }
}

/* ── Tablet (600-768 px): compressed side-by-side ── */
@media (min-width: 600px) and (max-width: 768px) {
    .ct-grid {
        grid-template-columns: 260px 1fr !important;
    }
    .ct-left-pane  { display: flex !important; }
    .ct-right-pane { display: flex !important; }
    .ct-back-btn   { display: none !important; }
}

/* ── Mobile (< 600 px): full-screen toggle ── */
@media (max-width: 599px) {
    .ct-grid {
        grid-template-columns: 1fr !important;
    }
    /* Left panel is the default; right panel slides in */
    .ct-left-pane  { display: flex; }
    .ct-right-pane { display: flex; }
    /* Back arrow visible on mobile */
    .ct-back-btn   { display: flex !important; }
}
`;