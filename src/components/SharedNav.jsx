import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function SharedNav() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => navigate(isAuthenticated ? '/dashboard' : '/auth');

  const navStyle = {
    position: 'sticky', top: 0, zIndex: 100,
    background: scrolled ? 'rgba(253,250,242,0.97)' : '#FDFAF2',
    backdropFilter: 'blur(16px) saturate(180%)',
    borderBottom: scrolled ? '1px solid rgba(184,134,11,0.2)' : '1px solid transparent',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
    padding: '0 2rem',
    transition: 'all 0.4s ease',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const innerStyle = {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    height: 72,
  };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #FFC107 0%, #E65100 100%)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', transform: 'rotate(-5deg)',
            boxShadow: '0 4px 12px rgba(255,193,7,0.4)', flexShrink: 0,
          }}>
            <Bot size={20} />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: '#1A1200',
          }}>BeeBot.</span>
        </Link>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFC107, #FFB300)',
              color: '#000', fontWeight: 700, fontSize: '0.9rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,193,7,0.35)',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              <LayoutDashboard size={15} /> Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} style={{
                padding: '10px 20px', borderRadius: 999,
                background: 'transparent', border: '2px solid rgba(184,134,11,0.4)',
                color: '#5C5032', fontWeight: 600, fontSize: '0.88rem',
                cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: 'all 0.25s',
              }}>
                Sign In
              </button>
              <button onClick={handleCTA} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 999,
                background: 'linear-gradient(135deg, #FFC107, #FFB300)',
                color: '#000', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255,193,7,0.35)',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                Start Free <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
