import React from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { Shield, Eye, Cookie, Share2, UserCheck, Mail, ArrowLeft } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --black-card: #1A1A1A;
    --text-dark: #1A1200; --text-muted: #5C5032; --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2); --border-strong: rgba(184,134,11,0.4);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .prose h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); }
  .prose h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin: 1.5rem 0 0.5rem; }
  .prose p { color: var(--text-muted); line-height: 1.8; margin-bottom: 1rem; font-size: 0.97rem; }
  .prose ul { padding-left: 1.5rem; margin-bottom: 1rem; }
  .prose li { color: var(--text-muted); line-height: 1.8; margin-bottom: 0.4rem; font-size: 0.97rem; }
  .prose a { color: var(--gold-rich); font-weight: 600; }
`;

const sections = [
  { icon: Eye, title: 'Data We Collect', id: 'collect' },
  { icon: Shield, title: 'How We Use It', id: 'use' },
  { icon: Cookie, title: 'Cookies & Tracking', id: 'cookies' },
  { icon: Share2, title: 'Third-Party Sharing', id: 'sharing' },
  { icon: UserCheck, title: 'Your Rights', id: 'rights' },
  { icon: Mail, title: 'Contact Us', id: 'contact' },
];

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,193,7,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.88rem', marginBottom: '2rem', fontFamily: 'var(--font-body)' }}>
            <ArrowLeft size={14} /> Back to BeeBot
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <Shield size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Privacy Policy</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Your privacy is our <span style={{ color: '#FFC107' }}>priority.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
            We built BeeBot with privacy-first principles. This policy explains exactly what data we collect, how we use it, and how you stay in control.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginTop: '1.5rem' }}>Last updated: April 1, 2026 · Effective: April 1, 2026</p>
        </div>
      </div>

      {/* Quick Nav */}
      <div style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', overflowX: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <s.icon size={12} /> {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem 6rem' }} className="prose">

        <section id="collect">
          <h2>1. Data We Collect</h2>
          <h3>Account Information</h3>
          <p>When you create a BeeBot account, we collect your name, email address, and password (hashed). If you sign up via Google OAuth, we receive your name and email from Google.</p>
          <h3>Business & Knowledge Data</h3>
          <p>You voluntarily upload documents, URLs, and text to create your knowledge base. This content is stored securely in our vector database to power your AI agent. You own this content entirely and can delete it at any time.</p>
          <h3>Usage & Analytics</h3>
          <p>We collect data about how you use the platform — pages visited, features used, and bot interactions. This is used to improve the product, not to sell to third parties.</p>
          <h3>Widget Conversation Data</h3>
          <p>When end-users interact with your embedded BeeBot widget, we store conversation transcripts associated with your account. These are accessible to you in the Conversations dashboard and help you understand user needs.</p>
          <ul>
            <li>User messages and bot responses</li>
            <li>Timestamps and session IDs</li>
            <li>Optional: user-provided email if escalation is triggered</li>
            <li>Browser type and approximate location (country-level only)</li>
          </ul>
        </section>

        <section id="use">
          <h2>2. How We Use Your Data</h2>
          <p>We use collected data exclusively to deliver and improve the BeeBot service:</p>
          <ul>
            <li><strong>Service Delivery:</strong> Processing your knowledge base, generating AI responses, sending email notifications about your account.</li>
            <li><strong>Product Improvement:</strong> Analyzing aggregate usage patterns to improve accuracy, speed, and features. We never use your specific content to train public models.</li>
            <li><strong>Billing:</strong> Processing payments via Stripe. We never store full credit card numbers.</li>
            <li><strong>Security:</strong> Detecting fraud, abuse, and unauthorized access attempts.</li>
            <li><strong>Legal Compliance:</strong> Meeting our legal obligations, responding to lawful requests from authorities.</li>
          </ul>
          <p>We will <strong>never</strong> sell your personal data or the content of your knowledge base to third parties. We do not use your business documents to train generalized AI models.</p>
        </section>

        <section id="cookies">
          <h2>3. Cookies & Tracking</h2>
          <p>We use a minimal set of cookies to operate the platform:</p>
          <h3>Essential Cookies</h3>
          <p>Required for authentication and session management. These cannot be disabled without breaking core functionality. Session cookies expire when you close your browser; persistent auth cookies expire after 30 days or on logout.</p>
          <h3>Analytics Cookies</h3>
          <p>We use PostHog (self-hosted) for product analytics. This is cookieless by default and does not track users across unrelated sites. You can opt out at any time in your account settings under Privacy → Analytics.</p>
          <h3>No Ad Tracking</h3>
          <p>We do not use Facebook Pixel, Google Ads tracking, or any third-party advertising cookies. We do not build advertising profiles from your usage.</p>
        </section>

        <section id="sharing">
          <h2>4. Third-Party Sharing</h2>
          <p>We share data only with the following trusted sub-processors, each bound by strict data processing agreements:</p>
          <ul>
            <li><strong>Stripe</strong> — Payment processing. PCI-DSS Level 1 certified.</li>
            <li><strong>AWS (Amazon Web Services)</strong> — Cloud infrastructure. Data stored in us-east-1 region. SOC 2 Type II certified.</li>
            <li><strong>Anthropic / OpenAI</strong> — AI inference for generating responses. Your uploaded documents are sent as context with each query but are not retained by them for training by default.</li>
            <li><strong>Resend</strong> — Transactional email delivery (account notifications, password resets).</li>
            <li><strong>Cloudflare</strong> — CDN, DDoS protection, and edge routing.</li>
          </ul>
          <p>We do not share data with data brokers, advertising networks, or analytics companies outside of the above list.</p>
        </section>

        <section id="rights">
          <h2>5. Your Rights</h2>
          <p>Under GDPR (EEA/UK users) and CCPA (California users), you have the following rights, all exercisable from your Account Settings or by emailing privacy@beebot.ai:</p>
          <ul>
            <li><strong>Access:</strong> Request a complete export of all data we hold about you.</li>
            <li><strong>Rectification:</strong> Correct inaccurate personal information at any time via Account Settings.</li>
            <li><strong>Erasure:</strong> Delete your account and all associated data. Knowledge base files, conversation history, and your profile are permanently deleted within 30 days.</li>
            <li><strong>Portability:</strong> Export your data in JSON format at any time.</li>
            <li><strong>Objection:</strong> Object to processing for marketing purposes at any time.</li>
            <li><strong>Restriction:</strong> Request we limit processing of your data in certain circumstances.</li>
          </ul>
          <p>We will respond to all privacy requests within 30 days. For EEA users, if you're unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.</p>
        </section>

        <section id="contact">
          <h2>6. Contact Us</h2>
          <p>For any privacy-related concerns, requests, or questions, please reach out:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@beebot.ai">privacy@beebot.ai</a></li>
            <li><strong>Response time:</strong> Within 2 business days for general inquiries, within 30 days for formal requests</li>
            <li><strong>Data Controller:</strong> BeeBot AI Inc., 340 Pine Street, Suite 800, San Francisco, CA 94104</li>
          </ul>
          <p>We take every privacy inquiry seriously. If you believe we've made an error or have a concern that wasn't resolved, please don't hesitate to escalate.</p>
        </section>

      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Terms', to: '/terms' }, { label: 'Contact', to: '/contact' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
