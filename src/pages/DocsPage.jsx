import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { BookOpen, Upload, Settings, Code, Zap, Database, MessageSquare, ChevronRight, CheckCircle, Copy, ExternalLink } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --black-card: #1A1A1A; --black-mid: #2A2A2A;
    --text-dark: #1A1200; --text-muted: #5C5032; --text-faint: #8C7A4A;
    --border: rgba(184,134,11,0.2); --border-strong: rgba(184,134,11,0.4);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --radius-md: 14px; --radius-lg: 20px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
  .docs-layout { display: grid; grid-template-columns: 260px 1fr; min-height: calc(100vh - 72px); }
  .sidebar { background: white; border-right: 1px solid var(--border); padding: 2rem 0; position: sticky; top: 72px; height: calc(100vh - 72px); overflow-y: auto; }
  .sidebar-section-title { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-faint); padding: 0 1.5rem; margin-bottom: 0.5rem; margin-top: 1.5rem; }
  .sidebar-link { display: flex; align-items: center; gap: 8px; padding: 8px 1.5rem; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; border-left: 3px solid transparent; }
  .sidebar-link:hover { background: var(--cream-2); color: var(--text-dark); }
  .sidebar-link.active { background: var(--gold-100); color: var(--gold-rich); border-left-color: var(--gold-500); font-weight: 700; }
  .content-area { padding: 3rem 4rem 6rem; max-width: 800px; }
  .prose h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--text-dark); margin-bottom: 1rem; }
  .prose h2 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-dark); margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); }
  .prose h3 { font-size: 1.05rem; font-weight: 700; color: var(--text-dark); margin: 1.5rem 0 0.5rem; }
  .prose p { color: var(--text-muted); line-height: 1.8; margin-bottom: 1rem; font-size: 0.97rem; }
  .prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  .prose li { color: var(--text-muted); line-height: 1.8; margin-bottom: 0.4rem; font-size: 0.97rem; }
  .prose strong { color: var(--text-dark); }
  .code-block { background: #0D0D0D; padding: 1.5rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.82rem; color: #E8E8E8; line-height: 1.8; border: 1px solid rgba(255,193,7,0.2); overflow-x: auto; margin: 1rem 0; position: relative; }
  .code-kw { color: var(--gold-400); }
  .code-str { color: #7EFFA0; }
  .code-cmt { color: #6B6B6B; font-style: italic; }
  .step-badge { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #FFC107, #FFB300); display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800; font-size: 0.8rem; flex-shrink: 0; }
  .callout { background: var(--gold-100); border: 1px solid var(--gold-200); border-left: 4px solid var(--gold-500); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 1rem 1.25rem; margin: 1.5rem 0; }
  .callout p { margin: 0; font-size: 0.9rem; }
  @media (max-width: 768px) { .docs-layout { grid-template-columns: 1fr; } .sidebar { display: none; } .content-area { padding: 2rem 1.5rem; } }
`;

const navItems = [
  { section: 'Getting Started', items: [
    { id: 'quickstart', label: 'Quick Start Guide', icon: Zap },
    { id: 'install', label: 'Installation', icon: Code },
  ]},
  { section: 'Knowledge Base', items: [
    { id: 'upload', label: 'Uploading Documents', icon: Upload },
    { id: 'sources', label: 'Supported Sources', icon: Database },
  ]},
  { section: 'Configuration', items: [
    { id: 'personality', label: 'Agent Personality', icon: Settings },
    { id: 'escalation', label: 'Human Handoff', icon: MessageSquare },
  ]},
  { section: 'API Reference', items: [
    { id: 'api', label: 'REST API Overview', icon: Code },
  ]},
];

const content = {
  quickstart: (
    <div className="prose">
      <h1>Quick Start Guide</h1>
      <p>Get your first BeeBot agent live in under 5 minutes. You'll need a BeeBot account (free plan works) and a website you can edit.</p>
      <div style={{ background: 'var(--gold-100)', border: '1px solid #FFECB3', borderLeft: '4px solid #FFC107', borderRadius: '0 14px 14px 0', padding: '1rem 1.25rem', margin: '1.5rem 0' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)' }}>💡 <strong>No coding required.</strong> If you can copy and paste, you can deploy BeeBot.</p>
      </div>
      <h2>Step 1 — Create Your Account</h2>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FFC107, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>1</div>
        <p style={{ margin: 0 }}>Visit <strong>beebot.ai</strong> and click "Start Free". Sign up with Google or email. No credit card needed.</p>
      </div>
      <h2>Step 2 — Upload Your Knowledge Base</h2>
      <p>Once inside the dashboard, navigate to the <strong>Knowledge</strong> tab. You can upload:</p>
      <ul>
        <li>PDF files (course materials, FAQ documents, policy PDFs)</li>
        <li>Word documents (.docx)</li>
        <li>Plain text files (.txt)</li>
        <li>Website URLs (we'll automatically crawl the page content)</li>
      </ul>
      <p>BeeBot will process and index your content in 30–60 seconds. You'll see a green checkmark when it's ready.</p>
      <h2>Step 3 — Configure Your Agent</h2>
      <p>Go to the <strong>Bot Settings</strong> tab to customize:</p>
      <ul>
        <li><strong>Name:</strong> What the bot introduces itself as (e.g., "Support Bee")</li>
        <li><strong>Tone:</strong> From formal and professional to friendly and casual</li>
        <li><strong>Welcome message:</strong> The first message shown to users</li>
        <li><strong>Escalation email:</strong> Where complex questions get forwarded</li>
      </ul>
      <h2>Step 4 — Copy the Embed Script</h2>
      <p>Navigate to the <strong>Install</strong> tab. Copy the two-line script and paste it before the <code>&lt;/body&gt;</code> tag of your website.</p>
      <div className="code-block">
        <span className="code-cmt">{'// Add before </body> on your website'}</span>{'\n'}
        <span className="code-kw">{'<script'}</span> src=<span className="code-str">{"'https://beebot.ai/widget.js'"}</span>{'>'}<span className="code-kw">{'</script>'}</span>{'\n\n'}
        <span className="code-kw">{'<script>'}</span>{'\n'}
        {'  '}BeeBot.init({'{'}{'\n'}
        {'    '}apiKey: <span className="code-str">"your_api_key_here"</span>,{'\n'}
        {'    '}agentId: <span className="code-str">"your_agent_id_here"</span>{'\n'}
        {'  '}{'}'});{'\n'}
        <span className="code-kw">{'</script>'}</span>
      </div>
      <h2>Step 5 — Go Live!</h2>
      <p>That's it. Refresh your website and you should see the BeeBot chat bubble in the bottom-right corner. Your AI agent is now live and answering questions 24/7.</p>
      <div style={{ background: 'var(--gold-100)', border: '1px solid #FFECB3', borderLeft: '4px solid #FFC107', borderRadius: '0 14px 14px 0', padding: '1rem 1.25rem', margin: '1.5rem 0' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)' }}>🎉 <strong>Tip:</strong> Test your bot by asking it a question that's answered in your uploaded documents. If the answer is wrong, check that the document was processed successfully in the Knowledge tab.</p>
      </div>
    </div>
  ),
  install: (
    <div className="prose">
      <h1>Installation</h1>
      <p>BeeBot's widget works on any platform that allows you to add custom HTML/JavaScript. Here's how to install it on the most popular platforms.</p>
      <h2>Kajabi</h2>
      <ol>
        <li>Go to Settings → Site Details → Custom Code</li>
        <li>Paste the BeeBot script in the "Footer Code" section</li>
        <li>Save and publish your site</li>
      </ol>
      <h2>WordPress</h2>
      <p>Use the "Insert Headers and Footers" plugin (free) to paste the script before <code>{'</body>'}</code>, or add it directly to your theme's <code>footer.php</code>.</p>
      <h2>Webflow</h2>
      <ol>
        <li>Open Site Settings → Custom Code</li>
        <li>Paste the script in "Footer Code" (before <code>{'</body>'}</code>)</li>
        <li>Publish your site</li>
      </ol>
      <h2>Shopify</h2>
      <p>Go to Online Store → Themes → Edit Code → <code>theme.liquid</code>. Paste the script just before the closing <code>{'</body>'}</code> tag.</p>
    </div>
  ),
  upload: (
    <div className="prose">
      <h1>Uploading Documents</h1>
      <p>Your knowledge base is the foundation of your AI agent's accuracy. The more relevant, well-structured content you upload, the better your bot's answers will be.</p>
      <h2>File Size Limits</h2>
      <ul>
        <li>PDF: Up to 50MB per file</li>
        <li>Word (.docx): Up to 25MB per file</li>
        <li>Text (.txt): Up to 5MB per file</li>
        <li>URLs: Up to 500 pages crawled per domain</li>
      </ul>
      <h2>Best Practices</h2>
      <p>For highest accuracy, upload content that:</p>
      <ul>
        <li>Directly answers the questions your users ask</li>
        <li>Is written in plain language (not legal boilerplate)</li>
        <li>Is up-to-date and accurate</li>
      </ul>
    </div>
  ),
  sources: (
    <div className="prose">
      <h1>Supported Sources</h1>
      <p>BeeBot can ingest content from multiple source types. Here's a complete reference.</p>
      <h2>Document Formats</h2>
      <ul>
        <li><strong>PDF (.pdf)</strong> — Most common. Works with text-based PDFs. Image-only PDFs require OCR (coming soon).</li>
        <li><strong>Word Documents (.docx)</strong> — Full text extraction including tables and lists.</li>
        <li><strong>Plain Text (.txt)</strong> — Simple, fast, and highly reliable.</li>
        <li><strong>Markdown (.md)</strong> — Documentation files work great.</li>
      </ul>
      <h2>Web Sources</h2>
      <p>Paste any public URL and BeeBot will crawl the page content. Works with FAQ pages, help center articles, and documentation sites.</p>
    </div>
  ),
  personality: (
    <div className="prose">
      <h1>Agent Personality</h1>
      <p>Customize how your BeeBot agent communicates with your users. A well-configured personality increases satisfaction and reduces escalations.</p>
      <h2>Tone Settings</h2>
      <p>Choose from a spectrum: <strong>Formal & Professional</strong> → <strong>Friendly & Warm</strong> → <strong>Casual & Fun</strong>. This affects vocabulary, sentence structure, and emoji usage.</p>
      <h2>Custom Instructions</h2>
      <p>Add specific instructions that override the default behavior. For example: "Always mention the 30-day money-back guarantee when discussing pricing" or "Never provide legal advice — always refer to our terms of service."</p>
    </div>
  ),
  escalation: (
    <div className="prose">
      <h1>Human Handoff</h1>
      <p>BeeBot automatically detects when a conversation is beyond its knowledge base or emotionally complex, then smoothly escalates to your team.</p>
      <h2>Escalation Triggers</h2>
      <ul>
        <li>Question not covered in the knowledge base</li>
        <li>User expresses frustration or urgency</li>
        <li>Refund or billing dispute detected</li>
        <li>User explicitly requests to speak to a human</li>
      </ul>
      <h2>What Happens</h2>
      <p>When triggered, BeeBot collects the user's email and sends the full conversation transcript to your configured escalation email within seconds.</p>
    </div>
  ),
  api: (
    <div className="prose">
      <h1>REST API Overview</h1>
      <p>The BeeBot API lets you interact with your agents programmatically. Available on Pro plans and above.</p>
      <h2>Base URL</h2>
      <div className="code-block">https://api.beebot.ai/v1</div>
      <h2>Authentication</h2>
      <p>All API requests require a Bearer token in the Authorization header:</p>
      <div className="code-block">
        Authorization: Bearer {'<'}your_api_key{'>'}
      </div>
      <h2>Send a Message</h2>
      <div className="code-block">
        <span className="code-cmt">POST /agents/{'{'}agentId{'}'}/chat</span>{'\n\n'}
        {'{'}{'\n'}
        {'  '}<span className="code-str">"message"</span>: <span className="code-str">"What is the refund policy?"</span>,{'\n'}
        {'  '}<span className="code-str">"sessionId"</span>: <span className="code-str">"user-session-123"</span>{'\n'}
        {'}'}
      </div>
    </div>
  ),
};

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState('quickstart');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Docs header */}
      <div style={{ background: 'var(--black)', padding: '3rem 2rem', borderBottom: '1px solid rgba(255,193,7,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)' }}>
            <BookOpen size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Documentation</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>BeeBot Docs</h1>
        </div>
      </div>

      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {navItems.map(group => (
            <div key={group.section}>
              <p className="sidebar-section-title">{group.section}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-link ${activeDoc === item.id ? 'active' : ''}`}
                  onClick={() => setActiveDoc(item.id)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  <item.icon size={15} />
                  {item.label}
                  {activeDoc === item.id && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="content-area">
          {content[activeDoc] || <p>Section coming soon.</p>}

          {/* Next/Prev navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold-rich)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Need help? Contact us →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
