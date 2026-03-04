import React, { useState, useEffect } from 'react';
import { Upload, Settings, Code, CreditCard, Sparkles, Copy, LogOut, Activity, Users, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

import UploadModal from './UploadModal';
import WidgetPreview from './WidgetPreview';
import config from '../config';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const [clientConfig, setClientConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.client) {
          setClientConfig(data.client);
        }
      } catch (err) {
        console.error('Failed to fetch client config:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [token]);

  const saveConfig = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          botName: clientConfig.botName,
          tone: clientConfig.tone,
          primaryColor: clientConfig.primaryColor,
          welcomeMessage: clientConfig.welcomeMessage
        })
      });
      if (res.ok) alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  if (isLoading) {
    return <div className="dashboard-layout"><div className="w-full flex items-center justify-center text-muted">Loading your workspace...</div></div>;
  }

  if (!clientConfig) {
    return <div className="dashboard-layout"><div className="w-full flex items-center justify-center text-muted">Failed to load workspace configuration.</div></div>;
  }

  return (
    <div className="dashboard-layout animate-fade-in">

      {/* SaaS Left Sidebar */}
      <aside className="sidebar flex-col justify-between">
        <div>
          {/* Brand Logo Area */}
          <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/bee-yellow.jpg" alt="BeeBots" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2 }}>BeeBots</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-col gap-2">
            <NavItem icon={<Activity size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon={<Upload size={18} />} label="Knowledge Base" active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
            <NavItem icon={<Settings size={18} />} label="Bot Customization" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <NavItem icon={<Code size={18} />} label="Embed Script" active={activeTab === 'embed'} onClick={() => setActiveTab('embed')} />

            <div style={{ height: '1px', background: 'var(--panel-border)', margin: '1rem 0' }}></div>

            <NavItem icon={<CreditCard size={18} />} label="Billing & Usage" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          </nav>
        </div>

        {/* User Profile Footer */}
        <div>
          <button className="btn-secondary w-full gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
            <Sparkles size={14} color="var(--primary)" /> Upgrade to Pro
          </button>
          <div className="flex items-center justify-between glass-panel p-3">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{clientConfig.billingTier}</div>
              </div>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              onClick={() => { logout(); navigate('/'); }}
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">

        {/* Content Top Bar (Optional, can house breadcrumbs or account actions later) */}
        <header className="flex justify-between items-center mb-8 pb-4" style={{ borderBottom: '1px solid var(--panel-border)' }}>
          <h2 className="section-title capitalize">{activeTab.replace('-', ' ')}</h2>
        </header>

        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
          {activeTab === 'overview' && (
            <div className="flex-col gap-8">
              <div className="flex gap-6">
                <div className="glass-panel p-6 flex-1 panel-hover transition">
                  <div className="flex items-center gap-3 mb-4 text-muted">
                    <Activity size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>AI Completions</span>
                  </div>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{clientConfig.currentMonthUsage || 0}</h3>
                  <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>Messages resolved this month</p>
                </div>

                <div className="glass-panel p-6 flex-1 panel-hover transition">
                  <div className="flex items-center gap-3 mb-4 text-muted">
                    <Database size={18} color="var(--text-main)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Knowledge Base</span>
                  </div>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: 700 }}>0</h3>
                  <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>Active documents indexing</p>
                </div>

                <div className="glass-panel p-6 flex-1 panel-hover transition">
                  <div className="flex items-center gap-3 mb-4 text-muted">
                    <Users size={18} color="var(--text-main)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Billing Tier</span>
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'capitalize' }}>{clientConfig.billingTier.replace('-', ' ')}</h3>
                  <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>Current subscription plan</p>
                </div>
              </div>

              <div className="glass-panel p-8">
                <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Get Started</h3>
                <p className="text-muted mb-6">Train your bot with your company data and deploy it to your website in minutes.</p>
                <div className="flex gap-4">
                  <button className="btn-primary" onClick={() => setActiveTab('knowledge')}>Add Training Data</button>
                  <button className="btn-secondary" onClick={() => setActiveTab('embed')}>Get Embed Script</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted">Upload documents to train your BeeBot.</p>
                <button className="btn-primary gap-2" onClick={() => setUploadModalOpen(true)}>
                  <Upload size={16} /> Add Document
                </button>
              </div>

              <div className="empty-state">
                <div className="empty-state-icon">
                  <Upload size={28} className="text-muted" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>No documents yet</h3>
                  <p className="text-muted mt-1 text-center" style={{ fontSize: '0.9rem' }}>Upload PDFs, docs, or add website links to ground your bot's answers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex gap-12">
              <div className="flex-1 max-w-md">
                <p className="text-muted mb-8">Customize how your bot looks and talks to your users.</p>

                <div className="flex-col gap-6">
                  <div>
                    <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.9rem' }}>Bot Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={clientConfig.botName}
                      onChange={e => setClientConfig({ ...clientConfig, botName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.9rem' }}>Welcome Message</label>
                    <input
                      type="text"
                      className="input-field"
                      value={clientConfig.welcomeMessage}
                      onChange={e => setClientConfig({ ...clientConfig, welcomeMessage: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-1">
                      <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.9rem' }}>Support Tone</label>
                      <select
                        className="input-field"
                        value={clientConfig.tone}
                        onChange={e => setClientConfig({ ...clientConfig, tone: e.target.value })}
                      >
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Concise">Concise</option>
                        <option value="Persuasive">Persuasive (Sales)</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.9rem' }}>Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          style={{ width: '40px', height: '40px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--panel-border)', borderRadius: '4px' }}
                          value={clientConfig.primaryColor}
                          onChange={e => setClientConfig({ ...clientConfig, primaryColor: e.target.value })}
                        />
                        <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{clientConfig.primaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-6" style={{ borderTop: '1px solid var(--panel-border)' }}>
                    <button className="btn-primary" onClick={saveConfig}>Save Configuration</button>
                  </div>
                </div>
              </div>

              {/* Live Preview Pane */}
              <div style={{ flex: '0 0 320px' }}>
                <WidgetPreview config={{ ...clientConfig, clientId: clientConfig._id }} />
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div>
              <p className="text-muted mb-8">Copy and paste this code snippet right before the closing <code>&lt;/body&gt;</code> tag of your website.</p>

              <div className="code-block" style={{ marginBottom: '2rem' }}>
                <code>
                  {`<script 
  src="${config.WIDGET_URL}" 
  data-client-id="${clientConfig._id}"
  data-api-url="${config.API_BASE_URL}/chat"
></script>`}
                </code>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(`<script src="${config.WIDGET_URL}" data-client-id="${clientConfig._id}" data-api-url="${config.API_BASE_URL}/chat"></script>`)}
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="glass-panel p-6 flex gap-4" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>Protect your Client ID</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    This embed script uses your unique <strong>Client ID ({clientConfig._id})</strong>. Every message sent through
                    this widget will be billed to your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-2xl">
              <p className="text-muted mb-8">Manage your API usage and subscription plan.</p>

              <div className="glass-panel p-8 mb-6">
                <div className="flex justify-between items-start mb-6 pb-6" style={{ borderBottom: '1px solid var(--panel-border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Current Usage (This Month)</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Billing cycle: Mar 1 - Mar 31</p>
                  </div>
                  <div style={{ background: 'var(--primary-transparent)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600 }}>
                    Pay-As-You-Go
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-end gap-2">
                    <span style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>{clientConfig.currentMonthUsage || 0}</span>
                    <span className="text-muted" style={{ marginBottom: '6px' }}>AI resolutions</span>
                  </div>
                  <div className="text-right">
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Rate</span>
                    <span style={{ fontWeight: 600 }}>$0.009 / res</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 mt-8" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                  <span className="text-muted">Estimated Invoice</span>
                  <strong style={{ fontSize: '1.2rem' }}>${((clientConfig.currentMonthUsage || 0) * 0.009).toFixed(2)} USD</strong>
                </div>
              </div>

              <button className="btn-secondary gap-2">
                <CreditCard size={18} /> Manage Payment Method
              </button>
            </div>
          )}
        </div>
      </main>

      {isUploadModalOpen && (
        <UploadModal onClose={() => setUploadModalOpen(false)} clientId={clientConfig._id} />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Dashboard;
