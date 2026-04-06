import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SharedNav from './SharedNav';
import {
  Bot, ArrowRight, ShieldCheck, Zap,
  Code, Database, Settings, FileText,
  HelpCircle, CheckCircle, User, Star, Upload, Cpu, Play,
  ChevronDown
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Golden × Black × Cream
═══════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-700: #E65100; --gold-deep: #B8860B; --gold-rich: #C9950A;
    --cream: #FDFAF2; --cream-2: #F5F0E0; --cream-3: #EDE8D5;
    --black: #0A0A0A; --black-soft: #111111; --black-card: #1A1A1A; --black-mid: #2A2A2A;
    --text-dark: #1A1200; --text-muted-dark: #5C5032; --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2); --border-strong: rgba(184,134,11,0.4);
    --shadow-gold: 0 8px 32px rgba(201,149,10,0.25); --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.12); --shadow-lg: 0 24px 64px rgba(0,0,0,0.18);
    --radius-sm: 8px; --radius-md: 14px; --radius-lg: 20px; --radius-xl: 28px; --radius-pill: 999px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --dur: 0.35s; --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  /* ── Typography ── */
  .display { font-family: var(--font-display); font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
  .headline { font-family: var(--font-display); font-weight: 800; line-height: 1.1; }
  .mono { font-family: var(--font-mono); }
  .text-gold { color: var(--gold-rich); } .text-cream { color: var(--cream); }
  .text-muted { color: var(--text-muted-dark); } .text-faint { color: var(--text-faint); }
  .text-center { text-align: center; } .italic { font-style: italic; }

  /* ── Layout ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
  .flex { display: flex; } .flex-col { flex-direction: column; }
  .items-center { align-items: center; } .items-start { align-items: flex-start; }
  .justify-center { justify-content: center; } .justify-between { justify-content: space-between; }
  .gap-2{gap:0.5rem}.gap-3{gap:0.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}
  .mb-2{margin-bottom:0.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}
  .mb-8{margin-bottom:2rem}.mb-12{margin-bottom:3rem}.mb-16{margin-bottom:4rem}
  .relative{position:relative}.z-10{z-index:10}.w-full{width:100%}.inline-block{display:inline-block}
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 4rem; align-items: center; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--font-body); font-weight: 700; font-size: 1rem; cursor: pointer; border: none; outline: none; transition: all var(--dur) var(--ease); min-height: 44px; }
  .btn-gold { background: linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%); color: var(--black); padding: 14px 32px; border-radius: var(--radius-pill); box-shadow: 0 4px 20px rgba(255,193,7,0.4), inset 0 1px 0 rgba(255,255,255,0.3); position: relative; overflow: hidden; }
  .btn-gold::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2)); opacity: 0; transition: opacity 0.3s; }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,193,7,0.5); }
  .btn-gold:hover::after { opacity: 1; }
  .btn-outline { background: transparent; color: var(--text-dark); padding: 13px 28px; border-radius: var(--radius-pill); border: 2px solid var(--border-strong); font-weight: 600; }
  .btn-outline:hover { border-color: var(--gold-500); color: var(--gold-rich); transform: translateY(-1px); }
  .btn-white { background: white; color: var(--black); padding: 14px 32px; border-radius: var(--radius-pill); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
  .btn-ghost-white { background: rgba(255,255,255,0.1); color: white; padding: 13px 28px; border-radius: var(--radius-pill); border: 2px solid rgba(255,255,255,0.3); font-weight: 600; backdrop-filter: blur(8px); }
  .btn-ghost-white:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }

  /* ── Badges ── */
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .badge-gold { background: var(--gold-200); color: var(--text-dark); border: 1px solid var(--gold-400); }
  .badge-dark { background: var(--black-mid); color: var(--gold-300); border: 1px solid rgba(255,193,7,0.3); }
  .badge-cream { background: var(--cream); color: var(--text-dark); border: 1px solid var(--border); }

  /* ── Cards ── */
  .card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
  .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .card-dark { background: var(--black-card); border-radius: var(--radius-xl); border: 1px solid rgba(255,193,7,0.15); }

  /* ── Nav ── */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease; padding: 0 2rem; background: transparent; }
  .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 72px; }
  .nav.scrolled { background: rgba(253,250,242,0.82); backdrop-filter: blur(10px) saturate(150%); -webkit-backdrop-filter: blur(10px) saturate(150%); border-bottom: 1px solid rgba(184,134,11,0.15); box-shadow: 0 1px 16px rgba(0,0,0,0.05); }
  .nav-link { color: var(--text-muted-dark); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; position: relative; }
  .nav-link::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 0; height: 2px; background: var(--gold-500); transition: width 0.25s var(--ease); }
  .nav-link:hover { color: var(--text-dark); }
  .nav-link:hover::after { width: 100%; }

  /* ── Hamburger + Mobile Menu ── */
  .hamburger-btn { display: none; width: 44px; height: 44px; background: none; border: none; cursor: pointer; align-items: center; justify-content: center; color: var(--gold-rich); border-radius: var(--radius-sm); transition: background 0.2s; flex-shrink: 0; }
  .hamburger-btn:hover { background: var(--gold-100); }
  .mobile-menu {
    position: fixed; top: 72px; left: 0; right: 0; z-index: 99;
    background: rgba(253,250,242,0.99); backdrop-filter: blur(24px);
    border-bottom: 2px solid var(--border-strong);
    padding: 1.5rem 1.5rem 2rem;
    display: flex; flex-direction: column;
    transform: translateY(-110%); opacity: 0;
    transition: transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12); pointer-events: none;
  }
  .mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: all; }
  .mobile-nav-link { display: flex; align-items: center; padding: 14px 4px; font-size: 1.05rem; font-weight: 600; color: var(--text-dark); text-decoration: none; border-bottom: 1px solid var(--border); min-height: 52px; transition: color 0.2s; }
  .mobile-nav-link:hover { color: var(--gold-rich); }
  .mobile-nav-link:last-of-type { border-bottom: none; }
  .mobile-cta-col { display: flex; flex-direction: column; gap: 10px; margin-top: 1.25rem; }
  .mobile-cta-col .btn { width: 100%; border-radius: var(--radius-lg) !important; font-size: 1rem !important; }

  /* ── Logo ── */
  .logo-mark { width: 40px; height: 40px; background: linear-gradient(135deg, var(--gold-500) 0%, var(--gold-700) 100%); border-radius: 11px; display: flex; align-items: center; justify-content: center; color: var(--black); transform: rotate(-5deg); box-shadow: 0 4px 12px rgba(255,193,7,0.4); flex-shrink: 0; overflow: hidden; }
  .logo-img { width: 100%; height: 100%; object-fit: cover; border-radius: 11px; }

  /* ── Input ── */
  .input { width: 100%; padding: 12px 16px; background: var(--cream-2); border: 2px solid var(--border-strong); border-radius: var(--radius-md); font-family: var(--font-body); font-size: 0.95rem; color: var(--text-dark); outline: none; transition: border-color 0.25s; }
  .input:focus { border-color: var(--gold-500); }
  .label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted-dark); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block; }

  /* ── Dividers ── */
  .section-divider { width: 60px; height: 4px; background: linear-gradient(90deg, var(--gold-500), var(--gold-300)); border-radius: 2px; }

  /* ── Scroll animations ── */
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-d1 { transition-delay: 0.1s; } .reveal-d2 { transition-delay: 0.2s; }
  .reveal-d3 { transition-delay: 0.35s; } .reveal-d4 { transition-delay: 0.5s; }

  /* ── Float animations ── */
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
  @keyframes floatSlow { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulseGlow { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.05); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
  @keyframes panelIn { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes stepProgressFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .float { animation: float 4s ease-in-out infinite; }
  .float-2 { animation: float2 5s ease-in-out infinite; }
  .float-slow { animation: floatSlow 6s ease-in-out infinite; }
  .spin-slow { animation: spinSlow 20s linear infinite; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .fade-slide { animation: fadeSlideIn 0.5s var(--ease) both; }
  .panel-in { animation: panelIn 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }

  /* ── Section Styles ── */
  section { position: relative; overflow: hidden; }
  .section-dark { background: var(--black); color: white; }
  .section-cream { background: var(--cream); }
  .section-cream2 { background: var(--cream-2); }

  /* ── Hero Grid ── */
  .hero-grid { display: grid; grid-template-columns: 1fr minmax(300px, 480px); gap: 5rem; align-items: center; }

  /* ── How It Works Grid ── */
  .hiw-grid { display: grid; grid-template-columns: minmax(280px, 400px) 1fr; gap: 4rem; align-items: center; }

  /* ── Step Cards ── */
  .step-card { display: flex; gap: 18px; align-items: flex-start; padding: 1.25rem 1.5rem; border-radius: var(--radius-lg); cursor: pointer; border: 2px solid transparent; transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative; overflow: hidden; min-height: 44px; }
  .step-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,193,7,0.18); }
  .step-card.active { background: white; border-color: var(--gold-400); box-shadow: 0 8px 32px rgba(255,193,7,0.22), 0 0 0 1px rgba(255,193,7,0.12); }
  .step-progress-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold-400), var(--gold-600)); transform-origin: left; border-radius: 2px; animation: stepProgressFill 3.5s linear forwards; }
  .step-icon { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); border: 2px solid rgba(255,255,255,0.12); transition: all 0.3s; }
  .step-card.active .step-icon { background: linear-gradient(135deg, var(--gold-500), var(--gold-600)); color: var(--black); border-color: var(--gold-700); box-shadow: 0 4px 16px rgba(255,193,7,0.4); }
  .step-num { position: absolute; right: 1rem; top: 0.75rem; font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: rgba(255,255,255,0.05); line-height: 1; user-select: none; transition: color 0.3s; }
  .step-card.active .step-num { color: rgba(201,149,10,0.12); }

  /* ── FAQ Accordion ── */
  .faq-item { background: var(--black-card); border-radius: var(--radius-lg); border: 1px solid rgba(255,193,7,0.1); overflow: hidden; transition: all 0.3s var(--ease); }
  .faq-item:hover { border-color: rgba(255,193,7,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.3); transform: translateY(-1px); }
  .faq-item.faq-open { border-color: rgba(255,193,7,0.45); box-shadow: 0 8px 40px rgba(255,193,7,0.12); }
  .faq-trigger { width: 100%; background: none; border: none; outline: none; padding: 1.4rem 1.5rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; text-align: left; font-family: var(--font-body); min-height: 72px; }
  .faq-icon-ring { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s; }
  .faq-item.faq-open .faq-icon-ring { background: linear-gradient(135deg, var(--gold-500), var(--gold-600)); border-color: var(--gold-700); color: var(--black); }
  .faq-body { overflow: hidden; max-height: 0; opacity: 0; transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease; }
  .faq-body.open { max-height: 400px; opacity: 1; }
  .faq-chevron { transition: transform 0.35s var(--ease); flex-shrink: 0; }
  .faq-item.faq-open .faq-chevron { transform: rotate(180deg); }
  .faq-cat-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .faq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1rem; }

  /* ── Feature List ── */
  .check-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 1.25rem; }
  .check-circle { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--gold-400), var(--gold-600)); display: flex; align-items: center; justify-content: center; color: var(--black); margin-top: 2px; }

  /* ── Pricing ── */
  .price-grid { display: grid; grid-template-columns: minmax(280px, 400px) minmax(280px, 440px); justify-content: center; gap: 2rem; align-items: center; }
  .price-card { padding: 2.5rem 2rem; height: 100%; display: flex; flex-direction: column; }
  .price-amount { font-family: var(--font-display); font-size: clamp(3rem, 6vw, 4rem); font-weight: 900; line-height: 1; }
  .price-feature { display: flex; align-items: center; gap: 12px; padding: 0.65rem 0; border-bottom: 1px solid var(--border); font-size: 0.93rem; }
  .price-feature-dark { display: flex; align-items: center; gap: 12px; padding: 0.65rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.93rem; }

  /* ── Stats Grid ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3rem; text-align: center; }

  /* ── Testimonials Grid ── */
  .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: start; }

  /* ── Footer Grid ── */
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; margin-bottom: 4.5rem; }

  /* ── Chat Bubble ── */
  .chat-bubble-left { background: var(--cream-2); padding: 12px 16px; border-radius: 18px 18px 18px 4px; font-size: 0.85rem; max-width: 82%; align-self: flex-start; line-height: 1.5; color: var(--text-dark); border: 1px solid var(--border); }
  .chat-bubble-right { background: linear-gradient(135deg, var(--gold-500), var(--gold-600)); padding: 12px 16px; border-radius: 18px 18px 4px 18px; font-size: 0.85rem; max-width: 82%; align-self: flex-end; color: var(--black); font-weight: 600; line-height: 1.5; box-shadow: 0 4px 14px rgba(255,193,7,0.35); }
  .chat-avatar { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--gold-300), var(--gold-500)); display: flex; align-items: center; justify-content: center; color: var(--black); }

  /* ── Stat Number ── */
  .stat-num { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 4rem); font-weight: 900; letter-spacing: -0.03em; line-height: 1; }

  /* ── Ornamental lines ── */
  .gold-line { height: 1px; background: linear-gradient(90deg, transparent, var(--gold-500), transparent); }

  /* ── Noise overlay ── */
  .noise { position: absolute; inset: 0; opacity: 0.035; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size: 128px; }

  /* ── Ticker ── */
  .marquee-track { display: flex; gap: 3rem; animation: marquee 22s linear infinite; white-space: nowrap; }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── Footer Links ── */
  .footer-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.93rem; transition: color 0.2s; display: block; padding: 3px 0; }
  .footer-link:hover { color: rgba(255,255,255,0.9); }

  /* ── Code Block ── */
  .code-block { background: #0D0D0D; padding: 1.25rem 1.5rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.8rem; color: #E8E8E8; line-height: 1.8; border: 1px solid rgba(255,193,7,0.2); overflow-x: auto; }
  .code-kw { color: var(--gold-400); } .code-str { color: #7EFFA0; } .code-cmt { color: #6B6B6B; font-style: italic; }

  /* ── Phone Mockup ── */
  .phone { width: 250px; height: 500px; background: var(--black); border-radius: 36px; border: 5px solid #2A2A2A; box-shadow: 0 40px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08); position: relative; overflow: hidden; }
  .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 90px; height: 26px; background: var(--black); border-radius: 0 0 18px 18px; z-index: 10; border-bottom: 1px solid #2A2A2A; }
  .phone-screen { position: absolute; inset: 0; padding: 36px 11px 11px; display: flex; flex-direction: column; gap: 9px; background: var(--cream); }

  /* ── Misc ── */
  .quote-mark { font-family: Georgia, serif; font-size: 80px; line-height: 1; position: absolute; opacity: 0.08; user-select: none; }
  .section-num { font-family: var(--font-display); font-size: 8rem; font-weight: 900; position: absolute; opacity: 0.04; user-select: none; line-height: 1; }
  .tag-deco { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: var(--radius-pill); background: var(--cream-2); border: 1px solid var(--border-strong); font-size: 0.85rem; font-weight: 600; color: var(--text-muted-dark); }

  /* ══════════════════════════════════════════
     RESPONSIVE — Tablet (≤1024px)
  ══════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
    .hiw-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
    .footer-brand { grid-column: 1 / -1; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
    .price-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
    .pro-card { transform: none !important; }
  }

  /* ══════════════════════════════════════════
     RESPONSIVE — Mobile (≤768px)
  ══════════════════════════════════════════ */
  @media (max-width: 768px) {
    /* Nav */
    .hamburger-btn { display: flex; }
    .nav-desktop-links { display: none !important; }
    .nav-desktop-btns { display: none !important; }
    .nav-inner { height: 64px; }
    .nav { padding: 0 1.25rem; }
    .mobile-menu { top: 64px; }

    /* General */
    .container { padding: 0 1.25rem; }
    section { padding-top: 4.5rem !important; padding-bottom: 4.5rem !important; }

    /* Hero */
    .hero-section { padding-top: 100px !important; padding-bottom: 60px !important; }
    .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .hero-phone-wrap { order: 2; display: flex; justify-content: center; }
    .hero-text { order: 1; }
    .hero-btns { flex-direction: column !important; align-items: stretch !important; width: 100%; }
    .hero-btns .btn { width: 100%; justify-content: center; }
    .hero-stats { flex-wrap: wrap; gap: 10px !important; }
    .phone { width: 220px; height: 440px; }

    /* Sections grid */
    .hero-grid { grid-template-columns: 1fr !important; }
    .hiw-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .grid-2 { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
    .testi-grid { grid-template-columns: 1fr !important; }
    .testi-offset { margin-top: 0 !important; }
    .price-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
    .pro-card { transform: none !important; }
    .faq-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .footer-brand { grid-column: 1 !important; }

    /* Typography scaling */
    .display { letter-spacing: -0.01em; }
    .price-card { padding: 2rem 1.5rem !important; }
    .price-amount { font-size: 3rem !important; }
    .section-num { display: none; }
    .quote-mark { font-size: 60px; }

    /* CTA buttons */
    .cta-btn-row { flex-direction: column !important; align-items: center !important; }
    .cta-btn-row .btn { width: 100%; max-width: 360px; justify-content: center; }

    /* How It Works panel */
    .hiw-panel-wrap { min-height: auto !important; }

    /* Features section */
    .feature-grid-rev .reveal[style*='order: 2'] { order: 0 !important; }
    .feature-grid-rev .reveal[style*='order: 1'] { order: 1 !important; }

    /* FAQ trigger */
    .faq-trigger { padding: 1.1rem 1.25rem; }
    .faq-icon-ring { width: 38px; height: 38px; }

    /* Footer newsletter */
    .footer-newsletter-row { flex-direction: column; }
    .footer-newsletter-row input { width: 100%; }
    .footer-newsletter-row button { width: 100%; padding: 12px; }

    /* Footer bottom bar */
    .footer-bottom { flex-direction: column; align-items: flex-start !important; gap: 1rem !important; }
  }

  /* ══════════════════════════════════════════
     RESPONSIVE — Small Mobile (≤480px)
  ══════════════════════════════════════════ */
  @media (max-width: 480px) {
    .container { padding: 0 1rem; }
    .nav { padding: 0 1rem; }
    .stats-grid { grid-template-columns: 1fr !important; }
    .hero-social-proof { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
    .badge { font-size: 0.72rem; padding: 4px 10px; }
    .step-card { padding: 1rem 1.1rem; }
    .step-icon { width: 40px; height: 40px; }
    .faq-trigger { gap: 0.75rem; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   SVG DECORATIONS
═══════════════════════════════════════════════════════════ */
const HoneycombBg = ({ id = 'hc1', opacity = 0.08 }) => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Pointy-top hex: circumradius=24, half-width=21, col-spacing=42, row-spacing=36 */}
      <pattern id={id} x="0" y="0" width="42" height="72" patternUnits="userSpaceOnUse" overflow="visible">
        <polygon points="21,0 42,12 42,36 21,48 0,36 0,12"     fill="rgba(255,193,7,0.04)" stroke="#FFC107" strokeWidth="0.9" strokeLinejoin="round"/>
        <polygon points="0,36 21,48 21,72 0,84 -21,72 -21,48"  fill="rgba(255,193,7,0.04)" stroke="#FFC107" strokeWidth="0.9" strokeLinejoin="round"/>
        <polygon points="42,36 63,48 63,72 42,84 21,72 21,48"  fill="rgba(255,193,7,0.04)" stroke="#FFC107" strokeWidth="0.9" strokeLinejoin="round"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`}/>
  </svg>
);

const DiagonalLines = ({ color = 'var(--gold-500)', opacity = 0.08 }) => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="diag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="20" stroke={color} strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag)" />
  </svg>
);


const WaveDivider = ({ fill = '#FDFAF2', flip = false }) => (
  <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden' }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 64, transform: flip ? 'scaleY(-1)' : 'none' }} xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  </div>
);


const SparkSVG = ({ size = 24, color = 'var(--gold-500)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" fill={color} stroke={color} strokeWidth="0.5" strokeLinejoin="round" />
    <path d="M19 2 L19.7 5.3 L23 6 L19.7 6.7 L19 10 L18.3 6.7 L15 6 L18.3 5.3 Z" fill={color} opacity="0.6" />
  </svg>
);

const HandDrawnArrow = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,65 Q20,30 55,20" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M45,14 L57,20 L48,28" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const GoldUnderline = ({ width = '100%' }) => (
  <svg height="10" style={{ width, display: 'block' }} viewBox="0 0 200 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2,6 Q50,2 100,5 Q150,8 198,4" stroke="var(--gold-500)" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function LandingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isHoveringSteps, setIsHoveringSteps] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const autoAdvanceRef = useRef(null);

  const navTo = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleCTA = () => navTo(isAuthenticated ? '/dashboard' : '/auth');

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && (e.target.classList.add('visible'), obs.unobserve(e.target))),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!isHoveringSteps) {
      autoAdvanceRef.current = setInterval(() => {
        setActiveStep(prev => prev === 4 ? 1 : prev + 1);
      }, 3500);
    }
    return () => clearInterval(autoAdvanceRef.current);
  }, [isHoveringSteps]);

  const steps = [
    { id: 1, icon: <Upload size={20} />, num: '01', title: 'Upload Your Knowledge', desc: 'Add documents, paste URLs, or drop text files — BeeBot indexes them instantly.' },
    { id: 2, icon: <Settings size={20} />, num: '02', title: 'Configure Your Agent', desc: 'Set a name, tone, and brand language in seconds — no prompts needed.' },
    { id: 3, icon: <Code size={20} />, num: '03', title: 'Copy the Embed Script', desc: 'One line of JavaScript. Works on any website, platform, or app.' },
    { id: 4, icon: <Zap size={20} />, num: '04', title: 'Go Live Instantly', desc: 'Your AI agent starts answering real customer questions right away, 24/7.' },
  ];

  const faqs = [
    { q: 'Do I need to know how to code?', a: 'Not at all. Copy one line of JavaScript into your website — WordPress, Webflow, Shopify, Squarespace, or any custom site — and you\'re live in under 5 minutes.' },
    { q: 'What exactly counts as a "resolution"?', a: 'A resolution is a conversation where the customer explicitly clicks "Yes, resolved ✓" in the widget prompt after BeeBot answers. If they click "No, I need more help", skip the prompt, or close the window — no charge. You only pay for confirmed, successful resolutions.' },
    { q: 'What happens if a customer doesn\'t click anything?', a: 'Nothing is billed. Resolutions are only logged when the customer actively confirms. Unresponded-to conversations, timed-out sessions, and error states are never counted as resolutions.' },
    { q: 'How accurate is BeeBot?', a: 'BeeBot uses strict RAG (Retrieval-Augmented Generation) — it only answers from content you uploaded and refuses questions outside its knowledge base, which eliminates hallucinations entirely. Customers report a 98% accuracy rate in independent testing.' },
    { q: 'What happens when a question is too complex?', a: 'BeeBot detects frustration and out-of-scope queries automatically. When triggered, it collects the customer\'s contact info and forwards the full conversation transcript to your support inbox or helpdesk within seconds.' },
    { q: 'What file types can I upload?', a: 'BeeBot supports PDFs, Word documents (.docx), plain text (.txt), Markdown (.md), and public web URLs. You can also paste text directly — perfect for FAQs, policy docs, or knowledge articles. Free plan: up to 3 documents. Paid: up to 50.' },
    { q: 'Is my business data secure?', a: 'Your documents are stored in isolated, encrypted vector databases — never shared with other customers. We are SOC 2 Type II certified, GDPR compliant, and use AES-256 encryption at rest. We never use your content to train public AI models.' },
    { q: 'Can I cap my monthly spend?', a: 'Yes. You can set a monthly resolution cap in your dashboard. Once reached, BeeBot continues to answer but stops tracking new billable resolutions until the next billing period — so you always stay in control.' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <SharedNav />

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <header className="hero-section" style={{ paddingTop: 100, paddingBottom: 180, background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div className="float-slow" style={{ position: 'absolute', top: '5%', right: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,193,7,0.14) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70%', filter: 'blur(20px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,213,79,0.12) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-grid">
            {/* Text — order: 1 on mobile */}
            <div className="hero-text">
              <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                <SparkSVG size={16} />
                <span className="tag-deco">Deploy in under 5 minutes · No code required</span>
                <SparkSVG size={16} />
              </div>

              <h1 className="reveal reveal-d1 display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
                AI Customer Support
              </h1>
              <h1 className="reveal reveal-d1 display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
                for{' '}
                <span style={{ color: 'var(--gold-rich)', position: 'relative', display: 'inline-block' }}>
                  Any Business.
                  <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0 }}><GoldUnderline /></div>
                </span>
              </h1>

              <p className="reveal reveal-d2" style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-muted-dark)', lineHeight: 1.7, maxWidth: 520, marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                BeeBot reads your product docs, help articles, and knowledge base — then instantly becomes an expert that answers your customers' questions 24/7. No prompt engineering. No developers. Just results.
              </p>

              <div className="reveal reveal-d3 flex gap-4 hero-btns" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-gold" style={{ padding: '15px 32px', fontSize: '1.05rem', position: 'relative' }} onClick={handleCTA}>
                  Get Started Free <ArrowRight size={18} />
                  <span className="nav-desktop-links" style={{ position: 'absolute', top: '-38px', right: '-80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <HandDrawnArrow size={50} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold-rich)', fontStyle: 'italic', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', marginTop: -8, marginLeft: 28 }}>free forever plan</span>
                  </span>
                </button>
                <button className="btn btn-outline" style={{ padding: '15px 26px', fontSize: '1.05rem' }}
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Play size={16} /> See how it works
                </button>
              </div>

            </div>

            {/* Phone Mockup — order: 2 on mobile */}
            <div className="reveal reveal-d2 float hero-phone-wrap" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(ellipse, rgba(255,193,7,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />

              <div className="phone" style={{ transform: 'rotate(2deg)', zIndex: 10 }}>
                <div className="phone-notch" />
                <div className="phone-screen">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 7px', background: 'var(--gold-100)', borderRadius: 9, marginBottom: 3, border: '1px solid var(--border)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD54F,#FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={12} color="#000" /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#111' }}>BeeBot Support</div>
                      <div style={{ fontSize: '0.56rem', color: '#6B8E23', display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }} />Online · Always available</div>
                    </div>
                  </div>

                  {/* Universal e-commerce / SaaS support convo */}
                  <div className="chat-bubble-left" style={{ fontSize: '0.72rem' }}>Hi! I'm BeeBot 🐝. Ask me anything about our products or services!</div>
                  <div className="chat-bubble-right" style={{ fontSize: '0.72rem' }}>What's your return policy?</div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={11} /></div>
                    <div className="chat-bubble-left" style={{ fontSize: '0.72rem' }}>We offer free returns within 30 days. No questions asked! 😊</div>
                  </div>
                  <div className="chat-bubble-right" style={{ fontSize: '0.72rem' }}>How do I track my order?</div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={11} /></div>
                    <div className="chat-bubble-left" style={{ fontSize: '0.72rem' }}>Check your email for a tracking link, or visit your account → Orders.</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', background: 'white', borderRadius: 18, padding: '5px 10px', border: '1px solid var(--border)', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: '0.65rem', color: '#A0A0A0', flex: 1 }}>Ask anything...</span>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={10} color="black" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════
          SOCIAL PROOF TICKER
      ════════════════════════════════ */}
      <div style={{ background: 'var(--black)', padding: '1rem 0', borderTop: '1px solid rgba(255,193,7,0.15)', borderBottom: '1px solid rgba(255,193,7,0.15)', overflow: 'hidden' }}>
        <div className="marquee-track">
          {['Instant AI-powered responses','Deploy in under 5 minutes','Works for any industry','No complex setup needed','Live 24/7 without downtime','Understands real customer intent','Continuously self-improving','Scales with your business']
            .concat(['Instant AI-powered responses','Deploy in under 5 minutes','Works for any industry','No complex setup needed','Live 24/7 without downtime','Understands real customer intent','Continuously self-improving','Scales with your business'])
            .map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', fontWeight: 600 }}>
                <SparkSVG size={13} /> {item}
              </span>
            ))}
        </div>
      </div>


      {/* ════════════════════════════════
          PROBLEM → SOLUTION
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--cream)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: 'var(--cream-2)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            <div className="reveal">
              <div className="badge badge-dark mb-6" style={{ transform: 'rotate(-2deg)', display: 'inline-flex' }}>😤 The Problem</div>
              <h2 className="headline" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--text-dark)', marginBottom: '2rem', lineHeight: 1.15 }}>
                Customer support is drowning your team.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: <HelpCircle size={22} color="var(--text-faint)" />, text: '"Where\'s my refund?" "How does this work?" — your team spends hours answering the same questions, every single day.' },
                  { icon: <ShieldCheck size={22} color="var(--text-faint)" />, text: 'Hiring and training a 24/7 support team is expensive and doesn\'t scale. Quality suffers as your business grows.' },
                  { icon: <Settings size={22} color="var(--text-faint)" />, text: 'Generic chatbots are rigid, frustrating, and require complex setup — and still don\'t know anything about your specific business.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '1.1rem 1.25rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted-dark)', lineHeight: 1.65 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal reveal-d2">
              <div className="badge badge-gold mb-6" style={{ transform: 'rotate(1.5deg)', display: 'inline-flex' }}>
                <Bot size={13} /> The BeeBot Solution
              </div>
              <h2 className="headline" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--gold-rich)', marginBottom: '2rem', lineHeight: 1.15 }}>
                Upload knowledge.<br />Get an expert agent.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: <Zap size={18} />, title: 'Instant Indexing', text: 'BeeBot reads your documents, website URLs, and knowledge articles in seconds — and becomes an expert on your business immediately.' },
                  { icon: <Cpu size={18} />, title: 'Perfect Context via RAG', text: 'Uses advanced Retrieval-Augmented Generation to provide accurate, context-aware answers to your customers 24/7 — never makes things up.' },
                  { icon: <Code size={18} />, title: 'Zero Coding Required', text: 'Just copy and paste one line of script to deploy the widget anywhere. Works on every website, platform, or web app.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '1.1rem 1.25rem', background: 'linear-gradient(135deg, var(--gold-100), var(--cream-2))', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-300)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4, fontSize: '0.95rem' }}>{item.title}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted-dark)', lineHeight: 1.65 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="var(--black)" />

      {/* ════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '8rem 0', background: 'var(--black)', color: 'white' }}>
        <HoneycombBg id="hc-hiw" opacity={0.14} />
        <div className="section-num" style={{ top: '5%', left: '-2%', color: 'white' }}>01</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-16 reveal">
            <div className="badge badge-dark mb-4" style={{ display: 'inline-flex' }}><Zap size={13} /> Step by step</div>
            <h2 className="display" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', color: 'white', marginBottom: '1rem' }}>
              From zero to live in{' '}
              <span style={{ color: 'var(--gold-400)', position: 'relative' }}>
                5 minutes.
                <div style={{ position: 'absolute', bottom: -6, left: 0, right: 0 }}><GoldUnderline /></div>
              </span>
            </h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 540, margin: '0 auto' }}>
              We eliminated all the tedious setup, prompt engineering, and complex configuration — so you can focus on your business.
            </p>
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              <Zap size={11} color="#FFC107" /> Hover any step · auto-advances every 3.5s
            </div>
          </div>

          <div className="hiw-grid">
            {/* Step list */}
            <div
              className="reveal flex flex-col hiw-step-list"
              style={{ gap: '0.6rem' }}
              onMouseEnter={() => setIsHoveringSteps(true)}
              onMouseLeave={() => setIsHoveringSteps(false)}
            >
              {steps.map(s => (
                <div
                  key={s.id}
                  className={`step-card ${activeStep === s.id ? 'active' : ''}`}
                  style={activeStep !== s.id ? { background: 'rgba(255,255,255,0.03)' } : {}}
                  onMouseEnter={() => setActiveStep(s.id)}
                >
                  <div className="step-icon">{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.97rem', color: activeStep === s.id ? 'var(--text-dark)' : 'rgba(255,255,255,0.85)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                      {s.title}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: activeStep === s.id ? 'var(--text-muted-dark)' : 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
                      {s.desc}
                    </p>
                  </div>
                  <span className="step-num">{s.num}</span>
                  {activeStep === s.id && !isHoveringSteps && (
                    <div key={`pb-${s.id}`} className="step-progress-bar" />
                  )}
                </div>
              ))}
            </div>

            {/* Dynamic panel */}
            <div className="reveal reveal-d2 hiw-panel-wrap" style={{ position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(ellipse, rgba(255,193,7,0.1) 0%, transparent 70%)', borderRadius: 40 }} />

              <div style={{ background: 'var(--cream)', borderRadius: 24, padding: '2.25rem', width: '100%', maxWidth: 500, border: '1px solid var(--border-strong)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--gold-400), var(--gold-600))' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step {activeStep} · Live Preview</span>
                </div>

                {activeStep === 1 && (
                  <div key="p1" className="panel-in text-center">
                    <div style={{ border: '2.5px dashed var(--gold-400)', borderRadius: 14, padding: '2.5rem 1.75rem', background: 'var(--cream-2)' }}>
                      <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem' }}>
                        <Upload size={28} color="#000" />
                      </div>
                      <h4 className="headline" style={{ fontSize: '1.15rem', marginBottom: 7, color: 'var(--text-dark)' }}>Drop your knowledge base here</h4>
                      <p style={{ color: 'var(--text-faint)', fontSize: '0.87rem', marginBottom: '1.5rem' }}>Product docs, help articles, PDFs, or website URLs</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
                        {['Products.pdf', 'Returns-Policy.pdf', 'help.yoursite.com'].map(f => (
                          <span key={f} className="badge badge-gold" style={{ fontSize: '0.72rem' }}><FileText size={9} />{f}</span>
                        ))}
                      </div>
                      <div style={{ marginTop: '1.25rem', height: 4, background: 'var(--cream-3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg, var(--gold-400), var(--gold-600))', borderRadius: 2 }} />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 6 }}>Indexing your knowledge base... 72%</p>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div key="p2" className="panel-in flex flex-col" style={{ gap: '1.1rem' }}>
                    <h4 className="headline" style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>Configure your agent</h4>
                    <div>
                      <span className="label">Agent Name</span>
                      <input className="input" defaultValue="Support Assistant" readOnly />
                    </div>
                    <div>
                      <span className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Response Tone</span><span style={{ color: 'var(--gold-rich)', textTransform: 'none', letterSpacing: 0 }}>Friendly & Professional</span>
                      </span>
                      <div style={{ height: 8, background: 'var(--cream-3)', borderRadius: 4, position: 'relative', marginTop: 8 }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '68%', background: 'linear-gradient(90deg, var(--gold-500), var(--gold-600))', borderRadius: 4 }} />
                        <div style={{ position: 'absolute', left: '68%', top: -8, width: 24, height: 24, background: 'white', border: '4px solid var(--gold-600)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }} />
                      </div>
                    </div>
                    <div style={{ background: 'var(--gold-100)', padding: '0.875rem', borderRadius: 11, border: '1px solid var(--gold-300)' }}>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>"Hi! I'm here to help. How can I assist you today? 😊"</p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div key="p3" className="panel-in">
                    <h4 className="headline" style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>Copy your embed script</h4>
                    <div className="code-block" style={{ marginBottom: '1.25rem' }}>
                      <span className="code-kw">&lt;script</span> src=<span className="code-str">"https://beebot.ai/widget.js"</span><span className="code-kw">&gt;&lt;/script&gt;</span>{'\n\n'}
                      <span className="code-kw">&lt;script&gt;</span>{'\n'}
                      {'  '}BeeBot.init({'{'}{'\n'}
                      {'    '}apiKey: <span className="code-str">"sk_live_abc123"</span>,{'\n'}
                      {'    '}agentId: <span className="code-str">"agent_xyz789"</span>{'\n'}
                      {'  '}{'}'});{'\n'}
                      <span className="code-kw">&lt;/script&gt;</span>
                    </div>
                    <button className="btn btn-gold" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                      <CheckCircle size={15} /> Copy to Clipboard
                    </button>
                  </div>
                )}

                {activeStep === 4 && (
                  <div key="p4" className="panel-in text-center">
                    <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 1.5rem' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,193,7,0.2)', borderRadius: '50%', animation: 'ripple 2s infinite' }} />
                      <div style={{ position: 'absolute', inset: 12, background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-gold)' }}>
                        <Zap size={30} color="#000" />
                      </div>
                    </div>
                    <h3 className="headline" style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: 8 }}>You're Live! 🎉</h3>
                    <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Your BeeBot agent is now answering customer questions automatically — 24 hours a day, 7 days a week.</p>
                    <div style={{ padding: '0.7rem 1.4rem', background: 'var(--gold-100)', borderRadius: 'var(--radius-pill)', display: 'inline-block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--gold-rich)', border: '1px solid var(--gold-300)' }}>
                      ✓ 0 tickets in queue · Agent live
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="var(--cream)" flip />

      {/* ════════════════════════════════
          FEATURES
      ════════════════════════════════ */}
      <section id="features" style={{ padding: '8rem 0', background: 'var(--cream)' }}>
        <div className="section-num" style={{ top: '5%', right: '-1%' }}>02</div>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="badge badge-gold mb-4" style={{ display: 'inline-flex' }}><Database size={13} /> Vector Intelligence</div>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              It knows your business better than anyone.
            </h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-muted-dark)', maxWidth: 560, margin: '0 auto' }}>
              BeeBot uses enterprise-grade RAG to search your knowledge base in milliseconds — with zero hallucinations.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid-2" style={{ marginBottom: '6rem' }}>
            <div className="reveal">
              <div style={{ position: 'relative', padding: '1.75rem', background: 'var(--black-card)', borderRadius: 22, border: '1px solid rgba(255,193,7,0.2)', minHeight: 320, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                <DiagonalLines color="var(--gold-500)" opacity={0.05} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[{ l: 'Company-FAQ.pdf', c: 'badge-gold' }, { l: 'products.yoursite.com', c: 'badge-dark' }, { l: 'support-logs.txt', c: 'badge-dark' }].map(b => (
                    <span key={b.l} className={`badge ${b.c}`} style={{ fontSize: '0.7rem' }}><FileText size={10} />{b.l}</span>
                  ))}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[0.7, 0.45, 0.85, 0.55].map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `rgba(255,193,7,${0.3 + i * 0.1})`, flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ height: 6, width: `${w * 100}%`, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }} />
                        <div style={{ height: 6, width: `${(1 - w * 0.4) * 60}%`, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))', color: '#000', padding: '9px 18px', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.82rem', transform: 'rotate(-2deg)', boxShadow: 'var(--shadow-gold)' }}>
                  <CheckCircle size={13} style={{ display: 'inline', marginRight: 5 }} />98% Accuracy
                </div>
              </div>
            </div>
            <div className="reveal reveal-d2">
              <div className="section-divider mb-6" />
              <h3 className="headline" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Answers pulled directly from your content — never invented.
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                BeeBot doesn't guess. It retrieves exact answers from the documents and URLs you uploaded, citing the source. If the answer isn't in your knowledge base, BeeBot says so — and escalates to your team.
              </p>
              {['No hallucinations — only answers from your own content.', 'Auto-syncs with your website URLs every 24 hours.', 'Supports PDFs, Word docs, plain text, and web pages.'].map((f, i) => (
                <div key={i} className="check-item">
                  <div className="check-circle"><CheckCircle size={13} /></div>
                  <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid-2 feature-grid-rev">
            <div className="reveal" style={{ order: 2 }}>
              <div className="section-divider mb-6" />
              <h3 className="headline" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                When it's too complex, a human steps in.
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                BeeBot handles 80% of routine questions automatically. For the 20% that need a human touch — like refund disputes or complex account issues — it smoothly escalates to your inbox with full conversation context.
              </p>
              {['Detects frustration and emotional escalations automatically.', 'Collects customer contact info and sends full transcript to you.', 'Works with any helpdesk: email, Slack, Intercom, Zendesk.'].map((f, i) => (
                <div key={i} className="check-item">
                  <div className="check-circle"><CheckCircle size={13} /></div>
                  <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>
            <div className="reveal reveal-d2" style={{ order: 1 }}>
              <div style={{ padding: '1.75rem', background: 'var(--cream-2)', borderRadius: 22, border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Conversation</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div className="chat-bubble-left">I ordered 3 weeks ago and the item arrived damaged. I'd like a full refund.</div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={11} /></div>
                    <div className="chat-bubble-left">I'm so sorry to hear that. This needs a personal review from our team — let me connect you right away and share the full details.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--gold-100)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gold-300)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-rich)' }}>
                    <Zap size={12} fill="var(--gold-rich)" color="var(--gold-rich)" />
                    Escalating to support inbox with full context...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--cream-2)' }}>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="var(--gold-500)" color="var(--gold-500)" />)}
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dark)' }}>
              Loved by businesses everywhere.
            </h2>
          </div>
          <div className="testi-grid">
            {[
              {
                name: 'Priya Nair',
                role: 'Founder, TrueGlow Beauty (Shopify)',
                bg: 'white', border: '1px solid var(--border)', textColor: 'var(--text-dark)', subColor: 'var(--text-faint)',
                quote: 'BeeBot cut our support ticket volume by 65% in the first week. Our customers now get answers at 2am without us lifting a finger. It pays for itself every month — easily.'
              },
              {
                name: 'James Osei',
                role: 'CTO, Scalepath — B2B SaaS',
                bg: 'var(--black)', border: '1px solid rgba(255,193,7,0.2)', textColor: 'rgba(255,255,255,0.88)', subColor: 'rgba(255,255,255,0.4)',
                quote: 'We were skeptical an AI would understand our complex product. After uploading our docs, BeeBot answered technical onboarding questions better than our junior support staff. Mind-blowing.'
              },
              {
                name: 'Maria Santos',
                role: 'Owner, Santos Auto Group (5 locations)',
                bg: 'linear-gradient(135deg, var(--gold-100), var(--gold-200))', border: '1px solid var(--gold-300)', textColor: 'var(--text-dark)', subColor: 'var(--text-faint)',
                quote: 'I never thought a local auto repair chain would need AI support — until BeeBot answered 200 appointment and pricing questions in a single weekend without me touching my phone once.'
              }
            ].map((t, i) => (
              <div key={i} className="reveal" style={{ background: t.bg, padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: t.border, transitionDelay: `${i * 0.12}s`, boxShadow: i === 1 ? '0 20px 60px rgba(0,0,0,0.18)' : 'var(--shadow-sm)', marginTop: i === 1 ? '1.5rem' : 0 }}>
                <div style={{ fontSize: '3rem', lineHeight: 1, fontFamily: 'Georgia, serif', color: t.textColor, opacity: 0.18, marginBottom: '0.25rem', userSelect: 'none' }}>"</div>
                <p style={{ fontSize: '0.97rem', color: t.textColor, lineHeight: 1.75, marginBottom: '2rem', fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,193,7,0.15)', border: '2px solid rgba(255,193,7,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="var(--gold-rich)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: t.textColor, marginBottom: 2, fontSize: '0.93rem' }}>{t.name}</p>
                    <p style={{ fontSize: '0.78rem', color: t.subColor }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          PRICING
      ════════════════════════════════ */}
      <section id="pricing" style={{ padding: '8rem 0', background: 'var(--cream)' }}>
        <div className="section-num" style={{ top: '5%', right: '-1%' }}>04</div>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="badge badge-gold mb-4" style={{ display: 'inline-flex' }}>Pricing</div>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Pay only when AI resolves.
            </h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', color: 'var(--text-muted-dark)', maxWidth: 540, margin: '0 auto' }}>
              No flat monthly fees. No wasted spend. You're only charged when a customer's question is fully resolved by AI — confirmed by the customer.
            </p>
          </div>

          {/* Resolution callout */}
          <div className="reveal" style={{ maxWidth: 680, margin: '0 auto 4rem', background: 'var(--gold-100)', border: '1px solid var(--gold-300)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HelpCircle size={20} color="#000" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6, fontSize: '0.97rem' }}>What counts as a "resolution"?</p>
              <p style={{ color: 'var(--text-muted-dark)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                After BeeBot answers a customer query, a small prompt appears in the widget: <em>"Did this answer your question? [Yes ✓] / [No, I need more help]"</em>. A resolution is only counted — and billed — when the customer clicks <strong>Yes</strong>. If they click No or don't respond, it's free.
              </p>
            </div>
          </div>

          <div className="price-grid">
            {/* Free */}
            <div className="reveal card price-card">
              <div className="badge badge-cream mb-4" style={{ display: 'inline-flex' }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '0.5rem' }}>
                <span className="price-amount" style={{ color: 'var(--text-dark)' }}>$0</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '1rem' }}>&nbsp;forever</span>
              </div>
              <p style={{ color: 'var(--text-muted-dark)', marginBottom: '1.75rem', lineHeight: 1.5, fontSize: '0.93rem' }}>
                Try BeeBot with no commitment. Perfect for evaluating the product.
              </p>
              <div style={{ flex: 1 }}>
                {[
                  '1 bot widget',
                  'Upload up to 3 documents',
                  '25 AI messages / month',
                  'Basic analytics dashboard',
                  'Resolution confirmation UI',
                  'Community support',
                ].map((f, i) => (
                  <div key={i} className="price-feature">
                    <div className="check-circle" style={{ width: 20, height: 20, flexShrink: 0 }}><CheckCircle size={11} /></div>
                    <span style={{ fontSize: '0.91rem', color: 'var(--text-dark)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', padding: '13px', justifyContent: 'center', marginTop: '2rem', borderRadius: 'var(--radius-pill)' }} onClick={handleCTA}>
                Get Started Free
              </button>
            </div>

            {/* Pay-per-resolution */}
            <div className="reveal reveal-d2 pro-card" style={{ background: 'var(--black)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', zIndex: 10, border: '1px solid rgba(255,193,7,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.22)' }}>
              <HoneycombBg id="hc-pricing" opacity={0.09} />
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))', color: '#000', padding: '5px 20px', borderRadius: 'var(--radius-pill)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(255,193,7,0.4)' }}>
                ✦ Pay-per-resolution
              </div>
              <div className="price-card" style={{ position: 'relative', zIndex: 1 }}>
                <div className="badge badge-dark mb-4" style={{ display: 'inline-flex' }}>Usage-based</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '0.25rem' }}>
                  <span className="price-amount" style={{ color: 'var(--gold-400)' }}>$0.79</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>per successful resolution</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '1.75rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Only pay when customers confirm their query was fully resolved. Zero waste.
                </p>
                <div style={{ flex: 1 }}>
                  {[
                    'Upload up to 50 documents',
                    'Unlimited conversations',
                    'Resolution confirmation widget',
                    'Custom agent name & personality',
                    'Auto URL sync every 24 hours',
                    'Human handoff to your inbox',
                    'Full analytics + resolution history',
                    'Priority support',
                  ].map((f, i) => (
                    <div key={i} className="price-feature-dark">
                      <div className="check-circle" style={{ width: 20, height: 20, flexShrink: 0 }}><CheckCircle size={11} /></div>
                      <span style={{ fontSize: '0.91rem', color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gold" style={{ width: '100%', padding: '15px', justifyContent: 'center', marginTop: '2rem', borderRadius: 'var(--radius-pill)', fontSize: '1rem' }} onClick={handleCTA}>
                  Start for Free <ArrowRight size={16} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem' }}>No monthly fee · Pay only per confirmed resolution</p>
              </div>
            </div>
          </div>

          {/* Pricing footnote */}
          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)', lineHeight: 1.7 }}>
              High volume? <Link to="/contact" style={{ color: 'var(--gold-rich)', fontWeight: 700, textDecoration: 'none' }}>Contact us</Link> for custom resolution pricing and SLAs.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FAQ — Clean minimal
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--cream-2)' }}>
        <div className="section-num" style={{ top: '-2%', right: '-1%' }}>05</div>
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="text-center mb-12 reveal">
            <div className="badge badge-gold mb-4" style={{ display: 'inline-flex' }}>
              <HelpCircle size={13} /> FAQ
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Common questions
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted-dark)', maxWidth: 480, margin: '0 auto' }}>
              Can't find what you're looking for?{' '}
              <Link to="/contact" style={{ color: 'var(--gold-rich)', fontWeight: 600, textDecoration: 'none' }}>Reach out.</Link>
            </p>
          </div>

          <div className="reveal reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', border: `1px solid ${openFaq === i ? 'var(--gold-400)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.25s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer', textAlign: 'left', minHeight: 64 }}
                >
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.97rem', color: openFaq === i ? 'var(--gold-rich)' : 'var(--text-dark)', lineHeight: 1.4, transition: 'color 0.25s', flex: 1 }}>
                    {faq.q}
                  </span>
                  <ChevronDown size={18} color="var(--text-faint)" style={{ flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                <div style={{ maxHeight: openFaq === i ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.75, fontSize: '0.93rem', paddingTop: '1rem' }}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ marginTop: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-faint)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Still have questions? We respond within 2 business hours.
            </p>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 999, background: 'var(--gold-100)', border: '1px solid var(--gold-300)', color: 'var(--gold-rich)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              Contact Support <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{ background: 'var(--black)', borderTop: '1px solid rgba(255,193,7,0.1)', padding: '5rem 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '12rem', color: 'rgba(255,193,7,0.03)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>Bee.</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="footer-grid">

            {/* Brand */}
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.1rem', cursor: 'pointer' }} onClick={() => navTo('/')}>
                <div className="logo-mark">
                  <img src="/bee-yellow.jpg" alt="BeeBot" className="logo-img" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white' }}>BeeBot.</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, fontSize: '0.9rem', maxWidth: 300, marginBottom: '1.5rem' }}>
                The AI customer support platform built for any business. From e-commerce to SaaS, agencies to healthcare — we've got you covered.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['T', 'Twitter'], ['in', 'LinkedIn'], ['▶', 'YouTube']].map(([icon, label]) => (
                  <a key={label} href="#" aria-label={label} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,193,7,0.15)'; e.currentTarget.style.color = '#FFC107'; e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1.4rem' }}>Product</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
                <li><a href="#pricing" className="footer-link">Pricing</a></li>
                <li><Link to="/changelog" className="footer-link">Changelog</Link></li>
                <li><Link to="/roadmap" className="footer-link">Roadmap</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1.4rem' }}>Company</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><Link to="/blog" className="footer-link">Blog</Link></li>
                <li><Link to="/docs" className="footer-link">Documentation</Link></li>
                <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
                <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1.4rem' }}>Stay in the loop</h5>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.86rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                Product updates and support tips — no spam, ever.
              </p>
              <div className="footer-newsletter-row" style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="you@company.com"
                  style={{ flex: 1, minWidth: 0, padding: '10px 13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'white', fontSize: '0.86rem', fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.25s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,193,7,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button className="btn btn-gold" style={{ padding: '10px 16px', fontSize: '0.86rem', flexShrink: 0, borderRadius: 9 }}>→</button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.72rem', marginTop: '0.6rem' }}>No spam. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Gold gradient divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(255,193,7,0.4) 20%, rgba(255,193,7,0.6) 50%, rgba(255,193,7,0.4) 80%, transparent 100%)', marginBottom: '2rem' }} />

          <div style={{ background: '#0a0a0f', borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '2.5rem 2rem 1.5rem' }}>

  {/* CTA strip */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', paddingBottom: '2rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
        Have a project in mind? Let's build it.
      </h3>
      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
        Dhayanithi Anandan · Full-stack AI developer
      </p>
    </div>
    <a href="mailto:dhayanithianandan@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.18)', borderRadius: '999px', color: 'rgba(255,255,255,0.88)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', flexShrink: 0 }} />
      dhayanithianandan@gmail.com
    </a>
  </div>

  {/* Bottom bar */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '0.5rem' }}>
    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.22)' }}>
      © {new Date().getFullYear()} BeeBot AI Inc. &nbsp;·&nbsp; Built by{' '}
      <a href="mailto:dhayanithianandan@gmail.com" style={{ color: 'rgba(160,130,255,0.7)', textDecoration: 'none', borderBottom: '0.5px solid rgba(160,130,255,0.3)' }}>
        Dhayanithi Anandan
      </a>
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11.5px', color: 'rgba(255,255,255,0.28)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
        All systems operational
      </span>
      {['SOC 2', 'GDPR'].map(badge => (
        <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, border: '0.5px solid rgba(255,255,255,0.1)', fontSize: '10.5px', fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
          {badge}
        </span>
      ))}
    </div>
  </div>

</div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
