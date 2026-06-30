// src/components/three/ReactorScene.jsx
import React, { Suspense, useRef, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import ReactorModel from './ReactorModel'
import * as THREE from 'three'
import { getComponentDetail, getLiveSpecs } from './componentDetails'
import ComponentIllustration from './ComponentIllustration'
import { useLanguage } from '../../context/LanguageContext'

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
        color: '#ffcc00',
        icon: 'E',
        forceRight: true,
    },
    {
        id: 'pool',
        labelEN: 'Reactor Pool',
        labelID: '(Kolam Reaktor)',
        anchor3D: new THREE.Vector3(D_POOL_R + D_POOL_WALL + 0.2, 1.5, 0),
        color: '#ff00e1',
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
        forceRight: false,
    },
    // SHIM ROD — Biru, anchor ke kiri
    {
        id: 'rod_shim',
        labelEN: 'Shim Rod',
        labelID: '(Batang Kompensasi)',
        anchor3D: new THREE.Vector3(
            CR_POS_SHIM[0] - 0.15,
            DECK_Y_VAL + 0.5,
            CR_POS_SHIM[2] - 0.15,
        ),
        color: '#2255ff',
        icon: 'B',
        forceRight: false,
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
        color: '#00ff62',
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
    const lastSigRef = useRef('')
    // Pre-allocate one Vector3 per label to avoid GC pressure from .clone()
    const tempVecsRef = useRef(LABEL_DATA.map(() => new THREE.Vector3()))

    useFrame(() => {
        if (!camera || !size?.width || !size?.height) return
        frameRef.current += 1
        if (frameRef.current % 4 !== 0) return

        const positions = LABEL_DATA.map(({ id, anchor3D }, i) => {
            const vec = tempVecsRef.current[i]
            vec.copy(anchor3D)
            vec.project(camera)
            const x = (vec.x * 0.5 + 0.5) * size.width
            const y = (vec.y * -0.5 + 0.5) * size.height
            const visible =
                vec.z < 1.0 &&
                isFinite(x) && !isNaN(x) &&
                isFinite(y) && !isNaN(y)
            return { id, x, y, visible }
        })

        // Skip React setState when nothing has actually moved (avoids unnecessary re-renders)
        const sig = positions.map(p =>
            `${p.visible ? 1 : 0}:${Math.round(p.x)}:${Math.round(p.y)}`
        ).join('|')
        if (sig === lastSigRef.current) return
        lastSigRef.current = sig

        onPositionsUpdate(positions, { width: size.width, height: size.height })
    })

    return null
}

// ─────────────────────────────────────────
// Single Label Item — DIPERBAIKI
// Label card selalu muncul di tepi layar,
// bukan di posisi anchor 3D
// ─────────────────────────────────────────
function LabelItem({
    label, pos, canvasSize, isOpen, onToggle,
    cardTop, isRight, cardWidth, cardHeight,
    isDetailOpen, onToggleDetail, detailContent, liveSpecs, language,
}) {
    const { x, y } = pos
    const { color, labelEN, labelID, icon } = label

    // ── Ukuran card: dinamis tergantung mode (ringkas vs detail) ──
    const CARD_W = cardWidth
    const CARD_H = cardHeight
    const ICON_R = 12

    // ── Ujung garis: selalu menuju tepi layar ──
    const MARGIN = 20  // jarak dari tepi layar
    const lineEndX = isRight
        ? canvasSize.width - MARGIN - CARD_W - 10  // tepi kanan
        : MARGIN + CARD_W + 10                      // tepi kiri

    // Posisi card
    const cardLeft = isRight
        ? lineEndX + 6
        : MARGIN

    // Y ujung garis mengikuti tengah card (cardTop sudah dihitung di LabelOverlay
    // dengan mempertimbangkan label lain di sisi yang sama agar tidak tumpang tindih)
    const lineEndY = cardTop + Math.min(CARD_H, 44) / 2

    const { t } = useLanguage()

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
                {/* Lingkaran icon */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isOpen ? color : 'rgba(60, 70, 80, 0.88)',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{
                        fontFamily: "'Orbitron', monospace, sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                        color: isOpen ? '#000' : color,
                        lineHeight: 1,
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
                        pointerEvents: 'all',
                        userSelect: 'none',
                        animation: 'labelFadeIn 0.2s ease forwards',
                        transition: 'width 0.22s ease, height 0.22s ease',
                    }}
                >
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${color}55`,
                        borderLeft: isRight ? `3px solid ${color}` : '1px solid #d0dce8',
                        borderRight: isRight ? '1px solid #d0dce8' : `3px solid ${color}`,
                        borderRadius: 6,
                        padding: isDetailOpen ? '10px 14px 12px' : '6px 12px',
                        width: CARD_W,
                        boxShadow: `0 2px 16px rgba(0,80,160,0.12), 0 0 8px ${color}22`,
                        transition: 'width 0.22s ease, padding 0.22s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isDetailOpen ? 8 : 0,
                        maxHeight: isDetailOpen ? CARD_H : 'none',
                        overflowY: isDetailOpen ? 'auto' : 'visible',
                    }}>
                        {/* Baris atas: warna dot + nama EN + (saat detail) tombol tutup */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
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
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {language === 'id' ? labelID.replace(/[()]/g, '').trim() : labelEN}
                                </div>
                            </div>

                            {isDetailOpen && (
                                <button
                                    onClick={onToggleDetail}
                                    style={{
                                        flexShrink: 0,
                                        background: `${color}1f`,
                                        border: `1px solid ${color}66`,
                                        borderRadius: 4,
                                        color: color,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: 8,
                                        letterSpacing: 0,
                                        padding: '3px 7px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {t('btnCloseDetail')}
                                </button>
                            )}
                        </div>

                        {/* ── Mode RINGKAS: nilai live (IRL mode) di atas tombol More Detail ── */}
                        {!isDetailOpen && liveSpecs?.length > 0 && (
                            <div style={{
                                marginTop: 5,
                                marginLeft: 14,
                                borderTop: `1px solid ${color}33`,
                                paddingTop: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                            }}>
                                {liveSpecs.map((spec, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                        <span style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: 10,
                                            color: '#7799bb',
                                            letterSpacing: 0,
                                        }}>
                                            {spec.label}
                                        </span>
                                        <span style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: 8,
                                            fontWeight: 700,
                                            color: '#059669',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {spec.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Mode RINGKAS: tombol More Detail ── */}
                        {!isDetailOpen && detailContent && (
                            <button
                                onClick={onToggleDetail}
                                style={{
                                    marginTop: 6,
                                    marginLeft: 14,
                                    background: 'transparent',
                                    border: 'none',
                                    color: `${color}cc`,
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: 8,
                                    letterSpacing: 0,
                                    padding: 0,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    textAlign: 'left',
                                }}
                            >
                                {t('btnMoreDetail')}
                            </button>
                        )}

                        {/* ── Mode DETAIL: ilustrasi + live data + teks panjang + spesifikasi ── */}
                        {isDetailOpen && (detailContent || liveSpecs?.length > 0) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <ComponentIllustration componentId={label.id} color={color} />

                                {/* ── Live sensor data section (IRL mode only) ── */}
                                {liveSpecs?.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: '#059669',
                                                boxShadow: '0 0 5px #05966988',
                                            }} />
                                            <span style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: 9,
                                                fontWeight: 600,
                                                color: '#059669',
                                                letterSpacing: 0.5,
                                            }}>
                                                LIVE DATA
                                            </span>
                                        </div>
                                        <div style={{
                                            border: `1px solid ${color}44`,
                                            borderRadius: 5,
                                            overflow: 'hidden',
                                        }}>
                                            {liveSpecs.map((spec, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: 8,
                                                    padding: '5px 8px',
                                                    background: i % 2 === 0 ? `${color}12` : 'transparent',
                                                    borderTop: i === 0 ? 'none' : `1px solid ${color}22`,
                                                }}>
                                                    <span style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: 10,
                                                        color: '#7799bb',
                                                        letterSpacing: 0,
                                                    }}>
                                                        {spec.label}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        color: '#059669',
                                                        textAlign: 'right',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {spec.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailContent && (
                                    <>
                                        <p style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: 11,
                                            lineHeight: 1.6,
                                            color: '#334455',
                                            margin: 0,
                                        }}>
                                            {detailContent.detail}
                                        </p>

                                        {detailContent.specs?.length > 0 && (
                                            <div style={{
                                                border: `1px solid ${color}33`,
                                                borderRadius: 5,
                                                overflow: 'hidden',
                                            }}>
                                                {detailContent.specs.map((spec, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        gap: 8,
                                                        padding: '5px 8px',
                                                        background: i % 2 === 0 ? `${color}0d` : 'transparent',
                                                        borderTop: i === 0 ? 'none' : `1px solid ${color}22`,
                                                    }}>
                                                        <span style={{
                                                            fontFamily: "'Poppins', sans-serif",
                                                            fontSize: 8,
                                                            color: '#334455',
                                                            letterSpacing: 0,
                                                        }}>
                                                            {spec.label}
                                                        </span>
                                                        <span style={{
                                                            fontFamily: "'Poppins', sans-serif",
                                                            fontSize: 8,
                                                            fontWeight: 700,
                                                            color: color,
                                                            textAlign: 'right',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {spec.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

// ─────────────────────────────────────────
// Helper: tentukan sisi (kiri/kanan) untuk satu label
// ─────────────────────────────────────────
function resolveSide(label, x, canvasWidth) {
    if (label.forceRight === true) return true
    if (label.forceRight === false) return false
    return x < canvasWidth * 0.5
}

// ─────────────────────────────────────────
// Helper: hitung posisi cardTop tiap label yang sedang
// terbuka (isOpen) di satu sisi, supaya tidak tumpang tindih.
// Setiap item bisa punya tinggi (height) sendiri — penting
// karena card mode "detail" jauh lebih tinggi dari mode ringkas.
// Strategi: urutkan berdasarkan anchor Y, lalu dorong (push)
// card yang lebih bawah jika jaraknya kurang dari tinggi+gap.
// ─────────────────────────────────────────
function layoutSide(items, canvasHeight) {
    const CARD_GAP = 8 // jarak minimum antar card
    const MARGIN = 8

    // Urutkan dari atas ke bawah berdasarkan posisi Y anchor asli
    const sorted = [...items].sort((a, b) => a.anchorY - b.anchorY)

    // Posisi awal (ideal): tengah card sejajar anchor
    const result = sorted.map(item => ({
        ...item,
        cardTop: Math.max(
            MARGIN,
            Math.min(canvasHeight - item.height - MARGIN, item.anchorY - item.height / 2)
        ),
    }))

    // Dorong ke bawah kalau bertabrakan dengan card sebelumnya
    for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1]
        const cur = result[i]
        const minTop = prev.cardTop + prev.height + CARD_GAP
        if (cur.cardTop < minTop) {
            cur.cardTop = minTop
        }
    }

    // Kalau card terakhir keluar dari batas bawah layar,
    // dorong balik ke atas mulai dari bawah agar semua tetap kebagian tempat
    const lastIdx = result.length - 1
    if (result[lastIdx]) {
        const maxTop = canvasHeight - result[lastIdx].height - MARGIN
        if (result[lastIdx].cardTop > maxTop) {
            result[lastIdx].cardTop = maxTop
            for (let i = lastIdx - 1; i >= 0; i--) {
                const next = result[i + 1]
                const maxAllowed = next.cardTop - result[i].height - CARD_GAP
                if (result[i].cardTop > maxAllowed) {
                    result[i].cardTop = maxAllowed
                }
            }
        }
    }

    return result
}

// ── Ukuran card untuk tiap mode ──
// CARD_H_COMPACT harus >= tinggi render sesungguhnya: title(~20) + ID(~16) + button(~22) + padding(12) ≈ 70px
const CARD_W_COMPACT = 180
const CARD_H_COMPACT = 80
const CARD_W_DETAIL = 300
const CARD_H_DETAIL = 460

function LabelOverlay({
    positions, canvasSize, openLabels, onToggleLabel,
    detailLeftId, detailRightId, onToggleDetail, language,
    liveData, rodPositions,
}) {
    if (!positions || !canvasSize) return null

    // 1. Kumpulkan semua label yang VISIBLE (untuk render icon dot)
    const visibleLabels = LABEL_DATA
        .map(label => {
            const pos = positions.find(p => p.id === label.id)
            if (!pos?.visible) return null
            const isRight = resolveSide(label, pos.x, canvasSize.width)
            return { label, pos, isRight }
        })
        .filter(Boolean)

    // 2. Dari yang visible, pisahkan yang sedang OPEN (card-nya ditampilkan)
    //    lalu kelompokkan per sisi agar bisa dihitung layout anti-tumpang-tindih.
    //    Hanya SATU label per sisi yang boleh dalam mode detail (lebih besar);
    //    label lain di sisi yang sama tetap ringkas.
    const openLeft = visibleLabels.filter(v => v.isRight === false && openLabels.has(v.label.id))
    const openRight = visibleLabels.filter(v => v.isRight === true && openLabels.has(v.label.id))

    // Compact card heights when live sensor rows are present (IRL mode)
    // Base(80) + section-header(11) + N_specs * row(19)
    const COMPACT_LIVE_H = {
        rod_safety: 108, rod_shim: 108, rod_regulating: 108, core: 108,
        water: 248, pc_operator: 188,
    }

    const sizeFor = (id, side) => {
        const isDetail = side === 'left' ? id === detailLeftId : id === detailRightId
        if (isDetail) return { width: CARD_W_DETAIL, height: CARD_H_DETAIL }
        const compactH = liveData ? (COMPACT_LIVE_H[id] ?? CARD_H_COMPACT) : CARD_H_COMPACT
        return { width: CARD_W_COMPACT, height: compactH }
    }

    const leftLayout = layoutSide(
        openLeft.map(v => {
            const size = sizeFor(v.label.id, 'left')
            return { id: v.label.id, anchorY: v.pos.y, height: size.height }
        }),
        canvasSize.height
    )
    const rightLayout = layoutSide(
        openRight.map(v => {
            const size = sizeFor(v.label.id, 'right')
            return { id: v.label.id, anchorY: v.pos.y, height: size.height }
        }),
        canvasSize.height
    )

    const cardTopById = {}
    leftLayout.forEach(item => { cardTopById[item.id] = item.cardTop })
    rightLayout.forEach(item => { cardTopById[item.id] = item.cardTop })

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 13,
            }}
        >
            {visibleLabels.map(({ label, pos, isRight }) => {
                const isOpen = openLabels.has(label.id)
                const side = isRight ? 'right' : 'left'
                const isDetailOpen = side === 'left'
                    ? label.id === detailLeftId
                    : label.id === detailRightId
                const size = sizeFor(label.id, side)
                // cardTop hanya relevan saat open; beri fallback aman saat tertutup
                const cardTop = cardTopById[label.id] ?? (pos.y - size.height / 2)
                const detailContent = getComponentDetail(label.id, language)
                const liveSpecs = liveData
                    ? getLiveSpecs(label.id, liveData, rodPositions, language)
                    : []

                return (
                    <LabelItem
                        key={label.id}
                        label={label}
                        pos={pos}
                        canvasSize={canvasSize}
                        isOpen={isOpen}
                        onToggle={() => onToggleLabel(label.id)}
                        isRight={isRight}
                        cardTop={cardTop}
                        cardWidth={size.width}
                        cardHeight={size.height}
                        isDetailOpen={isDetailOpen}
                        onToggleDetail={() => onToggleDetail(label.id, side)}
                        detailContent={detailContent}
                        liveSpecs={liveSpecs}
                        language={language}
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
    liveData,
}) {
    const powerKw = reactorData?.power_kw || 0
    const isOperating = isReactorActive && powerKw > 5 && !isScrammed
    const { language } = useLanguage()

    const [labelPositions, setLabelPositions] = useState(null)
    const [canvasSize, setCanvasSize] = useState(null)
    const [openLabels, setOpenLabels] = useState(new Set())
    // id label yang sedang dalam mode DETAIL (membesar), per sisi.
    // null artinya tidak ada yang dalam mode detail di sisi tersebut.
    const [detailLeftId, setDetailLeftId] = useState(null)
    const [detailRightId, setDetailRightId] = useState(null)
    // Ref yang menyimpan sisi (kiri/kanan) terkini tiap label, di-update
    // tiap kali posisi label dihitung ulang. Dipakai handleToggleDetail
    // tanpa perlu menambah dependency yang bikin re-render berlebihan.
    const visibleLabelSideRef = useRef(new Map())

    const handlePositionsUpdate = useCallback((positions, size) => {
        setLabelPositions(positions)
        setCanvasSize(size)
        const sideMap = new Map()
        positions.forEach(p => {
            if (!p.visible) return
            const label = LABEL_DATA.find(l => l.id === p.id)
            if (!label) return
            const isRight = resolveSide(label, p.x, size.width)
            sideMap.set(p.id, isRight ? 'right' : 'left')
        })
        visibleLabelSideRef.current = sideMap
    }, [])

    const handleToggleLabel = (id) => {
        setOpenLabels(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
                // kalau label yang ditutup sedang dalam mode detail, reset juga
                if (detailLeftId === id) setDetailLeftId(null)
                if (detailRightId === id) setDetailRightId(null)
            } else {
                next.add(id)
            }
            return next
        })
    }

    // Buka/tutup mode DETAIL untuk satu label. Sesuai keputusan UX:
    // hanya SATU card per sisi yang boleh terbuka saat mode detail aktif —
    // label lain yang sedang terbuka di sisi yang sama akan DITUTUP dulu
    // (bukan sekadar diperkecil), supaya layar tidak ramai dua card besar+kecil.
    const handleToggleDetail = (id, side) => {
        const isRightSide = side === 'right'
        const currentDetailId = isRightSide ? detailRightId : detailLeftId

        if (currentDetailId === id) {
            // toggle off: tutup mode detail saja, card tetap terbuka mode ringkas
            if (isRightSide) setDetailRightId(null)
            else setDetailLeftId(null)
            return
        }

        // Buka mode detail untuk label ini → tutup SEMUA label lain
        // di sisi yang sama (sesuai permintaan: hanya 1 detail besar per sisi)
        setOpenLabels(prev => {
            const next = new Set(prev)
            visibleLabelSideRef.current.forEach((labelSide, labelId) => {
                if (labelSide === side && labelId !== id) {
                    next.delete(labelId)
                }
            })
            next.add(id) // pastikan label ini sendiri tetap terbuka
            return next
        })

        if (isRightSide) setDetailRightId(id)
        else setDetailLeftId(id)
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

            {/* ── Canvas ── */}
            <Canvas
                shadows
                gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
                dpr={[1, 1.5]}
                style={{ background: '#959595', width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#959595']} />
                <PerspectiveCamera makeDefault position={[8, 11, 8]} fov={48} near={0.1} far={300} />
                <OrbitControls
                    enablePan enableZoom enableRotate
                    minDistance={4} maxDistance={30}
                    minPolarAngle={0} maxPolarAngle={Math.PI / 1.9}
                    target={[0, 2.0, 0]}
                />

                <ambientLight intensity={2.2} color="#e8f0ff" />
                <directionalLight position={[8, 20, 8]} intensity={2.0} castShadow shadow-mapSize={[1024, 1024]} />
                <directionalLight position={[-8, 14, -6]} intensity={1.2} color="#aaccff" />
                <directionalLight position={[0, 10, 15]} intensity={0.8} />
                <directionalLight position={[15, 5, 0]} intensity={0.6} color="#ddeeff" />
                <pointLight position={[0, CORE_Y, 0]} intensity={5} color="#ff4422" distance={10} />
                <pointLight position={[0, 2, 0]} intensity={2.5} color="#ffffff" distance={8} />

                {isOperating && (
                    <>
                        <pointLight position={[0, CORE_Y, 0]} intensity={powerKw / 5} color="#4488ff" distance={16} />
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
                detailLeftId={detailLeftId}
                detailRightId={detailRightId}
                onToggleDetail={handleToggleDetail}
                language={language}
                liveData={liveData ?? null}
                rodPositions={rodPositions}
            />

        </div>
    )
}