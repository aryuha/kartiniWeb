// ============================================
// HOOK: useReactorAPI
// Polling ke FastAPI untuk mendapatkan nilai daya
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { sendRodPositions, scramReactor } from '../services/api'

const POLL_INTERVAL = 1000 // 1 detik

const INITIAL_REACTOR_DATA = {
    power: 0,
    power_kw: 0,
    reactivity: 0,
    period: null,
    status: 'SHUTDOWN',
    neutron_flux: 0,
    temperature: 25,
    rod_positions: { safety: 0, shim: 0, regulating: 0 },
}

export const useReactorAPI = (rodPositions, isScrammed, onAutoScram) => {
    const [reactorData, setReactorData] = useState(INITIAL_REACTOR_DATA)
    const [isLoading, setIsLoading] = useState(false)
    const [apiStatus, setApiStatus] = useState('disconnected') // 'connected' | 'disconnected' | 'error'
    const [error, setError] = useState(null)
    const pollRef = useRef(null)
    const prevPositions = useRef(null)

    // ← BARU: Konstanta threshold
    const SCRAM_THRESHOLD_KW = 110  // Auto-SCRAM di 110 kW
    const autoScramRef = useRef(false)  // Cegah trigger berulang

    const fetchReactorData = useCallback(async () => {
        if (isScrammed) {
            setReactorData(prev => ({
                ...INITIAL_REACTOR_DATA,
                status: 'SCRAM',
                temperature: prev.temperature > 25 ? prev.temperature - 0.5 : 25,
            }))
            autoScramRef.current = false  // Reset flag saat scram
            return
        }

        // Cek apakah posisi berubah
        const posStr = JSON.stringify(rodPositions)
        if (posStr === prevPositions.current && apiStatus === 'connected') return
        prevPositions.current = posStr

        setIsLoading(true)

        try {
            const data = await sendRodPositions(rodPositions)
            setReactorData(data)
            setApiStatus('connected')
            setError(null)

            // ← BARU: Cek auto-SCRAM
            const currentPowerKw = data?.power_kw || 0
            const scramTriggered = data?.scram_triggered || false

            if ((currentPowerKw >= SCRAM_THRESHOLD_KW || scramTriggered)
                && !autoScramRef.current) {
                autoScramRef.current = true
                console.warn(`[SCRAM AUTO] Daya ${currentPowerKw.toFixed(2)} kW >= ${SCRAM_THRESHOLD_KW} kW!`)

                // Panggil callback auto-SCRAM ke parent
                if (onAutoScram) {
                    onAutoScram('AUTO_SCRAM: Daya melebihi 110 kW')
                }
            }

        } catch (err) {
            setError(err.message)
            setApiStatus('error')
        } finally {
            setIsLoading(false)
        }
    }, [rodPositions, isScrammed, apiStatus, onAutoScram])

    const handleScram = useCallback(async () => {
        try {
            await scramReactor()
            setReactorData(INITIAL_REACTOR_DATA)
            setApiStatus('connected')
        } catch (err) {
            console.error('SCRAM API error:', err)
        }
    }, [])

    // Polling
    useEffect(() => {
        fetchReactorData()
        pollRef.current = setInterval(fetchReactorData, POLL_INTERVAL)

        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [fetchReactorData])

    // Trigger saat scram
    useEffect(() => {
        if (isScrammed) {
            handleScram()
        }
    }, [isScrammed, handleScram])

    return {
        reactorData,
        isLoading,
        apiStatus,
        error,
    }
}