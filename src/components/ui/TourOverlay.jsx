import React, { useEffect, useState } from 'react';
import { useTour } from '../../context/TourContext';
import { ArrowRight, CheckCircle, X } from 'lucide-react';

export default function TourOverlay() {
    const { isActive, currentStep, nextStep, endTour } = useTour();
    const [targetRect, setTargetRect] = useState(null);

    // Define the sequence of tour steps and their target DOM elements
    const TOUR_STEPS = [
        {
            targetId: 'tour-dashboard-welcome',
            title: 'Welcome to Command Center',
            content: 'This is your birds-eye view of all operations. From here, you can track daily conversations and monitor your bot\'s performance.',
            position: 'bottom', // where the tooltip appears relative to the target
        },
        {
            targetId: 'tour-knowledge-base',
            title: 'Teach Your Bot',
            content: 'Head over to the Knowledge Base to securely upload your business documents (PDFs, URLs, Text). BeeBot learns from this to answer accurately.',
            position: 'right',
        },
        {
            targetId: 'tour-bot-settings',
            title: 'Refine & Deploy',
            content: 'Customize your bot\'s appearance, set strict operational boundaries, and grab your 2-line embed code to paste on your website.',
            position: 'right',
        }
    ];

    useEffect(() => {
        if (!isActive || currentStep >= TOUR_STEPS.length) return;

        const targetId = TOUR_STEPS[currentStep].targetId;

        // Polling function to wait for the element to mount if navigating between pages
        const findTarget = () => {
            const el = document.getElementById(targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);

                // Add a subtle highlight class to the target element
                el.classList.add('tour-target-active');
            } else {
                // If not found immediately, retry after a short delay (e.g., waiting for tab switch)
                setTimeout(findTarget, 200);
            }
        };

        findTarget();

        // Cleanup function to remove the class
        return () => {
            const el = document.getElementById(targetId);
            if (el) el.classList.remove('tour-target-active');
        };
    }, [isActive, currentStep, TOUR_STEPS]);

    if (!isActive || !targetRect || currentStep >= TOUR_STEPS.length) return null;

    const currentTourData = TOUR_STEPS[currentStep];

    // Calculate tooltip coordinates based on the position preference
    const tooltipStyle = {
        position: 'absolute',
        zIndex: 10001,
        width: '320px',
    };

    const padding = 20; // Padding around the cutout

    if (currentTourData.position === 'bottom') {
        tooltipStyle.top = `${targetRect.bottom + padding}px`;
        tooltipStyle.left = `${targetRect.left}px`;
    } else if (currentTourData.position === 'right') {
        tooltipStyle.top = `${targetRect.top}px`;
        tooltipStyle.left = `${targetRect.right + padding}px`;
    }

    // CSS Mask cutout calculation
    const maskPath = `
        M0,0 
        L100vw,0 
        L100vw,100vh 
        L0,100vh Z
        M${targetRect.left - padding},${targetRect.top - padding} 
        L${targetRect.left - padding},${targetRect.bottom + padding} 
        L${targetRect.right + padding},${targetRect.bottom + padding} 
        L${targetRect.right + padding},${targetRect.top - padding} Z
    `;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'auto' }}>

            {/* The SVG Mask Overlay (creates the spotlight effect) */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <path d={maskPath} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
            </svg>

            {/* The Hand-drawn connecting arrow (SVG logic based on position) */}
            {currentTourData.position === 'bottom' && (
                <svg width="40" height="40" style={{ position: 'absolute', top: targetRect.bottom - 5, left: targetRect.left + 20, zIndex: 1, pointerEvents: 'none', color: 'var(--color-primary-deep)' }}>
                    <path d="M20,0 Q30,20 20,40" fill="none" stroke="currentColor" strokeWidth="3" />
                    <polygon points="15,35 20,40 25,35" fill="currentColor" />
                </svg>
            )}

            {currentTourData.position === 'right' && (
                <svg width="40" height="40" style={{ position: 'absolute', top: targetRect.top + 20, left: targetRect.right - 5, zIndex: 1, pointerEvents: 'none', color: 'var(--color-primary-deep)', transform: 'rotate(-90deg)' }}>
                    <path d="M20,0 Q30,20 20,40" fill="none" stroke="currentColor" strokeWidth="3" />
                    <polygon points="15,35 20,40 25,35" fill="currentColor" />
                </svg>
            )}

            {/* The Tooltip Card */}
            <div className="card-asymmetric animate-fade-in" style={{ ...tooltipStyle, background: 'var(--color-white)', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text)' }}>
                        {currentTourData.title}
                    </h4>
                    <button onClick={endTour} style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer', padding: '4px' }}>
                        <X size={18} />
                    </button>
                </div>

                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {currentTourData.content}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-faint)' }}>
                        Step {currentStep + 1} of {TOUR_STEPS.length}
                    </div>

                    {currentStep === TOUR_STEPS.length - 1 ? (
                        <button className="btn-primary" onClick={endTour} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            Finish Tour <CheckCircle size={16} className="inline ml-1" />
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={nextStep} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            Next <ArrowRight size={16} className="inline ml-1" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
