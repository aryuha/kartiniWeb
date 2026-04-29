// src/components/ui/ControlPanel.jsx
import React, { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function ControlPanel({
    nickname,
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
    isReactorActive,    
    onPowerToggle,      

}) {
    const {
        apiOnline, apiOffline, apiError,
        title, t,
    } = useLanguage()

    const isPowerOn = isReactorActive ?? false;

    const handlePowerToggle = () => {
        if (onPowerToggle) onPowerToggle();
    }

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

                    {nickname ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            backgroundColor: '#EEF4FF',
                            border: '1px solid #c0d4f0',
                            borderRadius: 6, padding: '4px 10px',
                        }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: 4,
                                backgroundColor: '#0055aa',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Orbitron',monospace",
                                fontSize: 9, fontWeight: 700, color: '#ffffff', flexShrink: 0,
                            }}>
                                {nickname.charAt(0)}
                            </div>
                            <span style={{
                                fontFamily: "'Orbitron',monospace",
                                fontSize: 10, fontWeight: 700,
                                color: '#0055aa', letterSpacing: 1,
                            }}>
                                {nickname}
                            </span>
                        </div>
                    ) : (
                        <div style={s.apiRow}>
                            <div style={{ ...s.dot, background: apiColor[apiStatus] || '#6699bb' }} />
                            <span style={s.apiText}>{apiLabel[apiStatus] || apiOffline}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Divider biru ── */}
            <div style={s.blueLine} />

            {/* ── Body ── */}
            <div style={s.body}>

                {/* ══════════════════════════════════
            TOMBOL POWER ON / POWER OFF
            Menggantikan Interlock Box
        ══════════════════════════════════ */}
                <PowerOnButton
                    isPowerOn={isPowerOn}
                    isScrammed={isScrammed}
                    onToggle={handlePowerToggle}
                    rodPositions={rodPositions}
                />

                {/* ── Last Action ── */}
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
                    isPowerOn={isPowerOn}          
                />

                {/* ── Arrow Control Section ── */}
                <ArrowControlSection
                    rodPositions={rodPositions}
                    scrammedRods={scrammedRods}
                    isScrammed={isScrammed}
                    activeKeys={activeKeys}
                    shiftPressed={shiftPressed && isPowerOn}
                    movingRods={movingRods}
                    isPowerOn={isPowerOn}           
                />

            </div>
        </div>
    )
}

// ════════════════════════════════════════
// POWER ON BUTTON — Gatekeeper Kontrol
// ════════════════════════════════════════
function PowerOnButton({ isPowerOn, isScrammed, onToggle, rodPositions }) {
    const { language } = useLanguage()
    const isId = language !== 'en'
    const [showWarning, setShowWarning] = useState(false)
    // Saat SCRAM, power otomatis tidak bisa ON
    const isLocked = isScrammed && isPowerOn

    // ── CEK apakah semua rod sudah 0% ──
    const allRodsZero =
        (rodPositions?.safety || 0) === 0 &&
        (rodPositions?.shim || 0) === 0 &&
        (rodPositions?.regulating || 0) === 0

    // ── Handle klik tombol ──
    const handleClick = () => {
        // Jika mau POWER OFF tapi rod belum 0%
        if (isPowerOn && !allRodsZero) {
            setShowWarning(true)  
            return
        }
        onToggle()
    }

    return (

        <>
            {/* ── WARNING POPUP ── */}
            {showWarning && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(3px)',
                }}>
                    <div style={{
                        position: 'relative',
                        width: 340,
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        padding: '24px 22px',
                        boxShadow: '0 16px 48px rgba(200,0,0,0.25)',
                        border: '2px solid #ee4422',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        {/* Top accent merah */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: 3,
                            background: 'linear-gradient(90deg, #cc2200, #ff4422)',
                            borderRadius: '10px 10px 0 0',
                        }} />

                        {/* Icon warning */}
                        <div style={{
                            width: 48, height: 48,
                            borderRadius: '50%',
                            backgroundColor: '#fff0ec',
                            border: '2px solid #ee4422',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            marginTop: 4,
                        }}>
                            ⚠️
                        </div>

                        {/* Judul */}
                        <div style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 11, fontWeight: 700,
                            color: '#cc2200', letterSpacing: 1.5,
                            textAlign: 'center',
                        }}>
                            {isId ? 'PERINGATAN!' : 'WARNING!'}
                        </div>

                        {/* Pesan */}
                        <div style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 9,
                            color: '#445566',
                            textAlign: 'center',
                            lineHeight: 1.7,
                            letterSpacing: 0.5,
                        }}>
                            {isId
                                ? 'Turunkan semua batang kendali ke 0% sebelum mematikan reaktor!'
                                : 'Lower all control rods to 0% before powering off the reactor!'
                            }
                        </div>

                        {/* Info posisi rod saat ini */}
                        <div style={{
                            width: '100%',
                            background: '#fff5f3',
                            border: '1px solid #ffccbb',
                            borderRadius: 6,
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}>
                            {[
                                { label: 'SAFETY', val: rodPositions?.safety || 0, color: '#cc2200' },
                                { label: 'SHIM', val: rodPositions?.shim || 0, color: '#886600' },
                                { label: 'REGULATING', val: rodPositions?.regulating || 0, color: '#006633' },
                            ].map(rod => (
                                <div key={rod.label} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 8, fontWeight: 700,
                                        color: rod.color,
                                    }}>
                                        {rod.label}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Orbitron',monospace",
                                        fontSize: 9, fontWeight: 900,
                                        color: rod.val > 0 ? '#cc2200' : '#00aa55',
                                    }}>
                                        {rod.val.toFixed(1)}%
                                        {rod.val > 0 ? ' ✗' : ' ✓'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Tombol OK */}
                        <button
                            onClick={() => setShowWarning(false)}
                            style={{
                                width: '100%',
                                padding: '10px 0',
                                fontFamily: "'Orbitron',monospace",
                                fontSize: 10, fontWeight: 700,
                                letterSpacing: 2,
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #cc2200, #ee4422)',
                                color: '#ffffff',
                                boxShadow: '0 4px 14px rgba(200,0,0,0.3)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(200,0,0,0.45)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(200,0,0,0.3)'
                            }}
                        >
                            {isId ? 'MENGERTI' : 'Get It'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── CARD POWER BUTTON ── */}
            <div style={{
                borderRadius: 8,
                border: `2px solid ${isPowerOn ? '#00aa55' : '#c0d0e0'}`,
                background: isPowerOn ? '#f0fff6' : '#f8fafc',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.3s',
                boxShadow: isPowerOn
                    ? '0 0 12px rgba(0,170,85,0.2)'
                    : 'none',
            }}>
                {/* Status Row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 12, height: 12,
                            borderRadius: '50%',
                            background: isPowerOn ? '#00dd55' : '#c0c8d8',
                            boxShadow: isPowerOn
                                ? '0 0 8px #00dd55, 0 0 16px #00dd5566'
                                : 'none',
                            flexShrink: 0,
                            transition: 'all 0.3s',
                        }} />
                        <span style={{
                            fontFamily: "'Orbitron',monospace",
                            fontSize: 10, fontWeight: 700,
                            letterSpacing: 1,
                            color: isPowerOn ? '#006633' : '#7799bb',
                            transition: 'color 0.3s',
                        }}>
                            {isPowerOn
                                ? (isId ? 'REAKTOR AKTIF' : 'REACTOR ACTIVE')
                                : (isId ? 'STANDBY' : 'STANDBY')
                            }
                        </span>
                    </div>
                </div>

                {/* Tombol POWER */}
                <button
                    onClick={handleClick}  
                    style={{
                        width: '100%',
                        padding: '10px 0',
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: 2,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        color: '#ffffff',
                        background: isPowerOn
                            ? 'linear-gradient(135deg, #cc2200, #ee3311)'
                            : 'linear-gradient(135deg, #005522, #00aa55)',
                        boxShadow: isPowerOn
                            ? '0 4px 14px rgba(200,0,0,0.35)'
                            : '0 4px 14px rgba(0,150,80,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <span style={{ fontSize: 14 }}>⏻</span>
                    <span>
                        {isPowerOn ? 'POWER OFF' : 'POWER ON'}
                    </span>
                </button>

                {/* Hint text */}
                <p style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 8,
                    color: isPowerOn ? '#006633' : '#99aabc',
                    textAlign: 'center',
                    margin: 0,
                    letterSpacing: 0.5,
                    transition: 'color 0.3s',
                }}>
                    {isPowerOn
                        ? (isId ? 'Semua kontrol reaktor aktif' : 'All reactor controls enabled')
                        : (isId ? 'Tekan untuk mengaktifkan reaktor' : 'Press to activate reactor controls')
                    }
                </p>
            </div>
        </>
    )
}

// ════════════════════════════════════════
// SCRAM Section
// ════════════════════════════════════════
function ScramSection({ scrammedRods, activeKeys, onScramRod, onResetScramRod, isPowerOn }) {
    const rods = [
        { key: 'safety', label: 'SAFETY', kbd: 'R', activeKey: 'scramSafety' },
        { key: 'shim', label: 'SHIM', kbd: 'T', activeKey: 'scramShim' },
        { key: 'regulating', label: 'REGULATING', kbd: 'Y', activeKey: 'scramReg' },
    ]

    return (
        <div style={sc.wrap}>
            <div style={sc.titleRow}>
                <span style={sc.title}>SCRAM</span>
            </div>

            <div style={sc.row}>
                {rods.map(rod => {
                    const isScrammed = scrammedRods?.[rod.key] || false
                    const isActive = activeKeys?.[rod.activeKey] || false

                    return (
                        <div key={rod.key} style={sc.col}>
                            <span style={sc.label}>{rod.label}</span>

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
                                        backgroundColor: !isPowerOn
                                            ? '#e0e0e0'
                                            : isActive ? '#ff0000' : '#cc2200',
                                        boxShadow: !isPowerOn
                                            ? 'none'
                                            : isActive
                                                ? '0 0 14px #ff0000, 0 0 28px #ff000055'
                                                : '0 2px 6px rgba(180,0,0,0.35)',
                                        transform: isActive ? 'scale(0.90)' : 'scale(1)',
                                        cursor: isPowerOn ? 'pointer' : 'not-allowed',
                                        opacity: isPowerOn ? 1 : 0.5,
                                    }}
                                    onMouseDown={() => isPowerOn && onScramRod?.(rod.key)}
                                    title={isPowerOn
                                        ? `SCRAM ${rod.label}`
                                        : 'Aktifkan Power ON terlebih dahulu'
                                    }
                                >
                                    <span style={sc.scramIcon}>■</span>
                                </button>
                            )}

                            <div style={{
                                ...sc.kbdBadge,
                                borderColor: isScrammed ? '#aabbcc' : '#cc2200',
                                color: isScrammed ? '#aabbcc' : '#cc2200',
                                background: isScrammed ? '#f0f0f0' : '#fff0ec',
                                boxShadow: isActive ? '0 0 8px #ff000066' : 'none',
                                opacity: isPowerOn ? 1 : 0.45,
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

// ════════════════════════════════════════
// Arrow Control Section
// ════════════════════════════════════════
function ArrowControlSection({
    rodPositions,
    scrammedRods,
    isScrammed,
    activeKeys,
    shiftPressed,
    movingRods,
    isPowerOn,         
}) {
    const { t } = useLanguage()

    const rods = [
        {
            key: 'safety', label: 'SAFETY',
            upKey: 'safetyUp', downKey: 'safetyDown',
            kbdUp: 'Q', kbdDown: 'A', color: '#cc2200',
        },
        {
            key: 'shim', label: 'SHIM',
            upKey: 'shimUp', downKey: 'shimDown',
            kbdUp: 'W', kbdDown: 'S', color: '#886600',
        },
        {
            key: 'regulating', label: 'REGULATING',
            upKey: 'regUp', downKey: 'regDown',
            kbdUp: 'E', kbdDown: 'D', color: '#006633',
        },
    ]

    return (
        <div style={ar.wrap}>

            {/* Header kolom */}
            <div style={ar.headerRow}>
                <div style={ar.emptyCell} />
                {rods.map(rod => (
                    <div key={rod.key} style={ar.colHeader}>
                        <span style={{ ...ar.colLabel, color: rod.color }}>
                            {rod.label}
                        </span>
                        <span style={{ ...ar.colPct, color: rod.color }}>
                            {(isScrammed || scrammedRods?.[rod.key]
                                ? 0
                                : rodPositions?.[rod.key] || 0
                            ).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
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

            {/* Tombol ATAS */}
            <div style={ar.btnRow}>
                <div style={ar.rowLabel}>
                    <span style={ar.rowLabelText}>▲</span>
                </div>
                {rods.map(rod => {
                    const isActive = activeKeys?.[rod.upKey] || false
                    const isScrm = scrammedRods?.[rod.key] || isScrammed
                    // ← disabled juga saat Power OFF
                    const isDisabled = isScrm || !isPowerOn
                    return (
                        <div key={rod.key} style={ar.btnCell}>
                            <ArrowBtn
                                direction="up"
                                isActive={isActive && isPowerOn}
                                isDisabled={isDisabled}
                                color={rod.color}
                                kbdHint={`Shift+${rod.kbdUp}`}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Tombol BAWAH */}
            <div style={ar.btnRow}>
                <div style={ar.rowLabel}>
                    <span style={ar.rowLabelText}>▼</span>
                </div>
                {rods.map(rod => {
                    const isActive = activeKeys?.[rod.downKey] || false
                    const isScrm = scrammedRods?.[rod.key] || isScrammed
                    const isDisabled = isScrm || !isPowerOn
                    return (
                        <div key={rod.key} style={ar.btnCell}>
                            <ArrowBtn
                                direction="down"
                                isActive={isActive && isPowerOn}
                                isDisabled={isDisabled}
                                color={rod.color}
                                kbdHint={`Shift+${rod.kbdDown}`}
                            />
                        </div>
                    )
                })}
            </div>

            {/* ── Power Status Footer ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                
                gap: 8,
                paddingTop: 4,
                borderTop: '1px solid #e0eaf2',
                marginTop: 2,
            }}>
                <span style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 8, fontWeight: 700,
                    color: '#7799bb', letterSpacing: 1,
                }}>
                    INTERLOCK
                </span>

                {/* Indikator LED + Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                }}></div>

                {/* LED dot */}
                <div style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    backgroundColor: shiftPressed ? '#ffdd00' : '#c0c8d8',
                    boxShadow: shiftPressed
                        ? '0 0 8px #ffdd00, 0 0 16px #ffdd0066'
                        : 'none',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                }} />

                {/* Label ON/OFF */}
                <span style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 8, fontWeight: 700,
                    letterSpacing: 0.5,
                    color: shiftPressed ? '#886600' : '#8899aa',
                    transition: 'color 0.15s',
                }}>
                    {shiftPressed ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    )
}

// ════════════════════════════════════════
// Arrow Button
// ════════════════════════════════════════
function ArrowBtn({ direction, isActive, isDisabled, color, kbdHint }) {
    const isUp = direction === 'up'
    const activeColor = isUp ? '#dd2200' : '#22aa44'
    const idleColor = isUp ? '#cc220033' : '#22aa4433'
    const borderActive = isUp ? '#ff4422' : '#44cc66'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
                width: 52, height: 44,
                borderRadius: 6,
                border: `2px solid ${isDisabled
                    ? '#c0c8d0'
                    : isActive ? borderActive : `${color}66`
                    }`,
                background: isDisabled
                    ? '#e8ecf0'
                    : isActive ? activeColor : idleColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.1s',
                boxShadow: isActive && !isDisabled
                    ? `0 0 12px ${activeColor}99, 0 0 24px ${activeColor}44`
                    : 'none',
                transform: isActive ? 'scale(0.93)' : 'scale(1)',
                userSelect: 'none',
                cursor: isDisabled ? 'not-allowed' : 'default',
            }}>
                <div style={{
                    width: 0, height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    ...(isUp ? {
                        borderBottom: `18px solid ${isDisabled ? '#a0a8b0'
                            : isActive ? '#ffffff'
                                : `${color}cc`
                            }`,
                    } : {
                        borderTop: `18px solid ${isDisabled ? '#a0a8b0'
                            : isActive ? '#ffffff'
                                : `${color}cc`
                            }`,
                    }),
                    filter: isActive && !isDisabled ? 'drop-shadow(0 0 4px #ffffff88)' : 'none',
                    transition: 'all 0.1s',
                }} />
            </div>

            <kbd style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 7, fontWeight: isActive ? 900 : 400,
                padding: '2px 4px',
                border: `1px solid ${isDisabled
                    ? '#c0c8d0'
                    : isActive ? color : `${color}66`
                    }`,
                borderRadius: 3,
                color: isDisabled ? '#a0a8b0' : isActive ? color : `${color}88`,
                background: isActive && !isDisabled ? `${color}22` : 'transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.1s',
                opacity: isDisabled ? 0.5 : 1,
            }}>
                {kbdHint}
            </kbd>
        </div>
    )
}

// ════════════════════════════════════════
// STYLES
// ════════════════════════════════════════
const sc = {
    wrap: {
        border: '1px solid #ee4422', borderRadius: 6,
        padding: '8px 10px', background: '#fff5f3',
    },
    titleRow: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 11, fontWeight: 700,
        color: '#cc2200', letterSpacing: 1,
    },
    row: { display: 'flex', justifyContent: 'space-around', gap: 6 },
    col: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 },
    label: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700,
        color: '#664433', letterSpacing: 0.5,
    },
    scramBtn: {
        width: 40, height: 40,
        border: '2px solid #ff0000', borderRadius: 4,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
        userSelect: 'none', WebkitUserSelect: 'none',
    },
    scramIcon: { fontSize: 16, color: '#ffffff', lineHeight: 1 },
    resetBtn: {
        width: 40, height: 40,
        border: '2px solid #00aa55', borderRadius: 4,
        cursor: 'pointer', background: '#e8f8ee',
        color: '#007733', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s', userSelect: 'none',
    },
    kbdBadge: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 700,
        padding: '2px 8px', border: '1px solid',
        borderRadius: 3, transition: 'all 0.1s',
    },
}

const ar = {
    wrap: {
        border: '1px solid #c8d8e8', borderRadius: 8,
        padding: '10px 10px', background: '#ffffff',
        display: 'flex', flexDirection: 'column', gap: 8,
    },
    headerRow: { display: 'flex', alignItems: 'flex-end', gap: 4 },
    emptyCell: { width: 28, flexShrink: 0 },
    colHeader: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 2,
    },
    colLabel: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
    },
    colPct: { fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 900 },
    barRow: { display: 'flex', alignItems: 'center', gap: 4 },
    barWrap: { flex: 1 },
    barTrack: {
        height: 6, background: '#eef2f6', borderRadius: 3,
        border: '1px solid #d0dce8', overflow: 'hidden',
    },
    barFill: {
        height: '100%', borderRadius: 3,
        transition: 'width 0.15s ease, background 0.15s ease', minWidth: 0,
    },
    btnRow: { display: 'flex', alignItems: 'center', gap: 4 },
    rowLabel: {
        width: 28, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    rowLabelText: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 12, color: '#7799bb', fontWeight: 700,
    },
    btnCell: { flex: 1, display: 'flex', justifyContent: 'center' },
}

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
    header: { padding: '12px 14px 10px', background: '#ffffff', flexShrink: 0 },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
    apiRow: { display: 'flex', alignItems: 'center', gap: 5 },
    apiText: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, color: '#7799bb', letterSpacing: 1,
    },
    dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
    body: {
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        minHeight: 0, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 9,
    },
    lastAction: {
        border: '1px solid', borderRadius: 4, padding: '6px 10px',
    },
}