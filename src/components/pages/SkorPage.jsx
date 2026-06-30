// src/components/pages/SkorPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useProgress } from '../../context/ProgressContext'
import { saveScore } from '../../services/api'
import AtomBackground from '../three/AtomBackground'
//icon
import finishIcon from '../../assets/icon/flags.svg'
import reloadIcon from '../../assets/icon/reload.svg'

// ── Corner Ornament ──
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
    )
}

// ── Floating Dots ──
function FloatingDots() {
    const dots = [
        { top: '10%', left: '6%', size: 5, delay: '0s', dur: '4s' },
        { top: '18%', right: '4%', size: 3, delay: '1.2s', dur: '5s' },
        { top: '60%', left: '3%', size: 4, delay: '2s', dur: '3.5s' },
        { top: '70%', right: '6%', size: 3, delay: '0.6s', dur: '4.5s' },
        { top: '85%', left: '8%', size: 4, delay: '1.8s', dur: '6s' },
        { top: '88%', right: '4%', size: 3, delay: '2.8s', dur: '4s' },
    ]
    return (
        <>
            {dots.map((d, i) => (
                <div key={i} style={{
                    position: 'fixed',
                    top: d.top, left: d.left, right: d.right,
                    width: d.size, height: d.size,
                    borderRadius: '50%',
                    background: '#2563eb',
                    opacity: 0.3,
                    animation: `floatDot ${d.dur} ${d.delay} ease-in-out infinite`,
                    zIndex: 3, pointerEvents: 'none',
                }} />
            ))}
        </>
    )
}

// ── Komponen Rincian Skor Per Fase ──
function PhaseScoreBreakdown({ phaseScores, phases }) {
    if (!phases || phases.length === 0) return null

    const maxPerPhase = 60 * 10  // 60 detik × 10 poin maks

    return (
        <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(147,197,253,0.6)',
            borderRadius: 14,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,80,160,0.08)',
        }}>
            <p style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 9, fontWeight: 700,
                color: '#60a5fa', letterSpacing: 2.5,
                margin: '0 0 14px 0',
            }}>RINCIAN SKOR PER FASE</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {phases.map((phase, i) => {
                    const pts = phaseScores[i] || 0
                    const fillPct = Math.min(100, Math.round((pts / maxPerPhase) * 100))
                    const barColor = fillPct >= 90 ? '#22c55e'
                        : fillPct >= 70 ? '#3b82f6'
                            : fillPct >= 50 ? '#f59e0b'
                                : '#f97316'
                    return (
                        <div key={i}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 5,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 22, height: 22,
                                        borderRadius: 5,
                                        background: barColor,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 9, fontWeight: 700, color: '#fff',
                                    }}>
                                        {i + 1}
                                    </div>
                                    <span style={{
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 10, fontWeight: 700,
                                        color: '#334466',
                                    }}>
                                        Target: {phase.target} kW
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 14, fontWeight: 900,
                                        color: barColor,
                                    }}>
                                        {pts}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 9, color: '#99aabb',
                                        marginLeft: 4,
                                    }}>
                                        / {maxPerPhase} pts ({fillPct}%)
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                height: 8,
                                background: '#e2e8f0',
                                borderRadius: 4,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${fillPct}%`,
                                    background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                                    borderRadius: 4,
                                    transition: 'width 0.8s ease',
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Total di bawah */}
            <div style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 10, color: '#7799bb',
                }}>TOTAL SKOR</span>
                <span style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 20, fontWeight: 900,
                    color: '#0055aa',
                }}>
                    {phaseScores.reduce((sum, s) => sum + (s || 0), 0)}
                    <span style={{
                        fontSize: 10, color: '#99aabb',
                        fontWeight: 400, marginLeft: 6,
                    }}>
                        / 3000 poin
                    </span>
                </span>
            </div>
        </div>
    )
}

// ── Main SkorPage ──
export default function SkorPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useLanguage()
    const { completeStep } = useProgress()

    const sessionData = location.state || {}
    const {
        score = 0,
        penaltyTotal = 0,
        bonus = 0,
        penaltyLog = [],
        timeElapsed = 0,
        maxPowerKw = 0,
        nickname = '—',
        status = 'SELESAI',
        isWin = false,
        phaseScores = [],
        phases = [],
    } = sessionData

    const getGrade = (s) => {
        // Skor baru maks 3000 poin
        const pct = (s / 3000) * 100
        if (pct >= 90) return { grade: 'S', color: '#22c55e', label: t('skorPerfect') }
        if (pct >= 70) return { grade: 'A', color: '#3b82f6', label: t('skorGreat') }
        if (pct >= 50) return { grade: 'B', color: '#f59e0b', label: t('skorGood') }
        if (pct >= 30) return { grade: 'C', color: '#f97316', label: t('skorOk') }
        return { grade: 'D', color: '#ef4444', label: t('skorPractice') }
    }

    const gradeInfo = getGrade(score)

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${String(s).padStart(2, '0')}`
    }

    useEffect(() => {
        if (!sessionData.score) return
        saveScore({ nickname, score })
    }, [])

    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        // ✅ Ubah limit dari 10 ke 50
        fetch('/api/scores/leaderboard?limit=50')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setLeaderboard(data) })
            .catch(() => { })
    }, [])

    const getStatusLabel = () => {
        if (isWin) return t('skorWin')
        if (status === 'WAKTU HABIS' || status === "TIME'S UP") return t('skorTimeout')
        return t('skorDone')
    }

    const summaryItems = [
        { label: t('skorLabelStatus'), value: getStatusLabel(), color: isWin ? '#16a34a' : '#0055aa' },
        { label: t('skorLabelSkor'), value: score.toString(), color: gradeInfo.color },
        { label: t('skorLabelPenalty'), value: `-${penaltyTotal}`, color: penaltyTotal > 0 ? '#cc2200' : '#22aa44' },
        { label: t('skorLabelOperator'), value: nickname, color: '#1144cc' },
    ]

    return (
        <div style={sk.page}>
            {/* ── Keyframes ── */}
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0);   opacity: 0.35; }
          50%       { transform: translateY(-8px); opacity: 0.7;  }
        }

        /* ✅ Sticky header leaderboard */
        .lb-sticky-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          padding-bottom: 8px;
          margin-bottom: 2px;
          border-bottom: 1px solid rgba(147,197,253,0.5);
        }

        /* ✅ Scrollable list leaderboard */
        .lb-scroll-list {
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          padding-right: 2px;
        }

        .lb-scroll-list::-webkit-scrollbar {
          width: 4px;
        }
        .lb-scroll-list::-webkit-scrollbar-track {
          background: rgba(147,197,253,0.15);
          border-radius: 4px;
        }
        .lb-scroll-list::-webkit-scrollbar-thumb {
          background: rgba(37,99,235,0.3);
          border-radius: 4px;
        }
        .lb-scroll-list::-webkit-scrollbar-thumb:hover {
          background: rgba(37,99,235,0.5);
        }
      `}</style>

            {/* ── Background ── */}
            <div style={sk.bgFixed}>
                <AtomBackground />
            </div>
            <div style={sk.gridFixed} />

            {/* ── Corner Ornaments ── */}
            <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 5, pointerEvents: 'none' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 5, pointerEvents: 'none', transform: 'scaleX(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 5, pointerEvents: 'none', transform: 'scaleY(-1)' }}>
                <CornerOrnament />
            </div>
            <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 5, pointerEvents: 'none', transform: 'scale(-1,-1)' }}>
                <CornerOrnament />
            </div>

            {/* ── Floating Dots ── */}
            <FloatingDots />

            {/* ── Konten Utama ── */}
            <div style={sk.content}>

                {/* HEADER */}
                <div style={sk.header}>
                    <img src={finishIcon} alt="Finish" style={sk.flagIcon} />
                    <h1 style={sk.title}>{t('skorTitle')}</h1>
                    <p style={sk.subtitle}>{t('skorSubtitle')}</p>
                </div>

                {/* MAIN WRAPPER */}
                <div style={sk.mainWrapper}>

                    {/* BODY: 2 KOLOM */}
                    <div style={sk.body}>

                        {/* KOLOM KIRI */}
                        <div style={sk.colLeft}>

                            {/* Score Card */}
                            <div style={sk.scoreCard} >
                                <div style={sk.scoreCardAccent} />
                                <div style={sk.scoreCircleWrap}>
                                    <div style={{
                                        ...sk.scoreCircle,
                                        background: `linear-gradient(135deg, ${gradeInfo.color}cc, ${gradeInfo.color})`,
                                    }}>
                                        <span style={sk.scoreNumber}>{score}</span>
                                        <span style={sk.scoreLabel}>{t('skorLabelSkor')}</span>
                                    </div>
                                </div>
                                <div style={sk.scoreTextWrap}>
                                    <p style={sk.scoreMessage}>{t('skorThanks')}</p>
                                </div>
                            </div>

                            {/* Summary Grid */}
                            <div style={sk.summaryCard}>
                                <p style={sk.cardTitle}>{t('skorSummaryTitle')}</p>
                                <div style={sk.summaryGrid}>
                                    {summaryItems.map((item, i) => (
                                        <div key={i} style={sk.summaryItem}>
                                            <span style={sk.summaryLabel}>{item.label}</span>
                                            <span style={{ ...sk.summaryValue, color: item.color }}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rincian Skor Per Fase */}
                            {phases.length > 0 && (
                                <PhaseScoreBreakdown phaseScores={phaseScores} phases={phases} />
                            )}
                        </div>

                        {/* KOLOM KANAN: Leaderboard */}
                        <div style={sk.colRight}>
                            {/* 
                ✅ leaderCard sekarang pakai display flex + flexDirection column
                   supaya sticky header bisa bekerja dengan benar di dalam scroll container
              */}
                            <div style={sk.leaderCard}>

                                {/* ✅ Sticky Header Leaderboard */}
                                <div className="lb-sticky-header">
                                    <p style={sk.cardTitle}>{t('skorLeaderboard')}</p>
                                    {/* ── TAMBAH: Header kolom leaderboard ── */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '4px 8px',
                                        marginTop: 2,
                                    }}>
                                        {/* Rank */}
                                        <div style={{ width: 24, flexShrink: 0 }} />

                                        {/* Username label */}
                                        <span style={{
                                            flex: 1,
                                            fontFamily: "'Orbitron',monospace",
                                            fontSize: 7,
                                            fontWeight: 700,
                                            color: '#99aabb',
                                            letterSpacing: 1.5,
                                            textTransform: 'uppercase',
                                        }}>
                                            Username
                                        </span>

                                        {/* Penalty label */}
                                        <span style={{
                                            fontFamily: "'Orbitron',monospace",
                                            fontSize: 7,
                                            fontWeight: 700,
                                            color: '#99aabb',
                                            letterSpacing: 1.5,
                                            textTransform: 'uppercase',
                                            flexShrink: 0,
                                            minWidth: 36,
                                            textAlign: 'center',
                                        }}>
                                            {t('skorLabelPenalty')}
                                        </span>

                                        {/* Score label */}
                                        <span style={{
                                            fontFamily: "'Orbitron',monospace",
                                            fontSize: 7,
                                            fontWeight: 700,
                                            color: '#99aabb',
                                            letterSpacing: 1.5,
                                            textTransform: 'uppercase',
                                            flexShrink: 0,
                                            minWidth: 36,
                                            textAlign: 'right',
                                        }}>
                                            Score
                                        </span>
                                    </div>

                                    {/* Garis pemisah tipis */}
                                    <div style={{
                                        height: 1,
                                        background: 'rgba(147,197,253,0.4)',
                                        marginTop: 4,
                                        borderRadius: 1,
                                    }} />
                                </div>

                                {/* ✅ Scrollable List */}
                                <div className="lb-scroll-list">
                                    {leaderboard.length === 0 ? (
                                        <p style={{
                                            fontFamily: "'Orbitron',monospace",
                                            fontSize: 9, color: '#aabbcc',
                                            textAlign: 'center', margin: '20px 0',
                                            letterSpacing: 1,
                                        }}>
                                            {t('skorNoData')}
                                        </p>
                                    ) : (
                                        leaderboard.map((entry, i) => (
                                            <div key={i} style={{
                                                ...sk.lbRow,
                                                background: entry.username === nickname
                                                    ? 'rgba(0,85,170,0.06)' : 'transparent',
                                                border: entry.username === nickname
                                                    ? '1px solid rgba(0,85,170,0.15)' : '1px solid transparent',
                                            }}>
                                                {/* Rank Badge */}
                                                <div style={{
                                                    ...sk.rankBadge,
                                                    background: i === 0 ? '#f59e0b'
                                                        : i === 1 ? '#94a3b8'
                                                            : i === 2 ? '#cd7c3a' : '#e0eaf2',
                                                    color: i < 3 ? '#fff' : '#7799bb',
                                                }}>
                                                    {i + 1}
                                                </div>

                                                {/* Name */}
                                                <div style={sk.lbName}>
                                                    <span style={{
                                                        fontFamily: "'Orbitron',monospace",
                                                        fontSize: 10, fontWeight: 700,
                                                        color: entry.username === nickname ? '#0055aa' : '#334466',
                                                    }}>
                                                        {entry.username}
                                                    </span>
                                                    {entry.username === nickname && (
                                                        <span style={sk.youBadge}>{t('skorYou')}</span>
                                                    )}
                                                </div>

                                                {/* Penalty */}
                                                <span style={sk.lbPenalty}>
                                                    -{entry.scram_count || 0}
                                                </span>

                                                {/* Score */}
                                                <span style={{
                                                    ...sk.lbScore,
                                                    color: i === 0 ? '#f59e0b'
                                                        : i === 1 ? '#64748b'
                                                            : i === 2 ? '#cd7c3a' : '#334466',
                                                }}>
                                                    {entry.score}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={sk.actions}>
                        <button
                            onClick={() => { completeStep('step3'); navigate('/prepare') }}
                            style={sk.btnSecondary}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.98)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.88)'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            ← {t('skorPanduan')}
                        </button>

                        <button
                            onClick={() => navigate('/simulation')}
                            style={sk.btnPrimary}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,85,170,0.55)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,85,170,0.35)'
                            }}
                        >
                            <img src={reloadIcon} alt="Reload"
                                style={{ width: 13, height: 13, objectFit: 'contain' }} />
                            {t('skorRestart')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Styles ──
const sk = {
    page: {
        width: '100vw', height: '100vh',
        position: 'relative', overflow: 'hidden',
        backgroundColor: '#dce8f5',
        fontFamily: "'Orbitron',monospace",
    },
    bgFixed: {
        position: 'fixed', inset: 0, zIndex: 1,
    },
    gridFixed: {
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: `
      linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)
    `,
        backgroundSize: '48px 48px',
    },
    content: {
        position: 'relative', zIndex: 10,
        width: '100%', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 40px 20px',
        gap: 14, overflow: 'hidden',
    },
    header: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
        flexShrink: 0, textAlign: 'center',
    },
    flagIcon: {
        width: 100, height: 100, objectFit: 'contain',
        filter: 'drop-shadow(0 2px 6px rgba(0,85,170,0.2))',
        marginBottom: 2,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 20, fontWeight: 800,
        color: '#0044aa', letterSpacing: 3, margin: 0,
    },
    subtitle: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, color: '#5577aa',
        letterSpacing: 2, margin: 0,
        textTransform: 'uppercase',
    },
    mainWrapper: {
        flex: 1, display: 'flex', flexDirection: 'column',
        gap: 12, width: '100%', maxWidth: 960, minHeight: 0,
    },
    body: {
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16, minHeight: 0,
    },
    colLeft: {
        display: 'flex', flexDirection: 'column',
        gap: 10, minHeight: 0, overflowY: 'auto',
    },
    colRight: {
        display: 'flex', flexDirection: 'column', minHeight: 0,
    },
    scoreCard: {
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(147,197,253,0.6)',
        borderRadius: 14, padding: '20px 16px 16px',
        boxShadow: '0 4px 20px rgba(0,80,160,0.08)',
        flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10,
    },
    scoreCardAccent: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)',
        borderRadius: '14px 14px 0 0',
    },
    scoreCircleWrap: {
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', marginTop: 4,
    },
    scoreCircle: {
        width: 90, height: 90, borderRadius: '50%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(0,80,160,0.25)',
    },
    scoreNumber: {
        fontSize: 28, fontWeight: 900,
        color: '#fff', lineHeight: 1,
        fontFamily: "'Orbitron',monospace",
    },
    scoreLabel: {
        fontSize: 7, color: 'rgba(255,255,255,0.85)',
        letterSpacing: 1, marginTop: 3,
        fontFamily: "'Orbitron',monospace",
    },
    scoreTextWrap: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 3, textAlign: 'center',
    },
    scoreMessage: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 600,
        color: '#334466', margin: 0, letterSpacing: 0.5,
    },
    scoreSubMessage: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, color: '#7799bb',
        margin: 0, letterSpacing: 0.5,
    },
    summaryCard: {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(147,197,253,0.6)',
        borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,80,160,0.08)',
        flexShrink: 0,
    },
    cardTitle: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 10, fontWeight: 700,
        color: '#60a5fa', letterSpacing: 2.5,
        margin: '0 0 10px 0', textTransform: 'uppercase',
    },
    summaryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6,
    },
    summaryItem: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
        padding: '8px 6px',
        background: 'rgba(239,246,255,0.7)',
        borderRadius: 6,
        border: '1px solid rgba(147,197,253,0.4)',
    },
    summaryLabel: {
        fontSize: 7, color: '#7799bb',
        textAlign: 'center', letterSpacing: 0.5,
        fontFamily: "'Orbitron',monospace",
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 13, fontWeight: 800,
        fontFamily: "'Orbitron',monospace",
    },

    // ✅ leaderCard: flex column agar sticky + scroll bekerja
    leaderCard: {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(147,197,253,0.6)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,80,160,0.08)',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // ✅ penting: bukan 'auto' lagi, scroll ada di .lb-scroll-list
    },

    lbRow: {
        display: 'flex', alignItems: 'center',
        gap: 8, padding: '6px 8px',
        borderRadius: 6, marginBottom: 4,
        transition: 'all 0.2s',
    },
    rankBadge: {
        width: 24, height: 24, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 900, flexShrink: 0,
    },
    lbName: {
        flex: 1, display: 'flex', alignItems: 'center',
        gap: 6, minWidth: 0,
    },
    youBadge: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 7, color: '#0055aa',
        background: 'rgba(0,85,170,0.1)',
        padding: '1px 5px', borderRadius: 3, letterSpacing: 0.5,
    },
    lbPenalty: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, color: '#cc2200', flexShrink: 0,
        minWidth: 36, textAlign: 'center',
    },
    lbScore: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 13, fontWeight: 900,
        minWidth: 36, textAlign: 'right', flexShrink: 0,
    },
    actions: {
        display: 'flex', gap: 12,
        flexShrink: 0, height: 42,
    },
    btnSecondary: {
        flex: 1, height: '100%',
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
        border: '1.5px solid rgba(147,197,253,0.7)',
        borderRadius: 8, cursor: 'pointer',
        background: 'rgba(255,255,255,0.88)',
        color: '#2563eb', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 6,
    },
    btnPrimary: {
        flex: 1, height: '100%',
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
        border: 'none', borderRadius: 8, cursor: 'pointer',
        background: 'linear-gradient(135deg,#1e4fd8,#3b82f6)',
        color: '#fff', boxShadow: '0 4px 18px rgba(0,85,170,0.35)',
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 6,
    },
}