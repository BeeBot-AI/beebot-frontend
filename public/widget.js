
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
      const res = await fetch(`${API_URL}/chat/config`, {
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
    const TAGLINE       = botConfig.tagline         || 'AI-powered support, always on';
const STARTERS      = Array.isArray(botConfig.conversation_starters) ? botConfig.conversation_starters : [];
    const IS_DARK       = isColorDark(PRIMARY);

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
      /* ── Font ── */
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

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

        --font: 'Outfit', system-ui, -apple-system, sans-serif;

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
        width: 388px; height: 630px;
        max-height: calc(100dvh - 120px);
        min-height: 460px; min-width: 300px;
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
        transition: opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1);
      }
      #bb-window.open {
        opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
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
        overflow: hidden; display: flex; flex-direction: column;
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
        background: rgba(255,255,255,0.2);
        overflow: hidden; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .bb-h-logo img { width: 26px; height: 26px; object-fit: cover; border-radius: 5px; }
      .bb-h-brand-name {
        font-size: 12px; font-weight: 600;
        color: rgba(255,255,255,0.75); letter-spacing: 0.01em;
      }
      .bb-h-close-btn {
        background: rgba(255,255,255,0.14); border: none;
        width: 28px; height: 28px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: rgba(255,255,255,0.82);
        transition: background var(--t-snap), color var(--t-snap);
      }
      .bb-h-close-btn:hover { background: rgba(255,255,255,0.28); color: #fff; }
      .bb-h-close-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }
      /* greeting — contrast pair: light 300 + heavy 900 */
      .bb-h-greeting {
        font-size: 14px; font-weight: 300;
        color: rgba(255,255,255,0.8);
        margin-bottom: 4px; letter-spacing: 0.01em;
      }
      .bb-h-name {
        font-size: 28px; font-weight: 900;
        color: #fff; line-height: 1.1;
        letter-spacing: -0.03em;
        margin-bottom: 7px;
      }
      .bb-h-tagline {
        font-size: 13px; font-weight: 300;
        color: rgba(255,255,255,0.68);
        line-height: 1.5; max-width: 230px;
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
        font-size: 11px; font-weight: 500;
        color: rgba(255,255,255,0.62);
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

      /* ── Starters ── */
      .bb-h-starters { padding: 0 14px; flex-shrink: 0; margin-bottom: 4px; }
      .bb-h-sec-label {
        font-size: 10.5px; font-weight: 700;
        color: var(--color-text-faint);
        text-transform: uppercase; letter-spacing: 0.09em;
        margin-bottom: 8px; padding-left: 2px;
        display: flex; align-items: center; gap: 8px;
      }
      .bb-h-sec-label::after {
        content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.1);
      }
      .bb-starter-chip {
        display: flex; align-items: center; gap: 10px;
        width: 100%;
        padding: 10px 12px 10px 13px;
        background: rgba(255,255,255,0.88);
        border: 1px solid rgba(255,255,255,0.6);
        border-radius: var(--r-md);
        font-size: 13px; font-family: var(--font);
        font-weight: 500; color: var(--color-text);
        cursor: pointer; text-align: left;
        margin-bottom: 6px; line-height: 1.4;
        animation: bbFadeUp 0.35s ease both;
        backdrop-filter: blur(4px);
        transition: transform var(--t-snap), box-shadow var(--t-snap),
                    border-color var(--t-snap), background var(--t-snap);
      }
      .bb-starter-chip:hover {
        transform: translateX(3px);
        background: #fff;
        border-color: rgba(0,0,0,0.1);
        box-shadow: var(--shadow-sm);
      }
      .bb-starter-chip:active { transform: scale(0.98); }
      .bb-starter-chip:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      .bb-h-starter-icon { color: var(--color-primary); flex-shrink: 0; opacity: 0.8; }
      .bb-h-starter-arr {
        color: var(--color-text-faint); flex-shrink: 0; margin-left: auto;
        transition: transform var(--t-snap), color var(--t-snap);
      }
      .bb-starter-chip:hover .bb-h-starter-arr {
        transform: translateX(2px); color: var(--color-text-muted);
      }

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

      .bb-msgs-header {
        padding: var(--space-lg) var(--space-md) var(--space-md);
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
        border-bottom: 1px solid var(--color-border);
        background: linear-gradient(to bottom, var(--color-surface), rgba(255,255,255,0.97));
      }
      .bb-msgs-title {
        font-size: var(--text-lg); font-weight: 800;
        color: var(--color-text); letter-spacing: -0.02em; line-height: 1.3;
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
        padding: 0 var(--space-md); height: 60px;
        background: linear-gradient(to bottom, var(--color-surface), rgba(255,255,255,0.98));
        border-bottom: 1px solid var(--color-border);
        display: flex; align-items: center; gap: var(--space-sm);
        flex-shrink: 0; user-select: none; position: relative;
      }
      .bb-chat-back {
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-radius: 50%; width: 34px; height: 34px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--color-text-muted);
        transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
        flex-shrink: 0;
      }
      .bb-chat-back:hover { background: var(--color-surface-3); color: var(--color-text); transform: translateX(-1px); }
      .bb-chat-back:active { transform: scale(0.95); }
      .bb-chat-back:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

      .bb-chat-header-info {
        display: flex; align-items: center; gap: var(--space-sm); flex: 1; min-width: 0;
      }
      .bb-chat-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: var(--color-primary-10); overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; position: relative;
      }
      .bb-chat-avatar img { width: 36px; height: 36px; object-fit: cover; }
      .bb-chat-avatar-badge {
        position: absolute; bottom: 0; right: 0;
        width: 10px; height: 10px; border-radius: 50%;
        background: #22c55e; border: 2px solid var(--color-surface);
      }
      .bb-chat-header-name {
        color: var(--color-text); font-size: var(--text-base); font-weight: 700;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        line-height: 1.3; letter-spacing: -0.01em;
      }
      .bb-chat-header-sub {
        color: var(--color-text-faint); font-size: var(--text-xs); font-weight: 400; margin-top: 1px;
      }
      .bb-chat-header-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
      .bb-chat-hbtn {
        background: transparent; border: none; border-radius: var(--radius-sm);
        width: 34px; height: 34px; min-width: 44px; min-height: 44px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--color-text-faint);
        transition: background var(--transition-fast), color var(--transition-fast);
      }
      .bb-chat-hbtn:hover { background: var(--color-surface-2); color: var(--color-text-muted); }
      .bb-chat-hbtn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

      /* Dropdown */
      .bb-dropdown {
        position: absolute; top: 58px; right: 12px;
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
      .bb-resolve-yes { background: var(--color-text); color: #fff; }
      .bb-resolve-no  { background: var(--color-surface-3); color: var(--color-text-muted); }
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

      /* Human handoff */
      #bb-handoff-banner {
        margin: 0 var(--space-md) var(--space-sm);
        padding: 11px var(--space-md);
        background: var(--color-success-bg);
        border: 1px solid rgba(22,163,74,0.25); border-radius: var(--radius-md);
        display: none; align-items: center; justify-content: space-between;
        gap: var(--space-sm); font-size: var(--text-sm); color: var(--color-success);
        animation: bbSlideUp 0.25s ease both; box-shadow: var(--shadow-sm);
      }
      #bb-handoff-banner.visible { display: flex; }
      #bb-handoff-banner-text { display: flex; align-items: center; gap: 7px; font-weight: 500; }
      #bb-handoff-banner-btn {
        background: var(--color-success); color: #fff; border: none;
        padding: 6px var(--space-md); border-radius: var(--radius-sm);
        cursor: pointer; font-size: var(--text-xs); font-family: var(--font);
        font-weight: 700; white-space: nowrap; flex-shrink: 0;
        transition: opacity var(--transition-fast), transform var(--transition-fast); min-height: 32px;
      }
      #bb-handoff-banner-btn:hover { opacity: 0.88; }
      #bb-handoff-banner-btn:active { transform: scale(0.97); }

      /* Input */
      .bb-input-area {
        padding: var(--space-sm) var(--space-md) var(--space-md);
        background: var(--color-surface); border-top: 1px solid var(--color-border); flex-shrink: 0;
      }
      .bb-input-wrap {
        display: flex; align-items: flex-end; gap: var(--space-sm);
        background: var(--color-surface-2);
        border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-sm) var(--space-sm) var(--space-md);
        transition: border-color var(--transition-base), box-shadow var(--transition-base), background var(--transition-base);
      }
      .bb-input-wrap:focus-within {
        border-color: var(--color-primary);
        background: var(--color-surface);
        box-shadow: 0 0 0 3px var(--color-primary-10);
      }
      .bb-input {
        flex: 1; border: none; outline: none;
        font-size: var(--text-base); font-family: var(--font);
        background: transparent; color: var(--color-text);
        resize: none; min-height: 22px; max-height: 100px;
        line-height: 1.55; overflow-y: auto; padding: 2px 0;
        scrollbar-width: none; font-weight: 400;
      }
      .bb-input::-webkit-scrollbar { display: none; }
      .bb-input::placeholder { color: var(--color-text-faint); font-weight: 400; }
      .bb-input:disabled { opacity: 0.45; cursor: not-allowed; }
      .bb-send {
        width: 36px; height: 36px; border-radius: var(--radius-sm);
        background: var(--color-text); border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center; color: #fff;
        transition: opacity var(--transition-fast), transform var(--transition-fast);
        flex-shrink: 0; min-height: 36px;
      }
      .bb-send:hover { opacity: 0.8; }
      .bb-send:active { transform: scale(0.92); }
      .bb-send:disabled { opacity: 0.25; cursor: not-allowed; }
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
        .bb-h-name { font-size: 22px !important; }
      }
    `;

    /* ════════════════════════════════════════════════════════════════
       HTML TEMPLATE
    ════════════════════════════════════════════════════════════════ */
    const HTML = `
      <!-- LAUNCHER -->
      <button id="bb-launcher" aria-label="Open ${BOT_NAME} chat" title="Chat with us">
        <div class="bb-launch-logo-bg">
          <img class="bb-launch-img" src="${BEE_LOGO_URL}" alt="${BOT_NAME}"
               onerror="this.style.display='none'">
          <span class="bb-launch-down-icon">${IC.chevronDown}</span>
        </div>
        <span id="bb-badge"></span>
      </button>

      <!-- WIDGET WINDOW -->
      <div id="bb-window" role="dialog" aria-modal="true" aria-label="${BOT_NAME}">

        <!-- TAB VIEWS -->
        <div id="bb-tab-views">

          <!-- ══ HOME TAB ══ -->
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
              <div class="bb-h-greeting">Hi there 👋</div>
              <div class="bb-h-name">${COMPANY_NAME}</div>
              <div class="bb-h-tagline">${TAGLINE}</div>
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
                <div class="bb-h-sec-label">Suggested</div>
                ${STARTERS.map((s, i) => `
                  <button class="bb-starter-chip" data-starter="${s.replace(/"/g, '&quot;')}" type="button"
                          style="animation-delay:${i * 70}ms">
                    <span class="bb-h-starter-icon">${IC.sparkle}</span>
                    <span style="flex:1;line-height:1.4">${s}</span>
                    <span class="bb-h-starter-arr">${IC.chevronRight}</span>
                  </button>
                `).join('')}
              </div>
              ` : ''}

              <div class="bb-home-footer">
                <a class="bb-powered" href="https://beebot.ai" target="_blank" rel="noopener">
                  🐝&nbsp;Powered by BeeBot AI
                </a>
              </div>
            </div>
          </div>

          <!-- ══ MESSAGES TAB ══ -->
          <div id="bb-messages-tab" class="bb-tab-view">
            <div class="bb-msgs-header">
              <span class="bb-msgs-title">Messages</span>
              <button class="bb-new-chat-btn" id="bb-new-chat-tab-btn" type="button">
                ${IC.newChat}&nbsp;New Chat
              </button>
            </div>
            <div class="bb-convos-list" id="bb-convos-list"></div>
          </div>

          <!-- TAB BAR -->
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

        </div><!-- /#bb-tab-views -->

        <!-- ══ CHAT VIEW ══ -->
        <div id="bb-chat" role="main" aria-label="Chat">

          <div class="bb-chat-header">
            <button class="bb-chat-back" id="bb-chat-back" aria-label="Back to messages">${IC.back}</button>
            <div class="bb-chat-header-info">
              <div class="bb-chat-avatar">
                <img src="${BEE_LOGO_URL}" alt="${BOT_NAME}" onerror="this.style.display='none'">
                <div class="bb-chat-avatar-badge"></div>
              </div>
              <div>
                <div class="bb-chat-header-name">${BOT_NAME}</div>
               
              </div>
            </div>
            <div class="bb-chat-header-actions">
              <button class="bb-chat-hbtn" id="bb-talk-human-btn" aria-label="Request human support" title="Talk to a human">${IC.agent}</button>
              <button class="bb-chat-hbtn" id="bb-more-btn" aria-label="More options">${IC.more}</button>
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

          <div id="bb-handoff-banner">
            <div id="bb-handoff-banner-text">${IC.agent}&nbsp; Connect with a human agent</div>
            <button id="bb-handoff-banner-btn" type="button">Talk to a human</button>
          </div>

          <div class="bb-input-area">
            <div class="bb-input-wrap">
              <textarea
                id="bb-input" class="bb-input"
                placeholder="Ask a question…"
                rows="1" maxlength="2000"
                aria-label="Type your message"
              ></textarea>
              <div>
                <button class="bb-send" id="bb-send" type="button" aria-label="Send message">${IC.send}</button>
              </div>
            </div>
            <div class="bb-input-footer">
              <a class="bb-powered" href="https://beebot.ai" target="_blank" rel="noopener">
                🐝&nbsp;Powered by BeeBot AI
              </a>
            </div>
          </div>

        </div><!-- /#bb-chat -->

      </div><!-- /#bb-window -->
    `;

    /* ── Mount Shadow DOM ── */
    const host = document.createElement('div');
    host.id = 'beebot-root';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Load Outfit font inside shadow
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
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
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
    const newChatTabBtn    = shadow.getElementById('bb-new-chat-tab-btn');
    const convosListEl     = shadow.getElementById('bb-convos-list');
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
    const newConvoBtn      = shadow.getElementById('bb-new-convo-btn');
    const closeChatBtn     = shadow.getElementById('bb-close-chat-btn');
    const tabBtns          = shadow.querySelectorAll('.bb-tab-btn');

    /* ── State ── */
    let allConvos    = loadAllConvos();
    let currentConvo = null;
    let isOpen       = false;
    let isBusy       = false;
    let unreadCount  = 0;
    let handoffShown = false;
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
        homeView.classList.add('active');
        messagesTabView.classList.remove('active');
        renderRecentMessages();
      } else {
        // homeView.classList.remove('active');
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
      const recent = convos.slice(0, 3);
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
      handoffShown = false;
      handoffBanner.classList.remove('visible');

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
      handoffShown = false;
      handoffBanner.classList.remove('visible');

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

    // Messages tab "New Chat" button
    newChatTabBtn.addEventListener('click', () => {
      if (!isOpen) openWidget();
      startNewConversation();
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

    closeChatBtn.addEventListener('click', () => {
      dropdown.classList.remove('open'); dropdownOpen = false;
      closeWidget();
    });

    /* ═══════════════════════════════════════════
       HUMAN HANDOFF
    ═══════════════════════════════════════════ */
    talkHumanBtn.addEventListener('click', () => {
      if (!handoffShown) { handoffBanner.classList.add('visible'); handoffShown = true; }
      else { handoffBanner.classList.toggle('visible'); }
    });

    handoffBannerBtn.addEventListener('click', () => {
      handoffBanner.classList.remove('visible');
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
      const existing = messagesEl.querySelector('.bb-resolve-prompt');
      if (existing) existing.remove();

      const prompt = document.createElement('div');
      prompt.className = 'bb-resolve-prompt';
      prompt.innerHTML = `
        <p>Did this answer your question?</p>
        <div class="bb-resolve-btns">
          <button class="bb-resolve-yes" type="button">Yes, resolved ✓</button>
          <button class="bb-resolve-no"  type="button">No, need more help</button>
        </div>
      `;

      const yesBtn = prompt.querySelector('.bb-resolve-yes');
      const noBtn  = prompt.querySelector('.bb-resolve-no');

      yesBtn.addEventListener('click', async () => {
        yesBtn.disabled = true; noBtn.disabled = true;
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

      noBtn.addEventListener('click', () => { if (prompt.parentNode) prompt.remove(); });

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

        const res  = await fetch(`${API_URL}/chat`, {
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
