import React from 'react';
import { Link } from 'react-router-dom';
import SharedNav from '../components/SharedNav';
import { ArrowRight, Clock, User, Tag, BookOpen } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --gold-100: #FFF8E1; --gold-200: #FFECB3; --gold-300: #FFD54F;
    --gold-400: #FFCA28; --gold-500: #FFC107; --gold-600: #FFB300;
    --gold-rich: #C9950A; --cream: #FDFAF2; --cream-2: #F5F0E0;
    --black: #0A0A0A; --black-card: #1A1A1A; --black-mid: #2A2A2A;
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
  .blog-card {
    background: white; border-radius: var(--radius-xl); border: 1px solid var(--border);
    overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex; flex-direction: column;
  }
  .blog-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .blog-card:hover .blog-arrow { transform: translateX(4px); }
  .blog-arrow { transition: transform 0.25s ease; }
  .category-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 999px; font-size: 0.75rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  }
`;

const posts = [
  {
    slug: '#',
    category: 'Strategy',
    categoryColor: '#FFF8E1',
    categoryText: '#C9950A',
    readTime: '8 min read',
    date: 'March 28, 2026',
    title: 'How AI Customer Support Can Save You 20+ Hours Every Week',
    excerpt: 'The average business owner spends 3–4 hours daily answering the same repetitive support questions. Here\'s how BeeBot-powered automation changed that for 3,000+ businesses — and what you can expect in your first week.',
    author: 'Sarah Chen',
    authorRole: 'Head of Customer Success',
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    featured: true,
  },
  {
    slug: '#',
    category: 'Technical',
    categoryColor: 'rgba(255,193,7,0.15)',
    categoryText: '#FFB300',
    readTime: '11 min read',
    date: 'March 19, 2026',
    title: 'Why RAG Is the Future of AI Customer Support — And How We Use It',
    excerpt: 'Standard LLMs hallucinate. RAG (Retrieval-Augmented Generation) doesn\'t. We break down the architecture that powers BeeBot\'s 98% accuracy rate and why it matters for your customers\' experience.',
    author: 'Marcus Okafor',
    authorRole: 'AI Research Lead',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
    dark: true,
  },
  {
    slug: '#',
    category: 'Growth',
    categoryColor: '#FFF8E1',
    categoryText: '#C9950A',
    readTime: '6 min read',
    date: 'March 5, 2026',
    title: '5 Costly Mistakes Businesses Make with Customer Support',
    excerpt: 'From ignoring after-hours inquiries to using one-size-fits-all chatbots, these five support mistakes are silently killing your customer retention rates and repeat purchases. Are you making them?',
    author: 'Emma Rodriguez',
    authorRole: 'Content Strategist',
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #F5F0E0 100%)',
  },
  {
    slug: '#',
    category: 'Behind the Scenes',
    categoryColor: 'rgba(255,193,7,0.12)',
    categoryText: '#FFB300',
    readTime: '14 min read',
    date: 'February 20, 2026',
    title: 'How We Built a 98% Accurate AI Support Bot in 4 Months',
    excerpt: 'The engineering story behind BeeBot: how we iterated from a basic chatbot that hallucinated constantly to a production system that handles 3.2M+ queries with near-perfect accuracy. Our failures, pivots, and breakthroughs.',
    author: 'Dev Team',
    authorRole: 'BeeBot Engineering',
    gradient: 'linear-gradient(135deg, #FDFAF2 0%, #F5F0E0 100%)',
  },
];

export default function BlogPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SharedNav />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '6rem 2rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.12) 0%, transparent 70%)' }} />
        {/* Subtle hex bg */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
          <defs><pattern id="bh" width="56" height="52" patternUnits="userSpaceOnUse"><polygon points="28,2 54,15 54,41 28,54 2,41 2,15" fill="rgba(255,193,7,0.08)" stroke="#FFC107" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#bh)" />
        </svg>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', marginBottom: '1.25rem' }}>
            <BookOpen size={13} color="#FFC107" />
            <span style={{ color: '#FFC107', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BeeBot Blog</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.05 }}>
            Insights for <span style={{ color: '#FFC107' }}>modern businesses.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto' }}>
            Strategies, deep dives, and behind-the-scenes stories about AI-powered customer support.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 6rem' }}>

        {/* Featured post */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '1.25rem' }}>Featured</p>
          <div className="blog-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 360 }}>
            {/* Left image area */}
            <div style={{ background: posts[0].gradient, padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐝</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold-rich)', opacity: 0.3 }}>20hrs</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)', fontWeight: 600 }}>saved per week</div>
              </div>
            </div>
            {/* Right content */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', alignItems: 'center' }}>
                  <span className="category-badge" style={{ background: posts[0].categoryColor, color: posts[0].categoryText }}>
                    <Tag size={10} /> {posts[0].category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {posts[0].readTime}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: 1.25 }}>{posts[0].title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{posts[0].excerpt}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD54F, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="#000" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{posts[0].author}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{posts[0].date}</p>
                  </div>
                </div>
                <a href={posts[0].slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #FFC107, #FFB300)', color: '#000', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                  Read more <ArrowRight size={14} className="blog-arrow" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of posts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {posts.slice(1).map((post, i) => (
            <article key={i} className="blog-card">
              {/* Card header */}
              <div style={{ background: post.gradient, padding: '2rem', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
                {post.dark && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
                    <defs><pattern id={`ph${i}`} width="40" height="36" patternUnits="userSpaceOnUse"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#FFC107" strokeWidth="1"/></pattern></defs>
                    <rect width="100%" height="100%" fill={`url(#ph${i})`} />
                  </svg>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <span className="category-badge" style={{ background: post.categoryColor, color: post.categoryText }}><Tag size={10} /> {post.category}</span>
                  <span style={{ fontSize: '0.78rem', color: post.dark ? 'rgba(255,255,255,0.4)' : 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {post.readTime}</span>
                </div>
              </div>
              {/* Card body */}
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.75rem', lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-dark)' }}>{post.author}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{post.date}</p>
                  </div>
                  <a href={post.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 999, border: '2px solid var(--border-strong)', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                    Read <ArrowRight size={13} className="blog-arrow" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div style={{ marginTop: '5rem', background: 'var(--black)', borderRadius: 24, padding: '3.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at center, rgba(255,193,7,0.1) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Get the latest in your inbox.</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '1rem' }}>No spam. One email per week when we publish something new.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '12px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)' }} />
              <button style={{ padding: '12px 24px', borderRadius: 999, background: 'linear-gradient(135deg, #FFC107, #FFB300)', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ background: 'var(--black)', padding: '2.5rem 2rem', borderTop: '1px solid rgba(255,193,7,0.12)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} BeeBot AI Inc.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }, { label: 'Contact', to: '/contact' }].map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
