// src/hooks/useScoringSystem.js
import { useState, useRef, useCallback, useEffect } from 'react'

const MAX_SCORE = 500
const STABLE_TARGET_KW = 100
const STABLE_DURATION_SEC = 15
const TIME_LIMIT_SEC = 300        // 5 menit
const OVERSHOOT_PENALTY_PER_SEC = 5
const SCRAM_PENALTY = 'RESTART'   // SCRAM = ulang dari awal
const WRONG_ORDER_PENALTY = 50
const SPEED_PENALTY = 10
const NO_PENALTY_BONUS = 20
const SPEED_THRESHOLD = 5         // 5 step dalam 1 detik = terlalu cepat

export const useScoringSystem = (isReactorActive, isScrammed, reactorData, rodPositions) => {
    const [score, setScore] = useState(MAX_SCORE)
    const [penaltyTotal, setPenaltyTotal] = useState(0)
    const [penaltyLog, setPenaltyLog] = useState([])  // log semua penalti
    const [stableSeconds, setStableSeconds] = useState(0)
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [isWin, setIsWin] = useState(false)
    const [isTimeOut, setIsTimeOut] = useState(false)
    const [lastNotif, setLastNotif] = useState(null)  // notifikasi penalti/bonus

    // Refs untuk tracking internal
    const penaltyRef = useRef(0)
    const hasPenaltyRef = useRef(false)
    const stableRef = useRef(0)
    const timeRef = useRef(0)
    const prevRodPositions = useRef({ safety: 0, shim: 0, regulating: 0 })
    const rodMoveCountRef = useRef({ safety: 0, shim: 0, regulating: 0 })
    const lastSpeedCheckRef = useRef(Date.now())
    const orderViolatedRef = useRef(false)
    const lastRodRaisedRef = useRef(null) // track urutan batang yang terakhir dinaikkan

    // Fungsi tambah penalti
    const addPenalty = useCallback((amount, reason) => {
        penaltyRef.current += amount
        hasPenaltyRef.current = true
        setPenaltyTotal(penaltyRef.current)
        setScore(Math.max(0, MAX_SCORE - penaltyRef.current))
        setPenaltyLog(prev => [...prev, { amount, reason, time: timeRef.current }])
        setLastNotif({ type: 'penalty', text: `-${amount} ${reason}`, id: Date.now() })
    }, [])

    // Cek urutan batang kendali
    const checkRodOrder = useCallback((rodKey, prevPos, newPos) => {
        if (newPos <= prevPos) return  // turun atau sama, skip
        if (orderViolatedRef.current) return  // sudah pernah kena penalti urutan

        const order = ['safety', 'shim', 'regulating']
        const currentIdx = order.indexOf(rodKey)
        const lastIdx = lastRodRaisedRef.current !== null
            ? order.indexOf(lastRodRaisedRef.current)
            : -1

        // Jika menaikkan rod yang indeksnya lebih kecil dari rod terakhir → salah urutan
        if (lastRodRaisedRef.current !== null && currentIdx < lastIdx) {
            addPenalty(WRONG_ORDER_PENALTY, 'Urutan batang salah')
            orderViolatedRef.current = true
            return
        }

        lastRodRaisedRef.current = rodKey
    }, [addPenalty])

    // Cek kecepatan naikkan batang (tiap detik)
    const checkSpeedRef = useRef(null)

    // Main effect — jalankan saat simulasi aktif
    useEffect(() => {
        if (!isReactorActive || isWin || isTimeOut) return

        const interval = setInterval(() => {
            timeRef.current += 1
            setTimeElapsed(timeRef.current)

            // Timeout 5 menit
            if (timeRef.current >= TIME_LIMIT_SEC) {
                setIsTimeOut(true)
                clearInterval(interval)
                return
            }

            const powerKw = reactorData?.power_kw || 0

            // Penalti daya melebihi 100kW
            if (powerKw > STABLE_TARGET_KW && powerKw < 120) {
                addPenalty(OVERSHOOT_PENALTY_PER_SEC, 'Daya melebihi 100kW')
            }

            // Cek kondisi menang: stabil di 90-110kW
            if (powerKw >= 90 && powerKw <= 110) {
                stableRef.current += 1
                setStableSeconds(stableRef.current)
                if (stableRef.current >= STABLE_DURATION_SEC) {
                    setIsWin(true)
                    clearInterval(interval)
                }
            } else {
                stableRef.current = 0
                setStableSeconds(0)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isReactorActive, isWin, isTimeOut, reactorData, addPenalty])

    // Deteksi perubahan posisi batang (cek urutan & kecepatan)
    useEffect(() => {
        if (!isReactorActive || !rodPositions) return

        const rods = ['safety', 'shim', 'regulating']

        rods.forEach(rod => {
            const prev = prevRodPositions.current[rod]
            const curr = rodPositions[rod]
            const delta = curr - prev

            if (delta > 0) {
                // Cek urutan
                checkRodOrder(rod, prev, curr)

                // Cek kecepatan: hitung step per detik
                rodMoveCountRef.current[rod] = (rodMoveCountRef.current[rod] || 0) + delta
            }
        })

        prevRodPositions.current = { ...rodPositions }
    }, [rodPositions, isReactorActive, checkRodOrder])

    // Cek kecepatan tiap 1 detik
    useEffect(() => {
        if (!isReactorActive) return

        const speedCheck = setInterval(() => {
            const rods = ['safety', 'shim', 'regulating']
            rods.forEach(rod => {
                const moved = rodMoveCountRef.current[rod] || 0
                if (moved >= SPEED_THRESHOLD) {
                    addPenalty(SPEED_PENALTY, `${rod.toUpperCase()} dinaikkan terlalu cepat`)
                }
                rodMoveCountRef.current[rod] = 0  // reset counter tiap detik
            })
        }, 1000)

        return () => clearInterval(speedCheck)
    }, [isReactorActive, addPenalty])

    // Reset saat SCRAM (harus mulai dari awal)
    useEffect(() => {
        if (isScrammed) {
            penaltyRef.current = 0
            hasPenaltyRef.current = false
            stableRef.current = 0
            timeRef.current = 0
            orderViolatedRef.current = false
            lastRodRaisedRef.current = null
            rodMoveCountRef.current = { safety: 0, shim: 0, regulating: 0 }
            prevRodPositions.current = { safety: 0, shim: 0, regulating: 0 }
            setScore(MAX_SCORE)
            setPenaltyTotal(0)
            setPenaltyLog([])
            setStableSeconds(0)
            setTimeElapsed(0)
            setLastNotif({ type: 'scram', text: 'SCRAM! Skor direset', id: Date.now() })
        }
    }, [isScrammed])

    // Hitung skor final saat menang
    const getFinalScore = useCallback(() => {
        const bonus = !hasPenaltyRef.current ? NO_PENALTY_BONUS : 0
        const final = Math.max(0, MAX_SCORE - penaltyRef.current + bonus)
        return {
            finalScore: final,
            penaltyTotal: penaltyRef.current,
            bonus,
            penaltyLog,
            timeElapsed: timeRef.current,
            stableSeconds: stableRef.current,
        }
    }, [penaltyLog])

    return {
        score,
        penaltyTotal,
        penaltyLog,
        stableSeconds,
        timeElapsed,
        isWin,
        isTimeOut,
        lastNotif,
        getFinalScore,
        STABLE_DURATION_SEC,
        TIME_LIMIT_SEC,
    }
}