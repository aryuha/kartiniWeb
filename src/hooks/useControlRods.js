import { useState, useCallback, useRef } from 'react'

const ROD_LIMITS = {
    safety: { min: 0, max: 100, step: 2 },
    shim: { min: 0, max: 100, step: 1 },
    regulating: { min: 0, max: 100, step: 0.5 },
}

const INITIAL_POSITIONS = {
    safety: 0,
    shim: 0,
    regulating: 0,
}

const INITIAL_MOVING = {
    safety: false,
    shim: false,
    regulating: false,
}

const INITIAL_SCRAMMED = {
    safety: false,
    shim: false,
    regulating: false,
}

export const useControlRods = () => {
    const [rodPositions, setRodPositions] = useState(INITIAL_POSITIONS)
    // isScrammed sekarang adalah object per rod
    const [scrammedRods, setScrammedRods] = useState(INITIAL_SCRAMMED)
    const [movingRods, setMovingRods] = useState(INITIAL_MOVING)

    const holdIntervalRefs = useRef({})
    const movingTimeoutRefs = useRef({})

    // isScrammed = true jika SEMUA rod discrammed (untuk kompatibilitas)
    const isScrammed = scrammedRods.safety && scrammedRods.shim && scrammedRods.regulating

    // Helper: cek apakah rod tertentu bisa bergerak
    const isRodScrammed = useCallback((rodType) => {
        return scrammedRods[rodType]
    }, [scrammedRods])

    const markMoving = useCallback((rodType) => {
        setMovingRods(prev => ({ ...prev, [rodType]: true }))
        if (movingTimeoutRefs.current[rodType]) {
            clearTimeout(movingTimeoutRefs.current[rodType])
        }
        movingTimeoutRefs.current[rodType] = setTimeout(() => {
            setMovingRods(prev => ({ ...prev, [rodType]: false }))
        }, 200)
    }, [])

    const moveRod = useCallback((rodType, direction) => {
        if (scrammedRods[rodType]) return
        if (!ROD_LIMITS[rodType]) return

        setRodPositions(prev => {
            const limit = ROD_LIMITS[rodType]
            const currentPos = prev[rodType]
            const step = direction === 'up' ? limit.step : -limit.step
            const newPos = Math.max(limit.min, Math.min(limit.max, currentPos + step))
            return { ...prev, [rodType]: parseFloat(newPos.toFixed(2)) }
        })
        markMoving(rodType)
    }, [scrammedRods, markMoving])

    const startHold = useCallback((rodType, direction) => {
        if (scrammedRods[rodType]) return
        moveRod(rodType, direction)
        holdIntervalRefs.current[rodType] = setInterval(() => {
            moveRod(rodType, direction)
        }, 80)
    }, [scrammedRods, moveRod])

    const stopHold = useCallback((rodType) => {
        if (holdIntervalRefs.current[rodType]) {
            clearInterval(holdIntervalRefs.current[rodType])
            holdIntervalRefs.current[rodType] = null
        }
    }, [])

    // SCRAM per rod individual (keyboard: R/T/Y)
    const scramRod = useCallback((rodType) => {
        // Stop hold interval untuk rod ini
        if (holdIntervalRefs.current[rodType]) {
            clearInterval(holdIntervalRefs.current[rodType])
            holdIntervalRefs.current[rodType] = null
        }

        setScrammedRods(prev => ({ ...prev, [rodType]: true }))
        setRodPositions(prev => ({ ...prev, [rodType]: 0 }))

        // Animasi moving
        setMovingRods(prev => ({ ...prev, [rodType]: true }))
        setTimeout(() => {
            setMovingRods(prev => ({ ...prev, [rodType]: false }))
        }, 500)
    }, [])

    // SCRAM semua (untuk tombol scram all / kompatibilitas lama)
    const scram = useCallback(() => {
        Object.keys(holdIntervalRefs.current).forEach(key => {
            if (holdIntervalRefs.current[key]) {
                clearInterval(holdIntervalRefs.current[key])
                holdIntervalRefs.current[key] = null
            }
        })
        setScrammedRods({ safety: true, shim: true, regulating: true })
        setRodPositions(INITIAL_POSITIONS)
        setMovingRods({ safety: true, shim: true, regulating: true })
        setTimeout(() => {
            setMovingRods(INITIAL_MOVING)
        }, 500)
    }, [])

    // Reset scram per rod
    const resetScramRod = useCallback((rodType) => {
        setScrammedRods(prev => ({ ...prev, [rodType]: false }))
    }, [])

    // Reset semua scram
    const resetScram = useCallback(() => {
        setScrammedRods(INITIAL_SCRAMMED)
    }, [])

    const setRodPosition = useCallback((rodType, value) => {
        if (scrammedRods[rodType]) return
        const limit = ROD_LIMITS[rodType]
        const clamped = Math.max(limit.min, Math.min(limit.max, value))
        setRodPositions(prev => ({
            ...prev,
            [rodType]: parseFloat(clamped.toFixed(2)),
        }))
    }, [scrammedRods])

    return {
        rodPositions,
        isScrammed,          // true jika semua rod discrammed
        scrammedRods,        // object per rod { safety, shim, regulating }
        movingRods,
        moveRod,
        startHold,
        stopHold,
        scram,               // scram semua
        scramRod,            // scram per rod
        resetScram,          // reset semua
        resetScramRod,       // reset per rod
        isRodScrammed,
        setRodPosition,
        rodLimits: ROD_LIMITS,
    }
}