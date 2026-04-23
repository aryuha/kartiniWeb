// src/components/pages/SimulationPage.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactorScene from '../three/ReactorScene'
import ControlPanel from '../ui/ControlPanel'
import PowerDisplay from '../ui/PowerDisplay'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useControlRods } from '../../hooks/useControlRods'
import { useKeyboardControl } from '../../hooks/useKeyboardControl'
import { useReactorAPI } from '../../hooks/useReactorAPI'
import { useLanguage } from '../../context/LanguageContext'

// ══════════════════════════════════════════
// Header Bar
// ══════════════════════════════════════════
function HeaderBar({ onHome, reactorData, isScrammed }) {
    const { backBtn, simTitle, simSubtitle, labelDaya, labelWaktu, scramActive, status } =
        useLanguage()
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

                {/* ── DAYA: ubah tampilan ke kW ── */}
                <div style={hb.metricGroup}>
                    <span style={hb.metricLabel}>{labelDaya || 'DAYA'}</span>
                    {/* Baris nilai kW + satuan */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ ...hb.metricValue, color: powerColor }}>
                            {powerKw.toFixed(1)}
                        </span>
                        <span style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 10,
                            color: powerColor,
                            fontWeight: 700,
                        }}>
                            kW
                        </span>
                    </div>
                    {/* Sub-label: max power */}
                    <span style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 7,
                        color: '#99aabc',
                        letterSpacing: 0.5,
                    }}>
                        / 120 kW
                    </span>
                </div>

                <div style={hb.divider} />

                {/* Waktu Operasi */}
                <div style={hb.metricGroup}>
                    <span style={hb.metricLabel}>{labelWaktu || 'WAKTU OPERASI'}</span>
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
        height: 60,
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
        color: '#4477aa',
        fontFamily: "'Orbitron',monospace",
        fontSize: 9,
        padding: '5px 10px',
        cursor: 'pointer',
        letterSpacing: 1,
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
        fontFamily: "'Orbitron',monospace",
        fontSize: 10,
        fontWeight: 700,
        padding: '5px 14px',
        border: '1px solid',
        borderRadius: 20,
        letterSpacing: 1,
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
        fontFamily: "'Orbitron',monospace",
        fontSize: 7,
        color: '#7799bb',
        letterSpacing: 1,
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
        fontSize: 18,
        fontWeight: 700,
        color: '#0055aa',
        lineHeight: 1,
        letterSpacing: 1,
    },
}

// ══════════════════════════════════════════
// LEFT PANEL — Monitor + Panduan + Rod Bar
// ══════════════════════════════════════════
function LeftPanel({ rodPositions, reactorData, isScrammed, isVisible, onToggle }) {
    const { t, rodSafety, rodShim, rodReg, guideTitle, guideRows, noteTitle, notes } = useLanguage()
    const [activeTab, setActiveTab] = useState('monitor')

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

    return (
        // ✅ Wrapper relatif — hanya untuk posisi toggle button
        <div style={{ position: 'relative', display: 'flex', height: '100%' }}>

            {/* ✅ Panel — width berubah saat hide/show */}
            <div style={{
                ...lp.panel,
                width: isVisible ? 276 : 0,        // ✅ width collapse ke 0
                borderRight: isVisible ? '1px solid #d0dce8' : 'none',
            }}>
                {/* Semua konten hanya render saat visible agar tidak ada overflow */}
                {isVisible && (
                    <>
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
                                <PowerDisplay reactorData={reactorData} isScrammed={isScrammed} />
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
                    </>
                )}
            </div>

            {/* ✅ Toggle button — posisi ikut width panel */}
            <button
                style={{
                    ...lp.toggleBtn,
                    // Selalu di tepi kanan panel
                    position: 'absolute',
                    left: isVisible ? 276 : 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
                onClick={onToggle}
                title={isVisible ? 'Sembunyikan panel' : 'Tampilkan panel'}
            >
                {isVisible ? '◀' : '▶'}
            </button>
        </div>
    )
}

const lp = {
    toggleBtn: {
        position: 'absolute', top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30, width: 22, height: 48,
        background: '#ffffff', border: '1px solid #d0dce8',
        borderLeft: 'none', borderRadius: '0 6px 6px 0',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: '#4477aa',
        boxShadow: '2px 0 8px rgba(0,80,160,0.1)',
        transition: 'left 0.3s ease',
    },
    panel: {
        width: 276, height: '100%',
        background: '#ffffff', borderRight: '1px solid #d0dce8',
        boxShadow: '2px 0 12px rgba(0,80,160,0.08)',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.3s ease',
        flexShrink: 0, zIndex: 20, overflow: 'hidden',
    },
    tabBar: { display: 'flex', borderBottom: '1px solid #d0dce8', flexShrink: 0 },
    tabBtn: {
        flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
        fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 0.5,
        transition: 'all 0.2s', background: 'transparent',
    },
    body: { flex: 1, overflowY: 'auto', padding: '12px', minHeight: 0 },
    guideTitle: { fontFamily: "'Orbitron',monospace", fontSize: 10, color: '#0055aa', letterSpacing: 1, fontWeight: 700, margin: '0 0 6px 0' },
    guideBox: { background: '#f8fafc', border: '1px solid #c8d8e8', borderRadius: 6, overflow: 'hidden' },
    guideRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' },
    kbd: { fontFamily: "'Orbitron',monospace", fontSize: 8, padding: '2px 5px', border: '1px solid', borderRadius: 3, whiteSpace: 'nowrap', minWidth: 70, textAlign: 'center', flexShrink: 0 },
    kbdDesc: { fontSize: 11, color: '#4a6a8a' },
    noteBox: { padding: '8px 10px', background: '#fffaf0', border: '1px solid #e8c870', borderRadius: 6 },
    noteTitle: { fontSize: 10, color: '#885500', fontWeight: 700, margin: '0 0 5px 0' },
    noteList: { paddingLeft: 14, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 },
    noteItem: { fontSize: 10, color: '#5a7a9a' },
    // Rod section
    rodSection: { padding: '10px 12px', borderTop: '1px solid #d0dce8', flexShrink: 0, background: '#f8fafc' },
    rodTitle: { fontFamily: "'Orbitron',monospace", fontSize: 8, color: '#7799bb', letterSpacing: 1, marginBottom: 8, fontWeight: 700 },
    rodRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
    rodLabel: { fontFamily: "'Orbitron',monospace", fontSize: 8, letterSpacing: 0.5, minWidth: 36, flexShrink: 0, fontWeight: 700 },
    rodTrackWrap: { flex: 1 },
    rodTrackBg: { height: 6, borderRadius: 3, border: '1px solid #d0dce8', overflow: 'hidden' },
    rodTrackFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' },
    rodVal: { fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 700, minWidth: 38, textAlign: 'right', flexShrink: 0 },
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
            <span style={{ fontFamily: "'Orbitron',monospace", color: '#0055aa', fontSize: 13, letterSpacing: 3 }}>
                {loading || 'MEMUAT...'}
            </span>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
    )
}

// ══════════════════════════════════════════
// Main SimulationPage
// ══════════════════════════════════════════
export default function SimulationPage() {
    const navigate = useNavigate()
    const { hintOrbit, scramActive, cherenkov } = useLanguage()
    const [isLoading, setIsLoading] = useState(true)
    const [leftVisible, setLeftVisible] = useState(true)

    const { rodPositions, isScrammed, scrammedRods, movingRods, moveRod, startHold, stopHold, scram, scramRod, resetScram, resetScramRod } = useControlRods()

    // ← BARU: Callback auto-SCRAM
    const handleAutoScram = useCallback((reason) => {
        console.warn('[AUTO-SCRAM TRIGGERED]', reason)
        scram()  // Trigger scram semua rod
        // Optional: tampilkan notifikasi
    }, [scram])

    const { shiftPressed, lastAction, activeKeys } = useKeyboardControl(moveRod, isScrammed, scramRod, scrammedRods)
    // Kirim ke useReactorAPI
    const { reactorData, apiStatus } = useReactorAPI(
        rodPositions,
        isScrammed,
        handleAutoScram  // ← BARU: tambah callback
    )

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1800)
        return () => clearTimeout(timer)
    }, [])

    const handleHome = useCallback(() => {
        navigate('/prepare')
    }, [navigate])

    return (
        <div style={ps.page}>
            <LoadingOverlay show={isLoading} />

            {/* Header */}
            <HeaderBar
                onHome={handleHome}
                reactorData={reactorData}
                isScrammed={isScrammed}
            />

            {/* Body */}
            <div style={ps.body}>

                {/* ── LEFT PANEL (Monitor + Panduan + Rod Bar) ── */}
                <div style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                    <LeftPanel
                        rodPositions={rodPositions}
                        reactorData={reactorData}
                        isScrammed={isScrammed}
                        isVisible={leftVisible}
                        onToggle={() => setLeftVisible(v => !v)}
                    />
                </div>

                {/* ── CENTER — 3D Scene ── */}
                <div style={ps.scene}>
                    <ReactorScene
                        rodPositions={rodPositions}
                        reactorData={reactorData}
                        isScrammed={isScrammed}
                        movingRods={movingRods}   // ← NEW
                    />

                    {/* Hint overlay */}
                    <div style={ps.overlayHint}>
                        <span style={ps.overlayText}>{hintOrbit}</span>
                    </div>

                    {/* SCRAM overlay */}
                    {isScrammed && (
                        <div style={ps.scramOverlay}>
                            <span style={ps.scramText}>{scramActive}</span>
                        </div>
                    )}

                    {/* Cherenkov label */}
                    {(reactorData?.power || 0) > 5 && !isScrammed && (
                        <div style={ps.cherenkovLabel}>
                            <div style={ps.cherenkovDot} />
                            <span style={ps.cherenkovText}>{cherenkov}</span>
                        </div>
                    )}
                </div>

                {/* ── RIGHT PANEL — Control Panel (tab Kontrol saja) ── */}
                <ControlPanel
                    rodPositions={rodPositions}
                    reactorData={reactorData}
                    isScrammed={isScrammed}
                    scrammedRods={scrammedRods}
                    shiftPressed={shiftPressed}
                    lastAction={lastAction}
                    apiStatus={apiStatus}
                    onlyControl={true}   // ✅ prop baru: hanya tampilkan tab kontrol
                    movingRods={movingRods}   // ← NEW
                    onStartHold={startHold}   // ← NEW
                    onStopHold={stopHold}     // ← NEW
                    onScramRod={scramRod}              // ← NEW
                    onResetScramRod={resetScramRod}    // ← NEW
                    activeKeys={activeKeys}            // ← NEW
                />
            </div>

            <style>{`
                @keyframes scram-blink    {0%,100%{opacity:1;}50%{opacity:0.4;}}
                @keyframes cherenkov-blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
            `}</style>
        </div>
    )
}

const ps = {
    page: { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4f8', overflow: 'hidden', position: 'relative' },
    body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' },
    scene: {
        flex: 1,           // ✅ ini yang bikin scene melebar otomatis
        position: 'relative',
        overflow: 'hidden',
        background: '#dce8f5',
        transition: 'flex 0.3s ease',  // ✅ smooth transition
        minWidth: 0,
    },
    toggleBtn: {
        position: 'absolute', top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30, width: 22, height: 48,
        background: '#ffffff', border: '1px solid #d0dce8',
        borderLeft: 'none', borderRadius: '0 6px 6px 0',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: '#4477aa',
        boxShadow: '2px 0 8px rgba(0,80,160,0.1)',
        transition: 'left 0.3s ease',
    },

    // ✅ Ganti panel — pakai width transition, bukan transform
    panel: {
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #d0dce8',
        boxShadow: '2px 0 12px rgba(0,80,160,0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
        overflow: 'hidden',
        // ✅ Animasi width — saat hide width jadi 0
        transition: 'width 0.3s ease',
    },
    overlayHint: {
        position: 'absolute', top: 10, left: 10,
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
    cherenkovText: { fontFamily: "'Orbitron',monospace", fontSize: 9, color: '#3366aa', letterSpacing: 1 },
}