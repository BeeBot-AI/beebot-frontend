import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, MessageSquare, Settings, PlayCircle, CreditCard, Code, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import axios from 'axios';
import config from '../config';

// Tabs
import OverviewTab from './dashboard/OverviewTab';
import KnowledgeTab from './dashboard/KnowledgeTab';
import BotSettingsTab from './dashboard/BotSettingsTab';
import ConversationsTab from './dashboard/ConversationsTab';
import PlaygroundTab from './dashboard/PlaygroundTab';
import InstallTab from './dashboard/InstallTab';
import BillingTab from './dashboard/BillingTab';
import ProfileTab from './dashboard/ProfileTab';
import TourOverlay from './ui/TourOverlay';

function NavItem({ icon, label, to, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();

  const [businessData, setBusinessData] = useState(null);
  const [chatbotSettings, setChatbotSettings] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messageStats, setMessageStats] = useState({ used: 0, limit: 50 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bizRes, botRes, meRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/business`, { withCredentials: true }),
          axios.get(`${config.API_BASE_URL}/chatbot`, { withCredentials: true }),
          axios.get(`${config.API_BASE_URL}/business/me`, { withCredentials: true })
        ]);
        setBusinessData(bizRes.data.data);
        setChatbotSettings(botRes.data.data);
        setApiKey(meRes.data.api_key || null);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/conversations/stats`, { withCredentials: true });
        if (res.data.success) {
          setMessageStats({ used: res.data.stats.totalMessages, limit: 50 });
        }
      } catch (err) {
        // non-critical, keep default
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="animate-spin" style={{ color: 'var(--color-primary)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <p className="text-muted" style={{ fontWeight: 500 }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  const getCurrentPageName = () => {
    const path = location.pathname.replace('/dashboard', '');
    if (path === '' || path === '/') return 'Overview';
    if (path.includes('/knowledge')) return 'Knowledge Base';
    if (path.includes('/conversations')) return 'Conversations';
    if (path.includes('/settings')) return 'Bot Settings';
    if (path.includes('/playground')) return 'Playground';
    if (path.includes('/install')) return 'Installation';
    if (path.includes('/billing')) return 'Billing & Usage';
    if (path.includes('/profile')) return 'Profile';
    return '';
  };

  const SidebarContent = () => (
    <>
      {/* Brand Area */}
      <div className="flex items-center gap-3 cursor-pointer mb-8 px-2" onClick={() => { navigate('/'); closeSidebar(); }}>
        <img src="/bee-yellow.jpg" alt="BeeBot Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-white)' }}>BeeBot.</span>
      </div>

      {/* Navigation */}
      <nav className="flex-col gap-1" style={{ flex: 1 }}>
        <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Main Menu
        </div>
        <div id="tour-dashboard-welcome">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" to="/dashboard" end onClick={closeSidebar} />
        </div>
        <div id="tour-knowledge-base">
          <NavItem icon={<Database size={18} />} label="Knowledge Base" to="/dashboard/knowledge" onClick={closeSidebar} />
        </div>
        <NavItem icon={<MessageSquare size={18} />} label="Conversations" to="/dashboard/conversations" onClick={closeSidebar} />

        <div style={{ padding: '0 12px', marginTop: '24px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Configuration
        </div>
        <div id="tour-bot-settings">
          <NavItem icon={<Settings size={18} />} label="Bot Settings" to="/dashboard/settings" onClick={closeSidebar} />
        </div>
        <NavItem icon={<PlayCircle size={18} />} label="Playground" to="/dashboard/playground" onClick={closeSidebar} />
        <NavItem icon={<Code size={18} />} label="Installation" to="/dashboard/install" onClick={closeSidebar} />

        <div style={{ padding: '0 12px', marginTop: '24px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Account
        </div>
        <NavItem icon={<CreditCard size={18} />} label="Billing" to="/dashboard/billing" onClick={closeSidebar} />
        <NavItem icon={<User size={18} />} label="Profile" to="/dashboard/profile" onClick={closeSidebar} />
      </nav>

      {/* Bottom User Area */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-border)', paddingTop: '1rem' }}>
        {/* Usage & Upgrade CTA */}
        <div style={{ background: 'rgba(255,222,33,0.06)', border: '1px solid rgba(255,222,33,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
          <h4 style={{ color: 'var(--color-white)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Free Plan</h4>
          <p style={{ color: 'var(--sidebar-text)', fontSize: '0.78rem', marginBottom: '10px' }}>
            {messageStats.used}/{messageStats.limit} AI messages used
          </p>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((messageStats.used / messageStats.limit) * 100, 100)}%`, background: 'var(--color-accent)', borderRadius: '4px', transition: 'width 0.5s' }} />
          </div>
          <button className="btn-primary w-full" style={{ padding: '7px', fontSize: '0.78rem' }} onClick={() => { navigate('/dashboard/billing'); closeSidebar(); }}>
            Upgrade Now
          </button>
        </div>

        <button
          onClick={() => { startTour(); closeSidebar(); }}
          className="nav-item w-full"
          style={{ fontSize: '0.82rem', color: 'var(--sidebar-text)', marginBottom: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Take Tour</span>
        </button>

        <button onClick={handleLogout} className="nav-item w-full" style={{ color: '#FCA5A5' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* ─── MOBILE HEADER ─────────────────────────────────────────── */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2">
          <img src="/bee-yellow.jpg" alt="BeeBot" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-white)' }}>BeeBot.</span>
        </div>
        <div style={{ width: '38px' }} />
      </div>

      {/* ─── SIDEBAR OVERLAY (mobile) ───────────────────────────────── */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* ─── SIDEBAR ────────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="main-content">
        <TourOverlay />

        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <span>{businessData?.business_name || businessData?.company_name || 'My Workspace'}</span>
              <span>/</span>
            </div>
            <h1 className="title" style={{ fontSize: '1.6rem' }}>{getCurrentPageName()}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard/profile')}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--color-accent)', border: '2px solid var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000000', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}
              title="View Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Tab Content Routes */}
        <div className="animate-fade-in">
          <Routes>
            <Route index element={<OverviewTab business={businessData} bot={chatbotSettings} />} />
            <Route path="knowledge" element={<KnowledgeTab businessId={businessData?._id} />} />
            <Route path="settings" element={<BotSettingsTab bot={chatbotSettings} />} />
            <Route path="conversations" element={<ConversationsTab businessId={businessData?._id} bot={chatbotSettings} />} />
            <Route path="billing" element={<BillingTab />} />
            <Route path="profile" element={<ProfileTab />} />
            <Route path="install" element={
              <InstallTab
                apiKey={apiKey}
                embedScript={
                  apiKey
                    ? `<script src="${config.WIDGET_URL}" data-api-key="${apiKey}" data-api-url="${config.API_BASE_URL}" defer></script>`
                    : ''
                }
                businessId={businessData?._id}
              />
            } />
            <Route path="playground" element={<PlaygroundTab businessId={businessData?._id} bot={chatbotSettings} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
