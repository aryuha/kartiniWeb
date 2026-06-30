// src/components/three/ComponentIllustration.jsx
import React from 'react'

// ════════════════════════════════════════════════════════
// Ilustrasi placeholder sederhana (SVG) untuk tiap komponen.
// Skematik, bukan render realistis — cukup untuk membantu
// orientasi visual di dalam card detail.
// Ganti dengan <img src="..."/> nanti kalau sudah punya
// foto/render asli, tanpa perlu ubah pemanggilnya.
// ════════════════════════════════════════════════════════

function CoreIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            {/* susunan hexagon kecil mewakili elemen bahan bakar */}
            {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 6 }).map((_, col) => {
                    const offsetX = row % 2 === 0 ? 0 : 11
                    const cx = 22 + col * 22 + offsetX
                    const cy = 16 + row * 18
                    if (cx > 150) return null
                    const isCenter = row === 2 && (col === 2 || col === 3)
                    return (
                        <polygon
                            key={`${row}-${col}`}
                            points={hexPoints(cx, cy, 9)}
                            fill={isCenter ? color : `${color}33`}
                            stroke={color}
                            strokeWidth={0.6}
                            opacity={isCenter ? 0.95 : 0.55}
                        />
                    )
                })
            )}
        </svg>
    )
}

function hexPoints(cx, cy, r) {
    return Array.from({ length: 6 })
        .map((_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6
            return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
        })
        .join(' ')
}

function VesselIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            <rect x="55" y="8" width="50" height="84" rx="6" fill="none" stroke={color} strokeWidth="2.5" opacity="0.85" />
            <line x1="55" y1="28" x2="105" y2="28" stroke={color} strokeWidth="1" opacity="0.4" />
            <line x1="55" y1="72" x2="105" y2="72" stroke={color} strokeWidth="1" opacity="0.4" />
            <rect x="68" y="38" width="24" height="24" fill={`${color}44`} stroke={color} strokeWidth="1" />
        </svg>
    )
}

function PoolIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            <rect x="20" y="6" width="120" height="88" rx="4" fill="none" stroke={color} strokeWidth="2.5" opacity="0.85" />
            {Array.from({ length: 4 }).map((_, i) => (
                <line key={i} x1="26" y1={20 + i * 18} x2="134" y2={20 + i * 18} stroke={color} strokeWidth="0.7" opacity="0.25" />
            ))}
            <rect x="62" y="34" width="36" height="50" fill={`${color}22`} stroke={color} strokeWidth="1" opacity="0.7" />
        </svg>
    )
}

function WaterIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#04101f" />
            {Array.from({ length: 3 }).map((_, i) => (
                <path
                    key={i}
                    d={`M0 ${30 + i * 22} Q 20 ${20 + i * 22}, 40 ${30 + i * 22} T 80 ${30 + i * 22} T 120 ${30 + i * 22} T 160 ${30 + i * 22}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity={0.5 - i * 0.1}
                />
            ))}
            {/* efek cherenkov: garis cahaya vertikal samar */}
            <line x1="80" y1="0" x2="80" y2="100" stroke="#88ccff" strokeWidth="3" opacity="0.18" />
        </svg>
    )
}

function RodIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            <rect x="72" y="6" width="16" height="76" rx="6" fill={color} opacity="0.85" />
            <rect x="68" y="78" width="24" height="10" rx="3" fill={`${color}cc`} />
            <line x1="80" y1="6" x2="80" y2="0" stroke={color} strokeWidth="2" opacity="0.6" />
            {/* indikator arah naik-turun */}
            <polygon points="80,90 75,98 85,98" fill={color} opacity="0.5" />
        </svg>
    )
}

function PcIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            <rect x="40" y="20" width="80" height="50" rx="3" fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
            <rect x="46" y="26" width="68" height="38" fill={`${color}22`} />
            <line x1="46" y1="36" x2="100" y2="36" stroke={color} strokeWidth="1" opacity="0.5" />
            <line x1="46" y1="44" x2="90" y2="44" stroke={color} strokeWidth="1" opacity="0.5" />
            <line x1="46" y1="52" x2="96" y2="52" stroke={color} strokeWidth="1" opacity="0.5" />
            <rect x="70" y="70" width="20" height="6" fill={color} opacity="0.6" />
            <rect x="58" y="76" width="44" height="4" rx="2" fill={color} opacity="0.4" />
        </svg>
    )
}

function PanelIllustration({ color }) {
    return (
        <svg viewBox="0 0 160 100" width="100%" height="100%">
            <rect x="0" y="0" width="160" height="100" fill="#0a1220" />
            <rect x="30" y="14" width="100" height="72" rx="4" fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
            {Array.from({ length: 4 }).map((_, i) => (
                <circle key={i} cx={48 + i * 22} cy={30} r={5} fill={i % 2 === 0 ? color : `${color}55`} />
            ))}
            <rect x="40" y="46" width="80" height="28" fill={`${color}1f`} stroke={color} strokeWidth="1" opacity="0.6" />
        </svg>
    )
}

const ILLUSTRATIONS = {
    core: CoreIllustration,
    vessel: VesselIllustration,
    pool: PoolIllustration,
    water: WaterIllustration,
    rod_safety: RodIllustration,
    rod_shim: RodIllustration,
    rod_regulating: RodIllustration,
    pc_operator: PcIllustration,
    control_panel_room: PanelIllustration,
}

export default function ComponentIllustration({ componentId, color }) {
    const Illustration = ILLUSTRATIONS[componentId]
    if (!Illustration) return null
    return (
        <div style={{
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: 6,
            overflow: 'hidden',
            border: `1px solid ${color}33`,
        }}>
            <Illustration color={color} />
        </div>
    )
}