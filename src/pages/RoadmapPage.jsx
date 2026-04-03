import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { Rocket, CheckCircle, Clock, Lightbulb, Globe, Cpu, MessageSquare, BarChart2, Smartphone, Key, Users, Palette, Mail, Zap, ArrowRight } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --black-card: #1A1A1A;
    --text-dark: #1A1200; --text-muted: #5C5032; --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --radius-lg: 20px; --radius-xl: 28px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .roadmap-card {
    background: white; border-radius: var(--radius-xl); border: 1px solid var(--border);
    padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .roadmap-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: rgba(255,193,7,0.3); }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; width: fit-content; }
  .vote-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; border: 2px solid var(--border); background: none; font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; color: var(--text-faint); cursor: pointer; transition: all 0.2s; }
  .vote-btn:hover { border-color: var(--gold-400); color: var(--gold-rich); background: var(--gold-100); }
  .vote-btn.voted { border-color: var(--gold-400); color: var(--gold-rich); background: var(--gold-100); }
  .phase-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
  .phase-icon-wrap { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
`;

const phases = [
  {
    id: 'launched',
    label: 'Launched',
    statusPill: { text: '✓ Shipped', bg: 'rgba(76,175,80,0.12)', color: '#2E7D32' },
    icon: CheckCircle,
    iconBg: 'rgba(76,175,80,0.12)',
    iconColor: '#2E7D32',
    headerColor: '#2E7D32',
    items: [
      { icon: Zap, title: 'Core RAG Engine', desc: 'PDF-to-vector knowledge base with 98% accuracy retrieval.' },
      { icon: Cpu, title: 'AI Chat Widget', desc: 'Embeddable JavaScript widget deployable in under 5 minutes.' },
      { icon: Palette, title: 'Custom Personality', desc: 'Name, tone, and welcome message configuration.' },
      { icon: Users, title: 'Human Escalation', desc: 'Automated handoff with full transcript forwarding.' },
      { icon: Globe, title: 'URL Crawling', desc: 'Index website content by pasting a URL.' },
      { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Message volume, accuracy, and unanswered questions.' },
    ],
  },
  {
    id: 'building',
    label: 'In Progress',
    statusPill: { text: '⚡ Building Now', bg: 'rgba(255,193,7,0.15)', color: '#C9950A' },
    icon: Clock,
    iconBg: 'rgba(255,193,7,0.12)',
    iconColor: '#C9950A',
    headerColor: '#C9950A',
    items: [
      { icon: Globe, title: 'Multi-language Support', desc: 'Auto-detect and respond in 20+ languages without any configuration.' },
      { icon: MessageSquare, title: 'Slack Integration', desc: 'Escalated conversations forwarded directly to a designated Slack channel.' },
      { icon: Mail, title: 'Proactive Messaging', desc: 'Trigger messages to visitors based on time-on-page or URL patterns.' },
      { icon: BarChart2, title: 'Analytics 2.0', desc: 'Topic clustering, sentiment analysis, and conversation flow visualization.' },
    ],
  },
  {
    id: 'planned',
    label: 'Coming Soon',
    statusPill: { text: '📋 Planned', bg: 'rgba(33,150,243,0.1)', color: '#1565C0' },
    icon: Rocket,
    iconBg: 'rgba(33,150,243,0.1)',
    iconColor: '#1565C0',
    headerColor: '#1565C0',
    items: [
      { icon: Key, title: 'API Access', desc: 'Full REST API so developers can integrate BeeBot into any workflow.' },
      { icon: Users, title: 'Team Collaboration', desc: 'Invite teammates to manage bots, review conversations, and respond.' },
      { icon: Smartphone, title: 'Mobile SDK', desc: 'Native iOS and Android SDKs for in-app AI support.' },
      { icon: Globe, title: 'Custom Domain Widget', desc: 'Host the widget on your own domain for enterprise white-labeling.' },
    ],
  },
  {
    id: 'future',
    label: 'Future Ideas',
    statusPill: { text: '💡 Exploring', bg: 'rgba(156,39,176,0.1)', color: '#6A1B9A' },
    icon: Lightbulb,
    iconBg: 'rgba(156,39,176,0.1)',
    iconColor: '#6A1B9A',
    headerColor: '#6A1B9A',
    items: [
      { icon: Cpu, title: 'Voice Support', desc: 'Audio-based interactions for accessibility and phone support scenarios.' },
      { icon: Palette, title: 'White Label Platform', desc: 'Resell BeeBot under your own brand to your clients.' },
      { icon: BarChart2, title: 'Revenue Attribution', desc: 'Track which bot conversations lead to course purchases and renewals.' },
      { icon: Globe, title: 'AI Email Responder', desc: 'The same RAG intelligence applied to incoming support emails.' },
    ],
  },
];

export default function RoadmapPage() {
  const [votes, setVotes] = useState({});

  const toggleVote = (phaseId, itemTitle) => {
    const key = `${phaseId}:${itemTitle}`;
    setVotes(v => ({ ...v, [key]: !v[key] }));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 100%, rgba(255,193,7,0.12) 0%, transparent 60%)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
          <defs><pattern id="rmhex" width="56" height="52" patternUnits="userSpaceOnUse"><polygon points="28,2 54,15 54,41 28,54 2,41 2,15" fill="rgba(255,193,7,0.07)" stroke="#FFC107" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#rmhex)" />
        </svg>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <Rocket size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Roadmap</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Where BeeBot is <span style={{ color: '#FFC107' }}>headed.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 1.5rem' }}>
            A transparent view into what we've built, what we're building now, and what's coming next. Vote on features you want to see.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            💡 Click the heart button on any planned feature to upvote it — we prioritize by demand.
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--border)', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>2026 Roadmap Progress</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-rich)' }}>40% complete</span>
          </div>
          <div style={{ height: 8, background: 'var(--cream)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, var(--gold-400), var(--gold-600))', borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Roadmap grid */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: '3rem' }}>
          {phases.map(phase => (
            <div key={phase.id}>
              {/* Phase header */}
              <div className="phase-header">
                <div className="phase-icon-wrap" style={{ background: phase.iconBg }}>
                  <phase.icon size={22} color={phase.iconColor} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{phase.label}</h2>
                  <span className="status-pill" style={{ background: phase.statusPill.bg, color: phase.statusPill.color }}>
                    {phase.statusPill.text}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {phase.items.map((item, j) => {
                  const voteKey = `${phase.id}:${item.title}`;
                  const voted = votes[voteKey];
                  return (
                    <div key={j} className="roadmap-card" style={{ borderLeft: `3px solid ${phase.iconColor}20` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: phase.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <item.icon size={17} color={phase.iconColor} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem', fontSize: '0.97rem' }}>{item.title}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                        {(phase.id === 'planned' || phase.id === 'future') && (
                          <button className={`vote-btn ${voted ? 'voted' : ''}`} onClick={() => toggleVote(phase.id, item.title)}>
                            {voted ? '♥' : '♡'} {voted ? 'Voted' : 'Vote'}
                          </button>
                        )}
                        {phase.id === 'launched' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2E7D32', fontSize: '0.78rem', fontWeight: 700 }}>
                            <CheckCircle size={14} /> Done
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback CTA */}
        <div style={{ marginTop: '4rem', background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))', borderRadius: 24, padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--black)', marginBottom: '0.75rem' }}>Have a feature idea?</h3>
          <p style={{ color: 'rgba(0,0,0,0.65)', marginBottom: '2rem', fontSize: '1rem' }}>We build what our users need most. Tell us what would make BeeBot 10x more valuable for you.</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: 'var(--black)', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Share your idea <ArrowRight size={15} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Changelog', to: '/changelog' }, { label: 'Contact', to: '/contact' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
