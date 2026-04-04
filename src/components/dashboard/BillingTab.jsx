import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const fmt = (n) => (n ?? 0).toLocaleString();
const fmtCurrency = (n) => `$${((n ?? 0)).toFixed(2)}`;

const STATUS_BADGE = {
    paid:    { label: 'Paid',    bg: '#D1FAE5', color: '#065F46' },
    pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
    failed:  { label: 'Failed',  bg: '#FEE2E2', color: '#991B1B' },
};

export default function BillingTab() {
    const [trial,    setTrial]    = useState(null);
    const [resStats, setResStats] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [upiLoading,      setUpiLoading]      = useState(false);
    const [portalLoading,   setPortalLoading]   = useState(false);
    const [business, setBusiness] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [trialRes, resRes, invoiceRes, bizRes] = await Promise.allSettled([
                    axios.get(`${config.API_BASE_URL}/trial/status`,       { withCredentials: true }),
                    axios.get(`${config.API_BASE_URL}/resolutions/stats`,  { withCredentials: true }),
                    axios.get(`${config.API_BASE_URL}/billing/invoices`,   { withCredentials: true }),
                    axios.get(`${config.API_BASE_URL}/business/me`,        { withCredentials: true }),
                ]);
                if (trialRes.status   === 'fulfilled') setTrial(trialRes.value.data);
                if (resRes.status     === 'fulfilled') setResStats(resRes.value.data.stats);
                if (invoiceRes.status === 'fulfilled') setInvoices(invoiceRes.value.data.invoices ?? []);
                if (bizRes.status     === 'fulfilled') setBusiness(bizRes.value.data.data);
            } catch { /* individual failures handled above */ }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const handleCardCheckout = async () => {
        setCheckoutLoading(true);
        try {
            const res = await axios.post(`${config.API_BASE_URL}/billing/checkout`, {}, { withCredentials: true });
            if (res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
        } catch (err) {
            alert(err.response?.data?.message || 'Could not start checkout. Try again.');
        } finally { setCheckoutLoading(false); }
    };

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const res = await axios.get(`${config.API_BASE_URL}/billing/portal`, { withCredentials: true });
            if (res.data.portalUrl) window.open(res.data.portalUrl, '_blank');
        } catch (err) {
            alert(err.response?.data?.message || 'Could not open portal.');
        } finally { setPortalLoading(false); }
    };

    const isActive   = business?.subscriptionStatus === 'active';
    const isTrial    = trial?.isActive;
    const daysLeft   = trial?.daysLeft ?? 0;
    const thisMonth  = resStats?.thisMonth ?? 0;
    const totalRes   = resStats?.total     ?? 0;

    return (
        <div style={{ maxWidth: 860 }}>
            <style>{`
                .btab-banner {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 1rem; padding: 16px 20px; border-radius: 12px; margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                .btab-banner.trial {
                    background: linear-gradient(135deg, #FFF8E1, #FFF3C4);
                    border: 1.5px solid #FFD54F;
                }
                .btab-banner.active {
                    background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                    border: 1.5px solid #34D399;
                }
                .btab-banner.expired {
                    background: #FEE2E2; border: 1.5px solid #FCA5A5;
                }
                .btab-card {
                    background: #fff; border: 1px solid rgba(184,134,11,0.15);
                    border-radius: 16px; padding: 28px; margin-bottom: 1.5rem;
                }
                .btab-stat-row {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 1rem; margin-bottom: 2rem;
                }
                .btab-stat {
                    background: #FDFAF2; border: 1px solid rgba(184,134,11,0.15);
                    border-radius: 12px; padding: 18px 20px;
                }
                .btab-stat-val {
                    font-size: 1.9rem; font-weight: 800; color: #1A1200; line-height: 1;
                    font-family: 'Playfair Display', Georgia, serif;
                }
                .btab-stat-label {
                    font-size: 0.82rem; color: #5C5032; font-weight: 500; margin-top: 4px;
                }
                .btab-plan-title {
                    font-size: 0.78rem; color: #8C7A4A; text-transform: uppercase;
                    letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px;
                }
                .btab-plan-name {
                    font-size: 1.4rem; font-weight: 800; color: #1A1200;
                    font-family: 'Playfair Display', Georgia, serif;
                }
                .btab-price {
                    font-size: 2.4rem; font-weight: 800; color: #C9950A;
                    font-family: 'Playfair Display', Georgia, serif; line-height: 1;
                }
                .btab-price span {
                    font-size: 1rem; color: #8C7A4A; font-weight: 500;
                    font-family: 'DM Sans', system-ui, sans-serif;
                }
                .btab-feature-list {
                    list-style: none; margin: 0; padding: 0;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .btab-feature-list li {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.88rem; color: #5C5032;
                }
                .btab-feature-list li::before {
                    content: '✓'; color: #059669; font-weight: 700; flex-shrink: 0;
                }
                .btab-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    gap: 8px; padding: 12px 24px; border-radius: 999px;
                    font-weight: 700; font-size: 0.9rem; cursor: pointer;
                    border: none; font-family: 'DM Sans', system-ui, sans-serif;
                    transition: opacity 0.2s, box-shadow 0.2s; width: 100%;
                }
                .btab-btn-primary {
                    background: linear-gradient(135deg, #FFC107, #FFB300);
                    color: #1A1200; box-shadow: 0 4px 14px rgba(255,193,7,0.35);
                }
                .btab-btn-primary:hover { opacity: 0.9; box-shadow: 0 6px 20px rgba(255,193,7,0.45); }
                .btab-btn-ghost {
                    background: transparent; color: #5C5032;
                    border: 1.5px solid rgba(184,134,11,0.4);
                }
                .btab-btn-ghost:hover { border-color: rgba(184,134,11,0.7); color: #1A1200; }
                .btab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .btab-table { width: 100%; border-collapse: collapse; }
                .btab-table th {
                    text-align: left; font-size: 0.78rem; color: #8C7A4A;
                    text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
                    padding: 10px 16px; border-bottom: 1px solid rgba(184,134,11,0.15);
                }
                .btab-table td {
                    padding: 14px 16px; font-size: 0.88rem; color: #5C5032;
                    border-bottom: 1px solid rgba(184,134,11,0.08);
                }
                .btab-table tr:last-child td { border-bottom: none; }
                .btab-badge {
                    display: inline-block; padding: 3px 10px; border-radius: 999px;
                    font-size: 0.75rem; font-weight: 600;
                }
                .btab-pay-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
                }
                @media (max-width: 600px) {
                    .btab-pay-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="mb-8">
                <h2 className="title mb-2">Billing & Subscription</h2>
                <p className="text-muted">Pay only for what you use — $0.79 per resolved conversation.</p>
            </div>

            {/* Trial / Status Banner */}
            {!loading && (
                <div className={`btab-banner ${isActive ? 'active' : isTrial ? 'trial' : 'expired'}`}>
                    <div>
                        {isActive && (
                            <>
                                <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.95rem' }}>Subscription Active</div>
                                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: 2 }}>
                                    Paying $0.79 per resolved conversation · {business?.paymentMethod === 'upi' ? 'UPI' : 'Card'}
                                </div>
                            </>
                        )}
                        {!isActive && isTrial && (
                            <>
                                <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
                                    Free Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: 2 }}>
                                    Resolutions during trial are free. Subscribe before trial ends to keep going.
                                </div>
                            </>
                        )}
                        {!isActive && !isTrial && (
                            <>
                                <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.95rem' }}>Trial Ended</div>
                                <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: 2 }}>
                                    Subscribe to re-activate your chatbot resolutions.
                                </div>
                            </>
                        )}
                    </div>
                    {isActive && business?.polarCustomerId && (
                        <button
                            className="btab-btn btab-btn-ghost"
                            style={{ width: 'auto', padding: '9px 20px' }}
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                        >
                            {portalLoading ? 'Loading…' : 'Manage Subscription'}
                        </button>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="btab-stat-row">
                <div className="btab-stat">
                    <div className="btab-stat-val">{loading ? '—' : fmt(thisMonth)}</div>
                    <div className="btab-stat-label">Resolutions This Month</div>
                </div>
                <div className="btab-stat">
                    <div className="btab-stat-val">{loading ? '—' : fmt(totalRes)}</div>
                    <div className="btab-stat-label">Total Resolutions</div>
                </div>
                <div className="btab-stat">
                    <div className="btab-stat-val">{loading ? '—' : fmtCurrency(thisMonth * 0.79)}</div>
                    <div className="btab-stat-label">Estimated This Month</div>
                </div>
            </div>

            {/* Plan Card */}
            <div className="btab-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <div className="btab-plan-title">Current Plan</div>
                        <div className="btab-plan-name">
                            {isActive ? 'Pay-as-you-go' : isTrial ? 'Free Trial' : 'Inactive'}
                        </div>
                    </div>
                    <div>
                        <div className="btab-price">$0.79 <span>/ resolution</span></div>
                    </div>
                </div>

                <ul className="btab-feature-list" style={{ marginBottom: '1.5rem' }}>
                    <li>Unlimited knowledge documents</li>
                    <li>Unlimited chat messages</li>
                    <li>Custom bot branding & logo</li>
                    <li>Resolution detection (confirmed + assumed)</li>
                    <li>Polar customer portal for invoices</li>
                </ul>

                {!isActive && (
                    <>
                        <p style={{ fontSize: '0.85rem', color: '#8C7A4A', marginBottom: '1rem', fontWeight: 500 }}>
                            Choose your payment method to activate:
                        </p>
                        <div className="btab-pay-grid">
                            <button
                                className="btab-btn btab-btn-primary"
                                onClick={handleCardCheckout}
                                disabled={checkoutLoading}
                            >
                                {checkoutLoading ? 'Redirecting…' : '💳  Pay with Card'}
                            </button>
                            <button
                                className="btab-btn btab-btn-ghost"
                                onClick={() => setUpiLoading(true)}
                                disabled={upiLoading}
                                title="UPI payment coming soon"
                            >
                                {upiLoading ? 'Setting up…' : '⊕  Pay with UPI'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#8C7A4A', marginTop: '12px', textAlign: 'center' }}>
                            Card via Polar.sh · UPI via Cashfree · Billed monthly
                        </p>
                    </>
                )}
            </div>

            {/* Invoices */}
            <div className="btab-card" style={{ marginBottom: 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1200', marginBottom: '1.25rem' }}>
                    Invoices
                </h3>
                {loading ? (
                    <p style={{ color: '#8C7A4A', fontSize: '0.88rem' }}>Loading…</p>
                ) : invoices.length === 0 ? (
                    <p style={{ color: '#8C7A4A', fontSize: '0.88rem' }}>No invoices yet. They'll appear here once you're billed.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="btab-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Resolutions</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => {
                                    const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.pending;
                                    return (
                                        <tr key={inv._id}>
                                            <td style={{ color: '#1A1200', fontWeight: 600 }}>{inv.billingPeriod}</td>
                                            <td>{fmt(inv.resolutionCount)}</td>
                                            <td style={{ color: '#1A1200', fontWeight: 600 }}>{fmtCurrency(inv.amountINR)}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{inv.paymentMethod ?? '—'}</td>
                                            <td>
                                                <span className="btab-badge" style={{ background: badge.bg, color: badge.color }}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
