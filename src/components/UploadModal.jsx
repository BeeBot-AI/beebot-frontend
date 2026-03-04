import React, { useState } from 'react';
import { X, UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import config from '../config';

export default function UploadModal({ onClose, clientId }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', clientId);

        try {
            await axios.post(`${config.API_BASE_URL}/documents/upload`, formData);

            // Simulate network request
            await new Promise(r => setTimeout(r, 2000));
            setStatus('success');

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Train BeeBot</h2>
                    <button className="modal-close" onClick={onClose}><X size={24} /></button>
                </div>

                {status === 'idle' || status === 'error' ? (
                    <>
                        <div
                            className="drag-drop-area"
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{ borderColor: dragActive ? 'var(--primary)' : 'var(--panel-border)' }}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                style={{ display: 'none' }}
                                onChange={handleChange}
                                accept=".pdf,.txt,.docx"
                            />

                            {!file ? (
                                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                    <UploadCloud size={48} style={{ margin: '0 auto', color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & drop a file here</p>
                                    <p className="text-muted">or click to browse (PDF, TXT)</p>
                                </label>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <File size={48} color="var(--primary)" />
                                    <p style={{ fontWeight: 500 }}>{file.name}</p>
                                    <p className="text-muted text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button className="btn-secondary mt-4" onClick={() => setFile(null)}>Remove</button>
                                </div>
                            )}
                        </div>

                        {status === 'error' && (
                            <div style={{ color: 'var(--warning)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={18} /> Upload failed. Please try again.
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            disabled={!file}
                            onClick={handleUpload}
                        >
                            Start Processing
                        </button>
                    </>
                ) : status === 'uploading' ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem' }}>Processing document chunks...</p>
                        <p className="text-muted text-sm">Extracting text and generating vectors</p>
                    </div>
                ) : (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <CheckCircle2 size={64} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Training Complete!</p>
                        <p className="text-muted text-sm">BeeBot has learned this document.</p>
                    </div>
                )}

            </div>

            <style>{`
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
