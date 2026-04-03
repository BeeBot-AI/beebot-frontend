import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { Mail, MessageSquare, Clock, MapPin, ArrowRight, CheckCircle, Send, Headphones, BookOpen } from 'lucide-react';

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
    --radius-md: 14px; --radius-lg: 20px; --radius-xl: 28px;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.12);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .contact-input {
    width: 100%; padding: 13px 16px;
    background: white; border: 2px solid var(--border-strong);
    border-radius: var(--radius-md); font-family: var(--font-body);
    font-size: 0.95rem; color: var(--text-dark); outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .contact-input:focus { border-color: var(--gold-500); box-shadow: 0 0 0 4px rgba(255,193,7,0.12); }
  .contact-input::placeholder { color: var(--text-faint); }
  .contact-label { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; }
  .channel-card {
    background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 1.75rem; display: flex; gap: 1rem; align-items: flex-start;
    transition: all 0.3s ease;
  }
  .channel-card:hover { border-color: var(--gold-400); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .channel-icon { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const channels = [
    {
      icon: Mail,
      bg: 'rgba(255,193,7,0.12)',
      color: '#C9950A',
      title: 'Email Support',
      desc: 'Best for detailed questions, billing inquiries, or anything that needs a thoughtful response.',
      contact: 'help@beebot.ai',
      time: 'Response within 2 business days',
    },
    {
      icon: MessageSquare,
      bg: 'rgba(255,193,7,0.08)',
      color: '#C9950A',
      title: 'Live Chat',
      desc: 'Quick questions? Our team (and BeeBot) are available in-app during business hours.',
      contact: 'Available inside dashboard',
      time: 'Mon–Fri, 9am–6pm PT',
    },
    {
      icon: Headphones,
      bg: 'rgba(255,193,7,0.08)',
      color: '#C9950A',
      title: 'Onboarding Call',
      desc: 'Pro plan subscribers get a free 30-minute onboarding call with our success team.',
      contact: 'Schedule via dashboard',
      time: 'Available for Pro subscribers',
    },
    {
      icon: BookOpen,
      bg: 'rgba(255,193,7,0.08)',
      color: '#C9950A',
      title: 'Documentation',
      desc: 'Most questions are answered in our docs. Check there first for the fastest resolution.',
      contact: 'View Docs',
      contactLink: '/docs',
      time: 'Always available',
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(255,193,7,0.1) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <Mail size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Us</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            We're here to <span style={{ color: '#FFC107' }}>help.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Real humans. Fast responses. No chatbot runaround. (Well, we do use BeeBot internally, but we always follow up personally.)
          </p>
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem 6rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'flex-start' }}>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Send us a message</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>We read every message and respond personally. Typical response time: 2 business days.</p>

            {submitted ? (
              <div style={{ background: 'var(--gold-100)', border: '1px solid #FFECB3', borderRadius: 20, padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #FFC107, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle size={28} color="#000" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Message received!</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  Thanks for reaching out. We'll get back to you at <strong style={{ color: 'var(--text-dark)' }}>{form.email}</strong> within 2 business days.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} style={{ padding: '10px 24px', borderRadius: 999, background: 'var(--black)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label className="contact-label">Full Name *</label>
                    <input className="contact-input" type="text" placeholder="Jane Smith" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="contact-label">Email Address *</label>
                    <input className="contact-input" type="email" placeholder="jane@company.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="contact-label">Subject *</label>
                  <select className="contact-input" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="">Select a topic...</option>
                    <option>General question about BeeBot</option>
                    <option>Technical support / bug report</option>
                    <option>Billing or subscription</option>
                    <option>Partnership or enterprise inquiry</option>
                    <option>Feature request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="contact-label">Message *</label>
                  <textarea className="contact-input" placeholder="Tell us what's on your mind. The more detail you provide, the faster we can help." required rows={6} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: 'vertical', minHeight: 140 }} />
                </div>
                <button type="submit" disabled={loading} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '15px 32px', borderRadius: 999,
                  background: loading ? 'rgba(255,193,7,0.6)' : 'linear-gradient(135deg, #FFC107, #FFB300)',
                  color: '#000', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(255,193,7,0.35)', fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s',
                }}>
                  {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Right side */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Other ways to reach us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {channels.map((ch, i) => (
                <div key={i} className="channel-card">
                  <div className="channel-icon" style={{ background: ch.bg }}>
                    <ch.icon size={20} color={ch.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>{ch.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>{ch.desc}</p>
                    {ch.contactLink ? (
                      <Link to={ch.contactLink} style={{ color: 'var(--gold-rich)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {ch.contact} <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <p style={{ color: 'var(--gold-rich)', fontWeight: 700, fontSize: '0.85rem' }}>{ch.contact}</p>
                    )}
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-faint)', fontSize: '0.78rem', marginTop: '0.3rem' }}><Clock size={11} /> {ch.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Office info */}
            <div style={{ background: 'var(--black)', borderRadius: 20, padding: '1.75rem', color: 'white' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '0.75rem' }}>🏢 Headquarters</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={15} color="#FFC107" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                  BeeBot AI Inc.<br />
                  340 Pine Street, Suite 800<br />
                  San Francisco, CA 94104<br />
                  United States
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }, { label: 'Docs', to: '/docs' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
