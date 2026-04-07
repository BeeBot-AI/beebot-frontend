import { useState, useEffect } from 'react';
import { Mail, Briefcase } from "lucide-react";
import { Unlock, Wrench, CheckCircle } from "lucide-react";
import {
  Ban,
  Wallet,
  Key,
  BarChart3,
  Handshake,
  FlaskConical
} from "lucide-react";

export default function BillingTab() {
    const [visible, setVisible] = useState(false);
    const [hoverMail, setHoverMail] = useState(false);
    const [hoverLinkedIn, setHoverLinkedIn] = useState(false);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 100);
        const t2 = setInterval(() => {
            setPulse(p => !p);
        }, 2000);
        return () => { clearTimeout(t1); clearInterval(t2); };
    }, []);

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

                /* ── Keyframes ── */
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -600px 0; }
                    100% { background-position: 600px 0; }
                }
                @keyframes glowPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,193,7,0); }
                    50%       { box-shadow: 0 0 0 10px rgba(255,193,7,0.12); }
                }
                @keyframes badgePop {
                    0%   { transform: scale(0.85); opacity: 0; }
                    70%  { transform: scale(1.06); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes orbitDot {
                    0%   { transform: rotate(0deg)   translateX(30px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
                }
                @keyframes scanLine {
                    0%   { top: 0%; opacity: 0.6; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-6px); }
                }

                /* ── Cards ── */
                .bt-wrapper {
                    opacity: 0;
                    animation: fadeSlideUp 0.6s ease forwards;
                }
                .bt-wrapper.visible { opacity: 1; }

                .bt-hero {
                    position: relative;
                    background: linear-gradient(145deg, #1A1200 0%, #2E1F00 40%, #1A1200 100%);
                    border-radius: 24px;
                    padding: 44px 40px;
                    margin-bottom: 1.75rem;
                    overflow: hidden;
                    animation: fadeSlideUp 0.5s ease 0.05s both, glowPulse 3s ease-in-out infinite;
                    border: 1px solid rgba(255,193,7,0.2);
                }
                .bt-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 20% 50%, rgba(255,193,7,0.15) 0%, transparent 60%),
                                radial-gradient(ellipse at 80% 20%, rgba(255,179,0,0.08) 0%, transparent 50%);
                    pointer-events: none;
                }
                .bt-hero::after {
                    content: '';
                    position: absolute;
                    left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,193,7,0.6), transparent);
                    animation: scanLine 4s linear infinite;
                    pointer-events: none;
                }

                /* Decorative orbiting dot */
                .bt-orbit-wrap {
                    position: absolute; right: 44px; top: 50%;
                    transform: translateY(-50%);
                    width: 72px; height: 72px;
                    display: flex; align-items: center; justify-content: center;
                }
                .bt-orbit-center {
                    width: 18px; height: 18px;
                    border-radius: 50%;
                    background: rgba(255,193,7,0.15);
                    border: 1.5px solid rgba(255,193,7,0.4);
                    display: flex; align-items: center; justify-content: center;
                }
                .bt-orbit-dot {
                    position: absolute;
                    width: 8px; height: 8px;
                    background: #FFC107;
                    border-radius: 50%;
                    animation: orbitDot 3s linear infinite;
                    box-shadow: 0 0 8px rgba(255,193,7,0.8);
                }

                .bt-status-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(255,193,7,0.12);
                    border: 1px solid rgba(255,193,7,0.3);
                    border-radius: 999px;
                    padding: 5px 14px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #FFD54F;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 18px;
                    animation: badgePop 0.5s ease 0.3s both;
                }
                .bt-status-dot {
                    width: 7px; height: 7px;
                    background: #FFD54F;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(255,213,79,0.9);
                    flex-shrink: 0;
                }

                .bt-hero-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: clamp(1.55rem, 3vw, 2.2rem);
                    font-weight: 800;
                    color: #FFFBEB;
                    line-height: 1.2;
                    margin-bottom: 14px;
                    max-width: 72%;
                }
                .bt-hero-title em {
                    font-style: italic;
                    color: #FFC107;
                }
                .bt-hero-subtitle {
                    font-size: 0.92rem;
                    color: rgba(253,246,227,0.7);
                    line-height: 1.7;
                    max-width: 66%;
                    margin-bottom: 0;
                }

                /* ── Info strip ── */
                .bt-info-strip {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.75rem;
                    animation: fadeSlideUp 0.5s ease 0.15s both;
                }
                .bt-info-item {
                    background: linear-gradient(135deg, #FFFBEB, #FDF6E3);
                    border: 1.5px solid rgba(184,134,11,0.18);
                    border-radius: 18px;
                    padding: 22px 20px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .bt-info-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 32px rgba(184,134,11,0.14);
                }
                .bt-info-item::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: 18px 18px 0 0;
                }
                .bt-info-item.green::before  { background: linear-gradient(90deg, #10B981, #34D399); }
                .bt-info-item.gold::before   { background: linear-gradient(90deg, #FFC107, #FFD54F); }
                .bt-info-item.blue::before   { background: linear-gradient(90deg, #60A5FA, #93C5FD); }

                .bt-info-icon {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                    animation: float 3s ease-in-out infinite;
                }
                .bt-info-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #8C7A4A;
                    margin-bottom: 5px;
                }
                .bt-info-value {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #1A1200;
                    line-height: 1.2;
                }
                .bt-info-desc {
                    font-size: 0.78rem;
                    color: #5C5032;
                    margin-top: 5px;
                    line-height: 1.5;
                }

                /* ── Main message card ── */
                .bt-msg-card {
                    background: linear-gradient(145deg, #FFFBEB 0%, #FDF6E3 50%, #FFFBEB 100%);
                    border: 1.5px solid rgba(184,134,11,0.2);
                    border-radius: 22px;
                    padding: 36px 36px 30px;
                    margin-bottom: 1.75rem;
                    position: relative;
                    overflow: hidden;
                    animation: fadeSlideUp 0.5s ease 0.25s both;
                    box-shadow: 0 8px 40px rgba(184,134,11,0.09),
                                inset 0 1px 0 rgba(255,255,255,0.8);
                }
                .bt-msg-card::before {
                    content: '"';
                    position: absolute;
                    top: -10px; left: 24px;
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 8rem;
                    color: rgba(255,193,7,0.07);
                    line-height: 1;
                    pointer-events: none;
                    user-select: none;
                }

                .bt-section-eyebrow {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #C9950A;
                    margin-bottom: 10px;
                }
                .bt-section-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1A1200;
                    margin-bottom: 16px;
                    line-height: 1.3;
                }
                .bt-section-body {
                    font-size: 0.92rem;
                    color: #5C5032;
                    line-height: 1.8;
                    margin-bottom: 0;
                }
                .bt-section-body + .bt-section-body {
                    margin-top: 12px;
                }

                .bt-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(184,134,11,0.2), transparent);
                    margin: 24px 0;
                }

                /* Guarantee chips */
                .bt-chips {
                    display: flex; flex-wrap: wrap; gap: 10px;
                    margin-top: 22px;
                }
                .bt-chip {
                    display: inline-flex; align-items: center; gap: 7px;
                    background: #fff;
                    border: 1.5px solid rgba(184,134,11,0.18);
                    border-radius: 999px;
                    padding: 7px 15px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #3D2E00;
                    box-shadow: 0 2px 8px rgba(184,134,11,0.06);
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .bt-chip:hover {
                    border-color: rgba(184,134,11,0.4);
                    box-shadow: 0 4px 14px rgba(184,134,11,0.1);
                }
                .bt-chip-icon { font-size: 0.95rem; }

                /* ── Feedback CTA card ── */
                .bt-cta-card {
                    background: linear-gradient(145deg, #1A1200 0%, #2C1C00 100%);
                    border-radius: 22px;
                    padding: 36px 36px 32px;
                    position: relative;
                    overflow: hidden;
                    animation: fadeSlideUp 0.5s ease 0.35s both;
                    border: 1px solid rgba(255,193,7,0.15);
                    box-shadow: 0 20px 60px rgba(26,18,0,0.3);
                }
                .bt-cta-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 10% 80%, rgba(255,193,7,0.1) 0%, transparent 55%),
                                radial-gradient(ellipse at 90% 20%, rgba(255,179,0,0.06) 0%, transparent 45%);
                    pointer-events: none;
                }
                .bt-cta-eyebrow {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #FFD54F;
                    margin-bottom: 10px;
                }
                .bt-cta-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #FFFBEB;
                    margin-bottom: 12px;
                    line-height: 1.3;
                }
                .bt-cta-title em {
                    color: #FFC107;
                    font-style: italic;
                }
                .bt-cta-body {
                    font-size: 0.9rem;
                    color: rgba(253,246,227,0.65);
                    line-height: 1.75;
                    margin-bottom: 28px;
                    max-width: 580px;
                }

                /* Buttons */
                .bt-btn-row {
                    display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
                }
                .bt-btn-primary {
                    display: inline-flex; align-items: center; gap: 9px;
                    background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
                    color: #1A1200;
                    padding: 13px 26px;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    text-decoration: none;
                    box-shadow: 0 6px 24px rgba(255,193,7,0.45);
                    transition: all 0.25s ease;
                    border: none; cursor: pointer;
                    letter-spacing: 0.01em;
                    position: relative;
                    overflow: hidden;
                }
                .bt-btn-primary::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s ease;
                }
                .bt-btn-primary:hover::before { left: 150%; }
                .bt-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 32px rgba(255,193,7,0.55);
                }
                .bt-btn-secondary {
                    display: inline-flex; align-items: center; gap: 9px;
                    background: transparent;
                    color: rgba(253,246,227,0.8);
                    padding: 12px 24px;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    text-decoration: none;
                    border: 1.5px solid rgba(255,193,7,0.25);
                    transition: all 0.25s ease;
                    cursor: pointer;
                }
                .bt-btn-secondary:hover {
                    border-color: rgba(255,193,7,0.55);
                    color: #FFD54F;
                    background: rgba(255,193,7,0.06);
                    transform: translateY(-1px);
                }

                /* ── Timeline/roadmap ── */
                .bt-timeline {
                    margin-top: 28px;
                    padding-top: 24px;
                    border-top: 1px solid rgba(255,193,7,0.1);
                }
                .bt-timeline-title {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: rgba(255,213,79,0.5);
                    margin-bottom: 16px;
                }
                .bt-timeline-items {
                    display: flex; gap: 0; align-items: flex-start;
                }
                .bt-tl-step {
                    flex: 1;
                    display: flex; flex-direction: column; align-items: center;
                    text-align: center;
                    position: relative;
                }
                .bt-tl-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 13px; left: 50%;
                    width: 100%;
                    height: 1.5px;
                    background: linear-gradient(90deg, rgba(255,193,7,0.4), rgba(255,193,7,0.1));
                }
                .bt-tl-dot {
                    width: 26px; height: 26px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.65rem;
                    font-weight: 800;
                    z-index: 1;
                    margin-bottom: 10px;
                    flex-shrink: 0;
                }
                .bt-tl-dot.active {
                    background: #FFC107;
                    color: #1A1200;
                    box-shadow: 0 0 0 4px rgba(255,193,7,0.15);
                }
                .bt-tl-dot.future {
                    background: rgba(255,193,7,0.1);
                    border: 1.5px solid rgba(255,193,7,0.25);
                    color: rgba(255,213,79,0.4);
                }
                .bt-tl-label {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: rgba(253,246,227,0.5);
                    line-height: 1.3;
                    padding: 0 6px;
                }
                .bt-tl-label.active { color: #FFD54F; }

                /* Usage placeholder card */
                .bt-usage-card {
                    background: linear-gradient(135deg, #FFFBEB, #FDF6E3);
                    border: 1.5px solid rgba(184,134,11,0.18);
                    border-radius: 22px;
                    padding: 30px 36px;
                    margin-top: 1.75rem;
                    animation: fadeSlideUp 0.5s ease 0.45s both;
                }
                .bt-usage-row {
                    display: flex; justify-content: space-between; align-items: center;
                    flex-wrap: wrap; gap: 1rem;
                }
                .bt-usage-left h4 {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #1A1200;
                    margin-bottom: 6px;
                }
                .bt-usage-left p {
                    font-size: 0.87rem;
                    color: #5C5032;
                    line-height: 1.6;
                }
                .bt-status-pill {
                    display: inline-flex; align-items: center; gap: 7px;
                    background: linear-gradient(135deg, #FFF8E1, #FFF3C4);
                    border: 1.5px solid #FFD54F;
                    border-radius: 999px;
                    padding: 8px 18px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #92400E;
                    flex-shrink: 0;
                }
                .bt-status-pulse {
                    width: 8px; height: 8px;
                    background: #F59E0B;
                    border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(245,158,11,0.6);
                    animation: glowPulse 2s ease-in-out infinite;
                }

                /* Responsive */
                @media (max-width: 620px) {
                    .bt-hero { padding: 32px 24px; }
                    .bt-hero-title { max-width: 100%; font-size: 1.4rem; }
                    .bt-hero-subtitle { max-width: 100%; }
                    .bt-orbit-wrap { display: none; }
                    .bt-info-strip { grid-template-columns: 1fr; }
                    .bt-msg-card, .bt-cta-card { padding: 26px 22px; }
                    .bt-usage-card { padding: 24px 22px; }
                    .bt-timeline-items { flex-direction: column; gap: 12px; }
                    .bt-tl-step::after { display: none; }
                    .bt-tl-step { flex-direction: row; align-items: center; text-align: left; gap: 12px; }
                    .bt-tl-dot { margin-bottom: 0; }
                }
            `}</style>

            {/* ── HERO BANNER ── */}
            <div className={`bt-wrapper ${visible ? 'visible' : ''}`}>
                <div className="bt-hero">
                    <div className="bt-status-badge">
                        <span className="bt-status-dot" />
                        Early Access · No Billing Active
                    </div>

                    <h1 className="bt-hero-title">
                        You're Building Something <em>Great.</em><br/>
                        Use It Freely — On Us.
                    </h1>
                    <p className="bt-hero-subtitle">
                        The billing system is currently in development. Every feature is fully unlocked,
                        and nothing is being charged. Your real-world usage is what shapes the future of this product.
                    </p>

                    {/* Orbiting decoration */}
                    <div className="bt-orbit-wrap">
                        <div className="bt-orbit-center" />
                        <div className="bt-orbit-dot" />
                    </div>
                </div>

                {/* ── THREE-COLUMN INFO STRIP ── */}
                <div className="bt-info-strip">
                    <div className="bt-info-item green">
                        <div className="bt-info-icon"><Unlock size={18} /></div>
                        <div className="bt-info-label">Payments</div>
                        <div className="bt-info-value">Zero Charges</div>
                        <div className="bt-info-desc">No card is required. No payment is processed. Fully free access.</div>
                    </div>
                    <div className="bt-info-item gold">
                        <div className="bt-info-icon"><Wrench size={18} /></div>
                        <div className="bt-info-label">Access</div>
                        <div className="bt-info-value">All Features</div>
                        <div className="bt-info-desc">Every capability is unlocked and available during this phase.</div>
                    </div>
                    <div className="bt-info-item blue">
                        <div className="bt-info-icon"><CheckCircle size={18} /></div>
                        <div className="bt-info-label">Phase</div>
                        <div className="bt-info-value">Development</div>
                        <div className="bt-info-desc">Real usage data is being collected to build a fair pricing model.</div>
                    </div>
                </div>

                {/* ── FEEDBACK CTA CARD ── */}
                <div className="bt-cta-card">
                    <div className="bt-cta-eyebrow">Your Voice Matters</div>
                    <h2 className="bt-cta-title">
                        Share Your Experience.<br/>
                        <em>Help Build What Comes Next.</em>
                    </h2>
                    <p className="bt-cta-body">
                        Your feedback — whether it's a friction point, a missing feature, a delightful moment, or a
                        suggested improvement — directly influences the product roadmap, the pricing model, and the
                        overall direction. This is your opportunity to leave a genuine mark on something that is
                        actively growing. No feedback is too small; all of it is read, considered, and acted upon.
                    </p>

                    <div className="bt-btn-row">
                        <a
                            href="mailto:dhayanithianandan@gmail.com?subject=Product Feedback&body=Hi Dhayanithi,%0D%0A%0D%0AHere's my experience using the application:%0D%0A%0D%0A"
                            className="bt-btn-primary"
                            onMouseEnter={() => setHoverMail(true)}
                            onMouseLeave={() => setHoverMail(false)}
                        >
                            <span><Mail size={18} /></span>
                            Send Feedback by Email
                        </a>
                        <a
                            href="https://www.linkedin.com/in/dhayanithi-anandan/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bt-btn-secondary"
                            onMouseEnter={() => setHoverLinkedIn(true)}
                            onMouseLeave={() => setHoverLinkedIn(false)}
                        >
                            <span><Briefcase size={18} /></span>
                            Connect on LinkedIn
                        </a>
                    </div>

                    {/* Product roadmap timeline */}
                    <div className="bt-timeline">
                        <div className="bt-timeline-title">Product Journey</div>
                        <div className="bt-timeline-items">
                            {[
                                { label: 'Beta Launch', active: true },
                                { label: 'User Feedback', active: true },
                                { label: 'Pricing Design', active: false },
                                { label: 'Billing Live', active: false },
                                { label: 'Scale', active: false },
                            ].map((step, i) => (
                                <div className="bt-tl-step" key={step.label}>
                                    <div className={`bt-tl-dot ${step.active ? 'active' : 'future'}`}>
                                        {step.active ? '✓' : i + 1}
                                    </div>
                                    <div className={`bt-tl-label ${step.active ? 'active' : ''}`}>
                                        {step.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── MAIN MESSAGE CARD ── */}
                <div className="bt-msg-card">
                    <div className="bt-section-eyebrow">A Note from the Builder</div>
                    <h2 className="bt-section-title">Here's Exactly What This Means for You</h2>
                    <p className="bt-section-body">
                        The billing infrastructure is deliberately inactive at this stage. This is not a limitation —
                        it is a conscious decision to prioritize your experience over revenue. You are among the first
                        users shaping what this product becomes, and that role carries real weight.
                    </p>
                    <p className="bt-section-body">
                        No money is being deducted. No invoice will be raised. No credit card is on file. You can
                        explore every corner of this application without hesitation — and when you do, your honest
                        observations become the most valuable asset in building something truly useful.
                    </p>

                    <div className="bt-divider" />

                    <div className="bt-section-eyebrow">What You Have Right Now</div>
                    <div className="bt-chips">
                        {[
                            [Ban, 'No payments processed'],
                            [Wallet, 'No deductions, ever'],
                            [Key, 'Unlimited feature access'],
                            [BarChart3, 'All analytics unlocked'],
                            [Handshake, 'Direct builder access'],
                            [FlaskConical, 'Shaping the product roadmap'],
                        ].map(([Icon, label]) => (
                            <span className="bt-chip" key={label}>
                            <span className="bt-chip-icon">
                                <Icon size={16} strokeWidth={2} />
                            </span>
                            {label}
                            </span>
                        ))}
                        </div>
                </div>

                

                {/* ── USAGE PLACEHOLDER ── */}
                <div className="bt-usage-card">
                    <div className="bt-usage-row">
                        <div className="bt-usage-left">
                            <h4>Billing Dashboard</h4>
                            <p>
                                Your usage analytics, monthly summaries, and invoice history will appear here
                                once billing is activated. For now, use everything freely and focus on your work.
                            </p>
                        </div>
                        <div className="bt-status-pill">
                            <span className="bt-status-pulse" />
                            Inactive · Dev Phase
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}




// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import config from '../../config';

// const fmt = (n) => (n ?? 0).toLocaleString();
// const fmtCurrency = (n) => `$${((n ?? 0)).toFixed(2)}`;

// const STATUS_BADGE = {
//     paid:    { label: 'Paid',    bg: '#D1FAE5', color: '#065F46' },
//     pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
//     failed:  { label: 'Failed',  bg: '#FEE2E2', color: '#991B1B' },
// };

// export default function BillingTab() {
//     const [trial,    setTrial]    = useState(null);
//     const [resStats, setResStats] = useState(null);
//     const [invoices, setInvoices] = useState([]);
//     const [loading,  setLoading]  = useState(true);
//     const [checkoutLoading, setCheckoutLoading] = useState(false);
//     const [upiLoading,      setUpiLoading]      = useState(false);
//     const [portalLoading,   setPortalLoading]   = useState(false);
//     const [business, setBusiness] = useState(null);

//     useEffect(() => {
//         const fetchAll = async () => {
//             try {
//                 const [trialRes, resRes, invoiceRes, bizRes] = await Promise.allSettled([
//                     axios.get(`${config.API_BASE_URL}/trial/status`,       { withCredentials: true }),
//                     axios.get(`${config.API_BASE_URL}/resolutions/stats`,  { withCredentials: true }),
//                     axios.get(`${config.API_BASE_URL}/billing/invoices`,   { withCredentials: true }),
//                     axios.get(`${config.API_BASE_URL}/business/me`,        { withCredentials: true }),
//                 ]);
//                 if (trialRes.status   === 'fulfilled') setTrial(trialRes.value.data);
//                 if (resRes.status     === 'fulfilled') setResStats(resRes.value.data.stats);
//                 if (invoiceRes.status === 'fulfilled') setInvoices(invoiceRes.value.data.invoices ?? []);
//                 if (bizRes.status     === 'fulfilled') setBusiness(bizRes.value.data.data);
//             } catch { /* individual failures handled above */ }
//             finally { setLoading(false); }
//         };
//         fetchAll();
//     }, []);

//     const handleCardCheckout = async () => {
//         setCheckoutLoading(true);
//         try {
//             const res = await axios.post(`${config.API_BASE_URL}/billing/checkout`, {}, { withCredentials: true });
//             if (res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
//         } catch (err) {
//             alert(err.response?.data?.message || 'Could not start checkout. Try again.');
//         } finally { setCheckoutLoading(false); }
//     };

//     const handleManageSubscription = async () => {
//         setPortalLoading(true);
//         try {
//             const res = await axios.get(`${config.API_BASE_URL}/billing/portal`, { withCredentials: true });
//             if (res.data.portalUrl) window.open(res.data.portalUrl, '_blank');
//         } catch (err) {
//             alert(err.response?.data?.message || 'Could not open portal.');
//         } finally { setPortalLoading(false); }
//     };

//     const isActive   = business?.subscriptionStatus === 'active';
//     const isTrial    = trial?.isActive;
//     const daysLeft   = trial?.daysLeft ?? 0;
//     const thisMonth  = resStats?.thisMonth ?? 0;
//     const totalRes   = resStats?.total     ?? 0;

//     return (
//         <div style={{ maxWidth: 860 }}>
//             <style>{`
//                 .btab-banner {
//                     display: flex; align-items: center; justify-content: space-between;
//                     gap: 1rem; padding: 16px 20px; border-radius: 12px; margin-bottom: 2rem;
//                     flex-wrap: wrap;
//                 }
//                 .btab-banner.trial {
//                     background: linear-gradient(135deg, #FFF8E1, #FFF3C4);
//                     border: 1.5px solid #FFD54F;
//                 }
//                 .btab-banner.active {
//                     background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
//                     border: 1.5px solid #34D399;
//                 }
//                 .btab-banner.expired {
//                     background: #FEE2E2; border: 1.5px solid #FCA5A5;
//                 }
//                 .btab-card {
//                     background: #fff; border: 1px solid rgba(184,134,11,0.15);
//                     border-radius: 16px; padding: 28px; margin-bottom: 1.5rem;
//                 }
//                 .btab-stat-row {
//                     display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
//                     gap: 1rem; margin-bottom: 2rem;
//                 }
//                 .btab-stat {
//                     background: #FDFAF2; border: 1px solid rgba(184,134,11,0.15);
//                     border-radius: 12px; padding: 18px 20px;
//                 }
//                 .btab-stat-val {
//                     font-size: 1.9rem; font-weight: 800; color: #1A1200; line-height: 1;
//                     font-family: 'Playfair Display', Georgia, serif;
//                 }
//                 .btab-stat-label {
//                     font-size: 0.82rem; color: #5C5032; font-weight: 500; margin-top: 4px;
//                 }
//                 .btab-plan-title {
//                     font-size: 0.78rem; color: #8C7A4A; text-transform: uppercase;
//                     letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px;
//                 }
//                 .btab-plan-name {
//                     font-size: 1.4rem; font-weight: 800; color: #1A1200;
//                     font-family: 'Playfair Display', Georgia, serif;
//                 }
//                 .btab-price {
//                     font-size: 2.4rem; font-weight: 800; color: #C9950A;
//                     font-family: 'Playfair Display', Georgia, serif; line-height: 1;
//                 }
//                 .btab-price span {
//                     font-size: 1rem; color: #8C7A4A; font-weight: 500;
//                     font-family: 'DM Sans', system-ui, sans-serif;
//                 }
//                 .btab-feature-list {
//                     list-style: none; margin: 0; padding: 0;
//                     display: flex; flex-direction: column; gap: 8px;
//                 }
//                 .btab-feature-list li {
//                     display: flex; align-items: center; gap: 8px;
//                     font-size: 0.88rem; color: #5C5032;
//                 }
//                 .btab-feature-list li::before {
//                     content: '✓'; color: #059669; font-weight: 700; flex-shrink: 0;
//                 }
//                 .btab-btn {
//                     display: inline-flex; align-items: center; justify-content: center;
//                     gap: 8px; padding: 12px 24px; border-radius: 999px;
//                     font-weight: 700; font-size: 0.9rem; cursor: pointer;
//                     border: none; font-family: 'DM Sans', system-ui, sans-serif;
//                     transition: opacity 0.2s, box-shadow 0.2s; width: 100%;
//                 }
//                 .btab-btn-primary {
//                     background: linear-gradient(135deg, #FFC107, #FFB300);
//                     color: #1A1200; box-shadow: 0 4px 14px rgba(255,193,7,0.35);
//                 }
//                 .btab-btn-primary:hover { opacity: 0.9; box-shadow: 0 6px 20px rgba(255,193,7,0.45); }
//                 .btab-btn-ghost {
//                     background: transparent; color: #5C5032;
//                     border: 1.5px solid rgba(184,134,11,0.4);
//                 }
//                 .btab-btn-ghost:hover { border-color: rgba(184,134,11,0.7); color: #1A1200; }
//                 .btab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
//                 .btab-table { width: 100%; border-collapse: collapse; }
//                 .btab-table th {
//                     text-align: left; font-size: 0.78rem; color: #8C7A4A;
//                     text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
//                     padding: 10px 16px; border-bottom: 1px solid rgba(184,134,11,0.15);
//                 }
//                 .btab-table td {
//                     padding: 14px 16px; font-size: 0.88rem; color: #5C5032;
//                     border-bottom: 1px solid rgba(184,134,11,0.08);
//                 }
//                 .btab-table tr:last-child td { border-bottom: none; }
//                 .btab-badge {
//                     display: inline-block; padding: 3px 10px; border-radius: 999px;
//                     font-size: 0.75rem; font-weight: 600;
//                 }
//                 .btab-pay-grid {
//                     display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
//                 }
//                 @media (max-width: 600px) {
//                     .btab-pay-grid { grid-template-columns: 1fr; }
//                 }
//             `}</style>

//             <div className="mb-8">
//                 <h2 className="title mb-2">Billing & Subscription</h2>
//                 <p className="text-muted">Pay only for what you use — $0.79 per resolved conversation.</p>
//             </div>

//             {/* Trial / Status Banner */}
//             {!loading && (
//                 <div className={`btab-banner ${isActive ? 'active' : isTrial ? 'trial' : 'expired'}`}>
//                     <div>
//                         {isActive && (
//                             <>
//                                 <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.95rem' }}>Subscription Active</div>
//                                 <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: 2 }}>
//                                     Paying $0.79 per resolved conversation · {business?.paymentMethod === 'upi' ? 'UPI' : 'Card'}
//                                 </div>
//                             </>
//                         )}
//                         {!isActive && isTrial && (
//                             <>
//                                 <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
//                                     Free Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
//                                 </div>
//                                 <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: 2 }}>
//                                     Resolutions during trial are free. Subscribe before trial ends to keep going.
//                                 </div>
//                             </>
//                         )}
//                         {!isActive && !isTrial && (
//                             <>
//                                 <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.95rem' }}>Trial Ended</div>
//                                 <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: 2 }}>
//                                     Subscribe to re-activate your chatbot resolutions.
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                     {isActive && business?.polarCustomerId && (
//                         <button
//                             className="btab-btn btab-btn-ghost"
//                             style={{ width: 'auto', padding: '9px 20px' }}
//                             onClick={handleManageSubscription}
//                             disabled={portalLoading}
//                         >
//                             {portalLoading ? 'Loading…' : 'Manage Subscription'}
//                         </button>
//                     )}
//                 </div>
//             )}

//             {/* Stats */}
//             <div className="btab-stat-row">
//                 <div className="btab-stat">
//                     <div className="btab-stat-val">{loading ? '—' : fmt(thisMonth)}</div>
//                     <div className="btab-stat-label">Resolutions This Month</div>
//                 </div>
//                 <div className="btab-stat">
//                     <div className="btab-stat-val">{loading ? '—' : fmt(totalRes)}</div>
//                     <div className="btab-stat-label">Total Resolutions</div>
//                 </div>
//                 <div className="btab-stat">
//                     <div className="btab-stat-val">{loading ? '—' : fmtCurrency(thisMonth * 0.79)}</div>
//                     <div className="btab-stat-label">Estimated This Month</div>
//                 </div>
//             </div>

//             {/* Plan Card */}
//             <div className="btab-card">
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
//                     <div>
//                         <div className="btab-plan-title">Current Plan</div>
//                         <div className="btab-plan-name">
//                             {isActive ? 'Pay-as-you-go' : isTrial ? 'Free Trial' : 'Inactive'}
//                         </div>
//                     </div>
//                     <div>
//                         <div className="btab-price">$0.79 <span>/ resolution</span></div>
//                     </div>
//                 </div>

//                 <ul className="btab-feature-list" style={{ marginBottom: '1.5rem' }}>
//                     <li>Unlimited knowledge documents</li>
//                     <li>Unlimited chat messages</li>
//                     <li>Custom bot branding & logo</li>
//                     <li>Resolution detection (confirmed + assumed)</li>
//                     <li>Polar customer portal for invoices</li>
//                 </ul>

//                 {!isActive && (
//                     <>
//                         <p style={{ fontSize: '0.85rem', color: '#8C7A4A', marginBottom: '1rem', fontWeight: 500 }}>
//                             Choose your payment method to activate:
//                         </p>
//                         <div className="btab-pay-grid">
//                             <button
//                                 className="btab-btn btab-btn-primary"
//                                 onClick={handleCardCheckout}
//                                 disabled={checkoutLoading}
//                             >
//                                 {checkoutLoading ? 'Redirecting…' : '💳  Pay with Card'}
//                             </button>
//                             <button
//                                 className="btab-btn btab-btn-ghost"
//                                 onClick={() => setUpiLoading(true)}
//                                 disabled={upiLoading}
//                                 title="UPI payment coming soon"
//                             >
//                                 {upiLoading ? 'Setting up…' : '⊕  Pay with UPI'}
//                             </button>
//                         </div>
//                         <p style={{ fontSize: '0.78rem', color: '#8C7A4A', marginTop: '12px', textAlign: 'center' }}>
//                             Card via Polar.sh · UPI via Cashfree · Billed monthly
//                         </p>
//                     </>
//                 )}
//             </div>

//             {/* Invoices */}
//             <div className="btab-card" style={{ marginBottom: 0 }}>
//                 <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1200', marginBottom: '1.25rem' }}>
//                     Invoices
//                 </h3>
//                 {loading ? (
//                     <p style={{ color: '#8C7A4A', fontSize: '0.88rem' }}>Loading…</p>
//                 ) : invoices.length === 0 ? (
//                     <p style={{ color: '#8C7A4A', fontSize: '0.88rem' }}>No invoices yet. They'll appear here once you're billed.</p>
//                 ) : (
//                     <div style={{ overflowX: 'auto' }}>
//                         <table className="btab-table">
//                             <thead>
//                                 <tr>
//                                     <th>Month</th>
//                                     <th>Resolutions</th>
//                                     <th>Amount</th>
//                                     <th>Method</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {invoices.map((inv) => {
//                                     const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.pending;
//                                     return (
//                                         <tr key={inv._id}>
//                                             <td style={{ color: '#1A1200', fontWeight: 600 }}>{inv.billingPeriod}</td>
//                                             <td>{fmt(inv.resolutionCount)}</td>
//                                             <td style={{ color: '#1A1200', fontWeight: 600 }}>{fmtCurrency(inv.amountINR)}</td>
//                                             <td style={{ textTransform: 'capitalize' }}>{inv.paymentMethod ?? '—'}</td>
//                                             <td>
//                                                 <span className="btab-badge" style={{ background: badge.bg, color: badge.color }}>
//                                                     {badge.label}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
