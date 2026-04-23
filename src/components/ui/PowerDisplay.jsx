// src/components/ui/PowerDisplay.jsx
import React, { useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

// ── Konstanta Power ──
const MAX_POWER_KW = 120    // Max Daya
const SCRAM_THRESHOLD_KW = 110  //threshold auto-SCRAM
const NOMINAL_POWER_KW = 100
// ── Gauge Canvas ──
function PowerGauge({ value, maxValue = 120 }) {
    const ref = useRef()

    useEffect(() => {
        const canvas = ref.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width
        const H = canvas.height
        const cx = W / 2
        const cy = H * 0.68
        const R = Math.min(W, H) * 0.36
        const startA = Math.PI * 0.8
        const endA = Math.PI * 2.2

        // ── Perhitungan daya gunakan kW / maxKW ──
        const ratio = Math.min(1, value / maxValue)  // 0.0 - 1.0
        const valA = startA + ratio * (endA - startA)

        ctx.clearRect(0, 0, W, H)

        // Track BG
        ctx.beginPath()
        ctx.arc(cx, cy, R, startA, endA)
        ctx.strokeStyle = '#d8e8f2'
        ctx.lineWidth = 13
        ctx.lineCap = 'round'
        ctx.stroke()

        // Colored zones (sama seperti sebelumnya, sudah pakai ratio 0-1)
        const zones = [
            { s: 0, e: 0.625, c: '#00aa55' }, // 0  - 75 kW
            { s: 0.625, e: 0.833, c: '#cc8800' }, // 75 - 100 kW  ← UBAH (tambah zona nominal)
            { s: 0.833, e: 0.917, c: '#cc6600' }, // 100 - 110 kW ← BARU zona bahaya ringan
            { s: 0.917, e: 1.0, c: '#cc2200' }, // 110 - 120 kW ← SCRAM zone
        ]

        zones.forEach(z => {
            const za = startA + z.s * (endA - startA)
            const zb = startA + z.e * (endA - startA)
            const ce = Math.min(zb, valA)
            if (ce > za) {
                ctx.beginPath()
                ctx.arc(cx, cy, R, za, ce)
                ctx.strokeStyle = z.c
                ctx.lineWidth = 13
                ctx.lineCap = 'round'
                ctx.stroke()
            }
        })

        // Tick marks - 12 ticks untuk 0,10,20,...,120
        for (let i = 0; i <= 12; i++) {
            const a = startA + (i / 12) * (endA - startA)
            const maj = i % 2 === 0
            ctx.beginPath()
            ctx.moveTo(
                cx + Math.cos(a) * (R - (maj ? 20 : 13)),
                cy + Math.sin(a) * (R - (maj ? 20 : 13))
            )
            ctx.lineTo(
                cx + Math.cos(a) * (R - 5),
                cy + Math.sin(a) * (R - 5)
            )
            ctx.strokeStyle = i >= 11 ? '#cc2200' : i >= 10 ? '#cc6600' : maj ? '#7799bb' : '#aabbd0'
            ctx.lineWidth = maj ? 2 : 1
            ctx.stroke()
        }

        // ── Marker tick khusus 100kW (tick ke-10) ──
        const nominalA = startA + (100 / maxValue) * (endA - startA)
        ctx.beginPath()
        ctx.moveTo(
            cx + Math.cos(nominalA) * (R - 22),
            cy + Math.sin(nominalA) * (R - 22)
        )
        ctx.lineTo(
            cx + Math.cos(nominalA) * (R - 3),
            cy + Math.sin(nominalA) * (R - 3)
        )
        ctx.strokeStyle = '#00aa55'
        ctx.lineWidth = 3
        ctx.stroke()

        // Needle
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(
            cx + Math.cos(valA) * (R - 16),
            cy + Math.sin(valA) * (R - 16)
        )

        // Warna jarum sesuai zona
        const needleColor =
            value > 110 ? '#cc2200' :   // SCRAM zone
                value > 100 ? '#cc6600' :   // Bahaya ringan
                    value > 75 ? '#cc8800' :   // Sedang
                        '#0055aa'                    // Normal

        ctx.strokeStyle = needleColor
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.shadowColor = needleColor
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.shadowBlur = 0

        // Center dot
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = needleColor
        ctx.fill()

        // Value text - tampilkan kW
        ctx.fillStyle = '#7799bb'
        ctx.font = `9px "Rajdhani",sans-serif`
        ctx.fillText('DAYA REAKTOR', cx, cy + R * 0.72)

    }, [value, maxValue])

    return (
        <canvas
            ref={ref}
            width={220}
            height={120}
            style={{ display: 'block', margin: '0 auto' }}
        />
    )
}

// ── Main Component ──
export default function PowerDisplay({ reactorData, isScrammed }) {
    const { language } = useLanguage()
    const isId = language !== 'en'

    const power = isScrammed ? 0 : (reactorData?.power || 0)
    const powerKw = isScrammed ? 0 : (reactorData?.power_kw || 0)

    // ← UBAH threshold warna berdasarkan 120kW
    // Hijau: 0-75kW (62.5%), Kuning: 75-110kW (91.7%), Merah: 110-120kW
    const powerColor =
        power > 91.7 ? '#cc2200' :
            power > 62.5 ? '#886600' : '#006633'

    const powerBg =
        power > 91.7 ? '#fff0ec' :
            power > 62.5 ? '#fff8e8' : '#e8f8ee'

    // Status label
    const getStatusLabel = () => {
        if (isScrammed) return isId ? '🚨 SCRAM AKTIF' : '🚨 SCRAM ACTIVE'
        // label BAHAYA untuk zona 110-120kW
        if (power > 91.7) return isId ? '⚠ DAYA BAHAYA' : '⚠ DANGER POWER'
        if (power > 62.5) return isId ? 'DAYA SEDANG' : 'MEDIUM POWER'
        if (power > 5) return isId ? 'DAYA RENDAH' : 'LOW POWER'
        return isId ? 'REAKTOR MATI' : 'REACTOR OFF'
    }

    // label skala bar: 0, 60 kW, 120 kW
    //const BAR_LABELS = ['0', '60 kW', '120 kW']

    // Progress bar fill - scale terhadap 120kW
    // powerKw / 120 * 100 untuk mendapatkan % bar
    const barFillPercent = Math.min(100, (powerKw / MAX_POWER_KW) * 100)

    // Indikator SCRAM threshold line (110/120 = 91.7%)
    const scramLinePercent = (SCRAM_THRESHOLD_KW / MAX_POWER_KW) * 100 // 91.7%
    const nominalLinePercent = (NOMINAL_POWER_KW / MAX_POWER_KW) * 100  // 83.3%

    return (
        <div style={s.wrap}>
            {/* Title */}
            <p style={s.title}>
                {isId ? '⚡ DAYA REAKTOR' : '⚡ REACTOR POWER'}
            </p>

            {/* Gauge */}
            <div style={s.gaugeBox}>
                <PowerGauge value={powerKw} maxValue={MAX_POWER_KW} />
            </div>

            {/* kW Value */}
            <div style={s.kwRow}>
                <span style={{ ...s.kwVal, color: powerColor }}>
                    {powerKw.toFixed(2)}
                </span>
                <span style={s.kwUnit}>kW</span>
                {/* ← BARU: Tampilkan max */}
                <span style={{ fontSize: 10, color: '#99aabc', marginLeft: 2 }}>
                    / {MAX_POWER_KW} kW
                </span>
            </div>

            {/* Progress Bar dengan SCRAM threshold marker */}
            <div style={s.barSection}>
                <div style={{
                    ...s.barBg,
                    background: powerBg,
                    position: 'relative',
                    overflow: 'visible',
                    padding: 0,
                    display: 'flex',  // TAMBAH: flex untuk multi segment
                }}>

                    {/* ── Multi-color bar segments ── */}
                    {(() => {
                        // Definisi zona (dalam kW)
                        const zones = [
                            { from: 0, to: 75, color: '#00aa55' }, // Hijau
                            { from: 75, to: 100, color: '#cc8800' }, // Kuning/Orange
                            { from: 100, to: 110, color: '#cc6600' }, // Orange
                            { from: 110, to: 120, color: '#cc2200' }, // Merah
                        ]

                        return zones.map((zone, i) => {
                            // Lebar segment dalam % terhadap bar total
                            const segmentWidthPercent = ((zone.to - zone.from) / MAX_POWER_KW) * 100

                            // Seberapa penuh segment ini terisi
                            const fillKw = Math.min(
                                Math.max(powerKw - zone.from, 0),
                                zone.to - zone.from
                            )
                            const fillPercent = (fillKw / (zone.to - zone.from)) * 100

                            // Jika tidak ada isi sama sekali, tetap render tapi kosong
                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: `${segmentWidthPercent}%`,
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        // Border radius hanya di ujung pertama dan terakhir
                                        borderRadius: i === 0
                                            ? '4px 0 0 4px'
                                            : i === zones.length - 1
                                                ? '0 4px 4px 0'
                                                : '0',
                                    }}
                                >
                                    {/* Fill dalam segment ini */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${fillPercent}%`,
                                        background: fillPercent > 0
                                            ? `linear-gradient(90deg, ${zone.color}99, ${zone.color})`
                                            : 'transparent',
                                        transition: 'width 0.5s ease',
                                        borderRadius: i === 0 && fillPercent < 100
                                            ? '4px 0 0 4px'
                                            : i === zones.length - 1 && fillPercent === 100
                                                ? '0 4px 4px 0'
                                                : i === 0
                                                    ? '4px 0 0 4px'
                                                    : '0',
                                    }} />
                                </div>
                            )
                        })
                    })()}

                    {/* ── Garis NOMINAL 100 kW (hijau tua) ── */}
                    <div style={{
                        position: 'absolute',
                        left: `${nominalLinePercent}%`,
                        top: -3,
                        bottom: -3,
                        width: 2,
                        background: '#006633',
                        opacity: 1,
                        borderRadius: 1,
                        zIndex: 2,
                    }} title="Daya Nominal: 100 kW" />

                    {/* ── Garis SCRAM 110 kW (merah) ── */}
                    <div style={{
                        position: 'absolute',
                        left: `${scramLinePercent}%`,
                        top: -3,
                        bottom: -3,
                        width: 2,
                        background: '#cc2200',
                        opacity: 1,
                        borderRadius: 1,
                        zIndex: 2,
                    }} title="SCRAM Threshold: 110 kW" />

                </div>

                {/* ── Bar Labels ── */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 3,
                }}>
                    <span style={s.barLabel}>0</span>
                    <span style={s.barLabel}>60</span>
                    <span style={s.barLabel}>120</span>
                </div>

                {/* ── Legenda Indikator ── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    marginTop: 4,
                    padding: '5px 7px',
                    background: '#f8fafc',
                    borderRadius: 5,
                    border: '1px solid #e0eaf2',
                }}>

                    {/* Nominal 100 kW */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{
                                width: 14, height: 3,
                                background: '#00aa55',
                                borderRadius: 1, flexShrink: 0,
                            }} />
                            <span style={{
                                fontSize: 8, color: '#006633',
                                fontFamily: "'Orbitron',monospace",
                                fontWeight: 700, letterSpacing: 0.5,
                            }}>
                                NOMINAL
                            </span>
                        </div>
                        <span style={{
                            fontSize: 8, color: '#006633',
                            fontFamily: "'Orbitron',monospace",
                            fontWeight: 900,
                        }}>
                            {NOMINAL_POWER_KW} kW
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#e0eaf2' }} />

                    {/* SCRAM 110 kW */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{
                                width: 14, height: 3,
                                background: '#cc2200',
                                borderRadius: 1, flexShrink: 0,
                            }} />
                            <span style={{
                                fontSize: 8, color: '#cc2200',
                                fontFamily: "'Orbitron',monospace",
                                fontWeight: 700, letterSpacing: 0.5,
                            }}>
                                ⚡ SCRAM
                            </span>
                        </div>
                        <span style={{
                            fontSize: 8, color: '#cc2200',
                            fontFamily: "'Orbitron',monospace",
                            fontWeight: 900,
                        }}>
                            {SCRAM_THRESHOLD_KW} kW
                        </span>
                    </div>

                </div>
            </div>


            {/* Status */}
            <div style={{
                ...s.statusRow,
                borderColor: `${powerColor}55`,
                background: powerBg,
            }}>
                <div style={{ ...s.statusDot, background: powerColor }} />
                <span style={{
                    fontSize: 12,
                    color: powerColor,
                    fontWeight: 700,
                    fontFamily: "'Rajdhani',sans-serif",
                }}>
                    {getStatusLabel()}
                </span>
            </div>
        </div>
    )
}

const s = {
    wrap: {
        display: 'flex', flexDirection: 'column', gap: 10,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 11, color: '#0055aa',
        letterSpacing: 2, fontWeight: 700,
        textAlign: 'center', margin: 0,
    },
    gaugeBox: {
        background: '#ffffff', borderRadius: 8,
        padding: '8px 4px 4px',
        border: '1px solid #d0dce8',
        boxShadow: '0 2px 8px rgba(0,80,160,0.06)',
    },
    kwRow: {
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'center', gap: 6,
    },
    kwVal: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 32, fontWeight: 900, lineHeight: 1,
    },
    kwUnit: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 14, color: '#7799bb',
    },
    barSection: {
        display: 'flex', flexDirection: 'column', gap: 4,
    },
    barBg: {
        height: 8, borderRadius: 4,
        border: '1px solid #c8d8e8', overflow: 'visible',
        position: 'relative',
    },
    barFill: {
        height: '100%', borderRadius: 4,
        transition: 'width 0.5s ease', minWidth: 4,
    },
    barLabelsRow: {
        display: 'flex', justifyContent: 'space-between',
    },
    barLabel: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 8, color: '#99aabc',
    },
    statusRow: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', border: '1px solid',
        borderRadius: 5, transition: 'all 0.3s',
    },
    statusDot: {
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    },
}
