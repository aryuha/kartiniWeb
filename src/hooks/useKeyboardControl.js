import { useEffect, useCallback, useState, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

/**
 * Keyboard mapping:
 * SAFETY ROD:    Shift+Q (naik) | Shift+A (turun) | R (scram)
 * SHIM ROD:      Shift+W (naik) | Shift+S (turun) | T (scram)
 * REGULATING:    Shift+E (naik) | Shift+D (turun) | Y (scram)
 */
const KEY_MAPPING = {
    KeyQ: { rod: 'safety', direction: 'up' },
    KeyA: { rod: 'safety', direction: 'down' },
    KeyW: { rod: 'shim', direction: 'up' },
    KeyS: { rod: 'shim', direction: 'down' },
    KeyE: { rod: 'regulating', direction: 'up' },
    KeyD: { rod: 'regulating', direction: 'down' },
}

// Mapping scram key (tanpa Shift)
const SCRAM_KEY_MAPPING = {
    KeyR: 'safety',
    KeyT: 'shim',
    KeyY: 'regulating',
}

const HOLD_INTERVAL_MS = 80

export const useKeyboardControl = (moveRod, isScrammed, scramRod, scrammedRods) => {
    const [shiftPressed, setShiftPressed] = useState(false)
    const [lastAction, setLastAction] = useState(null)

    // State aktif key untuk visual feedback di UI
    const [activeKeys, setActiveKeys] = useState({
        safetyUp: false,
        safetyDown: false,
        shimUp: false,
        shimDown: false,
        regUp: false,
        regDown: false,
        scramSafety: false,
        scramShim: false,
        scramReg: false,
    })

    const holdIntervals = useRef({})
    const pressedKeys = useRef(new Set())
    const scramIntervals = useRef({})  // interval untuk scram (tahan)

    // Map dari event.code ke activeKey name
    const codeToActiveKey = {
        KeyQ: 'safetyUp',
        KeyA: 'safetyDown',
        KeyW: 'shimUp',
        KeyS: 'shimDown',
        KeyE: 'regUp',
        KeyD: 'regDown',
        KeyR: 'scramSafety',
        KeyT: 'scramShim',
        KeyY: 'scramReg',
    }

    const { t } = useLanguage()
    const executeMove = useCallback((mapping, isShift) => {
        if (!isShift) {
            setLastAction({
                type: 'blocked',
                message: t('shiftRequired'),
            })
            return false
        }
        if (isScrammed) {
            setLastAction({
                type: 'scram',
                message: t('scramRequired'),
            })
            return false
        }
        // Cek apakah rod spesifik ini discrammed
        if (scrammedRods && scrammedRods[mapping.rod]) {
            setLastAction({
                type: 'scram',
                message: `⚠ ${mapping.rod.toUpperCase()} ROD dalam kondisi SCRAM.`,
            })
            return false
        }
        moveRod(mapping.rod, mapping.direction)
        setLastAction({
            type: 'success',
            message: `✓ ${mapping.rod.toUpperCase()} → ${mapping.direction === 'up' ? t('naikSign') : t('turunSign')}`,
        })
        return true
    }, [moveRod, isScrammed, scrammedRods])

    const handleKeyDown = useCallback((event) => {
        // Deteksi Shift
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            setShiftPressed(true)
            return
        }

        // === SCRAM Keys (R, T, Y) - tanpa Shift ===
        const scramRodType = SCRAM_KEY_MAPPING[event.code]
        if (scramRodType && !event.shiftKey) {
            event.preventDefault()

            // Set visual aktif
            const activeKeyName = codeToActiveKey[event.code]
            if (activeKeyName) {
                setActiveKeys(prev => ({ ...prev, [activeKeyName]: true }))
            }

            // Jalankan scram langsung (tahan = tetap scram, tidak perlu interval)
            if (scramRod) {
                scramRod(scramRodType)
                setLastAction({
                    type: 'scram',
                    message: `⚡ SCRAM ${scramRodType.toUpperCase()} AKTIF`,
                })
            }
            return
        }

        // === Movement Keys (Q,A,W,S,E,D) - dengan Shift ===
        const mapping = KEY_MAPPING[event.code]
        if (!mapping) return

        event.preventDefault()

        // Jika key sudah ditekan, abaikan (handled oleh interval)
        if (pressedKeys.current.has(event.code)) return
        pressedKeys.current.add(event.code)

        // Set visual aktif
        const activeKeyName = codeToActiveKey[event.code]
        if (activeKeyName) {
            setActiveKeys(prev => ({ ...prev, [activeKeyName]: true }))
        }

        // Jalankan sekali
        const success = executeMove(mapping, event.shiftKey)
        if (!success) {
            // Jika gagal, hapus dari pressed dan reset visual
            pressedKeys.current.delete(event.code)
            if (activeKeyName) {
                setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }))
            }
            return
        }

        // Mulai interval hold
        holdIntervals.current[event.code] = setInterval(() => {
            executeMove(mapping, true)
        }, HOLD_INTERVAL_MS)

    }, [executeMove, scramRod])

    const handleKeyUp = useCallback((event) => {
        // Shift dilepas
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            setShiftPressed(false)

            // Stop semua movement interval
            Object.keys(holdIntervals.current).forEach(code => {
                if (holdIntervals.current[code]) {
                    clearInterval(holdIntervals.current[code])
                    holdIntervals.current[code] = null
                }
            })
            pressedKeys.current.clear()

            // Reset visual movement keys
            setActiveKeys(prev => ({
                ...prev,
                safetyUp: false, safetyDown: false,
                shimUp: false, shimDown: false,
                regUp: false, regDown: false,
            }))
            return
        }

        // Reset visual untuk key yang dilepas
        const activeKeyName = codeToActiveKey[event.code]
        if (activeKeyName) {
            setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }))
        }

        // Stop movement interval
        if (holdIntervals.current[event.code]) {
            clearInterval(holdIntervals.current[event.code])
            holdIntervals.current[event.code] = null
        }
        pressedKeys.current.delete(event.code)

    }, [])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            Object.keys(holdIntervals.current).forEach(code => {
                if (holdIntervals.current[code]) clearInterval(holdIntervals.current[code])
            })
        }
    }, [handleKeyDown, handleKeyUp])

    // Clear last action setelah 2 detik
    useEffect(() => {
        if (lastAction) {
            const timer = setTimeout(() => setLastAction(null), 2000)
            return () => clearTimeout(timer)
        }
    }, [lastAction])

    return {
        shiftPressed,
        lastAction,
        activeKeys,
        keyMapping: KEY_MAPPING,
    }
}