import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

export default function BillingTab() {
    const [stats, setStats] = useState({ totalConversations: 0, aiMessages: 0 });
    const [loading, setLoading] = useState(true);

    const MESSAGE_LIMIT = 50; // Hardcoded free tier limit for UI

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [convRes, bizRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/conversations?business_id=me`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
                    axios.get(`${config.API_BASE_URL}/business`, { withCredentials: true })
                ]);

                setStats({
                    totalConversations: convRes.data.data?.length || 0,
                    aiMessages: bizRes.data.data?.message_count || 0
                });
            } catch (err) {
                console.error("Failed to fetch billing stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const usagePercent = Math.min((stats.aiMessages / MESSAGE_LIMIT) * 100, 100);

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>

            <div className="mb-8">
                <h2 className="title mb-2">Billing & Limits</h2>
                <p className="text-muted">Manage your subscription and monitor your AI usage.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '3rem' }}>

                {/* Current Plan Card */}
                <div className="card p-6" style={{ background: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Current Plan</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Starter (Free) <span className="badge badge-success" style={{ fontSize: '0.7rem', transform: 'translateY(-2px)' }}>Active</span>
                            </h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={20} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>AI Messages Used</span>
                            <span style={{ color: usagePercent > 90 ? 'var(--color-error)' : 'var(--color-text)' }}>
                                {loading ? '...' : `${stats.aiMessages} / ${MESSAGE_LIMIT}`}
                            </span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: 'var(--color-surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${usagePercent}%`, height: '100%',
                                background: usagePercent > 90 ? 'var(--color-error)' : 'var(--color-primary)',
                                transition: 'width 1s var(--ease-out-expo)'
                            }}></div>
                        </div>
                        {usagePercent > 80 && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '8px' }}>You are approaching your free limit. Upgrade to avoid service interruption.</p>
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span className="text-muted">Total Conversations Answered</span>
                            <strong style={{ fontSize: '1.1rem' }}>{loading ? '...' : stats.totalConversations}</strong>
                        </div>
                    </div>
                </div>

                {/* Upgrade CTA Card */}
                <div className="card-asymmetric p-6" style={{ background: 'var(--color-accent)', color: 'white', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--color-primary-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Zap size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro Plan</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary-mid)' }}>$49<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>/mo</span></div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem', flex: 1 }}>
                        {['5,000 AI messages per month', 'Unlimited knowledge sources', 'Remove "Powered by BeeBot" branding', 'Priority email support'].map((feat, i) => (
                            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                                <Check size={16} color="var(--color-primary-mid)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button className="btn-primary w-full" style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', display: 'flex', background: 'var(--color-white)', color: 'var(--color-accent)', boxShadow: 'none' }}>
                        <CreditCard size={18} /> Upgrade to Pro
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>Secure payment via Stripe</p>
                </div>
            </div>

        </div>
    );
}
