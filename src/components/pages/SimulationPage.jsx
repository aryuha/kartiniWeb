// src/components/pages/SimulationPage.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReactorScene from '../three/ReactorScene'
import ControlPanel from '../ui/ControlPanel'
import PowerDisplay from '../ui/PowerDisplay'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useControlRods } from '../../hooks/useControlRods'
import { useKeyboardControl } from '../../hooks/useKeyboardControl'
import { useReactorAPI } from '../../hooks/useReactorAPI'
import { useScoringSystem } from '../../hooks/useScoringSystem'
import ErrorBoundary from '../ui/ErrorBoundary'
import { useLanguage } from '../../context/LanguageContext'
//import icon
import profilIcon from '../../assets/icon/profil.svg';

// ══════════════════════════════════════════
// PHASE HUD — Overlay target & skor di atas scene
// ══════════════════════════════════════════
function PhaseHUD({
    currentPhaseIndex, currentPhase, phaseTimeLeft,
    phaseScores, totalScore, feedbackText, phases,
    reactorData, isScrammed
}) {
    const { t } = useLanguage()
    const powerKw = isScrammed ? 0 : (reactorData?.power_kw || 0)
    const target = currentPhase?.target || 0

    // Hitung "akurasi" saat ini untuk warna indikator
    const diff = Math.abs(powerKw - target)
    const pct = target > 0 ? diff / target : 1
    const color = pct <= 0.05 ? '#22c55e'   // hijau - sempurna
        : pct <= 0.15 ? '#3b82f6'   // biru  - baik
            : pct <= 0.30 ? '#f59e0b'   // kuning - cukup
                : '#ef4444'   // merah  - jauh

    // Format waktu mm:ss
    const mins = Math.floor(phaseTimeLeft / 60)
    const secs = phaseTimeLeft % 60
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`

    return (
        <div style={{
            position: 'absolute',
            top: 10, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'none',
        }}>

            {/* ── Baris atas: info fase & timer ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: `2px solid ${color}`,
                borderRadius: 12,
                padding: '10px 18px',
                boxShadow: `0 4px 20px ${color}44`,
            }}>

                {/* Nomor fase */}
                <div style={{
                    background: color,
                    color: '#fff',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: 0,
                }}>
                    {t('simFase')} {currentPhaseIndex + 1}/{phases.length}
                </div>

                {/* Target daya */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 9, color: '#7799bb', letterSpacing: 0,
                    }}>{t('simTarget')}</div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 24, fontWeight: 900, color: color,
                        lineHeight: 1,
                    }}>
                        {target} <span style={{ fontSize: 12, color: '#7799bb' }}>kW</span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 36, background: '#d0dce8' }} />

                {/* Daya saat ini */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 9, color: '#7799bb', letterSpacing: 0,
                    }}>{t('simNow')}</div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 24, fontWeight: 900, color: '#1e3a8a',
                        lineHeight: 1,
                    }}>
                        {powerKw.toFixed(1)} <span style={{ fontSize: 12, color: '#7799bb' }}>kW</span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 36, background: '#d0dce8' }} />

                {/* Timer fase */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 9, color: '#7799bb', letterSpacing: 0,
                    }}>{t('simWaktu')}</div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 22, fontWeight: 900,
                        color: phaseTimeLeft <= 10 ? '#ef4444' : '#1e3a8a',
                        lineHeight: 1,
                    }}>
                        {timeStr}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 36, background: '#d0dce8' }} />

                {/* Total skor */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 9, color: '#7799bb', letterSpacing: 0,
                    }}>{t('simPoin')}</div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 22, fontWeight: 900, color: '#0055aa',
                        lineHeight: 1,
                    }}>
                        {totalScore}
                    </div>
                </div>
            </div>

            {/* ── Baris indikator fase (titik-titik) ── */}
            <div style={{
                display: 'flex',
                gap: 6,
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
                padding: '6px 12px',
            }}>
                {phases.map((phase, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        <div style={{
                            width: 28, height: 28,
                            borderRadius: 6,
                            background: i < currentPhaseIndex ? '#22c55e'
                                : i === currentPhaseIndex ? color
                                    : '#e2e8f0',
                            border: `2px solid ${i < currentPhaseIndex ? '#16a34a'
                                : i === currentPhaseIndex ? color
                                    : '#c8d8e8'
                                }`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 9, fontWeight: 700,
                            color: i <= currentPhaseIndex ? '#fff' : '#99aabb',
                        }}>
                            {i < currentPhaseIndex ? '✓' : i + 1}
                        </div>
                        <span style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 7,
                            color: i === currentPhaseIndex ? color : '#99aabb',
                        }}>
                            {phase.target}kW
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Feedback text ── */}
            {feedbackText && (
                <div style={{
                    background: `${color}22`,
                    border: `1px solid ${color}55`,
                    borderRadius: 8,
                    padding: '6px 16px',
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 10, fontWeight: 700,
                    color: color,
                    letterSpacing: 0,
                }}>
                    {feedbackText}
                </div>
            )}
        </div>
    )
}

// ══════════════════════════════════════════
// Nickname Modal
// ══════════════════════════════════════════
function NicknameInput({ onSubmit }) {
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')
    const { t } = useLanguage()

    const handleSubmit = () => {
        const trimmed = nickname.trim()
        if (trimmed.length === 0) {
            setError(t('nicknameEmpty') || 'Nickname tidak boleh kosong!')
            return
        }
        onSubmit(trimmed.toUpperCase())
    }

    const handleKeyDown = (e) => {
        // Cegah event keyboard menyebar ke window
        e.stopPropagation()
        if (e.key === 'Enter') handleSubmit()
    }

    const handleChange = (e) => {
        const val = e.target.value
        if (val.length <= 5) {
            setNickname(val)
            setError('')
        }
    }

    return (
        <div
            // onKeyDown di level modal untuk stopPropagation
            onKeyDown={e => e.stopPropagation()}
            onKeyUp={e => e.stopPropagation()}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                zIndex: 0,
            }} />

            <div style={{
                position: 'relative',
                zIndex: 1,
                width: 360,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(200,216,232,0.8)',
                borderRadius: 12,
                padding: '28px 24px',
                boxShadow: '0 20px 60px rgba(0,80,160,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
            }}>

                {/* Icon */}
                <div style={{
                    width: 60, height: 60,
                    borderRadius: 12,
                    backgroundColor: '#EEF4FF',
                    border: '1.5px solid #c0d4f0',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginTop: 8,
                }}>
                    <img
                        src={profilIcon}
                        alt="Profil"
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 15, fontWeight: 700,
                        color: '#0055aa', letterSpacing: 2,
                        marginBottom: 4,
                    }}>
                        {t('nicknameTitle')}
                    </div>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 10, color: '#617992',
                        letterSpacing: 0,
                    }}>
                        {t('nicknameSubtitle')}
                    </div>
                </div>

                {/* Input */}
                <div style={{ width: '100%' }}>
                    <input
                        type="text"
                        value={nickname}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onKeyUp={e => e.stopPropagation()}
                        maxLength={5}
                        autoFocus
                        placeholder="_ _ _ _ _"
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: 26,
                            fontWeight: 800,
                            fontFamily: "'Orbitron',monospace",
                            letterSpacing: 10,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            color: '#0055aa',
                            backgroundColor: '#f0f5fa',
                            border: error
                                ? '2px solid #cc2200'
                                : '2px solid #0055aa',
                            borderRadius: 8,
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                            caretColor: '#0055aa',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = '#0077cc'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,119,204,0.15)'
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = error ? '#cc2200' : '#c0d4f0'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />

                    {/* Counter & Error */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 5,
                    }}>
                        <span style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 9, color: '#cc2200',
                        }}>
                            {error}
                        </span>
                        <span style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 9,
                            color: nickname.length >= 5 ? '#cc8800' : '#7799bb',
                        }}>
                            {nickname.length}/5
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={nickname.trim().length === 0}
                    style={{
                        width: '100%',
                        padding: '11px',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0,
                        fontFamily: "'Poppins',sans-serif",
                        color: '#ffffff',
                        backgroundColor: nickname.trim().length > 0
                            ? '#0055aa'
                            : '#99aabb',
                        border: 'none',
                        borderRadius: 8,
                        cursor: nickname.trim().length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: nickname.trim().length > 0
                            ? '0 4px 12px rgba(0,85,170,0.3)'
                            : 'none',
                    }}
                    onMouseEnter={e => {
                        if (nickname.trim().length > 0) {
                            e.currentTarget.style.backgroundColor = '#0044aa'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                    }}
                    onMouseLeave={e => {
                        if (nickname.trim().length > 0) {
                            e.currentTarget.style.backgroundColor = '#0055aa'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }
                    }}
                >
                    {t('btnMulai')}
                </button>

                {/* Hint */}
                <div style={{
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 8, color: '#5e7387',
                    letterSpacing: 0, textAlign: 'center',
                }}>
                    {t('nicknameHint')}
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════
// Rules Modal — Tujuan & Aturan Bermain
// Muncul sekali setelah nickname diisi, sebelum
// reaktor bisa di-POWER ON
// ══════════════════════════════════════════
function RulesModal({ nickname, phases, onConfirm }) {
    const { t, language } = useLanguage()
    const isId = language !== 'en'

    // Cegah event keyboard menyebar ke window (sama seperti NicknameInput)
    const stop = (e) => e.stopPropagation()

    const sections = [
        {
            color: '#0055aa',
            title: t('rulesSimGoalTitle'),
            body: isId
                ? `Stabilkan daya reaktor sesuai target pada setiap fase. Ada ${phases?.length || 5} fase berturut-turut, masing-masing berlangsung ${phases?.[0]?.durationSec || 60} detik. Semakin dekat daya kamu ke target, semakin besar poin per detik yang didapat (maksimal 10 poin/detik).`
                : `Stabilize reactor power to match the target in each phase. There are ${phases?.length || 5} consecutive phases, each lasting ${phases?.[0]?.durationSec || 60} seconds. The closer your power is to the target, the more points you earn per second (up to 10 pts/sec).`,
            extra: phases?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {phases.map((p, i) => (
                        <div key={i} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            background: '#eef4ff', border: '1px solid #c0d4f0',
                            borderRadius: 6, padding: '5px 10px', minWidth: 54,
                        }}>
                            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 8, color: '#7799bb' }}>
                                {t('rulesFaseLabel')} {i + 1}
                            </span>
                            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 900, color: '#0055aa' }}>
                                {p.target} kW
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            color: '#006633',
            title: t('rulesHowTitle'),
            body: t('rulesHowBody'),
            extra: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {[
                        { keys: 'Shift + Q / A', label: `Safety Rod  ${t('rulesRodUpDown')}`, color: '#cc2200' },
                        { keys: 'Shift + W / S', label: `Shim Rod  ${t('rulesRodUpDown')}`, color: '#1144cc' },
                        { keys: 'Shift + E / D', label: `Regulating Rod  ${t('rulesRodUpDown')}`, color: '#22aa44' },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <kbd style={{
                                fontFamily: "'Orbitron',monospace", fontSize: 8, fontWeight: 700,
                                padding: '3px 7px', border: `1px solid ${r.color}88`,
                                borderRadius: 4, color: r.color, background: `${r.color}10`,
                                whiteSpace: 'nowrap', minWidth: 100, textAlign: 'center',
                            }}>
                                {r.keys}
                            </kbd>
                            <span style={{ fontSize: 11, color: '#25292d' }}>{r.label}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            color: '#886600',
            title: t('rulesSeqTitle'),
            body: t('rulesSeqBody'),
            extra: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {[
                        { n: 1, label: 'SAFETY ROD', sub: '→ 100%', color: '#cc2200' },
                        { n: 2, label: 'SHIM ROD', sub: t('rulesCoarseReactivity'), color: '#1144cc' },
                        { n: 3, label: 'REGULATING ROD', sub: t('rulesFineTuning'), color: '#22aa44' },
                    ].map((step, i) => (
                        <React.Fragment key={step.n}>
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: `${step.color}10`, border: `1px solid ${step.color}55`,
                                borderRadius: 6, padding: '6px 10px',
                            }}>
                                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 900, color: step.color }}>
                                    {step.n}. {step.label}
                                </span>
                                <span style={{ fontSize: 10, color: '#25292d' }}>{step.sub}</span>
                            </div>
                            {i < 2 && <span style={{ color: '#aabbcc', fontSize: 14 }}>→</span>}
                        </React.Fragment>
                    ))}
                </div>
            ),
        },
        {
            color: '#cc2200',
            title: t('rulesScramTitle'),
            body: t('rulesScramBody'),
        },
    ]

    return (
        <div
            onKeyDown={stop}
            onKeyUp={stop}
            style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                zIndex: 0,
            }} />

            <div style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: 560, maxHeight: '88vh',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(200,216,232,0.8)',
                borderRadius: 14,
                boxShadow: '0 24px 64px rgba(0,80,160,0.3)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Top accent */}
                <div style={{
                    height: 4, flexShrink: 0,
                    background: 'linear-gradient(90deg, #0055aa, #0099ff, #0055aa)',
                }} />

                {/* Header */}
                <div style={{
                    padding: '20px 26px 14px', flexShrink: 0,
                    borderBottom: '1px solid #eef2f6',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                    <span style={{ fontSize: 35, lineHeight: 1, marginBottom: 4 }}>🎮</span>
                    <div style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 800,
                        color: '#0055aa', letterSpacing: 1.5, textAlign: 'center',
                    }}>
                        {t('rulesWelcomeLabel')}{nickname}!
                    </div>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif", fontSize: 10, color: '#7799bb',
                        letterSpacing: 0, textAlign: 'center',
                    }}>
                        {t('rulesReadBefore')}
                    </div>
                </div>

                {/* Body — scrollable */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '16px 26px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                    {sections.map((sec, i) => (
                        <div key={i} style={{
                            border: `1px solid ${sec.color}30`,
                            background: `${sec.color}08`,
                            borderRadius: 10, padding: '12px 14px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 16 }}>{sec.icon}</span>
                                <span style={{
                                    fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700,
                                    color: sec.color, letterSpacing: 1,
                                }}>
                                    {sec.title}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#25292d', lineHeight: 1.6, margin: 0 }}>
                                {sec.body}
                            </p>
                            {sec.extra}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 26px 20px', flexShrink: 0 }}>
                    <button
                        onClick={onConfirm}
                        style={{
                            width: '100%', padding: '13px 0',
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 11, fontWeight: 700, letterSpacing: 0,
                            color: '#ffffff', border: 'none', borderRadius: 8,
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #0055aa, #0099ff)',
                            boxShadow: '0 4px 14px rgba(0,85,170,0.35)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,85,170,0.45)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,85,170,0.35)'
                        }}
                    >
                        {t('rulesGotIt')}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════
// Header Bar
// ══════════════════════════════════════════
function HeaderBar({ onHome, reactorData, isScrammed,
    // Props baru untuk fase
    currentPhaseIndex, currentPhase, phaseTimeLeft, totalScore, phases, isReactorActive, isFinished
}) {
    const { t, backBtn, simTitle, simSubtitle, labelDaya, labelWaktu, scramActive, status } = useLanguage()
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    const powerKw = isScrammed ? 0 : (reactorData?.power_kw || 0)
    const rawSt = isScrammed ? 'SCRAM' : (reactorData?.status || 'SHUTDOWN')
    const label = status?.[rawSt] || rawSt

    const statusCfg = {
        OPERATING: { color: '#007744', bg: '#e8f8ee', border: '#00aa55', icon: '⚡' },
        SUBCRITICAL: { color: '#885500', bg: '#fff8e8', border: '#cc8800', icon: '◑' },
        SHUTDOWN: { color: '#335577', bg: '#e8f0f8', border: '#6699bb', icon: '○' },
        SCRAM: { color: '#cc2200', bg: '#ffeee8', border: '#ee4422', icon: '🔴' },
    }
    const cfg = statusCfg[rawSt] || statusCfg.SHUTDOWN

    const powerColor =
        powerKw > 110 ? '#cc2200' :
            powerKw > 100 ? '#cc6600' :
                powerKw > 75 ? '#cc8800' : '#22cc55'

    // === Kalkulasi warna fase ===
    const target = currentPhase?.target || 0
    const diff = Math.abs(powerKw - target)
    const pct = target > 0 ? diff / target : 1
    const phaseColor =
        pct <= 0.05 ? '#22c55e'
            : pct <= 0.15 ? '#3b82f6'
                : pct <= 0.30 ? '#f59e0b'
                    : '#ef4444'

    const mins = Math.floor(phaseTimeLeft / 60)
    const secs = phaseTimeLeft % 60
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`

    const showPhaseHUD = isReactorActive && !isFinished && phases?.length > 0

    return (
        <div style={hb.bar}>
            {/* ── KIRI: Kembali + Judul ── */}
            <div style={hb.left}>
                <button style={hb.homeBtn} onClick={onHome}>
                    {backBtn}
                </button>
                <div style={hb.divider} />
                <div style={hb.titleGroup}>
                    <span style={hb.title}>{simTitle}</span>
                    <span style={hb.subtitle}>{simSubtitle}</span>
                </div>
            </div>

            {/* ── TENGAH: Phase HUD (hanya saat reaktor aktif) ── */}
            {showPhaseHUD && (
                <div style={hb.phaseCenter}>

                    {/* Badge Fase */}
                    <div style={{
                        background: phaseColor,
                        color: '#fff',
                        borderRadius: 6,
                        padding: '3px 10px',
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 8, fontWeight: 700,
                        letterSpacing: 0,
                        whiteSpace: 'nowrap',
                    }}>
                        {t('simFase')} {currentPhaseIndex + 1}/{phases.length}
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 24, background: '#d0dce8' }} />

                    {/* Target */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#7799bb', letterSpacing: 0 }}>
                            {t('simTarget')}
                        </div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: phaseColor, lineHeight: 1 }}>
                            {target}<span style={{ fontSize: 9, color: '#7799bb' }}> kW</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 24, background: '#d0dce8' }} />

                    {/* Sekarang */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#7799bb', letterSpacing: 0 }}>
                            {t('simNow')}
                        </div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>
                            {powerKw.toFixed(1)}<span style={{ fontSize: 9, color: '#7799bb' }}> kW</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 24, background: '#d0dce8' }} />

                    {/* Timer */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#7799bb', letterSpacing: 0 }}>
                            {t('simWaktu')}
                        </div>
                        <div style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 20, fontWeight: 900,
                            color: phaseTimeLeft <= 10 ? '#ef4444' : '#1e3a8a',
                            lineHeight: 1,
                        }}>
                            {timeStr}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 24, background: '#d0dce8' }} />

                    {/* Total Poin */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#7799bb', letterSpacing: 0 }}>
                            {t('simPoin')}
                        </div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: '#0055aa', lineHeight: 1 }}>
                            {totalScore}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 24, background: '#d0dce8' }} />

                    {/* Indikator fase (titik-titik kecil) */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {phases.map((phase, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{
                                    width: 22, height: 22,
                                    borderRadius: 4,
                                    background: i < currentPhaseIndex ? '#22c55e'
                                        : i === currentPhaseIndex ? phaseColor
                                            : '#e2e8f0',
                                    border: `1.5px solid ${i < currentPhaseIndex ? '#16a34a'
                                        : i === currentPhaseIndex ? phaseColor
                                            : '#c8d8e8'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'Poppins',sans-serif",
                                    fontSize: 8, fontWeight: 700,
                                    color: i <= currentPhaseIndex ? '#fff' : '#99aabb',
                                }}>
                                    {i < currentPhaseIndex ? '✓' : i + 1}
                                </div>
                                <span style={{
                                    fontFamily: "'Poppins',sans-serif",
                                    fontSize: 6,
                                    color: i === currentPhaseIndex ? phaseColor : '#99aabb',
                                }}>
                                    {phase.target}kW
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            )}

            {/* ── KANAN: Status + Daya + Waktu ── */}
            <div style={hb.right}>
                {/* Status Badge */}
                <div style={{
                    ...hb.statusBadge,
                    borderColor: cfg.border,
                    color: cfg.color,
                    background: cfg.bg,
                    animation: isScrammed ? 'scram-blink 1s ease infinite' : 'none',
                }}>
                    {cfg.icon}&nbsp;{isScrammed ? scramActive : label}
                </div>
                <div style={hb.divider} />

                {/* DAYA */}
                <div style={hb.metricGroup}>
                    <span style={hb.metricLabel}>{labelDaya || 'DAYA'}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ ...hb.metricValue, color: powerColor }}>
                            {powerKw.toFixed(1)}
                        </span>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 9, color: powerColor, fontWeight: 600 }}>
                            kW
                        </span>
                    </div>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 9, color: '#99aabc', letterSpacing: 0 }}>
                        / 120 kW
                    </span>
                </div>
                <div style={hb.divider} />

                {/* Waktu Operasi */}
                <div style={hb.metricGroup}>
                    <span style={hb.metricLabel}>{labelWaktu || 'OPERATION TIME'}</span>
                    <span style={hb.timeValue}>
                        {time.toLocaleTimeString('id-ID')}
                    </span>
                </div>
            </div>
        </div>
    )
}

const hb = {
    bar: {
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid #d0dce8',
        boxShadow: '0 2px 8px rgba(0,80,160,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 10,
        flexShrink: 0,
    },

    phaseCenter: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(248,250,252,0.95)',
        border: '1px solid #d0dce8',
        borderRadius: 8,
        padding: '4px 14px',
        // Agar tidak overflow saat layar kecil
        flex: '0 1 auto',
        overflow: 'hidden',
    },

    // ── Kiri ──
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flex: '0 0 auto',
    },
    homeBtn: {
        background: '#f0f5fa',
        border: '1px solid #c0d0e0',
        borderRadius: 4,
        color: '#0055aa',
        fontFamily: "'Poppins',sans-serif",
        fontSize: 8,
        padding: '5px 10px',
        cursor: 'pointer',
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.2s',
    },
    divider: {
        width: 1,
        height: 28,
        background: '#d0dce8',
        flexShrink: 0,
    },
    titleGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 12,
        fontWeight: 700,
        color: '#0055aa',
        letterSpacing: 2,
        lineHeight: 1,
    },
    subtitle: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8,
        color: '#7799bb',
        letterSpacing: 1,
        lineHeight: 1,
    },

    // ── Kanan ──
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flex: '0 0 auto',
    },
    statusBadge: {
        fontFamily: "'Poppins',sans-serif",
        fontSize: 10,
        fontWeight: 700,
        padding: '5px 14px',
        border: '1px solid',
        borderRadius: 20,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        transition: 'all 0.3s',
    },
    metricGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
    },
    metricLabel: {
        fontFamily: "'Poppins',sans-serif",
        fontSize: 11,
        color: '#7799bb',
        letterSpacing: 0,
        lineHeight: 1,
        whiteSpace: 'nowrap',
    },
    metricValue: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 20,
        fontWeight: 900,
        lineHeight: 1,
    },
    timeValue: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 14,
        fontWeight: 700,
        color: '#0055aa',
        lineHeight: 1,
        letterSpacing: 1,
    },
}

// ══════════════════════════════════════════
// LEFT PANEL — Monitor + Panduan + Rod Bar
// ══════════════════════════════════════════
function LeftPanel({ rodPositions, reactorData, isScrammed, isReactorActive }) {
    const { t, rodSafety, rodShim, rodReg, guideTitle, guideRows, noteTitle, notes } = useLanguage()
    const [activeTab, setActiveTab] = useState('monitor')
    const [open, setOpen] = useState(true)

    const rods = [
        { key: 'safety', label: rodSafety || 'SAFETY', color: '#cc2200', bg: '#ffe8e4' },
        { key: 'shim', label: rodShim || 'SHIM', color: '#886600', bg: '#fff8e0' },
        { key: 'regulating', label: rodReg || 'REG', color: '#006633', bg: '#e4f8ec' },
    ]

    const rodColors = {
        'SHIFT': '#0055aa',
        'Shift + Q': '#cc2200', 'Shift + A': '#cc2200',
        'Shift + W': '#886600', 'Shift + S': '#886600',
        'Shift + E': '#006633', 'Shift + D': '#006633',
    }

    const W = 276
    const TAB_ML = 3

    return (
        <div style={{
            position: 'absolute',
            left: open ? 10 : -(W + TAB_ML),
            top: 10,
            bottom: 10,
            zIndex: 15,
            display: 'flex',
            alignItems: 'flex-start',
            pointerEvents: 'none',
            transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
            {/* ── Panel body ── */}
            <div style={{
                width: W,
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.97)',
                border: '1px solid #d0dce8',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,80,160,0.14)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'all',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                {/* Header — seragam dengan MonitorSidebar */}
                <div style={{
                    background: '#0055aa',
                    padding: '7px 10px 7px 12px',
                    borderRadius: '7px 7px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <span style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 9, fontWeight: 700,
                        color: '#fff', letterSpacing: 1.5,
                    }}>
                        ■ MONITOR SIMULATOR
                    </span>
                </div>

                {/* Tab bar */}
                <div style={lp.tabBar}>
                    {['monitor', 'panduan'].map(tab => (
                        <button key={tab} style={{
                            ...lp.tabBtn,
                            color: activeTab === tab ? '#0055aa' : '#7799bb',
                            borderBottom: activeTab === tab ? '2px solid #0077cc' : '2px solid transparent',
                            background: activeTab === tab ? '#e8f2ff' : 'transparent',
                        }} onClick={() => setActiveTab(tab)}>
                            {tab === 'monitor'
                                ? (t('monitor') || 'Monitor')
                                : (t('guide') || 'Panduan')}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div style={lp.body}>
                    {activeTab === 'monitor' && (
                        <PowerDisplay reactorData={reactorData} isScrammed={isScrammed} isReactorActive={isReactorActive} />
                    )}
                    {activeTab === 'panduan' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <p style={lp.guideTitle}>{guideTitle || 'PANDUAN KEYBOARD'}</p>
                            <div style={lp.guideBox}>
                                {(guideRows || []).map((r, i) => (
                                    <div key={i} style={{
                                        ...lp.guideRow,
                                        borderBottom: i < (guideRows?.length - 1) ? '1px solid #e0eaf2' : 'none',
                                        background: i % 2 === 0 ? '#f8fafc' : '#ffffff',
                                    }}>
                                        <kbd style={{
                                            ...lp.kbd,
                                            borderColor: rodColors[r.key] || '#0055aa',
                                            color: rodColors[r.key] || '#0055aa',
                                            background: `${rodColors[r.key] || '#0055aa'}12`,
                                        }}>
                                            {r.key}
                                        </kbd>
                                        <span style={lp.kbdDesc}>{r.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={lp.noteBox}>
                                <p style={lp.noteTitle}>{noteTitle || '⚠ CATATAN OPERASI'}</p>
                                <ul style={lp.noteList}>
                                    {(notes || []).map((n, i) => (
                                        <li key={i} style={lp.noteItem}>{n}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rod Position */}
                <div style={lp.rodSection}>
                    <p style={lp.rodTitle}>{t('posisBatangKendali')}</p>
                    {rods.map(rod => {
                        const val = isScrammed ? 0 : (rodPositions[rod.key] || 0)
                        return (
                            <div key={rod.key} style={lp.rodRow}>
                                <span style={{ ...lp.rodLabel, color: rod.color }}>{rod.label}</span>
                                <div style={lp.rodTrackWrap}>
                                    <div style={{ ...lp.rodTrackBg, background: rod.bg }}>
                                        <div style={{
                                            ...lp.rodTrackFill,
                                            width: `${val}%`,
                                            background: rod.color,
                                        }} />
                                    </div>
                                </div>
                                <span style={{ ...lp.rodVal, color: rod.color }}>
                                    {val.toFixed(1)}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Toggle tab (selalu terlihat di tepi kiri) ── */}
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    marginLeft: TAB_ML,
                    marginTop: 10,
                    width: 22,
                    height: 64,
                    background: '#0055aa',
                    border: '1px solid #0055aa88',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0',
                    cursor: 'pointer',
                    pointerEvents: 'all',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: 0,
                    flexShrink: 0,
                    boxShadow: '2px 2px 8px rgba(0,80,160,0.22)',
                }}
            >
                <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>
                    {open ? '◀' : '▶'}
                </span>
                {!open && (
                    <span style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 6,
                        color: 'rgba(255,255,255,0.85)',
                        letterSpacing: 0,
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                    }}>
                        MONITOR
                    </span>
                )}
            </button>
        </div>
    )
}

const lp = {
    tabBar: { display: 'flex', borderBottom: '1px solid #d0dce8', flexShrink: 0 },
    tabBtn: {
        flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
        fontFamily: "'Poppins',sans-serif", fontSize: 11, letterSpacing: 0,
        transition: 'all 0.2s', background: 'transparent',
    },
    body: { flex: 1, overflowY: 'auto', padding: '12px', minHeight: 0 },
    guideTitle: { fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#0055aa', letterSpacing: 0, fontWeight: 700, margin: '0 0 6px 0' },
    guideBox: { background: '#f8fafc', border: '1px solid #c8d8e8', borderRadius: 6, overflow: 'hidden' },
    guideRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' },
    kbd: { fontFamily: "'Orbitron',monospace", fontSize: 8, padding: '2px 5px', border: '1px solid', borderRadius: 3, whiteSpace: 'nowrap', minWidth: 70, textAlign: 'center', flexShrink: 0 },
    kbdDesc: { fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#4a6a8a' },
    noteBox: { padding: '8px 10px', background: '#fffaf0', border: '1px solid #e8c870', borderRadius: 6 },
    noteTitle: { fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#885500', fontWeight: 600, margin: '0 0 5px 0' },
    noteList: { paddingLeft: 14, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 },
    noteItem: { fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#5a7a9a' },
    // Rod section
    rodSection: { padding: '10px 12px', borderTop: '1px solid #d0dce8', flexShrink: 0, background: '#f8fafc' },
    rodTitle: { fontFamily: "'Poppins',sans-serif", fontSize: 10, color: '#7799bb', letterSpacing: 0, marginBottom: 8, fontWeight: 600 },
    rodRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
    rodLabel: { fontFamily: "'Poppins',sans-serif", fontSize: 11, letterSpacing: 0, minWidth: 36, flexShrink: 0, fontWeight: 700 },
    rodTrackWrap: { flex: 1 },
    rodTrackBg: { height: 6, borderRadius: 3, border: '1px solid #d0dce8', overflow: 'hidden' },
    rodTrackFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' },
    rodVal: { fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, minWidth: 38, textAlign: 'right', flexShrink: 0 },
}

// ══════════════════════════════════════════
// Loading Overlay
// ══════════════════════════════════════════
function LoadingOverlay({ show }) {
    const { loading } = useLanguage()
    if (!show) return null
    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#f0f4f8',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, gap: 20,
        }}>
            <div style={{
                width: 50, height: 50, border: '3px solid #c0d4e8', borderTopColor: '#0077cc',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontFamily: "'Poppins',sans-serif", color: '#0055aa', fontSize: 20, letterSpacing: 0 }}>
                {loading}
            </span>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
    )
}

// Komponen notifikasi penalti
function PenaltyNotif({ notif }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(false), 2000)
        return () => clearTimeout(t)
    }, [])

    if (!visible) return null

    const isScram = notif.type === 'scram'
    const isPenalty = notif.type === 'penalty'

    return (
        <div style={{
            position: 'absolute',
            top: '20%', left: '50%',
            transform: 'translateX(-50%)',
            background: isScram ? 'rgba(200,0,0,0.9)'
                : isPenalty ? 'rgba(180,60,0,0.88)'
                    : 'rgba(0,140,70,0.88)',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 24px',
            fontFamily: "'Poppins',sans-serif",
            fontSize: 13, fontWeight: 700,
            letterSpacing: 0,
            pointerEvents: 'none',
            zIndex: 50,
            animation: 'fadeInUp 0.3s ease',
        }}>
            {notif.text}
        </div>
    )
}

function WinOverlay({ isWin, isTimeOut, score, stableSeconds, onFinish }) {
    const { t } = useLanguage()

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                position: 'relative',
                width: 420,
                background: 'rgba(255,255,255,0.96)',
                borderRadius: 16,
                padding: '36px 32px',
                textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,80,160,0.3)',
                border: isWin
                    ? '2px solid #22c55e'
                    : '2px solid #cc8800',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
            }}>

                {/* Icon status */}
                <div style={{
                    fontSize: 48,
                    lineHeight: 1,
                    marginTop: 8,
                }}>
                    {isWin ? '🏆' : '⏰'}
                </div>

                {/* Judul */}
                <div style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 18,
                    fontWeight: 900,
                    color: isWin ? '#16a34a' : '#cc8800',
                    letterSpacing: 2,
                }}>
                    {isWin ? t('winTitle') : t('winTimeoutTitle')}
                </div>

                {/* Subjudul */}
                <div style={{
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 9,
                    color: '#7799bb',
                    letterSpacing: 0,
                }}>
                    {isWin ? t('winSubtitle') : t('winTimeoutSubtitle')}
                </div>

                {/* Skor sementara */}
                <div style={{
                    background: isWin ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${isWin ? '#86efac' : '#fcd34d'}`,
                    borderRadius: 10,
                    padding: '14px 32px',
                    width: '100%',
                }}>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 10,
                        color: '#7799bb',
                        letterSpacing: 0,
                        marginBottom: 6,
                    }}>
                        {t('winScoreLabel')}
                    </div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 42,
                        fontWeight: 900,
                        color: isWin ? '#16a34a' : '#b45309',
                        lineHeight: 1,
                    }}>
                        {score}
                    </div>
                    <div style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: 8,
                        color: '#aabbcc',
                        letterSpacing: 0,
                        marginTop: 4,
                    }}>
                        {t('skorMaxPoints')}
                    </div>
                </div>

                {/* Hint */}
                <div style={{
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 8,
                    color: '#aabbcc',
                    letterSpacing: 0,
                }}>
                    {t('winHint')}
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════════
// Main SimulationPage
// ══════════════════════════════════════════
export default function SimulationPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { t, hintOrbit, scramActive, cherenkov } = useLanguage()

    const [nickname, setNickname] = useState(null)
    const [showRulesModal, setShowRulesModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    // Saat nickname pertama kali disubmit, otomatis tampilkan modal aturan main
    const handleNicknameSubmit = useCallback((name) => {
        setNickname(name)
        setShowRulesModal(true)
    }, [])

    const [isReactorActive, setIsReactorActive] = useState(false);

    const { rodPositions, isScrammed, scrammedRods, movingRods,
        moveRod, startHold, stopHold, scram, scramRod,
        resetScram, resetScramRod } = useControlRods()

    const handleAutoScram = useCallback((reason) => {
        console.warn('[AUTO-SCRAM TRIGGERED]', reason)
        scram()
    }, [scram])

    const isKeyboardDisabled = !nickname || !isReactorActive;

    const { shiftPressed, lastAction, activeKeys } =
        useKeyboardControl(
            moveRod,
            isScrammed,
            scramRod,
            scrammedRods,
            isKeyboardDisabled,
            resetScramRod,
        )

    const { reactorData, apiStatus } = useReactorAPI(
        rodPositions, isScrammed, handleAutoScram, isReactorActive
    )

    // Cek apakah masuk sebagai ahli
    const isFromAhli = location.state?.fromRole === 'ahli'
    const handleHome = useCallback(() => {
        if (isFromAhli) {
            navigate('/', { replace: true })  // Ahli → langsung HomePage
        } else {
            navigate(-1)                       // Pemula → kembali ke PreparePage
        }
    }, [navigate, isFromAhli])

    const [showPowerOffWarning, setShowPowerOffWarning] = useState(false);

    const handlePowerToggle = useCallback(() => {
        if (showRulesModal) return; // Belum baca aturan main, jangan biarkan power on
        if (isScrammed) return; // Jangan biarkan menyalakan jika sedang scram

        // Jika sedang ON dan ingin OFF → cek posisi batang kendali dulu
        if (isReactorActive) {
            const allZero =
                rodPositions.safety === 0 &&
                rodPositions.shim === 0 &&
                rodPositions.regulating === 0;

            if (!allZero) {
                // Tampilkan warning modal
                setShowPowerOffWarning(true);
                return;
            }
        }

        setIsReactorActive(prev => !prev);
    }, [showRulesModal, isScrammed, isReactorActive, rodPositions]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1800)
        return () => clearTimeout(timer)
    }, [])

    // Di dalam komponen SimulationPage, tambahkan:
    const {
        // Sistem baru
        currentPhaseIndex,
        currentPhase,
        phaseTimeLeft,
        phaseScores,
        totalScore,
        isFinished,
        feedbackText,
        phases,
        TOTAL_PHASES,

        score,
        isWin,
        isTimeOut,
        lastNotif,
        getFinalScore,
        stableSeconds,
        timeElapsed,
        penaltyTotal,
        STABLE_DURATION_SEC,
        TIME_LIMIT_SEC,
    } = useScoringSystem(isReactorActive, isScrammed, reactorData, rodPositions)

    // Tambahkan state ini di dalam SimulationPage
    const [showWinOverlay, setShowWinOverlay] = useState(false)

    // Tambahkan useEffect pengganti
    useEffect(() => {
        if (isWin) {
            setShowWinOverlay(true)
        }
    }, [isWin])

    useEffect(() => {
        if (isTimeOut) {
            setShowWinOverlay(true)
        }
    }, [isTimeOut])

    const handleFinish = useCallback(async () => {
        const result = getFinalScore()

        // Kirim ke database
        try {
            await fetch('/api/scores/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: nickname,
                    score: result.finalScore,
                    completion_time: result.timeElapsed,
                    scram_count: result.penaltyLog.length,
                })
            })
        } catch (err) {
            console.warn('[SCORE] Gagal simpan ke DB:', err.message)
        }

        // Navigate ke SkorPage
        navigate('/skor', {
            state: {
                score: result.finalScore,
                penaltyTotal: result.penaltyTotal,
                bonus: result.bonus,
                penaltyLog: result.penaltyLog,
                timeElapsed: result.timeElapsed,
                maxPowerKw: reactorData?.power_kw || 0,
                nickname,
                status: isWin ? 'MENANG' : isTimeOut ? 'WAKTU HABIS' : 'SELESAI',
                isWin,
                phaseScores: result.phaseScores,
                phases: result.phases,
            }
        })
    }, [getFinalScore, reactorData, nickname, isScrammed, isWin, isTimeOut, navigate])

    // ── SELALU render simulasi, modal di overlay ──
    return (
        <div style={ps.page}>
            <LoadingOverlay show={isLoading} />

            {/* ══ NICKNAME MODAL OVERLAY ══
        position fixed, didepan page simulasi, 
          simulasi tetap render di belakang */}
            {!nickname && (
                <NicknameInput onSubmit={handleNicknameSubmit} />
            )}

            {/* ══ RULES MODAL — muncul sekali setelah nickname diisi ══ */}
            {nickname && showRulesModal && (
                <RulesModal
                    nickname={nickname}
                    phases={phases}
                    onConfirm={() => setShowRulesModal(false)}
                />
            )}

            {/* ══ SIMULASI - selalu render di bawah modal ══ */}
            <HeaderBar
                onHome={handleHome}
                reactorData={reactorData}
                isScrammed={isScrammed}

                currentPhaseIndex={currentPhaseIndex}
                currentPhase={currentPhase}
                phaseTimeLeft={phaseTimeLeft}
                totalScore={totalScore}
                phases={phases}
                isReactorActive={isReactorActive}
                isFinished={isFinished}
            />

            <div style={ps.body}>
                <div style={ps.scene}>
                    <LeftPanel
                        rodPositions={rodPositions}
                        reactorData={reactorData}
                        isScrammed={isScrammed}
                        isReactorActive={isReactorActive}
                    />
                    <ErrorBoundary>
                        <ReactorScene
                            rodPositions={rodPositions}
                            reactorData={reactorData}
                            isScrammed={isScrammed}
                            movingRods={movingRods}
                            isReactorActive={isReactorActive}
                        />
                    </ErrorBoundary>
                    <div style={ps.overlayHint}>
                        <span style={ps.overlayText}>{hintOrbit}</span>
                    </div>
                    {isScrammed && (
                        <div style={ps.scramOverlay}>
                            <span style={ps.scramText}>{scramActive}</span>
                        </div>
                    )}
                    {(reactorData?.power || 0) > 5 && !isScrammed && (
                        <div style={ps.cherenkovLabel}>
                            <div style={ps.cherenkovDot} />
                            <span style={ps.cherenkovText}>{cherenkov}</span>
                        </div>
                    )}
                    {/* Notifikasi penalti/bonus — tambahkan di dalam div ps.scene */}
                    {lastNotif && (
                        <PenaltyNotif key={lastNotif.id} notif={lastNotif} />
                    )}

                    {/* Progress stabil daya */}
                    {stableSeconds > 0 && !isScrammed && (
                        <div style={{
                            position: 'absolute', bottom: 40, left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,170,85,0.9)',
                            color: '#fff', borderRadius: 8,
                            padding: '8px 20px', pointerEvents: 'none',
                            fontFamily: "'Poppins',sans-serif", fontSize: 11,
                            letterSpacing: 0,
                        }}>
                            STABIL: {stableSeconds}/{STABLE_DURATION_SEC} detik
                        </div>
                    )}
                    {/* WIN OVERLAY — tambahkan di sini */}
                    {showWinOverlay && (
                        <WinOverlay
                            isWin={isWin}
                            isTimeOut={isTimeOut}
                            score={score}
                            stableSeconds={stableSeconds}
                        />
                    )}
                </div>

                <ControlPanel
                    nickname={nickname}
                    rodPositions={rodPositions}
                    reactorData={reactorData}
                    isScrammed={isScrammed}
                    scrammedRods={scrammedRods}
                    shiftPressed={shiftPressed}
                    lastAction={lastAction}
                    apiStatus={apiStatus}
                    onlyControl={true}
                    movingRods={movingRods}
                    onStartHold={startHold}
                    onStopHold={stopHold}
                    onScramRod={scramRod}
                    onResetScramRod={resetScramRod}
                    activeKeys={activeKeys}
                    isReactorActive={isReactorActive}
                    onPowerToggle={handlePowerToggle}
                    onFinish={handleFinish}
                    canFinish={isWin || isTimeOut || isFinished}
                    stableSeconds={stableSeconds}
                    timeElapsed={timeElapsed}
                />
            </div>

            {/* Power-off warning modal */}
            {showPowerOffWarning && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,20,50,0.55)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setShowPowerOffWarning(false)}
                >
                    <div
                        style={{
                            position: 'relative',
                            background: '#fff',
                            borderRadius: 14,
                            padding: '28px 28px',
                            width: 300,
                            boxShadow: '0 20px 60px rgba(0,80,160,0.3)',
                            border: '1px solid #c0d4f0',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                            background: 'linear-gradient(90deg, #e53e3e, #ff6b6b)',
                            borderRadius: '12px 12px 0 0',
                        }} />
                        <div style={{ fontSize: 32, marginTop: 8 }}>⚠️</div>
                        <div style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 13, fontWeight: 700,
                            color: '#cc2222', letterSpacing: 0, textAlign: 'center',
                        }}>
                            {t('powerWarnTitle')}
                        </div>
                        <div style={{
                            fontFamily: "'Poppins',sans-serif",
                            fontSize: 9, color: '#445566',
                            textAlign: 'center', lineHeight: 1.8,
                            letterSpacing: 0, padding: '0 8px',
                        }}>
                            {t('contTurun')}
                        </div>
                        <button
                            onClick={() => setShowPowerOffWarning(false)}
                            style={{
                                width: '100%', padding: '10px 0',
                                fontFamily: "'Poppins',sans-serif",
                                fontSize: 9, fontWeight: 700, letterSpacing: 0,
                                border: 'none', borderRadius: 6, cursor: 'pointer',
                                background: 'linear-gradient(135deg, #0055aa, #0077cc)',
                                color: '#fff',
                            }}
                        >
                            {t('btnUnderstood')}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes scram-blink {0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes cherenkov-blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
      `}</style>
        </div>
    )
}

const ps = {
    page: { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4f8', overflow: 'hidden', position: 'relative' },
    body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' },
    scene: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#dce8f5',
        transition: 'flex 0.3s ease',
        minWidth: 0,
    },
    overlayHint: {
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.85)', border: '1px solid #c8d8e8',
        borderRadius: 4, padding: '5px 10px', backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(0,80,160,0.08)', pointerEvents: 'none',
    },
    overlayText: { fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: '#5577aa' },
    scramOverlay: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'rgba(255,240,238,0.92)', border: '2px solid #dd2200', borderRadius: 8,
        padding: '14px 28px', pointerEvents: 'none', boxShadow: '0 4px 24px rgba(200,0,0,0.15)',
    },
    scramText: { fontFamily: "'Orbitron',monospace", fontSize: 18, color: '#cc2200', fontWeight: 900, letterSpacing: 3, animation: 'scram-blink 1s ease infinite', display: 'block' },
    cherenkovLabel: {
        position: 'absolute', bottom: 10, left: 10, background: 'rgba(220,235,255,0.9)',
        border: '1px solid #5588cc', borderRadius: 4, padding: '4px 10px',
        display: 'flex', alignItems: 'center', gap: 7, pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,80,200,0.1)',
    },
    cherenkovDot: { width: 7, height: 7, borderRadius: '50%', background: '#4488cc', boxShadow: '0 0 5px #4488cc', animation: 'cherenkov-blink 1.5s ease infinite' },
    cherenkovText: { fontFamily: "'Poppins',sans-serif", fontSize: 9, color: '#3366aa', letterSpacing: 0 },
}