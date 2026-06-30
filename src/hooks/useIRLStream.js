// src/hooks/useIRLStream.js
// ============================================================
// Hook untuk IRL Mode: subscribe ke SSE endpoint /irl/stream
// dan expose data reaktor real-time + rodPositions yang siap
// langsung dipakai ReactorScene untuk animasi batang kendali.
//
// Pemetaan field API → ReactorScene:
//   safety_rod       → rodPositions.safety
//   compensation_rod → rodPositions.shim   (nama berbeda, fungsi sama)
//   regulator_rod    → rodPositions.regulating
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { IRL_STREAM_URL, getIRLSnapshot } from '../services/api'

// ── Nilai awal saat hook pertama mount (sebelum data pertama tiba) ──
const INITIAL_REACTOR_DATA = {
    current_time:             '--:--:--',
    data_time:                '--',
    timestamp:                null,
    status_reaktor:           'CONNECTING',
    safety_rod:               0,
    compensation_rod:         0,
    regulator_rod:            0,
    power_np1000:             0,
    water_tank_temp:          0,
    water_tank_level:         0,
    water_ph:                 0,
    fuel_element_temp:        0,
    water_resistance_input:   0,
    water_resistance_output:  0,
    inlet_he_temp:            0,
    outlet_he_temp:           0,
    water_flowrate:           0,
    radiation_deck:           0,
    radiation_subcritic:      0,
    radiation_demineralizer:  0,
    radiation_column_thermal: 0,
    radiation_bulkshielding:  0,
}

const INITIAL_ROD_POSITIONS = { safety: 0, shim: 0, regulating: 0 }

// ── Status koneksi ──
export const CONNECTION_STATUS = {
    CONNECTING:   'CONNECTING',
    CONNECTED:    'CONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR:        'ERROR',
}

export const useIRLStream = () => {
    const [reactorData,      setReactorData]      = useState(INITIAL_REACTOR_DATA)
    const [rodPositions,     setRodPositions]      = useState(INITIAL_ROD_POSITIONS)
    const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.CONNECTING)
    const [lastUpdated,      setLastUpdated]       = useState(null)

    const esRef           = useRef(null)   // EventSource instance
    const reconnectTimer  = useRef(null)   // setTimeout handle untuk reconnect
    const mountedRef      = useRef(true)   // cegah setState setelah unmount

    // ── Parse data masuk dan update state ──
    const applyData = useCallback((raw) => {
        if (!mountedRef.current) return
        setReactorData(raw)
        setRodPositions({
            safety:     raw.safety_rod,
            shim:       raw.compensation_rod,  // nama API berbeda, fungsi sama
            regulating: raw.regulator_rod,
        })
        setLastUpdated(new Date())
    }, [])

    // ── Buka koneksi SSE ──
    const connect = useCallback(() => {
        if (!mountedRef.current) return

        // Tutup koneksi lama kalau masih ada
        if (esRef.current) {
            esRef.current.close()
            esRef.current = null
        }

        setConnectionStatus(CONNECTION_STATUS.CONNECTING)

        const es = new EventSource(IRL_STREAM_URL)
        esRef.current = es

        es.onopen = () => {
            if (!mountedRef.current) return
            setConnectionStatus(CONNECTION_STATUS.CONNECTED)
            // Batalkan timer reconnect kalau ada
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current)
                reconnectTimer.current = null
            }
        }

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                applyData(data)
            } catch (err) {
                console.warn('[useIRLStream] Gagal parse SSE data:', err)
            }
        }

        es.onerror = () => {
            if (!mountedRef.current) return
            es.close()
            esRef.current = null
            setConnectionStatus(CONNECTION_STATUS.RECONNECTING)
            // Auto-reconnect setelah 3 detik
            reconnectTimer.current = setTimeout(connect, 3000)
        }
    }, [applyData])

    useEffect(() => {
        mountedRef.current = true

        // Fetch snapshot awal agar UI tidak blank saat SSE belum terhubung
        getIRLSnapshot().then((snapshot) => {
            if (snapshot && mountedRef.current) applyData(snapshot)
        })

        connect()

        return () => {
            mountedRef.current = false
            if (esRef.current)          esRef.current.close()
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
        }
    }, [connect, applyData])

    const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED

    return {
        reactorData,
        rodPositions,
        connectionStatus,
        isConnected,
        lastUpdated,
    }
}
