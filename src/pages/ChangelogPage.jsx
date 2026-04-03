import React from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { Zap, Shield, Cpu, Globe, Settings, CheckCircle, Star, ArrowRight } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --black-card: #1A1A1A; --black-mid: #2A2A2A;
    --text-dark: #1A1200; --text-muted: #5C5032; --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2); --border-strong: rgba(184,134,11,0.4);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --radius-md: 14px; --radius-lg: 20px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .version-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 600; }
  .change-type { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-right: 6px; }
  .type-new { background: rgba(76,175,80,0.15); color: #2E7D32; }
  .type-improved { background: rgba(255,193,7,0.2); color: #B8860B; }
  .type-fixed { background: rgba(33,150,243,0.15); color: #1565C0; }
  .timeline-line { position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--gold-500) 0%, rgba(255,193,7,0.1) 100%); }
  .timeline-dot { position: absolute; left: 12px; top: 32px; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, var(--gold-400), var(--gold-600)); border: 3px solid var(--cream); box-shadow: 0 0 0 2px var(--gold-400); }
`;

const releases = [
  {
    version: 'v1.4.0',
    date: 'April 1, 2026',
    label: 'Latest',
    labelColor: '#FFC107',
    labelBg: 'rgba(255,193,7,0.15)',
    highlight: true,
    title: 'Multi-language Support & Analytics 2.0',
    summary: 'Your BeeBot can now answer in 12 languages automatically, and the new Analytics dashboard gives you deep insight into what your customers are really asking.',
    changes: [
      { type: 'new', text: 'Auto-detect and respond in 12 languages (English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Japanese, Korean, Chinese, Arabic)' },
      { type: 'new', text: 'Analytics 2.0: Topic clustering, sentiment analysis, peak hours heatmap, and unanswered question reports' },
      { type: 'new', text: 'Custom webhook support — get real-time notifications when escalations occur' },
      { type: 'improved', text: 'Response latency reduced by 35% through model optimization and caching improvements' },
      { type: 'improved', text: 'PDF parsing now handles complex multi-column layouts and tables with 40% higher accuracy' },
      { type: 'fixed', text: 'Fixed occasional duplicate messages in high-traffic widget deployments' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'March 5, 2026',
    label: null,
    highlight: false,
    title: 'Slack & Email Integration',
    summary: 'Escalated conversations now flow directly into your Slack workspace or any email inbox. No more checking a separate dashboard for human handoffs.',
    changes: [
      { type: 'new', text: 'Native Slack integration — escalated conversations posted to any channel with full context' },
      { type: 'new', text: 'Email-to-ticket integration compatible with Zendesk, Help Scout, and Intercom' },
      { type: 'new', text: 'Conversation rating system — end users can rate bot responses (helps you spot knowledge gaps)' },
      { type: 'improved', text: 'Escalation detection now catches 15 additional emotional signals beyond the original 8' },
      { type: 'improved', text: 'Knowledge base sync now runs every 6 hours (was 24 hours) on Pro plan' },
      { type: 'fixed', text: 'Fixed edge case where bot would loop when asked the same question 3+ times in one session' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'February 12, 2026',
    label: null,
    highlight: false,
    title: 'Custom Branding & Widget Themes',
    summary: 'Your widget, your brand. Customize colors, fonts, position, and even upload a custom avatar for your bot.',
    changes: [
      { type: 'new', text: 'Full widget theming: custom primary color, text color, border radius, and chat bubble styles' },
      { type: 'new', text: 'Custom bot avatar — upload your own image or choose from 20 built-in illustrations' },
      { type: 'new', text: 'Widget position: bottom-right (default), bottom-left, or as an inline embed' },
      { type: 'new', text: 'Conversation export — download full CSV of all conversations from any time period' },
      { type: 'improved', text: 'Widget now loads 3x faster with new edge CDN deployment across 47 countries' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'January 20, 2026',
    label: null,
    highlight: false,
    title: 'Knowledge Base Upgrades',
    summary: 'Massive improvements to how BeeBot ingests and understands your documents, resulting in noticeably more accurate and nuanced answers.',
    changes: [
      { type: 'new', text: 'Support for .docx and .txt file uploads alongside existing PDF support' },
      { type: 'new', text: 'Automatic URL crawling — paste a website URL and BeeBot indexes the entire page content' },
      { type: 'improved', text: 'Upgraded embedding model improves semantic search accuracy from 91% to 98%' },
      { type: 'improved', text: 'Chunking algorithm now better preserves context across section breaks and bullet lists' },
      { type: 'fixed', text: 'Fixed issue where URLs with query parameters would sometimes fail to ingest' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'December 15, 2025',
    label: 'Initial Release',
    labelColor: 'rgba(255,255,255,0.6)',
    labelBg: 'rgba(255,255,255,0.08)',
    highlight: false,
    title: 'BeeBot Launches 🎉',
    summary: 'After 4 months of development and a private beta with 200 businesses, BeeBot is officially live.',
    changes: [
      { type: 'new', text: 'Core AI chat agent with RAG (Retrieval-Augmented Generation) engine' },
      { type: 'new', text: 'PDF knowledge base upload and indexing' },
      { type: 'new', text: 'One-line JavaScript embed widget' },
      { type: 'new', text: 'Agent personality configuration (name, tone, welcome message)' },
      { type: 'new', text: 'Human escalation via email with full transcript forwarding' },
      { type: 'new', text: 'Basic analytics dashboard (message volume, accuracy rate)' },
      { type: 'new', text: 'Free plan (500 msg/month) + Pro plan ($49/month)' },
    ],
  },
];

const typeMap = { new: 'type-new', improved: 'type-improved', fixed: 'type-fixed' };
const typeLabel = { new: 'New', improved: 'Improved', fixed: 'Fixed' };

export default function ChangelogPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(255,193,7,0.1) 0%, transparent 60%)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
          <defs><pattern id="clhex" width="56" height="52" patternUnits="userSpaceOnUse"><polygon points="28,2 54,15 54,41 28,54 2,41 2,15" fill="rgba(255,193,7,0.08)" stroke="#FFC107" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#clhex)" />
        </svg>
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <Zap size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Changelog</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            What's <span style={{ color: '#FFC107' }}>new</span> in BeeBot.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 520 }}>
            A record of every improvement, fix, and new feature we ship. We release updates every 3–4 weeks.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '5rem 2rem 6rem' }}>
        <div style={{ position: 'relative', paddingLeft: '3.5rem' }}>
          <div className="timeline-line" />

          {releases.map((release, i) => (
            <div key={release.version} style={{ position: 'relative', marginBottom: '4rem' }}>
              <div className="timeline-dot" />

              {/* Version + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="version-badge" style={{ background: release.highlight ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.08)', color: release.highlight ? '#FFC107' : 'rgba(255,255,255,0.6)', border: `1px solid ${release.highlight ? 'rgba(255,193,7,0.35)' : 'rgba(255,255,255,0.12)'}` }}>
                  {release.version}
                </span>
                {release.label && (
                  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, background: release.labelBg, color: release.labelColor, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {release.label}
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>{release.date}</span>
              </div>

              {/* Release card */}
              <div style={{ background: release.highlight ? 'white' : 'white', borderRadius: 20, border: `1px solid ${release.highlight ? 'var(--gold-300)' : 'var(--border)'}`, overflow: 'hidden', boxShadow: release.highlight ? '0 8px 32px rgba(255,193,7,0.12)' : 'none' }}>
                {release.highlight && (
                  <div style={{ background: 'linear-gradient(135deg, var(--gold-100), var(--gold-200))', padding: '0.75rem 1.75rem', borderBottom: '1px solid var(--gold-200)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={14} fill="#C9950A" color="#C9950A" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-rich)' }}>Latest release</span>
                  </div>
                )}
                <div style={{ padding: '1.75rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{release.title}</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>{release.summary}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {release.changes.map((change, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span className={`change-type ${typeMap[change.type]}`}>{typeLabel[change.type]}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{change.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap CTA */}
        <div style={{ marginTop: '2rem', background: 'var(--black)', borderRadius: 20, padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white', marginBottom: '0.4rem' }}>What's coming next?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>View our public roadmap to see what we're building.</p>
          </div>
          <Link to="/roadmap" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: 'linear-gradient(135deg, #FFC107, #FFB300)', color: '#000', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
            View Roadmap <ArrowRight size={15} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Roadmap', to: '/roadmap' }, { label: 'Docs', to: '/docs' }, { label: 'Contact', to: '/contact' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
