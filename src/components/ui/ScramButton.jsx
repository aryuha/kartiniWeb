// src/components/ui/ScramButton.jsx
import React, { useState, useRef } from 'react'

export default function ScramButton({ isScrammed, onScram, onReset }) {
    const [holding, setHolding] = useState(false)
    const [progress, setProgress] = useState(0)
    const intervalRef = useRef(null)

    const startHold = () => {
        if (isScrammed) return
        setHolding(true)
        let p = 0
        intervalRef.current = setInterval(() => {
            p += 100 / 15
            setProgress(Math.min(100, p))
            if (p >= 100) {
                clearInterval(intervalRef.current)
                setHolding(false)
                setProgress(0)
                onScram()
            }
        }, 100)
    }

    const stopHold = () => {
        clearInterval(intervalRef.current)
        setHolding(false)
        setProgress(0)
    }

    return (
        <div style={s.wrap}>

            {/* Status bar */}
            <div style={{
                ...s.indicator,
                borderColor: isScrammed ? '#ff333360' : '#3a0a0a',
                background: isScrammed ? '#1a050588' : '#10050588',
            }}>
                <div style={{
                    ...s.indDot,
                    background: isScrammed ? '#ff3333' : '#440000',
                    boxShadow: isScrammed ? '0 0 8px #ff3333' : 'none',
                }} />
                <span style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 10,
                    color: isScrammed ? '#ff3333' : '#660000',
                    letterSpacing: 1,
                }}>
                    {isScrammed ? '🚨 SCRAM AKTIF' : 'SISTEM AMAN'}
                </span>
            </div>

            {/* Tombol */}
            {!isScrammed ? (
                <div style={s.btnArea}>
                    {/* Tombol bulat SCRAM */}
                    <button
                        style={{
                            ...s.scramBtn,
                            transform: holding ? 'scale(0.95)' : 'scale(1)',
                            boxShadow: holding
                                ? '0 0 25px #ff0000, 0 0 50px #ff000050, inset 0 2px 0 #ff4444'
                                : '0 0 12px #cc000060, inset 0 2px 0 #cc3333',
                        }}
                        onMouseDown={startHold}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={startHold}
                        onTouchEnd={stopHold}
                    >
                        {/* Ring progress */}
                        {holding && (
                            <svg style={s.ring} viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="44"
                                    fill="none"
                                    stroke="#ff2200"
                                    strokeWidth="5"
                                    strokeDasharray={`${progress * 2.76} 276`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                    style={{ filter: 'drop-shadow(0 0 5px #ff0000)' }}
                                />
                            </svg>
                        )}

                        {/* Konten tombol */}
                        <div style={s.btnInner}>
                            <span style={{ fontSize: 20, lineHeight: 1 }}>⚡</span>
                            <span style={s.btnLabel}>SCRAM</span>
                            <span style={s.btnSub}>TAHAN</span>
                        </div>
                    </button>

                    {holding && (
                        <p style={s.holdMsg}>⚠ LEPASKAN UNTUK BATAL</p>
                    )}
                </div>
            ) : (
                /* Reset button */
                <button style={s.resetBtn} onClick={onReset}>
                    <span style={s.resetLabel}>🔄 RESET SCRAM</span>
                    <span style={s.resetSub}>Pulihkan Operasi Normal</span>
                </button>
            )}

            {/* Keterangan */}
            <p style={s.warning}>
                {isScrammed
                    ? '⚠ Semua batang kendali telah inserted'
                    : '⚠ Tahan tombol untuk emergency stop'}
            </p>

            <style>{`
        @keyframes scram-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
        </div>
    )
}

const s = {
    wrap: {
        padding: '10px 14px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        background: 'linear-gradient(180deg, #0f0505 0%, #080303 100%)',
        borderTop: '2px solid #3a0a0a',
        // Tidak pakai minHeight agar tidak memaksa ruang berlebih
    },

    indicator: {
        width: '100%',
        border: '1px solid',
        borderRadius: 5,
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.3s',
    },
    indDot: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        transition: 'all 0.3s',
    },

    // Area tombol
    btnArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
    },

    // Tombol SCRAM – lebih kecil agar tidak terpotong
    scramBtn: {
        width: 90,
        height: 90,
        borderRadius: '50%',
        border: '3px solid #ff0000',
        background: 'radial-gradient(circle at 40% 35%, #cc2222, #660000)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s, box-shadow 0.2s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        flexShrink: 0,
    },
    ring: {
        position: 'absolute',
        top: -5,
        left: -5,
        width: 'calc(100% + 10px)',
        height: 'calc(100% + 10px)',
        pointerEvents: 'none',
    },
    btnInner: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        zIndex: 1,
    },
    btnLabel: {
        fontFamily: "'Orbitron', monospace",
        fontSize: 12,
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: 2,
        textShadow: '0 0 8px #ffffff',
        lineHeight: 1,
    },
    btnSub: {
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 9,
        color: '#ff9999',
        letterSpacing: 1,
    },
    holdMsg: {
        fontFamily: "'Orbitron', monospace",
        fontSize: 9,
        color: '#ff4444',
        letterSpacing: 1,
        margin: 0,
        textAlign: 'center',
    },

    // Reset button
    resetBtn: {
        width: '100%',
        padding: '10px',
        background: 'linear-gradient(135deg, #0a2a0a, #051505)',
        border: '2px solid #00ff88',
        borderRadius: 8,
        color: '#00ff88',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        boxShadow: '0 0 12px #00ff8840',
        transition: 'all 0.2s',
    },
    resetLabel: {
        fontFamily: "'Orbitron', monospace",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
    },
    resetSub: {
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 11,
        color: '#44bb66',
    },

    warning: {
        fontSize: 10,
        color: '#552222',
        textAlign: 'center',
        margin: 0,
        fontStyle: 'italic',
        lineHeight: 1.4,
    },
}