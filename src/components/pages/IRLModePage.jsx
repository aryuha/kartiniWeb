// src/components/pages/IRLModePage.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactorScene from '../three/ReactorScene'
import ErrorBoundary from '../ui/ErrorBoundary'
import { useIRLStream, CONNECTION_STATUS } from '../../hooks/useIRLStream'
import { useLanguage } from '../../context/LanguageContext'

// ─── Warna tema — selaras dengan SimulationPage ──────────────
const C = {
    bg: 'rgba(255,255,255,0.95)',
    border: '#d0dce8',
    text: '#334455',
    dim: '#7799bb',
    accent: '#0055aa',
    teal: '#0088cc',
    red: '#ef4444',
    amber: '#f59e0b',
    green: '#22c55e',
    panelW: 210,
}

// ═══════════════════════════════════════════════════════
// CONNECTION BADGE
// ═══════════════════════════════════════════════════════
function ConnectionBadge({ status }) {
    const { t } = useLanguage()
    const color = {
        [CONNECTION_STATUS.CONNECTED]: C.green,
        [CONNECTION_STATUS.CONNECTING]: C.amber,
        [CONNECTION_STATUS.RECONNECTING]: C.amber,
        [CONNECTION_STATUS.ERROR]: C.red,
    }[status] ?? '#94a3b8'

    const label = {
        [CONNECTION_STATUS.CONNECTED]: t('irlStatusLive'),
        [CONNECTION_STATUS.CONNECTING]: t('irlStatusConn'),
        [CONNECTION_STATUS.RECONNECTING]: t('irlStatusReconn'),
        [CONNECTION_STATUS.ERROR]: t('irlStatusError'),
    }[status] ?? status

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${color}18`, border: `1px solid ${color}55`,
            borderRadius: 20, padding: '3px 10px',
        }}>
            <div style={{
                width: 7, height: 7, borderRadius: '50%', background: color,
                boxShadow: status === CONNECTION_STATUS.CONNECTED ? `0 0 6px ${color}` : 'none',
                animation: status === CONNECTION_STATUS.CONNECTED ? 'irl-pulse 2s ease infinite' : 'none',
            }} />
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 10, fontWeight: 600, color }}>
                {label}
            </span>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// HEADER BAR
// ═══════════════════════════════════════════════════════
function IRLHeaderBar({ onHome, reactorData, connectionStatus }) {
    const { t } = useLanguage()
    const powerNP = reactorData?.power_np1000 ?? 0
    const dataTime = reactorData?.data_time ?? '--'

    return (
        <div style={hb.bar}>
            <div style={hb.left}>
                <button style={hb.homeBtn} onClick={onHome}>{t('btnKembali')}</button>
                <div style={hb.div} />
                <div style={hb.titleGroup}>
                    <span style={hb.title}>{t('irlTitle')}</span>
                    <span style={hb.subtitle}>{t('irlSubtitle')}</span>
                </div>
            </div>

            <div style={hb.center}>
                <ConnectionBadge status={connectionStatus} />
                <div style={hb.div} />
                <div style={hb.mg}>
                    <span style={hb.ml}>{t('irlDataTime')}</span>
                    <span style={{ ...hb.tv, fontSize: 12 }}>{dataTime}</span>
                </div>
            </div>

            <div style={hb.right}>
                <div style={hb.mg}>
                    <span style={hb.ml}>{t('labelDaya')}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={hb.mv}>{powerNP.toFixed(2)}</span>
                        <span style={hb.unit}>kW</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const hb = {
    bar: {
        height: 56, background: '#ffffff', borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 2px 8px rgba(0,80,160,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 10, flexShrink: 0,
    },
    left: { display: 'flex', alignItems: 'center', gap: 10 },
    center: { display: 'flex', alignItems: 'center', gap: 10 },
    right: { display: 'flex', alignItems: 'center', gap: 12 },
    homeBtn: {
        background: '#f0f5fa', border: `1px solid #c0d0e0`, borderRadius: 4,
        color: C.accent, fontFamily: "'Poppins',sans-serif", fontSize: 8,
        padding: '5px 10px', cursor: 'pointer', letterSpacing: 0,
    },
    div: { width: 1, height: 28, background: C.border, flexShrink: 0 },
    titleGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
    title: { fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, lineHeight: 1 },
    subtitle: { fontFamily: "'Orbitron',monospace", fontSize: 8, color: C.dim, letterSpacing: 1, lineHeight: 1 },
    mg: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 },
    ml: { fontFamily: "'Poppins',sans-serif", fontSize: 11, color: C.dim, letterSpacing: 0, lineHeight: 1, whiteSpace: 'nowrap' },
    mv: { fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, lineHeight: 1, color: C.teal },
    tv: { fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: C.accent, lineHeight: 1, letterSpacing: 1 },
    unit: { fontFamily: "'Poppins',sans-serif", fontSize: 9, color: C.dim, fontWeight: 600 },
}

// ═══════════════════════════════════════════════════════
// REUSABLE: Panel container — konten selalu tampil
// ═══════════════════════════════════════════════════════
function Panel({ title, children }) {
    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{
                width: '100%', display: 'flex', alignItems: 'center',
                background: 'rgba(240,245,252,0.97)', border: `1px solid ${C.border}`,
                borderRadius: '5px 5px 0 0',
                padding: '5px 8px',
            }}>
                <span style={{
                    fontFamily: "'Poppins',sans-serif", fontSize: 9,
                    fontWeight: 600, color: C.accent, letterSpacing: 0.3,
                }}>
                    {title}
                </span>
            </div>
            <div style={{
                background: C.bg, border: `1px solid ${C.border}`,
                borderTop: 'none', borderRadius: '0 0 5px 5px',
                padding: '6px 8px',
            }}>
                {children}
            </div>
        </div>
    )
}

// ── Satu baris parameter: label | bar opsional | nilai ──
function ParamRow({ label, value, unit, barPct, barColor }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{
                fontFamily: "'Poppins',sans-serif", fontSize: 11,
                color: C.dim, letterSpacing: 0, minWidth: 90, flexShrink: 0,
            }}>
                {label}
            </span>
            {barPct !== undefined && (
                <div style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: 'rgba(0,0,0,0.07)', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${Math.min(100, barPct)}%`,
                        background: barColor ?? C.accent,
                        transition: 'width 0.6s ease',
                    }} />
                </div>
            )}
            <span style={{
                fontFamily: "'Poppins',sans-serif", fontSize: 11,
                fontWeight: 600, color: C.text, whiteSpace: 'nowrap',
                minWidth: barPct !== undefined ? 54 : 'auto', textAlign: 'right',
            }}>
                {value} <span style={{ fontSize: 11, color: C.dim, fontWeight: 400 }}>{unit}</span>
            </span>
        </div>
    )
}

// ── Baris radiasi dengan dot warna-warni ──
function RadRow({ label, value }) {
    const color = value >= 50 ? C.red : value >= 10 ? C.amber : C.green
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{
                fontFamily: "'Poppins',sans-serif", fontSize: 11,
                color: C.dim, flex: 1, letterSpacing: 0,
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: "'Poppins',sans-serif", fontSize: 11,
                fontWeight: 600, color: C.text,
            }}>
                {value.toFixed(1)}
                <span style={{ fontSize: 11, fontWeight: 400, color: C.dim }}> µSv/h</span>
            </span>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// MONITOR SIDEBAR — semua panel dalam 1 tab yang bisa disembunyikan
// ═══════════════════════════════════════════════════════
function MonitorSidebar({ d, rodPositions }) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(true)

    const fuelPct = ((d.fuel_element_temp - 70) / (150 - 70)) * 100
    const waterPct = ((d.water_tank_temp - 20) / (60 - 20)) * 100
    const inletPct = ((d.inlet_he_temp - 20) / (60 - 20)) * 100
    const outPct = ((d.outlet_he_temp - 20) / (60 - 20)) * 100
    const fuelColor = d.fuel_element_temp > 120 ? C.red
        : d.fuel_element_temp > 95 ? C.amber : C.teal

    const W = C.panelW
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
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,80,160,0.14)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'all',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                {/* Header */}
                <div style={{
                    background: C.accent,
                    padding: '7px 10px 7px 12px',
                    borderRadius: '7px 7px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <span style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 9, fontWeight: 700,
                        color: '#fff', letterSpacing: 1.5, flex: 1,
                    }}>
                        ■ {t('irlTitle')}
                    </span>
                </div>

                {/* Scrollable panel list */}
                <div style={{ overflowY: 'auto', padding: '6px', flex: 1, minHeight: 0 }}>
                    <Panel title="⬡ Safety">
                        <ParamRow label="Position" value={rodPositions.safety.toFixed(1)} unit="%" barPct={rodPositions.safety} barColor={C.red} />
                    </Panel>
                    <Panel title="⬡ Shim">
                        <ParamRow label="Position" value={rodPositions.shim.toFixed(1)} unit="%" barPct={rodPositions.shim} barColor={C.amber} />
                    </Panel>
                    <Panel title="⬡ Regulating">
                        <ParamRow label="Position" value={rodPositions.regulating.toFixed(1)} unit="%" barPct={rodPositions.regulating} barColor={C.green} />
                    </Panel>
                    <Panel title="⬡ Reactor Core">
                        <ParamRow label="Fuel Element" value={d.fuel_element_temp.toFixed(2)} unit="°C" barPct={fuelPct} barColor={fuelColor} />
                    </Panel>
                    <Panel title="⬡ Pool Water">
                        <ParamRow label="Temperature" value={d.water_tank_temp.toFixed(3)} unit="°C" barPct={waterPct} barColor={C.accent} />
                        <ParamRow label="Level" value={d.water_tank_level.toFixed(2)} unit="cm" />
                        <ParamRow label="pH" value={d.water_ph.toFixed(3)} unit="" />
                        <ParamRow label="Inlet HE" value={d.inlet_he_temp.toFixed(3)} unit="°C" barPct={inletPct} barColor="#60a5fa" />
                        <ParamRow label="Outlet HE" value={d.outlet_he_temp.toFixed(3)} unit="°C" barPct={outPct} barColor="#93c5fd" />
                        <ParamRow label="Flowrate" value={d.water_flowrate.toFixed(1)} unit="lpm" />
                        <ParamRow label="Resistance In" value={d.water_resistance_input.toFixed(2)} unit="MΩCm" />
                        <ParamRow label="Resistance Out" value={d.water_resistance_output.toFixed(2)} unit="MΩCm" />
                    </Panel>
                    <Panel title="⬡ Operator PC">
                        <RadRow label="Reactor Deck" value={d.radiation_deck} />
                        <RadRow label="Subcritic Area" value={d.radiation_subcritic} />
                        <RadRow label="Demineralizer Area" value={d.radiation_demineralizer} />
                        <RadRow label="Column Thermal Area" value={d.radiation_column_thermal} />
                        <RadRow label="Bulkshielding Area" value={d.radiation_bulkshielding} />
                    </Panel>
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
                    background: C.accent,
                    border: `1px solid ${C.accent}88`,
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
                        IRL
                    </span>
                )}
            </button>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// DISCONNECTED OVERLAY
// ═══════════════════════════════════════════════════════
function DisconnectedOverlay({ status }) {
    const { t } = useLanguage()
    if (status === CONNECTION_STATUS.CONNECTED) return null
    const isRecon = status === CONNECTION_STATUS.RECONNECTING
    return (
        <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(240,245,255,0.65)', backdropFilter: 'blur(4px)',
            zIndex: 20, pointerEvents: 'none',
        }}>
            <div style={{
                border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '20px 36px', textAlign: 'center',
                background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 8px 32px rgba(0,80,160,0.12)',
            }}>
                {isRecon && (
                    <div style={{
                        width: 32, height: 32,
                        border: `2px solid ${C.border}`, borderTopColor: C.accent,
                        borderRadius: '50%',
                        animation: 'irl-spin 1s linear infinite', margin: '0 auto 14px',
                    }} />
                )}
                <p style={{
                    fontFamily: "'Poppins',sans-serif", fontSize: 12,
                    fontWeight: 700, color: C.accent, letterSpacing: 0, margin: 0,
                }}>
                    {isRecon ? t('irlReconnMsg') : t('irlConnMsg')}
                </p>
                <p style={{
                    fontFamily: "'Poppins',sans-serif", fontSize: 8,
                    color: C.dim, letterSpacing: 0, marginTop: 6, marginBottom: 0,
                }}>
                    /api/irl/stream
                </p>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function IRLModePage() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [isBooting, setIsBooting] = useState(true)

    const { reactorData, rodPositions, connectionStatus, isConnected } = useIRLStream()

    useEffect(() => {
        const t = setTimeout(() => setIsBooting(false), 1000)
        return () => clearTimeout(t)
    }, [])

    const handleHome = useCallback(() => navigate(-1), [navigate])

    const reactorDataForScene = {
        power_kw: reactorData.power_np1000,
        temperature: reactorData.fuel_element_temp,
        status: reactorData.status_reaktor,
    }

    const isOperating = isConnected
        && reactorData.status_reaktor === 'OPERATING'
        && reactorData.power_np1000 > 5

    return (
        <div style={s.page}>

            {/* Booting overlay */}
            {isBooting && (
                <div style={s.boot}>
                    <div style={s.spinner} />
                    <span style={s.bootTxt}>{t('irlInitMsg')}</span>
                </div>
            )}

            <IRLHeaderBar
                onHome={handleHome}
                reactorData={reactorData}
                connectionStatus={connectionStatus}
            />

            <div style={s.sceneWrap}>
                {/* 3D Scene */}
                <ErrorBoundary>
                    <ReactorScene
                        rodPositions={rodPositions}
                        reactorData={reactorDataForScene}
                        isScrammed={false}
                        movingRods={{}}
                        isReactorActive={isOperating}
                        liveData={reactorData}
                    />
                </ErrorBoundary>

                {/* ── MONITOR SIDEBAR (gabungan semua panel, bisa disembunyikan) ── */}
                <MonitorSidebar d={reactorData} rodPositions={rodPositions} />

                {/* Hint orbit */}
                <div style={s.hint}>
                    <span style={s.hintTxt}>{t('hintOrbit')}</span>
                </div>

                {/* Disconnected overlay */}
                <DisconnectedOverlay status={connectionStatus} />
            </div>

            <style>{`
                @keyframes irl-spin  { to { transform: rotate(360deg); } }
                @keyframes irl-pulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
            `}</style>
        </div>
    )
}

const s = {
    page: {
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: '#f0f4f8', overflow: 'hidden', position: 'relative',
    },
    sceneWrap: { flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 },
    boot: {
        position: 'absolute', inset: 0, background: '#f0f4f8', zIndex: 200,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
    },
    spinner: {
        width: 44, height: 44,
        border: `2px solid #c0d4e8`, borderTopColor: '#0077cc',
        borderRadius: '50%', animation: 'irl-spin 1s linear infinite',
    },
    bootTxt: { fontFamily: "'Poppins',sans-serif", color: '#0055aa', fontSize: 20, letterSpacing: 0 },
    hint: {
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.85)', border: `1px solid #c8d8e8`,
        borderRadius: 4, padding: '4px 10px',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 8px rgba(0,80,160,0.08)',
        pointerEvents: 'none',
    },
    hintTxt: { fontFamily: "'Rajdhani',sans-serif", fontSize: 11, color: '#5577aa' },
}
