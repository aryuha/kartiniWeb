// src/components/pages/MateriPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useProgress } from '../../context/ProgressContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AtomBackground from '../three/AtomBackground';

// ── Data Materi ──
const getMateriData = (t) => [
    {
        id: 1,
        icon: '⚛️',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        title: t('materi1Title'),
        content: t('materi1Content'),
        tag: 'OVERVIEW',
        image: '/images/brin.png',
    },
    {
        id: 2,
        icon: '📜',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        title: t('materi2Title'),
        content: t('materi2Content'),
        tag: 'SEJARAH',
    },
    {
        id: 3,
        icon: '🔬',
        color: '#10B981',
        bgColor: '#ECFDF5',
        title: t('materi3Title'),
        content: t('materi3Content'),
        tag: 'TEKNOLOGI',
    },
    {
        id: 4,
        icon: '⚙️',
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        title: t('materi4Title'),
        content: t('materi4Content'),
        tag: 'KOMPONEN',
    },
    {
        id: 5,
        icon: '🎮',
        color: '#EF4444',
        bgColor: '#FEF2F2',
        title: t('materi5Title'),
        content: t('materi5Content'),
        tag: 'OPERASI',
    },
    {
        id: 6,
        icon: '⚡',
        color: '#F97316',
        bgColor: '#FFF7ED',
        title: t('materi6Title'),
        content: t('materi6Content'),
        tag: 'FISIKA',
    },
    {
        id: 7,
        icon: '🚨',
        color: '#DC2626',
        bgColor: '#FEF2F2',
        title: t('materi7Title'),
        content: t('materi7Content'),
        tag: 'KESELAMATAN',
    },
    {
        id: 8,
        icon: '💙',
        color: '#06B6D4',
        bgColor: '#ECFEFF',
        title: t('materi8Title'),
        content: t('materi8Content'),
        tag: 'FENOMENA',
    },
    {
        id: 9,
        icon: '🏭',
        color: '#059669',
        bgColor: '#ECFDF5',
        title: t('materi9Title'),
        content: t('materi9Content'),
        tag: 'APLIKASI',
    },
    {
        id: 10,
        icon: '🛡️',
        color: '#1D4ED8',
        bgColor: '#EFF6FF',
        title: t('materi10Title'),
        content: t('materi10Content'),
        tag: 'REGULASI',
    },
];

// ── Corner Ornament ──
function CornerOrnament() {
    return (
        <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
            <path d="M4 4 L4 24" stroke="#2563eb" strokeWidth="2"
                strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L24 4" stroke="#2563eb" strokeWidth="2"
                strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M4 4 L16 16" stroke="#2563eb" strokeWidth="1"
                strokeOpacity="0.2" strokeLinecap="round" />
            <circle cx="4" cy="4" r="3" fill="#2563eb" fillOpacity="0.5" />
            <circle cx="24" cy="4" r="1.5" fill="#2563eb" fillOpacity="0.3" />
            <circle cx="4" cy="24" r="1.5" fill="#2563eb" fillOpacity="0.3" />
        </svg>
    );
}

// ── Floating Dots ──
function FloatingDots() {
    const dots = [
        { top: '8%', left: '5%', size: 5, delay: '0s', dur: '4s' },
        { top: '15%', right: '4%', size: 3, delay: '1.2s', dur: '5s' },
        { top: '50%', left: '2%', size: 4, delay: '2s', dur: '3.5s' },
        { top: '65%', right: '5%', size: 3, delay: '0.6s', dur: '4.5s' },
        { top: '82%', left: '7%', size: 4, delay: '1.8s', dur: '6s' },
        { top: '88%', right: '3%', size: 3, delay: '2.8s', dur: '4s' },
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

// ── Progress Reading Bar ──
function ReadingProgress({ read, total }) {
    const { t } = useLanguage();
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    const isComplete = pct === 100;
    return (
        <div style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: 12,
            padding: '10px 16px',
            border: '1px solid rgba(37,99,235,0.15)',
            boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
            flexShrink: 0,
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 6,
            }}>
                <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '2px',
                    color: '#1e3a8a', fontFamily: "'Rajdhani',sans-serif",
                }}>
                    {t('materiProgressLabel') || 'PROGRESS MEMBACA'}
                </span>
                <span style={{
                    fontSize: 11, fontWeight: 800, color: '#2563eb',
                    fontFamily: "'Rajdhani',sans-serif",
                }}>
                    {read}/{total} ({pct}%)
                </span>
            </div>
            <div style={{
                height: 5, backgroundColor: '#e2e8f0',
                borderRadius: 3, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? '#22c55e' : '#2563eb',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                }} />
            </div>
        </div>
    );
}

// ── Materi Card ──
// ── Materi Card (hanya header, tanpa dropdown) ──
function MateriCard({ materi, index, isRead, onRead, onOpenModal }) {
    const [hovered, setHovered] = useState(false)
    const { t } = useLanguage()

    const handleClick = () => {
        if (!isRead) onRead(materi.id)
        onOpenModal(materi)
    }

    return (
        <div
            style={{
                position: 'relative',
                alignSelf: 'start',
                backgroundColor: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(12px)',
                borderRadius: 10,
                padding: 0,
                border: isRead
                    ? '1.5px solid #22c55e'
                    : hovered
                        ? `1.5px solid ${materi.color}`
                        : '1.5px solid rgba(37,99,235,0.15)',
                boxShadow: isRead
                    ? '0 0 18px rgba(34,197,94,0.25)'
                    : hovered
                        ? `0 0 22px ${materi.color}55`
                        : '0 2px 12px rgba(37,99,235,0.08)',
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'pointer',
                overflow: 'hidden',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
        >
            {/* Neon Accent Line */}
            <div style={{
                height: 3,
                background: isRead
                    ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                    : `linear-gradient(90deg,transparent,${materi.color},transparent)`,
                boxShadow: hovered ? `0 0 10px ${materi.color}` : 'none',
                transition: 'all 0.3s',
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
            }}>
                {/* Cyber Step Badge */}
                <div style={{
                    width: 32, height: 32,
                    borderRadius: 6,
                    backgroundColor: isRead ? '#22c55e' : '#EEF4FF',
                    border: `1.5px solid ${isRead ? '#16a34a' : materi.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    fontFamily: "'Rajdhani',sans-serif",
                    color: isRead ? '#fff' : materi.color,
                    boxShadow: hovered ? `0 0 12px ${materi.color}55` : 'none',
                    transition: 'all 0.3s',
                }}>
                    {isRead ? '✓' : index + 1}
                </div>

                {/* Icon */}
                <div style={{
                    width: 40, height: 40,
                    borderRadius: 8,
                    backgroundColor: `${materi.color}15`,
                    border: `1px solid ${materi.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, transition: 'all 0.3s',
                }}>
                    {materi.icon}
                </div>

                {/* Title & Tag */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                        <span style={{
                            fontSize: 8, fontWeight: 700, letterSpacing: '2px',
                            color: materi.color, fontFamily: "'Rajdhani',sans-serif",
                            border: `1px solid ${materi.color}55`,
                            padding: '2px 8px', borderRadius: 4,
                            backgroundColor: `${materi.color}10`,
                        }}>
                            {materi.tag}
                        </span>
                        {isRead && (
                            <span style={{
                                fontSize: 8, fontWeight: 700, letterSpacing: '1px',
                                color: '#16a34a', backgroundColor: '#dcfce7',
                                border: '1px solid #22c55e55',
                                padding: '2px 8px', borderRadius: 4,
                                fontFamily: "'Rajdhani',sans-serif",
                            }}>
                                {t('materiTagDone') || 'SELESAI'}
                            </span>
                        )}
                    </div>
                    <h3 style={{
                        margin: 0,
                        fontSize: 'clamp(11px,1vw,14px)',
                        fontWeight: 800,
                        color: isRead ? '#16a34a' : hovered ? materi.color : '#1e3a8a',
                        fontFamily: "'Rajdhani',sans-serif",
                        transition: 'color 0.3s',
                    }}>
                        {materi.title}
                    </h3>
                </div>

                {/* Open Icon (bukan dropdown lagi) */}
                <div style={{
                    fontSize: 14,
                    color: materi.color,
                    transition: 'transform 0.3s ease',
                    transform: hovered ? 'scale(1.2)' : 'scale(1)',
                }}>
                    📖
                </div>
            </div>
        </div>
    )
}

// ── Materi Modal (Pop-up) ──
function MateriModal({ materi, isRead, onRead, onClose }) {
    const { t } = useLanguage()
    const [imgError, setImgError] = useState(false)

    if (!materi) return null

    // Tutup modal saat klik background
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    // Tutup modal dengan ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
                animation: 'fadeIn 0.2s ease',
                padding: '20px',
            }}
        >
            {/* Modal Card */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                maxHeight: '85vh',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                border: `2px solid ${materi.color}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 30px ${materi.color}30`,
                overflow: 'hidden',
                animation: 'modalSlideUp 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* Top Accent Line */}
                <div style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${materi.color}, ${materi.color}88, ${materi.color})`,
                    boxShadow: `0 0 15px ${materi.color}`,
                }} />

                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '18px 20px',
                    borderBottom: `1px solid ${materi.color}20`,
                    flexShrink: 0,
                }}>
                    {/* Icon */}
                    <div style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: `${materi.color}15`,
                        border: `1.5px solid ${materi.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                    }}>
                        {materi.icon}
                    </div>

                    {/* Title & Tag */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            <span style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: '2px',
                                color: materi.color, fontFamily: "'Rajdhani',sans-serif",
                                border: `1px solid ${materi.color}55`,
                                padding: '2px 10px', borderRadius: 4,
                                backgroundColor: `${materi.color}10`,
                            }}>
                                {materi.tag}
                            </span>
                            {isRead && (
                                <span style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: '1px',
                                    color: '#16a34a', backgroundColor: '#dcfce7',
                                    border: '1px solid #22c55e55',
                                    padding: '2px 10px', borderRadius: 4,
                                    fontFamily: "'Rajdhani',sans-serif",
                                }}>
                                    {t('materiTagDone') || 'SELESAI'}
                                </span>
                            )}
                        </div>
                        <h2 style={{
                            margin: 0,
                            fontSize: 'clamp(14px, 1.5vw, 18px)',
                            fontWeight: 800,
                            color: materi.color,
                            fontFamily: "'Rajdhani',sans-serif",
                        }}>
                            {materi.title}
                        </h2>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            border: `1.5px solid ${materi.color}40`,
                            backgroundColor: `${materi.color}10`,
                            color: materi.color,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = `${materi.color}25`
                            e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = `${materi.color}10`
                            e.currentTarget.style.transform = 'scale(1)'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px 20px',
                }}>

                    {/* Gambar */}
                    {materi.image && !imgError && (
                        <div style={{
                            width: '100%',
                            marginBottom: 16,
                            borderRadius: 10,
                            overflow: 'hidden',
                            border: `1px solid ${materi.color}30`,
                            boxShadow: `0 4px 16px ${materi.color}20`,
                        }}>
                            <img
                                src={materi.image}
                                alt={materi.title}
                                onError={() => setImgError(true)}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    display: 'block',
                                }}
                            />
                        </div>
                    )}

                    {/* Konten Teks */}
                    <p style={{
                        margin: 0,
                        fontSize: 'clamp(12px, 1vw, 14px)',
                        color: '#4B5563',
                        lineHeight: 1.8,
                        fontFamily: "'Rajdhani',sans-serif",
                    }}>
                        {materi.content}
                    </p>
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '14px 20px',
                    borderTop: `1px solid ${materi.color}15`,
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    {!isRead ? (
                        <button
                            onClick={() => onRead(materi.id)}
                            style={{
                                backgroundColor: materi.color,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 24px',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '1.5px',
                                cursor: 'pointer',
                                fontFamily: "'Rajdhani',sans-serif",
                                transition: 'all 0.2s',
                                boxShadow: `0 4px 12px ${materi.color}40`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05)'
                                e.currentTarget.style.boxShadow = `0 6px 20px ${materi.color}60`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.boxShadow = `0 4px 12px ${materi.color}40`
                            }}
                        >
                            ✓ {t('materiMarkRead') || 'TANDAI DIBACA'}
                        </button>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#16a34a',
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Rajdhani',sans-serif",
                        }}>
                            <span style={{
                                width: 22, height: 22,
                                borderRadius: 6,
                                backgroundColor: '#22c55e',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: 11,
                            }}>✓</span>
                            {t('materiTagDone') || 'SELESAI DIBACA'}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#64748b',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 8,
                            padding: '10px 24px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            fontFamily: "'Rajdhani',sans-serif",
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#94a3b8'
                            e.currentTarget.style.color = '#334155'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.color = '#64748b'
                        }}
                    >
                        {t('materiClose') || 'TUTUP'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main ──
export default function MateriPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { completeStep } = useProgress();
    const [readItems, setReadItems] = useState(new Set());
    const hasCompletedRef = useRef(false);
    const [modalMateri, setModalMateri] = useState(null)
    const materiData = getMateriData(t);
    const totalMateri = materiData.length;

    // Buka modal
    const handleOpenModal = (materi) => {
        setModalMateri(materi)
    }

    // Tutup modal
    const handleCloseModal = () => {
        setModalMateri(null)
    }

    // Handle back history
    useEffect(() => {
        const onPop = () => navigate('/prepare');
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    const handleRead = (id) => {
        setReadItems(prev => new Set([...prev, id]));
    };

    const allRead = readItems.size === totalMateri;

    // Auto complete step1 when all read
    useEffect(() => {
        if (allRead && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            completeStep('step1');
        }
    }, [allRead]);

    const handleBack = () => navigate('/prepare');

    const handleMarkAllDone = () => {
        const allIds = new Set(materiData.map(m => m.id));
        setReadItems(allIds);
        if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            completeStep('step1');
        }
    };

    return (
        <div style={s.page}>
            <style>{`
                @keyframes floatDot {
                    0%,100% { transform:translateY(0); opacity:0.35; }
                    50% { transform:translateY(-8px); opacity:0.7; }
                }
                @keyframes fadeIn {
                    from { opacity:0; }
                    to { opacity:1; }
                }
                @keyframes modalSlideUp {
                    from { opacity:0; transform:translateY(30px) scale(0.95); }
                    to { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes pulseGreen {
                    0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,0.4); }
                    50% { box-shadow:0 0 0 6px rgba(34,197,94,0); }
                }
                @keyframes slideDown {
                    from { opacity:0; transform:translateY(-20px); }
                    to { opacity:1; transform:translateY(0); }
                }
                * { box-sizing:border-box; }
                ::-webkit-scrollbar { width:5px; }
                ::-webkit-scrollbar-track { background:rgba(37,99,235,0.05); }
                ::-webkit-scrollbar-thumb {
                background:rgba(37,99,235,0.25); border-radius:10px;
                }
            `}</style>

            {/* Background */}
            <div style={s.bgFixed}><AtomBackground /></div>
            <div style={s.gridFixed} />

            {/* Corner Ornaments */}
            <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 5, pointerEvents: 'none' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', top: 16, right: 80, zIndex: 5, pointerEvents: 'none', transform: 'scaleX(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 5, pointerEvents: 'none', transform: 'scaleY(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 5, pointerEvents: 'none', transform: 'scale(-1,-1)' }}>
                <CornerOrnament />
            </div>

            <FloatingDots />

            <div style={s.langPos}><LanguageSwitcher /></div>

            {/* Main Layout */}
            <div style={s.layout}>

                {/* Section Label */}
                <div style={s.sectionLabel}>
                    <span style={{ color: '#2563eb', fontSize: 6 }}>◆</span>
                    <span style={s.sectionLabelText}>
                        {t('materiPageTitle') || 'MATERI REAKTOR KARTINI'}
                    </span>
                    <span style={{ color: '#2563eb', fontSize: 6 }}>◆</span>
                </div>

                {/* Subtitle */}
                <div style={s.subtitleBox}>
                    <span style={s.subtitleText}>
                        {t('materiPageSubtitle') || 'PENGETAHUAN DASAR REAKTOR NUKLIR'}
                    </span>
                </div>

                {/* Reading Progress */}
                <ReadingProgress read={readItems.size} total={totalMateri} />

                {/* All Done Banner */}
                {allRead && (
                    <div style={s.doneBanner}>
                        <span style={{ fontSize: 16 }}>🎉</span>
                        <span style={s.doneBannerText}>
                            {t('materiDoneBanner')}
                        </span>
                    </div>
                )}

                {/* Scrollable Cards Area */}
                <div style={s.scrollArea}>

                    {/* Two Column Grid */}
                    <div style={s.cardsGrid}>
                        {materiData.map((materi, index) => (
                            <MateriCard
                                key={materi.id}
                                materi={materi}
                                index={index}
                                isRead={readItems.has(materi.id)}
                                onRead={handleRead}
                                onOpenModal={handleOpenModal}
                            />
                        ))}
                    </div>

                    {/* Bottom Actions */}
                    <div style={s.bottomActions}>
                        {!allRead ? (
                            <button
                                style={s.markAllBtn}
                                onClick={handleMarkAllDone}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#1a3fa3';
                                    e.currentTarget.style.transform = 'scale(1.03)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#1e4fd8';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                ✓ {t('materiReadAll') || 'TANDAI SEMUA SELESAI'}
                            </button>
                        ) : (
                            <button
                                style={s.doneBtn}
                                onClick={handleBack}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#15803d';
                                    e.currentTarget.style.transform = 'scale(1.03)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#16a34a';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {t('materiBackGuide') || '← KEMBALI KE PANDUAN'}
                            </button>
                        )}
                    </div>
                </div>
                {modalMateri && (
                    <MateriModal
                        materi={modalMateri}
                        isRead={readItems.has(modalMateri.id)}
                        onRead={handleRead}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        </div>
    );
}

// ── Styles ──
const s = {
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
        backgroundColor: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 7, padding: '7px 14px',
        fontSize: 11, fontWeight: 700, color: '#1e3a8a',
        letterSpacing: '1px', cursor: 'pointer',
        fontFamily: "'Rajdhani',sans-serif",
        transition: 'all 0.2s ease',
    },
    langPos: { position: 'fixed', top: 14, right: 14, zIndex: 100 },

    // Main layout
    layout: {
        position: 'relative', zIndex: 10,
        width: '100%',
        maxWidth: '1000px',
        height: '100vh',
        padding: '52px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(6px,1vh,12px)',
        overflow: 'hidden',
    },

    // Section Label
    sectionLabel: {
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(37,99,235,0.25)',
        borderRadius: 999, padding: '5px 16px',
        boxShadow: '0 2px 10px rgba(37,99,235,0.08)',
        animation: 'slideDown 0.5s ease',
    },
    sectionLabelText: {
        fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700,
        letterSpacing: '3px', color: '#1e3a8a',
        fontFamily: "'Rajdhani',sans-serif",
    },

    // Subtitle
    subtitleBox: {
        flexShrink: 0,
        animation: 'slideDown 0.6s ease',
    },
    subtitleText: {
        fontSize: 'clamp(8px,0.85vw,11px)', fontWeight: 600,
        letterSpacing: '2px', color: '#2563eb',
        fontFamily: "'Rajdhani',sans-serif",
        opacity: 0.8,
    },

    // Done Banner
    doneBanner: {
        width: '100%', flexShrink: 0,
        backgroundColor: '#dcfce7',
        border: '1.5px solid #22c55e',
        borderRadius: 10, padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'slideDown 0.4s ease',
    },
    doneBannerText: {
        fontSize: 'clamp(9px,0.9vw,12px)', fontWeight: 700,
        color: '#16a34a', fontFamily: "'Rajdhani',sans-serif",
    },

    // Scrollable area
    scrollArea: {
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(8px,1vh,14px)',
        paddingRight: 4,
        paddingBottom: 8,
    },

    // Cards grid - 2 columns
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'clamp(8px,1.2vw,16px)',
        width: '100%',
        alignItems: 'start',
    },

    // Bottom actions
    bottomActions: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 4,
        paddingBottom: 8,
        flexShrink: 0,
    },

    markAllBtn: {
        backgroundColor: '#1e4fd8', color: '#fff',
        border: 'none', borderRadius: 9,
        padding: 'clamp(10px,1.5vh,14px) clamp(32px,5vw,64px)',
        fontSize: 'clamp(10px,1vw,13px)',
        fontWeight: 800, letterSpacing: '2px',
        cursor: 'pointer', transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        fontFamily: "'Rajdhani',sans-serif",
    },

    doneBtn: {
        backgroundColor: '#16a34a', color: '#fff',
        border: 'none', borderRadius: 9,
        padding: 'clamp(10px,1.5vh,14px) clamp(32px,5vw,64px)',
        fontSize: 'clamp(10px,1vw,13px)',
        fontWeight: 800, letterSpacing: '2px',
        cursor: 'pointer', transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
        fontFamily: "'Rajdhani',sans-serif",
    },
};