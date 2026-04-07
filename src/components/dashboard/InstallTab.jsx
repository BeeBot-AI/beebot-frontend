import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Upload, Settings, Code, Rocket, Key, Info, Bot } from 'lucide-react';
import config from '../../config';

// ─── Responsive hook ───────────────────────────────────────────────────────
function useWindowWidth() {
    const [width, setWidth] = useState(() => window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
}

const PLATFORMS = [
    {
        id: 'html',
        label: 'HTML / Vanilla',
        steps: [
            { text: 'Open the HTML file for every page you want the chatbot on (or your shared layout/template).' },
            { text: 'Find the closing </body> tag near the bottom of the file.' },
            { text: 'Paste the script tag just before </body>.', code: true },
            { text: 'Save and upload the file. Reload the page — you should see the BeeBot bubble in the bottom-right corner.' },
        ]
    },
    {
        id: 'react',
        label: 'React / Next.js',
        steps: [
            { text: 'For Vite or Create React App: open public/index.html and paste the script before </body>.', code: true },
            { text: 'For Next.js (App Router): add the script to app/layout.tsx inside <body> using next/script with strategy="lazyOnload".', codeSnippet: `import Script from 'next/script';\n// inside <body>:\n<Script src="..." data-api-key="..." data-api-url="..." strategy="lazyOnload" />` },
            { text: 'For Next.js (Pages Router): add to pages/_document.js inside <body>.' },
            { text: 'Rebuild and deploy your app. The widget loads automatically on every page.' },
        ]
    },
    {
        id: 'vue',
        label: 'Vue / Nuxt',
        steps: [
            { text: 'For Vue with Vite: open public/index.html and paste the script before </body>.', code: true },
            { text: 'For Nuxt 3: add to nuxt.config.ts using the app.head.script array:', codeSnippet: `app: { head: { script: [{ src: '...', 'data-api-key': '...', 'data-api-url': '...', defer: true }] } }` },
            { text: 'For Nuxt 2: add to nuxt.config.js head.script array similarly.' },
            { text: 'Run nuxt build and deploy. The widget loads on every page.' },
        ]
    },
    {
        id: 'wordpress',
        label: 'WordPress',
        steps: [
            { text: 'Option 1 (Theme File): Go to Appearance → Theme Editor → footer.php and paste the script before </body>.', code: true },
            { text: 'Option 2 (Plugin — recommended): Install the "Insert Headers and Footers" plugin by WPBeginner.' },
            { text: 'In the plugin settings, paste the script in the "Scripts in Footer" section.' },
            { text: 'Save and visit your site — the BeeBot bubble will appear on every page.' },
        ]
    },
    {
        id: 'shopify',
        label: 'Shopify',
        steps: [
            { text: 'In your Shopify admin, go to Online Store → Themes → click the "…" menu → Edit Code.' },
            { text: 'Open the Layout folder and click theme.liquid.' },
            { text: 'Find the closing </body> tag and paste the script just before it.', code: true },
            { text: 'Click Save. The widget will load on your storefront on every page.' },
        ]
    },
    {
        id: 'webflow',
        label: 'Webflow',
        steps: [
            { text: 'Open your Webflow project and go to Project Settings → Custom Code tab.' },
            { text: 'Scroll to the "Footer Code" section.' },
            { text: 'Paste the script tag there.', code: true },
            { text: 'Click Save Changes, then publish your site. The widget will appear on all pages.' },
        ]
    },
    {
        id: 'wix',
        label: 'Wix',
        steps: [
            { text: 'In the Wix Editor, go to Settings → Custom Code.' },
            { text: 'Click "Add Custom Code" and paste the script tag.', code: true },
            { text: 'Set placement to "Body — End of page" and apply to "All Pages".' },
            { text: 'Publish your site. BeeBot will load on every page.' },
        ]
    },
];

const ScriptBlock = ({ apiKey }) => (
    <>
        <span style={{ color: '#7dd3fc' }}>&lt;script</span>{'\n'}
        {'  '}<span style={{ color: '#a5f3fc' }}>src</span>=<span style={{ color: '#fde68a' }}>"https://beebot-ai.vercel.app/widget.js"</span>{'\n'}
        {'  '}<span style={{ color: '#a5f3fc' }}>data-api-key</span>=<span style={{ color: '#fde68a' }}>"{apiKey || 'YOUR_API_KEY_HERE'}"</span>{'\n'}
        {'  '}<span style={{ color: '#a5f3fc' }}>data-api-url</span>=<span style={{ color: '#fde68a' }}>"https://beebot-backend.onrender.com/api"</span>{'\n'}
        {'  '}<span style={{ color: '#a5f3fc' }}>defer</span><span style={{ color: '#7dd3fc' }}>&gt;&lt;/script&gt;</span>
    </>
);

export default function InstallTab({ apiKey }) {
    const [copiedKey, setCopiedKey]       = useState(false);
    const [copiedScript, setCopiedScript] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [activePlatform, setActivePlatform] = useState('html');

    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth >= 640 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;

    const embedScript = `<script\n  src="https://beebot-ai.vercel.app/widget.js"\n  data-api-key="${apiKey || 'YOUR_API_KEY_HERE'}"\n  data-api-url="https://beebot-backend.onrender.com/api"\n  defer>\n</script>`;

    const aiPrompt = `I am integrating BeeBot, an AI chatbot, into my [TECH STACK] application.

Please add the following script tag to my project so the chatbot loads on every page:

<script
  src="https://beebot-ai.vercel.app/widget.js"
  data-api-key="${apiKey || 'YOUR_API_KEY_HERE'}"
  data-api-url="https://beebot-backend.onrender.com/api"
  defer>
</script>

Instructions:
- For HTML projects: place it just before the closing </body> tag in every HTML file or shared layout/template
- For React (Vite/CRA): add it to public/index.html before </body>
- For Next.js: add it inside the <Head> or <body> via _document.js or next/script with strategy="lazyOnload"
- For Vue/Nuxt: add to index.html or nuxt.config.js head.script array
- For WordPress: add to footer.php theme file before </body> or use a plugin like Insert Headers and Footers
- For Shopify: add to theme.liquid layout file before </body>

Do not modify the script tag attributes. Place it as described above for my specific stack.`;

    const copy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => {});
        if (type === 'key') { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }
        else if (type === 'script') { setCopiedScript(true); setTimeout(() => setCopiedScript(false), 2000); }
        else if (type === 'prompt') { setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2000); }
    };

    const activePlatformData = PLATFORMS.find(p => p.id === activePlatform);

    // Responsive grid helpers
    const twoColGrid = {
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
        gap: isMobile ? '1.25rem' : '1.5rem',
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.5rem', minWidth: 0, maxWidth: '100%' }}>

            {/* Page header */}
            <div>
                <h2 className="title mb-1">Install BeeBot</h2>
                <p className="text-muted">Add the chat widget to any website in under 2 minutes — no coding required.</p>
            </div>

            {/* ── Row 1: How BeeBot Works + AI Prompt ─────────────────── */}
            <div style={twoColGrid}>

                {/* Section A: How BeeBot Works */}
                <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <h3 className="section-title mb-1">How BeeBot Works</h3>
                        <p className="text-muted" style={{ fontSize: '0.88rem' }}>Four simple steps from setup to live chatbot.</p>
                    </div>

                    {/* Steps grid: 2 cols on all sizes — compact enough */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: isMobile ? '0.75rem' : '0.9rem',
                    }}>
                        {[
                            { icon: <Upload size={20} />, step: '1', title: 'Upload Knowledge', desc: 'Add your docs, URLs, or text as your bot\'s knowledge base.' },
                            { icon: <Settings size={20} />, step: '2', title: 'Configure Bot', desc: 'Set name, tone, color, and welcome message in Bot Settings.' },
                            { icon: <Code size={20} />, step: '3', title: 'Install Script', desc: 'Paste one script tag on your website — never changes again.' },
                            { icon: <Rocket size={20} />, step: '4', title: 'Go Live', desc: 'Your visitors can now chat with your AI bot instantly.' },
                        ].map(({ icon, step, title, desc }) => (
                            <div key={step} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                padding: isMobile ? '0.85rem' : '1rem',
                                background: 'var(--color-surface)',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: '#000', color: '#FDD017',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, flexShrink: 0,
                                }}>
                                    {icon}
                                </div>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-accent-deep)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step {step}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text)' }}>{title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* Script config explanation */}
                    <div style={{
                        padding: '14px 16px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.65,
                    }}>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px', fontSize: '0.88rem' }}>Configuring the script</p>
                        The embed script uses two <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'var(--color-surface-3)', padding: '1px 5px', borderRadius: '4px' }}>data-</code> attributes:
                        <ul style={{ marginTop: '8px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <li><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1a1a1a' }}>data-api-key</code> — your unique bot identifier (pre-filled above)</li>
                            <li><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1a1a1a' }}>data-api-url</code> — the BeeBot server endpoint (fixed, do not change)</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>All other settings — bot name, colors, messages, starters — are managed from this dashboard and update <strong>automatically</strong> without touching the script tag.</p>
                    </div>
                </div>

                {/* Section D: AI Code Editor Prompt */}
                <div style={{
                    background: '#0d0d0d',
                    borderRadius: '14px',
                    padding: isMobile ? '1.25rem' : '1.5rem',
                    border: '1.5px solid #FDD017',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    {/* Header row — stacks on very small screens */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Bot size={18} color="#FDD017" />
                                <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', margin: 0 }}>AI Code Editor Prompt</h3>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>Copy and paste into Cursor, GitHub Copilot, v0, or any AI code tool to auto-install BeeBot.</p>
                        </div>
                        <button
                            onClick={() => copy(aiPrompt, 'prompt')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                flexShrink: 0,
                                background: copiedPrompt ? '#16a34a' : '#1a1a1a',
                                color: copiedPrompt ? '#fff' : '#aaa',
                                border: '1px solid #333',
                                padding: '8px 14px',
                                borderRadius: '7px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                fontFamily: 'inherit',
                                minHeight: '44px', // touch-friendly
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {copiedPrompt ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy Prompt</>}
                        </button>
                    </div>

                    <pre style={{
                        margin: 0,
                        padding: '14px 16px',
                        background: '#1a1a1a',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        color: '#d0d0d0',
                        lineHeight: 1.8,
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: '1px solid #2a2a2a',
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: isMobile ? '220px' : '340px',
                        WebkitOverflowScrolling: 'touch',
                    }}>
                        {aiPrompt}
                    </pre>

                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(253,208,23,0.08)',
                        border: '1px solid rgba(253,208,23,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: '#c8a000',
                        lineHeight: 1.6,
                    }}>
                        <strong style={{ color: '#FDD017' }}>How to use:</strong> Open your AI code editor, paste this prompt, and it will automatically insert the BeeBot script tag in the right place for your tech stack.
                    </div>
                </div>
            </div>

            {/* ── Row 2: Embed Script + Platform Steps ─────────────────── */}
            {/* Always single-column on non-desktop to prevent overflow */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                gap: isMobile ? '1.25rem' : '1.5rem',
                minWidth: 0,
                width: '100%',
            }}>

                {/* Section B: Get Your Embed Script */}
                <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0, overflow: 'hidden' }}>
                    <h3 className="section-title">Get Your Embed Script</h3>

                    {/* API Key row */}
                    <div>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={14} /> API Key
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            minWidth: 0,
                            overflow: 'hidden',
                        }}>
                            <span style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: apiKey ? 'var(--color-text)' : 'var(--color-text-faint)',
                                letterSpacing: apiKey ? '0.05em' : 0,
                                minWidth: 0,
                                fontSize: isMobile ? '0.72rem' : '0.82rem',
                            }}>
                                {apiKey ? apiKey.replace(/^(.{8})(.+)(.{4})$/, '$1••••••••$3') : 'No API key — complete account setup first'}
                            </span>
                            {apiKey && (
                                <button
                                    className="btn-ghost"
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '0.75rem',
                                        color: copiedKey ? 'var(--color-success)' : undefined,
                                        flexShrink: 0,
                                        minHeight: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onClick={() => copy(apiKey, 'key')}
                                >
                                    {copiedKey ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Script tag code block */}
                    <div style={{ minWidth: 0 }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Code size={14} /> Script Tag
                        </label>
                        <div style={{
                            background: '#0d0d0d',
                            borderRadius: '10px',
                            border: '1px solid #2a2a2a',
                            overflow: 'hidden', // clip children, never let them expand the card
                            width: '100%',
                        }}>
                            {/* Title bar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: '#1a1a1a',
                                borderBottom: '1px solid #2a2a2a',
                                gap: '8px',
                            }}>
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                                </div>
                                <span style={{ fontSize: '0.73rem', color: '#666', fontFamily: 'var(--font-mono)', flex: 1, textAlign: 'center' }}>HTML</span>
                                <button
                                    onClick={() => copy(embedScript, 'script')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        background: copiedScript ? '#16a34a' : '#2a2a2a',
                                        color: copiedScript ? '#fff' : '#aaa',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        fontFamily: 'inherit',
                                        flexShrink: 0,
                                        minHeight: '30px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {copiedScript ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                                </button>
                            </div>

                            {/* Scrollable code — overflowX scroll keeps it contained */}
                            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                                <pre style={{
                                    margin: 0,
                                    padding: '12px 14px',
                                    fontSize: isMobile ? '0.68rem' : '0.78rem',
                                    fontFamily: 'var(--font-mono)',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre',
                                    display: 'inline-block', // shrink-wraps to content width for scroll
                                    minWidth: '100%',        // but at least fills the container
                                }}>
                                    <ScriptBlock apiKey={apiKey} />
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Gold info banner */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        background: '#FFFBDC',
                        border: '1.5px solid #FDD017',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        color: '#7a5c00',
                    }}>
                        <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#C8A000' }} />
                        <span><strong>This script tag never changes.</strong> All customizations update automatically from your dashboard — no edits needed.</span>
                    </div>
                </div>

                {/* Section C: Platform Installation Steps */}
                <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0, overflow: 'hidden' }}>
                    <div>
                        <h3 className="section-title mb-1">Platform Installation</h3>
                        <p className="text-muted" style={{ fontSize: '0.88rem' }}>Select your platform for specific instructions.</p>
                    </div>

                    {/* Platform tabs — horizontally scrollable on mobile, wrapping on larger screens */}
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: isMobile ? 'nowrap' : 'wrap',
                        overflowX: isMobile ? 'auto' : 'visible',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: isMobile ? '6px' : 0,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}>
                        {PLATFORMS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatform(p.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: activePlatform === p.id ? '#000' : 'var(--color-surface)',
                                    color: activePlatform === p.id ? '#FDD017' : 'var(--color-text-muted)',
                                    border: activePlatform === p.id ? '1.5px solid #000' : '1.5px solid var(--color-border)',
                                    fontFamily: 'inherit',
                                    flexShrink: 0,
                                    minHeight: '34px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Steps */}
                    {activePlatformData && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                            {activePlatformData.steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', minWidth: 0 }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: '#FDD017', color: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                                        marginTop: '2px',
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{s.text}</p>
                                        {s.code && (
                                            <div style={{
                                                marginTop: '8px',
                                                background: '#0d0d0d',
                                                borderRadius: '8px',
                                                border: '1px solid #2a2a2a',
                                                overflow: 'hidden',
                                                width: '100%',
                                            }}>
                                                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                                    <pre style={{
                                                        margin: 0,
                                                        padding: '10px 12px',
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: isMobile ? '0.62rem' : '0.7rem',
                                                        color: '#e0e0e0',
                                                        lineHeight: 1.7,
                                                        whiteSpace: 'pre',
                                                        display: 'inline-block',
                                                        minWidth: '100%',
                                                    }}>
                                                        <ScriptBlock apiKey={apiKey} />
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        {s.codeSnippet && (
                                            <div style={{
                                                marginTop: '8px',
                                                background: '#0d0d0d',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                border: '1px solid #2a2a2a',
                                                overflow: 'hidden',
                                                width: '100%',
                                            }}>
                                                <pre style={{
                                                    margin: 0,
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: isMobile ? '0.62rem' : '0.7rem',
                                                    color: '#e0e0e0',
                                                    lineHeight: 1.7,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'break-word',
                                                }}>
                                                    {s.codeSnippet}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 3: Verify & Go Live Checklist (full width) ─────── */}
            <div className="card p-6">
                <h3 className="section-title mb-5">Verify &amp; Go Live Checklist</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr'
                        : isTablet
                            ? 'repeat(2, 1fr)'
                            : 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: '10px',
                }}>
                    {[
                        { label: 'At least one knowledge source uploaded', link: 'knowledge', linkLabel: 'Knowledge Base' },
                        { label: 'Bot name and welcome message configured', link: 'settings', linkLabel: 'Bot Settings' },
                        { label: 'Widget color set to match your brand', link: 'settings', linkLabel: 'Bot Settings' },
                        { label: 'Test chat in the Playground tab', link: 'playground', linkLabel: 'Playground' },
                    ].map(({ label, link, linkLabel }, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '10px',
                            flexWrap: 'nowrap',
                        }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                border: '2px solid var(--color-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', display: 'block' }} />
                            </div>
                            <span style={{ flex: 1, fontSize: '0.87rem', color: 'var(--color-text)', minWidth: 0 }}>{label}</span>
                            <a
                                href={`/dashboard/${link}`}
                                style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--color-accent-deep)',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    textDecoration: 'underline',
                                    flexShrink: 0,
                                }}
                            >
                                → {linkLabel}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}