import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { label: 'Pricing',   to: '/#pricing'  },
    { label: 'Docs',      to: '/docs'      },
    { label: 'Blog',      to: '/blog'      },
    { label: 'Contact',   to: '/contact'   },
];

export default function SharedNav() {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <style>{`
                .snav {
                    position: sticky; top: 0; z-index: 100;
                    padding: 0 2rem;
                    transition: background 0.35s, box-shadow 0.35s, border-color 0.35s;
                    font-family: 'DM Sans', system-ui, sans-serif;
                }
                .snav.scrolled {
                    background: rgba(253,250,242,0.97);
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    border-bottom: 1px solid rgba(184,134,11,0.2);
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                }
                .snav.flat { background: #FDFAF2; border-bottom: 1px solid transparent; }
                .snav-inner {
                    max-width: 1200px; margin: 0 auto;
                    display: flex; align-items: center; justify-content: space-between;
                    height: 68px;
                }
                .snav-logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; }
                .snav-logo img { height: 36px; width: auto; object-fit: contain; display: block; }
                .snav-links {
                    display: flex; align-items: center; gap: 2rem;
                    list-style: none; margin: 0; padding: 0;
                }
                .snav-links a {
                    color: #5C5032; font-size: 0.9rem; font-weight: 500;
                    text-decoration: none; transition: color 0.2s;
                }
                .snav-links a:hover { color: #1A1200; }
                .snav-actions { display: flex; gap: 10px; align-items: center; }
                .snav-btn-ghost {
                    padding: 9px 20px; border-radius: 999px;
                    background: transparent; border: 1.5px solid rgba(184,134,11,0.4);
                    color: #5C5032; font-weight: 600; font-size: 0.88rem;
                    cursor: pointer; font-family: inherit; transition: border-color 0.2s, color 0.2s;
                }
                .snav-btn-ghost:hover { border-color: rgba(184,134,11,0.8); color: #1A1200; }
                .snav-btn-cta {
                    padding: 9px 22px; border-radius: 999px;
                    background: linear-gradient(135deg, #FFC107, #FFB300);
                    color: #1A1200; font-weight: 700; font-size: 0.9rem;
                    border: none; cursor: pointer; font-family: inherit;
                    box-shadow: 0 4px 14px rgba(255,193,7,0.35);
                    transition: opacity 0.2s, box-shadow 0.2s;
                }
                .snav-btn-cta:hover { opacity: 0.92; box-shadow: 0 6px 20px rgba(255,193,7,0.45); }
                @media (max-width: 640px) {
                    .snav-links { display: none; }
                    .snav { padding: 0 1.25rem; }
                }
            `}</style>
            <nav className={`snav ${scrolled ? 'scrolled' : 'flat'}`}>
                <div className="snav-inner">
                    <Link to="/" className="snav-logo">
                        <img src="/bee-yellow.jpg" alt="BeeBot" />
                    </Link>

                    <ul className="snav-links">
                        {NAV_LINKS.map(({ label, to }) => (
                            <li key={label}><Link to={to}>{label}</Link></li>
                        ))}
                    </ul>

                    <div className="snav-actions">
                        {isAuthenticated ? (
                            <button className="snav-btn-cta" onClick={() => navigate('/dashboard')}>
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button className="snav-btn-ghost" onClick={() => navigate('/auth')}>
                                    Sign In
                                </button>
                                <button className="snav-btn-cta" onClick={() => navigate('/auth')}>
                                    Start Free
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
