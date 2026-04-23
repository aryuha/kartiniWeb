// src/components/pages/PreparePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useProgress } from '../../context/ProgressContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AtomBackground from '../three/AtomBackground';

// ── Toast ──
function Toast({ message, show, type }) {
    if (!show) return null;
    const cfg = {
        error: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626', icon: '🔒' },
        success: { bg: '#dcfce7', border: '#22c55e', text: '#16a34a', icon: '✅' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#2563eb', icon: 'ℹ️' },
    }[type] || { bg: '#dbeafe', border: '#3b82f6', text: '#2563eb', icon: 'ℹ️' };

    return (
        <div style={{
            position: 'fixed', top: 72, left: '50%',
            transform: 'translateX(-50%)', zIndex: 9999,
            backgroundColor: cfg.bg, border: `2px solid ${cfg.border}`,
            borderRadius: 10, padding: '10px 20px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            animation: 'toastIn 0.3s ease', maxWidth: '90vw',
        }}>
            <span style={{ fontSize: 16 }}>{cfg.icon}</span>
            <span style={{
                fontSize: 12, fontWeight: 700, color: cfg.text,
                fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.5px',
            }}>
                {message}
            </span>
        </div>
    );
}

// ── Progress Bar ──
function ProgressBar({ progress }) {
    const { t } = useLanguage();
    const completed = Object.values(progress).filter(Boolean).length;
    const pct = (completed / 4) * 100;

    return (
        <div style={pb.wrapper}>
            <div style={pb.labelRow}>
                <span style={pb.label}>{t('progressLabel') || 'PROGRESS PEMBELAJARAN'}</span>
                <span style={pb.pct}>{completed}/4</span>
            </div>
            <div style={pb.track}>
                <div style={{ ...pb.fill, width: `${pct}%` }} />
            </div>
            <div style={pb.dotsRow}>
                {['step1', 'step2', 'step3', 'step4'].map((key, i) => (
                    <div key={key} style={{
                        ...pb.dot,
                        backgroundColor: progress[key] ? '#22c55e' : '#cbd5e1',
                        borderColor: progress[key] ? '#16a34a' : '#94a3b8',
                        color: progress[key] ? '#ffffff' : '#64748b',
                    }}>
                        {progress[key] ? '✓' : i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}

const pb = {
    wrapper: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)', borderRadius: 12,
        padding: '10px 16px',
        border: '1px solid rgba(37,99,235,0.15)',
        boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
    },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    label: { fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#1e3a8a', fontFamily: "'Rajdhani',sans-serif" },
    pct: { fontSize: 11, fontWeight: 800, color: '#2563eb', fontFamily: "'Rajdhani',sans-serif" },
    track: { height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    fill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 3, transition: 'width 0.5s ease' },
    dotsRow: { display: 'flex', justifyContent: 'space-between', paddingInline: 4 },
    dot: {
        width: 24, height: 24, borderRadius: '50%', border: '2px solid',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, fontFamily: "'Rajdhani',sans-serif",
        transition: 'all 0.3s ease',
    },
};

// ── Main ──
export default function PreparePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { progress, completeStep } = useProgress();

    const [hoveredCard, setHoveredCard] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        if (!toast.show) return;
        const timer = setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
        return () => clearTimeout(timer);
    }, [toast.show]);

    const showToast = (message, type = 'info') =>
        setToast({ show: true, message, type });

    const handleBack = () => navigate('/');

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const onPop = () => navigate('/');
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [navigate]);

    const features = [
        {
            id: 1, stepKey: 'step1',
            icon: '🔬', title: t('feature1Title'), description: t('feature1Desc'),
            url: '/materi', type: 'internal', requiredStep: null,
        },
        {
            id: 2, stepKey: 'step2',
            icon: '⚡', title: t('feature2Title'), description: t('feature2Desc'),
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfHfRy1m1cu1DK47L02GNCfxgzLlFj7nmGLAPe65jTXB7o4NQ/viewform?usp=header', 
            type: 'external', requiredStep: 'step1',
        },
        {
            id: 3, stepKey: 'step3',
            icon: '📡', title: t('feature3Title'), description: t('feature3Desc'),
            url: '/simulation',
            type: 'internal', requiredStep: 'step2',
        },
        {
            id: 4, stepKey: 'step4',
            icon: '🛡️', title: t('feature4Title'), description: t('feature4Desc'),
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSc86xtMLelO0JehD81E7A9wuksqFzM53D3ZQpl1UEU-YITp5w/viewform?usp=header', 
            type: 'external', requiredStep: 'step3',
        },
    ];

    const isUnlocked = (f) => !f.requiredStep || progress[f.requiredStep];
    const isCompleted = (f) => progress[f.stepKey];

    const handleCardClick = (feature) => {
        if (!isUnlocked(feature)) {
            const req = features.find(f => f.stepKey === feature.requiredStep);
            showToast(
                `${t('progressLocked') || '🔒 Selesaikan terlebih dahulu:'} "${req?.title}"`,
                'error'
            );
            return;
        }
        if (feature.type === 'internal') {
            navigate(feature.url);
        } else {
            completeStep(feature.stepKey);
            showToast(`${t('progressDone') || '✅ Tahap selesai!'} ${feature.title}`, 'success');
            window.open(feature.url, '_blank');
        }
    };

    const canStart = progress.step1 && progress.step2;

    const specs = [
        { icon: '⚛️', label: t('specTipe'), value: 'TRIGA Mark II', color: '#8B5CF6' },
        { icon: '⚡', label: t('specDaya'), value: '100 kW', color: '#F59E0B' },
        { icon: '🔋', label: t('specBakar'), value: 'U-ZrH', color: '#10B981' },
        { icon: '💧', label: t('specModerator'), value: t('specModeratorVal'), color: '#3B82F6' },
        { icon: '📍', label: t('specLokasi'), value: 'Yogyakarta', color: '#EF4444' },
        { icon: '✅', label: t('specStatus'), value: t('specStatusVal'), color: '#10B981' },
    ];

    return (
        <div style={s.page}>
            <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateX(-50%) translateY(-16px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes pulseGreen {
          0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,0.4); }
          50%     { box-shadow:0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes floatDot {
          0%,100% { transform:translateY(0); opacity:0.35; }
          50%     { transform:translateY(-8px); opacity:0.7; }
        }
        * { box-sizing: border-box; }
      `}</style>

            {/* BG */}
            <div style={s.bgFixed}><AtomBackground /></div>
            <div style={s.gridFixed} />

            {/* Ornamen pojok */}
            <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 5, pointerEvents: 'none' }}><CornerOrnament /></div>
            <div style={{ position: 'fixed', top: 16, right: 80, zIndex: 5, pointerEvents: 'none', transform: 'scaleX(-1)' }}><CornerOrnament /></div>
            <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 5, pointerEvents: 'none', transform: 'scaleY(-1)' }}><CornerOrnament /></div>
            <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 5, pointerEvents: 'none', transform: 'scale(-1,-1)' }}><CornerOrnament /></div>

            <FloatingDots />
            <Toast message={toast.message} show={toast.show} type={toast.type} />

            {/* Fixed UI */}
            <button style={s.backBtn} onClick={handleBack}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(30,79,216,0.1)'; e.currentTarget.style.color = '#1e4fd8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)'; e.currentTarget.style.color = '#1e3a8a'; }}
            >
                {t('btnKembali')}
            </button>
            <div style={s.langPos}><LanguageSwitcher /></div>

            {/* ── MAIN LAYOUT: 1 layar penuh ── */}
            <div style={s.layout}>

                {/* Section Label */}
                <div style={s.sectionLabel}>
                    <span style={{ color: '#2563eb', fontSize: 6 }}>◆</span>
                    <span style={s.sectionLabelText}>{t('sectionFeature')}</span>
                    <span style={{ color: '#2563eb', fontSize: 6 }}>◆</span>
                </div>

                {/* Progress */}
                <ProgressBar progress={progress} />

                {/* Feature Cards */}
                <div style={s.cardsGrid}>
                    {features.map((f, idx) => {
                        const unlocked = isUnlocked(f);
                        const completed = isCompleted(f);
                        return (
                            <div
                                key={f.id}
                                style={{
                                    ...s.card,
                                    ...(hoveredCard === f.id && unlocked ? s.cardHover : {}),
                                    ...(completed ? s.cardDone : {}),
                                    ...(!unlocked ? s.cardLock : {}),
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                }}
                                onMouseEnter={() => setHoveredCard(f.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => handleCardClick(f)}
                            >
                                {/* Accent */}
                                <div style={{
                                    ...s.cardAccent,
                                    background: completed
                                        ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                                        : 'linear-gradient(90deg,#1e4fd8,#3b82f6)',
                                    opacity: completed || hoveredCard === f.id ? 1 : 0,
                                }} />

                                {/* Step badge */}
                                <div style={{
                                    ...s.stepBadge,
                                    backgroundColor: completed ? '#22c55e' : unlocked ? '#2563eb' : '#94a3b8',
                                    animation: completed ? 'pulseGreen 2s infinite' : 'none',
                                }}>
                                    {completed ? '✓' : idx + 1}
                                </div>

                                {/* Lock */}
                                {!unlocked && (
                                    <div style={s.lockLayer}>
                                        <span style={{ fontSize: 22 }}>🔒</span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div style={{ ...s.iconBox, opacity: unlocked ? 1 : 0.4 }}>
                                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                                </div>

                                <h3 style={{ ...s.cardTitle, color: completed ? '#16a34a' : '#1e4fd8' }}>
                                    {f.title}
                                </h3>

                                <p style={{ ...s.cardDesc, opacity: unlocked ? 1 : 0.5 }}>
                                    {f.description}
                                </p>

                                <div style={{
                                    ...s.statusBadge,
                                    backgroundColor: completed ? '#dcfce7' : unlocked ? '#dbeafe' : '#f1f5f9',
                                    borderColor: completed ? '#22c55e' : unlocked ? '#3b82f6' : '#94a3b8',
                                    color: completed ? '#16a34a' : unlocked ? '#2563eb' : '#64748b',
                                }}>
                                    {completed ? (t('stepDone') || '✅ Selesai')
                                        : unlocked ? (t('stepOpen') || '🔓 Buka')
                                            : (t('stepLocked') || '🔒 Terkunci')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={s.divider}>
                    <div style={s.divLine} />
                    <span style={s.divText}>{t('labelSpesifikasi')}</span>
                    <div style={s.divLine} />
                </div>

                {/* Specs */}
                <div style={s.specsBox}>
                    <div style={s.specsHead}>
                        <span style={s.specsHeadTxt}>{t('specsTitle')}</span>
                    </div>
                    <div style={s.specsBody}>
                        {specs.map((sp, i) => (
                            <div key={i} style={s.specItem}>
                                <span style={{ fontSize: 18, marginBottom: 3 }}>{sp.icon}</span>
                                <p style={{ ...s.specLabel, color: sp.color }}>{sp.label}</p>
                                <p style={s.specValue}>{sp.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Button Area */}
                <div style={s.btnArea}>
                    {!canStart && (
                        <div style={s.reqBox}>
                            <span style={{ fontSize: 12 }}>ℹ️</span>
                            <span style={s.reqText}>
                                {t('requirementHint') || 'Selesaikan Tahap 1 & 2 untuk membuka simulasi'}
                            </span>
                        </div>
                    )}

                    <button
                        style={{ ...s.startBtn, ...(!canStart ? s.startBtnOff : {}) }}
                        onClick={() => {
                            if (!canStart) {
                                showToast(t('requirementHint') || '🔒 Selesaikan Tahap 1 & 2 terlebih dahulu!', 'error');
                                return;
                            }
                            completeStep('step3');
                            navigate('/simulation');
                        }}
                        onMouseEnter={e => {
                            if (canStart) {
                                e.currentTarget.style.backgroundColor = '#1a3fa3';
                                e.currentTarget.style.transform = 'scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.4)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (canStart) {
                                e.currentTarget.style.backgroundColor = '#1e4fd8';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.3)';
                            }
                        }}
                    >
                        {canStart ? t('btnMulai') : `🔒 ${t('btnMulai')}`}
                    </button>
                </div>

            </div>
        </div>
    );
}

// ── Ornamen ──
function CornerOrnament() {
    return (
        <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
            <path d="M4 4 L4 24" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L24 4" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L16 16" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
            <circle cx="4" cy="4" r="3" fill="#2563eb" fillOpacity="0.5" />
            <circle cx="24" cy="4" r="1.5" fill="#2563eb" fillOpacity="0.3" />
            <circle cx="4" cy="24" r="1.5" fill="#2563eb" fillOpacity="0.3" />
        </svg>
    );
}

function FloatingDots() {
    const dots = [
        { top: '10%', left: '6%', size: 5, delay: '0s', dur: '4s' },
        { top: '18%', right: '4%', size: 3, delay: '1.2s', dur: '5s' },
        { top: '60%', left: '3%', size: 4, delay: '2s', dur: '3.5s' },
        { top: '70%', right: '6%', size: 3, delay: '0.6s', dur: '4.5s' },
        { top: '85%', left: '8%', size: 4, delay: '1.8s', dur: '6s' },
        { top: '88%', right: '4%', size: 3, delay: '2.8s', dur: '4s' },
    ];
    return (
        <>
            {dots.map((d, i) => (
                <div key={i} style={{
                    position: 'fixed', top: d.top, left: d.left, right: d.right,
                    width: d.size, height: d.size, borderRadius: '50%',
                    background: '#2563eb', opacity: 0.3,
                    animation: `floatDot ${d.dur} ${d.delay} ease-in-out infinite`,
                    zIndex: 2, pointerEvents: 'none',
                }} />
            ))}
        </>
    );
}

// ── Styles ──
const s = {
    // Full page, no scroll
    page: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#dce8f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgFixed: { position: 'fixed', inset: 0, zIndex: 1 },
    gridFixed: {
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: `
      linear-gradient(rgba(37,99,235,0.05) 1px,transparent 1px),
      linear-gradient(90deg,rgba(37,99,235,0.05) 1px,transparent 1px)
    `,
        backgroundSize: '48px 48px',
    },
    backBtn: {
        position: 'fixed', top: 14, left: 14, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(37,99,235,0.3)', borderRadius: 7,
        padding: '7px 14px', fontSize: 11, fontWeight: 700, color: '#1e3a8a',
        letterSpacing: '1px', cursor: 'pointer',
        fontFamily: "'Rajdhani',sans-serif", transition: 'all 0.2s ease',
    },
    langPos: { position: 'fixed', top: 14, right: 14, zIndex: 100 },

    // Layout utama — fit 1 layar
    layout: {
        position: 'relative', zIndex: 10,
        width: '100%',
        maxWidth: '1100px',
        height: '100vh',
        padding: '52px 24px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(6px, 1vh, 14px)',   // gap responsif
        overflow: 'hidden',
    },

    sectionLabel: {
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(37,99,235,0.25)', borderRadius: 999,
        padding: '5px 16px',
        boxShadow: '0 2px 10px rgba(37,99,235,0.08)',
    },
    sectionLabelText: {
        fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700,
        letterSpacing: '3px', color: '#1e3a8a',
        fontFamily: "'Rajdhani',sans-serif",
    },

    // Cards grid responsif
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 'clamp(8px,1.2vw,18px)',
        width: '100%',
        flexShrink: 0,
    },
    card: {
        position: 'relative',
        backgroundColor: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)', borderRadius: 12,
        padding: 'clamp(20px,2.5vh,28px) clamp(12px,1.5vw,18px) clamp(10px,1.5vh,16px)',
        boxShadow: '0 2px 14px rgba(37,99,235,0.08)',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.9)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 'clamp(4px,0.6vh,8px)',
    },
    cardHover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 32px rgba(37,99,235,0.18)',
        backgroundColor: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(37,99,235,0.2)',
    },
    cardDone: { border: '2px solid #22c55e', backgroundColor: 'rgba(240,253,244,0.9)' },
    cardLock: { opacity: 0.65, filter: 'grayscale(0.3)' },
    cardAccent: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        borderRadius: '12px 12px 0 0', transition: 'opacity 0.3s',
    },
    stepBadge: {
        position: 'absolute', top: 10, right: 10,
        width: 'clamp(20px,2vw,26px)', height: 'clamp(20px,2vw,26px)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'clamp(9px,1vw,11px)', fontWeight: 800, color: '#fff',
        fontFamily: "'Rajdhani',sans-serif", zIndex: 2,
    },
    lockLayer: {
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 12, zIndex: 3, pointerEvents: 'none',
    },
    iconBox: {
        width: 'clamp(36px,4vw,48px)', height: 'clamp(36px,4vw,48px)',
        backgroundColor: '#EEF4FF', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'opacity 0.3s',
    },
    cardTitle: {
        fontSize: 'clamp(9px,0.9vw,12px)', fontWeight: 800,
        letterSpacing: '0.5px', fontFamily: "'Rajdhani',sans-serif",
        transition: 'color 0.3s', margin: 0, lineHeight: 1.3,
    },
    cardDesc: {
        fontSize: 'clamp(9px,0.85vw,12px)', color: '#4B5563',
        lineHeight: 1.5, margin: 0, transition: 'opacity 0.3s', flex: 1,
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    statusBadge: {
        padding: '3px 8px', borderRadius: 20, border: '1px solid',
        fontSize: 'clamp(8px,0.75vw,10px)', fontWeight: 700,
        textAlign: 'center', fontFamily: "'Rajdhani',sans-serif",
        letterSpacing: '0.5px', transition: 'all 0.3s', flexShrink: 0,
    },

    // Divider
    divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', flexShrink: 0 },
    divLine: { flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,99,235,0.25))' },
    divText: {
        fontSize: 'clamp(8px,0.85vw,11px)', fontWeight: 700,
        letterSpacing: '2px', color: '#2563eb', fontFamily: "'Rajdhani',sans-serif",
    },

    // Specs
    specsBox: { width: '100%', borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 24px rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.12)' },
    specsHead: { backgroundColor: '#1e4fd8', padding: '8px 20px', textAlign: 'center' },
    specsHeadTxt: { color: '#fff', fontSize: 'clamp(9px,0.9vw,12px)', fontWeight: 700, letterSpacing: '3px', fontFamily: "'Rajdhani',sans-serif" },
    specsBody: {
        backgroundColor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        padding: 'clamp(8px,1.2vh,16px) 20px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: 'clamp(6px,1vw,14px)',
    },
    specItem: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        backgroundColor: '#F0F6FF', borderRadius: 10,
        padding: 'clamp(8px,1vh,14px) clamp(12px,2vw,22px)',
        minWidth: 'clamp(80px,9vw,110px)',
        border: '1px solid #E0EAFF',
    },
    specLabel: {
        fontSize: 'clamp(7px,0.75vw,10px)', fontWeight: 700,
        letterSpacing: '1px', margin: '0 0 2px 0',
        fontFamily: "'Rajdhani',sans-serif",
    },
    specValue: {
        fontSize: 'clamp(10px,1vw,13px)', fontWeight: 700,
        color: '#1e3a8a', margin: 0, fontFamily: "'Rajdhani',sans-serif",
    },

    // Button area
    btnArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(4px,0.6vh,8px)', flexShrink: 0, width: '100%' },
    reqBox: {
        display: 'flex', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,237,213,0.9)',
        border: '1px solid #fb923c', borderRadius: 8,
        padding: '6px 14px',
    },
    reqText: { fontSize: 'clamp(9px,0.85vw,11px)', fontWeight: 600, color: '#c2410c', fontFamily: "'Rajdhani',sans-serif" },
    startBtn: {
        backgroundColor: '#1e4fd8', color: '#fff',
        border: 'none', borderRadius: 9,
        padding: 'clamp(10px,1.5vh,16px) clamp(40px,6vw,80px)',
        fontSize: 'clamp(11px,1.2vw,15px)',
        fontWeight: 800, letterSpacing: '3px',
        cursor: 'pointer', transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        fontFamily: "'Rajdhani',sans-serif",
        whiteSpace: 'nowrap',
    },
    startBtnOff: { backgroundColor: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' },
    hintBox: {
        display: 'flex', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(37,99,235,0.2)', borderRadius: 20,
        padding: '4px 14px',
        fontSize: 'clamp(9px,0.85vw,11px)', fontWeight: 600,
        color: '#1e3a8a', letterSpacing: '0.5px',
        fontFamily: "'Rajdhani',sans-serif",
    },
};
