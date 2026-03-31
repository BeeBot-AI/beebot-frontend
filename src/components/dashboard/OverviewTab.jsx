import React, { useEffect, useState } from 'react';
import { Database, MessageSquare, Plus, ArrowRight, CheckCircle, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

function OverviewTab({ business, bot }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [knowledgeCount, setKnowledgeCount] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, knowledgeRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/conversations/stats`, { withCredentials: true }),
                    axios.get(`${config.API_BASE_URL}/knowledge`, { withCredentials: true })
                ]);
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }
                if (knowledgeRes.data.success) {
                    setKnowledgeCount(knowledgeRes.data.sources?.length ?? 0);
                }
            } catch (err) {
                console.error('Failed to load overview stats', err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Total Conversations',
            value: statsLoading ? '—' : (stats?.totalConversations ?? 0),
            icon: <Users size={22} />,
            color: '#000000',
            bg: 'var(--color-accent)',
        },
        {
            label: 'AI Messages Sent',
            value: statsLoading ? '—' : (stats?.totalMessages ?? 0),
            icon: <MessageSquare size={22} />,
            color: 'var(--color-white)',
            bg: 'var(--color-primary)',
        },
        {
            label: 'Knowledge Sources',
            value: statsLoading ? '—' : (knowledgeCount ?? 0),
            icon: <Database size={22} />,
            color: 'var(--color-success)',
            bg: 'var(--color-success-bg)',
        },
    ];

    const hasKnowledge = knowledgeCount > 0;
    const hasBot = !!bot;

    return (
        <div>
            <div className="mb-8">
                <h2 className="title mb-2">
                    Welcome back{business?.business_name ? `, ${business.business_name}` : ''}
                </h2>
                <p className="text-muted">Here's what's happening with your AI assistant today.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{
                            width: '46px', height: '46px', borderRadius: '10px',
                            background: stat.bg, color: stat.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '2rem', fontFamily: 'var(--font-display)',
                                fontWeight: 800, color: 'var(--color-text)', lineHeight: 1
                            }}>
                                {statsLoading ? (
                                    <div className="skeleton" style={{ width: '60px', height: '32px', display: 'inline-block', borderRadius: '4px' }} />
                                ) : stat.value}
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Getting Started Guide */}
            <div className="card-asymmetric p-8" style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <div style={{ width: '28px', height: '28px', background: 'var(--color-accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={16} color="#000" />
                    </div>
                    <h3 className="section-title">Getting Started Guide</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Step 1: Done */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ marginTop: '2px', color: 'var(--color-success)', flexShrink: 0 }}><CheckCircle size={22} /></div>
                        <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>Create your account</h4>
                            <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '4px' }}>Business profile is set up and your AI is configured.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                            {hasKnowledge
                                ? <CheckCircle size={22} color="var(--color-success)" />
                                : <div style={{ width: '22px', height: '22px', border: '2px solid var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>2</div>
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>Add Knowledge Base</h4>
                            <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: hasKnowledge ? 0 : '12px' }}>
                                {hasKnowledge
                                    ? `${knowledgeCount} knowledge source${knowledgeCount !== 1 ? 's' : ''} added — your bot is learning!`
                                    : 'Upload your website URLs or PDF documents so BeeBot learns about your business.'}
                            </p>
                            {!hasKnowledge && (
                                <button className="btn-primary" onClick={() => navigate('/dashboard/knowledge')} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                    <Plus size={15} /> Add Sources
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', gap: '16px', opacity: hasKnowledge ? 1 : 0.45 }}>
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                            <div style={{ width: '22px', height: '22px', border: `2px solid ${hasKnowledge ? 'var(--color-border-strong)' : 'var(--color-text-faint)'}`, color: 'var(--color-text-faint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>3</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>Install on Website</h4>
                            <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: hasKnowledge ? '12px' : 0 }}>
                                Copy the widget code and paste it into your website's HTML.
                            </p>
                            {hasKnowledge && (
                                <button className="btn-primary" onClick={() => navigate('/dashboard/install')} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                                    Get Install Code <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default OverviewTab;
