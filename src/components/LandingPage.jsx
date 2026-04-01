import React, { useEffect, useState } from 'react';
import { Bot, ArrowRight, ShieldCheck, Zap, Globe, MessageSquareDiff, LayoutDashboard, LogIn, Code, Database, Settings, FileText, HelpCircle, CheckCircle, User, Star, Upload, Cpu, Play, ChevronDown } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Golden × Black × Cream
═══════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --gold-100: #FFF8E1;
    --gold-200: #FFECB3;
    --gold-300: #FFD54F;
    --gold-400: #FFCA28;
    --gold-500: #FFC107;
    --gold-600: #FFB300;
    --gold-700: #E65100;
    --gold-deep: #B8860B;
    --gold-rich: #C9950A;
    --cream: #FDFAF2;
    --cream-2: #F5F0E0;
    --cream-3: #EDE8D5;
    --black: #0A0A0A;
    --black-soft: #111111;
    --black-card: #1A1A1A;
    --black-mid: #2A2A2A;
    --text-dark: #1A1200;
    --text-muted-dark: #5C5032;
    --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2);
    --border-strong: rgba(184,134,11,0.4);
    --shadow-gold: 0 8px 32px rgba(201,149,10,0.25);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.12);
    --shadow-lg: 0 24px 64px rgba(0,0,0,0.18);
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-pill: 999px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --dur: 0.35s;
    --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--cream);
    color: var(--text-dark);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Typography ── */
  .display { font-family: var(--font-display); font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
  .headline { font-family: var(--font-display); font-weight: 800; line-height: 1.1; }
  .mono { font-family: var(--font-mono); }
  .text-gold { color: var(--gold-rich); }
  .text-cream { color: var(--cream); }
  .text-muted { color: var(--text-muted-dark); }
  .text-faint { color: var(--text-faint); }
  .text-center { text-align: center; }
  .italic { font-style: italic; }

  /* ── Layout ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .gap-6 { gap: 1.5rem; }
  .gap-8 { gap: 2rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  .mb-12 { margin-bottom: 3rem; }
  .mb-16 { margin-bottom: 4rem; }
  .relative { position: relative; }
  .z-10 { z-index: 10; }
  .w-full { width: 100%; }
  .inline-block { display: inline-block; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 4rem; align-items: center; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: var(--font-body); font-weight: 700; font-size: 1rem;
    cursor: pointer; border: none; outline: none;
    transition: all var(--dur) var(--ease);
  }
  .btn-gold {
    background: linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%);
    color: var(--black);
    padding: 16px 36px; border-radius: var(--radius-pill);
    box-shadow: 0 4px 20px rgba(255,193,7,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
    position: relative; overflow: hidden;
  }
  .btn-gold::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2));
    opacity: 0; transition: opacity 0.3s;
  }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,193,7,0.5); }
  .btn-gold:hover::after { opacity: 1; }
  .btn-outline {
    background: transparent; color: var(--text-dark);
    padding: 15px 32px; border-radius: var(--radius-pill);
    border: 2px solid var(--border-strong); font-weight: 600;
  }
  .btn-outline:hover { border-color: var(--gold-500); color: var(--gold-rich); transform: translateY(-1px); }
  .btn-white {
    background: white; color: var(--black);
    padding: 16px 36px; border-radius: var(--radius-pill);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
  .btn-ghost-white {
    background: rgba(255,255,255,0.1); color: white;
    padding: 15px 32px; border-radius: var(--radius-pill);
    border: 2px solid rgba(255,255,255,0.3); font-weight: 600;
    backdrop-filter: blur(8px);
  }
  .btn-ghost-white:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }

  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: var(--radius-pill);
    font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .badge-gold { background: var(--gold-200); color: var(--text-dark); border: 1px solid var(--gold-400); }
  .badge-dark { background: var(--black-mid); color: var(--gold-300); border: 1px solid rgba(255,193,7,0.3); }
  .badge-cream { background: var(--cream); color: var(--text-dark); border: 1px solid var(--border); }

  /* ── Cards ── */
  .card {
    background: white; border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
  }
  .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .card-dark {
    background: var(--black-card); border-radius: var(--radius-xl);
    border: 1px solid rgba(255,193,7,0.15);
  }
  .card-gold {
    background: linear-gradient(135deg, var(--gold-400) 0%, var(--gold-600) 100%);
    border-radius: var(--radius-xl); color: var(--black);
  }

  /* ── Nav ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    transition: all 0.4s ease;
    padding: 0 2rem;
  }
  .nav-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    height: 76px;
  }
  .nav.scrolled {
    background: rgba(253,250,242,0.96);
    backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
  }
  .nav-link {
    color: var(--text-muted-dark); text-decoration: none; font-weight: 600; font-size: 0.95rem;
    transition: color 0.2s; position: relative;
  }
  .nav-link::after {
    content: ''; position: absolute; left: 0; bottom: -4px;
    width: 0; height: 2px; background: var(--gold-500);
    transition: width 0.25s var(--ease);
  }
  .nav-link:hover { color: var(--text-dark); }
  .nav-link:hover::after { width: 100%; }

  /* ── Logo ── */
  .logo-mark {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, var(--gold-500) 0%, var(--gold-700) 100%);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    color: var(--black); transform: rotate(-5deg);
    box-shadow: 0 4px 12px rgba(255,193,7,0.4);
    flex-shrink: 0;
  }

  /* ── Input ── */
  .input {
    width: 100%; padding: 12px 16px;
    background: var(--cream-2); border: 2px solid var(--border-strong);
    border-radius: var(--radius-md); font-family: var(--font-body);
    font-size: 0.95rem; color: var(--text-dark); outline: none;
    transition: border-color 0.25s;
  }
  .input:focus { border-color: var(--gold-500); }
  .label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted-dark); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block; }

  /* ── Dividers ── */
  .section-divider { width: 60px; height: 4px; background: linear-gradient(90deg, var(--gold-500), var(--gold-300)); border-radius: 2px; }

  /* ── Scroll animations ── */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-d1 { transition-delay: 0.1s; }
  .reveal-d2 { transition-delay: 0.2s; }
  .reveal-d3 { transition-delay: 0.35s; }
  .reveal-d4 { transition-delay: 0.5s; }

  /* ── Float animation ── */
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
  @keyframes floatSlow { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulseGlow { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.05); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes bounce-in { 0% { transform: scale(0.8) translateY(10px); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }

  .float { animation: float 4s ease-in-out infinite; }
  .float-2 { animation: float2 5s ease-in-out infinite; }
  .float-slow { animation: floatSlow 6s ease-in-out infinite; }
  .spin-slow { animation: spinSlow 20s linear infinite; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .fade-slide { animation: fadeSlideIn 0.5s var(--ease) both; }

  /* ── Section Styles ── */
  section { position: relative; overflow: hidden; }
  .section-dark { background: var(--black); color: white; }
  .section-cream { background: var(--cream); }
  .section-cream2 { background: var(--cream-2); }
  .section-gold { background: linear-gradient(135deg, var(--gold-600) 0%, var(--gold-700) 100%); color: var(--black); }

  /* ── Step Card ── */
  .step-card {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 1.5rem; border-radius: var(--radius-lg); cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s var(--ease);
  }
  .step-card.active {
    background: white; border-color: var(--gold-400);
    box-shadow: 0 8px 32px rgba(255,193,7,0.2);
    transform: translateX(6px);
  }
  .step-icon {
    width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--cream-2); color: var(--text-faint);
    border: 2px solid var(--border); transition: all 0.3s;
  }
  .step-card.active .step-icon {
    background: linear-gradient(135deg, var(--gold-500), var(--gold-600));
    color: var(--black); border-color: var(--gold-700);
    box-shadow: 0 4px 16px rgba(255,193,7,0.4);
  }

  /* ── Feature List ── */
  .check-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 1.25rem; }
  .check-circle {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--gold-400), var(--gold-600));
    display: flex; align-items: center; justify-content: center; color: var(--black);
    margin-top: 2px;
  }
  .check-circle-white {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; color: white;
    margin-top: 2px; border: 1px solid rgba(255,255,255,0.3);
  }

  /* ── Pricing ── */
  .price-card { padding: 3rem 2.5rem; height: 100%; display: flex; flex-direction: column; }
  .price-amount { font-family: var(--font-display); font-size: 4rem; font-weight: 900; line-height: 1; }
  .price-feature { display: flex; align-items: center; gap: 12px; padding: 0.7rem 0; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
  .price-feature-dark { display: flex; align-items: center; gap: 12px; padding: 0.7rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.95rem; }

  /* ── FAQ ── */
  details { cursor: pointer; }
  details summary { list-style: none; }
  details summary::-webkit-details-marker { display: none; }
  details[open] .faq-arrow { transform: rotate(180deg); }
  .faq-arrow { transition: transform 0.3s; }
  details[open] .faq-answer { animation: fadeSlideIn 0.3s ease both; }

  /* ── Chat Bubble ── */
  .chat-bubble-left {
    background: var(--cream-2); padding: 14px 18px;
    border-radius: 18px 18px 18px 4px; font-size: 0.88rem; max-width: 82%;
    align-self: flex-start; line-height: 1.5; color: var(--text-dark);
    border: 1px solid var(--border);
  }
  .chat-bubble-right {
    background: linear-gradient(135deg, var(--gold-500), var(--gold-600));
    padding: 14px 18px; border-radius: 18px 18px 4px 18px;
    font-size: 0.88rem; max-width: 82%; align-self: flex-end;
    color: var(--black); font-weight: 600; line-height: 1.5;
    box-shadow: 0 4px 14px rgba(255,193,7,0.35);
  }
  .chat-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
    display: flex; align-items: center; justify-content: center; color: var(--black);
  }

  /* ── Stat Number ── */
  .stat-num {
    font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 900; letter-spacing: -0.03em; line-height: 1;
  }

  /* ── Ornamental lines ── */
  .gold-line { height: 1px; background: linear-gradient(90deg, transparent, var(--gold-500), transparent); }
  .gold-line-v { width: 1px; background: linear-gradient(180deg, transparent, var(--gold-500), transparent); }

  /* ── Noise overlay ── */
  .noise { position: absolute; inset: 0; opacity: 0.035; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size: 128px; }

  /* ── Ticker / Marquee ── */
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .marquee-track { display: flex; gap: 3rem; animation: marquee 20s linear infinite; white-space: nowrap; }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .grid-2 { grid-template-columns: 1fr; gap: 2.5rem; }
    .hide-mobile { display: none !important; }
    .container { padding: 0 1.25rem; }
    .price-grid { grid-template-columns: 1fr !important; max-width: 460px; margin: 0 auto; }
  }

  /* ── Phone mockup ── */
  .phone {
    width: 260px; height: 520px;
    background: var(--black); border-radius: 40px;
    border: 6px solid #2A2A2A;
    box-shadow: 0 40px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08);
    position: relative; overflow: hidden;
  }
  .phone-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 28px; background: var(--black);
    border-radius: 0 0 20px 20px; z-index: 10;
    border-bottom: 1px solid #2A2A2A;
  }
  .phone-screen {
    position: absolute; inset: 0; padding: 40px 12px 12px;
    display: flex; flex-direction: column; gap: 10px;
    background: var(--cream);
  }

  /* ── Code block ── */
  .code-block {
    background: #0D0D0D; padding: 1.5rem;
    border-radius: var(--radius-md); font-family: var(--font-mono);
    font-size: 0.82rem; color: #E8E8E8; line-height: 1.8;
    border: 1px solid rgba(255,193,7,0.2); overflow-x: auto;
  }
  .code-kw { color: var(--gold-400); }
  .code-str { color: #7EFFA0; }
  .code-cmt { color: #6B6B6B; font-style: italic; }

  /* ── Testimonial card ── */
  .quote-mark {
    font-family: Georgia, serif; font-size: 80px; line-height: 1;
    position: absolute; opacity: 0.08; user-select: none;
  }

  /* ── Section number ── */
  .section-num {
    font-family: var(--font-display); font-size: 8rem; font-weight: 900;
    position: absolute; opacity: 0.04; user-select: none; line-height: 1;
  }

  /* ── Tag line decoration ── */
  .tag-deco {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 20px; border-radius: var(--radius-pill);
    background: var(--cream-2); border: 1px solid var(--border-strong);
    font-size: 0.85rem; font-weight: 600; color: var(--text-muted-dark);
  }

  /* ── Hexagon pattern ── */
  .hex-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
`;

/* ═══════════════════════════════════════════════════════════
   INLINE SVG DECORATIONS
═══════════════════════════════════════════════════════════ */

const HoneycombBg = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse">
        <polygon points="30,2 56,17 56,47 30,62 4,47 4,17" fill="none" stroke="#C9950A" strokeWidth="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
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

const DotGrid = ({ color = 'var(--gold-rich)', opacity = 0.08 }) => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill={color} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

const WaveDivider = ({ fill = '#FDFAF2', flip = false }) => (
  <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden' }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 80, transform: flip ? 'scaleY(-1)' : 'none' }} xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  </div>
);

const BlobShape = ({ color, style, className }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
    <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-1C87,14.4,81.4,28.8,73.3,41.1C65.1,53.4,54.4,63.6,41.7,70.6C29,77.6,14.5,81.4,-0.6,82.4C-15.7,83.3,-31.4,81.3,-44.2,74.3C-57,67.2,-67,55,-73.3,41.1C-79.6,27.2,-82.1,11.7,-80.8,-3.3C-79.5,-18.3,-74.3,-32.8,-65.6,-44.6C-56.9,-56.5,-44.7,-65.8,-31.2,-73.4C-17.7,-81,-8.8,-87,-0.1,-86.9C8.7,-86.8,30.6,-83.6,44.7,-76.4Z" fill={color} transform="translate(100 100)" />
  </svg>
);

const GoldenBee = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="55" rx="22" ry="28" fill="#FFB300" />
    <ellipse cx="50" cy="55" rx="22" ry="28" fill="none" stroke="#000" strokeWidth="1.5" />
    <rect x="38" y="45" width="24" height="6" rx="3" fill="#222" opacity="0.6" />
    <rect x="38" y="55" width="24" height="6" rx="3" fill="#222" opacity="0.6" />
    <ellipse cx="50" cy="30" rx="12" ry="14" fill="#FFD54F" stroke="#000" strokeWidth="1.5" />
    <ellipse cx="42" cy="28" rx="3" ry="2" fill="#111" />
    <ellipse cx="58" cy="28" rx="3" ry="2" fill="#111" />
    <ellipse cx="32" cy="44" rx="12" ry="7" fill="rgba(255,255,255,0.55)" stroke="#C9950A" strokeWidth="1" transform="rotate(-30 32 44)" />
    <ellipse cx="68" cy="44" rx="12" ry="7" fill="rgba(255,255,255,0.55)" stroke="#C9950A" strokeWidth="1" transform="rotate(30 68 44)" />
  </svg>
);

const SparkSVG = ({ size = 24, color = 'var(--gold-500)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" fill={color} stroke={color} strokeWidth="0.5" strokeLinejoin="round" />
    <path d="M19 2 L19.7 5.3 L23 6 L19.7 6.7 L19 10 L18.3 6.7 L15 6 L18.3 5.3 Z" fill={color} opacity="0.6" />
  </svg>
);

const HandDrawnArrow = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,65 Q20,30 55,20" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="0" />
    <path d="M45,14 L57,20 L48,28" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const HandDrawnCircle = ({ size = 200, color = 'var(--gold-400)' }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8,35 C20,10 80,5 120,8 C160,11 195,25 190,40 C185,55 140,58 100,56 C60,54 12,50 8,35Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const GoldUnderline = ({ width = '100%' }) => (
  <svg height="10" style={{ width, display: 'block' }} viewBox="0 0 200 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2,6 Q50,2 100,5 Q150,8 198,4" stroke="var(--gold-500)" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const OrnateDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '3rem 0', justifyContent: 'center' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-400))' }} />
    <SparkSVG size={20} />
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--gold-400), transparent)' }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && (e.target.classList.add('visible'), obs.unobserve(e.target))),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const navigate = (path) => console.log('navigate to', path);

  const steps = [
    { id: 1, icon: <Upload size={20} />, title: 'Upload Your Knowledge', desc: 'Add PDFs, paste URLs, or drop text files — BeeBot processes them instantly.' },
    { id: 2, icon: <Settings size={20} />, title: 'Configure Your Agent', desc: 'Set a name, tone, and brand language in seconds — no prompts needed.' },
    { id: 3, icon: <Code size={20} />, title: 'Copy the Embed Script', desc: 'One line of JavaScript. Works on any website, no-code tool, or platform.' },
    { id: 4, icon: <Zap size={20} />, title: 'Go Live Instantly', desc: 'Your AI agent starts answering real customer questions right away, 24/7.' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ════════════════════════════════
          NAV
      ════════════════════════════════ */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
           <div className="logo-mark">
                 <img src="/bee-yellow.jpg" alt="BeeBot Logo" className="logo-img" />
</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-dark)' }}>BeeBot.</span>
          </div>

          <div className="flex gap-8 hide-mobile">
            {['Features', 'How It Works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="nav-link">{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-outline hide-mobile" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>Sign In</button>
            <button className="btn btn-gold" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              Start Free <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <header style={{ paddingTop: 160, paddingBottom: 100, background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <HoneycombBg />
        <DotGrid opacity={0.06} />

        {/* background blobs */}
        <div className="float-slow" style={{ position: 'absolute', top: '5%', right: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,193,7,0.18) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70%', filter: 'blur(20px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,213,79,0.15) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 480px)', gap: '5rem', alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                <SparkSVG size={16} />
                <span className="tag-deco">Build in under 5 minutes · No code required</span>
                <SparkSVG size={16} />
              </div>

              <h1 className="reveal reveal-d1 display" style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Deploy an AI Customer
              </h1>
              <h1 className="reveal reveal-d1 display" style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Support Agent{' '}
                <span style={{ color: 'var(--gold-rich)', position: 'relative', display: 'inline-block' }}>
                  in 5 Minutes.
                  <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0 }}><GoldUnderline /></div>
                </span>
              </h1>

              <p className="reveal reveal-d2" style={{ fontSize: '1.15rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, maxWidth: 520, marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                BeeBot reads your course PDFs, website FAQs, and documentation — then instantly becomes an expert that answers your customers' questions 24/7. No prompt engineering. No developers. Just results.
              </p>

              <div className="reveal reveal-d3 flex gap-4" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-gold" style={{ padding: '16px 36px', fontSize: '1.05rem', position: 'relative' }}>
                  Get Started Free
                  <ArrowRight size={18} />
                  <span className="hide-mobile" style={{ position: 'absolute', top: '-38px', right: '-80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <HandDrawnArrow size={50} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold-rich)', fontStyle: 'italic', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', marginTop: -8, marginLeft: 28 }}>free forever plan</span>
                  </span>
                </button>
                <button className="btn btn-outline" style={{ padding: '16px 28px', fontSize: '1.05rem' }}
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Play size={16} /> See how it works
                </button>
              </div>

              <div className="reveal reveal-d4" style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {['#FFD54F', '#FFB300', '#E65100', '#C9950A', '#FFD54F'].map((c, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} color="#222" />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted-dark)' }}>
                  Trusted by <strong style={{ color: 'var(--text-dark)' }}>3,000+</strong> Multiple Businesses worldwide
                </p>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--gold-500)" color="var(--gold-500)" />)}
                </div>
              </div>
            </div>

            {/* Right — Phone Mockup */}
            <div className="reveal reveal-d2 float" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Glow ring behind phone */}
              <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(ellipse, rgba(255,193,7,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

              {/* Floating Bee */}
              <div className="float-2" style={{ position: 'absolute', top: -30, left: '10%', zIndex: 20 }}>
                <GoldenBee size={80} />
              </div>

              {/* Phone */}
              <div className="phone" style={{ transform: 'rotate(2deg)', zIndex: 10 }}>
                <div className="phone-notch" />
                <div className="phone-screen">
                  {/* Header bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'var(--gold-100)', borderRadius: 10, marginBottom: 4, border: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD54F,#FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} color="#000" /></div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111' }}>BeeBot Support</div>
                      <div style={{ fontSize: '0.6rem', color: '#6B8E23', display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }} />Online</div>
                    </div>
                  </div>

                  <div className="chat-bubble-left" style={{ fontSize: '0.78rem' }}>Hi! I'm BeeBot 🐝. Ask me anything about your Course or business!</div>
                  <div className="chat-bubble-right" style={{ fontSize: '0.78rem' }}>Do you offer refunds?</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={12} /></div>
                    <div className="chat-bubble-left" style={{ fontSize: '0.78rem' }}>Yes! 30-day money-back guarantee. No questions asked. 😊</div>
                  </div>
                  <div className="chat-bubble-right" style={{ fontSize: '0.78rem' }}>How do I access the course?</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={12} /></div>
                    <div className="chat-bubble-left" style={{ fontSize: '0.78rem' }}>Log in at learn.yoursite.com and click "My Courses" in the top menu.</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', background: 'white', borderRadius: 20, padding: '6px 12px', border: '1px solid var(--border)', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: '#A0A0A0', flex: 1 }}>Type a question...</span>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={12} color="black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="float hide-mobile" style={{ position: 'absolute', right: -20, top: '20%', background: 'white', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, zIndex: 20 }}>
                <Zap size={14} color="var(--gold-rich)" fill="var(--gold-rich)" />
                <span>&lt;1s response</span>
              </div>
              <div className="float-slow hide-mobile" style={{ position: 'absolute', left: -10, bottom: '20%', background: 'var(--gold-500)', padding: '10px 16px', borderRadius: 12, boxShadow: '0 6px 20px rgba(255,193,7,0.4)', fontSize: '0.8rem', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: 8, zIndex: 20, animationDelay: '-2s' }}>
                <CheckCircle size={14} color="#000" />
                <span>98% accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════
          SOCIAL PROOF TICKER
      ════════════════════════════════ */}
      <div
  style={{
    background: 'var(--black)',
    padding: '1.2rem 0',
    borderTop: '1px solid rgba(255,193,7,0.15)',
    borderBottom: '1px solid rgba(255,193,7,0.15)',
    overflow: 'hidden'
  }}
>
        <div className="marquee-track">
            {[
            'Built for modern customer support',
            'Instant AI-powered responses',
            'Deploy in minutes, not days',
            'No complex setup required',
            'Works 24/7 without downtime',
            'Understands real user intent',
            'Continuously improving AI',
            'Designed for scalability'
            ]
            .concat([
                'Built for modern customer support',
                'Instant AI-powered responses',
                'Deploy in minutes, not days',
                'No complex setup required',
                'Works 24/7 without downtime',
                'Understands real user intent',
                'Continuously improving AI',
                'Designed for scalability'
            ])
            .map((item, i) => (
                <span
                key={i}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}
                >
                <SparkSVG size={14} />
                {item}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '5rem' }}>

            {/* Problem */}
            <div className="reveal">
              <div className="badge badge-dark mb-6" style={{ transform: 'rotate(-2deg)', display: 'inline-flex' }}>
                😤 The Problem
              </div>
              <h2 className="headline" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--text-dark)', marginBottom: '2rem', lineHeight: 1.15 }}>
                Customer support is drowning your team.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: <HelpCircle size={22} color="var(--text-faint)" />, text: '"Where\'s my refund?" "How do I log in?" — your team spends hours answering the same 5 questions, every single day.' },
                  { icon: <ShieldCheck size={22} color="var(--text-faint)" />, text: 'Hiring a 24/7 global support team is simply too expensive for a growing course business.' },
                  { icon: <Settings size={22} color="var(--text-faint)" />, text: 'Standard chatbots are rigid, frustrating, and require complex decision-tree coding that constantly breaks.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '1.25rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                    <p style={{ fontSize: '0.97rem', color: 'var(--text-muted-dark)', lineHeight: 1.65 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div className="reveal reveal-d2">
              <div className="badge badge-gold mb-6" style={{ transform: 'rotate(1.5deg)', display: 'inline-flex' }}>
                <Bot size={13} /> The BeeBot Solution
              </div>
              <h2 className="headline" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--gold-rich)', marginBottom: '2rem', lineHeight: 1.15 }}>
                Upload knowledge.<br />Get an expert agent.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: <Zap size={18} />, title: 'Instant Indexing', text: 'BeeBot reads your course PDFs, website URLs, and existing FAQs in seconds — and becomes an expert immediately.' },
                  { icon: <Cpu size={18} />, title: 'Perfect Context via RAG', text: 'Uses advanced Retrieval-Augmented Generation to provide flawless, context-aware answers to your students 24/7.' },
                  { icon: <Code size={18} />, title: 'Zero Coding Required', text: 'Just copy and paste one line of script to deploy the widget anywhere on your site — no developers needed.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '1.25rem', background: 'linear-gradient(135deg, var(--gold-100), var(--cream-2))', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-300)' }}>
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
        <DiagonalLines color="#fff" opacity={0.03} />
        <div className="section-num" style={{ top: '5%', left: '-2%', color: 'white' }}>01</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-16 reveal">
            <div className="badge badge-dark mb-4" style={{ display: 'inline-flex' }}><Zap size={13} /> Step by step</div>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', marginBottom: '1rem' }}>
              From zero to live in{' '}
              <span style={{ color: 'var(--gold-400)', position: 'relative' }}>
                5 minutes.
                <div style={{ position: 'absolute', bottom: -6, left: 0, right: 0 }}><GoldUnderline /></div>
              </span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto' }}>
              We eliminated all the tedious setup, prompt engineering, and complex configuration — so you can focus on your course.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Step list */}
            <div className="reveal flex flex-col" style={{ gap: '0.75rem' }}>
              {steps.map((s, i) => (
                <div key={s.id} className={`step-card ${activeStep === s.id ? 'active' : ''}`} style={activeStep !== s.id ? { background: 'rgba(255,255,255,0.04)' } : {}} onClick={() => setActiveStep(s.id)}>
                  <div className="step-icon">{s.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: activeStep === s.id ? 'var(--text-dark)' : 'rgba(255,255,255,0.8)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                      {i + 1}. {s.title}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: activeStep === s.id ? 'var(--text-muted-dark)' : 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Panel */}
            <div className="reveal reveal-d2" style={{ position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--cream)', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 480, border: '1px solid var(--border-strong)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative' }}>

                {activeStep === 1 && (
                  <div className="fade-slide text-center">
                    <div style={{ border: '2.5px dashed var(--gold-400)', borderRadius: 16, padding: '3rem 2rem', background: 'var(--cream-2)' }}>
                      <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <Upload size={30} color="#000" />
                      </div>
                      <h4 className="headline" style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-dark)' }}>Drop your knowledge base here</h4>
                      <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>PDFs, Word docs, TXT files, or website URLs</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        {['Syllabus.pdf', 'FAQ.pdf', 'yoursite.com/help'].map(f => (
                          <span key={f} className="badge badge-gold" style={{ fontSize: '0.75rem' }}><FileText size={10} />{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="fade-slide flex flex-col" style={{ gap: '1.25rem' }}>
                    <h4 className="headline" style={{ fontSize: '1.3rem', color: 'var(--text-dark)' }}>Configure your agent</h4>
                    <div>
                      <span className="label">Agent Name</span>
                      <input className="input" defaultValue="Support Bee" readOnly />
                    </div>
                    <div>
                      <span className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Response Tone</span> <span style={{ color: 'var(--gold-rich)' }}>Friendly & Empathetic</span>
                      </span>
                      <div style={{ height: 8, background: 'var(--cream-3)', borderRadius: 4, position: 'relative', marginTop: 8 }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '72%', background: 'linear-gradient(90deg, var(--gold-500), var(--gold-600))', borderRadius: 4 }} />
                        <div style={{ position: 'absolute', left: '72%', top: -8, width: 24, height: 24, background: 'white', border: '4px solid var(--gold-600)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }} />
                      </div>
                    </div>
                    <div style={{ background: 'var(--gold-100)', padding: '1rem', borderRadius: 12, border: '1px solid var(--gold-300)' }}>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>"Hi there! I'm here to help. What can I do for you today? 😊"</p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="fade-slide">
                    <h4 className="headline" style={{ fontSize: '1.3rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>Copy your embed script</h4>
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
                  <div className="fade-slide text-center">
                    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 1.5rem' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,193,7,0.2)', borderRadius: '50%', animation: 'ripple 2s infinite' }} />
                      <div style={{ position: 'absolute', inset: 15, background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-gold)' }}>
                        <Zap size={34} color="#000" />
                      </div>
                    </div>
                    <h3 className="headline" style={{ fontSize: '1.75rem', color: 'var(--text-dark)', marginBottom: 8 }}>You're Live! 🎉</h3>
                    <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.6 }}>Your BeeBot agent is now answering customer questions automatically — 24 hours a day, 7 days a week.</p>
                    <div style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--gold-100)', borderRadius: 'var(--radius-pill)', display: 'inline-block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-rich)', border: '1px solid var(--gold-300)' }}>
                      ✓ 0 tickets in queue
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
          FEATURES — DEEP DIVES
      ════════════════════════════════ */}
      <section id="features" style={{ padding: '8rem 0', background: 'var(--cream)' }}>
        <div className="section-num" style={{ top: '5%', right: '-1%' }}>02</div>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="badge badge-gold mb-4" style={{ display: 'inline-flex' }}><Database size={13} /> Vector Intelligence</div>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              It knows your course better than you do.
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted-dark)', maxWidth: 560, margin: '0 auto' }}>
              BeeBot uses enterprise-grade RAG (Retrieval-Augmented Generation) to search your documents in milliseconds — with zero hallucinations.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid-2" style={{ marginBottom: '6rem' }}>
            <div className="reveal">
              <div style={{ position: 'relative', padding: '2rem', background: 'var(--black-card)', borderRadius: 24, border: '1px solid rgba(255,193,7,0.2)', minHeight: 360, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                <DiagonalLines color="var(--gold-500)" opacity={0.05} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[{ l: 'Syllabus.pdf', c: 'badge-gold' }, { l: 'mycourse.com/faq', c: 'badge-dark' }, { l: 'helpdesk-logs.txt', c: 'badge-dark' }].map(b => (
                    <span key={b.l} className={`badge ${b.c}`} style={{ fontSize: '0.72rem' }}><FileText size={10} />{b.l}</span>
                  ))}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[0.7, 0.45, 0.85, 0.55].map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `rgba(255,193,7,${0.3 + i * 0.1})`, flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 7, width: `${w * 100}%`, background: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
                        <div style={{ height: 7, width: `${(1 - w * 0.4) * 60}%`, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))', color: '#000', padding: '10px 20px', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.85rem', transform: 'rotate(-2deg)', boxShadow: 'var(--shadow-gold)' }}>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: 6 }} />98% Accuracy
                </div>
              </div>
            </div>
            <div className="reveal reveal-d2">
              <div className="section-divider mb-6" />
              <h3 className="headline" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Answers pulled directly from your content — never invented.
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                BeeBot doesn't guess. It retrieves exact answers from the PDFs and URLs you uploaded, citing the source. If the answer isn't in your knowledge base, BeeBot says so — and escalates to you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['No hallucinations — only answers from your own content.', 'Auto-syncs with your website URLs every 24 hours.', 'Supports PDFs, Word docs, plain text, and web pages.'].map((f, i) => (
                  <div key={i} className="check-item">
                    <div className="check-circle"><CheckCircle size={13} /></div>
                    <p style={{ color: 'var(--text-dark)', fontSize: '0.97rem', lineHeight: 1.5 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid-2">
            <div className="reveal" style={{ order: 2 }}>
              <div className="section-divider mb-6" />
              <h3 className="headline" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                When it's too complex, a human steps in.
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                BeeBot handles 80% of routine questions automatically. For the 20% that need a human touch — like refund disputes or complex account issues — it smoothly escalates to your inbox with the full conversation context.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Detects frustration and emotional escalations automatically.', 'Collects customer email and sends full transcript to you.', 'Works with any helpdesk: email, Slack, Intercom, Zendesk.'].map((f, i) => (
                  <div key={i} className="check-item">
                    <div className="check-circle"><CheckCircle size={13} /></div>
                    <p style={{ color: 'var(--text-dark)', fontSize: '0.97rem', lineHeight: 1.5 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-d2" style={{ order: 1 }}>
              <div style={{ padding: '2rem', background: 'var(--cream-2)', borderRadius: 24, border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Conversation</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="chat-bubble-left">I need a refund — it's been 35 days, but I was hospitalized so I couldn't complete the course.</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div className="chat-avatar"><Bot size={12} /></div>
                    <div className="chat-bubble-left">I'm truly sorry to hear that. This is outside my standard authorization — let me connect you with our team right away so they can review your case personally.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--gold-100)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gold-300)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-rich)' }}>
                    <Zap size={13} fill="var(--gold-rich)" color="var(--gold-rich)" />
                    Escalating to support inbox with full context...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STATS — DARK SECTION
      ════════════════════════════════ */}
      <section style={{ padding: '7rem 0', background: 'var(--black-soft)', position: 'relative', overflow: 'hidden' }}>
        <DotGrid color="var(--gold-500)" opacity={0.06} />
        <div className="section-num" style={{ top: '-5%', left: '-2%', color: 'white' }}>03</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
            {[
              { val: '3.2M+', label: 'Questions Answered', sub: 'and counting' },
              { val: '$4.5M', label: 'Support Costs Saved', sub: 'by our users' },
              { val: '<1s', label: 'Avg Response Time', sub: 'lightning fast' },
              { val: '98%', label: 'Accuracy Rate', sub: 'no hallucinations' }
            ].map((s, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="stat-num" style={{ color: 'var(--gold-400)', marginBottom: 8 }}>{s.val}</div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{s.sub}</p>
                <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg, var(--gold-500), var(--gold-300))', margin: '1rem auto 0', borderRadius: 2 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--cream-2)' }}>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="var(--gold-500)" color="var(--gold-500)" />)}
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-dark)' }}>
              Loved by course creators.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {[
              { name: 'Sarah Jenkins', role: 'Founder, Digital Course Academy', color: 'white', textColor: 'var(--text-dark)', quote: 'BeeBot replaced our bloated Zendesk setup in one afternoon. Ticket volume dropped 60% overnight. My students get instant answers at 2am and I sleep soundly.' },
              { name: 'Marcus Thorne', role: 'Fitness Coach & Educator', color: 'var(--black)', textColor: 'white', quote: 'I was skeptical about AI sounding robotic. After adjusting the personality slider, my students genuinely think they\'re talking to my lead assistant. The handoff is flawless.', highlight: true },
              { name: 'Elena Rodriguez', role: 'Tech Skills Bootcamp', color: 'var(--gold-500)', textColor: 'var(--black)', quote: 'Setup took exactly 4 minutes. I uploaded our 50-page course FAQ and BeeBot parsed it instantly. It\'s the most valuable tool in my stack — by far.' }
            ].map((t, i) => (
              <div key={i} className={`reveal card`} style={{ background: t.color, padding: '2.5rem', transitionDelay: `${i * 0.15}s`, borderRadius: 'var(--radius-xl)', marginTop: i === 1 ? '2rem' : 0, border: t.highlight ? '1px solid rgba(255,193,7,0.2)' : undefined }}>
                <div className="quote-mark" style={{ top: 10, left: 20, color: t.textColor }}>"</div>
                <p style={{ fontSize: '1rem', color: t.textColor, lineHeight: 1.7, marginBottom: '2rem', position: 'relative', fontStyle: 'italic', opacity: t.color === 'var(--black)' ? 0.9 : 1 }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.color === 'var(--gold-500)' ? 'rgba(0,0,0,0.2)' : 'rgba(255,193,7,0.2)', border: `2px solid rgba(255,193,7,${t.color === 'var(--black)' ? 0.3 : 0.5})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color={t.textColor} opacity={0.6} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: t.textColor, marginBottom: 2 }}>{t.name}</p>
                    <p style={{ fontSize: '0.82rem', color: t.textColor, opacity: 0.65 }}>{t.role}</p>
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
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Simple, transparent pricing.
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted-dark)', maxWidth: 520, margin: '0 auto' }}>
              Start free. Upgrade when you're ready to scale. No hidden fees, ever.
            </p>
          </div>

          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) minmax(280px, 440px)', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>

            {/* Starter */}
            <div className="reveal card price-card">
              <div className="badge badge-cream mb-4" style={{ display: 'inline-flex' }}>Starter</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '0.5rem' }}>
                <span className="price-amount" style={{ color: 'var(--text-dark)' }}>$0</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '1rem' }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem', lineHeight: 1.5, fontSize: '0.95rem' }}>Perfect for new creators validating their first course.</p>
              <div style={{ flex: 1 }}>
                {['1 BeeBot Widget', 'Up to 500 messages/month', '10 document uploads', 'Basic analytics dashboard', 'Email support'].map((f, i) => (
                  <div key={i} className="price-feature">
                    <div className="check-circle" style={{ width: 20, height: 20, flexShrink: 0 }}><CheckCircle size={11} /></div>
                    <span style={{ fontSize: '0.93rem', color: 'var(--text-dark)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '2rem', borderRadius: 'var(--radius-pill)' }}>
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="reveal reveal-d2" style={{ background: 'var(--black)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', transform: 'scale(1.04)', zIndex: 10, border: '1px solid rgba(255,193,7,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
              <DotGrid color="var(--gold-500)" opacity={0.05} />
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))', color: '#000', padding: '6px 24px', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(255,193,7,0.4)' }}>
                ✦ Most Popular
              </div>
              <div className="price-card" style={{ position: 'relative', zIndex: 1 }}>
                <div className="badge badge-dark mb-4" style={{ display: 'inline-flex' }}>Pro</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '0.5rem' }}>
                  <span className="price-amount" style={{ color: 'var(--gold-400)' }}>$49</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>/month</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: 1.5, fontSize: '0.95rem' }}>Everything you need to automate customer support at scale.</p>
                <div style={{ flex: 1 }}>
                  {['Unlimited Bot Widgets', '10,000 messages/month', 'Unlimited document uploads', 'Custom agent personality & branding', 'Auto URL sync every 24 hours', 'Human handoff to your inbox', 'Priority support + onboarding call'].map((f, i) => (
                    <div key={i} className="price-feature-dark">
                      <div className="check-circle" style={{ width: 20, height: 20, flexShrink: 0 }}><CheckCircle size={11} /></div>
                      <span style={{ fontSize: '0.93rem', color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gold" style={{ width: '100%', padding: '16px', justifyContent: 'center', marginTop: '2rem', borderRadius: 'var(--radius-pill)', fontSize: '1rem' }}>
                  Start 14-Day Free Trial <ArrowRight size={16} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: '1rem' }}>No credit card required to start</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FAQ
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--cream-2)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '5rem', alignItems: 'flex-start' }} className="grid-2">
            <div className="reveal" style={{ position: 'sticky', top: 120 }}>
              <div className="badge badge-gold mb-4" style={{ display: 'inline-flex' }}>FAQ</div>
              <h2 className="headline" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--text-dark)', marginBottom: '1.5rem', lineHeight: 1.15 }}>
                Frequently asked questions.
              </h2>
              <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Can't find what you're looking for? Reach out to our (human) team at{' '}
                <a href="mailto:help@beebot.ai" style={{ color: 'var(--gold-rich)', fontWeight: 600, textDecoration: 'none' }}>help@beebot.ai</a>
              </p>
              <GoldUnderline width="120px" />
            </div>

            <div className="reveal reveal-d2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { q: 'Do I need to know how to code?', a: 'Not at all. If you can copy and paste a single line of text into your website platform — Kajabi, Teachable, WordPress, Webflow, Squarespace — you can install BeeBot in under 5 minutes.' },
                { q: 'How accurate is BeeBot really?', a: 'BeeBot uses strict RAG (Retrieval-Augmented Generation) indexing, meaning it only answers based on the content you uploaded. It\'s heavily configured to refuse to answer questions outside its knowledge base, which eliminates hallucinations entirely.' },
                { q: 'What happens when a question is too complex?', a: 'BeeBot detects frustration, emotional urgency, and questions outside its knowledge base. When this happens, it gracefully offers to collect the user\'s email and forwards the full transcript to your support inbox or helpdesk.' },
                { q: 'Can I use BeeBot on multiple websites?', a: 'Yes. The Pro plan lets you create multiple bots with separate knowledge bases, personalities, and embed codes — each deployable on different domains.' },
                { q: 'What file types can I upload?', a: 'BeeBot supports PDF, Word documents (.docx), plain text files (.txt), and any public web URLs. You can also manually paste in text content like FAQ sections or policy documents.' }
              ].map((faq, i) => (
                <details key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', borderLeft: '4px solid var(--gold-500)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <summary style={{ padding: '1.4rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)', outline: 'none', userSelect: 'none' }}>
                    {faq.q}
                    <ChevronDown size={18} className="faq-arrow" color="var(--gold-rich)" style={{ flexShrink: 0, marginLeft: 12 }} />
                  </summary>
                  <div className="faq-answer" style={{ padding: '0 1.75rem 1.5rem', color: 'var(--text-muted-dark)', lineHeight: 1.7, fontSize: '0.97rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FINAL CTA
      ════════════════════════════════ */}
      <section style={{ padding: '8rem 0', background: 'var(--black)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <HoneycombBg />
        <div style={{ position: 'absolute', top: '10%', right: '5%', opacity: 0.12 }}>
          <GoldenBee size={220} />
        </div>

        <div className="container reveal text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-dark mb-6" style={{ display: 'inline-flex' }}><SparkSVG size={14} /> Start free today</div>
          <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: 'white', marginBottom: '1.5rem', lineHeight: 1.05 }}>
            Stop answering tickets.<br />
            <span style={{ color: 'var(--gold-400)' }}>Start scaling.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 3rem', lineHeight: 1.65 }}>
            Deploy your expert AI support agent in 5 minutes flat. 14-day free trial on Pro. Cancel anytime — no questions asked.
          </p>
          <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-gold" style={{ padding: '18px 44px', fontSize: '1.15rem' }}>
              Get Started Free <ArrowRight size={20} />
            </button>
            <button className="btn btn-ghost-white" style={{ padding: '18px 36px', fontSize: '1.05rem' }}>
              Book a Demo
            </button>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{ background: 'var(--black-soft)', borderTop: '1px solid rgba(255,193,7,0.12)', padding: '5rem 0 2.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative large text */}
        <div style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '14rem', color: 'rgba(255,193,7,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>Bee.</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Top: Logo + Description + Newsletter */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '4rem' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div className="logo-mark"><Bot size={20} /></div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'white' }}>BeeBot.</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: 280, marginBottom: '1.5rem' }}>
                The AI customer support platform built specifically for online course creators and educators. No code, no complexity.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Twitter', 'LinkedIn', 'YouTube'].map(s => (
                  <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1.25rem' }}>Product</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'].map(l => (
                  <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.93rem', transition: 'color 0.2s', display: 'block' }}
                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1.25rem' }}>Company</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {['Blog', 'Documentation', 'Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                  <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.93rem', transition: 'color 0.2s', display: 'block' }}
                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 style={{ color: 'var(--gold-400)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1.25rem' }}>Stay in the loop</h5>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>Get product updates and tips for course creators — no spam, ever.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="you@example.com" style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
                <button className="btn btn-gold" style={{ padding: '10px 16px', fontSize: '0.85rem', flexShrink: 0 }}>→</button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="gold-line" style={{ marginBottom: '2rem' }} />

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
              © {new Date().getFullYear()} BeeBot AI Inc. Made with ☕ in San Francisco.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }} />
                All systems operational
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)' }}>SOC 2 compliant</span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)' }}>GDPR ready</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;