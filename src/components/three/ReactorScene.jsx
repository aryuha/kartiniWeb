// src/components/three/ReactorScene.jsx
import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import ReactorModel from './ReactorModel'
import * as THREE from 'three'

const CORE_Y = -1.5

const D_POOL_R = 2.6
const D_POOL_WALL = 0.25
const D_VESSEL_R = 1.45
const D_VESSEL_Y = -1.5
const D_CORE_R = 1.10
const D_CORE_Y = -2.5
const DECK_Y_VAL = 8.5 / 2 + 0.15
const CR_POS_SAFETY = [0, 0, 0.55]
const CR_POS_SHIM = [-0.48, 0, -0.28]
const CR_POS_REGULATING = [0.48, 0, -0.28]

// ─── Konstanta posisi ruang operator (sama dengan ReactorModel.jsx) ───
const DECK_OUTER_R = D_POOL_R + D_POOL_WALL + 2.5
const POOL_LEFT_EDGE = -DECK_OUTER_R
const BRIDGE_LEN = 4.2
const BRIDGE_END_X = POOL_LEFT_EDGE
const BRIDGE_START_X = BRIDGE_END_X - BRIDGE_LEN
const PLAT_W = 7.5
const OP_W = 8.0
const OP_L = 7.0
const OP_CX = BRIDGE_START_X - PLAT_W / 2
const PLAT_CZ = 0
const PLAT_L = 6.0
const OP_CZ = (PLAT_CZ - PLAT_L / 2) - OP_L / 2 - 0.05

// Posisi meja/PC operator
const DESK_X = (OP_CX + OP_W / 2) - 2.5
const DESK_Z = OP_CZ

// Posisi panel kontrol (dari ReactorControlPanelInside)
const PANEL_X = (OP_CX - OP_W / 2) + 6.7 + 0.5
const PANEL_Z = OP_CZ + 0.7

const LABEL_DATA = [
    {
        id: 'core',
        labelEN: 'Reactor Core',
        labelID: '(Teras Reaktor)',
        // Anchor jauh ke kanan bawah agar label muncul di tepi
        anchor3D: new THREE.Vector3(D_CORE_R + 0.2, D_CORE_Y, 0),
        color: '#ff6644',
        icon: 'D',
        // forceRight: paksa label selalu ke kanan layar
        forceRight: true,
    },
    {
        id: 'vessel',
        labelEN: 'Reactor Vessel',
        labelID: '(Bejana Reaktor)',
        anchor3D: new THREE.Vector3(D_VESSEL_R + 0.3, D_VESSEL_Y, 0),
        color: '#78838b',
        icon: 'E',
        forceRight: true,
    },
    {
        id: 'pool',
        labelEN: 'Reactor Pool',
        labelID: '(Kolam Reaktor)',
        anchor3D: new THREE.Vector3(D_POOL_R + D_POOL_WALL + 0.2, 1.5, 0),
        color: '#cbd6d8',
        icon: 'G',
        forceRight: true,
    },
    {
        id: 'water',
        labelEN: 'Pool Water',
        labelID: '(Air Kolam)',
        anchor3D: new THREE.Vector3(D_POOL_R * 0.55, +1.0, 0),
        color: '#2299ee',
        icon: 'F',
        forceRight: true,
    },
    // SAFETY ROD — Merah, anchor ke kiri atas
    {
        id: 'rod_safety',
        labelEN: 'Safety Rod',
        labelID: '(Batang Keselamatan)',
        anchor3D: new THREE.Vector3(
            CR_POS_SAFETY[0] + 0.15,
            DECK_Y_VAL + 0.5,
            CR_POS_SAFETY[2] + 0.15,
        ),
        color: '#ff3322',
        icon: 'A',
        forceRight: true,
    },
    // SHIM ROD — Biru, anchor ke kiri
    {
        id: 'rod_shim',
        labelEN: 'Shim Rod',
        labelID: '(Batang Shim)',
        anchor3D: new THREE.Vector3(
            CR_POS_SHIM[0] - 0.15,
            DECK_Y_VAL + 0.5,
            CR_POS_SHIM[2] - 0.15,
        ),
        color: '#2255ff',
        icon: 'B',
        forceRight: true,
    },
    // REGULATING ROD — Putih/Abu
    {
        id: 'rod_regulating',
        labelEN: 'Regulating Rod',
        labelID: '(Batang Pengatur)',
        anchor3D: new THREE.Vector3(
            CR_POS_REGULATING[0] + 0.15,
            DECK_Y_VAL + 0.5,
            CR_POS_REGULATING[2] - 0.15,
        ),
        color: '#cccccc',
        icon: 'C',
        forceRight: true,
    },
    // PC OPERATOR — label baru
    {
        id: 'pc_operator',
        labelEN: 'Operator PC',
        labelID: '(PC Operator)',
        anchor3D: new THREE.Vector3(DESK_X, DECK_Y_VAL + 1.2, DESK_Z),
        color: '#00ccff',
        icon: 'H',
        forceRight: false, // akan muncul di kiri layar
    },
    // PANEL KONTROL RUANG OPERATOR — label baru
    {
        id: 'control_panel_room',
        labelEN: 'Control Panel',
        labelID: '(Panel Kontrol)',
        anchor3D: new THREE.Vector3(PANEL_X, DECK_Y_VAL + 2.1, PANEL_Z + 2.2),
        color: '#ffaa00',
        icon: 'I',
        forceRight: false, // akan muncul di kiri layar
    },
]

// ─────────────────────────────────────────
// Label Projector (dalam Canvas)
// ─────────────────────────────────────────
function LabelProjector({ onPositionsUpdate }) {
    const { camera, size } = useThree()
    const frameRef = useRef(0)

    useFrame(() => {
        if (!camera || !size?.width || !size?.height) return
        frameRef.current += 1
        if (frameRef.current % 4 !== 0) return

        const positions = LABEL_DATA.map(({ id, anchor3D }) => {
            const vec = anchor3D.clone()
            vec.project(camera)
            const x = (vec.x * 0.5 + 0.5) * size.width
            const y = (vec.y * -0.5 + 0.5) * size.height
            const visible =
                vec.z < 1.0 &&
                isFinite(x) && !isNaN(x) &&
                isFinite(y) && !isNaN(y)
            return { id, x, y, visible }
        })

        onPositionsUpdate(positions, { width: size.width, height: size.height })
    })

    return null
}

// ─────────────────────────────────────────
// Single Label Item — DIPERBAIKI
// Label card selalu muncul di tepi layar,
// bukan di posisi anchor 3D
// ─────────────────────────────────────────
function LabelItem({ label, pos, canvasSize, isOpen, onToggle }) {
    const { x, y } = pos
    const { color, labelEN, labelID, icon, forceRight } = label

    // ── Panjang garis & ukuran card ──
    const CARD_W = 170
    const CARD_H = 44
    const ICON_R = 12

    // ── Tentukan arah label (kiri atau kanan layar) ──
    // forceRight=true  → label muncul di sisi KANAN layar
    // forceRight=false → label muncul di sisi KIRI layar
    // Jika tidak ada forceRight, gunakan posisi x untuk menentukan
    let isRight
    if (forceRight === true) {
        isRight = true
    } else if (forceRight === false) {
        isRight = false
    } else {
        isRight = x < canvasSize.width * 0.5
    }

    // ── Ujung garis: selalu menuju tepi layar ──
    // Jika isRight → garis memanjang ke kanan menuju tepi kanan
    // Jika !isRight → garis memanjang ke kiri menuju tepi kiri
    const MARGIN = 20  // jarak dari tepi layar
    const lineEndX = isRight
        ? canvasSize.width - MARGIN - CARD_W - 10  // tepi kanan
        : MARGIN + CARD_W + 10                      // tepi kiri

    // Posisi card
    const cardLeft = isRight
        ? lineEndX + 6
        : MARGIN

    // Posisi Y card: clamp agar tidak keluar layar
    const cardTopRaw = y - CARD_H / 2
    const cardTop = Math.max(8, Math.min(canvasSize.height - CARD_H - 8, cardTopRaw))

    // Y ujung garis mengikuti tengah card
    const lineEndY = cardTop + CARD_H / 2

    return (
        <>
            {/* SVG garis dari anchor ke card */}
            {isOpen && (
                <svg
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                        pointerEvents: 'none',
                        zIndex: 14,
                    }}
                >
                    {/* Garis putus dari icon dot ke ujung */}
                    <line
                        x1={x} y1={y}
                        x2={lineEndX} y2={lineEndY}
                        stroke={color}
                        strokeWidth={1.5}
                        strokeDasharray="6,3"
                        opacity={0.85}
                    />
                    {/* Titik di ujung garis */}
                    <circle cx={lineEndX} cy={lineEndY} r={3} fill={color} opacity={0.85} />
                    {/* Garis horizontal pendek ke card */}
                    <line
                        x1={lineEndX} y1={lineEndY}
                        x2={isRight ? lineEndX + 6 : lineEndX - 6} y2={lineEndY}
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.85}
                    />
                </svg>
            )}

            {/* Icon Dot di posisi anchor 3D */}
            <div
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    left: x - ICON_R,
                    top: y - ICON_R,
                    width: ICON_R * 2,
                    height: ICON_R * 2,
                    zIndex: 18,
                    cursor: 'pointer',
                    pointerEvents: 'all',
                }}
            >
                {/* Pulse ring saat tertutup */}
                {!isOpen && (
                    <div style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: `1.5px solid ${color}`,
                        opacity: 0.4,
                        animation: 'labelPulse 2s ease-in-out infinite',
                    }} />
                )}

                {/* Lingkaran icon */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isOpen
                        ? color
                        : 'rgba(8, 14, 28, 0.88)',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isOpen
                        ? `0 0 12px ${color}99`
                        : `0 0 6px ${color}55`,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)',
                }}>
                    <span style={{
                        fontFamily: "'Orbitron', monospace, sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                        color: isOpen ? '#000' : color,
                        lineHeight: 1,
                        transition: 'color 0.2s ease',
                    }}>
                        {icon}
                    </span>
                </div>
            </div>

            {/* Card Label — selalu di tepi layar */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        left: cardLeft,
                        top: cardTop,
                        zIndex: 16,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        animation: 'labelFadeIn 0.2s ease forwards',
                    }}
                >
                    <div style={{
                        background: 'rgba(8, 14, 28, 0.92)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${color}55`,
                        borderLeft: isRight ? `3px solid ${color}` : '1px solid transparent',
                        borderRight: isRight ? '1px solid transparent' : `3px solid ${color}`,
                        borderRadius: 6,
                        padding: '6px 12px',
                        width: CARD_W,
                        boxShadow: `0 2px 16px rgba(0,0,0,0.7), 0 0 8px ${color}22`,
                    }}>
                        {/* Baris atas: warna dot + nama EN */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}>
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: color,
                                flexShrink: 0,
                                boxShadow: `0 0 5px ${color}`,
                            }} />
                            <div style={{
                                fontFamily: "'Orbitron', monospace, sans-serif",
                                fontSize: 11,
                                fontWeight: 700,
                                color: color,
                                letterSpacing: 0.5,
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                            }}>
                                {labelEN}
                            </div>
                        </div>

                        {/* Nama ID */}
                        <div style={{
                            fontFamily: 'sans-serif',
                            fontSize: 9,
                            color: 'rgba(190,210,255,0.65)',
                            letterSpacing: 0.2,
                            marginTop: 3,
                            marginLeft: 14,
                            whiteSpace: 'nowrap',
                        }}>
                            {labelID}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// ─────────────────────────────────────────
// Label Overlay (di luar Canvas)
// ─────────────────────────────────────────
function LabelOverlay({ positions, canvasSize, openLabels, onToggleLabel }) {
    if (!positions || !canvasSize) return null

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 13,
            }}
        >
            {LABEL_DATA.map((label) => {
                const pos = positions.find(p => p.id === label.id)
                if (!pos?.visible) return null

                return (
                    <LabelItem
                        key={label.id}
                        label={label}
                        pos={pos}
                        canvasSize={canvasSize}
                        isOpen={openLabels.has(label.id)}
                        onToggle={() => onToggleLabel(label.id)}
                    />
                )
            })}
        </div>
    )
}

// ═══════════════════════════════════════════
// CSS Keyframes
// ═══════════════════════════════════════════
const STYLE_ID = 'reactor-label-styles'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
    @keyframes labelPulse {
      0%   { transform: scale(1);   opacity: 0.4; }
      50%  { transform: scale(1.5); opacity: 0.15; }
      100% { transform: scale(1);   opacity: 0.4; }
    }
    @keyframes labelFadeIn {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `
    document.head.appendChild(style)
}

// ═══════════════════════════════════════════
// MAIN SCENE
// ═══════════════════════════════════════════
export default function ReactorScene({
    rodPositions,
    reactorData,
    isScrammed,
    movingRods,
    isReactorActive,
}) {
    const powerKw = reactorData?.power_kw || 0
    const isOperating = isReactorActive && powerKw > 5 && !isScrammed

    const [labelPositions, setLabelPositions] = useState(null)
    const [canvasSize, setCanvasSize] = useState(null)
    const [openLabels, setOpenLabels] = useState(new Set())

    const handlePositionsUpdate = (positions, size) => {
        setLabelPositions(positions)
        setCanvasSize(size)
    }

    const handleToggleLabel = (id) => {
        setOpenLabels(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

            {/* ── Canvas ── */}
            <Canvas
                shadows
                gl={{ antialias: true, alpha: false }}
                style={{ background: '#060d1a', width: '100%', height: '100%' }}
            >
                <PerspectiveCamera makeDefault position={[8, 11, 8]} fov={48} near={0.1} far={300} />
                <OrbitControls
                    enablePan enableZoom enableRotate
                    minDistance={4} maxDistance={30}
                    minPolarAngle={0} maxPolarAngle={Math.PI / 1.9}
                    target={[0, 2.0, 0]}
                />

                <ambientLight intensity={2.2} color="#e8f0ff" />
                <directionalLight position={[8, 20, 8]} intensity={2.0} castShadow shadow-mapSize={[2048, 2048]} />
                <directionalLight position={[-8, 14, -6]} intensity={1.2} color="#aaccff" />
                <directionalLight position={[0, 10, 15]} intensity={0.8} />
                <directionalLight position={[15, 5, 0]} intensity={0.6} color="#ddeeff" />
                <pointLight position={[0, CORE_Y, 0]} intensity={5} color="#ff4422" distance={10} />
                <pointLight position={[0, 2, 0]} intensity={2.5} color="#ffffff" distance={8} />

                {isOperating && (
                    <>
                        <pointLight position={[0, CORE_Y, 0]} intensity={powerKw / 5} color="#4488ff" distance={16} />
                        <pointLight position={[0, CORE_Y + 1.8, 0]} intensity={powerKw / 8} color="#6655ff" distance={12} />
                        <pointLight position={[0, CORE_Y - 1.5, 0]} intensity={powerKw / 10} color="#3366ff" distance={10} />
                        <pointLight position={[0, CORE_Y + 1, 0]} intensity={powerKw / 6} color="#0044ff" distance={20} />
                    </>
                )}

                <gridHelper args={[50, 50, '#222222', '#444444']} position={[0, -5.5, 0]} />

                <Suspense fallback={null}>
                    <ReactorModel
                        rodPositions={rodPositions}
                        isScrammed={isScrammed}
                        movingRods={movingRods}
                        power={powerKw}
                        isOperating={isOperating}
                    />
                </Suspense>

                <LabelProjector onPositionsUpdate={handlePositionsUpdate} />
            </Canvas>

            {/* ── Label Overlay ── */}
            <LabelOverlay
                positions={labelPositions}
                canvasSize={canvasSize}
                openLabels={openLabels}
                onToggleLabel={handleToggleLabel}
            />

        </div>
    )
}
