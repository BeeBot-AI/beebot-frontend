import React from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { FileText, ArrowLeft, Scale, CreditCard, Ban, BookOpen, AlertTriangle, Globe } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --text-dark: #1A1200; --text-muted: #5C5032;
    --border: rgba(184,134,11,0.2);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .prose h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); }
  .prose h3 { font-size: 1.05rem; font-weight: 700; color: var(--text-dark); margin: 1.5rem 0 0.5rem; }
  .prose p { color: var(--text-muted); line-height: 1.8; margin-bottom: 1rem; font-size: 0.97rem; }
  .prose ul { padding-left: 1.5rem; margin-bottom: 1rem; }
  .prose li { color: var(--text-muted); line-height: 1.8; margin-bottom: 0.4rem; font-size: 0.97rem; }
  .prose strong { color: var(--text-dark); }
  .prose a { color: var(--gold-rich); font-weight: 600; }
`;

const toc = [
  { icon: FileText, label: 'Acceptance', id: 'acceptance' },
  { icon: BookOpen, label: 'Acceptable Use', id: 'use' },
  { icon: CreditCard, label: 'Payment & Billing', id: 'payment' },
  { icon: Scale, label: 'Refund Policy', id: 'refund' },
  { icon: Globe, label: 'Intellectual Property', id: 'ip' },
  { icon: AlertTriangle, label: 'Limitation of Liability', id: 'liability' },
  { icon: Ban, label: 'Termination', id: 'termination' },
  { icon: Scale, label: 'Governing Law', id: 'law' },
];

export default function TermsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,193,7,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.88rem', marginBottom: '2rem', fontFamily: 'var(--font-body)' }}>
            <ArrowLeft size={14} /> Back to BeeBot
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <FileText size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Terms of Service</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Simple, <span style={{ color: '#FFC107' }}>honest</span> terms.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
            We've written these terms in plain English so you can actually understand what you're agreeing to. If you have questions, email us at legal@beebot.ai.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginTop: '1.5rem' }}>Last updated: April 1, 2026 · Effective for all accounts</p>
        </div>
      </div>

      {/* Quick Nav */}
      <div style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', overflowX: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {toc.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <s.icon size={12} /> {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem 6rem' }} className="prose">

        <p style={{ background: 'var(--gold-100)', border: '1px solid #FFECB3', borderRadius: 12, padding: '1rem 1.25rem', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-dark)' }}>
          <strong>TL;DR:</strong> Use BeeBot to build legitimate AI-powered customer support for your business. Don't abuse the platform, pay your bills, and we'll both be happy. You own your content. We own our platform.
        </p>

        <section id="acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>By creating a BeeBot account or using our services, you agree to these Terms of Service ("Terms") and our Privacy Policy. If you're signing up on behalf of a business, you represent that you have authority to bind that business to these Terms.</p>
          <p>We may update these Terms from time to time. We'll notify you by email and in-app banner at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.</p>
        </section>

        <section id="use">
          <h2>2. Acceptable Use</h2>
          <p>You may use BeeBot to build AI-powered customer support agents for legitimate business purposes. The following activities are strictly prohibited:</p>
          <ul>
            <li>Uploading content you don't have rights to (copyrighted material without license)</li>
            <li>Deploying BeeBot to deceive users into thinking they're interacting with a human when they're not</li>
            <li>Using the platform to spread misinformation, hate speech, or illegal content</li>
            <li>Attempting to reverse-engineer, scrape, or systematically extract our AI models or infrastructure</li>
            <li>Reselling BeeBot API access without a formal partner agreement</li>
            <li>Using the platform for any activity that violates applicable law</li>
          </ul>
          <p>We reserve the right to suspend accounts that violate these terms without prior notice if the violation is severe (e.g., illegal activity). For lesser violations, we'll warn you first and give you 48 hours to remedy.</p>
        </section>

        <section id="payment">
          <h2>3. Payment & Billing</h2>
          <h3>Free Plan</h3>
          <p>The Starter plan is free forever with the limits described on our pricing page (500 messages/month, 1 widget, 10 document uploads). No credit card required.</p>
          <h3>Pro Plan — $49/month</h3>
          <p>Billed monthly in advance. By providing payment details, you authorize us to charge your card on the same day each month. Prices are in USD and exclude applicable taxes (VAT, GST, etc.).</p>
          <h3>Failed Payments</h3>
          <p>If a payment fails, we'll retry 3 times over 7 days. If all retries fail, your account will be downgraded to the Free plan. Your data and settings are preserved for 90 days to allow you to resubscribe.</p>
          <h3>Price Changes</h3>
          <p>We'll give 30 days notice before any price changes. Existing subscribers are grandfathered at their current rate for the remainder of their billing cycle.</p>
        </section>

        <section id="refund">
          <h2>4. Refund Policy</h2>
          <p>We offer a <strong>14-day money-back guarantee</strong> on your first Pro subscription. If you're not satisfied for any reason within 14 days of your first payment, email billing@beebot.ai and we'll issue a full refund, no questions asked.</p>
          <p>After 14 days, we do not offer refunds for partial months or unused time. If you cancel mid-cycle, you retain access until the end of the paid period.</p>
          <h3>Annual Plans (if applicable)</h3>
          <p>Annual plan refunds are available within 30 days of payment. After 30 days, we'll issue a prorated refund for unused months at our discretion.</p>
        </section>

        <section id="ip">
          <h2>5. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>You own all content you upload to BeeBot — your PDFs, documents, website URLs, and conversation data. You grant us a limited, non-exclusive license to process and store this content solely to provide the BeeBot service to you. This license ends when you delete your content or account.</p>
          <h3>Our Platform</h3>
          <p>BeeBot's platform, codebase, AI infrastructure, brand, and documentation are owned by BeeBot AI Inc. and protected by intellectual property laws. You may not copy, modify, or distribute our software without explicit written permission.</p>
          <h3>Feedback</h3>
          <p>If you provide feedback, suggestions, or bug reports, you grant us the right to use that feedback to improve our products without compensation or attribution.</p>
        </section>

        <section id="liability">
          <h2>6. Limitation of Liability</h2>
          <p>BeeBot provides the service "as is" and "as available." We make no warranties, express or implied, regarding uptime, accuracy, or fitness for a particular purpose.</p>
          <p>To the maximum extent permitted by law, BeeBot's total liability to you for any claims arising from these Terms or your use of the service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          <p>We are not liable for indirect, incidental, special, or consequential damages including loss of profits, data, or business opportunities, even if we were advised of the possibility of such damages.</p>
          <p><strong>Important:</strong> BeeBot is an AI tool. While we strive for high accuracy, AI responses can be incorrect. You are responsible for monitoring your bot's responses and not relying solely on AI output for decisions with significant consequences.</p>
        </section>

        <section id="termination">
          <h2>7. Termination</h2>
          <p>You may cancel your account at any time from Settings → Billing → Cancel Subscription. Your data is retained for 90 days post-cancellation in case you wish to reactivate.</p>
          <p>We may suspend or terminate accounts that violate these Terms. We'll provide advance notice except in cases of severe violations, security threats, or legal requirements.</p>
          <p>Upon termination, your right to use BeeBot ceases immediately. We will delete your data within 30 days of account termination (or 90 days if you requested temporary suspension).</p>
        </section>

        <section id="law">
          <h2>8. Governing Law & Disputes</h2>
          <p>These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles.</p>
          <p>For any disputes, we encourage you to contact us first at legal@beebot.ai. We aim to resolve all disputes within 30 days through good-faith negotiation.</p>
          <p>If we can't resolve a dispute informally, disputes will be resolved through binding arbitration under JAMS rules, except that either party may bring claims in small claims court if they qualify.</p>
          <p><strong>Questions?</strong> Email us at <a href="mailto:legal@beebot.ai">legal@beebot.ai</a> — we're happy to explain anything in plain language.</p>
        </section>

      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Privacy', to: '/privacy' }, { label: 'Contact', to: '/contact' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
