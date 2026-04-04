/**
 * BeeBot Chat Widget — v3 Logic + v4 UI
 * Drop-in chat widget. Reads config from <script> tag attributes.
 *
 * Usage:
 *   <script src="https://your-domain.com/widget.js"
 *           data-api-key="beebot_live_xxxxxxxx"
 *           data-api-url="https://your-api-domain.com/api"
 *           defer>
 *   </script>
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * 1. CONFIG FROM <script> TAG
   * ───────────────────────────────────────────────────────────────────────── */
  const scriptTag =
    document.currentScript ||
    Array.from(document.getElementsByTagName('script')).find(
      (s) => s.src && s.src.includes('widget.js')
    );

  const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;
  const API_URL = scriptTag ? scriptTag.getAttribute('data-api-url') : null;

  if (!API_KEY || !API_URL) {
    console.error('[BeeBot] Missing data-api-key or data-api-url on <script> tag.');
    return;
  }

  const WIDGET_BASE_URL = (() => {
    const s = document.querySelector('script[src*="widget.js"]');
    if (s) {
      try { return new URL(s.src).origin; } catch (_) {}
    }
    return '';
  })();

  const BEE_LOGO_URL = `${WIDGET_BASE_URL}/bee-chat.png`;

  /* ─────────────────────────────────────────────────────────────────────────
   * 2. VISITOR ID
   * ───────────────────────────────────────────────────────────────────────── */
  const getVisitorId = () => {
    const KEY = 'beebot_visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem(KEY, id);
    }
    return id;
  };
  const VISITOR_ID = getVisitorId();

  /* ─────────────────────────────────────────────────────────────────────────
   * 3. SESSION PERSISTENCE — 7-day TTL
   * ───────────────────────────────────────────────────────────────────────── */
  const SESSION_KEY = `beebot_session_${VISITOR_ID}`;
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

  const loadSession = () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (Date.now() - s.savedAt > SESSION_TTL) { localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    } catch (_) { return null; }
  };

  const saveSession = (messages, conversationId) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ messages, conversationId, savedAt: Date.now() }));
    } catch (_) {}
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 4. MARKDOWN RENDERER  (safe, no external lib)
   * ───────────────────────────────────────────────────────────────────────── */
  const renderMarkdown = (text) => {
    if (!text) return '';

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
      `<pre class="bb-code-block"><code>${code.trim()}</code></pre>`
    );
    html = html.replace(/`([^`\n]+)`/g, '<code class="bb-inline-code">$1</code>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    html = html.replace(/^### (.+)$/gm, '<h4 class="bb-md-h3">$1</h4>');
    html = html.replace(/^## (.+)$/gm,  '<h3 class="bb-md-h2">$1</h3>');
    html = html.replace(/^# (.+)$/gm,   '<h2 class="bb-md-h1">$1</h2>');
    html = html.replace(/((?:^\d+\..+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map((line) => {
        const m = line.match(/^\d+\.\s+(.*)/);
        return m ? `<li>${m[1]}</li>` : '';
      }).join('');
      return `<ol class="bb-md-ol">${items}</ol>`;
    });
    html = html.replace(/((?:^[-*]\s.+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map((line) => {
        const m = line.match(/^[-*]\s+(.*)/);
        return m ? `<li>${m[1]}</li>` : '';
      }).join('');
      return `<ul class="bb-md-ul">${items}</ul>`;
    });
    html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote class="bb-md-quote">$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr class="bb-md-hr">');
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="bb-md-link">$1</a>'
    );
    html = html
      .split(/\n{2,}/)
      .map((para) => {
        para = para.trim();
        if (!para) return '';
        if (/^<(ul|ol|pre|blockquote|h[2-4]|hr)/.test(para)) return para;
        return `<p class="bb-md-p">${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return html;
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 5. TIME FORMATTING
   * ───────────────────────────────────────────────────────────────────────── */
  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 6. FETCH CONFIG FROM BACKEND
   * ───────────────────────────────────────────────────────────────────────── */
  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/config`, {
        headers: { 'x-api-key': API_KEY },
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return {};
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 7. BUILD WIDGET
   * ───────────────────────────────────────────────────────────────────────── */
  const buildWidget = (botConfig) => {
    const PRIMARY  = botConfig.primary_color   || '#6C47FF';
    const BOT_NAME = botConfig.bot_name        || 'BeeBot Support';
    const TAGLINE  = botConfig.tagline         || 'AI-powered support, always on';
    const WELCOME  = botConfig.welcome_message || `Hi there 👋\nWelcome to ${BOT_NAME}!`;
    const STARTERS = Array.isArray(botConfig.conversation_starters) ? botConfig.conversation_starters : [];

    // Derive a slightly darker shade for gradient
    const PRIMARY_DARK = adjustColor(PRIMARY, -20);

    function adjustColor(hex, amount) {
      try {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
      } catch (_) { return hex; }
    }

    const savedSession  = loadSession();
    let sessionMessages = savedSession ? savedSession.messages      : [];
    let conversationId  = savedSession ? savedSession.conversationId : null;
    let unreadCount     = 0;
    let isBusy          = false;
    let isOpen          = false;
    let activeView      = 'home'; // 'home' | 'chat'

    /* ── SVG ICONS ── */
    const IC = {
      send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
      back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
      more: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>`,
      chat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      agent: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      bot: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>`,
      chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
      sparkle: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>`,
      newChat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
    };

    /* ── CSS (v4 Design) ── */
    const CSS = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ══════════════════════════════════════════════
         LAUNCHER BUBBLE — bigger icon (68px)
      ══════════════════════════════════════════════ */
      #bb-launcher {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: ${PRIMARY};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
        outline: none;
        overflow: visible;
        box-shadow: 0 4px 24px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
      }
      #bb-launcher:hover {
        transform: scale(1.08);
        box-shadow: 0 8px 32px rgba(0,0,0,0.28);
      }
      #bb-launcher:active { transform: scale(0.94); }

      #bb-launcher .bb-launch-inner {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: ${PRIMARY};
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      #bb-launcher img.bb-launch-img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
      }
      #bb-launcher .bb-launch-close-icon {
        position: absolute;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.5) rotate(-90deg);
        transition: opacity 0.2s, transform 0.2s;
      }
      #bb-launcher.open img.bb-launch-img {
        opacity: 0;
        transform: scale(0.5) rotate(90deg);
      }
      #bb-launcher.open .bb-launch-close-icon {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      /* Pulse ring */
      #bb-launcher::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid ${PRIMARY};
        opacity: 0;
        animation: bbPulse 3s ease-out infinite;
      }
      @keyframes bbPulse {
        0%   { opacity: 0.5; transform: scale(1); }
        100% { opacity: 0;   transform: scale(1.55); }
      }

      /* ── Unread Badge ── */
      #bb-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        font-family: 'DM Sans', -apple-system, sans-serif;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        border: 2.5px solid #fff;
        line-height: 1;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(239,68,68,0.4);
      }
      #bb-badge.visible { display: flex; }

      /* ══════════════════════════════════════════════
         MAIN WIDGET WINDOW
      ══════════════════════════════════════════════ */
      #bb-window {
        position: fixed;
        bottom: 112px;
        right: 28px;
        width: 390px;
        height: 640px;
        max-height: calc(100dvh - 128px);
        min-height: 480px;
        min-width: 320px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow:
          0 0 0 1px rgba(0,0,0,0.05),
          0 24px 64px rgba(0,0,0,0.14),
          0 8px 24px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        line-height: 1.55;
        color: #111;
        opacity: 0;
        transform: translateY(20px) scale(0.96);
        pointer-events: none;
        transition: opacity 0.28s cubic-bezier(.4,0,.2,1), transform 0.28s cubic-bezier(.4,0,.2,1);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      #bb-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }

      /* ══════════════════════════════════════════════
         HOME VIEW
      ══════════════════════════════════════════════ */
      #bb-home {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      #bb-home.hidden { display: none; }

      /* Hero header */
      .bb-home-header {
        background: linear-gradient(145deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%);
        padding: 22px 20px 36px;
        position: relative;
        flex-shrink: 0;
        overflow: hidden;
      }
      .bb-home-header::before {
        content: '';
        position: absolute;
        top: -40px; right: -40px;
        width: 180px; height: 180px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        pointer-events: none;
      }
      .bb-home-header::after {
        content: '';
        position: absolute;
        bottom: -60px; left: -20px;
        width: 140px; height: 140px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        pointer-events: none;
      }

      .bb-home-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        position: relative;
        z-index: 1;
      }
      .bb-home-logo {
        display: flex;
        align-items: center;
        gap: 9px;
        cursor: pointer;
        text-decoration: none;
      }
      .bb-home-logo-img-wrap {
        width: 30px; height: 30px;
        border-radius: 8px;
        background: rgba(255,255,255,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .bb-home-logo-img-wrap img {
        width: 22px; height: 22px;
        object-fit: cover;
        border-radius: 4px;
      }
      .bb-home-logo span {
        color: rgba(255,255,255,0.92);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.1px;
      }
      .bb-home-close {
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        width: 30px; height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: rgba(255,255,255,0.85);
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .bb-home-close:hover {
        background: rgba(255,255,255,0.25);
        color: #fff;
      }

      .bb-home-greeting {
        color: #fff;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: -0.4px;
        position: relative;
        z-index: 1;
      }
      .bb-home-sub {
        color: rgba(255,255,255,0.72);
        font-size: 13.5px;
        margin-top: 5px;
        font-weight: 400;
        position: relative;
        z-index: 1;
        line-height: 1.5;
      }

      /* Online status row */
      .bb-home-status {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 14px;
        position: relative;
        z-index: 1;
      }
      .bb-status-avatars { display: flex; align-items: center; }
      .bb-status-avatar {
        width: 28px; height: 28px;
        border-radius: 50%;
        border: 2px solid ${PRIMARY};
        overflow: hidden;
        margin-left: -7px;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .bb-status-avatar:first-child { margin-left: 0; }
      .bb-status-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .bb-status-text {
        color: rgba(255,255,255,0.78);
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .bb-online-dot {
        display: inline-block;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #4ade80;
        animation: bbPulseGreen 2.5s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes bbPulseGreen {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.5; }
      }

      /* Scrollable home body */
      .bb-home-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e0e0e0 transparent;
        display: flex;
        flex-direction: column;
      }
      .bb-home-body::-webkit-scrollbar { width: 4px; }
      .bb-home-body::-webkit-scrollbar-track { background: transparent; }
      .bb-home-body::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

      /* Chat action card */
      .bb-home-cards {
        padding: 0 14px;
        margin-top: -18px;
        flex-shrink: 0;
      }
      .bb-home-card {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04);
        overflow: hidden;
      }
      .bb-home-card-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 16px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: 'DM Sans', inherit;
        font-size: 14px;
        color: #111;
        font-weight: 600;
        transition: background 0.15s;
        gap: 12px;
      }
      .bb-home-card-btn:hover { background: #fafafa; }
      .bb-home-card-btn-left {
        display: flex;
        align-items: center;
        gap: 13px;
        flex: 1;
        min-width: 0;
      }
      .bb-home-card-icon {
        width: 38px; height: 38px;
        border-radius: 10px;
        background: ${PRIMARY}18;
        color: ${PRIMARY};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s;
      }
      .bb-home-card-btn:hover .bb-home-card-icon { background: ${PRIMARY}28; }
      .bb-home-card-text { min-width: 0; }
      .bb-home-card-title {
        font-size: 13.5px;
        font-weight: 600;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      .bb-home-card-desc {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 400;
      }
      .bb-home-card-arrow {
        color: #ccc;
        flex-shrink: 0;
        transition: transform 0.15s, color 0.15s;
      }
      .bb-home-card-btn:hover .bb-home-card-arrow {
        transform: translateX(2px);
        color: #999;
      }

      /* Popular questions */
      .bb-home-starters {
        padding: 20px 14px 0;
        flex-shrink: 0;
      }
      .bb-home-section-label {
        font-size: 11px;
        font-weight: 600;
        color: #bbb;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        margin-bottom: 10px;
        padding: 0 2px;
      }
      .bb-starter-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 14px;
        background: #f9f9f9;
        border: 1px solid #eeeeee;
        border-radius: 11px;
        font-size: 13px;
        font-family: 'DM Sans', inherit;
        color: #333;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s, border-color 0.15s, transform 0.15s;
        gap: 10px;
        width: 100%;
        margin-bottom: 7px;
        line-height: 1.4;
      }
      .bb-starter-chip:hover {
        background: #f2f2f2;
        border-color: #e0e0e0;
        transform: translateX(2px);
      }
      .bb-starter-chip-icon { color: ${PRIMARY}; flex-shrink: 0; opacity: 0.7; }
      .bb-starter-chip-arrow { color: #ccc; flex-shrink: 0; transition: transform 0.15s; }
      .bb-starter-chip:hover .bb-starter-chip-arrow {
        transform: translateX(2px);
        color: #aaa;
      }

      /* Home footer */
      .bb-home-footer {
        padding: 16px 14px 18px;
        text-align: center;
        flex-shrink: 0;
        margin-top: auto;
      }
      .bb-powered {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        color: #ccc;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.15s;
        cursor: pointer;
      }
      .bb-powered:hover { color: #999; }
      .bb-powered-bee { font-size: 14px; }

      /* ══════════════════════════════════════════════
         CHAT VIEW
      ══════════════════════════════════════════════ */
      #bb-chat {
        display: none;
        flex-direction: column;
        height: 100%;
      }
      #bb-chat.active { display: flex; }

      /* Chat header — white bg, black text */
      .bb-chat-header {
        padding: 0 14px;
        height: 58px;
        background: #ffffff;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        user-select: none;
        position: relative;
      }
      .bb-chat-back {
        background: #f5f5f5;
        border: none;
        border-radius: 50%;
        width: 32px; height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #555;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .bb-chat-back:hover { background: #eaeaea; color: #222; }
      .bb-chat-header-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
      }
      .bb-chat-avatar {
        width: 34px; height: 34px;
        border-radius: 50%;
        background: #f0f0f0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
      }
      .bb-chat-avatar img { width: 34px; height: 34px; object-fit: cover; }
      .bb-chat-avatar-badge {
        position: absolute;
        bottom: 0; right: 0;
        width: 9px; height: 9px;
        border-radius: 50%;
        background: #22c55e;
        border: 1.5px solid #fff;
      }
      .bb-chat-header-text { min-width: 0; }
      .bb-chat-header-name {
        color: #111;
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        letter-spacing: -0.2px;
      }
      .bb-chat-header-sub {
        color: #aaa;
        font-size: 11.5px;
        margin-top: 1px;
        font-weight: 400;
      }
      .bb-chat-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .bb-chat-hbtn {
        background: transparent;
        border: none;
        border-radius: 8px;
        width: 32px; height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #aaa;
        transition: background 0.15s, color 0.15s;
      }
      .bb-chat-hbtn:hover { background: #f5f5f5; color: #555; }

      /* Dropdown menu */
      .bb-dropdown {
        position: absolute;
        top: 54px; right: 12px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
        min-width: 190px;
        z-index: 20;
        overflow: hidden;
        display: none;
        animation: bbDropIn 0.15s ease;
      }
      @keyframes bbDropIn {
        from { opacity: 0; transform: translateY(-6px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .bb-dropdown.open { display: block; }
      .bb-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 14px;
        cursor: pointer;
        font-size: 13px;
        color: #333;
        transition: background 0.12s;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: 'DM Sans', inherit;
        font-weight: 500;
      }
      .bb-dropdown-item:hover { background: #f7f7f7; }
      .bb-dropdown-item.danger { color: #ef4444; }
      .bb-dropdown-divider { height: 1px; background: #f3f3f3; margin: 2px 0; }

      /* Date separator */
      .bb-date-sep {
        text-align: center;
        font-size: 11px;
        color: #bbb;
        font-weight: 500;
        padding: 8px 0 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bb-date-sep::before,
      .bb-date-sep::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e8e8e8;
      }

      /* Messages — white bg */
      .bb-messages {
        flex: 1;
        padding: 16px 14px 10px;
        overflow-y: auto;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 0;
        scrollbar-width: thin;
        scrollbar-color: #e8e8e8 transparent;
      }
      .bb-messages::-webkit-scrollbar { width: 4px; }
      .bb-messages::-webkit-scrollbar-track { background: transparent; }
      .bb-messages::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 2px; }

      /* Message rows */
      .bb-row {
        display: flex;
        flex-direction: column;
        max-width: 82%;
        gap: 3px;
      }
      .bb-row.bot   { align-self: flex-start; }
      .bb-row.user  { align-self: flex-end; }
      .bb-row.error { align-self: flex-start; }
      .bb-row + .bb-row { margin-top: 12px; }
      .bb-row.bot  + .bb-row.bot  { margin-top: 5px; }
      .bb-row.user + .bb-row.user { margin-top: 5px; }

      /* Sender label */
      .bb-sender {
        font-size: 11px;
        color: #bbb;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 3px;
        padding: 0 3px;
        letter-spacing: 0.1px;
      }
      .bb-row.user .bb-sender { flex-direction: row-reverse; color: #ccc; }

      /* Bubbles */
      .bb-bubble {
        padding: 10px 13px;
        font-size: 13.5px;
        line-height: 1.6;
        word-break: break-word;
        position: relative;
        animation: bbFadeUp 0.22s cubic-bezier(.4,0,.2,1) both;
      }
      @keyframes bbFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .bb-row.bot .bb-bubble {
        background: #f5f6f8;
        color: #111;
        border-radius: 5px 16px 16px 16px;
        border: 1px solid #eeeeee;
      }
      .bb-row.user .bb-bubble {
        background: #111111;
        color: #fff;
        border-radius: 16px 16px 5px 16px;
      }
      .bb-row.error .bb-bubble {
        background: #fff5f5;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 5px 16px 16px 16px;
        font-size: 13px;
      }

      /* Markdown */
      .bb-bubble .bb-md-p { margin: 0 0 8px; }
      .bb-bubble .bb-md-p:last-child { margin-bottom: 0; }
      .bb-bubble .bb-md-h1 { font-size: 15px; font-weight: 700; margin: 0 0 8px; }
      .bb-bubble .bb-md-h2 { font-size: 14px; font-weight: 700; margin: 0 0 6px; }
      .bb-bubble .bb-md-h3 { font-size: 13.5px; font-weight: 600; margin: 0 0 4px; color: #444; }
      .bb-bubble .bb-md-ul,
      .bb-bubble .bb-md-ol { margin: 6px 0 8px 16px; display: flex; flex-direction: column; gap: 3px; }
      .bb-bubble .bb-md-ul { list-style: disc; }
      .bb-bubble .bb-md-ol { list-style: decimal; }
      .bb-bubble .bb-md-ul li,
      .bb-bubble .bb-md-ol li { font-size: 13px; line-height: 1.55; }
      .bb-bubble .bb-md-quote {
        border-left: 3px solid #ddd;
        padding: 4px 10px;
        color: #777;
        font-style: italic;
        margin: 6px 0;
        font-size: 13px;
      }
      .bb-bubble .bb-md-hr { border: none; border-top: 1px solid #e8e8e8; margin: 10px 0; }
      .bb-bubble .bb-md-link { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; }
      .bb-bubble .bb-inline-code {
        background: #f0f0f0;
        color: #c0392b;
        padding: 1px 5px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, monospace;
        font-size: 12px;
      }
      .bb-bubble .bb-code-block {
        background: #1a1a2e;
        color: #e2e8f0;
        padding: 10px 12px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'SFMono-Regular', Consolas, monospace;
        font-size: 11.5px;
        line-height: 1.6;
        margin: 6px 0;
        white-space: pre;
      }
      .bb-bubble strong { font-weight: 700; }
      .bb-bubble em     { font-style: italic; }
      .bb-bubble del    { text-decoration: line-through; opacity: 0.65; }

      /* Resolution prompt */
      .bb-resolve-prompt {
        margin: 8px 0 4px;
        padding: 12px 14px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: bbFadeUp 0.3s ease both;
      }
      .bb-resolve-prompt p {
        font-size: 13px;
        color: #374151;
        font-weight: 500;
        margin: 0;
        line-height: 1.45;
      }
      .bb-resolve-btns { display: flex; gap: 7px; }
      .bb-resolve-yes, .bb-resolve-no {
        flex: 1;
        padding: 8px 10px;
        border-radius: 9px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        outline: none;
        transition: opacity 0.18s, transform 0.12s;
        min-height: 34px;
        font-family: 'DM Sans', inherit;
      }
      .bb-resolve-yes:hover, .bb-resolve-no:hover { opacity: 0.82; }
      .bb-resolve-yes:active, .bb-resolve-no:active { transform: scale(0.97); }
      .bb-resolve-yes { background: #111; color: #fff; }
      .bb-resolve-no  { background: #f0f0f0; color: #444; }
      .bb-resolve-done {
        font-size: 12.5px;
        color: #6b7280;
        text-align: center;
        padding: 4px 0;
        font-style: italic;
      }

      /* Timestamp */
      .bb-ts {
        font-size: 10.5px;
        color: #ccc;
        padding: 0 3px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .bb-row.user .bb-ts { justify-content: flex-end; color: #bbb; }
      .bb-tick { color: #6ee7b7; font-size: 11px; }

      /* Typing indicator */
      .bb-typing {
        align-self: flex-start;
        background: #f5f6f8;
        border: 1px solid #eeeeee;
        padding: 11px 15px;
        border-radius: 5px 16px 16px 16px;
        display: none;
        gap: 5px;
        margin-top: 5px;
      }
      .bb-typing.active { display: flex; }
      .bb-dot {
        width: 7px; height: 7px;
        background: #ccc;
        border-radius: 50%;
        animation: bbBounce 1.3s infinite ease-in-out both;
      }
      .bb-dot:nth-child(2) { animation-delay: 0.16s; }
      .bb-dot:nth-child(3) { animation-delay: 0.32s; }
      @keyframes bbBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
        30%            { transform: translateY(-5px); opacity: 1; }
      }

      /* Chat starters */
      #bb-chat-starters {
        padding: 6px 14px 8px;
        background: #fff;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        border-top: 1px solid #f3f3f3;
      }
      #bb-chat-starters.hidden { display: none; }
      .bb-chat-starter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        background: #f5f5f5;
        border: 1px solid #ebebeb;
        border-radius: 20px;
        font-size: 12.5px;
        font-family: 'DM Sans', inherit;
        color: #444;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.14s, border-color 0.14s;
        line-height: 1.3;
      }
      .bb-chat-starter-chip:hover { background: #eeeeee; border-color: #e0e0e0; }

      /* Human handoff banner */
      #bb-handoff-banner {
        margin: 0 14px 10px;
        padding: 11px 14px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
        color: #166534;
        animation: bbFadeUp 0.25s ease both;
      }
      #bb-handoff-banner.visible { display: flex; }
      #bb-handoff-banner-text {
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 500;
      }
      #bb-handoff-banner-btn {
        background: #166534;
        color: #fff;
        border: none;
        padding: 6px 13px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'DM Sans', inherit;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background 0.15s;
      }
      #bb-handoff-banner-btn:hover { background: #14532d; }

      /* Input area */
      .bb-input-area {
        padding: 10px 12px 12px;
        background: #ffffff;
        border-top: 1px solid #f0f0f0;
        flex-shrink: 0;
      }
      .bb-input-wrap {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        background: #f8f8f8;
        border: 1.5px solid #e8e8e8;
        border-radius: 14px;
        padding: 8px 8px 8px 14px;
        transition: border-color 0.2s, background 0.2s;
      }
      .bb-input-wrap:focus-within {
        border-color: #d0d0d0;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
      }
      .bb-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 13.5px;
        font-family: 'DM Sans', inherit;
        background: transparent;
        color: #111;
        resize: none;
        min-height: 22px;
        max-height: 100px;
        line-height: 1.55;
        overflow-y: auto;
        padding: 2px 0;
        scrollbar-width: none;
        font-weight: 400;
      }
      .bb-input::-webkit-scrollbar { display: none; }
      .bb-input::placeholder { color: #bbb; font-weight: 400; }
      .bb-input:disabled { opacity: 0.45; cursor: not-allowed; }
      .bb-input-actions {
        display: flex;
        align-items: center;
        gap: 3px;
        flex-shrink: 0;
      }
      .bb-send {
        width: 34px; height: 34px;
        border-radius: 10px;
        background: #111;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        transition: opacity 0.15s, transform 0.12s;
        flex-shrink: 0;
      }
      .bb-send:hover { opacity: 0.80; }
      .bb-send:active { transform: scale(0.92); }
      .bb-send:disabled { opacity: 0.25; cursor: not-allowed; }
      .bb-input-footer { text-align: center; font-size: 11px; margin-top: 9px; }

      /* Mobile responsive */
      @media (max-width: 480px) {
        #bb-window {
          bottom: 0 !important;
          right: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          border-radius: 0 !important;
        }
        #bb-launcher { bottom: 20px; right: 20px; }
        .bb-home-greeting { font-size: 20px; }
      }
    `;

    /* ── HTML TEMPLATE ── */
    const HTML = `
      <!-- ── Launcher ── -->
      <button id="bb-launcher" aria-label="Open ${BOT_NAME} chat" title="Chat with us">
        <div class="bb-launch-inner">
          <img class="bb-launch-img" src="${BEE_LOGO_URL}" alt="${BOT_NAME}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span class="bb-launch-close-icon" style="display:none">${IC.close}</span>
        </div>
        <span id="bb-badge"></span>
      </button>

      <!-- ── Widget Window ── -->
      <div id="bb-window" role="dialog" aria-modal="true" aria-label="${BOT_NAME}">

        <!-- ══ HOME VIEW ══ -->
        <div id="bb-home">

          <!-- Hero header -->
          <div class="bb-home-header">
            <div class="bb-home-topbar">
              <a class="bb-home-logo" href="https://beebot.ai" target="_blank" rel="noopener" title="Visit BeeBot">
                <div class="bb-home-logo-img-wrap">
                  <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}"
                       onerror="this.parentNode.innerHTML='<span style=\\'color:#fff;font-weight:700;font-size:14px\\'>B</span>'">
                </div>
                <span>${BOT_NAME}</span>
              </a>
              <button class="bb-home-close" id="bb-home-close" aria-label="Close">${IC.close}</button>
            </div>
            <div class="bb-home-greeting">${WELCOME.replace(/\n/g, '<br>')}</div>
            <div class="bb-home-sub">${TAGLINE}</div>
            <div class="bb-home-status">
              <div class="bb-status-avatars">
                <div class="bb-status-avatar">
                  <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.parentNode.textContent='🐝'">
                </div>
              </div>
              <span class="bb-status-text">
                <span class="bb-online-dot"></span>
                Typically replies instantly
              </span>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="bb-home-body">

            <!-- Chat card -->
            <div class="bb-home-cards">
              <div class="bb-home-card">
                <button class="bb-home-card-btn" id="bb-home-start-chat" type="button" aria-label="Start a conversation">
                  <div class="bb-home-card-btn-left">
                    <div class="bb-home-card-icon">${IC.chat}</div>
                    <div class="bb-home-card-text">
                      <div class="bb-home-card-title">Send us a message</div>
                      <div class="bb-home-card-desc">Chat with our AI Support Agent</div>
                    </div>
                  </div>
                  <div class="bb-home-card-arrow">${IC.chevronRight}</div>
                </button>
              </div>
            </div>

            <!-- Popular questions -->
            ${STARTERS.length > 0 ? `
            <div class="bb-home-starters" id="bb-home-starters">
              <div class="bb-home-section-label">Popular questions</div>
              ${STARTERS.map(s => `
                <button class="bb-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button">
                  <span class="bb-starter-chip-icon">${IC.sparkle}</span>
                  <span style="flex:1">${s}</span>
                  <span class="bb-starter-chip-arrow">${IC.chevronRight}</span>
                </button>
              `).join('')}
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="bb-home-footer">
              <a class="bb-powered" href="https://beebot.ai" target="_blank" rel="noopener">
                <span class="bb-powered-bee">🐝</span>
                <span>Powered by BeeBot AI</span>
              </a>
            </div>

          </div><!-- /.bb-home-body -->
        </div>

        <!-- ══ CHAT VIEW ══ -->
        <div id="bb-chat">

          <!-- Header -->
          <div class="bb-chat-header">
            <button class="bb-chat-back" id="bb-chat-back" aria-label="Back to home">${IC.back}</button>
            <div class="bb-chat-header-info">
              <div class="bb-chat-avatar">
                <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
                <div class="bb-chat-avatar-badge"></div>
              </div>
              <div class="bb-chat-header-text">
                <div class="bb-chat-header-name">${BOT_NAME}</div>
                <div class="bb-chat-header-sub">AI Agent · Typically replies instantly</div>
              </div>
            </div>
            <div class="bb-chat-header-actions">
              <button class="bb-chat-hbtn" id="bb-talk-human-btn" aria-label="Talk to a human" title="Request human support">${IC.agent}</button>
              <button class="bb-chat-hbtn" id="bb-more-btn" aria-label="More options">${IC.more}</button>
            </div>
            <!-- Dropdown -->
            <div class="bb-dropdown" id="bb-dropdown">
              <button class="bb-dropdown-item" id="bb-new-chat-btn" type="button">${IC.newChat}&nbsp; New conversation</button>
              <div class="bb-dropdown-divider"></div>
              <button class="bb-dropdown-item danger" id="bb-close-chat-btn" type="button">${IC.close}&nbsp; Close chat</button>
            </div>
          </div>

          <!-- Messages -->
          <div class="bb-messages" id="bb-messages" aria-live="polite" aria-relevant="additions">
            <div class="bb-typing" id="bb-typing">
              <div class="bb-dot"></div>
              <div class="bb-dot"></div>
              <div class="bb-dot"></div>
            </div>
          </div>

          <!-- Chat starters -->
          <div id="bb-chat-starters" class="${STARTERS.length === 0 || sessionMessages.length > 0 ? 'hidden' : ''}">
            ${STARTERS.map(s => `
              <button class="bb-chat-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button">
                <span>${s}</span>
              </button>
            `).join('')}
          </div>

          <!-- Human handoff banner -->
          <div id="bb-handoff-banner">
            <div id="bb-handoff-banner-text">${IC.agent}&nbsp; Connect with a human agent</div>
            <button id="bb-handoff-banner-btn" type="button">Talk to a human</button>
          </div>

          <!-- Input -->
          <div class="bb-input-area">
            <div class="bb-input-wrap">
              <textarea
                id="bb-input"
                class="bb-input"
                placeholder="Ask a question…"
                rows="1"
                maxlength="2000"
                aria-label="Type your message"
              ></textarea>
              <div class="bb-input-actions">
                <button class="bb-send" id="bb-send" type="button" aria-label="Send message">${IC.send}</button>
              </div>
            </div>
            <div class="bb-input-footer">
              <a class="bb-powered" href="https://beebot.ai" target="_blank" rel="noopener">
                <span class="bb-powered-bee">🐝</span>
                <span>Powered by BeeBot AI</span>
              </a>
            </div>
          </div>
        </div>

      </div><!-- /#bb-window -->
    `;

    /* ── Mount Shadow DOM ── */
    const host = document.createElement('div');
    host.id = 'beebot-root';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Google Fonts inside shadow DOM
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap';
    shadow.appendChild(fontLink);

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HTML;
    shadow.appendChild(wrapper);

    /* ── Element refs ── */
    const launcher         = shadow.getElementById('bb-launcher');
    const window_          = shadow.getElementById('bb-window');
    const badge            = shadow.getElementById('bb-badge');
    const homeView         = shadow.getElementById('bb-home');
    const chatView         = shadow.getElementById('bb-chat');
    const homeClose        = shadow.getElementById('bb-home-close');
    const homeStartChat    = shadow.getElementById('bb-home-start-chat');
    const chatBack         = shadow.getElementById('bb-chat-back');
    const messagesEl       = shadow.getElementById('bb-messages');
    const typingEl         = shadow.getElementById('bb-typing');
    const chatStartersEl   = shadow.getElementById('bb-chat-starters');
    const handoffBanner    = shadow.getElementById('bb-handoff-banner');
    const handoffBannerBtn = shadow.getElementById('bb-handoff-banner-btn');
    const inputEl          = shadow.getElementById('bb-input');
    const sendBtn          = shadow.getElementById('bb-send');
    const talkHumanBtn     = shadow.getElementById('bb-talk-human-btn');
    const moreBtn          = shadow.getElementById('bb-more-btn');
    const dropdown         = shadow.getElementById('bb-dropdown');
    const newChatBtn       = shadow.getElementById('bb-new-chat-btn');
    const closeChatBtn     = shadow.getElementById('bb-close-chat-btn');

    /* ── STATE ── */
    let msgCount     = 0;
    let handoffShown = false;
    let dropdownOpen = false;

    /* ─────────────────────────────────────────────
       OPEN / CLOSE WIDGET
    ───────────────────────────────────────────── */
    const openWidget = () => {
      isOpen = true;
      launcher.classList.add('open');
      window_.classList.add('open');
      unreadCount = 0;
      badge.textContent = '';
      badge.classList.remove('visible');
    };

    const closeWidget = () => {
      isOpen = false;
      launcher.classList.remove('open');
      window_.classList.remove('open');
      dropdown.classList.remove('open');
      dropdownOpen = false;
    };

    launcher.addEventListener('click', () => isOpen ? closeWidget() : openWidget());
    homeClose.addEventListener('click', closeWidget);

    /* ─────────────────────────────────────────────
       HOME ↔ CHAT NAVIGATION
    ───────────────────────────────────────────── */
    const showView = (view) => {
      activeView = view;
      if (view === 'home') {
        homeView.classList.remove('hidden');
        chatView.classList.remove('active');
        chatView.classList.add('not-active');
        setTimeout(() => { chatView.style.display = 'none'; chatView.classList.remove('not-active'); }, 0);
        homeView.style.display = '';
      } else {
        homeView.classList.add('hidden');
        chatView.style.display = 'flex';
        chatView.classList.add('active');
        setTimeout(() => inputEl.focus(), 80);
      }
    };

    // Initialize correct view
    showView(sessionMessages.length > 0 ? 'chat' : 'home');

    homeStartChat.addEventListener('click', () => {
      showView('chat');
      if (!isOpen) openWidget();
    });

    chatBack.addEventListener('click', () => showView('home'));

    // Starters on home
    shadow.querySelectorAll('.bb-starter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        showView('chat');
        if (!isOpen) openWidget();
        inputEl.value = btn.dataset.starter;
        autoResizeInput();
        dispatchSend();
      });
    });

    /* ─────────────────────────────────────────────
       CHAT STARTERS
    ───────────────────────────────────────────── */
    if (chatStartersEl) {
      chatStartersEl.querySelectorAll('.bb-chat-starter-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          inputEl.value = btn.dataset.starter;
          autoResizeInput();
          chatStartersEl.classList.add('hidden');
          dispatchSend();
        });
      });
    }

    /* ─────────────────────────────────────────────
       DROPDOWN MENU
    ───────────────────────────────────────────── */
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      dropdown.classList.toggle('open', dropdownOpen);
    });

    shadow.addEventListener('click', () => {
      if (dropdownOpen) { dropdown.classList.remove('open'); dropdownOpen = false; }
    });

    newChatBtn.addEventListener('click', () => {
      dropdown.classList.remove('open'); dropdownOpen = false;
      clearConversation();
    });

    closeChatBtn.addEventListener('click', () => {
      dropdown.classList.remove('open'); dropdownOpen = false;
      closeWidget();
    });

    /* ─────────────────────────────────────────────
       HUMAN HANDOFF
    ───────────────────────────────────────────── */
    talkHumanBtn.addEventListener('click', () => {
      if (!handoffShown) {
        handoffBanner.classList.add('visible');
        handoffShown = true;
      } else {
        handoffBanner.classList.toggle('visible');
      }
    });

    handoffBannerBtn.addEventListener('click', () => {
      handoffBanner.classList.remove('visible');
      addMessage(
        'A support agent has been notified and will join shortly. Feel free to continue chatting in the meantime.',
        'bot',
        Date.now()
      );
      persistSession();
    });

    /* ─────────────────────────────────────────────
       CLEAR CONVERSATION
    ───────────────────────────────────────────── */
    const clearConversation = () => {
      messagesEl.querySelectorAll('.bb-row, .bb-date-sep').forEach((el) => el.remove());
      conversationId = null;
      msgCount = 0;
      handoffShown = false;
      handoffBanner.classList.remove('visible');
      if (chatStartersEl && STARTERS.length > 0) chatStartersEl.classList.remove('hidden');
      localStorage.removeItem(SESSION_KEY);
      addMessage(botConfig.welcome_message || `Hi there 👋 How can I help you today?`, 'bot', Date.now(), true);
    };

    /* ─────────────────────────────────────────────
       MESSAGE RENDERING
    ───────────────────────────────────────────── */
    const escapeHtml = (str) => String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const addMessage = (text, role, ts, isWelcome = false) => {
      const row = document.createElement('div');
      row.className = `bb-row ${role}`;

      if (!isWelcome) {
        const sender = document.createElement('div');
        sender.className = 'bb-sender';
        if (role === 'bot') {
          sender.innerHTML = `${IC.bot}&nbsp;${BOT_NAME}`;
        } else if (role === 'user') {
          sender.textContent = 'You';
        }
        row.appendChild(sender);
      }

      const bubble = document.createElement('div');
      bubble.className = 'bb-bubble';
      if (role === 'bot' || role === 'error') {
        bubble.innerHTML = renderMarkdown(text);
      } else {
        bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
      }
      row.appendChild(bubble);

      if (!isWelcome) {
        const tsDiv = document.createElement('div');
        tsDiv.className = 'bb-ts';
        const timeSpan = document.createElement('span');
        timeSpan.textContent = formatTime(ts);
        timeSpan.dataset.ts = ts;
        tsDiv.appendChild(timeSpan);
        if (role === 'user') {
          const tick = document.createElement('span');
          tick.className = 'bb-tick';
          tick.innerHTML = '✓✓';
          tick.title = 'Delivered';
          tsDiv.appendChild(tick);
        }
        row.appendChild(tsDiv);
      }

      messagesEl.insertBefore(row, typingEl);
      scrollToBottom();
      return row;
    };

    const addDateSeparator = (label) => {
      const sep = document.createElement('div');
      sep.className = 'bb-date-sep';
      sep.textContent = label;
      messagesEl.insertBefore(sep, typingEl);
    };

    const scrollToBottom = () => {
      requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
    };

    // Refresh relative timestamps every 30s
    setInterval(() => {
      messagesEl.querySelectorAll('.bb-ts span[data-ts]').forEach((el) => {
        el.textContent = formatTime(parseInt(el.dataset.ts, 10));
      });
    }, 30_000);

    /* ─────────────────────────────────────────────
       SESSION PERSIST
    ───────────────────────────────────────────── */
    const persistSession = () => {
      const msgs = [];
      messagesEl.querySelectorAll('.bb-row').forEach((row) => {
        const bubble = row.querySelector('.bb-bubble');
        const tsMeta = row.querySelector('.bb-ts span[data-ts]');
        if (!bubble || !tsMeta) return;
        const role = row.classList.contains('user') ? 'user'
          : row.classList.contains('error') ? 'error' : 'bot';
        msgs.push({ text: bubble.innerText || bubble.textContent, role, ts: parseInt(tsMeta.dataset.ts, 10) });
      });
      saveSession(msgs, conversationId);
    };

    /* ─────────────────────────────────────────────
       LOAD SESSION
    ───────────────────────────────────────────── */
    if (sessionMessages.length > 0) {
      addDateSeparator('Previous conversation');
      sessionMessages.forEach((m) => addMessage(m.text, m.role, m.ts));
      msgCount = sessionMessages.filter(m => m.role === 'user').length;
    } else {
      addMessage(botConfig.welcome_message || `Hi there 👋\nHow can I help you today?`, 'bot', Date.now(), true);
    }

    /* ─────────────────────────────────────────────
       LOADING STATE
    ───────────────────────────────────────────── */
    const setLoading = (loading) => {
      isBusy = loading;
      inputEl.disabled = loading;
      sendBtn.disabled = loading;
      typingEl.classList.toggle('active', loading);
      if (loading) scrollToBottom();
    };

    /* ─────────────────────────────────────────────
       AUTO-RESIZE TEXTAREA
    ───────────────────────────────────────────── */
    const autoResizeInput = () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    };
    inputEl.addEventListener('input', autoResizeInput);

    /* ─────────────────────────────────────────────
       RESOLUTION CONFIRMATION PROMPT
    ───────────────────────────────────────────── */
    const showResolutionPrompt = (convId) => {
      const existing = messagesEl.querySelector('.bb-resolve-prompt');
      if (existing) existing.remove();

      const prompt = document.createElement('div');
      prompt.className = 'bb-resolve-prompt';
      prompt.innerHTML = `
        <p>Did this answer your question?</p>
        <div class="bb-resolve-btns">
          <button class="bb-resolve-yes" type="button">Yes, resolved ✓</button>
          <button class="bb-resolve-no"  type="button">No, I need more help</button>
        </div>
      `;

      const yesBtn = prompt.querySelector('.bb-resolve-yes');
      const noBtn  = prompt.querySelector('.bb-resolve-no');

      yesBtn.addEventListener('click', async () => {
        yesBtn.disabled = true;
        noBtn.disabled  = true;
        prompt.innerHTML = '<p class="bb-resolve-done">Great! Glad we could help 🐝</p>';
        if (convId) {
          try {
            await fetch(`${API_URL}/chat/resolve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
              body: JSON.stringify({ conversation_id: convId, visitor_id: VISITOR_ID, resolved: true }),
            });
          } catch (_) {}
        }
        setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 3000);
      });

      noBtn.addEventListener('click', () => {
        if (prompt.parentNode) prompt.remove();
      });

      messagesEl.insertBefore(prompt, typingEl);
      scrollToBottom();
    };

    /* ─────────────────────────────────────────────
       SEND MESSAGE
    ───────────────────────────────────────────── */
    const dispatchSend = async () => {
      const query = inputEl.value.trim();
      if (!query || isBusy) return;

      if (chatStartersEl) chatStartersEl.classList.add('hidden');
      inputEl.value = '';
      inputEl.style.height = 'auto';

      const ts = Date.now();
      if (msgCount === 0) addDateSeparator(new Date(ts).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));

      addMessage(query, 'user', ts);
      setLoading(true);
      msgCount++;

      try {
        const body = { query, visitor_id: VISITOR_ID };
        if (conversationId) body.conversation_id = conversationId;

        const res  = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setLoading(false);

        if (res.ok && data.response) {
          addMessage(data.response, 'bot', Date.now());
          if (data.conversation_id) conversationId = data.conversation_id;
          showResolutionPrompt(conversationId);
          if (!isOpen) {
            unreadCount++;
            badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
            badge.classList.add('visible');
          }
        } else {
          addMessage(data.error || 'Something went wrong. Please try again.', 'error', Date.now());
        }
      } catch (_) {
        setLoading(false);
        addMessage('Could not reach the server. Please check your connection and try again.', 'error', Date.now());
      }

      persistSession();
    };

    sendBtn.addEventListener('click', dispatchSend);

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        dispatchSend();
      }
    });

    /* ─────────────────────────────────────────────
       KEYBOARD TRAP (Escape closes widget)
    ───────────────────────────────────────────── */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeWidget();
    });

  }; // end buildWidget

  /* ─────────────────────────────────────────────────────────────────────────
   * 8. BOOTSTRAP
   * ───────────────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fetchConfig().then(buildWidget));
  } else {
    fetchConfig().then(buildWidget);
  }

})();