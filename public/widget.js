
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
   * 1. CONFIG FROM <script> TAG
   * ═══════════════════════════════════════════════════════════════════════ */
  const scriptTag =
    document.currentScript ||
    Array.from(document.getElementsByTagName('script')).find(
      s => s.src && s.src.includes('widget.js')
    );

  const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;
  const API_URL = scriptTag ? scriptTag.getAttribute('data-api-url') : null;

  if (!API_KEY || !API_URL) {
    console.error('[BeeBot] Missing data-api-key or data-api-url on <script> tag.');
    return;
  }

  const WIDGET_BASE_URL = (() => {
    const s = document.querySelector('script[src*="widget.js"]');
    if (s) { try { return new URL(s.src).origin; } catch (_) {} }
    return '';
  })();

  const BEE_LOGO_URL = `${WIDGET_BASE_URL}/bee-chat.png`;

  /* ═══════════════════════════════════════════════════════════════════════
   * 2. VISITOR ID
   * ═══════════════════════════════════════════════════════════════════════ */
  const getVisitorId = () => {
    const KEY = 'beebot_visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
      localStorage.setItem(KEY, id);
    }
    return id;
  };
  const VISITOR_ID = getVisitorId();

  /* ═══════════════════════════════════════════════════════════════════════
   * 3. MULTI-CONVERSATION STORAGE
   * ═══════════════════════════════════════════════════════════════════════ */
  const CONVOS_KEY  = `beebot_convos_${API_KEY.slice(-8)}_${VISITOR_ID}`;
  const MAX_CONVOS  = 30;

  const loadAllConvos = () => {
    try {
      const raw = localStorage.getItem(CONVOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const saveAllConvos = (convos) => {
    try {
      localStorage.setItem(CONVOS_KEY, JSON.stringify(convos.slice(0, MAX_CONVOS)));
    } catch {}
  };

  const createNewConvo = (welcomeMsg) => ({
    localId:        'c_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now(),
    conversationId: null,
    messages:       welcomeMsg ? [{ text: welcomeMsg, role: 'bot', ts: Date.now(), isWelcome: true }] : [],
    createdAt:      Date.now(),
    lastMessage:    welcomeMsg || '',
    lastTs:         Date.now(),
  });

  const upsertConvo = (allConvos, convo) => {
    const idx = allConvos.findIndex(c => c.localId === convo.localId);
    if (idx === -1) return [convo, ...allConvos];
    const updated = [...allConvos];
    updated[idx] = convo;
    // Move updated convo to top
    updated.splice(idx, 1);
    updated.unshift(convo);
    return updated;
  };

  /* ═══════════════════════════════════════════════════════════════════════
   * 4. MARKDOWN RENDERER  (safe, no external lib)
   * ═══════════════════════════════════════════════════════════════════════ */
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
      `<pre class="bb-code-block"><code>${code.trim()}</code></pre>`);
    html = html.replace(/`([^`\n]+)`/g, '<code class="bb-inline-code">$1</code>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    html = html.replace(/^### (.+)$/gm, '<h4 class="bb-md-h3">$1</h4>');
    html = html.replace(/^## (.+)$/gm,  '<h3 class="bb-md-h2">$1</h3>');
    html = html.replace(/^# (.+)$/gm,   '<h2 class="bb-md-h1">$1</h2>');
    html = html.replace(/((?:^\d+\..+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(line => {
        const m = line.match(/^\d+\.\s+(.*)/);
        return m ? `<li>${m[1]}</li>` : '';
      }).join('');
      return `<ol class="bb-md-ol">${items}</ol>`;
    });
    html = html.replace(/((?:^[-*]\s.+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(line => {
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
    html = html.split(/\n{2,}/).map(para => {
      para = para.trim();
      if (!para) return '';
      if (/^<(ul|ol|pre|blockquote|h[2-4]|hr)/.test(para)) return para;
      return `<p class="bb-md-p">${para.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
   * 5. TIME FORMATTING
   * ═══════════════════════════════════════════════════════════════════════ */
  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60_000)     return 'Just now';
    if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  /* ═══════════════════════════════════════════════════════════════════════
   * 6. COLOR UTILITIES
   * ═══════════════════════════════════════════════════════════════════════ */
  const isColorDark = (hex) => {
    try {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
    } catch { return true; }
  };

  const adjustColor = (hex, amount) => {
    try {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, Math.max(0, (n >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((n >> 8) & 0xFF) + amount));
      const b = Math.min(255, Math.max(0, (n & 0xFF) + amount));
      return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    } catch { return hex; }
  };

  /* ═══════════════════════════════════════════════════════════════════════
   * 7. FETCH CONFIG
   * ═══════════════════════════════════════════════════════════════════════ */
  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/config`, {
        headers: { 'x-api-key': API_KEY },
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return {};
  };

  /* ═══════════════════════════════════════════════════════════════════════
   * 8. BUILD WIDGET
   * ═══════════════════════════════════════════════════════════════════════ */
  const buildWidget = (botConfig) => {
    const PRIMARY       = botConfig.primary_color   || '#6C47FF';
    const PRIMARY_DARK  = adjustColor(PRIMARY, -25);
    const PRIMARY_FG    = isColorDark(PRIMARY) ? '#ffffff' : '#111111';
    const BOT_NAME      = botConfig.bot_name        || 'BeeBot Support';
    const COMPANY_NAME  = botConfig.business_name   || BOT_NAME;
    const STARTERS      = Array.isArray(botConfig.conversation_starters) ? botConfig.conversation_starters : [];
    const IS_DARK       = isColorDark(PRIMARY);
    // Auto-contrast text for home welcome section
    const HOME_TEXT       = IS_DARK ? '#ffffff' : '#111111';
    const HOME_TEXT_MID   = IS_DARK ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)';
    const HOME_TEXT_FAINT = IS_DARK ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)';

    // When primary is dark (logo is black), wrap logo in white circle
    const LOGO_BG_CSS   = IS_DARK
      ? `background: rgba(255,255,255,0.95); box-shadow: 0 2px 10px rgba(0,0,0,0.18);`
      : `background: transparent;`;

    /* ── ICONS ── */
    const IC = {
      send:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      chevronDown:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
      chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
      back:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
      more:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>`,
      close:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
      home:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      messages:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      chat:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      newChat:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
      sparkle:      `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>`,
      agent:        `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      bubbles:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    };

    /* ════════════════════════════════════════════════════════════════
       CSS — Full Design Token System
    ════════════════════════════════════════════════════════════════ */
    const CSS = `
      /* ── Fonts ── */
      @import url('https://fonts.googleapis.com/css2?family=Playwrite+NZ+Basic+Guides&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

      /* ── Design Tokens ── */
      :host {
        --color-primary:      ${PRIMARY};
        --color-primary-dark: ${PRIMARY_DARK};
        --color-primary-fg:   ${PRIMARY_FG};
        --color-primary-10:   ${PRIMARY}1a;
        --color-primary-20:   ${PRIMARY}33;
        --color-surface:      #ffffff;
        --color-surface-2:    #f7f8fa;
        --color-surface-3:    #eef0f3;
        --color-border:       rgba(0,0,0,0.07);
        --color-border-strong:rgba(0,0,0,0.13);
        --color-text:         #0d0d0d;
        --color-text-muted:   #6b7280;
        --color-text-faint:   #a0aab4;
        --color-error:        #dc2626;
        --color-error-bg:     #fef2f2;
        --color-success:      #16a34a;
        --color-success-bg:   #f0fdf4;

        --space-xs:  4px;
        --space-sm:  8px;
        --space-md:  16px;
        --space-lg:  24px;
        --space-xl:  40px;
        --space-2xl: 64px;

        --radius-sm:   6px;
        --radius-md:   12px;
        --radius-lg:   20px;
        --radius-pill: 999px;

        --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
        --shadow-md: 0 4px 16px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05);
        --shadow-lg: 0 20px 60px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);

        --text-xs:  11px;
        --text-sm:  12.5px;
        --text-base:14px;
        --text-md:  15px;
        --text-lg:  18px;
        --text-xl:  22px;

        --transition-fast:  150ms ease;
        --transition-base:  250ms ease;
        --transition-slow:  400ms ease;

        --font:         'Ubuntu', system-ui, -apple-system, sans-serif;
        --font-display: 'Playwrite NZ Basic Guides', serif;

        /* Human-design tokens */
        --r-sm:   4px;
        --r-md:   10px;
        --r-lg:   18px;
        --r-xl:   28px;
        --r-blob: 60% 40% 50% 50% / 50% 45% 55% 50%;
        --t-snap: 120ms ease;
        --t-base: 240ms cubic-bezier(0.4,0,0.2,1);
        --t-slow: 500ms cubic-bezier(0.4,0,0.2,1);
        --shadow-ang:  3px 6px 24px rgba(0,0,0,0.13);
        --shadow-card: 2px 5px 18px rgba(0,0,0,0.09), 5px 10px 36px rgba(0,0,0,0.05);
      }

      *, *::before, *::after {
        box-sizing: border-box; margin: 0; padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      ::selection {
        background: var(--color-primary-20);
        color: var(--color-text);
      }

      /* ════════════════════════════════
         LAUNCHER BUBBLE
      ════════════════════════════════ */
      #bb-launcher {
        position: fixed;
        bottom: 28px; right: 28px;
        width: 64px; height: 64px;
        border-radius: 50%;
        background: var(--color-primary);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        z-index: 2147483646;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        outline: none; overflow: visible;
        box-shadow: 0 4px 24px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
        padding: 0;
      }
      #bb-launcher:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,0.28); }
      #bb-launcher:active { transform: scale(0.95); }
      #bb-launcher:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }

      /* Logo background: white circle when primary is dark */
      .bb-launch-logo-bg {
        width: 64px; height: 64px;
        border-radius: 50%;
        ${LOGO_BG_CSS}
        display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden;
        flex-shrink: 0;
      }
      #bb-launcher img.bb-launch-img {
        width: 58px; height: 58px;
        border-radius: 50%;
        object-fit: cover;
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
        display: block;
      }
      .bb-launch-down-icon {
        position: absolute;
        color: ${IS_DARK ? '#fff' : '#111'};
        display: flex; align-items: center; justify-content: center;
        opacity: 0;
        transform: scale(0.5) rotate(90deg);
        transition: opacity 0.22s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      }
      #bb-launcher.open img.bb-launch-img { opacity: 0; transform: scale(0.4) rotate(-90deg); }
      #bb-launcher.open .bb-launch-down-icon { opacity: 1; transform: scale(1) rotate(0deg); }

      /* Pulse ring */
      #bb-launcher::before {
        content: ''; position: absolute; inset: -4px; border-radius: 50%;
        border: 2px solid var(--color-primary);
        opacity: 0; animation: bbPulse 3s ease-out infinite; pointer-events: none;
      }
      @keyframes bbPulse {
        0%   { opacity: 0.5; transform: scale(1); }
        100% { opacity: 0;   transform: scale(1.6); }
      }

      /* Unread badge */
      #bb-badge {
        position: absolute; top: -4px; right: -4px;
        background: #ef4444; color: #fff;
        font-size: var(--text-xs); font-weight: 700; font-family: var(--font);
        min-width: 20px; height: 20px; border-radius: var(--radius-pill);
        display: none; align-items: center; justify-content: center;
        padding: 0 5px; border: 2.5px solid #fff; line-height: 1;
        pointer-events: none; box-shadow: 0 2px 6px rgba(239,68,68,0.4);
      }
      #bb-badge.visible { display: flex; }

      /* ════════════════════════════════
         WIDGET WINDOW
      ════════════════════════════════ */
      #bb-window {
        position: fixed;
        bottom: 108px; right: 28px;
        width: 400px; height: 720px;
        max-height: calc(100dvh - 120px);
        min-height: 420px; min-width: 300px;
        transition: opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1),
                    width 280ms ease, height 280ms ease;
        background: var(--color-surface);
        border-radius: 20px;
        box-shadow: var(--shadow-lg);
        display: flex; flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
        font-family: var(--font);
        font-size: var(--text-base);
        line-height: 1.6;
        color: var(--color-text);
        opacity: 0;
        transform: translateY(18px) scale(0.96);
        pointer-events: none;
      }
      #bb-window.open {
        opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
      }
      #bb-window.bb-expanded {
        width: 720px; height: 720px;
      }

      /* ════════════════════════════════
         TAB VIEWS CONTAINER
      ════════════════════════════════ */
      #bb-tab-views {
        display: flex; flex-direction: column;
        height: 100%; overflow: hidden; position: relative;
      }
      .bb-tab-view {
        display: none; flex-direction: column;
        flex: 1; min-height: 0; overflow: hidden;
      }
      .bb-tab-view.active { display: flex; }

      /* ════════════════════════════════
         TAB BAR
      ════════════════════════════════ */
      .bb-tab-bar {
        display: flex;
        border-top: 1px solid var(--color-border);
        background: var(--color-surface);
        flex-shrink: 0;
        padding: 0 var(--space-sm);
      }
      .bb-tab-btn {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 3px; padding: var(--space-sm) var(--space-sm);
        background: none; border: none; cursor: pointer;
        font-family: var(--font); font-size: var(--text-xs);
        font-weight: 600; color: var(--color-text-faint);
        transition: color var(--transition-fast);
        border-radius: var(--radius-sm);
        position: relative; min-height: 54px;
      }
      .bb-tab-btn:hover { color: var(--color-text-muted); }
      .bb-tab-btn.active { color: var(--color-primary); }
      .bb-tab-btn.active svg { stroke: var(--color-primary); }
      .bb-tab-btn::after {
        content: ''; position: absolute; top: 0; left: 50%;
        transform: translateX(-50%);
        width: 0; height: 2.5px;
        background: var(--color-primary);
        border-radius: 0 0 3px 3px;
        transition: width var(--transition-base);
      }
      .bb-tab-btn.active::after { width: 28px; }
      .bb-tab-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

      /* ════════════════════════════════
         HOME TAB — gradient blend
      ════════════════════════════════ */
      #bb-home {
        overflow: hidden;
        /* primary → white blend, full-tab gradient */
        background: linear-gradient(180deg,
          ${PRIMARY} 0%,
          ${PRIMARY} 22%,
          ${PRIMARY}cc 40%,
          ${PRIMARY}66 58%,
          ${PRIMARY}1a 74%,
          #f6f7f9 88%,
          #f6f7f9 100%
        );
      }

      @keyframes bbPulseGreen {
        0%,100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes bbFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Welcome section (sits in dark primary zone) ── */
      .bb-h-welcome-section {
        padding: 16px 18px 26px 18px;
        flex-shrink: 0; position: relative;
      }
      /* top bar */
      .bb-h-topbar {
        display: flex; align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .bb-h-brand { display: flex; align-items: center; gap: 8px; }
      .bb-h-logo {
        width: 26px; height: 26px; border-radius: 7px;
        background: rgba(128,128,128,0.2);
        overflow: hidden; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .bb-h-logo img { width: 26px; height: 26px; object-fit: cover; border-radius: 5px; }
      .bb-h-brand-name {
        font-size: 12px; font-weight: 600;
        color: ${HOME_TEXT_MID}; letter-spacing: 0.01em;
      }
      .bb-h-close-btn {
        background: rgba(128,128,128,0.14); border: none;
        width: 28px; height: 28px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: ${HOME_TEXT_MID};
        transition: background var(--t-snap), color var(--t-snap);
      }
      .bb-h-close-btn:hover { background: rgba(128,128,128,0.28); color: ${HOME_TEXT}; }
      .bb-h-close-btn:focus-visible { outline: 2px solid rgba(128,128,128,0.5); outline-offset: 2px; }
      /* Welcome block — all Ubuntu, consistent style */
      .bb-h-welcome {
        display: flex; flex-direction: column;
        gap: 2px; margin-bottom: 10px;
      }
      .bb-h-welcome-hi {
        font-family: var(--font);
        font-size: 14px; font-weight: 400;
        color: ${HOME_TEXT_MID};
        line-height: 1.4;
      }
      .bb-h-welcome-name {
        font-family: var(--font);
        font-size: 28px; font-weight: 700;
        color: ${HOME_TEXT}; line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .bb-h-tagline {
        font-family: var(--font);
        font-size: 13.5px; font-weight: 400;
        color: ${HOME_TEXT_MID};
        line-height: 1.5; max-width: 240px;
        margin-bottom: 14px;
      }
      .bb-h-online {
        display: flex; align-items: center; gap: 6px;
      }
      .bb-h-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #4ade80; flex-shrink: 0;
        animation: bbPulseGreen 2.5s ease-in-out infinite;
      }
      .bb-h-online-text {
        font-size: 11px; font-weight: 400;
        color: ${HOME_TEXT_FAINT};
      }

      /* ── Scrollable body (gradient fades to white here) ── */
      .bb-h-body {
        flex: 1; min-height: 0; overflow-y: auto;
        display: flex; flex-direction: column;
        background: transparent;
        scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.08) transparent;
        scroll-behavior: smooth; padding-bottom: 4px;
      }
      .bb-h-body::-webkit-scrollbar { width: 4px; }
      .bb-h-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }

      /* ── Recent conversations card ── */
      .bb-h-recent-card {
        margin: 0 14px 12px;
        background: rgba(255,255,255,0.92);
        border-radius: var(--r-lg);
        box-shadow: var(--shadow-ang);
        overflow: hidden;
        backdrop-filter: blur(4px);
      }
      .bb-h-recent-header {
        font-size: 10.5px; font-weight: 700;
        color: var(--color-text-faint);
        text-transform: uppercase; letter-spacing: 0.08em;
        padding: 11px 14px 9px;
        border-bottom: 1px solid rgba(0,0,0,0.06);
      }
      .bb-h-recent-item {
        display: flex; align-items: center; gap: 11px;
        padding: 11px 14px;
        background: none; border: none;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        cursor: pointer; width: 100%;
        text-align: left; font-family: var(--font);
        transition: background var(--t-snap);
        min-height: 58px;
      }
      .bb-h-recent-item:last-child { border-bottom: none; }
      .bb-h-recent-item:hover { background: rgba(0,0,0,0.03); }
      .bb-h-recent-item:active { background: rgba(0,0,0,0.06); }
      .bb-h-recent-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: var(--color-primary-10);
        border: 1.5px solid var(--color-primary-20);
        overflow: hidden; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .bb-h-recent-avatar img { width: 36px; height: 36px; object-fit: cover; }
      .bb-h-recent-info { flex: 1; min-width: 0; }
      .bb-h-recent-name {
        font-size: 13px; font-weight: 700;
        color: var(--color-text); letter-spacing: -0.01em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        line-height: 1.3;
      }
      .bb-h-recent-preview {
        font-size: 12px; color: var(--color-text-muted); font-weight: 400;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-top: 2px; line-height: 1.3;
      }
      .bb-h-recent-time {
        font-size: 11px; color: var(--color-text-faint);
        flex-shrink: 0; font-weight: 400; align-self: flex-start;
        padding-top: 2px;
      }

      /* ── New chat CTA card ── */
      .bb-h-cta-wrap {
        padding: 0 14px; margin-bottom: 12px; flex-shrink: 0;
      }
      .bb-h-cta {
        width: 100%; background: rgba(255,255,255,0.92);
        border: none; cursor: pointer;
        border-radius: var(--r-lg);
        box-shadow: var(--shadow-ang);
        padding: 13px 13px;
        display: flex; align-items: center; gap: 12px;
        text-align: left; font-family: var(--font);
        backdrop-filter: blur(4px);
        transition: transform var(--t-base), box-shadow var(--t-base), background var(--t-snap);
      }
      .bb-h-cta:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-card);
        background: #fff;
      }
      .bb-h-cta:active { transform: scale(0.98); }
      .bb-h-cta:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      .bb-h-cta-icon-wrap {
        width: 38px; height: 38px; border-radius: var(--r-md);
        background: var(--color-primary-10); color: var(--color-primary);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background var(--t-snap);
      }
      .bb-h-cta:hover .bb-h-cta-icon-wrap { background: var(--color-primary-20); }
      .bb-h-cta-copy { flex: 1; min-width: 0; }
      .bb-h-cta-title {
        display: block; font-size: 14px; font-weight: 700;
        color: var(--color-text); letter-spacing: -0.01em; line-height: 1.3;
      }
      .bb-h-cta-sub {
        display: block; font-size: 12px; font-weight: 400;
        color: var(--color-text-muted); margin-top: 2px;
      }
      .bb-h-cta-arr {
        color: var(--color-text-faint); flex-shrink: 0;
        transition: transform var(--t-snap), color var(--t-snap);
      }
      .bb-h-cta:hover .bb-h-cta-arr { transform: translateX(3px); color: var(--color-text-muted); }

      /* ── Starters — pill buttons ── */
      .bb-h-starters { padding: 0 14px; flex-shrink: 0; margin-bottom: 4px; }
      .bb-h-sec-label {
        font-size: 10.5px; font-weight: 700;
        color: var(--color-text-faint);
        text-transform: uppercase; letter-spacing: 0.09em;
        margin-bottom: 10px; padding-left: 2px;
        display: flex; align-items: center; gap: 8px;
      }
      .bb-h-sec-label::after {
        content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.1);
      }
      .bb-h-starter-pills {
        display: flex; flex-wrap: wrap; gap: 8px;
      }
      .bb-starter-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px;
        background: transparent;
        border: 1.5px solid var(--color-primary);
        border-radius: var(--radius-pill);
        font-size: 13px; font-family: var(--font);
        font-weight: 500; color: var(--color-primary);
        cursor: pointer; text-align: left;
        animation: bbFadeUp 0.35s ease both;
        transition: background var(--t-snap), color var(--t-snap), transform var(--t-snap);
        white-space: nowrap;
      }
      .bb-starter-chip:hover {
        background: var(--color-primary);
        color: var(--color-primary-fg);
        transform: translateY(-1px);
      }
      .bb-starter-chip:active { transform: scale(0.97); }
      .bb-starter-chip:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

      /* ── Footer ── */
      .bb-home-footer {
        padding: 16px 16px 8px;
        text-align: center; flex-shrink: 0; margin-top: auto;
      }
      .bb-powered {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px; color: var(--color-text-faint);
        text-decoration: none; font-weight: 500;
        transition: color var(--t-snap); cursor: pointer;
      }
      .bb-powered:hover { color: var(--color-text-muted); }

      /* ════════════════════════════════
         MESSAGES TAB (conversation list)
      ════════════════════════════════ */
      #bb-messages-tab { overflow: hidden; background: var(--color-surface); }

      /* Action bar — Messages title on left, New Chat button on right */
      .bb-msgs-bar {
        padding: 10px 14px 8px;
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
        border-bottom: 1px solid var(--color-border);
      }
      .bb-msgs-title {
        font-size: 16px; font-weight: 700;
        color: var(--color-text); letter-spacing: -0.01em;
      }
      .bb-new-chat-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px;
        background: var(--color-primary); color: var(--color-primary-fg);
        border: none; border-radius: var(--radius-pill);
        font-family: var(--font); font-size: var(--text-sm); font-weight: 700;
        cursor: pointer;
        transition: opacity var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15); min-height: 36px;
      }
      .bb-new-chat-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: var(--shadow-md); }
      .bb-new-chat-btn:active { transform: scale(0.97); }
      .bb-new-chat-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }

      .bb-convos-list {
        flex: 1; min-height: 0; overflow-y: auto;
        scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent;
        scroll-behavior: smooth;
      }
      .bb-convos-list::-webkit-scrollbar { width: 4px; }
      .bb-convos-list::-webkit-scrollbar-track { background: transparent; }
      .bb-convos-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: var(--radius-pill); }

      .bb-convo-empty {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100%; gap: var(--space-md);
        color: var(--color-text-faint); padding: var(--space-xl); text-align: center;
      }
      .bb-convo-empty-icon {
        width: 56px; height: 56px; border-radius: 50%;
        background: var(--color-surface-2);
        display: flex; align-items: center; justify-content: center;
        color: var(--color-text-faint);
      }
      .bb-convo-empty p { font-size: var(--text-sm); line-height: 1.6; }

      /* WhatsApp-style conversation item */
      .bb-convo-item {
        display: flex; align-items: center; gap: var(--space-md);
        padding: var(--space-md);
        cursor: pointer; width: 100%;
        border: none; border-bottom: 1px solid var(--color-border);
        background: none; font-family: var(--font);
        transition: background var(--transition-fast);
        min-height: 72px; text-align: left;
      }
      .bb-convo-item:hover { background: var(--color-surface-2); }
      .bb-convo-item:active { background: var(--color-surface-3); }
      .bb-convo-item:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

      .bb-convo-avatar {
        width: 46px; height: 46px; border-radius: 50%;
        background: var(--color-primary-10);
        border: 2px solid var(--color-primary-20);
        overflow: hidden; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; position: relative;
      }
      .bb-convo-avatar img { width: 46px; height: 46px; object-fit: cover; }
      .bb-convo-avatar-dot {
        position: absolute; bottom: 1px; right: 1px;
        width: 11px; height: 11px; border-radius: 50%;
        background: #22c55e; border: 2px solid var(--color-surface);
      }
      .bb-convo-info { flex: 1; min-width: 0; }
      .bb-convo-row1 {
        display: flex; align-items: center;
        justify-content: space-between; gap: var(--space-sm); margin-bottom: 3px;
      }
      .bb-convo-name {
        font-size: var(--text-base); font-weight: 700; color: var(--color-text);
        letter-spacing: -0.01em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
      }
      .bb-convo-time {
        font-size: var(--text-xs); color: var(--color-text-faint);
        font-weight: 400; white-space: nowrap; flex-shrink: 0;
      }
      .bb-convo-preview {
        font-size: var(--text-sm); color: var(--color-text-muted);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        line-height: 1.4; font-weight: 400;
      }

      /* ════════════════════════════════
         CHAT VIEW (slides over tab views)
      ════════════════════════════════ */
      #bb-chat {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        background: var(--color-surface); z-index: 10;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      #bb-chat.active { transform: translateX(0); }

      /* Chat header */
      .bb-chat-header {
        padding: 0 14px; height: 58px;
        background: var(--color-primary);
        display: flex; align-items: center; gap: 10px;
        flex-shrink: 0; user-select: none; position: relative;
      }
      .bb-chat-back {
        background: rgba(255,255,255,0.12); border: none;
        border-radius: 50%; width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--color-primary-fg);
        transition: background var(--t-snap), transform var(--t-snap);
        flex-shrink: 0;
      }
      .bb-chat-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-1px); }
      .bb-chat-back:active { transform: scale(0.94); }
      .bb-chat-back:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }

      .bb-chat-header-info {
        display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;
      }
      .bb-chat-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: rgba(255,255,255,0.15); overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; position: relative;
        border: 2px solid rgba(255,255,255,0.3);
      }
      .bb-chat-avatar img { width: 36px; height: 36px; object-fit: cover; }
      .bb-chat-avatar-badge {
        position: absolute; bottom: 0; right: 0;
        width: 9px; height: 9px; border-radius: 50%;
        background: #44d17a; border: 2px solid var(--color-primary);
      }
      .bb-chat-header-name {
        color: var(--color-primary-fg);
        font-family: var(--font); font-size: 18px; font-weight: 700;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        line-height: 1.2; letter-spacing: -0.01em;
      }
      .bb-chat-header-sub {
        color: var(--color-primary-fg); opacity: 0.7;
        font-size: 11px; font-weight: 300; font-family: var(--font);
        margin-top: 1px; line-height: 1;
      }
      .bb-chat-header-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
      .bb-chat-hbtn {
        background: transparent; border: none; border-radius: var(--radius-sm);
        width: 34px; height: 34px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--color-primary-fg); opacity: 0.8;
        transition: background var(--t-snap), opacity var(--t-snap);
      }
      .bb-chat-hbtn:hover { background: rgba(255,255,255,0.15); opacity: 1; }
      .bb-chat-hbtn:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }
      /* Expand/collapse button */
      .bb-chat-expand {
        background: transparent; border: none; border-radius: var(--radius-sm);
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--color-primary-fg); opacity: 0.75;
        transition: background var(--t-snap), opacity var(--t-snap);
        flex-shrink: 0; font-size: 16px;
      }
      .bb-chat-expand:hover { background: rgba(255,255,255,0.15); opacity: 1; }
      .bb-chat-expand:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }

      /* Dropdown */
      .bb-dropdown {
        position: absolute; top: 60px; right: 12px;
        background: var(--color-surface); border-radius: var(--radius-md);
        box-shadow: var(--shadow-md), 0 0 0 1px var(--color-border-strong);
        min-width: 195px; z-index: 20; overflow: hidden;
        display: none; animation: bbDropIn 0.15s ease;
      }
      @keyframes bbDropIn {
        from { opacity: 0; transform: translateY(-6px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .bb-dropdown.open { display: block; }
      .bb-dropdown-item {
        display: flex; align-items: center; gap: var(--space-sm);
        padding: 11px var(--space-md); cursor: pointer;
        font-size: var(--text-sm); color: var(--color-text);
        transition: background var(--transition-fast);
        border: none; background: none; width: 100%; text-align: left;
        font-family: var(--font); font-weight: 500; min-height: 44px;
      }
      .bb-dropdown-item:hover { background: var(--color-surface-2); }
      .bb-dropdown-item.danger { color: var(--color-error); }
      .bb-dropdown-divider { height: 1px; background: var(--color-border); margin: 3px 0; }

      /* Date separator */
      .bb-date-sep {
        text-align: center; font-size: var(--text-xs);
        color: var(--color-text-faint); font-weight: 500;
        padding: var(--space-sm) 0 var(--space-xs);
        display: flex; align-items: center; gap: var(--space-sm);
        margin: var(--space-xs) 0;
      }
      .bb-date-sep::before, .bb-date-sep::after {
        content: ''; flex: 1; height: 1px; background: var(--color-border);
      }

      /* ════════════════════════════════
         MESSAGE BUBBLES
      ════════════════════════════════ */
      .bb-messages-area {
        flex: 1; padding: var(--space-md) var(--space-md) var(--space-sm);
        overflow-y: auto; background: var(--color-surface);
        display: flex; flex-direction: column; gap: 0;
        scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent;
        scroll-behavior: smooth;
      }
      .bb-messages-area::-webkit-scrollbar { width: 4px; }
      .bb-messages-area::-webkit-scrollbar-track { background: transparent; }
      .bb-messages-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: var(--radius-pill); }

      /* Message row */
      .bb-row {
        display: flex; flex-direction: column;
        max-width: 72%; position: relative;
      }
      .bb-row.bot   { align-self: flex-start; }
      .bb-row.user  { align-self: flex-end; }
      .bb-row.error { align-self: flex-start; }

      /* Spacing: same sender → tight, different → loose */
      .bb-row + .bb-row            { margin-top: var(--space-lg); }
      .bb-row.bot  + .bb-row.bot   { margin-top: var(--space-xs); }
      .bb-row.user + .bb-row.user  { margin-top: var(--space-xs); }

      /* Bubble */
      .bb-bubble {
        padding: var(--space-md) var(--space-lg);
        font-size: var(--text-base); line-height: 1.6;
        word-break: break-word; position: relative;
        animation: bbSlideUp 0.25s ease-out both;
        box-shadow: var(--shadow-sm);
        transition: box-shadow var(--transition-base);
      }
      .bb-bubble:hover { box-shadow: var(--shadow-md); }
      @keyframes bbSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Bot bubble — sharp top-left */
      .bb-row.bot .bb-bubble {
        background: linear-gradient(to bottom, var(--color-surface-2), var(--color-surface-3));
        color: var(--color-text);
        border-radius: var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg);
        border: 1px solid var(--color-border);
      }
      /* User bubble — sharp top-right */
      .bb-row.user .bb-bubble {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: var(--color-primary-fg);
        border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg);
      }
      /* Error bubble */
      .bb-row.error .bb-bubble {
        background: var(--color-error-bg);
        border: 1px solid rgba(220,38,38,0.2);
        color: var(--color-error);
        border-radius: var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg);
        font-size: var(--text-sm);
      }

      /* Timestamp — hidden, revealed on row hover with smooth slide-down */
      .bb-ts {
        font-size: var(--text-xs); color: var(--color-text-faint);
        padding: 0 4px;
        max-height: 0; overflow: hidden; opacity: 0;
        transition: max-height var(--transition-base), opacity var(--transition-base), padding var(--transition-base);
      }
      .bb-row:hover .bb-ts {
        max-height: 20px; opacity: 1; padding-top: 4px;
      }
      .bb-row.user .bb-ts { text-align: right; align-self: flex-end; }
      .bb-row.bot  .bb-ts { align-self: flex-start; }

      /* Markdown */
      .bb-bubble .bb-md-p { margin: 0 0 var(--space-sm); }
      .bb-bubble .bb-md-p:last-child { margin-bottom: 0; }
      .bb-bubble .bb-md-h1 { font-size: var(--text-md); font-weight: 700; margin: 0 0 var(--space-sm); letter-spacing: -0.01em; }
      .bb-bubble .bb-md-h2 { font-size: var(--text-base); font-weight: 700; margin: 0 0 6px; }
      .bb-bubble .bb-md-h3 { font-size: var(--text-base); font-weight: 600; margin: 0 0 4px; color: var(--color-text-muted); }
      .bb-bubble .bb-md-ul,
      .bb-bubble .bb-md-ol { margin: 6px 0 var(--space-sm) var(--space-md); display: flex; flex-direction: column; gap: 3px; }
      .bb-bubble .bb-md-ul { list-style: disc; }
      .bb-bubble .bb-md-ol { list-style: decimal; }
      .bb-bubble .bb-md-ul li, .bb-bubble .bb-md-ol li { font-size: var(--text-sm); line-height: 1.55; }
      .bb-bubble .bb-md-quote { border-left: 3px solid rgba(0,0,0,0.15); padding: 4px var(--space-sm); color: var(--color-text-muted); font-style: italic; margin: 6px 0; font-size: var(--text-sm); }
      .bb-bubble .bb-md-hr { border: none; border-top: 1px solid var(--color-border); margin: var(--space-sm) 0; }
      .bb-bubble .bb-md-link { color: var(--color-primary); text-decoration: underline; text-underline-offset: 2px; }
      .bb-bubble .bb-inline-code { background: rgba(0,0,0,0.07); color: #c0392b; padding: 1px 5px; border-radius: var(--radius-sm); font-family: 'SFMono-Regular', Consolas, monospace; font-size: var(--text-xs); }
      .bb-bubble .bb-code-block { background: #1a1a2e; color: #e2e8f0; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); overflow-x: auto; font-family: 'SFMono-Regular', Consolas, monospace; font-size: var(--text-xs); line-height: 1.6; margin: 6px 0; white-space: pre; }
      .bb-bubble strong { font-weight: 700; }
      .bb-bubble em { font-style: italic; }
      .bb-bubble del { text-decoration: line-through; opacity: 0.65; }

      /* Resolution prompt */
      .bb-resolve-prompt {
        margin: var(--space-sm) 0 4px;
        padding: var(--space-md);
        background: linear-gradient(to bottom, var(--color-surface), var(--color-surface-2));
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
        display: flex; flex-direction: column; gap: var(--space-sm);
        animation: bbSlideUp 0.3s ease both; box-shadow: var(--shadow-sm);
      }
      .bb-resolve-prompt p { font-size: var(--text-sm); color: var(--color-text-muted); font-weight: 500; margin: 0; line-height: 1.5; }
      .bb-resolve-btns { display: flex; gap: 7px; }
      .bb-resolve-yes, .bb-resolve-no {
        flex: 1; padding: var(--space-sm); border-radius: var(--radius-sm);
        font-size: var(--text-sm); font-weight: 600; cursor: pointer;
        border: none; outline: none;
        transition: opacity var(--transition-fast), transform var(--transition-fast);
        min-height: 36px; font-family: var(--font);
      }
      .bb-resolve-yes:hover, .bb-resolve-no:hover { opacity: 0.82; }
      .bb-resolve-yes:active, .bb-resolve-no:active { transform: scale(0.97); }
      .bb-resolve-yes:focus-visible, .bb-resolve-no:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      .bb-resolve-yes { background: var(--color-primary); color: var(--color-primary-fg); }
      .bb-resolve-no  { background: var(--color-surface-3); color: var(--color-text-muted); }
      .bb-resolve-submit { background: var(--color-primary); color: var(--color-primary-fg);
        flex: 1; padding: var(--space-sm); border-radius: var(--radius-sm);
        font-size: var(--text-sm); font-weight: 600; cursor: pointer; border: none;
        transition: opacity var(--transition-fast); font-family: var(--font); min-height: 36px; }
      .bb-resolve-submit:hover { opacity: 0.88; }
      .bb-resolve-skip { background: transparent; color: var(--color-text-muted); border: none;
        font-size: var(--text-sm); cursor: pointer; padding: var(--space-sm);
        font-family: var(--font); font-weight: 400; }
      .bb-resolve-textarea {
        width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
        padding: 8px 10px; font-size: var(--text-sm); font-family: var(--font);
        color: var(--color-text); resize: none; outline: none; line-height: 1.5;
        transition: border-color var(--transition-fast);
      }
      .bb-resolve-textarea:focus { border-color: var(--color-primary); }
      .bb-resolve-done { font-size: var(--text-sm); color: var(--color-text-muted); text-align: center; padding: 4px 0; font-style: italic; }

      /* Typing indicator */
      .bb-typing {
        align-self: flex-start;
        background: linear-gradient(to bottom, var(--color-surface-2), var(--color-surface-3));
        border: 1px solid var(--color-border);
        padding: 13px var(--space-md);
        border-radius: var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg);
        display: none; gap: 5px; margin-top: var(--space-xs); box-shadow: var(--shadow-sm);
      }
      .bb-typing.active { display: flex; }
      .bb-dot {
        width: 7px; height: 7px; background: var(--color-text-faint); border-radius: 50%;
        animation: bbBounce 1.3s infinite ease-in-out both;
      }
      .bb-dot:nth-child(2) { animation-delay: 0.16s; }
      .bb-dot:nth-child(3) { animation-delay: 0.32s; }
      @keyframes bbBounce {
        0%,60%,100% { transform: translateY(0); opacity: 0.4; }
        30%          { transform: translateY(-5px); opacity: 1; }
      }

      /* Chat starters bar */
      #bb-chat-starters {
        padding: var(--space-xs) var(--space-md) var(--space-sm);
        background: var(--color-surface); display: flex; flex-wrap: wrap;
        gap: 6px; border-top: 1px solid var(--color-border);
      }
      #bb-chat-starters.hidden { display: none; }
      .bb-chat-starter-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px;
        background: linear-gradient(to bottom, var(--color-surface), var(--color-surface-2));
        border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        font-size: var(--text-sm); font-family: var(--font); color: var(--color-text);
        font-weight: 500; cursor: pointer;
        transition: all var(--transition-fast);
        line-height: 1.3; min-height: 32px;
      }
      .bb-chat-starter-chip:hover { background: var(--color-surface-3); border-color: var(--color-border-strong); box-shadow: var(--shadow-sm); }
      .bb-chat-starter-chip:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

      /* Human handoff modal overlay */
      #bb-handoff-overlay {
        position: absolute; inset: 0; z-index: 30;
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center;
        animation: bbFadeIn 0.2s ease;
      }
      @keyframes bbFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #bb-handoff-overlay.hm-hidden { display: none; }
      #bb-handoff-modal {
        background: #ffffff;
        border-radius: 18px;
        padding: 28px 24px 22px;
        width: 88%;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        position: relative;
        text-align: left;
        animation: bbModalUp 0.25s ease;
      }
      @keyframes bbModalUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .bb-hm-close {
        position: absolute; top: 14px; right: 14px;
        width: 28px; height: 28px; border-radius: 50%;
        border: none; background: rgba(0,0,0,0.05);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #666;
        transition: background var(--t-snap);
      }
      .bb-hm-close:hover { background: rgba(0,0,0,0.1); }
      .bb-hm-icon-wrap {
        width: 42px; height: 42px; border-radius: 50%;
        background: var(--color-primary-10); color: var(--color-primary);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 14px;
      }
      .bb-hm-title {
        font-size: 16px; font-weight: 700; font-family: var(--font);
        color: var(--color-text); margin-bottom: 6px; letter-spacing: -0.01em;
      }
      .bb-hm-sub {
        font-size: 13px; font-weight: 300; color: #666;
        line-height: 1.5; margin-bottom: 20px;
      }
      .bb-hm-cta {
        display: block; width: 100%;
        background: var(--color-primary); color: var(--color-primary-fg);
        border: none; border-radius: 10px;
        padding: 11px; font-size: 14px; font-weight: 700;
        font-family: var(--font); cursor: pointer;
        transition: opacity var(--t-snap), transform var(--t-snap);
        margin-bottom: 10px;
      }
      .bb-hm-cta:hover { opacity: 0.9; }
      .bb-hm-cta:active { transform: scale(0.98); }
      .bb-hm-cancel {
        display: block; width: 100%; background: none;
        border: none; cursor: pointer;
        font-size: 13px; font-weight: 400; color: #888;
        font-family: var(--font); padding: 4px;
        text-align: center;
        transition: color var(--t-snap);
      }
      .bb-hm-cancel:hover { color: #555; }

      /* ── Input bar ── */
      .bb-input-area {
        padding: 10px 12px;
        background: var(--color-surface);
        border-top: 1px solid rgba(0,0,0,0.08);
        flex-shrink: 0;
        display: flex; align-items: center; gap: 6px;
      }
      /* Icon buttons: emoji, attach, image */
      .bb-input-icon-btn {
        width: 34px; height: 34px; border-radius: 50%;
        border: none; background: transparent;
        color: #888; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background var(--t-snap), color var(--t-snap);
      }
      .bb-input-icon-btn:hover {
        background: rgba(0,0,0,0.06);
        color: var(--color-primary);
      }
      .bb-input-icon-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      /* Text input */
      .bb-input-wrap {
        flex: 1; display: flex; align-items: flex-end;
        border: 1px solid rgba(0,0,0,0.12);
        border-radius: 22px;
        padding: 9px 14px;
        background: var(--color-surface);
        transition: border-color 200ms ease, box-shadow 200ms ease;
      }
      .bb-input-wrap:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-10);
      }
      .bb-input {
        flex: 1; border: none; outline: none;
        font-size: 14px; font-family: var(--font); font-weight: 400;
        background: transparent; color: var(--color-text);
        resize: none; min-height: 20px; max-height: 100px;
        line-height: 1.5; overflow-y: auto; padding: 0;
        scrollbar-width: none;
      }
      .bb-input::-webkit-scrollbar { display: none; }
      .bb-input::placeholder { color: var(--color-text-faint); font-weight: 400; }
      .bb-input:disabled { opacity: 0.45; cursor: not-allowed; }
      /* Send button */
      .bb-send {
        width: 36px; height: 36px; border-radius: 50%;
        background: var(--color-primary); border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: var(--color-primary-fg);
        transition: filter var(--t-snap), transform var(--t-snap);
        flex-shrink: 0;
      }
      .bb-send:hover { filter: brightness(1.1); }
      .bb-send:active { transform: scale(0.94); }
      .bb-send:disabled { opacity: 0.3; cursor: not-allowed; filter: none; }
      .bb-send:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

      .bb-input-footer { text-align: center; font-size: var(--text-xs); margin-top: var(--space-sm); }

      /* Skeleton shimmer */
      @keyframes bbShimmer {
        0%   { background-position: -300px 0; }
        100% { background-position: 300px 0; }
      }
      .bb-skeleton {
        background: linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-surface-3) 50%, var(--color-surface-2) 75%);
        background-size: 600px 100%;
        animation: bbShimmer 1.4s ease-in-out infinite;
        border-radius: var(--radius-sm);
      }

      /* Mobile */
      @media (max-width: 480px) {
        #bb-window {
          bottom: 0 !important; right: 0 !important; left: 0 !important;
          width: 100% !important; height: 100dvh !important;
          max-height: 100dvh !important; border-radius: 0 !important;
        }
        #bb-launcher { bottom: 20px; right: 20px; }
        .bb-h-welcome-name { font-size: 22px !important; }
      }
    `;

    /* ════════════════════════════════════════════════════════════════
       HTML TEMPLATES — one per section
    ════════════════════════════════════════════════════════════════ */

    /* ── Launcher bubble ── */
    const HTML_LAUNCHER = `
      <button id="bb-launcher" aria-label="Open ${BOT_NAME} chat" title="Chat with us">
        <div class="bb-launch-logo-bg">
          <img class="bb-launch-img" src="${BEE_LOGO_URL}" alt="${BOT_NAME}"
               onerror="this.style.display='none'">
          <span class="bb-launch-down-icon">${IC.chevronDown}</span>
        </div>
        <span id="bb-badge"></span>
      </button>
    `;

    /* ── Home tab ── */
    const HTML_HOME = `
      <div id="bb-home" class="bb-tab-view active">

        <!-- Welcome section (sits in the primary color zone of the gradient) -->
        <div class="bb-h-welcome-section">
          <div class="bb-h-topbar">
            <div class="bb-h-brand">
              <div class="bb-h-logo">
                <img src="${BEE_LOGO_URL}" alt="${COMPANY_NAME}"
                     onerror="this.parentNode.innerHTML='<span style=\\'color:#fff;font-weight:800;font-size:12px\\'>${COMPANY_NAME.charAt(0)}</span>'">
              </div>
              <span class="bb-h-brand-name">${COMPANY_NAME}</span>
            </div>
            <button class="bb-h-close-btn" id="bb-home-close" aria-label="Close">${IC.close}</button>
          </div>
          <div class="bb-h-welcome">
            <span class="bb-h-welcome-hi">Hi there 👋 Welcome to</span>
            <span class="bb-h-welcome-name">${COMPANY_NAME}</span>
          </div>
          <div class="bb-h-tagline">${BOT_NAME} is here to answer your questions — just ask!</div>
          <div class="bb-h-online">
            <span class="bb-h-dot"></span>
            <span class="bb-h-online-text">Typically replies instantly</span>
          </div>
        </div>

        <!-- Scrollable body (gradient fades to near-white here) -->
        <div class="bb-h-body">

          <!-- Recent conversations — populated by JS -->
          <div class="bb-h-recent-card" id="bb-h-recent" style="display:none"></div>

          <!-- New chat CTA -->
          <div class="bb-h-cta-wrap">
            <button class="bb-h-cta" id="bb-home-start-chat" type="button">
              <div class="bb-h-cta-icon-wrap">${IC.chat}</div>
              <div class="bb-h-cta-copy">
                <span class="bb-h-cta-title">Have a question?</span>
                <span class="bb-h-cta-sub">Chat with ${BOT_NAME}</span>
              </div>
              <div class="bb-h-cta-arr">${IC.chevronRight}</div>
            </button>
          </div>

          ${STARTERS.length > 0 ? `
          <div class="bb-h-starters">
            <div class="bb-h-sec-label">Quick questions</div>
            <div class="bb-h-starter-pills">
              ${STARTERS.slice(0, 4).map((s, i) => `
                <button class="bb-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button"
                        style="animation-delay:${i * 70}ms">${s}</button>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="bb-home-footer">
            <a class="bb-powered" href="https://beebot.ai" target="_blank" rel="noopener">
              🐝&nbsp;Powered by BeeBot AI
            </a>
          </div>
        </div>
      </div>
    `;

    /* ── Messages tab — header + past conversations ── */
    const HTML_MESSAGES = `
      <div id="bb-messages-tab" class="bb-tab-view">
        <div class="bb-msgs-bar">
          <span class="bb-msgs-title">Messages</span>
          <button class="bb-new-chat-btn" id="bb-msgs-new-chat-btn" type="button">
            ${IC.newChat}&nbsp;New chat
          </button>
        </div>
        <div class="bb-convos-list" id="bb-convos-list"></div>
      </div>
    `;

    /* ── Tab bar ── */
    const HTML_TAB_BAR = `
      <div class="bb-tab-bar" role="tablist">
        <button class="bb-tab-btn active" data-tab="home" role="tab" aria-selected="true">
          ${IC.home}
          <span>Home</span>
        </button>
        <button class="bb-tab-btn" data-tab="messages" role="tab" aria-selected="false">
          ${IC.messages}
          <span>Messages</span>
        </button>
      </div>
    `;

    /* ── Chat view ── */
    const HTML_CHAT = `
      <div id="bb-chat" role="main" aria-label="Chat">

        <div class="bb-chat-header">
          <button class="bb-chat-back" id="bb-chat-back" aria-label="Back to messages">${IC.back}</button>
          <div class="bb-chat-header-info">
            <div class="bb-chat-avatar">
              <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
              <div class="bb-chat-avatar-badge"></div>
            </div>
            <div style="min-width:0">
              <div class="bb-chat-header-name">${BOT_NAME}</div>
            </div>
          </div>
          <div class="bb-chat-header-actions">
            <button class="bb-chat-hbtn" id="bb-talk-human-btn" aria-label="Request human support" title="Talk to a human">${IC.agent}</button>
            <button class="bb-chat-hbtn" id="bb-more-btn" aria-label="More options">${IC.more}</button>
            <button class="bb-chat-expand" id="bb-expand-btn" aria-label="Expand chat" title="Expand">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
          </div>
          <div class="bb-dropdown" id="bb-dropdown">
            <button class="bb-dropdown-item" id="bb-new-convo-btn" type="button">${IC.newChat}&nbsp; New conversation</button>
            <div class="bb-dropdown-divider"></div>
            <button class="bb-dropdown-item danger" id="bb-close-chat-btn" type="button">${IC.close}&nbsp; Close chat</button>
          </div>
        </div>

        <div class="bb-messages-area" id="bb-messages" aria-live="polite" aria-relevant="additions">
          <div class="bb-typing" id="bb-typing">
            <div class="bb-dot"></div>
            <div class="bb-dot"></div>
            <div class="bb-dot"></div>
          </div>
        </div>

        <div id="bb-chat-starters" class="hidden">
          ${STARTERS.map(s => `
            <button class="bb-chat-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button">
              <span>${s}</span>
            </button>
          `).join('')}
        </div>

        <!-- Human handoff modal -->
        <div id="bb-handoff-overlay" style="display:none">
          <div id="bb-handoff-modal">
            <button id="bb-handoff-close" class="bb-hm-close" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div class="bb-hm-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 class="bb-hm-title">Connect with a person</h3>
            <p class="bb-hm-sub">Our team usually replies within a few minutes.</p>
            <button class="bb-hm-cta" id="bb-handoff-banner-btn" type="button">Start Chat</button>
            <button class="bb-hm-cancel" id="bb-handoff-cancel" type="button">Cancel</button>
          </div>
        </div>

        <div class="bb-input-area">
          <!-- Emoji button (decorative) -->
          <button class="bb-input-icon-btn" type="button" aria-label="Emoji" tabindex="-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>
          <!-- Text input -->
          <div class="bb-input-wrap">
            <textarea
              id="bb-input" class="bb-input"
              placeholder="Ask a question…"
              rows="1" maxlength="2000"
              aria-label="Type your message"
            ></textarea>
          </div>
          <!-- Attach button (decorative) -->
          <button class="bb-input-icon-btn" type="button" aria-label="Attach file" tabindex="-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <!-- Send button -->
          <button class="bb-send" id="bb-send" type="button" aria-label="Send message">${IC.send}</button>
        </div>
        <div class="bb-input-footer" style="padding:0 12px 8px;text-align:center">
          <a class="bb-powered" href="https://beebot-ai" target="_blank" rel="noopener">
            🐝&nbsp;Powered by BeeBot AI
          </a>
        </div>

      </div>
    `;

    /* ── Compose full widget HTML from section templates ── */
    const HTML = `
      ${HTML_LAUNCHER}
      <div id="bb-window" role="dialog" aria-modal="true" aria-label="${BOT_NAME}">
        <div id="bb-tab-views">
          ${HTML_HOME}
          ${HTML_MESSAGES}
          ${HTML_TAB_BAR}
        </div>
        ${HTML_CHAT}
      </div>
    `;

    /* ── Mount Shadow DOM ── */
    const host = document.createElement('div');
    host.id = 'beebot-root';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Load fonts inside shadow DOM (Playwrite NZ + Ubuntu)
    const fontPreconn1 = document.createElement('link');
    fontPreconn1.rel = 'preconnect';
    fontPreconn1.href = 'https://fonts.googleapis.com';
    shadow.appendChild(fontPreconn1);

    const fontPreconn2 = document.createElement('link');
    fontPreconn2.rel = 'preconnect';
    fontPreconn2.href = 'https://fonts.gstatic.com';
    fontPreconn2.crossOrigin = 'anonymous';
    shadow.appendChild(fontPreconn2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playwrite+NZ+Basic+Guides&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap';
    shadow.appendChild(fontLink);

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HTML;
    shadow.appendChild(wrapper);

    /* ── Element refs ── */
    const launcher         = shadow.getElementById('bb-launcher');
    const win              = shadow.getElementById('bb-window');
    const badge            = shadow.getElementById('bb-badge');
    const homeView         = shadow.getElementById('bb-home');
    const messagesTabView  = shadow.getElementById('bb-messages-tab');
    const chatView         = shadow.getElementById('bb-chat');
    const homeClose        = shadow.getElementById('bb-home-close');
    const homeStartChat    = shadow.getElementById('bb-home-start-chat');
    const convosListEl     = shadow.getElementById('bb-convos-list');
    const chatBack         = shadow.getElementById('bb-chat-back');
    const messagesEl       = shadow.getElementById('bb-messages');
    const typingEl         = shadow.getElementById('bb-typing');
    const chatStartersEl   = shadow.getElementById('bb-chat-starters');
    const handoffBanner    = shadow.getElementById('bb-handoff-overlay');
    const handoffBannerBtn = shadow.getElementById('bb-handoff-banner-btn');
    const handoffCancel    = shadow.getElementById('bb-handoff-cancel');
    const handoffClose     = shadow.getElementById('bb-handoff-close');
    const inputEl          = shadow.getElementById('bb-input');
    const sendBtn          = shadow.getElementById('bb-send');
    const talkHumanBtn     = shadow.getElementById('bb-talk-human-btn');
    const moreBtn          = shadow.getElementById('bb-more-btn');
    const dropdown         = shadow.getElementById('bb-dropdown');
    const newConvoBtn      = shadow.getElementById('bb-new-convo-btn');
    const msgsNewChatBtn   = shadow.getElementById('bb-msgs-new-chat-btn');
    const closeChatBtn     = shadow.getElementById('bb-close-chat-btn');
    const tabBtns          = shadow.querySelectorAll('.bb-tab-btn');

    /* ── State ── */
    let allConvos    = loadAllConvos();
    let currentConvo = null;
    let isOpen       = false;
    let isBusy       = false;
    let unreadCount  = 0;
    let dropdownOpen = false;
    let msgCount     = 0;

    /* ═══════════════════════════════════════════
       WIDGET OPEN / CLOSE
    ═══════════════════════════════════════════ */
    const openWidget = () => {
      isOpen = true;
      launcher.classList.add('open');
      win.classList.add('open');
      unreadCount = 0;
      badge.textContent = '';
      badge.classList.remove('visible');
      renderRecentMessages();
    };

    const closeWidget = () => {
      isOpen = false;
      launcher.classList.remove('open');
      win.classList.remove('open');
      dropdown.classList.remove('open');
      dropdownOpen = false;
    };

    launcher.addEventListener('click', () => isOpen ? closeWidget() : openWidget());
    homeClose.addEventListener('click', closeWidget);

    /* ═══════════════════════════════════════════
       TAB SWITCHING
    ═══════════════════════════════════════════ */
    const switchTab = (tabName) => {
      tabBtns.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (tabName === 'home') {
        // console.log('Switching to home tab');
        homeView.classList.add('active');
        // console.log(homeView.classList);
        messagesTabView.classList.remove('active');
        renderRecentMessages();
      } else {
        // console.log('Switching to messages tab');
        homeView.classList.remove('active');
        // console.log(homeView.classList);
        messagesTabView.classList.add('active');
        renderConvoList();
      }
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    /* ═══════════════════════════════════════════
       CHAT VIEW NAVIGATION
    ═══════════════════════════════════════════ */
    const openChatView = () => {
      chatView.classList.add('active');
      setTimeout(() => inputEl.focus(), 100);
    };

    const closeChatView = () => {
      chatView.classList.remove('active');
      // Go to messages tab so user can see all conversations
      switchTab('messages');
    };

    chatBack.addEventListener('click', closeChatView);

    /* ═══════════════════════════════════════════
       CONVERSATION LIST RENDERING
    ═══════════════════════════════════════════ */
    const renderConvoList = () => {
      allConvos = loadAllConvos();
      convosListEl.innerHTML = '';

      if (allConvos.length === 0) {
        convosListEl.innerHTML = `
          <div class="bb-convo-empty">
            <div class="bb-convo-empty-icon">${IC.bubbles}</div>
            <p>No conversations yet.<br>Start a new chat to get help!</p>
          </div>
        `;
        return;
      }

      allConvos.forEach(convo => {
        const preview = convo.lastMessage
          ? convo.lastMessage.slice(0, 55) + (convo.lastMessage.length > 55 ? '…' : '')
          : 'Start a conversation…';

        const btn = document.createElement('button');
        btn.className = 'bb-convo-item';
        btn.innerHTML = `
          <div class="bb-convo-avatar">
            <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
            <div class="bb-convo-avatar-dot"></div>
          </div>
          <div class="bb-convo-info">
            <div class="bb-convo-row1">
              <span class="bb-convo-name">${BOT_NAME}</span>
              <span class="bb-convo-time">${formatTime(convo.lastTs)}</span>
            </div>
            <div class="bb-convo-preview">${preview}</div>
          </div>
        `;
        btn.addEventListener('click', () => loadConversation(convo.localId));
        convosListEl.appendChild(btn);
      });
    };

    /* ═══════════════════════════════════════════
       RECENT MESSAGES ON HOME TAB
    ═══════════════════════════════════════════ */
    const recentEl = shadow.getElementById('bb-h-recent');

    const renderRecentMessages = () => {
      if (!recentEl) return;
      const convos = loadAllConvos();
      if (!convos.length) {
        recentEl.style.display = 'none';
        return;
      }
      recentEl.style.display = 'block';
      const recent = convos.slice(0, 1);
      recentEl.innerHTML = `
        <div class="bb-h-recent-header">Recent message</div>
        ${recent.map(c => {
          const preview = c.lastMessage
            ? c.lastMessage.slice(0, 52) + (c.lastMessage.length > 52 ? '…' : '')
            : 'Start a conversation…';
          return `
            <button class="bb-h-recent-item" data-local-id="${c.localId}" type="button">
              <div class="bb-h-recent-avatar">
                <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
              </div>
              <div class="bb-h-recent-info">
                <div class="bb-h-recent-name">${BOT_NAME}</div>
                <div class="bb-h-recent-preview">${preview}</div>
              </div>
              <div class="bb-h-recent-time">${formatTime(c.lastTs)}</div>
            </button>
          `;
        }).join('')}
      `;
      recentEl.querySelectorAll('.bb-h-recent-item').forEach(btn => {
        btn.addEventListener('click', () => loadConversation(btn.dataset.localId));
      });
    };

    /* ═══════════════════════════════════════════
       LOAD / START CONVERSATION
    ═══════════════════════════════════════════ */
    const clearMessagesArea = () => {
      messagesEl.querySelectorAll('.bb-row, .bb-date-sep, .bb-resolve-prompt').forEach(el => el.remove());
    };

    const loadConversation = (localId) => {
      allConvos = loadAllConvos();
      const convo = allConvos.find(c => c.localId === localId);
      if (!convo) return;

      currentConvo = JSON.parse(JSON.stringify(convo)); // deep copy
      msgCount = currentConvo.messages.filter(m => m.role === 'user').length;
      closeHandoffModal();

      clearMessagesArea();

      if (currentConvo.messages.length > 0) {
        addDateSeparator('Previous conversation');
        currentConvo.messages.forEach(m => {
          addMessage(m.text, m.role, m.ts, m.isWelcome || false);
        });
      }

      // Hide starters if conversation has user messages
      if (msgCount > 0) {
        chatStartersEl.classList.add('hidden');
      } else {
        if (STARTERS.length > 0) chatStartersEl.classList.remove('hidden');
      }

      openChatView();
    };

    const startNewConversation = () => {
      const welcome = botConfig.welcome_message || `Hi there 👋\nHow can I help you today?`;
      const newConvo = createNewConvo(welcome);

      allConvos = upsertConvo(loadAllConvos(), newConvo);
      saveAllConvos(allConvos);

      currentConvo = newConvo;
      msgCount = 0;
      closeHandoffModal();

      clearMessagesArea();
      addMessage(welcome, 'bot', Date.now(), true);

      if (STARTERS.length > 0) chatStartersEl.classList.remove('hidden');
      else chatStartersEl.classList.add('hidden');

      openChatView();
    };

    // Home "Have a doubt?" button
    homeStartChat.addEventListener('click', () => {
      if (!isOpen) openWidget();
      // Continue most recent convo or start new one
      allConvos = loadAllConvos();
      if (allConvos.length > 0) {
        loadConversation(allConvos[0].localId);
      } else {
        startNewConversation();
      }
    });

    // Home starters
    shadow.querySelectorAll('.bb-starter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isOpen) openWidget();
        allConvos = loadAllConvos();
        if (allConvos.length === 0) {
          startNewConversation();
        } else {
          loadConversation(allConvos[0].localId);
        }
        setTimeout(() => {
          inputEl.value = btn.dataset.starter;
          autoResizeInput();
          dispatchSend();
        }, 50);
      });
    });

    // Chat view starters
    chatStartersEl.querySelectorAll('.bb-chat-starter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        inputEl.value = btn.dataset.starter;
        autoResizeInput();
        chatStartersEl.classList.add('hidden');
        dispatchSend();
      });
    });

    /* ═══════════════════════════════════════════
       EXPAND / COLLAPSE CHAT WINDOW
    ═══════════════════════════════════════════ */
    const expandBtn  = shadow.getElementById('bb-expand-btn');
    let isExpanded = false;
    const expandSVG  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
    const collapseSVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`;
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        win.classList.toggle('bb-expanded', isExpanded);
        expandBtn.innerHTML = isExpanded ? collapseSVG : expandSVG;
        expandBtn.setAttribute('title', isExpanded ? 'Collapse' : 'Expand');
        expandBtn.setAttribute('aria-label', isExpanded ? 'Collapse chat' : 'Expand chat');
      });
    }

    /* ═══════════════════════════════════════════
       DROPDOWN MENU
    ═══════════════════════════════════════════ */
    moreBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      dropdown.classList.toggle('open', dropdownOpen);
    });

    shadow.addEventListener('click', () => {
      if (dropdownOpen) { dropdown.classList.remove('open'); dropdownOpen = false; }
    });

    newConvoBtn.addEventListener('click', () => {
      dropdown.classList.remove('open'); dropdownOpen = false;
      startNewConversation();
    });

    msgsNewChatBtn.addEventListener('click', () => startNewConversation());

    closeChatBtn.addEventListener('click', () => {
      dropdown.classList.remove('open'); dropdownOpen = false;
      closeWidget();
    });

    /* ═══════════════════════════════════════════
       HUMAN HANDOFF MODAL
    ═══════════════════════════════════════════ */
    const openHandoffModal  = () => { handoffBanner.style.display = 'flex'; };
    const closeHandoffModal = () => { handoffBanner.style.display = 'none'; };

    talkHumanBtn.addEventListener('click', openHandoffModal);
    if (handoffClose)  handoffClose.addEventListener('click',  closeHandoffModal);
    if (handoffCancel) handoffCancel.addEventListener('click', closeHandoffModal);

    handoffBannerBtn.addEventListener('click', () => {
      closeHandoffModal();
      addMessage(
        'A support agent has been notified and will join shortly. Feel free to continue chatting in the meantime.',
        'bot', Date.now()
      );
      persistCurrentConvo();
    });

    /* ═══════════════════════════════════════════
       MESSAGE RENDERING
    ═══════════════════════════════════════════ */
    const escapeHtml = (str) => String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const addMessage = (text, role, ts, isWelcome = false) => {
      if (!currentConvo) return;

      const row = document.createElement('div');
      row.className = `bb-row ${role}`;

      // Bubble
      const bubble = document.createElement('div');
      bubble.className = 'bb-bubble';
      if (role === 'bot' || role === 'error') {
        bubble.innerHTML = renderMarkdown(text);
      } else {
        bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
      }
      row.appendChild(bubble);

      // Timestamp — always present in DOM but hidden via CSS (shown on hover)
      const tsDiv = document.createElement('div');
      tsDiv.className = 'bb-ts';
      const timeSpan = document.createElement('span');
      timeSpan.textContent = formatTime(ts);
      timeSpan.dataset.ts = ts;
      tsDiv.appendChild(timeSpan);
      row.appendChild(tsDiv);

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
      messagesEl.querySelectorAll('.bb-ts span[data-ts]').forEach(el => {
        el.textContent = formatTime(parseInt(el.dataset.ts, 10));
      });
    }, 30_000);

    /* ═══════════════════════════════════════════
       PERSIST CURRENT CONVERSATION
    ═══════════════════════════════════════════ */
    const persistCurrentConvo = () => {
      if (!currentConvo) return;

      const msgs = [];
      messagesEl.querySelectorAll('.bb-row').forEach(row => {
        const bubble = row.querySelector('.bb-bubble');
        const tsMeta = row.querySelector('.bb-ts span[data-ts]');
        if (!bubble || !tsMeta) return;
        const role = row.classList.contains('user') ? 'user'
          : row.classList.contains('error') ? 'error' : 'bot';
        msgs.push({
          text: bubble.innerText || bubble.textContent,
          role,
          ts: parseInt(tsMeta.dataset.ts, 10),
        });
      });

      const lastUserOrBot = [...msgs].reverse().find(m => m.role === 'user' || m.role === 'bot');
      currentConvo.messages = msgs;
      currentConvo.lastMessage = lastUserOrBot ? lastUserOrBot.text.slice(0, 80) : '';
      currentConvo.lastTs = Date.now();

      const latest = upsertConvo(loadAllConvos(), currentConvo);
      saveAllConvos(latest);
      allConvos = latest;
    };

    /* ═══════════════════════════════════════════
       LOADING STATE
    ═══════════════════════════════════════════ */
    const setLoading = (loading) => {
      isBusy = loading;
      inputEl.disabled = loading;
      sendBtn.disabled = loading;
      typingEl.classList.toggle('active', loading);
      if (loading) scrollToBottom();
    };

    /* ═══════════════════════════════════════════
       AUTO-RESIZE TEXTAREA
    ═══════════════════════════════════════════ */
    const autoResizeInput = () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    };
    inputEl.addEventListener('input', autoResizeInput);

    /* ═══════════════════════════════════════════
       RESOLUTION PROMPT
    ═══════════════════════════════════════════ */
    const showResolutionPrompt = (convId) => {
      // Only show after at least 2 user messages in this conversation
      if (msgCount < 2) return;

      const existing = messagesEl.querySelector('.bb-resolve-prompt');
      if (existing) existing.remove();

      const prompt = document.createElement('div');
      prompt.className = 'bb-resolve-prompt';
      prompt.innerHTML = `
        <p>Was this answer helpful?</p>
        <div class="bb-resolve-btns">
          <button class="bb-resolve-yes" type="button">Yes</button>
          <button class="bb-resolve-no"  type="button">No</button>
        </div>
      `;

      const yesBtn = prompt.querySelector('.bb-resolve-yes');
      const noBtn  = prompt.querySelector('.bb-resolve-no');

      yesBtn.addEventListener('click', async () => {
        yesBtn.disabled = true; noBtn.disabled = true;
        prompt.innerHTML = '<p class="bb-resolve-done">Thanks for the feedback!</p>';
        if (convId) {
          try {
            await fetch(`${API_URL}/api/resolutions/mark`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
              body: JSON.stringify({ conversationId: convId, resolutionType: 'confirmed' }),
            });
          } catch (_) {}
        }
        setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 2500);
      });

      noBtn.addEventListener('click', () => {
        // Replace buttons with feedback textarea
        prompt.innerHTML = `
          <p style="margin-bottom:8px">What could we improve?</p>
          <textarea class="bb-resolve-textarea" placeholder="Tell us what you were looking for…" maxlength="500" rows="3"></textarea>
          <div class="bb-resolve-btns" style="margin-top:8px">
            <button class="bb-resolve-submit" type="button">Send feedback</button>
            <button class="bb-resolve-skip"   type="button">Skip</button>
          </div>
        `;

        const textarea   = prompt.querySelector('.bb-resolve-textarea');
        const submitBtn  = prompt.querySelector('.bb-resolve-submit');
        const skipBtn    = prompt.querySelector('.bb-resolve-skip');

        skipBtn.addEventListener('click', () => { if (prompt.parentNode) prompt.remove(); });

        submitBtn.addEventListener('click', async () => {
          const text = textarea.value.trim();
          if (!text) return;
          submitBtn.disabled = true;
          prompt.innerHTML = '<p class="bb-resolve-done">Thank you — we\'ll use this to improve.</p>';
          try {
            await fetch(`${API_URL}/api/resolutions/feedback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
              body: JSON.stringify({
                conversationId: convId || '',
                visitorId: VISITOR_ID,
                feedback: text,
              }),
            });
          } catch (_) {}
          setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 2500);
        });
      });

      messagesEl.insertBefore(prompt, typingEl);
      scrollToBottom();
    };

    /* ═══════════════════════════════════════════
       SEND MESSAGE
    ═══════════════════════════════════════════ */
    const dispatchSend = async () => {
      const query = inputEl.value.trim();
      if (!query || isBusy || !currentConvo) return;

      chatStartersEl.classList.add('hidden');
      inputEl.value = '';
      inputEl.style.height = 'auto';

      const ts = Date.now();
      if (msgCount === 0) {
        addDateSeparator(new Date(ts).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
      }

      addMessage(query, 'user', ts);
      setLoading(true);
      msgCount++;

      try {
        const body = { query, visitor_id: VISITOR_ID };
        if (currentConvo.conversationId) body.conversation_id = currentConvo.conversationId;

        const res  = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setLoading(false);

        if (res.ok && data.response) {
          addMessage(data.response, 'bot', Date.now());
          if (data.conversation_id) currentConvo.conversationId = data.conversation_id;
          showResolutionPrompt(currentConvo.conversationId);
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
        addMessage('Could not reach the server. Please check your connection.', 'error', Date.now());
      }

      persistCurrentConvo();
    };

    sendBtn.addEventListener('click', dispatchSend);

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dispatchSend(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeWidget();
    });

    /* ── Initialise: open most recent convo if any, else start fresh ── */
    // Widget starts on home tab, chat view is closed
    // Conversation list will render when user clicks Messages tab

  }; // end buildWidget

  /* ═══════════════════════════════════════════════════════════════════════
   * 9. BOOTSTRAP
   * ═══════════════════════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fetchConfig().then(buildWidget));
  } else {
    fetchConfig().then(buildWidget);
  }

})();
