/**
 * BeeBot Chat Widget v3 — Intercom Fin–style
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

    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks (``` ... ```)
    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
      `<pre class="bb-code-block"><code>${code.trim()}</code></pre>`
    );

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code class="bb-inline-code">$1</code>');

    // Bold + italic  ***text***
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold  **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic  *text*
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // Strikethrough  ~~text~~
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Headings (## H2, ### H3)
    html = html.replace(/^### (.+)$/gm, '<h4 class="bb-md-h3">$1</h4>');
    html = html.replace(/^## (.+)$/gm,  '<h3 class="bb-md-h2">$1</h3>');
    html = html.replace(/^# (.+)$/gm,   '<h2 class="bb-md-h1">$1</h2>');

    // Numbered lists
    html = html.replace(/((?:^\d+\..+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map((line) => {
        const m = line.match(/^\d+\.\s+(.*)/);
        return m ? `<li>${m[1]}</li>` : '';
      }).join('');
      return `<ol class="bb-md-ol">${items}</ol>`;
    });

    // Bullet lists  - or *
    html = html.replace(/((?:^[-*]\s.+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map((line) => {
        const m = line.match(/^[-*]\s+(.*)/);
        return m ? `<li>${m[1]}</li>` : '';
      }).join('');
      return `<ul class="bb-md-ul">${items}</ul>`;
    });

    // Blockquote  > text
    html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote class="bb-md-quote">$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="bb-md-hr">');

    // Links  [text](url)
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="bb-md-link">$1</a>'
    );

    // Line breaks (double newline → paragraph break, single → <br>)
    html = html
      .split(/\n{2,}/)
      .map((para) => {
        para = para.trim();
        if (!para) return '';
        // Don't wrap block-level elements in <p>
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
    const PRIMARY    = botConfig.primary_color  || '#6C47FF'; // Intercom-like purple default
    const BOT_NAME   = botConfig.bot_name       || 'BeeBot Support';
    const TAGLINE    = botConfig.tagline        || 'AI-powered support, always on';
    const WELCOME    = botConfig.welcome_message || `Hi there 👋\nWelcome to ${BOT_NAME}!`;
    const STARTERS   = Array.isArray(botConfig.conversation_starters) ? botConfig.conversation_starters : [];

    const savedSession  = loadSession();
    let sessionMessages = savedSession ? savedSession.messages  : [];
    let conversationId  = savedSession ? savedSession.conversationId : null;
    let unreadCount     = 0;
    let isBusy          = false;
    let isOpen          = false;
    let activeView      = 'home'; // 'home' | 'chat'

    /* ── SVG ICONS ── */
    const IC = {
      send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
      back: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
      more: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>`,
      chat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      agent: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      bot: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
      chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
      emoji: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      attach: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
      newChat: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
      sparkle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>`,
    };

    /* ── CSS ── */
    const CSS = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ══════════════════════════════════════════════
         LAUNCHER BUBBLE
      ══════════════════════════════════════════════ */
      #bb-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: ${PRIMARY};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(108,71,255,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
        transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
        outline: none;
        overflow: hidden;
      }
      #bb-launcher:hover {
        transform: scale(1.07);
        box-shadow: 0 8px 30px rgba(0,0,0,0.28);
      }
      #bb-launcher:active { transform: scale(0.95); }
      #bb-launcher img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        pointer-events: none;
      }
      #bb-launcher .bb-launch-icon {
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.18s, transform 0.18s;
      }
      #bb-launcher .bb-launch-close {
        position: absolute;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.6) rotate(-90deg);
        transition: opacity 0.18s, transform 0.18s;
      }
      #bb-launcher.open .bb-launch-icon {
        opacity: 0;
        transform: scale(0.6) rotate(90deg);
      }
      #bb-launcher.open .bb-launch-close {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      /* ── Unread Badge ── */
      #bb-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        font-family: -apple-system, sans-serif;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #fff;
        line-height: 1;
        pointer-events: none;
      }
      #bb-badge.visible { display: flex; }

      /* ══════════════════════════════════════════════
         MAIN WIDGET WINDOW
      ══════════════════════════════════════════════ */
      #bb-window {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 380px;
        height: 620px;
        max-height: calc(100dvh - 112px);
        min-height: 480px;
        background: #fff;
        border-radius: 16px;
        box-shadow:
          0 0 0 1px rgba(0,0,0,0.06),
          0 20px 60px rgba(0,0,0,0.16),
          0 4px 16px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #111;
        opacity: 0;
        transform: translateY(16px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.24s cubic-bezier(.4,0,.2,1), transform 0.24s cubic-bezier(.4,0,.2,1);
        -webkit-font-smoothing: antialiased;
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
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      #bb-home.hidden {
        display: none;
      }

      /* Hero header */
      .bb-home-header {
        background: linear-gradient(160deg, ${PRIMARY} 0%, ${PRIMARY}cc 100%);
        padding: 20px 20px 40px;
        position: relative;
        flex-shrink: 0;
      }
      .bb-home-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .bb-home-logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bb-home-logo img {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        object-fit: cover;
        background: rgba(255,255,255,0.15);
      }
      .bb-home-logo-fallback {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
      }
      .bb-home-logo span {
        color: rgba(255,255,255,0.9);
        font-size: 13px;
        font-weight: 600;
      }
      .bb-home-close {
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .bb-home-close:hover { background: rgba(255,255,255,0.25); }

      .bb-home-greeting {
        color: #fff;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: -0.3px;
      }
      .bb-home-sub {
        color: rgba(255,255,255,0.78);
        font-size: 14px;
        margin-top: 6px;
      }

      /* Agent avatar stack */
      .bb-avatar-stack {
        display: flex;
        align-items: center;
        margin-top: 16px;
      }
      .bb-avatar-stack-item {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2.5px solid ${PRIMARY};
        overflow: hidden;
        margin-left: -10px;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .bb-avatar-stack-item:first-child { margin-left: 0; }
      .bb-avatar-stack-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .bb-avatar-stack-label {
        margin-left: 10px;
        color: rgba(255,255,255,0.85);
        font-size: 12px;
        font-weight: 500;
      }
      .bb-online-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4ade80;
        margin-right: 4px;
        vertical-align: middle;
      }

      /* Card actions */
      .bb-home-cards {
        padding: 0 12px;
        margin-top: -24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
      }
      .bb-home-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      .bb-home-card-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        font-size: 14px;
        color: #111;
        font-weight: 600;
        transition: background 0.12s;
        gap: 10px;
      }
      .bb-home-card-btn:hover { background: #f8f8f8; }
      .bb-home-card-btn-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }
      .bb-home-card-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: ${PRIMARY}15;
        color: ${PRIMARY};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bb-home-card-text { min-width: 0; }
      .bb-home-card-title {
        font-size: 13px;
        font-weight: 600;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bb-home-card-desc {
        font-size: 12px;
        color: #888;
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bb-home-card-arrow { color: #bbb; flex-shrink: 0; }

      /* Starters in home */
      .bb-home-starters {
        padding: 12px 12px 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex-shrink: 0;
      }
      .bb-home-starters-label {
        font-size: 11px;
        font-weight: 600;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        padding: 0 4px;
        margin-bottom: 2px;
      }
      .bb-starter-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: #f8f9fa;
        border: 1px solid #eee;
        border-radius: 10px;
        font-size: 13px;
        font-family: inherit;
        color: #333;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.12s, border-color 0.12s, transform 0.1s;
        gap: 8px;
      }
      .bb-starter-chip:hover {
        background: #f1f1f1;
        border-color: #ddd;
        transform: translateX(2px);
      }
      .bb-starter-chip svg { color: #aaa; flex-shrink: 0; }

      /* Home footer */
      .bb-home-footer {
        margin-top: auto;
        padding: 12px;
        text-align: center;
        font-size: 11px;
        color: #bbb;
        flex-shrink: 0;
      }
      .bb-home-footer a { color: #bbb; text-decoration: none; }
      .bb-home-footer a:hover { color: #888; }

      /* ══════════════════════════════════════════════
         CHAT VIEW
      ══════════════════════════════════════════════ */
      #bb-chat {
        display: none;
        flex-direction: column;
        height: 100%;
      }
      #bb-chat.active { display: flex; }

      /* Chat header */
      .bb-chat-header {
        padding: 12px 14px 12px;
        background: ${PRIMARY};
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        user-select: none;
      }
      .bb-chat-back {
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .bb-chat-back:hover { background: rgba(255,255,255,0.25); }
      .bb-chat-header-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
      }
      .bb-chat-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
      }
      .bb-chat-avatar img {
        width: 34px;
        height: 34px;
        object-fit: cover;
      }
      .bb-chat-avatar-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #4ade80;
        border: 1.5px solid ${PRIMARY};
      }
      .bb-chat-header-text { min-width: 0; }
      .bb-chat-header-name {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bb-chat-header-sub {
        color: rgba(255,255,255,0.75);
        font-size: 11px;
        margin-top: 1px;
      }
      .bb-chat-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .bb-chat-hbtn {
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        transition: background 0.15s;
      }
      .bb-chat-hbtn:hover { background: rgba(255,255,255,0.25); }

      /* Dropdown menu */
      .bb-dropdown {
        position: absolute;
        top: 56px;
        right: 14px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06);
        min-width: 180px;
        z-index: 10;
        overflow: hidden;
        display: none;
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
        font-family: inherit;
      }
      .bb-dropdown-item:hover { background: #f5f5f5; }
      .bb-dropdown-item.danger { color: #ef4444; }
      .bb-dropdown-divider { height: 1px; background: #f0f0f0; }

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

      /* Messages area */
      .bb-messages {
        flex: 1;
        padding: 12px 14px 8px;
        overflow-y: auto;
        background: #f5f6f7;
        display: flex;
        flex-direction: column;
        gap: 2px;
        scrollbar-width: thin;
        scrollbar-color: #d0d0d0 transparent;
      }
      .bb-messages::-webkit-scrollbar { width: 4px; }
      .bb-messages::-webkit-scrollbar-track { background: transparent; }
      .bb-messages::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 2px; }

      /* Message rows */
      .bb-row {
        display: flex;
        flex-direction: column;
        max-width: 84%;
        gap: 2px;
      }
      .bb-row.bot  { align-self: flex-start; }
      .bb-row.user { align-self: flex-end; }
      .bb-row.error { align-self: flex-start; }
      .bb-row + .bb-row { margin-top: 10px; }
      .bb-row.bot  + .bb-row.bot  { margin-top: 4px; }
      .bb-row.user + .bb-row.user { margin-top: 4px; }

      /* Sender label */
      .bb-sender {
        font-size: 11px;
        color: #999;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 2px;
        padding: 0 2px;
      }
      .bb-sender svg { opacity: 0.6; }
      .bb-row.user .bb-sender { flex-direction: row-reverse; }

      /* Bubbles */
      .bb-bubble {
        padding: 10px 14px;
        font-size: 14px;
        line-height: 1.55;
        word-break: break-word;
        position: relative;
        animation: bbSlideIn 0.2s cubic-bezier(.4,0,.2,1) both;
      }
      .bb-row.bot .bb-bubble {
        background: #fff;
        color: #111;
        border-radius: 4px 14px 14px 14px;
        border: 1px solid rgba(0,0,0,0.07);
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .bb-row.user .bb-bubble {
        background: ${PRIMARY};
        color: #fff;
        border-radius: 14px 14px 4px 14px;
      }
      .bb-row.error .bb-bubble {
        background: #fff5f5;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 4px 14px 14px 14px;
        font-size: 13px;
      }

      /* Markdown inside bot bubble */
      .bb-bubble .bb-md-p {
        margin: 0 0 8px;
      }
      .bb-bubble .bb-md-p:last-child { margin-bottom: 0; }
      .bb-bubble .bb-md-h1 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
      .bb-bubble .bb-md-h2 { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
      .bb-bubble .bb-md-h3 { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: #333; }
      .bb-bubble .bb-md-ul,
      .bb-bubble .bb-md-ol {
        margin: 6px 0 8px 16px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .bb-bubble .bb-md-ul { list-style: disc; }
      .bb-bubble .bb-md-ol { list-style: decimal; }
      .bb-bubble .bb-md-ul li,
      .bb-bubble .bb-md-ol li { font-size: 13.5px; line-height: 1.5; }
      .bb-bubble .bb-md-ul li strong,
      .bb-bubble .bb-md-ol li strong { font-weight: 700; }
      .bb-bubble .bb-md-quote {
        border-left: 3px solid #d0d0d0;
        padding: 4px 10px;
        color: #666;
        font-style: italic;
        margin: 6px 0;
        font-size: 13px;
      }
      .bb-bubble .bb-md-hr { border: none; border-top: 1px solid #e0e0e0; margin: 10px 0; }
      .bb-bubble .bb-md-link {
        color: ${PRIMARY};
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .bb-bubble .bb-inline-code {
        background: #f0f0f0;
        color: #c0392b;
        padding: 1px 5px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, monospace;
        font-size: 12px;
      }
      .bb-bubble .bb-code-block {
        background: #1e1e2e;
        color: #cdd6f4;
        padding: 10px 12px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'SFMono-Regular', Consolas, monospace;
        font-size: 12px;
        line-height: 1.6;
        margin: 6px 0;
        white-space: pre;
      }
      .bb-bubble strong { font-weight: 700; }
      .bb-bubble em { font-style: italic; }
      .bb-bubble del { text-decoration: line-through; opacity: 0.7; }

      /* Resolution prompt */
      .bb-resolve-prompt {
        margin: 6px 0 4px 0;
        padding: 10px 14px;
        background: #FFFBEB;
        border: 1px solid #FCD34D;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        animation: bbSlideIn 0.3s ease both;
      }
      .bb-resolve-prompt p {
        font-size: 12.5px;
        color: #78350F;
        font-weight: 500;
        margin: 0;
        line-height: 1.4;
      }
      .bb-resolve-btns {
        display: flex;
        gap: 6px;
      }
      .bb-resolve-yes, .bb-resolve-no {
        flex: 1;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        outline: none;
        transition: opacity 0.2s;
        min-height: 32px;
      }
      .bb-resolve-yes:hover, .bb-resolve-no:hover { opacity: 0.85; }
      .bb-resolve-yes {
        background: #FFC107;
        color: #000;
      }
      .bb-resolve-no {
        background: #F3F4F6;
        color: #374151;
      }
      .bb-resolve-done {
        font-size: 12px;
        color: #6B7280;
        font-style: italic;
        text-align: center;
        padding: 4px 0;
      }

      /* Timestamp */
      .bb-ts {
        font-size: 10.5px;
        color: #bbb;
        padding: 0 2px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .bb-row.user .bb-ts { justify-content: flex-end; }
      .bb-tick { color: #93c5fd; font-size: 12px; }

      @keyframes bbSlideIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Typing indicator */
      .bb-typing {
        align-self: flex-start;
        background: #fff;
        border: 1px solid rgba(0,0,0,0.07);
        padding: 11px 15px;
        border-radius: 4px 14px 14px 14px;
        display: none;
        gap: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        margin-top: 4px;
      }
      .bb-typing.active { display: flex; }
      .bb-dot {
        width: 7px;
        height: 7px;
        background: #ccc;
        border-radius: 50%;
        animation: bbBounce 1.3s infinite ease-in-out both;
      }
      .bb-dot:nth-child(2) { animation-delay: 0.16s; }
      .bb-dot:nth-child(3) { animation-delay: 0.32s; }
      @keyframes bbBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30%            { transform: translateY(-5px); opacity: 1; }
      }

      /* Conversation starters in chat */
      #bb-chat-starters {
        padding: 8px 14px 6px;
        background: #f5f6f7;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      #bb-chat-starters.hidden { display: none; }
      .bb-chat-starter-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 13px;
        background: #fff;
        border: 1px solid #e4e4e4;
        border-radius: 20px;
        font-size: 13px;
        font-family: inherit;
        color: ${PRIMARY};
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.12s, border-color 0.12s;
        gap: 8px;
      }
      .bb-chat-starter-chip:hover {
        background: ${PRIMARY}0a;
        border-color: ${PRIMARY}55;
      }
      .bb-chat-starter-chip svg { color: ${PRIMARY}; flex-shrink: 0; opacity: 0.7; }

      /* Input area */
      .bb-input-area {
        padding: 10px 12px 12px;
        background: #fff;
        border-top: 1px solid #eeeeee;
        flex-shrink: 0;
      }
      .bb-input-wrap {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        background: #f5f6f7;
        border: 1.5px solid #e0e0e0;
        border-radius: 12px;
        padding: 6px 6px 6px 12px;
        transition: border-color 0.2s;
      }
      .bb-input-wrap:focus-within {
        border-color: ${PRIMARY};
        background: #fff;
      }
      .bb-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        background: transparent;
        color: #111;
        resize: none;
        min-height: 22px;
        max-height: 100px;
        line-height: 1.5;
        overflow-y: auto;
        padding: 2px 0;
        scrollbar-width: none;
      }
      .bb-input::-webkit-scrollbar { display: none; }
      .bb-input::placeholder { color: #aaa; }
      .bb-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .bb-input-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
      }
      .bb-input-icon-btn {
        width: 30px;
        height: 30px;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaa;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
        flex-shrink: 0;
      }
      .bb-input-icon-btn:hover { color: #666; background: #f0f0f0; }
      .bb-send {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: ${PRIMARY};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        transition: opacity 0.15s, transform 0.1s;
        flex-shrink: 0;
      }
      .bb-send:hover { opacity: 0.88; }
      .bb-send:active { transform: scale(0.93); }
      .bb-send:disabled { opacity: 0.35; cursor: not-allowed; }
      .bb-input-footer {
        text-align: center;
        font-size: 11px;
        color: #ccc;
        margin-top: 8px;
      }
      .bb-input-footer a { color: #ccc; text-decoration: none; }
      .bb-input-footer a:hover { color: #999; }

      /* ══════════════════════════════════════════════
         BOTTOM NAV (Home / Messages tabs)
      ══════════════════════════════════════════════ */
      .bb-bottom-nav {
        display: flex;
        border-top: 1px solid #eeeeee;
        background: #fff;
        flex-shrink: 0;
      }
      .bb-nav-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 10px 0 12px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 11px;
        font-family: inherit;
        color: #bbb;
        font-weight: 500;
        transition: color 0.15s;
        position: relative;
      }
      .bb-nav-btn:hover { color: #666; }
      .bb-nav-btn.active { color: ${PRIMARY}; }
      .bb-nav-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 2px;
        border-radius: 0 0 2px 2px;
        background: ${PRIMARY};
        opacity: 0;
        transition: opacity 0.15s;
      }
      .bb-nav-btn.active::before { opacity: 1; }

      /* ══════════════════════════════════════════════
         HUMAN HANDOFF BANNER
      ══════════════════════════════════════════════ */
      #bb-handoff-banner {
        margin: 0 14px 8px;
        padding: 10px 14px;
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border: 1px solid #bbf7d0;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
        color: #166534;
      }
      #bb-handoff-banner.visible { display: flex; }
      #bb-handoff-banner-text {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
      #bb-handoff-banner-btn {
        background: #166534;
        color: #fff;
        border: none;
        padding: 5px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-family: inherit;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background 0.15s;
      }
      #bb-handoff-banner-btn:hover { background: #14532d; }

      /* ══════════════════════════════════════════════
         MOBILE RESPONSIVE
      ══════════════════════════════════════════════ */
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
        #bb-launcher {
          bottom: 16px;
          right: 16px;
        }
        .bb-home-greeting { font-size: 20px; }
      }

      /* Scrollbar for messages */
      .bb-messages { scrollbar-gutter: stable; }
    `;

    /* ── HTML TEMPLATE ── */
    const HTML = `
      <!-- ── Launcher ── -->
      <button id="bb-launcher" aria-label="Open ${BOT_NAME} chat" title="Chat with us">
        <span class="bb-launch-icon">
          <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
        </span>
        <span class="bb-launch-close">${IC.close}</span>
        <span id="bb-badge"></span>
      </button>

      <!-- ── Widget Window ── -->
      <div id="bb-window" role="dialog" aria-modal="true" aria-label="${BOT_NAME}">

        <!-- ══ HOME VIEW ══ -->
        <div id="bb-home">

          <!-- Hero header -->
          <div class="bb-home-header">
            <div class="bb-home-topbar">
              <div class="bb-home-logo">
                <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.parentNode.innerHTML='<div class=\\'bb-home-logo-fallback\\'>B</div>'">
                <span>${BOT_NAME}</span>
              </div>
              <button class="bb-home-close" id="bb-home-close" aria-label="Close">${IC.close}</button>
            </div>
            <div class="bb-home-greeting">${WELCOME.replace(/\n/g, '<br>')}</div>
            <div class="bb-home-sub">${TAGLINE}</div>
            <div class="bb-avatar-stack">
              <div class="bb-avatar-stack-item">
                <img src="${BEE_LOGO_URL}" alt="AI" onerror="this.parentNode.textContent='AI'">
              </div>
              <div class="bb-avatar-stack-item" style="font-size:11px">24/7</div>
              <span class="bb-avatar-stack-label"><span class="bb-online-dot"></span>Typically replies instantly</span>
            </div>
          </div>

          <!-- Cards -->
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

          <!-- Conversation starters -->
          ${STARTERS.length > 0 ? `
          <div class="bb-home-starters" id="bb-home-starters">
            <div class="bb-home-starters-label">Popular questions</div>
            ${STARTERS.map(s => `
              <button class="bb-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button">
                <span>${s}</span>
                ${IC.chevronRight}
              </button>
            `).join('')}
          </div>
          ` : ''}

          <div class="bb-home-footer">
            Powered by <a href="https://beebot.ai" target="_blank" rel="noopener">BeeBot AI</a>
          </div>
        </div>

        <!-- ══ CHAT VIEW ══ -->
        <div id="bb-chat">

          <!-- Header -->
          <div class="bb-chat-header" style="position:relative;">
            <button class="bb-chat-back" id="bb-chat-back" aria-label="Back to home">${IC.back}</button>
            <div class="bb-chat-header-info">
              <div class="bb-chat-avatar">
                <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
                <div class="bb-chat-avatar-badge"></div>
              </div>
              <div class="bb-chat-header-text">
                <div class="bb-chat-header-name">${BOT_NAME}</div>
                <div class="bb-chat-header-sub">AI Agent · The team can also help</div>
              </div>
            </div>
            <div class="bb-chat-header-actions">
              <button class="bb-chat-hbtn" id="bb-talk-human-btn" aria-label="Talk to a human" title="Request human support">${IC.agent}</button>
              <button class="bb-chat-hbtn" id="bb-more-btn" aria-label="More options">${IC.more}</button>
            </div>
            <!-- Dropdown -->
            <div class="bb-dropdown" id="bb-dropdown">
              <button class="bb-dropdown-item" id="bb-new-chat-btn" type="button">${IC.newChat} &nbsp;New conversation</button>
              <div class="bb-dropdown-divider"></div>
              <button class="bb-dropdown-item" id="bb-close-chat-btn" type="button">${IC.close} &nbsp;Close chat</button>
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
                ${IC.chevronRight}
              </button>
            `).join('')}
          </div>

          <!-- Human handoff banner -->
          <div id="bb-handoff-banner">
            <div id="bb-handoff-banner-text">${IC.agent}&nbsp;Connect with a human agent</div>
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
                <button class="bb-input-icon-btn" id="bb-emoji-btn" type="button" aria-label="Emoji" title="Emoji">${IC.emoji}</button>
                <button class="bb-send" id="bb-send" type="button" aria-label="Send message">${IC.send}</button>
              </div>
            </div>
            <div class="bb-input-footer">
              Powered by <a href="https://beebot.ai" target="_blank" rel="noopener">BeeBot AI</a>
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
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HTML;
    shadow.appendChild(wrapper);

    /* ── Element refs ── */
    const launcher       = shadow.getElementById('bb-launcher');
    const window_        = shadow.getElementById('bb-window');
    const badge          = shadow.getElementById('bb-badge');
    const homeView       = shadow.getElementById('bb-home');
    const chatView       = shadow.getElementById('bb-chat');
    const homeClose      = shadow.getElementById('bb-home-close');
    const homeStartChat  = shadow.getElementById('bb-home-start-chat');
    const chatBack       = shadow.getElementById('bb-chat-back');
    const messagesEl     = shadow.getElementById('bb-messages');
    const typingEl       = shadow.getElementById('bb-typing');
    const chatStartersEl = shadow.getElementById('bb-chat-starters');
    const handoffBanner  = shadow.getElementById('bb-handoff-banner');
    const handoffBannerBtn = shadow.getElementById('bb-handoff-banner-btn');
    const inputEl        = shadow.getElementById('bb-input');
    const sendBtn        = shadow.getElementById('bb-send');
    const talkHumanBtn   = shadow.getElementById('bb-talk-human-btn');
    const moreBtn        = shadow.getElementById('bb-more-btn');
    const dropdown       = shadow.getElementById('bb-dropdown');
    const newChatBtn     = shadow.getElementById('bb-new-chat-btn');
    const closeChatBtn   = shadow.getElementById('bb-close-chat-btn');

    /* ─── STATE ─── */
    let msgCount      = 0;
    let handoffShown  = false;
    let dropdownOpen  = false;

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
    const addMessage = (text, role, ts, isWelcome = false) => {
      const row = document.createElement('div');
      row.className = `bb-row ${role}`;

      if (!isWelcome) {
        const sender = document.createElement('div');
        sender.className = 'bb-sender';
        if (role === 'bot') {
          sender.innerHTML = `${IC.bot} ${BOT_NAME} · AI Agent`;
        } else if (role === 'user') {
          sender.innerHTML = `You`;
        }
        row.appendChild(sender);
      }

      const bubble = document.createElement('div');
      bubble.className = 'bb-bubble';
      if (role === 'bot' || role === 'error') {
        bubble.innerHTML = renderMarkdown(text);
      } else {
        // User messages: escape and show plain text preserving newlines
        bubble.innerHTML = text
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
      }
      row.appendChild(bubble);

      if (!isWelcome) {
        const ts_ = document.createElement('div');
        ts_.className = 'bb-ts';
        const timeSpan = document.createElement('span');
        timeSpan.textContent = formatTime(ts);
        timeSpan.dataset.ts = ts;
        ts_.appendChild(timeSpan);
        if (role === 'user') {
          const tick = document.createElement('span');
          tick.className = 'bb-tick';
          tick.innerHTML = '&#10003;&#10003;';
          tick.title = 'Delivered';
          ts_.appendChild(tick);
        }
        row.appendChild(ts_);
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
        const bubble  = row.querySelector('.bb-bubble');
        const tsMeta  = row.querySelector('.bb-ts span[data-ts]');
        if (!bubble || !tsMeta) return;
        const role    = row.classList.contains('user') ? 'user' : row.classList.contains('error') ? 'error' : 'bot';
        // Store raw text content for simple persistence
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
      // Fresh start: add welcome
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
      // Remove any existing prompt first (only one at a time)
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
        // Log the resolution — fire-and-forget, never double-count
        if (convId) {
          try {
            await fetch(`${API_URL}/chat/resolve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
              body: JSON.stringify({ conversation_id: convId, visitor_id: VISITOR_ID, resolved: true }),
            });
          } catch (_) { /* non-blocking */ }
        }
        setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 3000);
      });

      noBtn.addEventListener('click', () => {
        // No charge — just remove the prompt
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
          // Show resolution confirmation — only after a non-error bot reply
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
       EMOJI BUTTON (placeholder — opens native picker or no-op)
    ───────────────────────────────────────────── */
    const emojiBtnEl = shadow.getElementById('bb-emoji-btn');
    if (emojiBtnEl) {
      emojiBtnEl.addEventListener('click', () => {
        // Native emoji picker is only available in some browsers via InputEvent
        // This is a placeholder — integrate a picker library as needed
        inputEl.focus();
      });
    }

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