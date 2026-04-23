// src/components/three/ReactorModel.jsx
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ═══════════════════════════════════════════
// DIMENSI REAKTOR
// ═══════════════════════════════════════════
const D = {
    poolR: 2.6,
    poolH: 8.5,
    poolWall: 0.15,
    vesselR: 2.1,
    vesselH: 6.0,
    vesselY: -0.3,
    coreR: 1.45,
    coreH: 3.2,
    coreY: -1.5,
    crR: 0.055,
    crAbove: 4.2,
    crBelow: 1.8,
    crWithdraw: 3.5,
}

const POOL_BOTTOM = -D.poolH / 2
const CORE_BOTTOM = D.coreY - D.coreH / 2
const ROD_TOTAL = D.crAbove + D.crBelow
const ROD_Y_BASE = (CORE_BOTTOM + 0.15) + ROD_TOTAL / 2
const DRIVE_Y = D.vesselY + D.vesselH / 2 + 0.9

const CR_POS = {
    safety: [0, 0, 0.65],
    shim: [-0.56, 0, -0.32],
    regulating: [0.56, 0, -0.32],
}

const CR_CFG = {
    safety: {
        color: '#dd2200', emissive: '#ff1100',
        driveCol: '#cc2200', driveTop: '#ff4433',
    },
    shim: {
        color: '#1144cc', emissive: '#2255ff',
        driveCol: '#1133bb', driveTop: '#4488ff',
    },
    regulating: {
        color: '#cccccc', emissive: '#eeeeee',
        driveCol: '#999999', driveTop: '#dddddd',
    },
}

// ═══════════════════════════════════════════
// KOLAM
// ═══════════════════════════════════════════
function Pool({ isOperating, power }) {
    const waterRef = useRef()

    useFrame(() => {
        if (!waterRef.current) return
        waterRef.current.material.color.set(
            isOperating
                ? new THREE.Color(0.04, 0.12, 0.50 + power / 500)
                : new THREE.Color(0.03, 0.08, 0.32)
        )
    })

    return (
        <group>
            {/* Dinding kolam transparan */}
            <mesh>
                <cylinderGeometry
                    args={[D.poolR + D.poolWall, D.poolR + D.poolWall,
                    D.poolH, 64, 1, true]}
                />
                <meshStandardMaterial
                    color="#6688aa"
                    metalness={0.25}
                    roughness={0.1}
                    transparent
                    opacity={0.10}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Volume air */}
            <mesh ref={waterRef}>
                <cylinderGeometry
                    args={[D.poolR, D.poolR, D.poolH - 0.3, 64, 1, true]}
                />
                <meshStandardMaterial
                    color="#0a1e55"
                    transparent
                    opacity={0.6}
                    side={THREE.FrontSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Dasar kolam */}
            <mesh position={[0, -D.poolH / 2 + 0.12, 0]}>
                <cylinderGeometry
                    args={[D.poolR + D.poolWall, D.poolR + D.poolWall, 0.25, 64]}
                />
                <meshStandardMaterial color="#4a5a68" roughness={0.85} metalness={0.1} />
            </mesh>
        </group>
    )
}

// ═══════════════════════════════════════════
// VESSEL
// ═══════════════════════════════════════════
function Vessel() {
    return (
        <group position={[0, D.vesselY, 0]}>
            {/* Dinding vessel — lebih transparan */}
            <mesh castShadow>
                <cylinderGeometry
                    args={[D.vesselR + 0.12, D.vesselR + 0.12,
                    D.vesselH, 64, 1, true]}
                />
                <meshStandardMaterial
                    color="#7a8da0"
                    metalness={0.8}
                    roughness={0.15}
                    transparent
                    opacity={0.15}          
                    side={THREE.DoubleSide}
                    depthWrite={false}     
                />
            </mesh>

            {/* Dasar vessel */}
            <mesh position={[0, -D.vesselH / 2, 0]}>
                <cylinderGeometry
                    args={[D.vesselR + 0.12, D.vesselR + 0.12, 0.18, 64]}
                />
                <meshStandardMaterial color="#6a7e90" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
}

// ═══════════════════════════════════════════
// TERAS + FUEL RODS + CHERENKOV GLOW
// ═══════════════════════════════════════════
function Core({ power, isOperating }) {
    // Ref untuk instanced fuel rods
    const fuelRef = useRef()
    // Ref untuk glow layer (duplikat fuel rod lebih besar, biru)
    const glowRef = useRef()
    // Ref untuk inner glow (sangat terang di tengah)
    const innerGlowRef = useRef()

    // Hex grid fuel rod positions
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
        const p = power / 100           // 0 – 1
        // Pulsasi halus efek Cherenkov
        const pulse = 1 + Math.sin(t * 2.8) * 0.06 + Math.sin(t * 5.5) * 0.03
        const dummy = new THREE.Object3D()
        const col = new THREE.Color()
        const colGlow = new THREE.Color()

        positions.forEach(([x, z], i) => {
            dummy.position.set(x, 0, z)
            dummy.updateMatrix()

            // ── Fuel rod warna ──
            fuelRef.current.setMatrixAt(i, dummy.matrix)
            const dist = Math.sqrt(x * x + z * z) / D.coreR
            const heat = 1 - dist

            if (isOperating) {
                // Warna fuel rod: merah-oranye di tengah + biru Cherenkov di tepi
                const blueInfluence = p * (0.3 + dist * 0.7)   // tepi lebih biru
                const redInfluence = p * heat * 0.9

                col.setRGB(
                    Math.min(1, 0.15 + redInfluence * 0.85),   // R – merah di tengah
                    Math.min(1, 0.05 + p * heat * 0.12),         // G – hijau sedikit
                    Math.min(1, 0.10 + blueInfluence * 0.90),   // B – biru di tepi
                )
            } else {
                col.setRGB(0.20, 0.28, 0.40)
            }
            fuelRef.current.setColorAt(i, col)

            // ── Glow layer (biru Cherenkov per fuel rod) ──
            if (glowRef.current) {
                glowRef.current.setMatrixAt(i, dummy.matrix)
                if (isOperating) {
                    // Intensitas glow: makin dekat tengah makin terang, pulsasi
                    const glowIntensity = p * (0.4 + heat * 0.6) * pulse
                    colGlow.setRGB(
                        glowIntensity * 0.15,   // sedikit merah
                        glowIntensity * 0.35,   // sedikit hijau
                        Math.min(1, glowIntensity),  // biru dominan
                    )
                } else {
                    colGlow.setRGB(0, 0, 0)
                }
                glowRef.current.setColorAt(i, colGlow)
            }
        })

        fuelRef.current.instanceMatrix.needsUpdate = true
        if (fuelRef.current.instanceColor)
            fuelRef.current.instanceColor.needsUpdate = true

        if (glowRef.current) {
            glowRef.current.instanceMatrix.needsUpdate = true
            if (glowRef.current.instanceColor)
                glowRef.current.instanceColor.needsUpdate = true

            // Opacity glow layer bertambah seiring daya
            glowRef.current.material.opacity = isOperating
                ? p * 0.75 * pulse : 0
            glowRef.current.material.emissiveIntensity = isOperating
                ? p * 2.5 * pulse : 0
        }

        // Inner glow (halo sangat terang di sekitar tiap fuel rod)
        if (innerGlowRef.current) {
            innerGlowRef.current.material.opacity = isOperating
                ? p * 0.45 * pulse : 0
            innerGlowRef.current.material.emissiveIntensity = isOperating
                ? p * 4.0 * pulse : 0
        }
    })

    return (
        <group position={[0, D.coreY, 0]}>

            {/* Grid plate bawah */}
            <mesh position={[0, -D.coreH / 2 - 0.09, 0]}>
                <cylinderGeometry args={[D.coreR + 0.12, D.coreR + 0.12, 0.1, 64]} />
                <meshStandardMaterial color="#445566" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* ── Fuel rods utama ── */}
            <instancedMesh
                ref={fuelRef}
                args={[null, null, positions.length]}
                castShadow
                renderOrder={0}
            >
                <cylinderGeometry args={[0.036, 0.036, D.coreH, 6]} />
                <meshStandardMaterial
                    vertexColors
                    metalness={0.4}
                    roughness={0.45}
                    emissive={isOperating ? new THREE.Color(0.8, 0.2, 0.1) : new THREE.Color(0, 0, 0)}
                    emissiveIntensity={isOperating ? power / 220 : 0}
                    depthWrite={true}
                />
            </instancedMesh>

            {/* ── Glow layer: duplikat fuel rod sedikit lebih besar, biru ──
           Ini yang membuat tiap batang bahan bakar "menyala biru"        */}
            <instancedMesh
                ref={glowRef}
                args={[null, null, positions.length]}
            >
                <cylinderGeometry args={[0.068, 0.068, D.coreH + 0.05, 6]} />
                <meshStandardMaterial
                    vertexColors
                    transparent
                    opacity={0}
                    emissive={new THREE.Color(0.1, 0.3, 1.0)}
                    emissiveIntensity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.FrontSide}
                />
            </instancedMesh>

            {/* ── Inner halo: lingkaran besar di sekitar fuel rod ── */}
            <instancedMesh
                ref={innerGlowRef}
                args={[null, null, positions.length]}
            >
                <cylinderGeometry args={[0.11, 0.11, D.coreH + 0.1, 6]} />
                <meshStandardMaterial
                    color="#2244ff"
                    transparent
                    opacity={0}
                    emissive={new THREE.Color(0.1, 0.2, 1.0)}
                    emissiveIntensity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.FrontSide}
                />
            </instancedMesh>

            {/* Grid plate atas (semi-transparan) */}
            <mesh position={[0, D.coreH / 2 + 0.05, 0]}>
                <cylinderGeometry
                    args={[D.coreR + 0.12, D.coreR + 0.12, 0.06, 64]}
                />
                <meshStandardMaterial
                    color="#445566"
                    metalness={0.8}
                    roughness={0.2}
                    transparent
                    opacity={0.20}
                    depthWrite={false}
                />
            </mesh>

            {/* Shroud ring */}
            <mesh>
                <cylinderGeometry
                    args={[D.coreR + 0.16, D.coreR + 0.16,
                    D.coreH + 0.25, 64, 1, true]}
                />
                <meshStandardMaterial
                    color="#004182"
                    metalness={0.55}
                    roughness={0.45}
                    transparent
                    opacity={0.20}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Volume glow keseluruhan teras (ambient biru) */}
            <CoreVolumeGlow power={power} isOperating={isOperating} />
        </group>
    )
}

// ─────────────────────────────────────────
// Glow volume mengisi seluruh teras
// ─────────────────────────────────────────
function CoreVolumeGlow({ power, isOperating }) {
    const r1 = useRef()
    const r2 = useRef()
    const r3 = useRef()

    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        const p = power / 100
        const pulse = 1 + Math.sin(t * 2.2) * 0.08 + Math.sin(t * 4.1) * 0.04
        const base = isOperating ? p * pulse : 0

        if (r1.current) r1.current.material.opacity = base * 0.50
        if (r2.current) r2.current.material.opacity = base * 0.35
        if (r3.current) r3.current.material.opacity = base * 0.20
    })

    return (
        <>
            {/* Layer 1 – inti teras (paling terang) */}
            <mesh ref={r1}>
                <cylinderGeometry
                    args={[D.coreR * 0.55, D.coreR * 0.55, D.coreH * 0.95, 32]}
                />
                <meshStandardMaterial
                    color="#3355ff"
                    emissive="#2244ff"
                    emissiveIntensity={power / 22}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Layer 2 – tengah teras */}
            <mesh ref={r2}>
                <cylinderGeometry
                    args={[D.coreR * 0.85, D.coreR * 0.85, D.coreH * 0.98, 32]}
                />
                <meshStandardMaterial
                    color="#2244dd"
                    emissive="#1133cc"
                    emissiveIntensity={power / 30}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Layer 3 – seluruh teras (halo luar) */}
            <mesh ref={r3}>
                <cylinderGeometry
                    args={[D.coreR * 1.05, D.coreR * 1.05, D.coreH * 1.02, 32]}
                />
                <meshStandardMaterial
                    color="#1133bb"
                    emissive="#0022aa"
                    emissiveIntensity={power / 40}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </>
    )
}

// ═══════════════════════════════════════════
// HELPER — warna driveTop berdasarkan posisi
// ═══════════════════════════════════════════
function getDriveTopColor(pct, isMoving) {
    if (isMoving) return '#FF0000'   // MERAH saat bergerak
    if (pct <= 0) return '#525252'  // abu-abu (0%)
    if (pct >= 100) return '#22c55e'  // hijau (100%)
    return '#f97316'                   // oranye (1-99%)
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
        ? POOL_BOTTOM + 0.2 + ROD_TOTAL / 2
        : rodY

    const rodTopY = adjustedRodY + ROD_TOTAL / 2
    const connLen = Math.max(0.05, DRIVE_Y - rodTopY)
    const connMidY = rodTopY + connLen / 2

    // isMoving sudah terdefinisi dari props, baru panggil getDriveTopColor
    const driveTopColor = getDriveTopColor(pct, isMoving)

    return (
        <group position={[pos[0], 0, pos[2]]}>
            {/* Guide tube */}
            <mesh position={[0, D.vesselY + 0.5, 0]}>
                <cylinderGeometry
                    args={[D.crR + 0.028, D.crR + 0.028,
                    D.vesselH + 0.5, 10, 1, true]}
                />
                <meshStandardMaterial
                    color="#2a3a4a"
                    metalness={0.7}
                    roughness={0.3}
                    transparent
                    opacity={0.22}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Batang utama */}
            <mesh position={[0, adjustedRodY, 0]} castShadow>
                <cylinderGeometry args={[D.crR, D.crR, ROD_TOTAL, 10]} />
                <meshStandardMaterial
                    color={cfg.color}
                    emissive={cfg.emissive}
                    emissiveIntensity={0.3 + pct / 250}
                    metalness={0.78}
                    roughness={0.18}
                />
            </mesh>

            {/* Absorber tip */}
            <mesh position={[0, adjustedRodY - ROD_TOTAL / 2 - 0.15, 0]}>
                <cylinderGeometry args={[D.crR + 0.008, D.crR - 0.012, 0.30, 10]} />
                <meshStandardMaterial
                    color="#112213"
                    metalness={0.9}
                    roughness={0.08}
                />
            </mesh>

            {/* Konektor */}
            {connLen > 0.05 && (
                <mesh position={[0, connMidY, 0]}>
                    <cylinderGeometry args={[0.018, 0.018, connLen, 6]} />
                    <meshStandardMaterial
                        color="#889aaa"
                        metalness={0.85}
                        roughness={0.15}
                    />
                </mesh>
            )}

            {/* Drive mechanism */}
            <group position={[0, DRIVE_Y, 0]}>
                {/* Body drive */}
                <mesh castShadow>
                    <boxGeometry args={[0.26, 0.68, 0.26]} />
                    <meshStandardMaterial
                        color={cfg.driveCol}
                        metalness={0.65}
                        roughness={0.28}
                    />
                </mesh>

                {/* DriveTop — warna dinamis */}
                <mesh position={[0, 0.46, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.18, 12]} />
                    <meshStandardMaterial
                        color={driveTopColor}
                        emissive={driveTopColor}
                        emissiveIntensity={pct > 0 ? 0.6 : 0.1}
                        metalness={0.5}
                        roughness={0.2}
                    />
                </mesh>
            </group>
        </group>
    )
}
// ═══════════════════════════════════════════
// EFEK CHERENKOV – lengkap dengan water glow
// ═══════════════════════════════════════════
function Cherenkov({ power, isOperating }) {
    const outerConeRef = useRef()
    const innerConeRef = useRef()
    const shaftRef = useRef()
    const waterGlowRef = useRef()
    const partRef = useRef()
    const sparkRef = useRef()

    const N_PART = 1200
    const N_SPARK = 400

    const { positions: pPos, speeds: pSpd } = useMemo(() => {
        const positions = new Float32Array(N_PART * 3)
        const speeds = new Float32Array(N_PART)
        for (let i = 0; i < N_PART; i++) {
            const a = Math.random() * Math.PI * 2
            const r = Math.random() * (D.coreR - 0.08)
            positions[i * 3] = Math.cos(a) * r
            positions[i * 3 + 1] = (Math.random() - 0.5) * D.coreH
            positions[i * 3 + 2] = Math.sin(a) * r
            speeds[i] = 0.8 + Math.random() * 2.2
        }
        return { positions, speeds }
    }, [])

    const { positions: sPos, speeds: sSpd } = useMemo(() => {
        const positions = new Float32Array(N_SPARK * 3)
        const speeds = new Float32Array(N_SPARK)
        for (let i = 0; i < N_SPARK; i++) {
            const a = Math.random() * Math.PI * 2
            const r = Math.random() * 0.5
            positions[i * 3] = Math.cos(a) * r
            positions[i * 3 + 1] = (Math.random() - 0.5) * D.coreH * 0.8
            positions[i * 3 + 2] = Math.sin(a) * r
            speeds[i] = 1.5 + Math.random() * 3.0
        }
        return { positions, speeds }
    }, [])

    useFrame(({ clock }) => {
        if (!isOperating) {
            ;[outerConeRef, innerConeRef, shaftRef,
                waterGlowRef, partRef, sparkRef,
            ].forEach(r => {
                if (r.current?.material) r.current.material.opacity = 0
            })
            return
        }

        const t = clock.elapsedTime
        const p = power / 100
        const flk = 1
            + Math.sin(t * 3.5) * 0.07
            + Math.sin(t * 7.2) * 0.03
            + Math.sin(t * 11.8) * 0.015

        if (outerConeRef.current)
            outerConeRef.current.material.opacity = p * 0.65 * flk
        if (innerConeRef.current)
            innerConeRef.current.material.opacity = p * 0.85 * flk
        if (shaftRef.current)
            shaftRef.current.material.opacity = p * 0.75 * flk
        if (waterGlowRef.current)
            waterGlowRef.current.material.opacity = p * 0.30 * flk

        // Partikel utama
        if (partRef.current) {
            const arr = partRef.current.geometry.attributes.position.array
            for (let i = 0; i < N_PART; i++) {
                arr[i * 3 + 1] += pSpd[i] * 0.014
                if (arr[i * 3 + 1] > D.coreH / 2 + 0.5) {
                    arr[i * 3 + 1] = -D.coreH / 2 - 0.5
                    const a = Math.random() * Math.PI * 2
                    const r = Math.random() * (D.coreR - 0.1)
                    arr[i * 3] = Math.cos(a) * r
                    arr[i * 3 + 2] = Math.sin(a) * r
                }
            }
            partRef.current.geometry.attributes.position.needsUpdate = true
            partRef.current.material.opacity = p * 0.95 * flk
        }

        // Percikan
        if (sparkRef.current) {
            const arr = sparkRef.current.geometry.attributes.position.array
            for (let i = 0; i < N_SPARK; i++) {
                arr[i * 3 + 1] += sSpd[i] * 0.018
                if (arr[i * 3 + 1] > D.coreH / 2 + 1.0) {
                    arr[i * 3 + 1] = -D.coreH / 2 - 0.5
                    const a = Math.random() * Math.PI * 2
                    const r = Math.random() * 0.6
                    arr[i * 3] = Math.cos(a) * r
                    arr[i * 3 + 2] = Math.sin(a) * r
                }
            }
            sparkRef.current.geometry.attributes.position.needsUpdate = true
            sparkRef.current.material.opacity = p * 1.0 * flk
        }
    })

    const partGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        return g
    }, [pPos])

    const sparkGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
        return g
    }, [sPos])

    return (
        <group position={[0, D.coreY, 0]}>

            {/* Kerucut luar */}
            <mesh ref={outerConeRef}>
                <cylinderGeometry
                    args={[D.coreR * 0.95, 0.05, D.coreH, 48, 10, true]}
                />
                <meshStandardMaterial
                    color="#1133cc"
                    emissive="#0022bb"
                    emissiveIntensity={power / 35}
                    transparent opacity={0}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Kerucut dalam */}
            <mesh ref={innerConeRef}>
                <cylinderGeometry
                    args={[D.coreR * 0.65, 0.03, D.coreH * 0.9, 32, 8, true]}
                />
                <meshStandardMaterial
                    color="#3366ff"
                    emissive="#2255ff"
                    emissiveIntensity={power / 25}
                    transparent opacity={0}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Shaft vertikal */}
            <mesh ref={shaftRef}>
                <cylinderGeometry args={[0.12, 0.04, D.coreH * 1.1, 16, 4, true]} />
                <meshStandardMaterial
                    color="#88aaff"
                    emissive="#6688ff"
                    emissiveIntensity={power / 18}
                    transparent opacity={0}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Water glow – menerangi air di sekitar teras */}
            <mesh ref={waterGlowRef} position={[0, D.poolH / 4, 0]}>
                <cylinderGeometry
                    args={[D.poolR * 0.88, D.poolR * 0.88,
                    D.poolH * 0.75, 32, 1, true]}
                />
                <meshStandardMaterial
                    color="#0033aa"
                    emissive="#0022aa"
                    emissiveIntensity={power / 45}
                    transparent opacity={0}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Partikel utama */}
            <points ref={partRef} geometry={partGeo}>
                <pointsMaterial
                    color="#6699ff"
                    size={0.065}
                    transparent opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    sizeAttenuation
                />
            </points>

            {/* Percikan */}
            <points ref={sparkRef} geometry={sparkGeo}>
                <pointsMaterial
                    color="#ccddff"
                    size={0.048}
                    transparent opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    sizeAttenuation
                />
            </points>
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
            <Pool isOperating={isOperating} power={power} />
            <Vessel />
            <Core power={power} isOperating={isOperating} />
            <ControlRod
                type="safety"
                pct={pct('safety')}
                isMoving={isMoving('safety')}
            />
            <ControlRod
                type="shim"
                pct={pct('shim')}
                isMoving={isMoving('shim')}
            />
            <ControlRod
                type="regulating"
                pct={pct('regulating')}
                isMoving={isMoving('regulating')}
            />
            <Cherenkov power={power} isOperating={isOperating} />
        </group>
    )
}
