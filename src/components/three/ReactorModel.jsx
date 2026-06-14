// src/components/three/ReactorModel.jsx
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Billboard, Line } from '@react-three/drei'

// ═══════════════════════════════════════════
// DIMENSI REAKTOR
// ═══════════════════════════════════════════
const D = {
    poolR: 2.6,
    poolH: 8.5,
    poolWall: 0.25,
    vesselR: 1.45,
    vesselH: 5.0,
    vesselY: -1.5,
    coreR: 1.10,
    coreH: 3.2,
    coreY: -2.5,
    crR: 0.055,
    crAbove: 7.4,
    crBelow: 1.8,
    crWithdraw: 3.5,
    concreteR: 5.5,
}

const POOL_BOTTOM = -D.poolH / 2
const CORE_BOTTOM = D.coreY - D.coreH / 2
const ROD_TOTAL = D.crAbove + D.crBelow
const ROD_Y_BASE = (CORE_BOTTOM + 0.15) + ROD_TOTAL / 2
const DECK_Y = D.poolH / 2 + 0.15
const DRIVE_Y = DECK_Y + 0.5
const WATER_TOP_Y = D.poolH / 2 - 0.2

const CR_POS = {
    safety: [0, 0, 0.55],
    shim: [-0.48, 0, -0.28],
    regulating: [0.48, 0, -0.28],
}

const CR_CFG = {
    safety: { color: '#dd2200', emissive: '#ff1100', driveCol: '#cc2200' },
    shim: { color: '#1144cc', emissive: '#2255ff', driveCol: '#1133bb' },
    regulating: { color: '#22aa44', emissive: '#33cc55', driveCol: '#1a8835' },
}

// ═══════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════
const OP_W = 8.0
const OP_L = 7.0
const OP_H = 3.4
const OP_WALL = 0.22

const PLAT_W = 7.5
const PLAT_L = 6.0

const BRIDGE_W = 1.6
const BRIDGE_LEN = 4.2

// Ujung jembatan = tepat di tepi deck kolam sisi kiri
// Deck inner = D.poolR + D.poolWall = 2.85
// Kita pakai sisi dalam deck (tepi kolam) agar jembatan menyambung ke deck
const DECK_OUTER_R = D.poolR + D.poolWall + 2.5   // ~3.40 (tepi luar bibir kolam)
const POOL_LEFT_EDGE = -DECK_OUTER_R                 // -3.40

const BRIDGE_END_X = POOL_LEFT_EDGE                  // -3.40
const BRIDGE_START_X = BRIDGE_END_X - BRIDGE_LEN    // -7.60
const BRIDGE_MID_X = (BRIDGE_START_X + BRIDGE_END_X) / 2
const BRIDGE_Z = 0.0

const PLAT_CX = BRIDGE_START_X - PLAT_W / 2         // platform center X
const PLAT_CZ = BRIDGE_Z

const OP_CX = PLAT_CX
const OP_CZ = (PLAT_CZ - PLAT_L / 2) - OP_L / 2 - 0.05

// ═══════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════
function getDriveTopColor(pct, isMoving) {
    if (isMoving) return '#FF0000'
    if (pct <= 0) return '#525252'
    if (pct >= 100) return '#22c55e'
    return '#f97316'
}

// ═══════════════════════════════════════════
// LANTAI BETON KOLAM — DIPERBAIKI
// ═══════════════════════════════════════════
function ReactorRoom() {
    const floorShape = new THREE.Shape()
    floorShape.absarc(0, 0, D.concreteR, 0, Math.PI * 2)

    const floorHole = new THREE.Path()
    floorHole.absarc(0, 0, D.poolR + D.poolWall, 0, Math.PI * 2)
    floorShape.holes.push(floorHole)

    return (
        <group>
            {/*
        Lantai annular (donat):
        inner radius = D.poolR + D.poolWall (tepi dalam dinding kolam)
        outer radius = D.concreteR          (tepi luar beton)
        PENTING: inner HARUS < outer
      */}
            <mesh
                position={[0, DECK_Y - 0.05 - 0.5, 0]}  // dikurangi 0.5 agar permukaan atas tetap di tempat
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <extrudeGeometry
                    args={[
                        floorShape,
                        { depth: 0.5, bevelEnabled: false, curveSegments: 64 }
                    ]}
                />
                <meshStandardMaterial
                    color="#bcc8d4"
                    roughness={0.88}
                    metalness={0.2}
                />
            </mesh>
        </group>
    )
}

// ═══════════════════════════════════════════
// RAILING KOLAM (dalam)
// ═══════════════════════════════════════════
function PoolRailing() {
    const RAILING_R = D.poolR + D.poolWall + 0.90
    const POST_H = 1.05
    const RAIL_Y_TOP = DECK_Y + POST_H
    const RAIL_Y_MID = DECK_Y + POST_H * 0.55
    const POST_COUNT = 20
    const WOOD = '#8B5E3C'
    const WOOD_DARK = '#6B4423'
    const METAL = '#3a4a5a'

    return (
        <group>
            <mesh position={[0, RAIL_Y_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[RAILING_R, 0.055, 8, 80]} />
                <meshStandardMaterial color={WOOD} roughness={0.60} metalness={0.04} />
            </mesh>
            <mesh position={[0, RAIL_Y_MID, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[RAILING_R, 0.032, 6, 80]} />
                <meshStandardMaterial color={WOOD} roughness={0.60} metalness={0.04} />
            </mesh>
            {Array.from({ length: POST_COUNT }).map((_, i) => {
                const angle = (i / POST_COUNT) * Math.PI * 2
                const x = Math.cos(angle) * RAILING_R
                const z = Math.sin(angle) * RAILING_R
                return (
                    <group key={i}>
                        <mesh position={[x, DECK_Y + POST_H * 0.5, z]} castShadow>
                            <boxGeometry args={[0.065, POST_H, 0.065]} />
                            <meshStandardMaterial color={WOOD_DARK} roughness={0.65} metalness={0.04} />
                        </mesh>
                        <mesh position={[x, DECK_Y + 0.05, z]}>
                            <boxGeometry args={[0.10, 0.08, 0.10]} />
                            <meshStandardMaterial color={METAL} metalness={0.82} roughness={0.18} />
                        </mesh>
                    </group>
                )
            })}
            {Array.from({ length: POST_COUNT }).map((_, i) => {
                const a1 = (i / POST_COUNT) * Math.PI * 2
                const a2 = ((i + 1) / POST_COUNT) * Math.PI * 2
                const mid = (a1 + a2) / 2
                const mx = Math.cos(mid) * RAILING_R
                const mz = Math.sin(mid) * RAILING_R
                const rot = -mid + Math.PI / 2
                const seg = 2 * Math.PI * RAILING_R / POST_COUNT * 0.90
                return (
                    <mesh key={i} position={[mx, DECK_Y + POST_H * 0.28, mz]} rotation={[0, rot, 0]} castShadow>
                        <boxGeometry args={[seg, POST_H * 0.42, 0.035]} />
                        <meshStandardMaterial color={WOOD} roughness={0.65} metalness={0.04} />
                    </mesh>
                )
            })}
        </group>
    )
}

// ═══════════════════════════════════════════
// PAGAR LUAR — dengan GAP untuk akses jalan
// Gap di sisi kiri (-X, angle ≈ π) selebar BRIDGE_W
// ═══════════════════════════════════════════
function OuterRailing() {
    const OUTER_R = D.poolR + D.poolWall + 2.5
    const POST_H = 1.05
    const RAIL_Y_TOP = DECK_Y + POST_H
    const RAIL_Y_MID = DECK_Y + POST_H * 0.55
    const POST_COUNT = 30   // lebih banyak agar gap lebih presisi
    const WOOD = '#8B5E3C'
    const WOOD_DARK = '#6B4423'
    const METAL = '#3a4a5a'

    // Gap di sisi kiri: angle = Math.PI (titik -X)
    // Lebar gap = BRIDGE_W (1.6) di permukaan lingkaran
    // Sudut gap = arcsin(BRIDGE_W/2 / OUTER_R)
    const gapHalfAngle = Math.asin((BRIDGE_W / 2) / OUTER_R)
    const gapCenter = Math.PI   // sisi kiri (-X)

    // Cek apakah post i berada di dalam gap
    const isInGap = (angle) => {
        // normalisasi ke [0, 2π]
        let a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        let c = ((gapCenter % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        let diff = Math.abs(a - c)
        if (diff > Math.PI) diff = Math.PI * 2 - diff
        return diff < gapHalfAngle + 0.05   // +0.05 margin
    }

    // Segmen arc (untuk handrail & panel) — skip segmen yang kena gap
    const isSegInGap = (a1, a2) => {
        const mid = (a1 + a2) / 2
        return isInGap(mid)
    }

    return (
        <group>
            {/* Handrail atas — dibuat per segmen, skip gap */}
            {Array.from({ length: POST_COUNT }).map((_, i) => {
                const a1 = (i / POST_COUNT) * Math.PI * 2
                const a2 = ((i + 1) / POST_COUNT) * Math.PI * 2
                if (isSegInGap(a1, a2)) return null
                const mid = (a1 + a2) / 2
                const mx = Math.cos(mid) * OUTER_R
                const mz = Math.sin(mid) * OUTER_R
                const rot = -mid + Math.PI / 2
                const segLen = 2 * Math.PI * OUTER_R / POST_COUNT
                return (
                    <group key={`seg-${i}`}>
                        {/* Handrail atas */}
                        <mesh position={[mx, RAIL_Y_TOP, mz]} rotation={[0, rot, 0]}>
                            <boxGeometry args={[segLen * 0.98, 0.055, 0.055]} />
                            <meshStandardMaterial color={WOOD} roughness={0.60} metalness={0.04} />
                        </mesh>
                        {/* Handrail tengah */}
                        <mesh position={[mx, RAIL_Y_MID, mz]} rotation={[0, rot, 0]}>
                            <boxGeometry args={[segLen * 0.98, 0.032, 0.032]} />
                            <meshStandardMaterial color={WOOD} roughness={0.60} metalness={0.04} />
                        </mesh>
                        {/* Panel kayu */}
                        <mesh position={[mx, DECK_Y + POST_H * 0.28, mz]} rotation={[0, rot, 0]}>
                            <boxGeometry args={[segLen * 0.92, POST_H * 0.42, 0.035]} />
                            <meshStandardMaterial color={WOOD} roughness={0.65} metalness={0.04} />
                        </mesh>
                    </group>
                )
            })}

            {/* Tiang vertikal — skip tiang yang di gap */}
            {Array.from({ length: POST_COUNT }).map((_, i) => {
                const angle = (i / POST_COUNT) * Math.PI * 2
                if (isInGap(angle)) return null
                const x = Math.cos(angle) * OUTER_R
                const z = Math.sin(angle) * OUTER_R
                return (
                    <group key={`post-${i}`}>
                        <mesh position={[x, DECK_Y + POST_H * 0.5, z]} castShadow>
                            <boxGeometry args={[0.065, POST_H, 0.065]} />
                            <meshStandardMaterial color={WOOD_DARK} roughness={0.65} metalness={0.04} />
                        </mesh>
                        <mesh position={[x, DECK_Y + 0.05, z]}>
                            <boxGeometry args={[0.10, 0.08, 0.10]} />
                            <meshStandardMaterial color={METAL} metalness={0.82} roughness={0.18} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    )
}

// ═══════════════════════════════════════════
// KOLAM REAKTOR
// ═══════════════════════════════════════════
function Pool({ isOperating, power }) {
    const waterRef = useRef()
    const waterSurfRef = useRef()

    useFrame(({ clock }) => {
        if (!waterRef.current) return
        const t = clock.elapsedTime
        const target = isOperating
            ? new THREE.Color(0.04, 0.12, 0.50 + power / 500)
            : new THREE.Color(0.03, 0.08, 0.32)
        waterRef.current.material.color.lerp(target, 0.05)
        if (waterSurfRef.current && isOperating)
            waterSurfRef.current.material.opacity = 0.60 + Math.sin(t * 1.5) * 0.05
    })

    return (
        <group>
            <mesh>
                <cylinderGeometry args={[D.poolR + D.poolWall, D.poolR + D.poolWall, D.poolH + 0.3, 48, 1, true]} />
                <meshStandardMaterial color="#ccd4dc" roughness={0.78} metalness={0.06} side={THREE.BackSide} />
            </mesh>
            <mesh ref={waterRef}>
                <cylinderGeometry args={[D.poolR, D.poolR, D.poolH - 0.1, 48, 1, false]} />
                <meshStandardMaterial color="#0a1e55" transparent opacity={0.70} depthWrite={false} />
            </mesh>
            <mesh ref={waterSurfRef} position={[0, WATER_TOP_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[D.poolR, 64]} />
                <meshStandardMaterial
                    color="#1a3a7a" transparent opacity={0.60}
                    metalness={0.12} roughness={0.05}
                    depthWrite={false} side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0, POOL_BOTTOM + 0.12, 0]}>
                <cylinderGeometry args={[D.poolR + D.poolWall, D.poolR + D.poolWall, 0.28, 48]} />
                <meshStandardMaterial color="#8a9aaa" roughness={0.88} metalness={0.04} />
            </mesh>
        </group>
    )
}

// ═══════════════════════════════════════════
// PERMUKAAN ATAS REAKTOR
// ═══════════════════════════════════════════
function ReactorTopSurface({ rodPositions, movingRods, isScrammed }) {
    const topY = DECK_Y
    const WHITE = '#e8edf2'
    const WHITE2 = '#dde3e9'
    const METAL = '#8899aa'
    const PW = 1.7, PL = 6.0, PH = 0.12

    const getPct = (key) => isScrammed ? 0 : (rodPositions?.[key] ?? 0)
    const getIsMoving = (key) => !isScrammed && (movingRods?.[key] ?? false)

    return (
        <group>
            <mesh position={[0, topY + PH / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[PW, PH, PL]} />
                <meshStandardMaterial color={WHITE} roughness={0.45} metalness={0.15} />
            </mesh>
            <mesh position={[0, topY + PH, PL / 2 - 0.08]}><boxGeometry args={[PW, PH * 0.6, 0.16]} /><meshStandardMaterial color={WHITE2} roughness={0.45} metalness={0.18} /></mesh>
            <mesh position={[0, topY + PH, -PL / 2 + 0.08]}><boxGeometry args={[PW, PH * 0.6, 0.16]} /><meshStandardMaterial color={WHITE2} roughness={0.45} metalness={0.18} /></mesh>
            <mesh position={[-(PW / 2 - 0.08), topY + PH, 0]}><boxGeometry args={[0.16, PH * 0.6, PL]} /><meshStandardMaterial color={WHITE2} roughness={0.45} metalness={0.18} /></mesh>
            <mesh position={[PW / 2 - 0.08, topY + PH, 0]}><boxGeometry args={[0.16, PH * 0.6, PL]} /><meshStandardMaterial color={WHITE2} roughness={0.45} metalness={0.18} /></mesh>

            {Object.entries(CR_POS).map(([key, [cx, , cz]]) => {
                const pct = getPct(key)
                const isMov = getIsMoving(key)
                const indCol = getDriveTopColor(pct, isMov)
                return (
                    <group key={key} position={[cx, 0, cz]}>
                        <mesh position={[0, topY + PH + 0.28, 0]} castShadow>
                            <cylinderGeometry args={[0.12, 0.12, 0.55, 14]} />
                            <meshStandardMaterial color="#aab4be" metalness={0.75} roughness={0.22} />
                        </mesh>
                        <mesh position={[0, topY + PH + 0.57, 0]}>
                            <cylinderGeometry args={[0.14, 0.14, 0.06, 14]} />
                            <meshStandardMaterial color={indCol} emissive={indCol} emissiveIntensity={isMov ? 0.8 : 0.3} metalness={0.50} roughness={0.25} />
                        </mesh>
                        <mesh position={[0, topY + PH + 0.06, 0]}>
                            <cylinderGeometry args={[0.16, 0.16, 0.08, 14]} />
                            <meshStandardMaterial color={METAL} metalness={0.80} roughness={0.20} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    )
}

// ═══════════════════════════════════════════
// CORE + FUEL RODS
// ═══════════════════════════════════════════
function Core({ power, isOperating }) {
    const fuelRef = useRef()
    const glowRef = useRef()
    const innerGlowRef = useRef()

    const positions = useMemo(() => {
        const pos = []
        const sp = 0.13
        for (let q = -11; q <= 11; q++) {
            for (let r = -11; r <= 11; r++) {
                const x = sp * (q + r * 0.5)
                const z = sp * r * (Math.sqrt(3) / 2)
                if (Math.sqrt(x * x + z * z) < D.coreR - 0.06) {
                    const isCR = Object.values(CR_POS).some(
                        p => Math.sqrt((x - p[0]) ** 2 + (z - p[2]) ** 2) < 0.17
                    )
                    if (!isCR) pos.push([x, z])
                }
            }
        }
        return pos
    }, [])

    useFrame(({ clock }) => {
        if (!fuelRef.current) return
        const t = clock.elapsedTime
        const p = power / 100
        const pulse = 1 + Math.sin(t * 2.8) * 0.06 + Math.sin(t * 5.5) * 0.03
        const dummy = new THREE.Object3D()
        const col = new THREE.Color()
        const colG = new THREE.Color()

        positions.forEach(([x, z], i) => {
            dummy.position.set(x, 0, z)
            dummy.updateMatrix()
            fuelRef.current.setMatrixAt(i, dummy.matrix)
            const dist = Math.sqrt(x * x + z * z) / D.coreR
            const heat = 1 - dist
            if (isOperating) {
                col.setRGB(
                    Math.min(1, 0.15 + p * heat * 0.85),
                    Math.min(1, 0.05 + p * heat * 0.12),
                    Math.min(1, 0.10 + p * (0.3 + dist * 0.7) * 0.90),
                )
            } else {
                col.setRGB(0.20, 0.28, 0.40)
            }
            fuelRef.current.setColorAt(i, col)
            if (glowRef.current) {
                glowRef.current.setMatrixAt(i, dummy.matrix)
                if (isOperating) {
                    const gi = p * (0.4 + heat * 0.6) * pulse
                    colG.setRGB(gi * 0.15, gi * 0.35, Math.min(1, gi))
                } else {
                    colG.setRGB(0, 0, 0)
                }
                glowRef.current.setColorAt(i, colG)
            }
        })

        fuelRef.current.instanceMatrix.needsUpdate = true
        if (fuelRef.current.instanceColor) fuelRef.current.instanceColor.needsUpdate = true
        if (glowRef.current) {
            glowRef.current.instanceMatrix.needsUpdate = true
            if (glowRef.current.instanceColor) glowRef.current.instanceColor.needsUpdate = true
            glowRef.current.material.opacity = isOperating ? p * 0.75 * pulse : 0
            glowRef.current.material.emissiveIntensity = isOperating ? p * 2.5 * pulse : 0
        }
        if (innerGlowRef.current) {
            innerGlowRef.current.material.opacity = isOperating ? p * 0.45 * pulse : 0
            innerGlowRef.current.material.emissiveIntensity = isOperating ? p * 4.0 * pulse : 0
        }
    })

    return (
        <group position={[0, D.coreY, 0]}>
            <mesh position={[0, -D.coreH / 2 - 0.09, 0]}>
                <cylinderGeometry args={[D.coreR + 0.10, D.coreR + 0.10, 0.14, 48]} />
                <meshStandardMaterial color="#445566" metalness={0.85} roughness={0.15} />
            </mesh>
            <instancedMesh ref={fuelRef} args={[null, null, positions.length]} castShadow renderOrder={0}>
                <cylinderGeometry args={[0.036, 0.036, D.coreH, 6]} />
                <meshStandardMaterial vertexColors metalness={0.4} roughness={0.45}
                    emissive={isOperating ? new THREE.Color(0.8, 0.2, 0.1) : new THREE.Color(0, 0, 0)}
                    emissiveIntensity={isOperating ? power / 220 : 0} depthWrite={true} />
            </instancedMesh>
            <instancedMesh ref={glowRef} args={[null, null, positions.length]}>
                <cylinderGeometry args={[0.068, 0.068, D.coreH + 0.05, 6]} />
                <meshStandardMaterial vertexColors transparent opacity={0}
                    emissive={new THREE.Color(0.1, 0.3, 1.0)} emissiveIntensity={0}
                    blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.FrontSide} />
            </instancedMesh>
            <instancedMesh ref={innerGlowRef} args={[null, null, positions.length]}>
                <cylinderGeometry args={[0.11, 0.11, D.coreH + 0.1, 6]} />
                <meshStandardMaterial color="#2244ff" transparent opacity={0}
                    emissive={new THREE.Color(0.1, 0.2, 1.0)} emissiveIntensity={0}
                    blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.FrontSide} />
            </instancedMesh>
            <mesh position={[0, D.coreH / 2 + 0.05, 0]}>
                <cylinderGeometry args={[D.coreR + 0.10, D.coreR + 0.10, 0.10, 48]} />
                <meshStandardMaterial color="#445566" metalness={0.85} roughness={0.15}
                    transparent opacity={0.60} depthWrite={false} />
            </mesh>
            <mesh>
                <cylinderGeometry args={[D.coreR + 0.12, D.coreR + 0.12, D.coreH + 0.20, 48, 1, true]} />
                <meshStandardMaterial color="#3a6a8a" metalness={0.70} roughness={0.30}
                    transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <CoreVolumeGlow power={power} isOperating={isOperating} />
        </group>
    )
}

function CoreVolumeGlow({ power, isOperating }) {
    const r1 = useRef(), r2 = useRef(), r3 = useRef()
    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        const p = power / 100
        const pulse = 1 + Math.sin(t * 2.2) * 0.08 + Math.sin(t * 4.1) * 0.04
        const base = isOperating ? p * pulse : 0
        if (r1.current) r1.current.material.opacity = base * 0.85
        if (r2.current) r2.current.material.opacity = base * 0.65
        if (r3.current) r3.current.material.opacity = base * 0.45
    })
    return (
        <>
            <mesh ref={r1}><cylinderGeometry args={[D.coreR * 0.55, D.coreR * 0.55, D.coreH * 0.95, 32]} /><meshStandardMaterial color="#3355ff" emissive="#2244ff" emissiveIntensity={power / 8} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh ref={r2}><cylinderGeometry args={[D.coreR * 0.85, D.coreR * 0.85, D.coreH * 0.98, 32]} /><meshStandardMaterial color="#2244dd" emissive="#1133cc" emissiveIntensity={power / 30} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh ref={r3}><cylinderGeometry args={[D.coreR * 1.05, D.coreR * 1.05, D.coreH * 1.02, 32]} /><meshStandardMaterial color="#1133bb" emissive="#0022aa" emissiveIntensity={power / 40} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </>
    )
}

// ═══════════════════════════════════════════
// BATANG KENDALI
// ═══════════════════════════════════════════
function ControlRod({ type, pct, isMoving }) {
    const cfg = CR_CFG[type]
    const pos = CR_POS[type]
    const liftY = (pct / 100) * D.crWithdraw
    const rodY = ROD_Y_BASE + liftY
    const rodBottom = rodY - ROD_TOTAL / 2
    const adjustedRodY = rodBottom < POOL_BOTTOM + 0.2
        ? POOL_BOTTOM + 0.2 + ROD_TOTAL / 2 : rodY
    const rodTopY = adjustedRodY + ROD_TOTAL / 2
    const connLen = Math.max(0.05, DRIVE_Y - rodTopY)
    const connMidY = rodTopY + connLen / 2
    const tubeH = DECK_Y - (D.vesselY - D.vesselH / 2)
    const tubeMidY = (D.vesselY - D.vesselH / 2) + tubeH / 2

    return (
        <group position={[pos[0], 0, pos[2]]}>
            <mesh position={[0, tubeMidY, 0]}>
                <cylinderGeometry args={[D.crR + 0.025, D.crR + 0.025, tubeH, 10, 1, true]} />
                <meshStandardMaterial color="#2a3a4a" metalness={0.70} roughness={0.30}
                    transparent opacity={0.22} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, adjustedRodY, 0]} castShadow>
                <cylinderGeometry args={[D.crR, D.crR, ROD_TOTAL, 10]} />
                <meshStandardMaterial color={cfg.color} emissive={cfg.emissive}
                    emissiveIntensity={0.3 + pct / 250} metalness={0.78} roughness={0.18} />
            </mesh>
            <mesh position={[0, adjustedRodY - ROD_TOTAL / 2 - 0.14, 0]}>
                <cylinderGeometry args={[D.crR + 0.007, D.crR - 0.012, 0.28, 10]} />
                <meshStandardMaterial color="#112213" metalness={0.90} roughness={0.08} />
            </mesh>
            {connLen > 0.05 && (
                <mesh position={[0, connMidY, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, connLen, 6]} />
                    <meshStandardMaterial color="#889aaa" metalness={0.85} roughness={0.15} />
                </mesh>
            )}
        </group>
    )
}

// ═══════════════════════════════════════════
// CHERENKOV
// ═══════════════════════════════════════════
function Cherenkov({ power, isOperating }) {
    const outerConeRef = useRef()
    const innerConeRef = useRef()
    const shaftRef = useRef()
    const waterGlowRef = useRef()
    const partRef = useRef()
    const sparkRef = useRef()
    const N_PART = 1200, N_SPARK = 400

    const { positions: pPos, speeds: pSpd } = useMemo(() => {
        const positions = new Float32Array(N_PART * 3)
        const speeds = new Float32Array(N_PART)
        for (let i = 0; i < N_PART; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * (D.coreR - 0.08)
            positions[i * 3] = Math.cos(a) * r; positions[i * 3 + 1] = (Math.random() - 0.5) * D.coreH; positions[i * 3 + 2] = Math.sin(a) * r
            speeds[i] = 0.8 + Math.random() * 2.2
        }
        return { positions, speeds }
    }, [])

    const { positions: sPos, speeds: sSpd } = useMemo(() => {
        const positions = new Float32Array(N_SPARK * 3)
        const speeds = new Float32Array(N_SPARK)
        for (let i = 0; i < N_SPARK; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * 0.5
            positions[i * 3] = Math.cos(a) * r; positions[i * 3 + 1] = (Math.random() - 0.5) * D.coreH * 0.8; positions[i * 3 + 2] = Math.sin(a) * r
            speeds[i] = 1.5 + Math.random() * 3.0
        }
        return { positions, speeds }
    }, [])

    useFrame(({ clock }) => {
        if (!isOperating) {
            ;[outerConeRef, innerConeRef, shaftRef, waterGlowRef, partRef, sparkRef]
                .forEach(r => { if (r.current?.material) r.current.material.opacity = 0 })
            return
        }
        const t = clock.elapsedTime, p = power / 100
        const flk = 1 + Math.sin(t * 3.5) * 0.07 + Math.sin(t * 7.2) * 0.03
        if (outerConeRef.current) outerConeRef.current.material.opacity = p * 0.85 * flk
        if (innerConeRef.current) innerConeRef.current.material.opacity = p * 0.95 * flk
        if (shaftRef.current) shaftRef.current.material.opacity = p * 0.85 * flk
        if (waterGlowRef.current) waterGlowRef.current.material.opacity = p * 0.30 * flk
        if (partRef.current) {
            const arr = partRef.current.geometry.attributes.position.array
            for (let i = 0; i < N_PART; i++) {
                arr[i * 3 + 1] += pSpd[i] * 0.014
                if (arr[i * 3 + 1] > D.coreH / 2 + 0.5) {
                    arr[i * 3 + 1] = -D.coreH / 2 - 0.5
                    const a = Math.random() * Math.PI * 2, r = Math.random() * (D.coreR - 0.1)
                    arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 2] = Math.sin(a) * r
                }
            }
            partRef.current.geometry.attributes.position.needsUpdate = true
            partRef.current.material.opacity = p * 0.95 * flk
        }
        if (sparkRef.current) {
            const arr = sparkRef.current.geometry.attributes.position.array
            for (let i = 0; i < N_SPARK; i++) {
                arr[i * 3 + 1] += sSpd[i] * 0.018
                if (arr[i * 3 + 1] > D.coreH / 2 + 1.0) {
                    arr[i * 3 + 1] = -D.coreH / 2 - 0.5
                    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.6
                    arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 2] = Math.sin(a) * r
                }
            }
            sparkRef.current.geometry.attributes.position.needsUpdate = true
            sparkRef.current.material.opacity = p * 1.0 * flk
        }
    })

    const partGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); return g }, [pPos])
    const sparkGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(sPos, 3)); return g }, [sPos])

    return (
        <group position={[0, D.coreY, 0]}>
            <mesh ref={outerConeRef}><cylinderGeometry args={[D.coreR * 0.95, 0.05, D.coreH, 48, 10, true]} /><meshStandardMaterial color="#1133cc" emissive="#0022bb" emissiveIntensity={power / 12} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh ref={innerConeRef}><cylinderGeometry args={[D.coreR * 0.65, 0.03, D.coreH * 0.9, 32, 8, true]} /><meshStandardMaterial color="#3366ff" emissive="#2255ff" emissiveIntensity={power / 25} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh ref={shaftRef}><cylinderGeometry args={[0.12, 0.04, D.coreH * 1.1, 16, 4, true]} /><meshStandardMaterial color="#88aaff" emissive="#6688ff" emissiveIntensity={power / 18} transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh ref={waterGlowRef} position={[0, D.poolH / 4, 0]}><cylinderGeometry args={[D.poolR * 0.88, D.poolR * 0.88, D.poolH * 0.75, 32, 1, true]} /><meshStandardMaterial color="#0033aa" emissive="#0022aa" emissiveIntensity={power / 45} transparent opacity={0} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <points ref={partRef} geometry={partGeo}><pointsMaterial color="#6699ff" size={0.065} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation /></points>
            <points ref={sparkRef} geometry={sparkGeo}><pointsMaterial color="#ccddff" size={0.048} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation /></points>
        </group>
    )
}

// ═══════════════════════════════════════════
// MARKER LABELS
// ═══════════════════════════════════════════
export function ReactorLabelMarkers() {
    const markers = [
        { id: 'core', position: [0, D.coreY, D.coreR + 0.1] },
        { id: 'controlrods', position: [CR_POS.safety[0], DECK_Y + 0.5, CR_POS.safety[2]] },
        { id: 'pool', position: [D.poolR + D.poolWall, 0, 0] },
        { id: 'water', position: [D.poolR * 0.6, -2.0, 0] },
        { id: 'deck', position: [D.poolR + D.poolWall + 0.3, DECK_Y, 0] },
        { id: 'railing', position: [D.poolR + D.poolWall + 0.90, DECK_Y + 0.6, 0] },
        { id: 'vessel', position: [D.vesselR + 0.05, D.vesselY, 0] },
        { id: 'drive', position: [CR_POS.shim[0], DECK_Y + 0.55, CR_POS.shim[2]] },
    ]
    return (
        <group>
            {markers.map(({ id, position }) => (
                <mesh key={id} position={position} userData={{ labelId: id }}>
                    <sphereGeometry args={[0.055, 8, 8]} />
                    <meshBasicMaterial color="#ffdd44" />
                </mesh>
            ))}
        </group>
    )
}

// ═══════════════════════════════════════════
// KURSI OPERATOR
// ═══════════════════════════════════════════
function OperatorChair({ position, rotY = 0 }) {
    const FABRIC = '#0e1d2c'
    const METAL = '#3a4a5a'
    return (
        <group position={position} rotation={[0, rotY, 0]}>
            <mesh position={[0, 0.48, 0]} castShadow>
                <boxGeometry args={[0.50, 0.08, 0.48]} />
                <meshStandardMaterial color={FABRIC} roughness={0.88} />
            </mesh>
            <mesh position={[0, 0.53, 0]}>
                <boxGeometry args={[0.46, 0.06, 0.44]} />
                <meshStandardMaterial color="#142030" roughness={0.92} />
            </mesh>
            <mesh position={[0, 0.90, 0.16]} rotation={[-0.08, 0, 0]} castShadow>
                <boxGeometry args={[0.48, 0.70, 0.08]} />
                <meshStandardMaterial color={FABRIC} roughness={0.88} />
            </mesh>
            {[-1, 1].map((s, i) => (
                <mesh key={i} position={[s * 0.27, 0.65, 0]}>
                    <boxGeometry args={[0.055, 0.055, 0.40]} />
                    <meshStandardMaterial color={METAL} metalness={0.72} roughness={0.28} />
                </mesh>
            ))}
            <mesh position={[0, 0.24, 0]}>
                <cylinderGeometry args={[0.035, 0.055, 0.48, 8]} />
                <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.15} />
            </mesh>
            {Array.from({ length: 5 }).map((_, i) => {
                const a = (i / 5) * Math.PI * 2
                return (
                    <group key={i}>
                        <mesh position={[Math.cos(a) * 0.24, 0.04, Math.sin(a) * 0.24]} rotation={[0, a, 0]}>
                            <boxGeometry args={[0.46, 0.038, 0.048]} />
                            <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.15} />
                        </mesh>
                        <mesh position={[Math.cos(a) * 0.24, 0.022, Math.sin(a) * 0.24]}>
                            <sphereGeometry args={[0.030, 6, 6]} />
                            <meshStandardMaterial color="#111" roughness={0.50} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    )
}

// ═══════════════════════════════════════════
// MEJA + KOMPUTER
// ═══════════════════════════════════════════
function OperatorDeskInside({ flY }) {
    const DESK = '#1c2b3a'
    const DESK_T = '#243444'
    const METAL = '#3a4f60'
    const SCR_BG = '#000a18'
    const SCR_EM = '#0055ee'

    const leftX = OP_CX - OP_W / 2
    const rightX = OP_CX + OP_W / 2

    // ── Posisi meja ──
    // Dimundurkan dari jendela kaca: deskX lebih ke kiri (-X)
    // Dari denah: meja di kanan-tengah ruangan
    // rightX = OP_CX + OP_W/2 (dinding kaca)
    // Meja mundur ~2.5 unit dari dinding kaca
    const deskX = rightX - 2.5   // mundur dari kaca
    const deskCZ = OP_CZ          // tengah ruangan (arah Z)
    const deskLen = 5.6            // panjang meja (arah Z), cukup 4 stasiun
    const deskW = 1.0            // lebar meja (arah X)

    // 4 posisi stasiun kerja sepanjang Z
    const stations = [-2.1, -0.7, 0.7, 2.1]

    return (
        <group>

            {/* ── Permukaan meja ── */}
            <mesh position={[deskX, flY + 0.78, deskCZ]} castShadow>
                <boxGeometry args={[deskW, 0.06, deskLen]} />
                <meshStandardMaterial color={DESK_T} metalness={0.55} roughness={0.35} />
            </mesh>

            {/* ── Badan/kabinet meja ── */}
            <mesh position={[deskX, flY + 0.38, deskCZ]} castShadow>
                <boxGeometry args={[deskW - 0.05, 0.76, deskLen]} />
                <meshStandardMaterial color={DESK} metalness={0.45} roughness={0.50} />
            </mesh>

            {/* ── 4 Stasiun kerja ── */}
            {stations.map((zo, i) => (
                <group key={i}>

                    {/* 
            Monitor:
            - Posisi: di tepi kiri meja (sisi -X meja), di atas permukaan
            - Rotasi: rotation Y = 0 → layar menghadap -X (ke arah kursi)
            - Layar tipis (X tipis, Y tinggi, Z lebar)
          */}
                    <group
                        position={[
                            deskX - deskW / 2 + 0.6,  // tepat di tepi kiri meja
                            flY + 1.18,                  // di atas meja
                            deskCZ + zo,
                        ]}
                        rotation={[0, 0, 0]}  // layar menghadap -X (ke kursi)
                    >
                        {/* Layar */}
                        <mesh>
                            <boxGeometry args={[0.06, 0.50, 0.70]} />
                            <meshStandardMaterial
                                color={SCR_BG}
                                emissive={SCR_EM}
                                emissiveIntensity={0.8}
                            />
                        </mesh>
                        {/* Bezel */}
                        <mesh>
                            <boxGeometry args={[0.09, 0.55, 0.76]} />
                            <meshStandardMaterial
                                color="#111a24"
                                metalness={0.65}
                                roughness={0.35}
                            />
                        </mesh>
                        {/* Kaki monitor */}
                        <mesh position={[0, -0.32, 0]}>
                            <boxGeometry args={[0.04, 0.12, 0.18]} />
                            <meshStandardMaterial
                                color={METAL}
                                metalness={0.80}
                                roughness={0.20}
                            />
                        </mesh>
                    </group>

                    {/* 
            Kursi:
            - Posisi: di sebelah kiri meja (sisi -X), ~0.8 dari tepi meja
            - rotY = 0 → kursi menghadap +X (ke arah monitor/meja)
            - Sesuai denah: kursi (cyan) di kiri meja (kuning)
          */}
                    <OperatorChair
                        position={[
                            deskX - deskW / 2 - 0.85,  // kiri meja
                            flY,
                            deskCZ + zo,
                        ]}
                        rotY={4.7}  // menghadap +X → ke arah meja
                    />

                </group>
            ))}

        </group>
    )
}

// ═══════════════════════════════════════════
// PANEL KONTROL
// ═══════════════════════════════════════════
function ReactorControlPanelInside({ flY }) {
    const METAL = '#3a4f60'
    const PANEL = '#2a3a4a'

    const leftX = OP_CX - OP_W / 2
    const backZ = OP_CZ + OP_L / 2

    // Panel menempel dinding kiri (-X), dekat pintu (backZ)
    // Posisi: X = leftX + setengah lebar panel, Z = backZ - offset
    const panelW = 1.2   // lebar panel (arah Z)
    const panelD = 0.45  // kedalaman panel (arah X)
    const panelH = 2.4   // tinggi panel

    const panelX = leftX + panelD / 2 + OP_WALL
    const panelZ = backZ - panelW / 2 - 0.4  // dekat pintu tapi tidak menghalangi

    return (
        <group position={[panelX + 6.7, flY + panelH / 2, panelZ + 0.7]} rotation={[0, -4.72, 0]}>

            {/* Badan utama panel */}
            <mesh castShadow>
                <boxGeometry args={[panelD, panelH, panelW]} />
                <meshStandardMaterial
                    color={PANEL}
                    metalness={0.75}
                    roughness={0.30}
                />
            </mesh>

            {/* Detail panel: tombol/indikator (sisi kanan/+X menghadap ruangan) */}
            {/* Baris indikator atas */}
            {[-0.35, -0.10, 0.15, 0.40].map((zOff, i) => (
                <mesh key={`ind-${i}`} position={[panelD / 2 + 0.01, 0.6, zOff]}>
                    <boxGeometry args={[0.02, 0.08, 0.08]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? '#22cc44' : '#cc4422'}
                        emissive={i % 2 === 0 ? '#00ff22' : '#ff2200'}
                        emissiveIntensity={0.6}
                    />
                </mesh>
            ))}

            {/* Layar kecil panel (tidak biru mencolok) */}
            <mesh position={[panelD / 2 + 0.01, 0.15, 0]}>
                <boxGeometry args={[0.02, 0.35, 0.55]} />
                <meshStandardMaterial
                    color="#0a1520"
                    emissive="#004488"
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* Detail fisik: pegangan/handle */}
            <mesh position={[panelD / 2 + 0.04, -0.5, 0]}>
                <boxGeometry args={[0.06, 0.08, 0.25]} />
                <meshStandardMaterial color="#445566" metalness={0.85} roughness={0.15} />
            </mesh>

        </group>
    )
}

// ═══════════════════════════════════════════
// RUANG OPERATOR
// ═══════════════════════════════════════════
function OperatorRoomBlock() {
    const flY = DECK_Y
    const ceY = flY + OP_H
    const leftX = OP_CX - OP_W / 2
    const rightX = OP_CX + OP_W / 2
    const frontZ = OP_CZ - OP_L / 2
    const backZ = OP_CZ + OP_L / 2

    const WALL_EXT = '#d8e0e8'
    const METAL_D = '#2a3a4a'
    const GLASS = '#aad7ff'

    const DOOR_W = 1.3
    const DOOR_H = 2.35
    const DOOR_X = OP_CX
    const DOOR_Z = backZ + OP_WALL / 2

    // Kaca: dinding kanan (+X), hampir penuh tinggi & panjang
    const GLASS_H = OP_H - 0.5
    const GLASS_W = OP_L * 0.85
    const GLASS_Y = flY + 0.25 + GLASS_H / 2

    return (
        <group>

            {/* ── Lantai ── */}
            <mesh position={[OP_CX, flY - 0.08, OP_CZ]} receiveShadow>
                <boxGeometry args={[OP_W + OP_WALL * 2, 0.18, OP_L + OP_WALL * 2]} />
                <meshStandardMaterial color="#c7d2dc" roughness={0.85} metalness={0.04} />
            </mesh>

            {/* ── Ubin lantai ── */}
            {Array.from({ length: 7 }).map((_, zi) =>
                Array.from({ length: 8 }).map((_, xi) => {
                    const tw = OP_W / 8
                    const tl = OP_L / 7
                    return (
                        <mesh
                            key={`t-${xi}-${zi}`}
                            position={[leftX + tw * (xi + 0.5), flY + 0.005, frontZ + tl * (zi + 0.5)]}
                            receiveShadow
                        >
                            <boxGeometry args={[tw - 0.03, 0.012, tl - 0.03]} />
                            <meshStandardMaterial
                                color={(xi + zi) % 2 === 0 ? '#cfd9e2' : '#bac9d6'}
                                roughness={0.45}
                                metalness={0.08}
                            />
                        </mesh>
                    )
                })
            )}

            {/* ── Dinding kiri (-X) ── */}
            <mesh position={[leftX - OP_WALL / 2, flY + OP_H / 2, OP_CZ]} castShadow>
                <boxGeometry args={[OP_WALL, OP_H - 0.015, OP_L + OP_WALL * 2]} />
                <meshStandardMaterial color={WALL_EXT} roughness={0.82} />
            </mesh>

            {/* ── Dinding depan (-Z) ── */}
            <mesh
                position={[OP_CX, flY + OP_H / 2 - 0.05, frontZ - OP_WALL / 2]}
                castShadow
            >
                <boxGeometry args={[OP_W + OP_WALL * 0.15, OP_H - 0.1, OP_WALL]} />
                <meshStandardMaterial color={WALL_EXT} roughness={0.82} />
            </mesh>

            {/* ── Dinding belakang (+Z) — dengan pintu ── */}
            {/* Panel kiri pintu */}
            <mesh
                position={[
                    OP_CX - (DOOR_W / 2 + (OP_W - DOOR_W) / 4),
                    flY + OP_H / 2,
                    backZ + OP_WALL / 2,
                ]}
                castShadow
            >
                <boxGeometry args={[(OP_W - DOOR_W) / 2, OP_H + 0.2, OP_WALL]} />
                <meshStandardMaterial color={WALL_EXT} roughness={0.82} />
            </mesh>
            {/* Panel kanan pintu */}
            <mesh
                position={[
                    OP_CX + (DOOR_W / 2 + (OP_W - DOOR_W) / 4),
                    flY + OP_H / 2,
                    backZ + OP_WALL / 2,
                ]}
                castShadow
            >
                <boxGeometry args={[(OP_W - DOOR_W) / 2, OP_H + 0.2, OP_WALL]} />
                <meshStandardMaterial color={WALL_EXT} roughness={0.82} />
            </mesh>
            {/* Panel atas pintu */}
            <mesh
                position={[DOOR_X, flY + DOOR_H + (OP_H - DOOR_H) / 2, backZ + OP_WALL / 2]}
                castShadow
            >
                <boxGeometry args={[DOOR_W, OP_H - DOOR_H, OP_WALL]} />
                <meshStandardMaterial color={WALL_EXT} roughness={0.82} />
            </mesh>

            {/* ── Dinding kanan (+X) — frame kaca ── */}
            {/* Frame bawah */}
            <mesh position={[rightX + OP_WALL / 0.8 - 0.15, flY + 0.125, OP_CZ]}>
                <boxGeometry args={[OP_WALL, 0.24, OP_L + OP_WALL * 2]} />
                <meshStandardMaterial color={METAL_D} metalness={0.85} roughness={0.20} />
            </mesh>
            {/* Frame atas */}
            <mesh position={[rightX + OP_WALL / 0.8 - 0.15, flY + OP_H - 0.22, OP_CZ]}>
                <boxGeometry args={[OP_WALL, 0.24, OP_L + OP_WALL * 2]} />
                <meshStandardMaterial color={METAL_D} metalness={0.85} roughness={0.20} />
            </mesh>
            {/* Frame vertikal (5 divisi untuk OP_L=7.0) */}
            {[-GLASS_W / 2, -GLASS_W / 6, GLASS_W / 6, GLASS_W / 2].map((zOff, i) => (
                <mesh
                    key={i}
                    position={[rightX + OP_WALL / 2 + 0.02, flY + OP_H / 2, OP_CZ + zOff]}
                >
                    <boxGeometry args={[OP_WALL, OP_H + 0.2, 0.08]} />
                    <meshStandardMaterial
                        color={METAL_D}
                        metalness={0.85}
                        roughness={0.20}
                        polygonOffset={true}
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                    />
                </mesh>
            ))}
            {/* Kaca */}
            <mesh position={[rightX + OP_WALL / 2, GLASS_Y - 0.1, OP_CZ]}>
                <boxGeometry args={[0.1, GLASS_H + 0.5, GLASS_W + 1.49]} />
                <meshStandardMaterial
                    color={GLASS}
                    transparent
                    opacity={0.22}
                    roughness={0.02}
                    metalness={0.05}
                    polygonOffset={true}
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                />
            </mesh>

            {/* ── Plafon ── */}
            <mesh position={[OP_CX, ceY, OP_CZ]}>
                <boxGeometry args={[OP_W + OP_WALL * 2, 0.20, OP_L + OP_WALL * 2]} />
                <meshStandardMaterial color="#e8edf2" roughness={0.70} metalness={0.05} />
            </mesh>

            {/* ── Daun pintu ── */}
            <mesh
                position={[DOOR_X, flY + DOOR_H / 2, DOOR_Z + 0.05]}
                rotation={[0, Math.PI * 0.12, 0]}
                castShadow
            >
                <boxGeometry args={[DOOR_W, DOOR_H - 0.04, 0.06]} />
                <meshStandardMaterial color="#7f92a3" metalness={0.55} roughness={0.35} />
            </mesh>

            {/* ── Isi ruangan ── */}
            <OperatorDeskInside flY={flY} />
            <ReactorControlPanelInside flY={flY} />

        </group>
    )
}

// ═══════════════════════════════════════════
// HELPER: SATU SEGMEN RAILING LURUS
// ═══════════════════════════════════════════
function RailSegment({ x1, z1, x2, z2, y, n = 5 }) {
    const WOOD = '#8B5E3C'
    const WOOD_D = '#6B4423'
    const METAL = '#3a4a5a'
    const POST_H = 1.05
    const BY = y + 0.05

    const midX = (x1 + x2) / 2
    const midZ = (z1 + z2) / 2
    const lenX = Math.abs(x2 - x1)
    const lenZ = Math.abs(z2 - z1)
    const isX = lenX >= lenZ

    const posts = Array.from({ length: n }, (_, i) => {
        const t = n > 1 ? i / (n - 1) : 0.5
        return { x: x1 + (x2 - x1) * t, z: z1 + (z2 - z1) * t }
    })

    return (
        <group>
            <mesh position={[midX, BY + POST_H, midZ]}>
                <boxGeometry args={[isX ? lenX : 0.05, 0.05, isX ? 0.05 : lenZ]} />
                <meshStandardMaterial color={WOOD} roughness={0.60} />
            </mesh>
            <mesh position={[midX, BY + POST_H * 0.55, midZ]}>
                <boxGeometry args={[isX ? lenX : 0.032, 0.032, isX ? 0.032 : lenZ]} />
                <meshStandardMaterial color={WOOD} roughness={0.60} />
            </mesh>
            <mesh position={[midX, BY + POST_H * 0.28, midZ]}>
                <boxGeometry args={[isX ? lenX : 0.035, POST_H * 0.42, isX ? 0.035 : lenZ]} />
                <meshStandardMaterial color={WOOD} roughness={0.65} metalness={0.04} />
            </mesh>
            {posts.map((p, i) => (
                <group key={i}>
                    <mesh position={[p.x, BY + POST_H / 2, p.z]} castShadow>
                        <boxGeometry args={[0.065, POST_H, 0.065]} />
                        <meshStandardMaterial color={WOOD_D} roughness={0.65} />
                    </mesh>
                    <mesh position={[p.x, BY + 0.04, p.z]}>
                        <boxGeometry args={[0.10, 0.07, 0.10]} />
                        <meshStandardMaterial color={METAL} metalness={0.82} roughness={0.18} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

// ═══════════════════════════════════════════
// PLATFORM LANTAI — DIPERBAIKI
// Railing:
//   ✗ Sisi KIRI  (-X): TIDAK ADA (menyatu dinding luar RO)
//   ✗ Sisi DEPAN (-Z): TIDAK ADA (menempel dinding belakang RO)
//   ✓ Sisi BELAKANG (+Z): ADA
//   ✓ Sisi KANAN (+X): ADA, dengan bukaan jembatan di tengah
//   ✓ DITAMBAHKAN: ujung-ujung sisi kiri (-X) yang tidak menyatu dinding
//     → hanya segmen pendek di sudut kiri-belakang dan kiri-depan
// ═══════════════════════════════════════════
function OperatorPlatformBlock() {
    const flY = DECK_Y
    const CONCRETE = '#bcc8d4'

    const leftX = PLAT_CX - PLAT_W / 2
    const rightX = PLAT_CX + PLAT_W / 2.1
    const frontZ = PLAT_CZ - PLAT_L / 2.3
    const backZ = PLAT_CZ + PLAT_L / 2

    const gapZ1 = PLAT_CZ - BRIDGE_W / 2
    const gapZ2 = PLAT_CZ + BRIDGE_W / 2

    return (
        <group>
            {/* Base platform */}
            <mesh position={[PLAT_CX, flY - 0.09, PLAT_CZ]} receiveShadow>
                <boxGeometry args={[PLAT_W, 0.20, PLAT_L]} />
                <meshStandardMaterial color={CONCRETE} roughness={0.86} />
            </mesh>

            {/* Sisi KIRI (-X) */}
            <RailSegment x1={leftX} z1={frontZ} x2={leftX} z2={backZ} y={flY} n={4} />
            {/* Sisi BELAKANG (+Z) */}
            <RailSegment x1={leftX} z1={backZ} x2={rightX} z2={backZ} y={flY} n={6} />
            {/* Sisi KANAN (+X): depan gap */}
            <RailSegment x1={rightX} z1={frontZ} x2={rightX} z2={gapZ1} y={flY} n={3} />
            {/* Sisi KANAN (+X): belakang gap */}
            <RailSegment x1={rightX} z1={gapZ2} x2={rightX} z2={backZ} y={flY} n={3} />
        </group>
    )
}

// ═══════════════════════════════════════════
// JEMBATAN PENGHUBUNG — DIPERBAIKI
// BRIDGE_END_X = tepat di tepi deck kolam (= -DECK_INNER_R)
// ═══════════════════════════════════════════
function OperatorBridgeBlock() {
    const flY = DECK_Y
    const BY = flY + 0.04
    const CONCRETE = '#bcc8d4'

    const startX = BRIDGE_START_X
    // Tambah 0.2 overlap agar pagar jembatan masuk sedikit 
    // ke dalam area pagar kolam → tidak ada gap visual sama sekali
    const endX = BRIDGE_END_X - 0.10   // -5.35 + 0.20 = -5.15 (overlap)
    const midX = (startX + endX) / 2
    const z = BRIDGE_Z
    const BW = BRIDGE_W

    return (
        <group>
            {/* Base beton */}
            <mesh position={[midX, BY - 0.12, z]}>
                <boxGeometry args={[
                    Math.abs(endX - startX) + 0.12,
                    0.18,
                    BW + 0.32
                ]} />
                <meshStandardMaterial
                    color={CONCRETE}
                    roughness={0.88}
                    metalness={0.04}
                />
            </mesh>

            {/* Pagar kiri — overlap ke pagar kolam */}
            <RailSegment
                x1={startX} z1={z - BW / 2}
                x2={endX} z2={z - BW / 2}
                y={flY} n={6}
            />

            {/* Pagar kanan — overlap ke pagar kolam */}
            <RailSegment
                x1={startX} z1={z + BW / 2}
                x2={endX} z2={z + BW / 2}
                y={flY} n={6}
            />
        </group>
    )
}

// ═══════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════
export default function ReactorModel({
    rodPositions,
    isScrammed,
    movingRods,
    power,
    isOperating,
}) {
    const pct = (key) => (isScrammed ? 0 : (rodPositions?.[key] ?? 0))
    const isMoving = (key) => (!isScrammed && (movingRods?.[key] ?? false))

    return (
        <group position={[0, 0, 0]}>
            {/* Lantai beton kolam (DIPERBAIKI) */}
            <ReactorRoom />

            {/* Kolam reaktor */}
            <Pool isOperating={isOperating} power={power} />

            {/* Railing dalam kolam */}
            <PoolRailing />

            {/* Pagar luar — dengan gap akses */}
            <OuterRailing />

            {/* Permukaan atas reaktor */}
            <ReactorTopSurface
                rodPositions={rodPositions}
                movingRods={movingRods}
                isScrammed={isScrammed}
            />

            {/* Core + fuel rods */}
            <Core power={power} isOperating={isOperating} />

            {/* Batang kendali */}
            <ControlRod type="safety" pct={pct('safety')} isMoving={isMoving('safety')} />
            <ControlRod type="shim" pct={pct('shim')} isMoving={isMoving('shim')} />
            <ControlRod type="regulating" pct={pct('regulating')} isMoving={isMoving('regulating')} />

            {/* Efek Cherenkov */}
            <Cherenkov power={power} isOperating={isOperating} />

            {/* Layout sesuai denah */}
            <OperatorRoomBlock />
            <OperatorPlatformBlock />
            <OperatorBridgeBlock />
        </group>
    )
}