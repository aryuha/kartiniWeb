// src/components/ui/ControlPanel.jsx
import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function ControlPanel({
    rodPositions,
    reactorData,
    isScrammed,
    scrammedRods,
    shiftPressed,
    lastAction,
    apiStatus,
    onlyControl = false,
    movingRods,
    onScramRod,
    onResetScramRod,
    activeKeys,
}) {
    const {
        apiOnline, apiOffline, apiError,
        interlock, interlockOn, interlockOff,
        interlockSubOn, interlockSubOff,
        title, t,
    } = useLanguage()

    const apiColor = {
        connected: '#007744', disconnected: '#886600', error: '#cc2200',
    }
    const apiLabel = {
        connected: apiOnline, disconnected: apiOffline, error: apiError,
    }

    return (
        <div style={s.panel}>

            {/* ── Header ── */}
            <div style={s.header}>
                <div style={s.headerRow}>
                    <span style={s.panelTitle}>{title || 'PANEL KONTROL'}</span>
                    <div style={s.apiRow}>
                        <div style={{
                            ...s.dot,
                            background: apiColor[apiStatus] || '#6699bb',
                        }} />
                        <span style={s.apiText}>
                            {apiLabel[apiStatus] || apiOffline}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Divider biru ── */}
            <div style={s.blueLine} />

            {/* ── Body ── */}
            <div style={s.body}>

                {/* Interlock Status */}
                <div style={{
                    ...s.interlockBox,
                    borderColor: shiftPressed ? '#00aa55' : '#dd3300',
                    background: shiftPressed ? '#e8f8ee' : '#fff0ec',
                }}>
                    <div style={s.interlockRow}>
                        <div style={{
                            ...s.dot,
                            background: shiftPressed ? '#00aa55' : '#dd3300',
                        }} />
                        <span style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 11, fontWeight: 700,
                            color: shiftPressed ? '#007733' : '#bb2200',
                        }}>
                            {interlock} {shiftPressed ? interlockOn : interlockOff}
                        </span>
                    </div>
                    <p style={s.interlockSub}>
                        {shiftPressed ? interlockSubOn : interlockSubOff}
                    </p>
                </div>

                {/* Last Action */}
                {lastAction && (
                    <div style={{
                        ...s.lastAction,
                        borderColor:
                            lastAction.type === 'success' ? '#00aa55'
                                : lastAction.type === 'blocked' ? '#cc8800'
                                    : '#dd3300',
                        background:
                            lastAction.type === 'success' ? '#e8f8ee'
                                : lastAction.type === 'blocked' ? '#fff8e8'
                                    : '#fff0ec',
                    }}>
                        <span style={{
                            fontSize: 11,
                            color:
                                lastAction.type === 'success' ? '#007733'
                                    : lastAction.type === 'blocked' ? '#885500'
                                        : '#cc2200',
                        }}>
                            {lastAction.message}
                        </span>
                    </div>
                )}

                {/* ── SCRAM Section ── */}
                <ScramSection
                    scrammedRods={scrammedRods}
                    activeKeys={activeKeys}
                    onScramRod={onScramRod}
                    onResetScramRod={onResetScramRod}
                />

                {/* ── Arrow Control Section ── */}
                <ArrowControlSection
                    rodPositions={rodPositions}
                    scrammedRods={scrammedRods}
                    isScrammed={isScrammed}
                    activeKeys={activeKeys}
                    shiftPressed={shiftPressed}
                    movingRods={movingRods}
                />

            </div>
        </div>
    )
}

// ─────────────────────────────────────────
// SCRAM Section
// ─────────────────────────────────────────
function ScramSection({ scrammedRods, activeKeys, onScramRod, onResetScramRod }) {
    const rods = [
        { key: 'safety', label: 'SAFETY', kbd: 'R', activeKey: 'scramSafety' },
        { key: 'shim', label: 'SHIM', kbd: 'T', activeKey: 'scramShim' },
        { key: 'regulating', label: 'REGULATING', kbd: 'Y', activeKey: 'scramReg' },
    ]

    return (
        <div style={sc.wrap}>
            {/* Title row */}
            <div style={sc.titleRow}>
                <span style={sc.title}>SCRAM</span>
            </div>

            {/* Rod columns */}
            <div style={sc.row}>
                {rods.map(rod => {
                    const isScrammed = scrammedRods?.[rod.key] || false
                    const isActive = activeKeys?.[rod.activeKey] || false

                    return (
                        <div key={rod.key} style={sc.col}>
                            {/* Label */}
                            <span style={sc.label}>{rod.label}</span>

                            {/* Tombol SCRAM / Reset */}
                            {isScrammed ? (
                                <button
                                    style={sc.resetBtn}
                                    onClick={() => onResetScramRod?.(rod.key)}
                                    title={`Reset SCRAM ${rod.label}`}
                                >
                                    ↺
                                </button>
                            ) : (
                                <button
                                    style={{
                                        ...sc.scramBtn,
                                        backgroundColor: isActive ? '#ff0000' : '#cc2200',
                                        boxShadow: isActive
                                            ? '0 0 14px #ff0000, 0 0 28px #ff000055'
                                            : '0 2px 6px rgba(180,0,0,0.35)',
                                        transform: isActive ? 'scale(0.90)' : 'scale(1)',
                                    }}
                                    onMouseDown={() => onScramRod?.(rod.key)}
                                    title={`SCRAM ${rod.label}`}
                                >
                                    {/* kotak solid */}
                                    <span style={sc.scramIcon}>■</span>
                                </button>
                            )}

                            {/* Keyboard badge */}
                            <div style={{
                                ...sc.kbdBadge,
                                borderColor: isScrammed ? '#aabbcc' : '#cc2200',
                                color: isScrammed ? '#aabbcc' : '#cc2200',
                                background: isScrammed ? '#f0f0f0' : '#fff0ec',
                                boxShadow: isActive
                                    ? '0 0 8px #ff000066'
                                    : 'none',
                            }}>
                                {rod.kbd}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────
// Arrow Control Section (tanpa tombol mouse)
// ─────────────────────────────────────────
function ArrowControlSection({
    rodPositions,
    scrammedRods,
    isScrammed,
    activeKeys,
    shiftPressed,
    movingRods,
}) {
    const { t } = useLanguage()
    const rods = [
        {
            key: 'safety',
            label: 'SAFETY',
            upKey: 'safetyUp',
            downKey: 'safetyDown',
            kbdUp: 'Q',
            kbdDown: 'A',
            color: '#cc2200',
        },
        {
            key: 'shim',
            label: 'SHIM',
            upKey: 'shimUp',
            downKey: 'shimDown',
            kbdUp: 'W',
            kbdDown: 'S',
            color: '#886600',
        },
        {
            key: 'regulating',
            label: 'REGULATING',
            upKey: 'regUp',
            downKey: 'regDown',
            kbdUp: 'E',
            kbdDown: 'D',
            color: '#006633',
        },
    ]

    return (
        <div style={ar.wrap}>
            {/* ── Header kolom ── */}
            <div style={ar.headerRow}>
                <div style={ar.emptyCell} />
                {rods.map(rod => (
                    <div key={rod.key} style={ar.colHeader}>
                        <span style={{ ...ar.colLabel, color: rod.color }}>
                            {rod.label}
                        </span>
                        {/* Posisi % */}
                        <span style={{ ...ar.colPct, color: rod.color }}>
                            {(isScrammed || scrammedRods?.[rod.key]
                                ? 0
                                : rodPositions?.[rod.key] || 0
                            ).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Progress bar row ── */}
            <div style={ar.barRow}>
                <div style={ar.emptyCell} />
                {rods.map(rod => {
                    const val = isScrammed || scrammedRods?.[rod.key]
                        ? 0
                        : rodPositions?.[rod.key] || 0
                    const isMoving = movingRods?.[rod.key] || false
                    return (
                        <div key={rod.key} style={ar.barWrap}>
                            <div style={ar.barTrack}>
                                <div style={{
                                    ...ar.barFill,
                                    width: `${val}%`,
                                    background: isMoving
                                        ? 'linear-gradient(90deg,#FF000088,#FF0000)'
                                        : `linear-gradient(90deg,${rod.color}88,${rod.color})`,
                                    boxShadow: isMoving ? '0 0 6px #FF000066' : 'none',
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Tombol ATAS ── */}
            <div style={ar.btnRow}>
                <div style={ar.rowLabel}>
                    <span style={ar.rowLabelText}>▲</span>
                </div>
                {rods.map(rod => {
                    const isActive = activeKeys?.[rod.upKey] || false
                    const isScrm = scrammedRods?.[rod.key] || isScrammed

                    return (
                        <div key={rod.key} style={ar.btnCell}>
                            <ArrowBtn
                                direction="up"
                                isActive={isActive}
                                isDisabled={isScrm}
                                color={rod.color}
                                kbdHint={`Shift+${rod.kbdUp}`}
                            />
                        </div>
                    )
                })}
            </div>

            {/* ── Tombol BAWAH ── */}
            <div style={ar.btnRow}>
                <div style={ar.rowLabel}>
                    <span style={ar.rowLabelText}>▼</span>
                </div>
                {rods.map(rod => {
                    const isActive = activeKeys?.[rod.downKey] || false
                    const isScrm = scrammedRods?.[rod.key] || isScrammed

                    return (
                        <div key={rod.key} style={ar.btnCell}>
                            <ArrowBtn
                                direction="down"
                                isActive={isActive}
                                isDisabled={isScrm}
                                color={rod.color}
                                kbdHint={`Shift+${rod.kbdDown}`}
                            />
                        </div>
                    )
                })}
            </div>

            {/* ── INTERLOCK indicator ── */}
            <div style={ar.interlockRow}>
                <span style={ar.interlockLabel}>INTERLOCK</span>
                <div style={{
                    ...ar.interlockLed,
                    backgroundColor: shiftPressed ? '#00dd55' : '#ffdd00',
                    boxShadow: shiftPressed
                        ? '0 0 10px #00dd55, 0 0 20px #00dd5566'
                        : '0 0 10px #ffdd00, 0 0 20px #ffdd0066',
                }} />
                <span style={{
                    ...ar.interlockStatus,
                    color: shiftPressed ? '#007733' : '#886600',
                }}>
                    {shiftPressed ? t('interlockOn') : t('interlockOff')}
                </span>
            </div>

        </div>
    )
}

// ─────────────────────────────────────────
// Arrow Button - hanya visual (no onClick)
// ─────────────────────────────────────────
function ArrowBtn({ direction, isActive, isDisabled, color, kbdHint }) {
    const isUp = direction === 'up'

    // Warna aktif: merah untuk naik, hijau untuk turun (sesuai gambar)
    const activeColor = isUp ? '#dd2200' : '#22aa44'
    const idleColor = isUp ? '#cc220033' : '#22aa4433'
    const borderActive = isUp ? '#ff4422' : '#44cc66'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* Tombol panah */}
            <div style={{
                width: 52, height: 44,
                borderRadius: 6,
                border: `2px solid ${isDisabled
                    ? '#c0c8d0'
                    : isActive
                        ? borderActive
                        : `${color}66`
                    }`,
                background: isDisabled
                    ? '#e8ecf0'
                    : isActive
                        ? activeColor
                        : idleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s',
                boxShadow: isActive && !isDisabled
                    ? `0 0 12px ${activeColor}99, 0 0 24px ${activeColor}44`
                    : 'none',
                transform: isActive ? 'scale(0.93)' : 'scale(1)',
                userSelect: 'none',
            }}>
                {/* Segitiga panah */}
                <div style={{
                    width: 0, height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    ...(isUp
                        ? {
                            borderBottom: `18px solid ${isDisabled ? '#a0a8b0' : isActive ? '#ffffff' : `${color}cc`
                                }`,
                        }
                        : {
                            borderTop: `18px solid ${isDisabled ? '#a0a8b0' : isActive ? '#ffffff' : `${color}cc`
                                }`,
                        }
                    ),
                    filter: isActive && !isDisabled ? 'drop-shadow(0 0 4px #ffffff88)' : 'none',
                    transition: 'all 0.1s',
                }} />
            </div>

            {/* Keyboard hint */}
            <kbd style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 7, fontWeight: isActive ? 900 : 400,
                padding: '2px 4px',
                border: `1px solid ${isDisabled
                    ? '#c0c8d0'
                    : isActive
                        ? color
                        : `${color}66`
                    }`,
                borderRadius: 3,
                color: isDisabled
                    ? '#a0a8b0'
                    : isActive ? color : `${color}88`,
                background: isActive && !isDisabled
                    ? `${color}22`
                    : 'transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.1s',
            }}>
                {kbdHint}
            </kbd>
        </div>
    )
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

// SCRAM section styles
const sc = {
    wrap: {
        border: '1px solid #ee4422',
        borderRadius: 6,
        padding: '8px 10px',
        background: '#fff5f3',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 11, fontWeight: 700,
        color: '#cc2200', letterSpacing: 1,
    },
    hint: {
        fontSize: 9, color: '#aa6655', fontStyle: 'italic',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: 6,
    },
    col: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
    },
    label: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700,
        color: '#664433', letterSpacing: 0.5,
    },
    scramBtn: {
        width: 40, height: 40,
        border: '2px solid #ff0000',
        borderRadius: 4,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
    },
    scramIcon: {
        fontSize: 16, color: '#ffffff', lineHeight: 1,
    },
    resetBtn: {
        width: 40, height: 40,
        border: '2px solid #00aa55',
        borderRadius: 4,
        cursor: 'pointer',
        background: '#e8f8ee',
        color: '#007733',
        fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
        userSelect: 'none',
    },
    kbdBadge: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 700,
        padding: '2px 8px',
        border: '1px solid',
        borderRadius: 3,
        transition: 'all 0.1s',
    },
}

// Arrow control styles
const ar = {
    wrap: {
        border: '1px solid #c8d8e8',
        borderRadius: 8,
        padding: '10px 10px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    headerRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
    },
    emptyCell: {
        width: 28, flexShrink: 0,
    },
    colHeader: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
    colLabel: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700,
        letterSpacing: 0.5,
    },
    colPct: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 11, fontWeight: 900,
    },
    barRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    barWrap: {
        flex: 1,
    },
    barTrack: {
        height: 6,
        background: '#eef2f6',
        borderRadius: 3,
        border: '1px solid #d0dce8',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
        transition: 'width 0.15s ease, background 0.15s ease',
        minWidth: 0,
    },
    btnRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    rowLabel: {
        width: 28, flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabelText: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 12, color: '#7799bb', fontWeight: 700,
    },
    btnCell: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
    },
    interlockRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 4,
        borderTop: '1px solid #e0eaf2',
        marginTop: 2,
    },
    interlockLabel: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700,
        color: '#7799bb', letterSpacing: 1,
    },
    interlockLed: {
        width: 14, height: 14,
        borderRadius: '50%',
        flexShrink: 0,
        transition: 'all 0.2s',
    },
    interlockStatus: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700,
        letterSpacing: 0.5,
        transition: 'color 0.2s',
    },
}

// Main panel styles
const s = {
    panel: {
        width: 300, height: '100%',
        background: '#f5f8fc',
        borderLeft: '1px solid #c8d8e8',
        boxShadow: '-2px 0 12px rgba(0,80,160,0.08)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Rajdhani',sans-serif",
        flexShrink: 0,
    },
    header: {
        padding: '12px 14px 10px',
        background: '#ffffff',
        flexShrink: 0,
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blueLine: {
        height: 2,
        background: 'linear-gradient(90deg, #0055aa, #0099ff)',
        flexShrink: 0,
    },
    panelTitle: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 13, fontWeight: 700,
        color: '#0055aa', letterSpacing: 2,
    },
    apiRow: {
        display: 'flex', alignItems: 'center', gap: 5,
    },
    apiText: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, color: '#7799bb', letterSpacing: 1,
    },
    dot: {
        width: 8, height: 8,
        borderRadius: '50%', flexShrink: 0,
    },
    body: {
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        minHeight: 0,
        padding: '10px 12px',
        display: 'flex', flexDirection: 'column',
        gap: 9,
    },
    interlockBox: {
        border: '1px solid',
        borderRadius: 6,
        padding: '9px 12px',
        display: 'flex', flexDirection: 'column',
        gap: 4, transition: 'all 0.2s',
    },
    interlockRow: {
        display: 'flex', alignItems: 'center', gap: 8,
    },
    interlockSub: {
        fontSize: 11, color: '#5a7a9a',
        margin: 0, paddingLeft: 16,
    },
    lastAction: {
        border: '1px solid',
        borderRadius: 4,
        padding: '6px 10px',
    },
}