// src/components/ui/RodControl.jsx
import React, { useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const ROD_COLORS = {
    safety: '#cc2200',
    shim: '#886600',
    regulating: '#006633',
}

const ROD_DATA = {
    safety: {
        id: { label: 'SAFETY ROD', desc: 'Batang pengaman utama' },
        en: { label: 'SAFETY ROD', desc: 'Primary safety rod' },
    },
    shim: {
        id: { label: 'SHIM ROD', desc: 'Kontrol reaktivitas kasar' },
        en: { label: 'SHIM ROD', desc: 'Coarse reactivity control' },
    },
    regulating: {
        id: { label: 'REGULATING ROD', desc: 'Kontrol daya halus' },
        en: { label: 'REGULATING ROD', desc: 'Fine power control' },
    },
}

export default function RodControl({
    rodKey,
    value,
    keyUp,
    keyDown,
    isScrammed,
    isMoving,
    onStartHold,
    onStopHold,
    activeUp = false,  //tombol atas aktif via keyboard
    activeDown = false,  // tombol bawah aktif via keyboard
}) {
    const { language } = useLanguage()
    const lang = language || 'id'
    const rodData = ROD_DATA[rodKey]?.[lang] || ROD_DATA[rodKey]?.id
    const baseColor = ROD_COLORS[rodKey]

    const upLabel = lang === 'en' ? '▲ Up' : '▲ Naik'
    const downLabel = lang === 'en' ? '▼ Down' : '▼ Turun'

    const pct = Math.max(0, Math.min(100, value))

    const activeColor = isMoving
        ? '#FF0000'
        : pct === 0 ? '#888888'
            : pct === 100 ? '#22c55e'
                : baseColor

    const barBg = isMoving
        ? '#ffe8e8'
        : pct < 30 ? '#ffeee8'
            : pct < 60 ? '#fff8e0'
                : '#e8f8ee'

    // Hold handlers
    const handleMouseDown = useCallback((direction) => (e) => {
        e.preventDefault()
        if (isScrammed || !onStartHold) return
        onStartHold(rodKey, direction)
    }, [rodKey, isScrammed, onStartHold])

    const handleMouseUp = useCallback(() => {
        if (!onStopHold) return
        onStopHold(rodKey)
    }, [rodKey, onStopHold])

    const handleMouseLeave = useCallback(() => {
        if (!onStopHold) return
        onStopHold(rodKey)
    }, [rodKey, onStopHold])

    const handleTouchStart = useCallback((direction) => (e) => {
        e.preventDefault()
        if (isScrammed || !onStartHold) return
        onStartHold(rodKey, direction)
    }, [rodKey, isScrammed, onStartHold])

    const handleTouchEnd = useCallback(() => {
        if (!onStopHold) return
        onStopHold(rodKey)
    }, [rodKey, onStopHold])

    // Warna tombol berdasarkan activeUp/activeDown (keyboard aktif)
    const upBtnStyle = {
        ...s.holdBtn,
        borderColor: isScrammed ? '#d0dce8' : baseColor,
        color: isScrammed ? '#aabbcc' : (activeUp ? '#ffffff' : baseColor),
        background: isScrammed
            ? '#f5f8fc'
            : activeUp
                ? baseColor                   // Menyala penuh saat keyboard ditekan
                : isMoving
                    ? `${baseColor}22`
                    : `${baseColor}0f`,
        boxShadow: activeUp && !isScrammed
            ? `0 0 10px ${baseColor}88`
            : 'none',
        transform: activeUp ? 'scale(0.96)' : 'scale(1)',
        cursor: isScrammed ? 'not-allowed' : 'pointer',
    }

    const downBtnStyle = {
        ...s.holdBtn,
        borderColor: isScrammed ? '#d0dce8' : baseColor,
        color: isScrammed ? '#aabbcc' : (activeDown ? '#ffffff' : baseColor),
        background: isScrammed
            ? '#f5f8fc'
            : activeDown
                ? baseColor                   //Menyala penuh saat keyboard ditekan
                : isMoving
                    ? `${baseColor}22`
                    : `${baseColor}0f`,
        boxShadow: activeDown && !isScrammed
            ? `0 0 10px ${baseColor}88`
            : 'none',
        transform: activeDown ? 'scale(0.96)' : 'scale(1)',
        cursor: isScrammed ? 'not-allowed' : 'pointer',
    }

    return (
        <div style={{
            ...s.box,
            borderColor: isScrammed
                ? '#d0dce8'
                : isMoving
                    ? '#FF0000'
                    : `${baseColor}55`,
            opacity: isScrammed ? 0.55 : 1,
            background: isScrammed
                ? '#f5f8fc'
                : isMoving ? '#fff5f5' : '#ffffff',
            transition: 'all 0.15s',
        }}>
            {/* Nama & nilai */}
            <div style={s.topRow}>
                <div style={s.labelGroup}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: activeColor, flexShrink: 0,
                        boxShadow: isMoving
                            ? `0 0 8px ${activeColor}`
                            : `0 0 4px ${activeColor}88`,
                        animation: isMoving ? 'rod-moving-pulse 0.4s ease infinite' : 'none',
                    }} />
                    <span style={{ ...s.label, color: activeColor }}>
                        {rodData.label}
                    </span>
                    {isMoving && (
                        <span style={{
                            fontSize: 8, color: '#FF0000',
                            fontFamily: "'Orbitron',monospace",
                            letterSpacing: 0.5,
                            animation: 'rod-moving-pulse 0.4s ease infinite',
                        }}>
                            ● MOVING
                        </span>
                    )}
                </div>
                <span style={{ ...s.pct, color: activeColor }}>
                    {pct.toFixed(1)}%
                </span>
            </div>

            {/* Deskripsi */}
            <p style={s.desc}>{rodData.desc}</p>

            {/* Bar */}
            <div style={{ position: 'relative', height: 10 }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: barBg, borderRadius: 5,
                    border: `1px solid ${isMoving ? '#FF000044' : '#d0dce8'}`,
                    overflow: 'hidden', transition: 'all 0.15s',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        minWidth: pct > 0 ? 3 : 0,
                        background: isMoving
                            ? 'linear-gradient(90deg,#FF000088,#FF0000)'
                            : `linear-gradient(90deg,${baseColor}88,${baseColor})`,
                        borderRadius: 5,
                        transition: 'width 0.1s ease, background 0.15s ease',
                        boxShadow: isMoving ? '0 0 6px #FF000066' : 'none',
                    }} />
                </div>
                {[25, 50, 75].map(tick => (
                    <div key={tick} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${tick}%`, width: 1,
                        background: '#c0d0e088', pointerEvents: 'none',
                    }} />
                ))}
            </div>

            {/* Skala */}
            <div style={s.scale}>
                {['0%', '25%', '50%', '75%', '100%'].map(v => (
                    <span key={v} style={s.scaleLbl}>{v}</span>
                ))}
            </div>

            {/* Tombol Naik & Turun */}
            <div style={s.btnRow}>
                <button
                    onMouseDown={handleMouseDown('up')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart('up')}
                    onTouchEnd={handleTouchEnd}
                    disabled={isScrammed}
                    style={upBtnStyle}
                >
                    ▲ {upLabel}
                </button>
                <button
                    onMouseDown={handleMouseDown('down')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart('down')}
                    onTouchEnd={handleTouchEnd}
                    disabled={isScrammed}
                    style={downBtnStyle}
                >
                    ▼ {downLabel}
                </button>
            </div>

            {/* Keyboard hint - tampilkan dengan highlight jika aktif */}
            <div style={s.keyRow}>
                <div style={s.keyItem}>
                    <kbd style={{
                        ...s.kbd,
                        borderColor: activeUp && !isScrammed ? baseColor : `${baseColor}88`,
                        color: activeUp && !isScrammed ? baseColor : `${baseColor}88`,
                        background: activeUp && !isScrammed ? `${baseColor}22` : `${baseColor}0f`,
                        fontWeight: activeUp ? 900 : 400,
                    }}>
                        {keyUp}
                    </kbd>
                    <span style={s.keyLbl}>{upLabel}</span>
                </div>
                <div style={s.keyItem}>
                    <kbd style={{
                        ...s.kbd,
                        borderColor: activeDown && !isScrammed ? baseColor : `${baseColor}88`,
                        color: activeDown && !isScrammed ? baseColor : `${baseColor}88`,
                        background: activeDown && !isScrammed ? `${baseColor}22` : `${baseColor}0f`,
                        fontWeight: activeDown ? 900 : 400,
                    }}>
                        {keyDown}
                    </kbd>
                    <span style={s.keyLbl}>{downLabel}</span>
                </div>
            </div>

            <style>{`
        @keyframes rod-moving-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
        </div>
    )
}

const s = {
    box: {
        border: '1px solid', borderRadius: 8, padding: '11px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: '0 1px 6px rgba(0,80,160,0.06)',
    },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    labelGroup: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
    label: { fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1 },
    pct: { fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 900 },
    desc: { fontSize: 10, color: '#7799bb', margin: 0 },
    scale: { display: 'flex', justifyContent: 'space-between', marginTop: -2 },
    scaleLbl: { fontFamily: "'Orbitron',monospace", fontSize: 8, color: '#99aabc' },
    btnRow: { display: 'flex', gap: 6, marginTop: 2 },
    holdBtn: {
        flex: 1, padding: '7px 4px',
        border: '1px solid', borderRadius: 5,
        fontFamily: "'Orbitron',monospace",
        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
        userSelect: 'none', WebkitUserSelect: 'none',
        transition: 'all 0.1s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
    },
    keyRow: { display: 'flex', gap: 8, marginTop: 2 },
    keyItem: { flex: 1, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 },
    kbd: {
        fontFamily: "'Orbitron',monospace", fontSize: 9,
        padding: '3px 5px', border: '1px solid', borderRadius: 3,
        whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'all 0.1s',
    },
    keyLbl: { fontSize: 10, color: '#7799bb', whiteSpace: 'nowrap' },
}
