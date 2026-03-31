/**
 * BeeBot Chat Widget v2
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

    // ─── 1. Config from <script> tag ──────────────────────────────────────────
    const scriptTag = document.currentScript ||
        Array.from(document.getElementsByTagName('script'))
            .find(s => s.src && s.src.includes('widget.js'));

    const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;
    const API_URL = scriptTag ? scriptTag.getAttribute('data-api-url') : null;

    if (!API_KEY || !API_URL) {
        console.error('[BeeBot] Missing data-api-key or data-api-url on <script> tag.');
        return;
    }

    const WIDGET_BASE_URL = (() => {
        const s = document.querySelector('script[src*="widget.js"]');
        if (s) { try { return new URL(s.src).origin; } catch (e) {} }
        return '';
    })();
    const BEE_CHAT_LOGO = `${WIDGET_BASE_URL}/bee-chat.png`;

    // ─── 2. Visitor ID ────────────────────────────────────────────────────────
    const getVisitorId = () => {
        const KEY = 'beebot_visitor_id';
        let id = localStorage.getItem(KEY);
        if (!id) { id = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(); localStorage.setItem(KEY, id); }
        return id;
    };
    const VISITOR_ID = getVisitorId();

    // ─── 3. Session persistence (7-day TTL) ──────────────────────────────────
    const SESSION_KEY = `beebot_session_${VISITOR_ID}`;
    const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

    const loadSession = () => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const s = JSON.parse(raw);
            if (Date.now() - s.savedAt > SESSION_TTL) { localStorage.removeItem(SESSION_KEY); return null; }
            return s;
        } catch (e) { return null; }
    };

    const saveSession = (messages, conversationId) => {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ messages, conversationId, savedAt: Date.now() }));
        } catch (e) {}
    };

    // ─── 4. Color persistence ─────────────────────────────────────────────────
    const COLOR_KEY = `beebot_color_${VISITOR_ID}`;
    const getStoredColor = () => localStorage.getItem(COLOR_KEY) || null;
    const storeColor = (c) => localStorage.setItem(COLOR_KEY, c);

    let colorSaveTimer = null;
    const saveColorToServer = (color) => {
        clearTimeout(colorSaveTimer);
        colorSaveTimer = setTimeout(() => {
            fetch(`${API_URL}/chat/color`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                body: JSON.stringify({ primary_color: color })
            }).catch(() => {});
        }, 800);
    };

    // ─── 5. Rich text renderer ────────────────────────────────────────────────
    const renderMarkdown = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.9em">$1</code>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">$1</a>')
            .replace(/\n/g, '<br>');
    };

    // ─── 6. Timestamp formatting ──────────────────────────────────────────────
    const formatTime = (ts) => {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ─── 7. HSV ↔ HEX color math ─────────────────────────────────────────────
    const hexToHsv = (hex) => {
        const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
        const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d/max, v = max;
        if (d !== 0) {
            if (max === r) h = ((g-b)/d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b-r)/d + 2) / 6;
            else h = ((r-g)/d + 4) / 6;
        }
        return { h: h*360, s: s*100, v: v*100 };
    };

    const hsvToHex = (h, s, v) => {
        h /= 360; s /= 100; v /= 100;
        let r, g, b;
        const i = Math.floor(h*6), f = h*6-i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
        switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;default:r=v;g=p;b=q;}
        return '#' + [r,g,b].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
    };

    const hueToHex = (h) => hsvToHex(h, 100, 100);

    // ─── 8. Fetch config ──────────────────────────────────────────────────────
    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_URL}/chat/config`, { headers: { 'x-api-key': API_KEY } });
            if (res.ok) return await res.json();
        } catch (e) {}
        return {};
    };

    // ─── 9. Build Widget ──────────────────────────────────────────────────────
    const buildWidget = (botConfig) => {
        const storedColor = getStoredColor();
        let PRIMARY_COLOR = storedColor || botConfig.primary_color || '#000000';
        const BOT_NAME    = botConfig.bot_name || 'BeeBot Support';
        const WELCOME_MSG = botConfig.welcome_message || 'Hi! How can I help you today?';
        const STARTERS    = Array.isArray(botConfig.conversation_starters) ? botConfig.conversation_starters : [];

        const savedSession = loadSession();
        let sessionMessages = savedSession ? savedSession.messages : [];
        let conversationId  = savedSession ? savedSession.conversationId : null;
        let unreadCount = 0;

        // Default widget size (resets on refresh — not persisted)
        const DEFAULT_W = 360, DEFAULT_H = 560;
        let winW = DEFAULT_W, winH = DEFAULT_H;

        // ── Styles ──────────────────────────────────────────────────────────
        const getStyles = (color) => `
            *, *::before, *::after { box-sizing: border-box; }

            /* ── Toggle Bubble ── */
            #beebot-toggle {
                position: fixed; bottom: 24px; right: 24px;
                width: 60px; height: 60px; border-radius: 50%;
                background: ${color}; border: none; cursor: pointer;
                box-shadow: 0 4px 24px rgba(0,0,0,0.22);
                display: flex; align-items: center; justify-content: center;
                z-index: 2147483647;
                transition: transform 0.22s ease, box-shadow 0.22s ease;
                color: #fff; outline: none;
            }
            #beebot-toggle:hover { transform: scale(1.09); box-shadow: 0 8px 32px rgba(0,0,0,0.26); }
            #beebot-toggle:active { transform: scale(0.96); }
            #beebot-toggle img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; pointer-events: none; }

            /* ── Unread Badge ── */
            #bb-badge {
                position: absolute; top: -5px; right: -5px;
                background: #ef4444; color: #fff;
                font-size: 11px; font-weight: 700;
                font-family: -apple-system, sans-serif;
                min-width: 20px; height: 20px; border-radius: 10px;
                display: none; align-items: center; justify-content: center;
                padding: 0 5px; border: 2px solid #fff;
                line-height: 1; pointer-events: none;
            }
            #bb-badge.visible { display: flex; }

            /* ── Chat Window ── */
            #beebot-window {
                position: fixed; bottom: 96px; right: 24px;
                width: ${DEFAULT_W}px; height: ${DEFAULT_H}px;
                max-height: calc(100vh - 110px); min-width: 280px; min-height: 360px;
                background: #fff; border-radius: 18px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.18);
                display: flex; flex-direction: column;
                overflow: hidden; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                opacity: 0; transform: translateY(18px) scale(0.96);
                pointer-events: none;
                transition: opacity 0.26s ease, transform 0.26s ease;
            }
            #beebot-window.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
            #beebot-window.minimized { height: 62px !important; overflow: hidden; }
            #beebot-window.minimized .bb-body { display: none; }
            #beebot-window.minimized .bb-footer { display: none; }
            #beebot-window.minimized .bb-color-panel { display: none; }

            /* ── Resize Handles ── */
            .bb-resize {
                position: absolute; z-index: 10;
            }
            .bb-resize-nw { top: 0; left: 0; width: 14px; height: 14px; cursor: nw-resize; border-radius: 18px 0 0 0; }
            .bb-resize-ne { top: 0; right: 0; width: 14px; height: 14px; cursor: ne-resize; border-radius: 0 18px 0 0; }
            .bb-resize-sw { bottom: 0; left: 0; width: 14px; height: 14px; cursor: sw-resize; border-radius: 0 0 0 18px; }
            .bb-resize-se { bottom: 0; right: 0; width: 14px; height: 14px; cursor: se-resize; border-radius: 0 0 18px 0; }
            .bb-resize-n  { top: 0; left: 14px; right: 14px; height: 6px; cursor: n-resize; }
            .bb-resize-s  { bottom: 0; left: 14px; right: 14px; height: 6px; cursor: s-resize; }
            .bb-resize-w  { left: 0; top: 14px; bottom: 14px; width: 6px; cursor: w-resize; }
            .bb-resize-e  { right: 0; top: 14px; bottom: 14px; width: 6px; cursor: e-resize; }
            /* Visual hint on corners */
            .bb-resize-se::after {
                content: '';
                position: absolute; bottom: 4px; right: 4px;
                width: 6px; height: 6px;
                border-right: 2px solid rgba(0,0,0,0.2);
                border-bottom: 2px solid rgba(0,0,0,0.2);
            }

            /* ── Header ── */
            .bb-header {
                background: ${color}; padding: 13px 16px;
                display: flex; align-items: center; justify-content: space-between;
                flex-shrink: 0; user-select: none;
            }
            .bb-header-left { display: flex; align-items: center; gap: 10px; }
            .bb-avatar {
                width: 36px; height: 36px; border-radius: 50%;
                background: rgba(255,255,255,0.15); overflow: hidden;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            .bb-avatar img { width: 36px; height: 36px; object-fit: cover; }
            .bb-name { font-weight: 600; font-size: 15px; color: #fff; line-height: 1.2; }
            .bb-status { font-size: 11px; color: rgba(255,255,255,0.78); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
            .bb-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; }
            .bb-header-btns { display: flex; align-items: center; gap: 6px; }
            .bb-hbtn {
                background: rgba(0,0,0,0.15); border: none; color: #fff;
                width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
                font-size: 16px; display: flex; align-items: center; justify-content: center;
                transition: background 0.15s; flex-shrink: 0; line-height: 1;
            }
            .bb-hbtn:hover { background: rgba(0,0,0,0.28); }

            /* ── Body ── */
            .bb-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

            /* ── Messages ── */
            .bb-messages {
                flex: 1; padding: 16px 14px; overflow-y: auto;
                background: #f7f8fa; display: flex; flex-direction: column;
                gap: 4px; scrollbar-width: thin; scrollbar-color: #ddd transparent;
            }
            .bb-row { display: flex; flex-direction: column; }
            .bb-row.user { align-items: flex-end; }
            .bb-row.bot  { align-items: flex-start; }
            .bb-row + .bb-row { margin-top: 8px; }
            .bb-row.user + .bb-row.user,
            .bb-row.bot  + .bb-row.bot  { margin-top: 2px; }

            .bb-msg {
                max-width: 82%; padding: 9px 13px;
                font-size: 14px; line-height: 1.55; word-break: break-word;
                animation: bbFadeUp 0.22s ease forwards;
            }
            .bb-row.bot .bb-msg {
                background: #fff; border: 1px solid #e8e8e8; color: #1a1a1a;
                border-radius: 4px 14px 14px 14px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            }
            .bb-row.user .bb-msg {
                background: ${color}; color: #fff;
                border-radius: 14px 14px 4px 14px;
            }
            .bb-row.error .bb-msg {
                background: #fff3f3; border: 1px solid #fecaca;
                color: #c0392b; border-radius: 4px 14px 14px 14px;
            }
            .bb-meta {
                font-size: 10px; color: #aaa; margin-top: 3px;
                display: flex; align-items: center; gap: 4px; padding: 0 2px;
            }
            .bb-row.user .bb-meta { flex-direction: row-reverse; }
            .bb-seen { color: #60a5fa; font-size: 12px; }

            @keyframes bbFadeUp {
                from { opacity: 0; transform: translateY(5px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            /* ── Typing Indicator ── */
            .bb-typing {
                align-self: flex-start; background: #fff;
                border: 1px solid #e8e8e8; padding: 11px 15px;
                border-radius: 4px 14px 14px 14px;
                display: none; gap: 5px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-top: 8px;
            }
            .bb-typing.active { display: flex; }
            .bb-dot {
                width: 7px; height: 7px; background: #c0c0c0; border-radius: 50%;
                animation: bbBounce 1.4s infinite ease-in-out both;
            }
            .bb-dot:nth-child(1) { animation-delay: -0.32s; }
            .bb-dot:nth-child(2) { animation-delay: -0.16s; }
            @keyframes bbBounce {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                40%            { transform: scale(1);   opacity: 1;   }
            }

            /* ── Conversation Starters ── */
            #bb-starters {
                padding: 0 14px 10px; background: #f7f8fa;
                display: flex; flex-direction: column; gap: 6px;
            }
            .bb-starter-btn {
                padding: 8px 13px; background: #fff;
                border: 1.5px solid ${color}; border-radius: 20px;
                font-size: 13px; font-family: inherit; color: ${color};
                font-weight: 500; cursor: pointer; text-align: left;
                transition: background 0.15s, transform 0.1s;
            }
            .bb-starter-btn:hover { background: rgba(0,0,0,0.03); transform: translateY(-1px); }

            /* ── Handoff Banner ── */
            #bb-handoff {
                margin: 0 14px 10px; padding: 10px 14px;
                background: #f0fdf4; border: 1px solid #bbf7d0;
                border-radius: 8px; font-size: 13px; color: #166534;
                display: none; align-items: center; justify-content: space-between; gap: 8px;
            }
            #bb-handoff.visible { display: flex; }
            #bb-handoff-btn {
                background: #166534; color: #fff; border: none;
                padding: 5px 10px; border-radius: 6px; cursor: pointer;
                font-size: 12px; font-family: inherit; white-space: nowrap; flex-shrink: 0;
            }

            /* ── Input Area ── */
            .bb-input-area {
                padding: 10px 12px; background: #fff;
                border-top: 1px solid #efefef;
                display: flex; align-items: center; gap: 8px; flex-shrink: 0;
            }
            .bb-input {
                flex: 1; padding: 9px 15px; border: 1.5px solid #e2e8f0;
                border-radius: 22px; outline: none; font-size: 14px;
                font-family: inherit; background: #f9fafb; color: #1a1a1a;
                transition: border-color 0.2s;
            }
            .bb-input:focus { border-color: ${color}; background: #fff; }
            .bb-input::placeholder { color: #aaa; }
            .bb-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .bb-send {
                flex-shrink: 0; background: ${color}; color: #fff;
                border: none; width: 38px; height: 38px; border-radius: 50%;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; transition: opacity 0.2s, transform 0.15s;
            }
            .bb-send:hover { opacity: 0.88; }
            .bb-send:active { transform: scale(0.94); }
            .bb-send:disabled { opacity: 0.38; cursor: not-allowed; }

            /* ── Color Picker Panel (matching image exactly) ── */
            .bb-color-panel {
                padding: 0; background: #fff;
                border-top: 1px solid #f0f0f0; flex-shrink: 0;
                display: none; flex-direction: column;
            }
            .bb-color-panel.open { display: flex; }

            /* SV gradient box */
            #bb-sv-box {
                width: 100%; height: 160px;
                position: relative; cursor: crosshair; user-select: none;
                flex-shrink: 0;
            }
            #bb-sv-cursor {
                position: absolute; width: 16px; height: 16px; border-radius: 50%;
                border: 2.5px solid #fff; box-shadow: 0 0 0 1.5px rgba(0,0,0,0.3);
                transform: translate(-50%,-50%); pointer-events: none;
            }

            /* Hue + bottom controls */
            .bb-cp-bottom {
                padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px;
            }
            #bb-hue-bar {
                width: 100%; height: 12px; border-radius: 6px; cursor: pointer;
                background: linear-gradient(to right,
                    #ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000);
                position: relative; user-select: none; flex-shrink: 0;
            }
            #bb-hue-thumb {
                position: absolute; top: 50%; width: 20px; height: 20px;
                border-radius: 50%; background: #fff; border: 2px solid rgba(0,0,0,0.2);
                box-shadow: 0 1px 5px rgba(0,0,0,0.25);
                transform: translate(-50%, -50%); pointer-events: none;
            }

            /* Hex input row — matches the image */
            .bb-hex-row {
                display: flex; align-items: center; gap: 8px;
                border: 1.5px solid #e8e8e8; border-radius: 8px;
                padding: 6px 10px; background: #fafafa;
            }
            #bb-swatch-circle {
                width: 26px; height: 26px; border-radius: 50%;
                border: 1.5px solid rgba(0,0,0,0.12); flex-shrink: 0;
                cursor: pointer;
            }
            .bb-hex-label {
                font-size: 13px; color: #999; font-family: monospace; flex-shrink: 0;
            }
            #bb-hex-input {
                flex: 1; border: none; outline: none; font-size: 13px;
                font-family: monospace; color: #222; background: transparent;
                min-width: 0;
            }
            #bb-copy-hex {
                background: none; border: none; cursor: pointer; padding: 2px;
                color: #aaa; display: flex; align-items: center; transition: color 0.15s;
            }
            #bb-copy-hex:hover { color: #555; }
            #bb-hex-mode {
                font-size: 12px; color: #888; background: #f0f0f0;
                border: 1px solid #e0e0e0; border-radius: 5px;
                padding: 3px 7px; cursor: default; flex-shrink: 0;
                display: flex; align-items: center; gap: 3px;
            }

            /* ── Footer ── */
            .bb-footer {
                text-align: center; font-size: 11px; color: #bbb;
                padding: 5px 0 7px; background: #fff;
                border-top: 1px solid #f0f0f0; flex-shrink: 0;
            }
            .bb-footer a { color: #bbb; text-decoration: none; }
            .bb-footer a:hover { color: #888; }

            /* ── Mobile ── */
            @media (max-width: 480px) {
                #beebot-window {
                    bottom: 0 !important; right: 0 !important; left: 0 !important;
                    width: 100% !important; height: 100% !important;
                    max-height: 100dvh; border-radius: 0;
                }
                #beebot-toggle { bottom: 16px; right: 16px; }
                .bb-resize { display: none; }
            }
        `;

        // ── SVGs ──────────────────────────────────────────────────────────────
        const SEND_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
        const PALETTE_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;
        const COPY_SVG  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        const CHEVRON_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

        // ── Starter HTML ──────────────────────────────────────────────────────
        const startersHtml = STARTERS.length > 0
            ? `<div id="bb-starters">${STARTERS.map(s =>
                `<button class="bb-starter-btn" type="button">${s}</button>`
              ).join('')}</div>`
            : '<div id="bb-starters" style="display:none"></div>';

        // ── Main HTML ─────────────────────────────────────────────────────────
        const html = `
            <button id="beebot-toggle" title="Chat with ${BOT_NAME}" aria-label="Open chat">
                <img src="${BEE_CHAT_LOGO}" alt="Chat" onerror="this.style.display='none'">
                <span id="bb-badge" aria-label="unread messages"></span>
            </button>

            <div id="beebot-window" role="dialog" aria-modal="true" aria-label="${BOT_NAME} chat">

                <!-- Resize handles (corners + edges) -->
                <div class="bb-resize bb-resize-nw" data-dir="nw"></div>
                <div class="bb-resize bb-resize-ne" data-dir="ne"></div>
                <div class="bb-resize bb-resize-sw" data-dir="sw"></div>
                <div class="bb-resize bb-resize-se" data-dir="se"></div>
                <div class="bb-resize bb-resize-n"  data-dir="n"></div>
                <div class="bb-resize bb-resize-s"  data-dir="s"></div>
                <div class="bb-resize bb-resize-w"  data-dir="w"></div>
                <div class="bb-resize bb-resize-e"  data-dir="e"></div>

                <div class="bb-header">
                    <div class="bb-header-left">
                        <div class="bb-avatar">
                            <img src="${BEE_CHAT_LOGO}" alt="${BOT_NAME}" onerror="this.style.display='none'">
                        </div>
                        <div>
                            <div class="bb-name">${BOT_NAME}</div>
                            <div class="bb-status"><span class="bb-status-dot"></span>Online</div>
                        </div>
                    </div>
                    <div class="bb-header-btns">
                        <button class="bb-hbtn" id="bb-color-btn" aria-label="Customize widget color" title="Widget color">${PALETTE_SVG}</button>
                        <button class="bb-hbtn" id="bb-minimize-btn" aria-label="Minimize chat" title="Minimize">&#8722;</button>
                        <button class="bb-hbtn" id="bb-close-btn" aria-label="Close chat" title="Close">&#215;</button>
                    </div>
                </div>

                <div class="bb-body">
                    <div id="bb-messages" class="bb-messages" aria-live="polite" aria-relevant="additions">
                        <div class="bb-typing" id="bb-typing">
                            <div class="bb-dot"></div><div class="bb-dot"></div><div class="bb-dot"></div>
                        </div>
                    </div>

                    ${startersHtml}

                    <div id="bb-handoff" role="status">
                        <span>Need more help?</span>
                        <button id="bb-handoff-btn" type="button">Talk to a human</button>
                    </div>

                    <form id="bb-form" class="bb-input-area" autocomplete="off">
                        <input type="text" id="bb-input" class="bb-input"
                            placeholder="Ask a question..." maxlength="500"
                            aria-label="Type your message" />
                        <button type="submit" id="bb-send" class="bb-send" aria-label="Send message">
                            ${SEND_SVG}
                        </button>
                    </form>
                </div>

                <!-- Color Picker Panel -->
                <div class="bb-color-panel" id="bb-color-panel" aria-label="Color picker">
                    <div id="bb-sv-box"><div id="bb-sv-cursor"></div></div>
                    <div class="bb-cp-bottom">
                        <div id="bb-hue-bar"><div id="bb-hue-thumb"></div></div>
                        <div class="bb-hex-row">
                            <div id="bb-swatch-circle"></div>
                            <span class="bb-hex-label">#</span>
                            <input type="text" id="bb-hex-input" maxlength="6" aria-label="Hex color" />
                            <button id="bb-copy-hex" type="button" title="Copy hex" aria-label="Copy hex color">${COPY_SVG}</button>
                            <div id="bb-hex-mode">Hex ${CHEVRON_SVG}</div>
                        </div>
                    </div>
                </div>

                <div class="bb-footer">Powered by <a href="https://beebot.ai" target="_blank" rel="noopener">BeeBot</a></div>
            </div>
        `;

        // ── Mount Shadow DOM ──────────────────────────────────────────────────
        const host = document.createElement('div');
        host.id = 'beebot-root';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const styleEl = document.createElement('style');
        styleEl.textContent = getStyles(PRIMARY_COLOR);
        shadow.appendChild(styleEl);

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        shadow.appendChild(wrapper);

        // ── Element refs ──────────────────────────────────────────────────────
        const toggleBtn   = shadow.getElementById('beebot-toggle');
        const windowEl    = shadow.getElementById('beebot-window');
        const badge       = shadow.getElementById('bb-badge');
        const minimizeBtn = shadow.getElementById('bb-minimize-btn');
        const closeBtn    = shadow.getElementById('bb-close-btn');
        const colorBtn    = shadow.getElementById('bb-color-btn');
        const messagesEl  = shadow.getElementById('bb-messages');
        const typingEl    = shadow.getElementById('bb-typing');
        const startersEl  = shadow.getElementById('bb-starters');
        const handoffEl   = shadow.getElementById('bb-handoff');
        const handoffBtn  = shadow.getElementById('bb-handoff-btn');
        const form        = shadow.getElementById('bb-form');
        const inputEl     = shadow.getElementById('bb-input');
        const sendBtn     = shadow.getElementById('bb-send');
        const colorPanel  = shadow.getElementById('bb-color-panel');
        const svBox       = shadow.getElementById('bb-sv-box');
        const svCursor    = shadow.getElementById('bb-sv-cursor');
        const hueBar      = shadow.getElementById('bb-hue-bar');
        const hueThumb    = shadow.getElementById('bb-hue-thumb');
        const hexInput    = shadow.getElementById('bb-hex-input');
        const swatchCircle = shadow.getElementById('bb-swatch-circle');
        const copyHexBtn  = shadow.getElementById('bb-copy-hex');

        let isOpen = false, isMinimized = false, isBusy = false;
        let msgCount = 0, handoffShown = false;

        // ── Color picker state ────────────────────────────────────────────────
        let cpHsv = hexToHsv(PRIMARY_COLOR);

        const applyColor = (color) => {
            PRIMARY_COLOR = color;
            storeColor(color);
            styleEl.textContent = getStyles(color);
            saveColorToServer(color);
        };

        const updatePickerUI = () => {
            const hueColor = hueToHex(cpHsv.h);
            svBox.style.background = `
                linear-gradient(to top, #000 0%, transparent 100%),
                linear-gradient(to right, #fff 0%, ${hueColor} 100%)
            `;
            svCursor.style.left = `${cpHsv.s}%`;
            svCursor.style.top  = `${100 - cpHsv.v}%`;
            hueThumb.style.left = `${(cpHsv.h / 360) * 100}%`;
            const hex = hsvToHex(cpHsv.h, cpHsv.s, cpHsv.v);
            hexInput.value = hex.slice(1); // without #
            swatchCircle.style.background = hex;
        };

        const setHsv = (h, s, v) => {
            cpHsv = { h, s, v };
            updatePickerUI();
            applyColor(hsvToHex(h, s, v));
        };

        updatePickerUI();

        // SV drag
        const svDrag = (e) => {
            const rect = svBox.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const s = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
            const v = Math.max(0, Math.min(100, 100 - ((cy - rect.top) / rect.height) * 100));
            setHsv(cpHsv.h, s, v);
        };
        svBox.addEventListener('mousedown', (e) => {
            svDrag(e);
            const mm = (e2) => svDrag(e2);
            const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
            document.addEventListener('mousemove', mm);
            document.addEventListener('mouseup', mu);
        });
        svBox.addEventListener('touchstart', svDrag, { passive: true });
        svBox.addEventListener('touchmove', svDrag, { passive: true });

        // Hue drag
        const hueDrag = (e) => {
            const rect = hueBar.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const h = Math.max(0, Math.min(360, ((cx - rect.left) / rect.width) * 360));
            setHsv(h, cpHsv.s, cpHsv.v);
        };
        hueBar.addEventListener('mousedown', (e) => {
            hueDrag(e);
            const mm = (e2) => hueDrag(e2);
            const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
            document.addEventListener('mousemove', mm);
            document.addEventListener('mouseup', mu);
        });
        hueBar.addEventListener('touchstart', hueDrag, { passive: true });
        hueBar.addEventListener('touchmove', hueDrag, { passive: true });

        // Hex input
        hexInput.addEventListener('input', () => {
            const val = '#' + hexInput.value.replace(/[^0-9A-Fa-f]/g, '');
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                const hsv = hexToHsv(val);
                cpHsv = hsv;
                updatePickerUI();
                applyColor(val);
            }
        });

        // Copy hex
        copyHexBtn.addEventListener('click', () => {
            const hex = hsvToHex(cpHsv.h, cpHsv.s, cpHsv.v);
            navigator.clipboard.writeText(hex).catch(() => {});
            copyHexBtn.style.color = '#22c55e';
            setTimeout(() => { copyHexBtn.style.color = ''; }, 1200);
        });

        // ── Resize Handles ────────────────────────────────────────────────────
        shadow.querySelectorAll('.bb-resize').forEach(handle => {
            handle.addEventListener('mousedown', (startE) => {
                if (isMinimized) return;
                startE.preventDefault();
                const dir = handle.dataset.dir;
                const rect = windowEl.getBoundingClientRect();
                const startX = startE.clientX, startY = startE.clientY;
                const startW = rect.width, startH = rect.height;
                const startR = window.innerWidth - rect.right;
                const startB = window.innerHeight - rect.bottom;

                const MIN_W = 280, MIN_H = 360;

                const onMove = (e) => {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    let newW = startW, newH = startH;
                    let newR = startR, newB = startB;

                    if (dir.includes('e')) newW = Math.max(MIN_W, startW + dx);
                    if (dir.includes('w')) { newW = Math.max(MIN_W, startW - dx); newR = startR + (startW - newW); }
                    if (dir.includes('s')) newH = Math.max(MIN_H, startH + dy);
                    if (dir.includes('n')) { newH = Math.max(MIN_H, startH - dy); newB = startB + (startH - newH); }

                    windowEl.style.width  = newW + 'px';
                    windowEl.style.height = newH + 'px';
                    windowEl.style.right  = newR + 'px';
                    windowEl.style.bottom = newB + 'px';
                };

                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });

        // ── Open / Close / Minimize ───────────────────────────────────────────
        const open = () => {
            isOpen = true;
            windowEl.classList.add('open');
            unreadCount = 0;
            badge.textContent = '';
            badge.classList.remove('visible');
            setTimeout(() => !isMinimized && inputEl.focus(), 60);
        };
        const close = () => {
            isOpen = false;
            windowEl.classList.remove('open');
            colorPanel.classList.remove('open');
        };
        const minimize = () => {
            isMinimized = !isMinimized;
            windowEl.classList.toggle('minimized', isMinimized);
            minimizeBtn.innerHTML = isMinimized ? '&#9723;' : '&#8722;';
            minimizeBtn.title = isMinimized ? 'Restore' : 'Minimize';
            if (!isMinimized) setTimeout(() => inputEl.focus(), 60);
        };

        toggleBtn.addEventListener('click', () => isOpen ? close() : open());
        closeBtn.addEventListener('click', close);
        minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); minimize(); });

        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorPanel.classList.toggle('open');
            if (colorPanel.classList.contains('open')) {
                cpHsv = hexToHsv(PRIMARY_COLOR);
                updatePickerUI();
            }
        });

        handoffBtn.addEventListener('click', () => {
            addMessage('A support agent will be with you shortly. Feel free to continue chatting.', 'bot', Date.now());
            handoffEl.classList.remove('visible');
            persistSession();
        });

        // ── Message rendering ─────────────────────────────────────────────────
        const addMessage = (text, role, ts, isWelcome = false) => {
            const row = document.createElement('div');
            row.className = `bb-row ${role}`;

            const bubble = document.createElement('div');
            bubble.className = 'bb-msg';
            if (role === 'bot' || role === 'error') bubble.innerHTML = renderMarkdown(text);
            else bubble.textContent = text;
            row.appendChild(bubble);

            if (!isWelcome) {
                const meta = document.createElement('div');
                meta.className = 'bb-meta';
                const timeSpan = document.createElement('span');
                timeSpan.textContent = formatTime(ts);
                timeSpan.dataset.ts = ts;
                meta.appendChild(timeSpan);
                if (role === 'user') {
                    const seen = document.createElement('span');
                    seen.className = 'bb-seen';
                    seen.innerHTML = '&#10003;&#10003;';
                    seen.title = 'Delivered';
                    meta.appendChild(seen);
                }
                row.appendChild(meta);
            }

            messagesEl.insertBefore(row, typingEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return row;
        };

        // Refresh relative timestamps
        setInterval(() => {
            messagesEl.querySelectorAll('.bb-meta span[data-ts]').forEach(el => {
                el.textContent = formatTime(parseInt(el.dataset.ts));
            });
        }, 30000);

        // ── Persist session ───────────────────────────────────────────────────
        const persistSession = () => {
            const msgs = [];
            messagesEl.querySelectorAll('.bb-row').forEach(row => {
                const bubble = row.querySelector('.bb-msg');
                const tsMeta = row.querySelector('.bb-meta span[data-ts]');
                if (!bubble || !tsMeta) return;
                const role = row.classList.contains('user') ? 'user' : row.classList.contains('error') ? 'error' : 'bot';
                msgs.push({ text: bubble.textContent || bubble.innerText, role, ts: parseInt(tsMeta.dataset.ts) });
            });
            saveSession(msgs, conversationId);
        };

        // ── Load welcome + session ────────────────────────────────────────────
        addMessage(WELCOME_MSG, 'bot', Date.now(), true);

        if (sessionMessages.length > 0) {
            startersEl.style.display = 'none';
            sessionMessages.forEach(m => addMessage(m.text, m.role, m.ts));
            msgCount = sessionMessages.length;
            if (msgCount >= 3) { handoffEl.classList.add('visible'); handoffShown = true; }
        } else {
            if (STARTERS.length === 0) startersEl.style.display = 'none';
        }

        // ── Starters ──────────────────────────────────────────────────────────
        startersEl.querySelectorAll('.bb-starter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                inputEl.value = btn.textContent;
                startersEl.style.display = 'none';
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            });
        });

        // ── Send ──────────────────────────────────────────────────────────────
        const setLoading = (loading) => {
            isBusy = loading;
            inputEl.disabled = loading;
            sendBtn.disabled = loading;
            typingEl.classList.toggle('active', loading);
            if (loading) messagesEl.scrollTop = messagesEl.scrollHeight;
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = inputEl.value.trim();
            if (!query || isBusy) return;

            startersEl.style.display = 'none';
            inputEl.value = '';
            const ts = Date.now();
            addMessage(query, 'user', ts);
            setLoading(true);
            msgCount++;

            try {
                const body = { query, visitor_id: VISITOR_ID };
                if (conversationId) body.conversation_id = conversationId;

                const res = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                setLoading(false);

                if (res.ok && data.response) {
                    addMessage(data.response, 'bot', Date.now());
                    if (data.conversation_id) conversationId = data.conversation_id;
                    if (!isOpen) {
                        unreadCount++;
                        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
                        badge.classList.add('visible');
                    }
                    if (!handoffShown && msgCount >= 3) {
                        handoffEl.classList.add('visible');
                        handoffShown = true;
                    }
                } else {
                    addMessage(data.error || 'Something went wrong. Please try again.', 'error', Date.now());
                }
            } catch (err) {
                setLoading(false);
                addMessage('Could not reach the server. Please check your connection.', 'error', Date.now());
            }

            persistSession();
        });

    }; // end buildWidget

    // ─── 10. Bootstrap ────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => fetchConfig().then(buildWidget));
    } else {
        fetchConfig().then(buildWidget);
    }

})();
