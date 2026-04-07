import React, { useState } from 'react';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import config from '../../config';

export default function ProfileTab() {
    const { user, refetchUser } = useAuth();

    const [nameForm, setNameForm] = useState({ name: user?.name || '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const [nameState, setNameState] = useState('idle'); // idle | saving | success | error
    const [nameError, setNameError] = useState('');
    const [pwState, setPwState] = useState('idle');
    const [pwError, setPwError] = useState('');

    const isGoogleUser = !user?.password && !!user?.googleId;

    const handleNameSave = async (e) => {
        e.preventDefault();
        if (!nameForm.name.trim()) {
            setNameError('Name cannot be empty');
            return;
        }
        setNameState('saving');
        setNameError('');
        try {
            await axios.put(`${config.API_BASE_URL}/auth/profile`, { name: nameForm.name }, { withCredentials: true });
            await refetchUser();
            setNameState('success');
            setTimeout(() => setNameState('idle'), 3000);
        } catch (err) {
            setNameError(err.response?.data?.message || 'Failed to update name');
            setNameState('error');
            setTimeout(() => setNameState('idle'), 4000);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPwError('');

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPwError('Please fill in all password fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPwError('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPwError('New password must be at least 6 characters');
            return;
        }

        setPwState('saving');
        try {
            await axios.put(`${config.API_BASE_URL}/auth/profile`, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, { withCredentials: true });
            setPwState('success');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPwState('idle'), 3000);
        } catch (err) {
            setPwError(err.response?.data?.message || 'Failed to update password');
            setPwState('error');
            setTimeout(() => setPwState('idle'), 4000);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Identity Banner (full width) ──────────────────────────── */}
            <div className="card p-6" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'var(--color-accent)', border: '3px solid var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', fontWeight: 700, color: '#000000', flexShrink: 0
                }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-text)', lineHeight: 1.2 }}>{user?.name || 'Your Name'}</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <Mail size={14} /> {user?.email}
                    </p>
                    {isGoogleUser && (
                        <span className="badge badge-success" style={{ marginTop: '8px', fontSize: '0.72rem' }}>Google Account</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="badge badge-muted" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                        Free Plan
                    </span>
                </div>
            </div>

            {/* ── 2-column grid ─────────────────────────────────────────── */}
            <div className="profile-layout">

                {/* Left column: Name + Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Name Edit */}
                    <div className="card p-6">
                        <h3 className="section-title mb-1">Display Name</h3>
                        <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>Update the name shown across your workspace.</p>

                        <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-faint)' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={nameForm.name}
                                        onChange={e => setNameForm({ name: e.target.value })}
                                        style={{ paddingLeft: '38px' }}
                                        placeholder="Your full name"
                                        disabled={nameState === 'saving'}
                                    />
                                </div>
                            </div>

                            {nameError && (
                                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> {nameError}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={nameState === 'saving'}
                                    style={{ minWidth: '140px' }}
                                >
                                    {nameState === 'saving' ? (
                                        <span className="animate-pulse">Saving...</span>
                                    ) : nameState === 'success' ? (
                                        <><CheckCircle size={16} /> Saved</>
                                    ) : (
                                        <><Save size={16} /> Save Name</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Email (read-only) */}
                    <div className="card p-6">
                        <h3 className="section-title mb-1">Email Address</h3>
                        <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>Your login email address cannot be changed here.</p>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-faint)' }} />
                            <input
                                type="email"
                                className="input-field"
                                value={user?.email || ''}
                                readOnly
                                style={{ paddingLeft: '38px', background: 'var(--color-surface-2)', cursor: 'not-allowed', opacity: 0.7 }}
                            />
                        </div>
                    </div>

                </div>

                {/* Right column: Password */}
                <div>
                    <div className="card p-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <Shield size={18} color="var(--color-text-muted)" />
                            <h3 className="section-title">Change Password</h3>
                        </div>
                        <p className="text-muted mb-5" style={{ fontSize: '0.88rem' }}>
                            {isGoogleUser
                                ? 'Password change is not available for Google sign-in accounts.'
                                : 'Use a strong password of at least 6 characters.'}
                        </p>

                        {isGoogleUser ? (
                            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> Password management is handled by Google for your account.
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-faint)' }} />
                                        <input
                                            type={showCurrentPw ? 'text' : 'password'}
                                            className="input-field"
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            style={{ paddingLeft: '38px', paddingRight: '40px' }}
                                            placeholder="Enter current password"
                                            disabled={pwState === 'saving'}
                                        />
                                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)' }}>
                                            {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-faint)' }} />
                                        <input
                                            type={showNewPw ? 'text' : 'password'}
                                            className="input-field"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            style={{ paddingLeft: '38px', paddingRight: '40px' }}
                                            placeholder="At least 6 characters"
                                            disabled={pwState === 'saving'}
                                        />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)' }}>
                                            {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-faint)' }} />
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            style={{ paddingLeft: '38px' }}
                                            placeholder="Repeat new password"
                                            disabled={pwState === 'saving'}
                                        />
                                    </div>
                                </div>

                                {pwError && (
                                    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={16} /> {pwError}
                                    </div>
                                )}

                                {pwState === 'success' && (
                                    <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={16} /> Password updated successfully!
                                    </div>
                                )}

                                <div>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={pwState === 'saving'}
                                        style={{ minWidth: '160px' }}
                                    >
                                        {pwState === 'saving' ? (
                                            <span className="animate-pulse">Updating...</span>
                                        ) : pwState === 'success' ? (
                                            <><CheckCircle size={16} /> Updated</>
                                        ) : (
                                            <><Lock size={16} /> Update Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
