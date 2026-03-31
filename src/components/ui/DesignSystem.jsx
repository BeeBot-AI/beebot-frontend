import React from 'react';

// ─── 1. ASYMMETRIC / WOBBLY ARROWS ────────────────────────────────────────────────
export const ArrowCurved = ({ className = '', color = 'currentColor', strokeWidth = 2, size = 32 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: 'visible' }}
    >
        <path
            d="M 10,80 Q 40,90 70,50 T 90,20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
        />
        <path
            d="M 65,15 L 90,20 L 85,45"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
        />
    </svg>
);

export const ArrowScribble = ({ className = '', color = 'currentColor', size = 48 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: 'visible' }}
    >
        <path
            d="M5.5342 63.8058C28.2325 58.75 49.3364 36.3475 75.3402 18.0674M75.3402 18.0674C68.9959 18.0674 58.3079 24.3826 53.606 27.5369M75.3402 18.0674C76.9202 24.3006 82.2592 37.1264 85.0601 43.1952"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

// ─── 2. ORGANIC DIVIDERS (Background Textures & Waves) ──────────────────────────
export const WaveDivider = ({ fill = 'var(--color-surface)', inverted = false, className = '' }) => (
    <div className={`w-full overflow-hidden leading-0 ${className}`} style={{ transform: inverted ? 'rotate(180deg)' : 'none' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: 'calc(100% + 1.3px)', height: '60px', display: 'block' }}>
            <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                fill={fill}
            />
        </svg>
    </div>
);

export const TornPaperDivider = ({ fill = 'var(--color-surface)', inverted = false, className = '' }) => (
    <div className={`w-full overflow-hidden leading-0 ${className}`} style={{ transform: inverted ? 'rotate(180deg)' : 'none' }}>
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: 'calc(100% + 1.3px)', height: '40px', display: 'block' }}>
            <path
                d="M 0,40 L 0,20 Q 30,5 60,15 T 120,20 T 180,5 T 240,15 T 300,5 T 360,20 T 420,10 T 480,25 T 540,5 T 600,15 T 660,10 T 720,20 T 780,5 T 840,15 T 900,10 T 960,25 T 1020,5 T 1080,20 T 1140,10 T 1200,20 L 1200,40 Z"
                fill={fill}
            />
        </svg>
    </div>
);

// ─── 3. BACKGROUND TEXTURES ───────────────────────────────────────────────────────
export const TextureDotGrid = ({ color = 'var(--color-border-strong)', opacity = 0.4 }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
            <pattern id="handDots" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                <circle cx="2" cy="2" r="1.5" fill={color} />
                <circle cx="16" cy="18" r="1" fill={color} />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#handDots)" />
    </svg>
);

export const TextureCrosshatch = ({ color = 'var(--color-border)', opacity = 0.3 }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
            <pattern id="crosshatch" width="40" height="40" patternUnits="userSpaceOnUse" stroke={color} strokeWidth="0.5">
                <path d="M0,0 L40,40 M40,0 L0,40 M20,0 L20,40 M0,20 L40,20" opacity="0.5" />
                <path d="M10,-10 L50,30 M-10,10 L30,50" opacity="0.3" strokeWidth="0.2" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crosshatch)" />
    </svg>
);

// ─── 4. UI ACCENTS & MOTIFS ──────────────────────────────────────────────────────
export const HandDrawnCheck = ({ color = 'var(--color-success)', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <path d="M 4,12 L 10,18 L 22,4" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 5,11 L 9,17 L 21,5" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
);

export const HandDrawnUnderline = ({ color = 'var(--color-primary-light)', height = '8px' }) => (
    <svg width="100%" height={height} viewBox="0 0 100 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: '-2px', left: 0, zIndex: -1 }}>
        <path d="M 2,5 Q 25,8 50,4 T 98,6" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
);

// Abstract Bot Launch Illustration (For Welcome Screen)
export const BotLaunchIllustration = ({ size = 200, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Abstract shapes representing a bot brain/hexagon deploying */}
        <path d="M200 60 C300 120, 340 240, 200 340 C60 240, 100 120, 200 60 Z" fill="var(--color-primary-light)" opacity="0.5" />
        <path d="M200 100 L280 150 L280 250 L200 300 L120 250 L120 150 Z" stroke="var(--color-primary)" strokeWidth="8" strokeLinejoin="round" />
        <circle cx="160" cy="180" r="16" fill="var(--color-accent)" />
        <circle cx="240" cy="180" r="16" fill="var(--color-accent)" />
        <path d="M160 230 Q200 260 240 230" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" />
        {/* Orbital/Deploy rings */}
        <ellipse cx="200" cy="200" rx="160" ry="60" stroke="var(--color-border-strong)" strokeWidth="2" strokeDasharray="8 8" transform="rotate(-15 200 200)" />
        <circle cx="60" cy="160" r="8" fill="var(--color-primary)" />
        <circle cx="340" cy="260" r="12" fill="var(--color-accent)" />
    </svg>
);
