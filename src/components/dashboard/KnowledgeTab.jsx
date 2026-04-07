import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Database, Trash2, Plus, CheckCircle, Clock, XCircle, Globe, FileText, HelpCircle, FileType2, RefreshCw, Eye, X } from 'lucide-react';
import axios from 'axios';
import config from '../../config';
import UploadModal from '../UploadModal';

// ─── Responsive hook ───────────────────────────────────────────────────────
function useWindowWidth() {
    const [width, setWidth] = useState(() => window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
}

export default function KnowledgeTab({ businessId }) {
    const [knowledgeSources, setKnowledgeSources] = useState([]);
    const [knowledgeInput, setKnowledgeInput] = useState({ type: 'text', title: '', content: '' });
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [knowledgeError, setKnowledgeError] = useState('');
    const [knowledgeSuccess, setKnowledgeSuccess] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [viewingSource, setViewingSource] = useState(null);

    const pollIntervalRef = useRef(null);
    const windowWidth = useWindowWidth();
    const isDesktop = windowWidth > 1024;
    const isMobile = windowWidth < 640;

    const fetchKnowledge = useCallback(async () => {
        try {
            const res = await axios.get(`${config.API_BASE_URL}/knowledge`, { withCredentials: true });
            if (res.data && res.data.success) {
                const fetchedData = res.data.sources;
                if (Array.isArray(fetchedData)) {
                    setKnowledgeSources(fetchedData);
                } else {
                    setKnowledgeSources([]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch knowledge sources", err);
            setKnowledgeSources([]);
        } finally {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKnowledge();
    }, [fetchKnowledge]);

    const startPollingIfNeeded = useCallback((sources) => {
        const hasProcessing = sources.some(s => s.embedding_status === 'processing');
        if (hasProcessing && !pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(async () => {
                setKnowledgeSources(prev => {
                    const stillProcessing = prev.filter(s => s.embedding_status === 'processing');
                    if (stillProcessing.length === 0) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                        return prev;
                    }
                    stillProcessing.forEach(async (s) => {
                        try {
                            const r = await axios.get(`${config.API_BASE_URL}/knowledge/${s._id}/status`, { withCredentials: true });
                            if (r.data.success && r.data.embedding_status !== 'processing') {
                                setKnowledgeSources(cur => cur.map(item => item._id === s._id ? { ...item, embedding_status: r.data.embedding_status, chunks_added: r.data.chunks_added } : item));
                            }
                        } catch (_) { }
                    });
                    return prev;
                });
            }, 5000);
        } else if (!hasProcessing && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
    }, []);

    useEffect(() => {
        startPollingIfNeeded(knowledgeSources);
    }, [knowledgeSources, startPollingIfNeeded]);

    const handleAddKnowledge = async (e) => {
        e.preventDefault();
        setKnowledgeLoading(true); setKnowledgeError(''); setKnowledgeSuccess('');
        try {
            const payload = { content: knowledgeInput.content, title: knowledgeInput.title, source_type: knowledgeInput.type };
            const res = await axios.post(`${config.API_BASE_URL}/knowledge/text`, payload, { withCredentials: true });
            if (res.data.success) {
                setKnowledgeSources(prev => [res.data.entry, ...prev]);
                setKnowledgeInput({ type: knowledgeInput.type, title: '', content: '' });
                setKnowledgeSuccess('Added! BeeBot is indexing your content in the background.');
                setTimeout(() => setKnowledgeSuccess(''), 4000);
            }
        } catch (err) {
            setKnowledgeError(err.response?.data?.message || 'Failed to add knowledge. Please try again.');
        } finally {
            setKnowledgeLoading(false);
        }
    };

    const handleDeleteKnowledge = async (id) => {
        setDeletingId(id);
        try {
            await axios.delete(`${config.API_BASE_URL}/knowledge/${id}`, { withCredentials: true });
            setKnowledgeSources(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            setKnowledgeError('Failed to delete. Please try again.');
            setTimeout(() => setKnowledgeError(''), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    if (initialLoading || knowledgeSources === undefined || knowledgeSources === null) {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                gap: isMobile ? '1.5rem' : '3rem',
            }}>
                <div className="animate-pulse" style={{ height: '400px', background: 'var(--color-surface-2)', borderRadius: '12px' }}></div>
                {isDesktop && (
                    <div className="animate-pulse" style={{ height: '400px', background: 'var(--color-surface-2)', borderRadius: '12px' }}></div>
                )}
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
            gap: isMobile ? '1.5rem' : isDesktop ? '3rem' : '2rem',
        }}>

            {/* Left Column: Form */}
            <div>
                <div className="card p-6" style={{ position: isDesktop ? 'sticky' : 'static', top: '2rem' }}>
                    <h3 className="section-title mb-6">Add Knowledge</h3>

                    {knowledgeSuccess && <div className="alert alert-success mb-6">{knowledgeSuccess}</div>}
                    {knowledgeError && <div className="alert alert-error mb-6">{knowledgeError}</div>}

                    {/* Source Type Selector (Pill Tabs) */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--color-surface-2)',
                        borderRadius: '10px',
                        padding: '4px',
                        marginBottom: '2rem',
                    }}>
                        {[
                            { type: 'text', icon: <FileText size={14} />, label: 'Text' },
                            { type: 'document', icon: <Upload size={14} />, label: 'Upload File' },
                        ].map(({ type, icon, label }) => (
                            <button key={type} style={{
                                flex: 1,
                                padding: isMobile ? '10px 4px' : '8px 4px',
                                borderRadius: '6px',
                                border: 'none',
                                background: knowledgeInput.type === type ? 'var(--color-white)' : 'transparent',
                                color: knowledgeInput.type === type ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
                                fontWeight: knowledgeInput.type === type ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: knowledgeInput.type === type ? 'var(--shadow-sm)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: isMobile ? '0.9rem' : '0.85rem',
                                minHeight: '44px', // touch-friendly tap target
                            }} onClick={() => {
                                if (type === 'document') {
                                    setUploadModalOpen(true);
                                } else {
                                    setKnowledgeInput({ ...knowledgeInput, type });
                                }
                            }}>
                                {icon} {label}
                            </button>
                        ))}
                    </div>

                    {knowledgeInput.type !== 'document' && (
                        <form onSubmit={handleAddKnowledge} className="flex-col gap-4">
                            <div>
                                <label className="form-label">Title <span className="text-faint">(optional)</span></label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Shipping Policy"
                                    value={knowledgeInput.title}
                                    onChange={e => setKnowledgeInput({ ...knowledgeInput, title: e.target.value })}
                                    style={{ fontSize: isMobile ? '16px' : undefined }} // prevents zoom on iOS
                                />
                            </div>

                            <div>
                                <label className="form-label">Content</label>
                                <textarea
                                    className="input-field"
                                    style={{
                                        resize: 'vertical',
                                        minHeight: isMobile ? '120px' : '130px',
                                        fontSize: isMobile ? '16px' : undefined, // prevents zoom on iOS
                                    }}
                                    required
                                    placeholder="Paste your product description, FAQ, policy, or any text BeeBot should know..."
                                    value={knowledgeInput.content}
                                    onChange={e => setKnowledgeInput({ ...knowledgeInput, content: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full mt-2"
                                disabled={knowledgeLoading}
                                style={{ minHeight: '44px' }} // touch-friendly
                            >
                                {knowledgeLoading
                                    ? <><RefreshCw size={16} className="animate-spin" /> Adding & Indexing...</>
                                    : <><Plus size={16} /> Add to Knowledge Base</>
                                }
                            </button>
                        </form>
                    )}

                    {knowledgeInput.type === 'document' && (
                        <div
                            className="drag-drop-area"
                            onClick={() => setUploadModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
                            <h4 className="section-title mb-2" style={{ fontSize: '1rem' }}>Click to Upload</h4>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>PDF, DOCX, TXT up to 10MB</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: List */}
            <div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '8px',
                }}>
                    <h3 className="section-title">
                        Knowledge Sources <span className="badge badge-muted ml-2">{knowledgeSources?.length ?? 0}</span>
                    </h3>
                    {knowledgeSources?.some(s => s.embedding_status === 'processing') && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--color-primary-deep)',
                        }}>
                            <RefreshCw size={14} className="animate-spin" /> Indexing...
                        </span>
                    )}
                </div>

                {(knowledgeSources?.length ?? 0) === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-state-icon"><Database size={32} color="var(--color-primary)" /></div>
                        <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>No Knowledge Yet</h4>
                        <p className="text-muted" style={{ maxWidth: '240px', fontSize: '0.9rem' }}>
                            Add text or upload documents using the form {isDesktop ? 'on the left' : 'above'} to start training your bot.
                        </p>
                    </div>
                ) : (
                    <div className="flex-col gap-4">
                        {[...(knowledgeSources || [])]
                            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                            .map(source => (
                                <KnowledgeCard
                                    key={source._id}
                                    source={source}
                                    deleting={deletingId === source._id}
                                    onDelete={handleDeleteKnowledge}
                                    onView={() => setViewingSource(source)}
                                    isMobile={isMobile}
                                />
                            ))}
                    </div>
                )}
            </div>

            {isUploadModalOpen && <UploadModal onClose={() => { setUploadModalOpen(false); fetchKnowledge(); }} />}
            {viewingSource && <ViewKnowledgeModal source={viewingSource} onClose={() => setViewingSource(null)} isMobile={isMobile} />}
        </div>
    );
}

function EmbedStatusBadge({ status }) {
    if (status === 'processing') return <span className="badge" style={{ background: '#E0F2FE', color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> processing</span>;
    if (status === 'done') return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> indexed</span>;
    if (status === 'failed') return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> failed</span>;
    return <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> pending</span>;
}

const SOURCE_TYPE_ICONS = {
    text: <FileText size={18} color="var(--color-text-muted)" />,
    faq: <HelpCircle size={18} color="var(--color-primary-deep)" />,
    url: <Globe size={18} color="var(--color-success)" />,
    document: <FileType2 size={18} color="#0284C7" />,
};

function KnowledgeCard({ source, deleting, onDelete, onView, isMobile }) {
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    const sizeLabel = source.file_size
        ? source.file_size >= 1024 * 1024
            ? `${(source.file_size / 1024 / 1024).toFixed(1)} MB`
            : `${Math.ceil(source.file_size / 1024)} KB`
        : null;

    const statusColor = source.embedding_status === 'done'
        ? 'var(--color-success)'
        : source.embedding_status === 'processing'
            ? '#0284C7'
            : source.embedding_status === 'failed'
                ? 'var(--color-error)'
                : 'var(--color-text-muted)';

    return (
        <div
            className="card"
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '16px',
                alignItems: isMobile ? 'flex-start' : 'center',
                padding: isMobile ? '14px' : '16px',
                position: 'relative',
                overflow: 'hidden',
                borderLeft: `4px solid ${statusColor}`,
                transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            {/* Top row on mobile: icon + actions */}
            <div style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: '12px',
                justifyContent: isMobile ? 'space-between' : undefined,
            }}>
                <div style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--color-surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                }}>
                    {SOURCE_TYPE_ICONS[source.source_type] || SOURCE_TYPE_ICONS.text}
                </div>

                {/* On desktop, title goes here inline; on mobile it's below */}
                {!isMobile && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <KnowledgeCardContent source={source} />
                    </div>
                )}

                {/* Actions — always visible on mobile, right-aligned */}
                <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center', marginLeft: isMobile ? 'auto' : undefined }}>
                    <button
                        className="btn-ghost"
                        style={{
                            padding: '8px',
                            color: 'var(--color-primary-deep)',
                            background: 'rgba(201, 139, 10, 0.1)',
                            borderRadius: '8px',
                            minWidth: '36px',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={() => onView()}
                        title="View source"
                    >
                        <Eye size={18} />
                    </button>

                    {confirmDelete ? (
                        <div style={{
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                            background: 'var(--color-error-bg)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: '1px solid rgba(185, 28, 28, 0.2)',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 600, marginRight: '4px' }}>Delete?</span>
                            <button
                                className="btn-ghost"
                                style={{
                                    padding: '4px 8px',
                                    color: 'var(--color-white)',
                                    background: 'var(--color-error)',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    minHeight: '30px',
                                }}
                                onClick={() => { onDelete(source._id); setConfirmDelete(false); }}
                                disabled={deleting}
                            >
                                {deleting ? '...' : 'Yes'}
                            </button>
                            <button
                                className="btn-ghost"
                                style={{ padding: '4px 8px', color: 'var(--color-text-muted)', fontSize: '0.75rem', minHeight: '30px' }}
                                onClick={() => setConfirmDelete(false)}
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn-ghost"
                            style={{
                                padding: '8px',
                                color: 'var(--color-text-muted)',
                                borderRadius: '8px',
                                minWidth: '36px',
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={() => setConfirmDelete(true)}
                            title="Delete source"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* On mobile, content goes below the icon row */}
            {isMobile && (
                <div style={{ width: '100%' }}>
                    <KnowledgeCardContent source={source} />
                </div>
            )}
        </div>
    );
}

// Extracted to avoid duplication between desktop/mobile layouts
function KnowledgeCardContent({ source }) {
    const sizeLabel = source.file_size
        ? source.file_size >= 1024 * 1024
            ? `${(source.file_size / 1024 / 1024).toFixed(1)} MB`
            : `${Math.ceil(source.file_size / 1024)} KB`
        : null;

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <p style={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--color-text)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                }}>
                    {source.title || (source.url ? source.url : source.content?.substring(0, 50) + '...')}
                </p>
                <EmbedStatusBadge status={source.embedding_status} />
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '6px',
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--color-surface-3)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 500,
                }}>
                    {source.source_type.toUpperCase()}
                </span>
                {source.chunks_added > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>• {source.chunks_added} chunks</span>
                )}
                {sizeLabel && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>• {sizeLabel}</span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
                    • {new Date(source.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </div>
        </>
    );
}

function ViewKnowledgeModal({ source, onClose, isMobile }) {
    if (!source) return null;

    return (
        <div
            className="modal-overlay animate-fade-in"
            onClick={onClose}
            style={{
                // Ensure modal is scrollable on small screens
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: isMobile ? '0' : undefined,
                alignItems: isMobile ? 'flex-end' : 'center',
            }}
        >
            <div
                className="glass-panel modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: isMobile ? '100%' : '650px',
                    width: isMobile ? '100%' : undefined,
                    maxHeight: isMobile ? '92vh' : '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0',
                    // On mobile, sheet slides up from bottom
                    borderRadius: isMobile
                        ? 'var(--radius-xl) var(--radius-xl) 0 0'
                        : undefined,
                    margin: isMobile ? '0' : undefined,
                }}
            >
                {/* Header */}
                <div style={{
                    padding: isMobile ? '1rem 1rem 0.75rem' : '1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'var(--color-surface)',
                    borderTopLeftRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-xl)',
                    borderTopRightRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-xl)',
                }}>
                    {/* Drag handle on mobile */}
                    {isMobile && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '36px',
                            height: '4px',
                            borderRadius: '2px',
                            background: 'var(--color-border)',
                        }} />
                    )}

                    <h2 style={{
                        fontSize: isMobile ? '1.05rem' : '1.25rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        margin: isMobile ? '8px 0 0' : 0,
                        flex: 1,
                        minWidth: 0,
                    }}>
                        <div style={{
                            padding: '8px',
                            background: 'var(--color-white)',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            flexShrink: 0,
                        }}>
                            {SOURCE_TYPE_ICONS[source.source_type] || SOURCE_TYPE_ICONS.text}
                        </div>
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {source.title || 'Knowledge Source Details'}
                        </span>
                    </h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        style={{
                            flexShrink: 0,
                            marginTop: isMobile ? '8px' : 0,
                            minWidth: '36px',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    overflowY: 'auto',
                    flex: 1,
                    padding: isMobile ? '1rem' : '1.5rem',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    <div style={{
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}>
                        <EmbedStatusBadge status={source.embedding_status} />
                        <span className="badge badge-muted" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                            TYPE: {source.source_type.toUpperCase()}
                        </span>
                        {source.url && (
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--color-primary-deep)',
                                    textDecoration: 'underline',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    wordBreak: 'break-all',
                                }}
                            >
                                <Globe size={14} style={{ flexShrink: 0 }} /> {source.url}
                            </a>
                        )}
                    </div>

                    <div style={{
                        background: 'var(--color-surface-2)',
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: '12px',
                        fontSize: isMobile ? '0.85rem' : '0.95rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--color-border-strong)',
                        color: 'var(--color-text)',
                        minHeight: '150px',
                        lineHeight: '1.6',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                    }}>
                        {source.content
                            ? source.content
                            : source.url
                                ? `Content from URL will be automatically scraped and indexed by BeeBot.\n\nSource URL: ${source.url}`
                                : 'Content not available or is currently being processed by the AI pipeline.'
                        }
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        gap: isMobile ? '10px' : '16px',
                        flexWrap: 'wrap',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-surface)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                    }}>
                        <span><strong>Added:</strong> {new Date(source.created_at || Date.now()).toLocaleString()}</span>
                        {source.file_size
                            ? <span><strong>Size:</strong> {(source.file_size / 1024).toFixed(1)} KB</span>
                            : null
                        }
                        {source.chunks_added !== undefined
                            ? <span><strong>Chunks:</strong> {source.chunks_added}</span>
                            : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}