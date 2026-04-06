import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features',     href: '/#features'     },
    { label: 'Pricing',      href: '/#pricing'      },
    { label: 'Blog',         href: '/blog'           },
];

const SNAV_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap');

    .snav {
        position: sticky; top: 0; left: 0; right: 0; z-index: 100;
        padding: 0 2rem;
        background: rgba(253, 250, 242, 0.10);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-bottom: 1px solid rgba(184,134,11,0.08);
        transition: background 0.38s ease, box-shadow 0.38s ease, border-color 0.38s ease;
        font-family: 'DM Sans', system-ui, sans-serif;
    }
    .snav.snav-scrolled {
        background: rgba(253,250,242,0.92);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border-bottom: 1px solid rgba(184,134,11,0.18);
        box-shadow: 0 2px 20px rgba(0,0,0,0.06);
    }
    .snav-inner {
        max-width: 1200px; margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        height: 72px;
    }
    .snav-logo {
        display: flex; align-items: center; gap: 10px;
        cursor: pointer; text-decoration: none; flex-shrink: 0;
    }
    .snav-logo-mark {
        width: 40px; height: 40px;
        background: linear-gradient(135deg, #FFC107 0%, #E65100 100%);
        border-radius: 11px; display: flex; align-items: center; justify-content: center;
        transform: rotate(-5deg);
        box-shadow: 0 4px 12px rgba(255,193,7,0.4);
        flex-shrink: 0; overflow: hidden;
    }
    .snav-logo-mark img { width: 100%; height: 100%; object-fit: cover; border-radius: 11px; }
    .snav-logo-text {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 800; font-size: 1.4rem;
        letter-spacing: -0.02em; color: #1A1200;
    }
    .snav-links {
        display: flex; align-items: center; gap: 2rem;
        list-style: none; margin: 0; padding: 0;
    }
    .snav-link {
        color: #5C5032; text-decoration: none;
        font-weight: 600; font-size: 0.95rem;
        transition: color 0.2s; position: relative;
    }
    .snav-link::after {
        content: ''; position: absolute; left: 0; bottom: -4px;
        width: 0; height: 2px; background: #FFC107;
        transition: width 0.25s ease;
    }
    .snav-link:hover { color: #1A1200; }
    .snav-link:hover::after { width: 100%; }
    .snav-actions { display: flex; gap: 10px; align-items: center; }
    .snav-btn-outline {
        padding: 9px 22px; border-radius: 999px;
        background: transparent;
        border: 2px solid rgba(184,134,11,0.4);
        color: #5C5032; font-weight: 600; font-size: 0.88rem;
        cursor: pointer; font-family: 'DM Sans', inherit;
        transition: border-color 0.2s, color 0.2s;
    }
    .snav-btn-outline:hover { border-color: #FFC107; color: #1A1200; }
    .snav-btn-gold {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 9px 22px; border-radius: 999px;
        background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
        color: #1A1200; font-weight: 700; font-size: 0.9rem;
        border: none; cursor: pointer; font-family: 'DM Sans', inherit;
        box-shadow: 0 4px 14px rgba(255,193,7,0.35);
        transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .snav-btn-gold:hover {
        opacity: 0.92; transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(255,193,7,0.45);
    }
    .snav-hamburger {
        display: none; width: 44px; height: 44px;
        background: none; border: none; cursor: pointer;
        align-items: center; justify-content: center;
        color: #B8860B; border-radius: 8px;
        transition: background 0.2s; flex-shrink: 0;
    }
    .snav-hamburger:hover { background: #FFF8E1; }

    /* Mobile menu */
    .snav-mobile-menu {
        position: fixed; top: 72px; left: 0; right: 0; z-index: 99;
        background: rgba(253,250,242,0.99); backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 2px solid rgba(184,134,11,0.4);
        padding: 1.5rem 1.5rem 2rem;
        display: flex; flex-direction: column;
        transform: translateY(-110%); opacity: 0;
        transition: transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease;
        box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        pointer-events: none;
    }
    .snav-mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: all; }
    .snav-mobile-link {
        display: flex; align-items: center;
        padding: 14px 4px; font-size: 1.05rem; font-weight: 600;
        color: #1A1200; text-decoration: none;
        border-bottom: 1px solid rgba(184,134,11,0.15); min-height: 52px;
        transition: color 0.2s;
    }
    .snav-mobile-link:hover { color: #B8860B; }
    .snav-mobile-link:last-of-type { border-bottom: none; }
    .snav-mobile-cta { display: flex; flex-direction: column; gap: 10px; margin-top: 1.25rem; }
    .snav-mobile-cta .snav-btn-gold,
    .snav-mobile-cta .snav-btn-outline {
        width: 100%; border-radius: 14px !important;
        font-size: 1rem; justify-content: center;
        padding: 13px 22px;
    }

    @media (max-width: 768px) {
        .snav-hamburger { display: flex; }
        .snav-desktop-links { display: none !important; }
        .snav-desktop-btns { display: none !important; }
        .snav-inner { height: 64px; }
        .snav { padding: 0 1.25rem; }
        .snav-mobile-menu { top: 64px; }
    }
    @media (max-width: 480px) {
        .snav { padding: 0 1rem; }
    }
`;

export default function SharedNav() {
    const [scrolled, setScrolled]         = useState(false);
    const [mobileMenuOpen, setMobileMenu] = useState(false);
    const navigate                         = useNavigate();
    const { isAuthenticated }              = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu when user scrolls
    useEffect(() => {
        if (scrolled && mobileMenuOpen) setMobileMenu(false);
    }, [scrolled, mobileMenuOpen]);

    const close = () => setMobileMenu(false);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: SNAV_CSS }} />

            {/* Mobile menu overlay */}
            <div className={`snav-mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
                {NAV_LINKS.map(({ label, href }) => (
                    <a key={label} href={href} className="snav-mobile-link" onClick={close}>{label}</a>
                ))}
                <div className="snav-mobile-cta">
                    {isAuthenticated ? (
                        <button className="snav-btn-gold" onClick={() => { close(); navigate('/dashboard'); }}>
                            Dashboard <ArrowRight size={16} />
                        </button>
                    ) : (
                        <>
                            <button className="snav-btn-outline" onClick={() => { close(); navigate('/auth'); }}>
                                Sign In
                            </button>
                            <button className="snav-btn-gold" onClick={() => { close(); navigate('/auth'); }}>
                                Start Free <ArrowRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main nav */}
            <nav className={`snav ${scrolled ? 'snav-scrolled' : ''}`}>
                <div className="snav-inner">
                    {/* Logo */}
                    <div className="snav-logo" onClick={() => navigate('/')}>
                        <div className="snav-logo-mark">
                            <img src="/bee-yellow.jpg" alt="BeeBot Logo" />
                        </div>
                        <span className="snav-logo-text">BeeBot.</span>
                    </div>

                    {/* Desktop links */}
                    <ul className="snav-links snav-desktop-links">
                        {NAV_LINKS.map(({ label, href }) => (
                            <li key={label}>
                                <a href={href} className="snav-link">{label}</a>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop CTA */}
                    <div className="snav-actions snav-desktop-btns">
                        {isAuthenticated ? (
                            <button className="snav-btn-gold" onClick={() => navigate('/dashboard')}>
                                Dashboard <ArrowRight size={14} />
                            </button>
                        ) : (
                            <>
                                <button className="snav-btn-outline" onClick={() => navigate('/auth')}>Sign In</button>
                                <button className="snav-btn-gold" onClick={() => navigate('/auth')}>
                                    Start Free <ArrowRight size={14} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className="snav-hamburger"
                        onClick={() => setMobileMenu(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>
        </>
    );
}
