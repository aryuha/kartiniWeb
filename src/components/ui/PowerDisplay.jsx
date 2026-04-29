import React, { useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

// ── Konstanta Power ──
const MAX_POWER_KW = 120
const SCRAM_THRESHOLD_KW = 110
const NOMINAL_POWER_KW = 100

// ── Konstanta Suhu ──
const MIN_TEMP = 25     // °C (suhu idle/shutdown)
const MAX_TEMP = 50     // °C skala maksimal 50°C
const WARN_TEMP = 35    // °C (threshold peringatan)
const DANGER_TEMP = 40  // °C threshold bahaya (warna merah)

// ════════════════════════════════════════
// TEMPERATURE GAUGE CANVAS
// ════════════════════════════════════════
function TemperatureGauge({ value, minValue = 25, maxValue = 50 }) {
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

        const clampedValue = Math.max(minValue, Math.min(maxValue, value))
        const ratio = (clampedValue - minValue) / (maxValue - minValue)
        const valA = startA + ratio * (endA - startA)

        ctx.clearRect(0, 0, W, H)

        // ── Track Background ──
        ctx.beginPath()
        ctx.arc(cx, cy, R, startA, endA)
        ctx.strokeStyle = '#d8e8f2'
        ctx.lineWidth = 13
        ctx.lineCap = 'round'
        ctx.stroke()

        // ════════════════════════════════════
        // ── Colored Zones ──
        // 25-27°C = BIRU   | ratio 0.000 - 0.080
        // 27-30°C = HIJAU  | ratio 0.080 - 0.200
        // 30-40°C = ORANGE | ratio 0.200 - 0.600
        // 40-50°C = MERAH  | ratio 0.600 - 1.000
        // ════════════════════════════════════
        const tempZones = [
            { s: 0.000, e: 0.080, c: '#0088cc' }, // 25-27°C → BIRU
            { s: 0.080, e: 0.200, c: '#00aa55' }, // 27-30°C → HIJAU
            { s: 0.200, e: 0.600, c: '#cc8800' }, // 30-40°C → ORANGE
            { s: 0.600, e: 1.000, c: '#cc2200' }, // 40-50°C → MERAH
        ]

        tempZones.forEach(z => {
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

        // ── Tick Marks (setiap 5°C: 25,30,35,40,45,50) ──
        for (let i = 0; i <= 5; i++) {
            const a = startA + (i / 5) * (endA - startA)
            const tickTemp = minValue + (i / 5) * (maxValue - minValue)
            ctx.beginPath()
            ctx.moveTo(cx + Math.cos(a) * (R - 20), cy + Math.sin(a) * (R - 20))
            ctx.lineTo(cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5))
            ctx.strokeStyle = tickTemp >= 40 ? '#cc2200' :
                tickTemp >= 30 ? '#cc8800' :
                    tickTemp >= 27 ? '#00aa55' : '#0088cc'
            ctx.lineWidth = 2
            ctx.stroke()
        }

        // ── Marker HIJAU di 40°C ──
        const greenMarkerTemp = 40
        const greenRatio = (greenMarkerTemp - minValue) / (maxValue - minValue)
        const greenA = startA + greenRatio * (endA - startA)
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(greenA) * (R - 22), cy + Math.sin(greenA) * (R - 22))
        ctx.lineTo(cx + Math.cos(greenA) * (R - 3), cy + Math.sin(greenA) * (R - 3))
        ctx.strokeStyle = '#00aa55'
        ctx.lineWidth = 3
        ctx.shadowColor = '#00aa55'
        ctx.shadowBlur = 4
        ctx.stroke()
        ctx.shadowBlur = 0

        // ── Marker MERAH di 50°C ──
        const redMarkerTemp = 50
        const redRatio = (redMarkerTemp - minValue) / (maxValue - minValue)
        const redA = startA + redRatio * (endA - startA)
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(redA) * (R - 22), cy + Math.sin(redA) * (R - 22))
        ctx.lineTo(cx + Math.cos(redA) * (R - 3), cy + Math.sin(redA) * (R - 3))
        ctx.strokeStyle = '#cc2200'
        ctx.lineWidth = 3
        ctx.shadowColor = '#cc2200'
        ctx.shadowBlur = 4
        ctx.stroke()
        ctx.shadowBlur = 0

        // ── Needle ──
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(valA) * (R - 16), cy + Math.sin(valA) * (R - 16))

        const needleColor =
            clampedValue >= 40 ? '#cc2200' :
                clampedValue >= 30 ? '#cc8800' :
                    clampedValue >= 27 ? '#00aa55' :
                        '#0088cc'

        ctx.strokeStyle = needleColor
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.shadowColor = needleColor
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.shadowBlur = 0

        // ── Center Dot ──
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = needleColor
        ctx.fill()

    }, [value, minValue, maxValue])

    return (
        <canvas
            ref={ref}
            width={220}
            height={120}
            style={{ display: 'block', margin: '0 auto' }}
        />
    )
}

// ════════════════════════════════════════
// POWER GAUGE CANVAS (TIDAK BERUBAH)
// ════════════════════════════════════════
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

        const ratio = Math.min(1, value / maxValue)
        const valA = startA + ratio * (endA - startA)

        ctx.clearRect(0, 0, W, H)

        ctx.beginPath()
        ctx.arc(cx, cy, R, startA, endA)
        ctx.strokeStyle = '#d8e8f2'
        ctx.lineWidth = 13
        ctx.lineCap = 'round'
        ctx.stroke()

        const zones = [
            { s: 0, e: 0.625, c: '#00aa55' },
            { s: 0.625, e: 0.833, c: '#cc8800' },
            { s: 0.833, e: 0.917, c: '#cc6600' },
            { s: 0.917, e: 1.0, c: '#cc2200' },
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

        const nominalA = startA + (100 / maxValue) * (endA - startA)
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(nominalA) * (R - 22), cy + Math.sin(nominalA) * (R - 22))
        ctx.lineTo(cx + Math.cos(nominalA) * (R - 3), cy + Math.sin(nominalA) * (R - 3))
        ctx.strokeStyle = '#00aa55'
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(valA) * (R - 16), cy + Math.sin(valA) * (R - 16))

        const needleColor =
            value > 110 ? '#cc2200' :
                value > 100 ? '#cc6600' :
                    value > 75 ? '#cc8800' : '#0055aa'

        ctx.strokeStyle = needleColor
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.shadowColor = needleColor
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = needleColor
        ctx.fill()

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

// ════════════════════════════════════════
// TEMPERATURE DISPLAY SECTION
// ════════════════════════════════════════
function TemperatureDisplay({ temperature, isScrammed }) {
    const { language } = useLanguage()
    const isId = language !== 'en'

    const temp = temperature ?? 25

    const tempColor =
        temp >= DANGER_TEMP ? '#cc2200' :
            temp >= WARN_TEMP ? '#cc8800' :
                temp >= 30 ? '#00aa55' :
                    '#0088cc'

    const tempBg =
        temp >= DANGER_TEMP ? '#fff0ec' :
            temp >= WARN_TEMP ? '#fff8e8' :
                temp >= 30 ? '#e8f8ee' :
                    '#e8f4ff'

    const getTempLabel = () => {
        if (isScrammed) return isId ? 'MENDINGIN' : 'COOLING DOWN'
        if (temp >= DANGER_TEMP) return isId ? '🔴 SUHU BAHAYA' : '🔴 DANGER TEMP'
        if (temp >= WARN_TEMP) return isId ? '△ SUHU TINGGI' : '△ HIGH TEMP'
        if (temp >= 30) return isId ? 'SUHU NORMAL' : 'NORMAL TEMP'
        return isId ? 'SUHU IDLE' : 'IDLE TEMP'
    }

    // Kalkulasi posisi (%) — SATU SUMBER KEBENARAN
    const getPct = (t) => ((t - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100

    const warnPct = getPct(WARN_TEMP)    // 35°C → 40%
    const dangerPct = getPct(DANGER_TEMP)  // 40°C → 60%

    return (
        <div style={st.wrap}>
            {/* Title */}
            <p style={st.title}>
                {isId ? '🌡 SUHU REAKTOR' : '🌡 REACTOR TEMP'}
            </p>

            {/* Gauge */}
            <div style={st.gaugeBox}>
                <TemperatureGauge value={temp} minValue={MIN_TEMP} maxValue={MAX_TEMP} />
            </div>

            {/* Nilai Suhu */}
            <div style={st.tempRow}>
                <span style={{ ...st.tempVal, color: tempColor }}>
                    {temp.toFixed(1)}
                </span>
                <span style={st.tempUnit}>°C</span>
                <span style={{ fontSize: 10, color: '#99aabc', marginLeft: 2 }}>
                    / {MAX_TEMP}°C
                </span>
            </div>

            {/* Progress Bar */}
            <div style={st.barSection}>

                {/* Bar Container */}
                <div style={{
                    ...st.barBg,
                    background: tempBg,
                    position: 'relative',
                    overflow: 'visible', 
                    padding: 0,
                    display: 'flex',
                }}>
                    {/* Multi-color segments */}
                    {(() => {
                        const zones = [
                            { from: MIN_TEMP, to: WARN_TEMP, color: '#00aa55' }, // 25-35 normal
                            { from: WARN_TEMP, to: DANGER_TEMP, color: '#cc8800' }, // 35-40 peringatan
                            { from: DANGER_TEMP, to: MAX_TEMP, color: '#cc2200' }, // 40-50 bahaya
                        ]
                        const totalRange = MAX_TEMP - MIN_TEMP
                        return zones.map((zone, i) => {
                            const segPct = ((zone.to - zone.from) / totalRange) * 100
                            const fillTemp = Math.min(Math.max(temp - zone.from, 0), zone.to - zone.from)
                            const fillPct = (fillTemp / (zone.to - zone.from)) * 100
                            return (
                                <div key={i} style={{
                                    width: `${segPct}%`,
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius:
                                        i === 0 ? '4px 0 0 4px' :
                                            i === zones.length - 1 ? '0 4px 4px 0' : '0',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0,
                                        height: '100%', width: `${fillPct}%`,
                                        background: fillPct > 0
                                            ? `linear-gradient(90deg, ${zone.color}99, ${zone.color})`
                                            : 'transparent',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            )
                        })
                    })()}

                    {/* ── Marker 35°C Orange — posisi tepat ── */}
                    <div style={{
                        position: 'absolute',
                        left: `${warnPct}%`,
                        transform: 'translateX(-50%)',  
                        top: -3, bottom: -3, width: 2,
                        background: '#cc8800',
                        borderRadius: 1, zIndex: 2,
                    }} title={`Peringatan: ${WARN_TEMP}°C`} />

                    {/* ── Marker 40°C Merah — posisi tepat ── */}
                    <div style={{
                        position: 'absolute',
                        left: `${dangerPct}%`,
                        transform: 'translateX(-50%)',  
                        top: -3, bottom: -3, width: 2,
                        background: '#cc2200',
                        borderRadius: 1, zIndex: 2,
                    }} title={`Bahaya: ${DANGER_TEMP}°C`} />
                </div>

                {/* ── Bar Labels — posisi absolut presisi ── */}
                <div style={{ position: 'relative', height: 14, marginTop: 3 }}>
                    {[
                        { temp: MIN_TEMP, align: 'left' },
                        { temp: WARN_TEMP, align: 'center' },
                        { temp: DANGER_TEMP, align: 'center' },
                        { temp: MAX_TEMP, align: 'right' },
                    ].map(({ temp: t, align }) => (
                        <span
                            key={t}
                            style={{
                                ...st.barLabel,
                                position: 'absolute',
                                left: `${getPct(t)}%`,
                                transform:
                                    align === 'center' ? 'translateX(-50%)' :
                                        align === 'right' ? 'translateX(-100%)' : 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {t}°C
                        </span>
                    ))}
                </div>

                {/* Legenda 3 Item */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4,
                    padding: '5px 7px', background: '#f8fafc',
                    borderRadius: 5, border: '1px solid #e0eaf2',
                }}>
                    {/* Normal */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, background: '#00aa55', borderRadius: 1 }} />
                            <span style={{
                                fontSize: 8, color: '#006633',
                                fontFamily: "'Orbitron',monospace",
                                fontWeight: 700, letterSpacing: 0.5,
                            }}>
                                {isId ? 'NORMAL' : 'NORMAL'}
                            </span>
                        </div>
                        <span style={{
                            fontSize: 8, color: '#006633',
                            fontFamily: "'Orbitron',monospace", fontWeight: 900,
                        }}>
                            &lt; {WARN_TEMP}°C
                        </span>
                    </div>

                    <div style={{ height: 1, background: '#e0eaf2' }} />

                    {/* Peringatan */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, background: '#cc8800', borderRadius: 1 }} />
                            <span style={{
                                fontSize: 8, color: '#cc8800',
                                fontFamily: "'Orbitron',monospace",
                                fontWeight: 700, letterSpacing: 0.5,
                            }}>
                                ⚠ {isId ? 'PERINGATAN' : 'WARNING'}
                            </span>
                        </div>
                        <span style={{
                            fontSize: 8, color: '#cc8800',
                            fontFamily: "'Orbitron',monospace", fontWeight: 900,
                        }}>
                            {WARN_TEMP}–{DANGER_TEMP}°C
                        </span>
                    </div>

                    <div style={{ height: 1, background: '#e0eaf2' }} />

                    {/* Bahaya */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, background: '#cc2200', borderRadius: 1 }} />
                            <span style={{
                                fontSize: 8, color: '#cc2200',
                                fontFamily: "'Orbitron',monospace",
                                fontWeight: 700, letterSpacing: 0.5,
                            }}>
                                🔴 {isId ? 'BAHAYA' : 'DANGER'}
                            </span>
                        </div>
                        <span style={{
                            fontSize: 8, color: '#cc2200',
                            fontFamily: "'Orbitron',monospace", fontWeight: 900,
                        }}>
                            ≥ {DANGER_TEMP}°C
                        </span>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div style={{
                ...st.statusRow,
                borderColor: `${tempColor}55`,
                background: tempBg,
            }}>
                <div style={{ ...st.statusDot, background: tempColor }} />
                <span style={{
                    fontSize: 12, color: tempColor,
                    fontWeight: 700, fontFamily: "'Rajdhani',sans-serif",
                }}>
                    {getTempLabel()}
                </span>
            </div>
        </div>
    )
}
// ════════════════════════════════════════
// MAIN PowerDisplay COMPONENT
// ════════════════════════════════════════
export default function PowerDisplay({ reactorData, isScrammed }) {
    const { language } = useLanguage()
    const isId = language !== 'en'

    const power = isScrammed ? 0 : (reactorData?.power || 0)
    const powerKw = isScrammed ? 0 : (reactorData?.power_kw || 0)
    const temperature = reactorData?.temperature ?? 25

    const powerColor =
        power > 91.7 ? '#cc2200' :
            power > 62.5 ? '#886600' : '#006633'

    const powerBg =
        power > 91.7 ? '#fff0ec' :
            power > 62.5 ? '#fff8e8' : '#e8f8ee'

    const getStatusLabel = () => {
        if (isScrammed) return isId ? '🔴 SCRAM AKTIF' : '🔴 SCRAM ACTIVE'
        if (power > 91.7) return isId ? '⚠ DAYA BAHAYA' : '⚠ DANGER POWER'
        if (power > 62.5) return isId ? 'DAYA SEDANG' : 'MEDIUM POWER'
        if (power > 5) return isId ? 'DAYA RENDAH' : 'LOW POWER'
        return isId ? 'REAKTOR MATI' : 'REACTOR OFF'
    }

    const barFillPercent = Math.min(100, (powerKw / MAX_POWER_KW) * 100)
    const scramLinePercent = (SCRAM_THRESHOLD_KW / MAX_POWER_KW) * 100
    const nominalLinePercent = (NOMINAL_POWER_KW / MAX_POWER_KW) * 100

    return (
        <div style={s.wrap}>

            {/* ══════════════════════════════════
            BAGIAN 1: GAUGE DAYA REAKTOR
            ══════════════════════════════════ */}
            <p style={s.title}>
                {isId ? '⚡ DAYA REAKTOR' : '⚡ REACTOR POWER'}
            </p>

            <div style={s.gaugeBox}>
                <PowerGauge value={powerKw} maxValue={MAX_POWER_KW} />
            </div>

            <div style={s.kwRow}>
                <span style={{ ...s.kwVal, color: powerColor }}>
                    {powerKw.toFixed(2)}
                </span>
                <span style={s.kwUnit}>kW</span>
                <span style={{ fontSize: 10, color: '#99aabc', marginLeft: 2 }}>
                    / {MAX_POWER_KW} kW
                </span>
            </div>

            <div style={s.barSection}>
                {/* ── Progress Bar ── */}
                <div style={{
                    ...s.barBg,
                    background: powerBg,
                    position: 'relative',
                    overflow: 'visible',
                    padding: 0,
                    display: 'flex',
                }}>
                    {/* Multi-color segments */}
                    {(() => {
                        const zones = [
                            { from: 0, to: 75, color: '#00aa55' },
                            { from: 75, to: 100, color: '#cc8800' },
                            { from: 100, to: 110, color: '#cc6600' },
                            { from: 110, to: 120, color: '#cc2200' },
                        ]
                        return zones.map((zone, i) => {
                            const segmentWidthPercent = ((zone.to - zone.from) / MAX_POWER_KW) * 100
                            const fillKw = Math.min(Math.max(powerKw - zone.from, 0), zone.to - zone.from)
                            const fillPercent = (fillKw / (zone.to - zone.from)) * 100
                            return (
                                <div key={i} style={{
                                    width: `${segmentWidthPercent}%`,
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius:
                                        i === 0 ? '4px 0 0 4px' :
                                            i === zones.length - 1 ? '0 4px 4px 0' : '0',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0,
                                        height: '100%', width: `${fillPercent}%`,
                                        background: fillPercent > 0
                                            ? `linear-gradient(90deg, ${zone.color}99, ${zone.color})`
                                            : 'transparent',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            )
                        })
                    })()}

                    {/* Garis Nominal 100 kW */}
                    <div style={{
                        position: 'absolute',
                        left: `${nominalLinePercent}%`,
                        transform: 'translateX(-50%)',
                        top: -3, bottom: -3, width: 2,
                        background: '#006633',
                        borderRadius: 1, zIndex: 2,
                    }} title="Daya Nominal: 100 kW" />

                    {/* Garis SCRAM 110 kW */}
                    <div style={{
                        position: 'absolute',
                        left: `${scramLinePercent}%`,
                        transform: 'translateX(-50%)',
                        top: -3, bottom: -3, width: 2,
                        background: '#cc2200',
                        borderRadius: 1, zIndex: 2,
                    }} title="SCRAM Threshold: 110 kW" />
                </div>

                {/* ── Satu area label bawah — dua baris ── */}
                <div style={{ position: 'relative', height: 28, marginTop: 3 }}>

                    {/* Baris 1 bawah: 0 dan 120 */}
                    {[
                        { kw: 0, align: 'left', color: '#99aabc' },
                        { kw: 120, align: 'right', color: '#99aabc' },
                    ].map(({ kw, align, color }) => (
                        <span
                            key={kw}
                            style={{
                                ...s.barLabel,
                                position: 'absolute',
                                top: 0,                          
                                left: `${(kw / MAX_POWER_KW) * 100}%`,
                                transform: align === 'right' ? 'translateX(-100%)' : 'none',
                                color,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {kw}
                        </span>
                    ))}

                    {/* Baris 2 bawah: 100 dan 110 (berwarna, sejajar garis) */}
                    {[
                        { kw: 100, color: '#006633' },
                        { kw: 110, color: '#cc2200' },
                    ].map(({ kw, color }) => (
                        <span
                            key={kw}
                            style={{
                                ...s.barLabel,
                                position: 'absolute',
                                top: 14,                         // ← baris kedua (geser ke bawah)
                                left: `${(kw / MAX_POWER_KW) * 100}%`,
                                transform: 'translateX(-50%)',
                                color,
                                fontWeight: 900,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {kw}
                        </span>
                    ))}

                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4,
                    padding: '5px 7px', background: '#f8fafc',
                    borderRadius: 5, border: '1px solid #e0eaf2',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, background: '#00aa55', borderRadius: 1 }} />
                            <span style={{ fontSize: 8, color: '#006633', fontFamily: "'Orbitron',monospace", fontWeight: 700, letterSpacing: 0.5 }}>
                                NOMINAL
                            </span>
                        </div>
                        <span style={{ fontSize: 8, color: '#006633', fontFamily: "'Orbitron',monospace", fontWeight: 900 }}>
                            {NOMINAL_POWER_KW} kW
                        </span>
                    </div>
                    <div style={{ height: 1, background: '#e0eaf2' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, background: '#cc2200', borderRadius: 1 }} />
                            <span style={{ fontSize: 8, color: '#cc2200', fontFamily: "'Orbitron',monospace", fontWeight: 700, letterSpacing: 0.5 }}>
                                ⚡ SCRAM
                            </span>
                        </div>
                        <span style={{ fontSize: 8, color: '#cc2200', fontFamily: "'Orbitron',monospace", fontWeight: 900 }}>
                            {SCRAM_THRESHOLD_KW} kW
                        </span>
                    </div>
                </div>
            </div>

            <div style={{
                ...s.statusRow,
                borderColor: `${powerColor}55`,
                background: powerBg,
            }}>
                <div style={{ ...s.statusDot, background: powerColor }} />
                <span style={{ fontSize: 12, color: powerColor, fontWeight: 700, fontFamily: "'Rajdhani',sans-serif" }}>
                    {getStatusLabel()}
                </span>
            </div>

            {/* ══════════════════════════════════
                DIVIDER
            ══════════════════════════════════ */}
            <div style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, #c0d4e8, transparent)',
                margin: '4px 0',
            }} />

            {/* ══════════════════════════════════
            BAGIAN 2: GAUGE SUHU REAKTOR
            ══════════════════════════════════ */}
            <TemperatureDisplay
                temperature={temperature}
                isScrammed={isScrammed}
            />

        </div>
    )
}

// ════════════════════════════════════════
// STYLES — Power Display
// ════════════════════════════════════════
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

// ════════════════════════════════════════
// STYLES — Temperature Display
// ════════════════════════════════════════
const st = {
    wrap: {
        display: 'flex', flexDirection: 'column', gap: 10,
    },
    title: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 11, color: '#cc6600',
        letterSpacing: 2, fontWeight: 700,
        textAlign: 'center', margin: 0,
    },
    gaugeBox: {
        background: '#ffffff', borderRadius: 8,
        padding: '8px 4px 4px',
        border: '1px solid #d0dce8',
        boxShadow: '0 2px 8px rgba(0,80,160,0.06)',
    },
    tempRow: {
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'center', gap: 6,
    },
    tempVal: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 32, fontWeight: 900, lineHeight: 1,
    },
    tempUnit: {
        fontFamily: "'Orbitron',monospace",
        fontSize: 14, color: '#7799bb',
    },
    barSection: {
        display: 'flex', flexDirection: 'column', gap: 4,
    },
    barBg: {
        height: 8, borderRadius: 4,
        border: '1px solid #c8d8e8',
        overflow: 'hidden',
        position: 'relative',
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