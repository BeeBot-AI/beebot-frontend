import React, { useState, useCallback } from 'react';
import { X, UploadCloud, File, AlertCircle, CheckCircle2, FileText, FileType } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx'];
const MAX_MB = 10;

function getFileIcon(name = '') {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf') return <FileType size={48} color="#ef4444" />;
    if (ext === '.docx') return <FileText size={48} color="#3b82f6" />;
    return <File size={48} color="var(--primary)" />;
}

function validateFile(file) {
    if (!file) return 'No file selected.';
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return `Unsupported file type "${ext}". Please upload PDF, TXT, or DOCX.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_MB} MB.`;
    }
    return null;
}

export default function UploadModal({ onClose }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [serverError, setServerError] = useState('');
    const [chunksAdded, setChunksAdded] = useState(0);

    const selectFile = useCallback((f) => {
        const err = validateFile(f);
        if (err) {
            setValidationError(err);
            setFile(null);
        } else {
            setValidationError('');
            setFile(f);
        }
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) selectFile(e.dataTransfer.files[0]);
    };

    const handleChange = (e) => {
        if (e.target.files?.[0]) selectFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        setServerError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(
                `${config.API_BASE_URL}/knowledge/upload`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            if (res.data.success) {
                setChunksAdded(res.data.entry?.chunks_added || 0);
                setStatus('success');
                // Close after 2 s so parent can reload the list
                setTimeout(() => onClose(), 2000);
            } else {
                throw new Error(res.data.message || 'Upload failed');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                err.message ||
                'Upload failed. Please try again.';
            setServerError(msg);
            setStatus('error');
        }
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Upload Document</h2>
                    <button className="modal-close" onClick={onClose}><X size={24} /></button>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Supported: <strong>PDF</strong>, <strong>TXT</strong>, <strong>DOCX</strong> — max {MAX_MB} MB.
                    BeeBot will parse and index the content automatically.
                </p>

                {/* ---- IDLE / ERROR state ---- */}
                {(status === 'idle' || status === 'error') && (
                    <>
                        <div
                            className="drag-drop-area"
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                borderColor: dragActive ? 'var(--primary)' : validationError ? '#ef4444' : 'var(--panel-border)',
                                background: dragActive ? 'rgba(255,215,0,0.05)' : undefined,
                                transition: 'all 0.2s',
                            }}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: 'none' }}
                                onChange={handleChange}
                                accept={ALLOWED_EXTENSIONS.join(',')}
                            />
                            {!file ? (
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                                    <UploadCloud size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
                                    <p style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Drag & drop a file here</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or click to browse</p>
                                </label>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                                    {getFileIcon(file.name)}
                                    <p style={{ fontWeight: 600, margin: 0 }}>{file.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        className="btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                                        onClick={() => { setFile(null); setValidationError(''); setServerError(''); setStatus('idle'); }}
                                    >
                                        Change file
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Validation error */}
                        {validationError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', color: '#ef4444', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} /> {validationError}
                            </div>
                        )}

                        {/* Server / network error */}
                        {status === 'error' && serverError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} /> {serverError}
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem', fontSize: '1rem', padding: '13px' }}
                            disabled={!file || !!validationError}
                            onClick={handleUpload}
                        >
                            Start Processing
                        </button>
                    </>
                )}

                {/* ---- UPLOADING state ---- */}
                {status === 'uploading' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div className="kb-spinner" />
                        <p style={{ marginTop: '1.25rem', fontWeight: 500 }}>Uploading & parsing {file?.name}…</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Extracting text and scheduling vector embedding
                        </p>
                    </div>
                )}

                {/* ---- SUCCESS state ---- */}
                {status === 'success' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle2 size={64} style={{ color: '#4ade80', marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Document queued for indexing!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            BeeBot is embedding your document in the background.
                            The status will update automatically in the Knowledge Base.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .kb-spinner {
                    width: 44px; height: 44px; margin: 0 auto;
                    border: 4px solid rgba(255,255,255,0.08);
                    border-left-color: var(--primary);
                    border-radius: 50%;
                    animation: kb-spin 0.9s linear infinite;
                }
                @keyframes kb-spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
