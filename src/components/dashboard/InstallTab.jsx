import React, { useState } from 'react';
import { Copy, Code, CheckCircle, Key, Globe, Zap, Settings, ExternalLink, Info } from 'lucide-react';
import config from '../../config';

export default function InstallTab({ apiKey, businessId }) {
    const [copiedKey, setCopiedKey]       = useState(false);
    const [copiedScript, setCopiedScript] = useState(false);
    const [testOpen, setTestOpen]         = useState(false);

    const embedScript = apiKey
        ? `<script\n  src="${config.WIDGET_URL}"\n  data-api-key="${apiKey}"\n  data-api-url="${config.API_BASE_URL}"\n  defer\n></script>`
        : '';

    const copy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => {});
        if (type === 'key') { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }
        else                { setCopiedScript(true); setTimeout(() => setCopiedScript(false), 2000); }
    };

    const steps = [
        {
            icon: <Key size={20} />,
            label: 'API Key',
            title: 'Your API Key',
            description: 'This authenticates your chatbot widget. It is embedded in the script — no action needed.',
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '11px 14px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text)' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {apiKey || <span style={{ color: 'var(--color-text-faint)' }}>No API key — connect your account first</span>}
                    </span>
                    {apiKey && (
                        <button
                            className="btn-ghost"
                            style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', color: copiedKey ? 'var(--color-success)' : 'var(--color-text-muted)', background: copiedKey ? 'var(--color-success-bg)' : 'transparent', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
                            onClick={() => copy(apiKey, 'key')}
                        >
                            {copiedKey ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                        </button>
                    )}
                </div>
            )
        },
        {
            icon: <Code size={20} />,
            label: 'Embed Code',
            title: 'Add to Your Website',
            description: <>Paste this snippet just before the closing <code style={{ background: 'var(--color-border)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.82em' }}>&lt;/body&gt;</code> tag of every page where you want the chatbot to appear.</>,
            content: (
                <>
                    {embedScript ? (
                        <div style={{ position: 'relative', background: '#0d0d0d', borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'var(--font-mono)' }}>HTML</span>
                                <button
                                    onClick={() => copy(embedScript.replace(/\n\s*/g, ' '), 'script')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: copiedScript ? '#16a34a' : '#2a2a2a', color: copiedScript ? '#fff' : '#aaa', border: 'none', padding: '4px 10px', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                >
                                    {copiedScript ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                                </button>
                            </div>
                            <pre style={{ margin: 0, padding: '16px 18px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#e0e0e0', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre' }}>
                                <span style={{ color: '#7dd3fc' }}>&lt;script</span>{'\n'}
                                {'  '}<span style={{ color: '#a5f3fc' }}>src</span>=<span style={{ color: '#fde68a' }}>"{config.WIDGET_URL}"</span>{'\n'}
                                {'  '}<span style={{ color: '#a5f3fc' }}>data-api-key</span>=<span style={{ color: '#fde68a' }}>"{apiKey}"</span>{'\n'}
                                {'  '}<span style={{ color: '#a5f3fc' }}>data-api-url</span>=<span style={{ color: '#fde68a' }}>"{config.API_BASE_URL}"</span>{'\n'}
                                {'  '}<span style={{ color: '#a5f3fc' }}>defer</span>{'\n'}
                                <span style={{ color: '#7dd3fc' }}>&gt;&lt;/script&gt;</span>
                            </pre>
                        </div>
                    ) : (
                        <div style={{ padding: '16px', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-faint)', fontSize: '0.88rem', textAlign: 'center' }}>
                            Complete your account setup to generate the embed code.
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'var(--color-accent-light, #fffde7)', border: '1px solid var(--color-accent, #FFDE21)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--color-text)', alignItems: 'flex-start', gap: '10px' }}>
                        <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-text-muted)' }} />
                        <span>
                            <strong>Widget color</strong> is stored in your Bot Settings — not in this script. Change it anytime from the <a href="/dashboard/settings" style={{ color: 'var(--color-primary-deep)', textDecoration: 'underline' }}>Bot Settings</a> tab.
                        </span>
                    </div>
                </>
            )
        },
        {
            icon: <Zap size={20} />,
            label: 'Verify',
            title: 'Verify Installation',
            description: 'After adding the script, reload your website and look for the BeeBot bubble in the bottom-right corner.',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <CheckCircle size={16} style={{ color: 'var(--color-success, #16a34a)', marginTop: '1px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Make sure you have at least one knowledge source on the{' '}
                            <a href="/dashboard/knowledge" style={{ color: 'var(--color-primary-deep)', textDecoration: 'underline' }}>Knowledge Base</a> tab so the bot can answer questions.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <CheckCircle size={16} style={{ color: 'var(--color-success, #16a34a)', marginTop: '1px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            You can customise the bot name, tone, welcome message, and colors from{' '}
                            <a href="/dashboard/settings" style={{ color: 'var(--color-primary-deep)', textDecoration: 'underline' }}>Bot Settings</a>.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <CheckCircle size={16} style={{ color: 'var(--color-success, #16a34a)', marginTop: '1px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Test the widget from the{' '}
                            <a href="/dashboard/playground" style={{ color: 'var(--color-primary-deep)', textDecoration: 'underline' }}>Playground</a> tab before going live.
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in" style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div>
                <h2 className="title mb-1">Installation</h2>
                <p className="text-muted">Deploy BeeBot to your website in under 2 minutes.</p>
            </div>

            {/* Steps */}
            {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Step indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                            {i + 1}
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ width: '2px', height: '100%', minHeight: '24px', background: 'var(--color-border)', margin: '6px 0', flex: 1 }} />
                        )}
                    </div>

                    {/* Card */}
                    <div className="card p-6" style={{ flex: 1, marginBottom: i < steps.length - 1 ? '0' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>{step.icon}</span>
                            <h3 className="section-title" style={{ margin: 0 }}>{step.title}</h3>
                        </div>
                        <p className="text-muted mb-4" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{step.description}</p>
                        {step.content}
                    </div>
                </div>
            ))}

            {/* Deployment Config Notice */}
            <div className="card p-6" style={{ border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Globe size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="section-title" style={{ margin: 0 }}>Deploying to Production?</h3>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                    The URLs embedded in the script come from a single config file. Update them once and they'll reflect everywhere.
                </p>
                <div style={{ background: '#0d0d0d', borderRadius: '8px', padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#e0e0e0', lineHeight: 1.9, border: '1px solid #2a2a2a' }}>
                    <div style={{ color: '#666', marginBottom: '6px' }}># frontend/.env</div>
                    <div><span style={{ color: '#a5f3fc' }}>VITE_API_BASE_URL</span>=<span style={{ color: '#fde68a' }}>https://api.yourdomain.com/api</span></div>
                    <div><span style={{ color: '#a5f3fc' }}>VITE_WIDGET_URL</span>=<span style={{ color: '#fde68a' }}>https://yourdomain.com/widget.js</span></div>
                </div>
                <p className="text-faint mt-3" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    File location: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-border)', padding: '1px 5px', borderRadius: '4px' }}>frontend/.env</code> — edit this file before building for production. Both variables are picked up automatically by the app at build time.
                </p>

                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Current Widget URL</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text)', wordBreak: 'break-all' }}>{config.WIDGET_URL}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Current API URL</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text)', wordBreak: 'break-all' }}>{config.API_BASE_URL}</div>
                    </div>
                </div>

                {(config.WIDGET_URL.includes('localhost') || config.API_BASE_URL.includes('localhost')) && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 13px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', fontSize: '0.82rem', color: '#713f12' }}>
                        <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>You're currently using <strong>localhost URLs</strong>. Update <code style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 4px', borderRadius: '3px' }}>frontend/.env</code> before deploying so your clients get the correct production URLs.</span>
                    </div>
                )}
            </div>

            {/* Business ID */}
            {businessId && (
                <p className="text-faint" style={{ fontSize: '0.8rem' }}>
                    Business ID: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-border)', padding: '1px 6px', borderRadius: '4px' }}>{businessId}</code>
                </p>
            )}
        </div>
    );
}
